export function Wheel({ ratio, hitsA, hitsB, phase = 0, foot = 'b' }: { ratio: string; hitsA: number[]; hitsB: number[]; phase?: number; foot?: 'a' | 'b'; spin?: boolean }) {
  const point = (frac: number, r: number) => ({ x: 150 + r * Math.sin(frac * Math.PI * 2), y: 150 - r * Math.cos(frac * Math.PI * 2) })
  const hand = point(phase, 120)
  return <svg viewBox="0 0 300 300" role="img" aria-label={`Ciclo ${ratio}: âmbar ${hitsA.length} ataques; mar ${hitsB.length} ataques`} className="w-full">
    <circle cx="150" cy="150" r="137" fill="#211c16" />
    {[112, 82].map(r => <circle key={r} cx="150" cy="150" r={r} fill="none" stroke="#62513c" strokeWidth="1" />)}
    <line x1="150" y1="150" x2={hand.x} y2={hand.y} stroke="#f4ecdf" opacity="0.7" strokeWidth="2" />
    {[hitsA, hitsB].map((hits, v) => hits.map((f, i) => { const p = point(f, v ? 82 : 112); return <circle key={`${v}-${i}`} cx={p.x} cy={p.y} r={7} fill={(foot === 'b' ? v === 1 : v === 0) ? '#211c16' : '#e0b15a'} stroke={v ? '#55c7b6' : '#e0b15a'} strokeWidth="3" /> }))}
    <circle cx="150" cy="150" r="48" fill="#211c16" /><text x="150" y="151" textAnchor="middle" fill="#f4ecdf" fontFamily="Georgia" fontSize="32">{ratio}</text>
    <text x="150" y="175" textAnchor="middle" fill="#b7ab9b" fontSize="11">ENCONTRO DO CICLO</text>
  </svg>
}
