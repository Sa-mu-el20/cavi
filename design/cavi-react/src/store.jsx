import { createContext, useContext, useMemo, useState } from 'react';
import corretoresSeed from './data/corretores.json';
import imoveisSeed from './data/imoveis.json';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [corretores, setCorretores] = useState(corretoresSeed);
  const [imoveis, setImoveis] = useState(imoveisSeed);

  const value = useMemo(() => {
    // O corretor "logado" no painel é o primeiro da base (Albuquerque Imóveis).
    const brokerId = corretoresSeed[0].id;

    const togglePublicacao = (id) =>
      setImoveis((list) =>
        list.map((i) =>
          i.id === id
            ? { ...i, status: i.status === 'Publicado' ? 'Oculto' : 'Publicado' }
            : i
        )
      );

    const toggleCorretor = (id) =>
      setCorretores((list) =>
        list.map((c) =>
          c.id === id
            ? { ...c, status: c.status === 'Ativo' ? 'Inativo' : 'Ativo' }
            : c
        )
      );

    const corretorPorSlug = (slug) =>
      corretores.find((c) => c.slug === slug) || corretores[0];

    const imovel = (id) => imoveis.find((i) => i.id === Number(id));

    // Imóveis de um corretor (catálogo público mostra só publicados).
    const imoveisDoCorretor = (corretorId, { somentePublicados = false } = {}) =>
      imoveis.filter(
        (i) =>
          i.corretorId === corretorId &&
          (!somentePublicados || i.status === 'Publicado')
      );

    return {
      corretores,
      imoveis,
      brokerId,
      broker: corretores.find((c) => c.id === brokerId),
      togglePublicacao,
      toggleCorretor,
      corretorPorSlug,
      imovel,
      imoveisDoCorretor,
    };
  }, [corretores, imoveis]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData precisa estar dentro de <DataProvider>');
  return ctx;
}
