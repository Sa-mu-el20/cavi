import os
from typing import Optional

import resend
from resend.exceptions import ResendError

from util.logger_config import logger


class ServicoEmail:
    def __init__(self):
        self.api_key = os.getenv('RESEND_API_KEY')
        self.from_email = os.getenv('RESEND_FROM_EMAIL', 'noreply@seudominio.com')
        self.from_name = os.getenv('RESEND_FROM_NAME', 'Sistema')
        self.app_name = os.getenv('APP_NAME', self.from_name)

        # Configura a API key do Resend
        if self.api_key:
            resend.api_key = self.api_key

    def enviar_email(
        self,
        para_email: str,
        para_nome: str,
        assunto: str,
        html: str,
        texto: Optional[str] = None
    ) -> bool:
        """Envia e-mail via Resend.com"""
        if not self.api_key:
            logger.warning("RESEND_API_KEY não configurada")
            return False

        params = {
            "from": f"{self.from_name} <{self.from_email}>",
            "to": [para_email],
            "subject": assunto,
            "html": html
        }
        # Parte texto-plano melhora entregabilidade (e-mail multipart pontua
        # menos como spam do que só-HTML); usa fallback derivado do HTML.
        if texto:
            params["text"] = texto

        try:
            email = resend.Emails.send(params)
            logger.info(f"E-mail enviado para {para_email} - ID: {email.get('id', 'N/A')}")
            return True
        except ResendError as e:
            logger.error(f"Erro ao enviar e-mail: {e}")
            return False

    def enviar_recuperacao_senha(self, para_email: str, para_nome: str, token: str) -> bool:
        """Envia e-mail de recuperação de senha"""
        url_recuperacao = f"{os.getenv('BASE_URL', 'http://localhost:8411')}/redefinir-senha?token={token}"

        html = f"""
        <html>
        <body style="font-family: Arial, Helvetica, sans-serif; color: #222; line-height: 1.5;">
            <h2 style="color: #0d6efd;">Recuperação de Senha</h2>
            <p>Olá {para_nome},</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>{self.app_name}</strong>.</p>
            <p>
                <a href="{url_recuperacao}"
                   style="display: inline-block; padding: 12px 24px; background: #0d6efd; color: #fff; text-decoration: none; border-radius: 6px;">
                    Redefinir minha senha
                </a>
            </p>
            <p>Ou copie e cole este endereço no navegador:</p>
            <p style="word-break: break-all;"><a href="{url_recuperacao}">{url_recuperacao}</a></p>
            <p>Este link expira em 1 hora. Se você não solicitou esta recuperação, ignore este e-mail — sua senha permanece inalterada.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">
            <p style="font-size: 12px; color: #888;">
                Você recebeu este e-mail porque foi solicitada a recuperação de senha de uma conta associada a este endereço no {self.app_name}.<br>
                Este é um e-mail automático — por favor, não responda.
            </p>
        </body>
        </html>
        """

        texto = (
            f"Recuperação de Senha — {self.app_name}\n\n"
            f"Olá {para_nome},\n\n"
            f"Recebemos uma solicitação para redefinir a senha da sua conta no {self.app_name}.\n\n"
            f"Acesse o link abaixo para redefinir sua senha:\n"
            f"{url_recuperacao}\n\n"
            f"Este link expira em 1 hora. Se você não solicitou esta recuperação, "
            f"ignore este e-mail — sua senha permanece inalterada.\n\n"
            f"Este é um e-mail automático — por favor, não responda.\n"
        )

        return self.enviar_email(
            para_email=para_email,
            para_nome=para_nome,
            assunto=f"Recuperação de Senha — {self.app_name}",
            html=html,
            texto=texto
        )

    def enviar_boas_vindas(self, para_email: str, para_nome: str) -> bool:
        """Envia e-mail de boas-vindas"""
        url_app = os.getenv('BASE_URL', 'http://localhost:8411')

        html = f"""
        <html>
        <body style="font-family: Arial, Helvetica, sans-serif; color: #222; line-height: 1.5;">
            <h2 style="color: #0d6efd;">Bem-vindo(a) ao {self.app_name}!</h2>
            <p>Olá {para_nome},</p>
            <p>Seu cadastro foi realizado com sucesso.</p>
            <p>Agora você já pode acessar a plataforma com seu e-mail e senha.</p>
            <p>
                <a href="{url_app}"
                   style="display: inline-block; padding: 12px 24px; background: #0d6efd; color: #fff; text-decoration: none; border-radius: 6px;">
                    Acessar o {self.app_name}
                </a>
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">
            <p style="font-size: 12px; color: #888;">
                Você recebeu este e-mail porque uma conta foi criada com este endereço no {self.app_name}.<br>
                Este é um e-mail automático — por favor, não responda.
            </p>
        </body>
        </html>
        """

        texto = (
            f"Bem-vindo(a) ao {self.app_name}!\n\n"
            f"Olá {para_nome},\n\n"
            f"Seu cadastro foi realizado com sucesso.\n"
            f"Agora você já pode acessar a plataforma com seu e-mail e senha:\n"
            f"{url_app}\n\n"
            f"Este é um e-mail automático — por favor, não responda.\n"
        )

        return self.enviar_email(
            para_email=para_email,
            para_nome=para_nome,
            assunto=f"Bem-vindo ao {self.app_name}",
            html=html,
            texto=texto
        )


# Instância global
servico_email = ServicoEmail()
