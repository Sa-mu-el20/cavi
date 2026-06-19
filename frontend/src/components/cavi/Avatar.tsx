// Quadrado com a inicial do corretor, na cor da marca dele.
// Porte de cavi-react/src/components/Avatar.jsx, tipado contra o contrato real
// (nome_publico + cor) dos catálogos.

interface AvatarBrand {
  nome_publico: string
  cor: string
  logo?: string | null
}

interface AvatarProps {
  corretor: AvatarBrand
  size?: number
  radius?: number
  fontSize?: number
}

export default function Avatar({ corretor, size = 48, radius = 12, fontSize }: AvatarProps) {
  const inicial = corretor.nome_publico ? corretor.nome_publico[0].toUpperCase() : '?'

  if (corretor.logo) {
    return (
      <img
        src={corretor.logo}
        alt={corretor.nome_publico}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          flex: 'none',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: fontSize || Math.round(size * 0.42),
        color: '#fff',
        background: corretor.cor,
      }}
    >
      {inicial}
    </div>
  )
}
