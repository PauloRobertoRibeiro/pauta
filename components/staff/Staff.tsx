import { engrave } from '@/lib/music/engrave'
export function Staff(props: Parameters<typeof engrave>[0] & { label?: string }) {
  const layout = engrave(props)
  return <div className="manuscript overflow-x-auto rounded-2xl p-3"><svg role="img" aria-label={props.label ?? 'Partitura do exercício'} viewBox={`0 0 ${layout.width} ${layout.height}`} style={{ width: '100%', minWidth: props.notes.length === 1 ? 0 : Math.min(layout.width, 740), maxHeight: props.notes.length === 1 ? 230 : 190 }}>
    {layout.lines.map((l, i) => <line key={`l${i}`} {...l} stroke="currentColor" strokeWidth={l.width ?? 1} />)}
    {layout.heads.map((h, i) => <ellipse key={`h${i}`} cx={h.x} cy={h.y} rx={h.whole ? 8 : 6.5} ry={4.5} transform={`rotate(-18 ${h.x} ${h.y})`} fill={h.hollow ? 'var(--paper)' : 'currentColor'} stroke="currentColor" strokeWidth={1.6} />)}
    {layout.glyphs.map((g, i) => <text key={`g${i}`} x={g.x} y={g.y} fontSize={g.size} fontFamily={g.music ? 'Bravura' : 'Georgia'} fill="currentColor">{g.text}</text>)}
  </svg></div>
}
