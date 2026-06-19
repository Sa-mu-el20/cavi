import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useData } from '../store.jsx';
import { colors, fonts } from '../theme.js';

function Label({ children }) {
  return <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.muted, marginBottom: 6 }}>{children}</label>;
}
const inputStyle = { width: '100%', padding: '13px 14px', border: `1px solid ${colors.field}`, borderRadius: 10, fontSize: 15, background: '#fff' };

function Card({ title, sub, children }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 30, marginBottom: 22 }}>
      <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 18, margin: sub ? '0 0 6px' : '0 0 20px' }}>{title}</h2>
      {sub && <p style={{ fontSize: 14, color: colors.mutedSoft, margin: '0 0 18px' }}>{sub}</p>}
      {children}
    </div>
  );
}

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { broker, imovel } = useData();

  const editando = Boolean(id);
  const im = editando ? imovel(id) : null;
  const [publicado, setPublicado] = useState(im ? im.status === 'Publicado' : true);

  const titulo = editando ? 'Editar imóvel' : 'Cadastrar imóvel';
  const sub = editando && im ? `Código ${im.codigo} · ${im.bairro}` : 'Preencha os dados do novo imóvel.';
  const galeria = editando && im ? im.galeria.slice(0, 4) : [];

  return (
    <div style={{ padding: '34px 44px', maxWidth: 920 }}>
      <div style={{ fontSize: 14, color: colors.mutedSoft, marginBottom: 20 }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/app/imoveis')}>Meus imóveis</span>
        &nbsp;/&nbsp; <span style={{ color: colors.muted }}>{titulo}</span>
      </div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: '0 0 4px' }}>{titulo}</h1>
        <div style={{ fontSize: 14, color: colors.mutedSoft }}>{sub}</div>
      </div>

      <Card title="Informações principais">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label>Título do anúncio</Label>
            <input defaultValue={im?.titulo || ''} placeholder="Ex: Apartamento reformado em Pinheiros" style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Label>Tipo</Label>
              <select defaultValue={im?.tipo || 'Apartamento'} style={{ ...inputStyle, cursor: 'pointer' }}>
                {['Apartamento', 'Casa', 'Cobertura', 'Studio', 'Loft', 'Sala comercial'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <Label>Finalidade</Label>
              <select defaultValue={im?.finalidade || 'Venda'} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option>Venda</option><option>Aluguel</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <Label>Preço (R$)</Label>
              <input defaultValue={im?.preco || ''} placeholder="890000" style={inputStyle} />
            </div>
          </div>
          <div>
            <Label>Descrição</Label>
            <textarea rows={4} defaultValue={im?.descricao || ''} placeholder="Descreva os destaques do imóvel..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </div>
        </div>
      </Card>

      <Card title="Características">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[['Área (m²)', im?.area, '78'], ['Quartos', im?.quartos, '2'], ['Banheiros', im?.banheiros, '2'], ['Vagas', im?.vagas, '1']].map(([l, v, ph]) => (
            <div key={l}>
              <Label>{l}</Label>
              <input defaultValue={v ?? ''} placeholder={ph} style={inputStyle} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Endereço">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 180 }}><Label>CEP</Label><input defaultValue={im?.cep || ''} placeholder="05422-010" style={inputStyle} /></div>
            <div style={{ flex: 1 }}><Label>Logradouro</Label><input defaultValue={im?.logradouro || ''} placeholder="Rua dos Pinheiros" style={inputStyle} /></div>
            <div style={{ width: 120 }}><Label>Número</Label><input defaultValue={im?.numero || ''} placeholder="1240" style={inputStyle} /></div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}><Label>Bairro</Label><input defaultValue={im?.bairro || ''} placeholder="Pinheiros" style={inputStyle} /></div>
            <div style={{ flex: 1 }}><Label>Complemento</Label><input defaultValue={im?.complemento || ''} placeholder="Apto 81" style={inputStyle} /></div>
            <div style={{ width: 200 }}><Label>Cidade / UF</Label><input defaultValue="São Paulo / SP" style={inputStyle} /></div>
          </div>
        </div>
      </Card>

      <Card title="Fotos" sub="A primeira foto será a capa do anúncio. Arraste para reordenar.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {galeria.map((src, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${colors.borderSoft}` }}>
              <img src={src} style={{ width: '100%', height: 96, objectFit: 'cover', display: 'block' }} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 6, background: 'rgba(31,27,24,0.7)', color: '#fff', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>×</span>
            </div>
          ))}
          <div style={{ height: 96, border: '2px dashed #d8d0c2', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', color: colors.faint }}>
            <span style={{ fontSize: 22 }}>＋</span><span style={{ fontSize: 12, fontWeight: 600 }}>Adicionar</span>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: '22px 30px', marginBottom: 28 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Publicar imóvel no catálogo</div>
          <div style={{ fontSize: 13, color: colors.mutedSoft }}>Imóveis ocultos ficam salvos mas não aparecem no catálogo público.</div>
        </div>
        <div
          onClick={() => setPublicado((v) => !v)}
          style={{ width: 52, height: 30, borderRadius: 999, background: publicado ? colors.green : '#d8d0c2', position: 'relative', cursor: 'pointer', transition: 'background .15s' }}
        >
          <div style={{ position: 'absolute', top: 3, left: publicado ? 25 : 3, width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left .15s' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={() => navigate('/app/imoveis')} style={{ padding: '14px 24px', border: `1px solid ${colors.field}`, background: '#fff', borderRadius: 11, fontWeight: 600, fontSize: 15, color: colors.muted, cursor: 'pointer' }}>Cancelar</button>
        <button
          onClick={() => (editando && im ? navigate(`/v/${broker.slug}/imovel/${im.id}`) : navigate(`/v/${broker.slug}`))}
          style={{ padding: '14px 24px', border: `1px solid ${colors.field}`, background: '#fff', borderRadius: 11, fontWeight: 600, fontSize: 15, color: colors.ink, cursor: 'pointer' }}
        >
          Pré-visualizar
        </button>
        <button onClick={() => navigate('/app/imoveis')} style={{ padding: '14px 28px', border: 'none', background: colors.orange, color: '#fff', borderRadius: 11, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Salvar imóvel</button>
      </div>
    </div>
  );
}
