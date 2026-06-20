import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../store.jsx';
import { colors, fonts } from '../theme.js';

const CORES = ['#d97a2b', '#5a8f7b', '#3f6f9e', '#b8863b', '#8a6fb0', '#1f1b18'];

function Label({ children }) {
  return <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.muted, marginBottom: 6 }}>{children}</label>;
}
const inputStyle = { width: '100%', padding: '13px 14px', border: `1px solid ${colors.field}`, borderRadius: 10, fontSize: 15, background: '#fff' };

export default function Config() {
  const navigate = useNavigate();
  const { broker } = useData();
  const [cor, setCor] = useState(broker.cor);

  return (
    <div style={{ padding: '34px 44px', maxWidth: 980 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: '0 0 4px' }}>Configurações do site</h1>
          <div style={{ fontSize: 14, color: colors.mutedSoft }}>Personalize sua vitrine pública.</div>
        </div>
        <button onClick={() => navigate(`/v/${broker.slug}`)} style={{ background: '#fff', color: colors.ink, border: `1px solid ${colors.field}`, borderRadius: 11, padding: '13px 20px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
          ↗ Ver vitrine
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 30 }}>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 18, margin: '0 0 20px' }}>Identidade</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><Label>Nome público</Label><input defaultValue={broker.site} style={inputStyle} /></div>
              <div>
                <Label>Endereço da vitrine</Label>
                <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${colors.field}`, borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
                  <span style={{ padding: '13px 0 13px 14px', fontSize: 15, color: colors.faint }}>cavi.ifes.site/v/</span>
                  <input defaultValue={broker.slug} style={{ flex: 1, padding: '13px 14px 13px 2px', border: 'none', fontSize: 15, background: 'transparent', outline: 'none' }} />
                </div>
              </div>
              <div><Label>Apresentação</Label><textarea rows={3} defaultValue={broker.sobre} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} /></div>
            </div>
          </div>

          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 30 }}>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 18, margin: '0 0 20px' }}>Contato</h2>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}><Label>WhatsApp</Label><input defaultValue={broker.whatsapp} style={inputStyle} /></div>
              <div style={{ flex: 1 }}><Label>E-mail de contato</Label><input defaultValue="marina@albuquerqueimoveis.com.br" style={inputStyle} /></div>
            </div>
          </div>

          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 30 }}>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 18, margin: '0 0 6px' }}>Aparência</h2>
            <p style={{ fontSize: 14, color: colors.mutedSoft, margin: '0 0 18px' }}>Logo e cor de destaque da sua vitrine.</p>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div>
                <Label>Logo</Label>
                <div style={{ width: 96, height: 96, border: '2px dashed #d8d0c2', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', color: colors.faint }}>
                  <span style={{ fontSize: 22 }}>＋</span><span style={{ fontSize: 11, fontWeight: 600 }}>Enviar</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <Label>Cor de destaque</Label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {CORES.map((c) => (
                    <div
                      key={c}
                      onClick={() => setCor(c)}
                      style={{ width: 40, height: 40, borderRadius: 10, background: c, cursor: 'pointer', boxShadow: cor === c ? `0 0 0 3px #fff, 0 0 0 5px ${c}` : 'none' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button style={{ padding: '14px 28px', border: 'none', background: colors.orange, color: '#fff', borderRadius: 11, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Salvar alterações</button>
          </div>
        </div>

        {/* pré-visualização */}
        <div style={{ position: 'sticky', top: 34 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.mutedSoft, marginBottom: 10 }}>Pré-visualização</div>
          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 18px 44px -28px rgba(60,45,25,0.35)' }}>
            <div style={{ height: 34, background: colors.cream, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 12, color: colors.faint }}>cavi.ifes.site/v/{broker.slug}</div>
            <div style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: cor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>{broker.site[0]}</div>
                <div>
                  <div style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 17 }}>{broker.site}</div>
                  <div style={{ fontSize: 11, color: colors.mutedSoft }}>{broker.creci}</div>
                </div>
              </div>
              <img src="/assets/prop-02.png" style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />
              <div style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 18, color: cor }}>R$ 1.650.000</div>
              <div style={{ fontSize: 13, color: colors.muted }}>Cobertura duplex · Vila Madalena</div>
              <div style={{ marginTop: 14, background: colors.green, color: colors.greenDark, textAlign: 'center', padding: 9, borderRadius: 9, fontSize: 13, fontWeight: 700 }}>WhatsApp</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
