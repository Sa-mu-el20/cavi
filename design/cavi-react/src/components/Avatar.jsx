// Quadrado com a inicial do corretor, na cor da marca dele.
export default function Avatar({ corretor, size = 48, radius = 12, fontSize }) {
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
      {corretor.site[0]}
    </div>
  );
}
