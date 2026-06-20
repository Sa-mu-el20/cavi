// Helpers de formatação e mapeamentos de cor por estado.

export function fmtPreco(preco, finalidade) {
  return (
    'R$ ' +
    Number(preco).toLocaleString('pt-BR') +
    (finalidade === 'Aluguel' ? '/mês' : '')
  );
}

export function waLink(numero, msg) {
  const d = String(numero).replace(/\D/g, '');
  return 'https://wa.me/55' + d + (msg ? '?text=' + encodeURIComponent(msg) : '');
}

export function inicial(corretor) {
  return corretor?.site ? corretor.site[0] : '?';
}

export function finalidadeStyle(finalidade) {
  return finalidade === 'Venda'
    ? { cor: '#d97a2b', bg: '#fbeedd' }
    : { cor: '#5a8f7b', bg: '#e2efe6' };
}

export function statusImovelStyle(status) {
  return status === 'Publicado'
    ? { cor: '#5a7d43', bg: '#e6eed6' }
    : { cor: '#a89f90', bg: '#efeae0' };
}

export function statusCorretorStyle(status) {
  return status === 'Ativo'
    ? { cor: '#5a7d43', bg: '#e6eed6' }
    : { cor: '#b56b6b', bg: '#f4e3e3' };
}

export function planoStyle(plano) {
  if (plano === 'Pro') return { cor: '#c06a22', bg: '#fbeedd' };
  if (plano === 'Starter') return { cor: '#3f6f9e', bg: '#e7eef3' };
  return { cor: '#8a8275', bg: '#efeae0' };
}

// Resumo de cômodos respeitando o tipo do imóvel.
export function especs(im) {
  return im.tipo === 'Sala comercial'
    ? `${im.area}m² · ${im.vagas} vaga`
    : `${im.quartos} quartos · ${im.banheiros} banh · ${im.area}m²`;
}
