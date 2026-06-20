import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { colors, fonts } from '../theme.js';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const enviar = (e) => {
    e.preventDefault();
    if (email.trim()) setEnviado(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* painel escuro */}
      <div style={{ background: colors.ink, padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 80%, rgba(217,122,43,0.20), transparent 50%)' }} />
        <Link to="/" style={{ position: 'relative', alignSelf: 'flex-start' }}>
          <img src="/assets/logo-cream.png" alt="CAVI" style={{ height: 30, cursor: 'pointer', display: 'block' }} />
        </Link>
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontFamily: fonts.display, fontWeight: 300, fontSize: 40, color: colors.bg, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: -0.5 }}>
            Sem acesso? A gente te coloca de volta.
          </h2>
          <p style={{ fontSize: 16, color: '#cfc7b9', lineHeight: 1.6, margin: 0, maxWidth: 420 }}>
            Enviamos um link seguro para o seu e-mail. Você define uma nova senha e volta direto para o painel — sua vitrine continua no ar o tempo todo.
          </p>
        </div>
        <div style={{ position: 'relative', fontSize: 13, color: '#7d766a' }}>O link expira em 30 minutos por segurança.</div>
      </div>

      {/* conteúdo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {!enviado ? (
            <form onSubmit={enviar}>
              <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 28, margin: '0 0 6px' }}>Recuperar senha</h1>
              <p style={{ fontSize: 15, color: colors.muted, margin: '0 0 26px' }}>
                Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.
              </p>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.muted, marginBottom: 6 }}>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                style={{ width: '100%', padding: '13px 14px', border: `1px solid ${colors.field}`, borderRadius: 10, fontSize: 15, background: '#fff' }}
              />
              <button
                type="submit"
                style={{ width: '100%', marginTop: 24, background: colors.orange, color: '#fff', border: 'none', borderRadius: 11, padding: 15, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
              >
                Enviar link de recuperação
              </button>
              <div style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: colors.mutedSoft, cursor: 'pointer' }} onClick={() => navigate('/login')}>
                ← Voltar para o login
              </div>
            </form>
          ) : (
            <div>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#e6eed6', color: colors.greenText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 20 }}>✓</div>
              <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 28, margin: '0 0 6px' }}>Verifique seu e-mail</h1>
              <p style={{ fontSize: 15, color: colors.muted, lineHeight: 1.6, margin: '0 0 26px' }}>
                Se houver uma conta para <strong style={{ color: colors.ink }}>{email}</strong>, enviamos um link para redefinir a senha. Confira também a caixa de spam.
              </p>
              <button
                onClick={() => navigate('/login')}
                style={{ width: '100%', background: colors.orange, color: '#fff', border: 'none', borderRadius: 11, padding: 15, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
              >
                Voltar para o login
              </button>
              <div style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: colors.mutedSoft }}>
                Não recebeu? <span style={{ color: colors.orange, fontWeight: 600, cursor: 'pointer' }} onClick={() => setEnviado(false)}>Reenviar</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
