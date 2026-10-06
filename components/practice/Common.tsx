import type { ReactNode } from 'react'
export const button = 'rounded-xl bg-brass px-5 py-3 font-semibold text-[#23180b] disabled:opacity-40 disabled:cursor-not-allowed'
export const secondary = 'rounded-xl bg-muted px-5 py-3 text-foreground ring-1 ring-foreground/15 disabled:opacity-40'
export function Heading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <header><p className="text-xs uppercase tracking-[.2em] text-brass">{eyebrow}</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">{title}</h1>{children && <p className="mt-3 text-muted-foreground leading-7">{children}</p>}</header>
}
export function Select({ label, value, onChange, options, disabled }: { label: string; value: string; onChange: (v: string) => void; options: { id: string; name: string }[]; disabled?: boolean }) {
  return <label className="flex min-w-0 flex-col gap-2 text-sm text-muted-foreground">{label}<select className="rounded-xl border bg-card p-3 text-base text-foreground" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>{options.map(o => <option value={o.id} key={o.id}>{o.name}</option>)}</select></label>
}
