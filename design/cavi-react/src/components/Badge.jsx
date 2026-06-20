// Pílula colorida usada para finalidade, status e plano.
export default function Badge({ children, cor, bg, style }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 12,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 999,
        color: cor,
        background: bg,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
