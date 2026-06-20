import json
import sqlite3
from pathlib import Path

from repo import usuario_repo
from repo import conta_site_repo, imovel_repo
from model.usuario_model import Usuario
from model.conta_site_model import ContaSite
from model.imovel_model import (
    Imovel,
    StatusImovel,
    FinalidadeImovel,
    TipoImovel,
)
from model.endereco_imovel_model import EnderecoImovel
from util.security import criar_hash_senha
from util.logger_config import logger
from util.perfis import Perfil
from util.status_conta import StatusConta
from util.datetime_util import agora

# Senha padrão (fixa e simples) usada por TODOS os corretores demo do seed.
# Documentada aqui para facilitar o teste manual das páginas protegidas.
SENHA_PADRAO_SEED = "1234aA@#"

# Caminho do arquivo de seed de usuários (raiz_do_projeto/data/admin_seed.json).
# Este arquivo é gerado/atualizado pelo scripts/configurar_projeto.py.
CAMINHO_SEED_USUARIOS = Path(__file__).resolve().parent.parent / "data" / "admin_seed.json"


def _ler_usuarios_do_json() -> list[dict]:
    """
    Lê os usuários definidos em data/admin_seed.json.

    Returns:
        Lista de dicionários de usuários. Retorna lista vazia se o arquivo
        não existir, estiver vazio ou for inválido.
    """
    if not CAMINHO_SEED_USUARIOS.exists():
        return []
    try:
        dados = json.loads(CAMINHO_SEED_USUARIOS.read_text(encoding="utf-8"))
        return dados.get("usuarios", [])
    except (json.JSONDecodeError, OSError) as e:
        logger.error(
            f"Erro ao ler {CAMINHO_SEED_USUARIOS.name}: {e}. "
            "Usando perfis do enum como fallback."
        )
        return []


def _gerar_usuarios_dos_perfis() -> list[dict]:
    """
    Gera um usuário padrão para cada perfil do enum Perfil (fallback).

    Formato gerado por perfil:
    - nome: {Perfil} Padrão
    - email: padrao@{perfil}.com
    - senha: 1234aA@#
    - perfil: {Perfil}
    """
    usuarios = []
    for perfil_enum in Perfil:
        perfil_valor = perfil_enum.value
        usuarios.append({
            "nome": f"{perfil_valor} Padrão",
            "email": f"padrao@{perfil_valor.lower()}.com",
            "senha": "1234aA@#",
            "perfil": perfil_valor,
        })
    return usuarios


def carregar_usuarios_seed():
    """
    Carrega usuários padrão no banco de dados.

    Prioriza os usuários definidos em data/admin_seed.json (gerado pelo
    scripts/configurar_projeto.py). Caso o arquivo não exista ou esteja vazio/inválido,
    gera automaticamente 1 usuário para cada perfil do enum Perfil como fallback.

    Só insere usuários se não houver nenhum usuário cadastrado no banco.
    A senha de cada usuário é sempre armazenada com hash bcrypt.
    """
    # Verificar se já existem usuários cadastrados
    quantidade_usuarios = usuario_repo.obter_quantidade()
    if quantidade_usuarios > 0:
        logger.info(f"Já existem {quantidade_usuarios} usuários cadastrados. Seed não será executado.")
        return

    usuarios_seed = _ler_usuarios_do_json()
    if usuarios_seed:
        logger.info(
            f"Nenhum usuário encontrado. Carregando {len(usuarios_seed)} usuário(s) "
            f"de {CAMINHO_SEED_USUARIOS.name}..."
        )
    else:
        usuarios_seed = _gerar_usuarios_dos_perfis()
        logger.info(
            "Nenhum usuário encontrado e seed JSON ausente/vazio. "
            "Gerando usuários padrão a partir dos perfis..."
        )

    usuarios_criados = 0
    usuarios_com_erro = 0

    for dados in usuarios_seed:
        email = dados.get("email", "")
        try:
            usuario = Usuario(
                id=0,
                nome=dados.get("nome", ""),
                email=email,
                senha=criar_hash_senha(dados.get("senha", "")),
                perfil=dados.get("perfil", ""),
            )

            usuario_id = usuario_repo.inserir(usuario)
            if usuario_id:
                logger.info(f"✓ Usuário {email} criado com sucesso (ID: {usuario_id})")
                usuarios_criados += 1
            else:
                logger.error(f"✗ Falha ao inserir usuário {email} no banco")
                usuarios_com_erro += 1

        except sqlite3.Error as e:
            logger.error(f"✗ Erro ao processar usuário {email}: {e}")
            usuarios_com_erro += 1

    # Resumo
    logger.info(f"Resumo do seed de usuários: {usuarios_criados} criados, {usuarios_com_erro} com erro")


