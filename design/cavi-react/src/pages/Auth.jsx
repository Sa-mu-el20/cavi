import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { colors, fonts } from '../theme.js';

function Field({ label, ...props }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.muted, marginBottom: 6 }}>{label}</label>
      <input
        {...props}
        style={{ width: '100%', padding: '13px 14px', border: `1px solid ${colors.field}`, borderRadius: 10, fontSize: 15, background: '#fff' }}
      />
    </div>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('entrar');
  const cadastro = tab === 'cadastro';

  const tabBtn = (active) => ({
    flex: 1,
    border: 'none',
    cursor: 'pointer',
    padding: 11,
    borderRadius: 9,
    fontWeight: 600,
    fontSize: 15,
    background: active ? '#fff' : 'transparent',
    color: active ? colors.ink : colors.mutedSoft,
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
  });

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
            Tudo o que você precisa para vender online.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}>
            {['Catálogo com seu nome e suas cores', 'Imóveis ilimitados no plano Pro', 'Contatos direto no WhatsApp'].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#cfc7b9', fontSize: 16 }}>
                <span style={{ color: colors.green }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', fontSize: 13, color: '#7d766a' }}>Plano gratuito · sem cartão de crédito</div>
      </div>

      {/* formulário */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ display: 'flex', background: '#f1ede4', borderRadius: 12, padding: 5, marginBottom: 30 }}>
            <button onClick={() => setTab('entrar')} style={tabBtn(!cadastro)}>Entrar</button>
            <button onClick={() => setTab('cadastro')} style={tabBtn(cadastro)}>Criar conta</button>
          </div>
          <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 28, margin: '0 0 6px' }}>
            {cadastro ? 'Crie seu catálogo' : 'Bem-vindo de volta'}
          </h1>
          <p style={{ fontSize: 15, color: colors.muted, margin: '0 0 26px' }}>
            {cadastro ? 'Comece grátis e publique seus imóveis hoje.' : 'Acesse o painel da sua imobiliária.'}
          </p>

          {cadastro && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 8 }}>
              <Field label="Nome completo" placeholder="Marina Albuquerque" />
              <div style={{ display: 'flex', gap: 12 }}>
                <Field label="CPF" placeholder="000.000.000-00" />
                <Field label="CRECI" placeholder="SP 154.882" />
              </div>
              <Field label="Telefone / WhatsApp" placeholder="(11) 99812-4470" />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="E-mail" placeholder="voce@email.com" />
            <Field label="Senha" type="password" placeholder="••••••••" />
          </div>

          {!cadastro && (
            <div style={{ textAlign: 'right', marginTop: 12 }}>
              <span style={{ fontSize: 14, color: colors.orange, fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/recuperar-senha')}>
                Esqueci minha senha
              </span>
            </div>
          )}

          <button
            onClick={() => navigate('/app')}
            style={{ width: '100%', marginTop: 24, background: colors.orange, color: '#fff', border: 'none', borderRadius: 11, padding: 15, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
          >
            {cadastro ? 'Criar conta e começar' : 'Entrar no painel'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: colors.mutedSoft, cursor: 'pointer' }} onClick={() => navigate('/')}>
            ← Voltar para a CAVI
          </div>
        </div>
      </div>
    </div>
  );
}
