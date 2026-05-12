export default function MedallionLogo({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="58" stroke="#c9a84c" strokeWidth="2" />
      <circle cx="60" cy="60" r="50" stroke="#c9a84c" strokeWidth="0.5" />
      <circle cx="60" cy="60" r="42" stroke="#c9a84c" strokeWidth="1" />
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 360) / 16;
        const rad = (angle * Math.PI) / 180;
        const x1 = 60 + 43 * Math.cos(rad);
        const y1 = 60 + 43 * Math.sin(rad);
        const x2 = 60 + 50 * Math.cos(rad);
        const y2 = 60 + 50 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a84c" strokeWidth="1" />;
      })}
      <text x="60" y="52" textAnchor="middle" fill="#c9a84c" fontSize="7" fontFamily="serif" letterSpacing="2">THE</text>
      <text x="60" y="64" textAnchor="middle" fill="#c9a84c" fontSize="11" fontFamily="serif" fontWeight="bold" letterSpacing="1">MEDALLION</text>
      <text x="60" y="75" textAnchor="middle" fill="#c9a84c" fontSize="6" fontFamily="serif" letterSpacing="3">·THEATRE·</text>
    </svg>
  );
}
