from dtos.responses.publico_response import CorretorVitrineResponse
from model.conta_site_model import ContaSite


def test_corretor_vitrine_response_inclui_whatsapp_publico():
    conta = ContaSite(
        id=1,
        usuario_id=10,
        nome_publico="Albuquerque Imóveis",
        slug="albuquerque",
        descricao="Especialista em imóveis residenciais.",
        whatsapp="(11) 99812-4470",
        creci="CRECI-SP 154.882",
        cidade="São Paulo",
        uf="SP",
        bairro="Pinheiros",
        cor="#d97a2b",
    )

    response = CorretorVitrineResponse.de_conta(conta, qtd_imoveis_publicados=24)

    assert response.whatsapp == "(11) 99812-4470"
    assert response.nome_publico == "Albuquerque Imóveis"
    assert response.qtd_imoveis_publicados == 24