# ---------------------------------------------------------------------------
# Seed demo de corretores (Usuario perfil Corretor + ContaSite Ativa) e
# imóveis (com endereço 1:1). Idempotente: só insere se a tabela conta_site
# estiver vazia, evitando duplicar dados em reinícios.
# ---------------------------------------------------------------------------

# Cada entrada gera: 1 Usuario (perfil Corretor) + 1 ContaSite (Ativa) +
# os imóveis listados (cada um com endereço). A senha de login de todos é
# SENHA_PADRAO_SEED.
CORRETORES_DEMO: list[dict] = [
    {
        "usuario": {
            "nome": "Marina Albuquerque",
            "email": "marina@albuquerque.com",
            "cpf": "11111111111",
            "telefone": "27999990001",
        },
        "conta": {
            "nome_publico": "Albuquerque Imóveis",
            "slug": "albuquerque",
            "descricao": "Imóveis selecionados na Grande Vitória com atendimento próximo.",
            "whatsapp": "27999990001",
            "creci": "ES-12345",
            "cidade": "Vitória",
            "uf": "ES",
            "bairro": "Praia do Canto",
            "cor": "#d97a2b",
        },
        "imoveis": [
            {
                "titulo": "Apartamento 3 quartos na Praia do Canto",
                "tipo": TipoImovel.APARTAMENTO,
                "finalidade": FinalidadeImovel.VENDA,
                "preco": 950000.00,
                "codigo": "ALB-001",
                "slug": "apto-3q-praia-do-canto",
                "descricao": "Apartamento amplo, varanda gourmet e duas vagas.",
                "area": 120.0,
                "quartos": 3,
                "banheiros": 2,
                "vagas": 2,
                "destaque": True,
                "status_publicacao": StatusImovel.PUBLICADO,
                "endereco": {
                    "cep": "29055000",
                    "logradouro": "Rua Aleixo Netto",
                    "numero": "1200",
                    "bairro": "Praia do Canto",
                    "cidade": "Vitória",
                    "uf": "ES",
                },
            },
            {
                "titulo": "Cobertura duplex em Jardim da Penha",
                "tipo": TipoImovel.COBERTURA,
                "finalidade": FinalidadeImovel.VENDA,
                "preco": 1450000.00,
                "codigo": "ALB-002",
                "slug": "cobertura-duplex-jardim-da-penha",
                "descricao": "Cobertura com piscina privativa e vista para o mar.",
                "area": 210.0,
                "quartos": 4,
                "banheiros": 3,
                "vagas": 3,
                "destaque": False,
                "status_publicacao": StatusImovel.OCULTO,
                "endereco": {
                    "cep": "29060000",
                    "logradouro": "Av. Fernando Ferrari",
                    "numero": "850",
                    "bairro": "Jardim da Penha",
                    "cidade": "Vitória",
                    "uf": "ES",
                },
            },
        ],
    },
    {
        "usuario": {
            "nome": "Ricardo Teixeira",
            "email": "ricardo@rtimoveis.com",
            "cpf": "22222222222",
            "telefone": "27999990002",
        },
        "conta": {
            "nome_publico": "RT Imóveis",
            "slug": "rtimoveis",
            "descricao": "Especialista em locação residencial e comercial em Vila Velha.",
            "whatsapp": "27999990002",
            "creci": "ES-23456",
            "cidade": "Vila Velha",
            "uf": "ES",
            "bairro": "Itapuã",
            "cor": "#2b7ad9",
        },
        "imoveis": [
            {
                "titulo": "Casa 2 quartos para alugar em Itapuã",
                "tipo": TipoImovel.CASA,
                "finalidade": FinalidadeImovel.ALUGUEL,
                "preco": 2500.00,
                "codigo": "RT-001",
                "slug": "casa-2q-itapua",
                "descricao": "Casa térrea com quintal, próxima à praia.",
                "area": 90.0,
                "quartos": 2,
                "banheiros": 1,
                "vagas": 1,
                "destaque": True,
                "status_publicacao": StatusImovel.PUBLICADO,
                "endereco": {
                    "cep": "29101000",
                    "logradouro": "Rua Antônio Ataíde",
                    "numero": "300",
                    "bairro": "Itapuã",
                    "cidade": "Vila Velha",
                    "uf": "ES",
                },
            },
            {
                "titulo": "Sala comercial no centro de Vila Velha",
                "tipo": TipoImovel.SALA_COMERCIAL,
                "finalidade": FinalidadeImovel.ALUGUEL,
                "preco": 1800.00,
                "codigo": "RT-002",
                "slug": "sala-comercial-centro-vv",
                "descricao": "Sala comercial pronta para uso, com estacionamento.",
                "area": 45.0,
                "quartos": 0,
                "banheiros": 1,
                "vagas": 1,
                "destaque": False,
                "status_publicacao": StatusImovel.PUBLICADO,
                "endereco": {
                    "cep": "29100000",
                    "logradouro": "Av. Champagnat",
                    "numero": "500",
                    "bairro": "Centro",
                    "cidade": "Vila Velha",
                    "uf": "ES",
                },
            },
        ],
    },
    {
        "usuario": {
            "nome": "Helena Souza",
            "email": "helena@helenasouza.com",
            "cpf": "33333333333",
            "telefone": "27999990003",
        },
        "conta": {
            "nome_publico": "Helena Souza Corretora",
            "slug": "helenasouza",
            "descricao": "Apartamentos e studios para investidores na Serra.",
            "whatsapp": "27999990003",
            "creci": "ES-34567",
            "cidade": "Serra",
            "uf": "ES",
            "bairro": "Laranjeiras",
            "cor": "#3aa76d",
        },
        "imoveis": [
            {
                "titulo": "Studio mobiliado em Laranjeiras",
                "tipo": TipoImovel.STUDIO,
                "finalidade": FinalidadeImovel.ALUGUEL,
                "preco": 1500.00,
                "codigo": "HS-001",
                "slug": "studio-mobiliado-laranjeiras",
                "descricao": "Studio compacto e mobiliado, ideal para solteiros.",
                "area": 32.0,
                "quartos": 1,
                "banheiros": 1,
                "vagas": 1,
                "destaque": True,
                "status_publicacao": StatusImovel.PUBLICADO,
                "endereco": {
                    "cep": "29165000",
                    "logradouro": "Rua das Acácias",
                    "numero": "75",
                    "bairro": "Laranjeiras",
                    "cidade": "Serra",
                    "uf": "ES",
                },
            },
        ],
    },
]


def carregar_corretores_demo():
    """
    Cria corretores demo (Usuario perfil Corretor + ContaSite Ativa) e seus
    imóveis (com endereço), de forma idempotente.

    Só executa se a tabela ``conta_site`` estiver vazia. A senha de todos os
    corretores é ``SENHA_PADRAO_SEED``. Usuários cujo e-mail já exista são
    reaproveitados (não duplica). Datas de gravação usam ``agora()`` via repos.
    """
    if conta_site_repo.obter_todos():
        logger.info("Já existem contas de catálogo. Seed de corretores não será executado.")
        return

    contas_criadas = 0
    imoveis_criados = 0
    erros = 0

    for entrada in CORRETORES_DEMO:
        dados_usuario = entrada["usuario"]
        dados_conta = entrada["conta"]
        email = dados_usuario["email"]

        try:
            # Reaproveita usuário existente (ex.: rodar após seed de usuários).
            usuario_existente = usuario_repo.obter_por_email(email)
            if usuario_existente:
                usuario_id = usuario_existente.id
            else:
                usuario = Usuario(
                    id=0,
                    nome=dados_usuario["nome"],
                    email=email,
                    senha=criar_hash_senha(SENHA_PADRAO_SEED),
                    perfil=Perfil.CORRETOR.value,
                    cpf=dados_usuario.get("cpf"),
                    telefone=dados_usuario.get("telefone"),
                )
                usuario_id = usuario_repo.inserir(usuario)

            if not usuario_id:
                logger.error(f"✗ Falha ao obter/inserir usuário corretor {email}")
                erros += 1
                continue

            conta = ContaSite(
                id=0,
                usuario_id=usuario_id,
                nome_publico=dados_conta["nome_publico"],
                slug=dados_conta["slug"],
                status=StatusConta.ATIVO,
                descricao=dados_conta.get("descricao"),
                whatsapp=dados_conta.get("whatsapp"),
                creci=dados_conta.get("creci"),
                cidade=dados_conta.get("cidade"),
                uf=dados_conta.get("uf"),
                bairro=dados_conta.get("bairro"),
                cor=dados_conta.get("cor", "#d97a2b"),
            )
            conta_id = conta_site_repo.inserir(conta)
            if not conta_id:
                logger.error(f"✗ Falha ao inserir conta-site '{dados_conta['slug']}'")
                erros += 1
                continue
            contas_criadas += 1
            logger.info(f"✓ ContaSite '{dados_conta['slug']}' criada (ID: {conta_id})")

            for dados_imovel in entrada.get("imoveis", []):
                dados_endereco = dados_imovel.get("endereco")
                endereco = None
                if dados_endereco:
                    endereco = EnderecoImovel(
                        id=0,
                        imovel_id=0,  # definido pelo repo no upsert
                        cep=dados_endereco.get("cep"),
                        logradouro=dados_endereco.get("logradouro"),
                        numero=dados_endereco.get("numero"),
                        bairro=dados_endereco.get("bairro"),
                        cidade=dados_endereco.get("cidade"),
                        uf=dados_endereco.get("uf"),
                        complemento=dados_endereco.get("complemento"),
                    )

                imovel = Imovel(
                    id=0,
                    conta_site_id=conta_id,
                    titulo=dados_imovel["titulo"],
                    tipo=dados_imovel["tipo"],
                    finalidade=dados_imovel["finalidade"],
                    preco=dados_imovel["preco"],
                    codigo=dados_imovel.get("codigo"),
                    slug=dados_imovel.get("slug"),
                    descricao=dados_imovel.get("descricao"),
                    area=dados_imovel.get("area"),
                    quartos=dados_imovel.get("quartos"),
                    banheiros=dados_imovel.get("banheiros"),
                    vagas=dados_imovel.get("vagas"),
                    destaque=dados_imovel.get("destaque", False),
                    status_publicacao=dados_imovel.get(
                        "status_publicacao", StatusImovel.OCULTO
                    ),
                    endereco=endereco,
                )
                imovel_id = imovel_repo.inserir(imovel)
                if imovel_id:
                    imoveis_criados += 1
                else:
                    logger.error(f"✗ Falha ao inserir imóvel '{dados_imovel['titulo']}'")
                    erros += 1

        except sqlite3.Error as e:
            logger.error(f"✗ Erro ao processar corretor demo {email}: {e}")
            erros += 1

    logger.info(
        f"Resumo do seed de corretores: {contas_criadas} contas, "
        f"{imoveis_criados} imóveis, {erros} erro(s)"
    )


def inicializar_dados():
    """Inicializa todos os dados seed"""
    logger.info("=" * 50)
    logger.info("Iniciando carga de dados seed...")
    logger.info("=" * 50)

    try:
        carregar_usuarios_seed()
        carregar_corretores_demo()
        logger.info("=" * 50)
        logger.info("Dados seed carregados!")
        logger.info("=" * 50)
    except sqlite3.Error as e:
        logger.error(f"Erro crítico ao inicializar dados seed: {e}", exc_info=True)
