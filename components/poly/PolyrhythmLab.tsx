'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { POLY_EXERCISES, polyExercise, exerciseHits } from '@/lib/music/catalog'
import { barQuarters } from '@/lib/music/rhythm'
import { recordListen, recordTap, updateSettings, useProgress } from '@/lib/progress'
import { Staff } from '@/components/staff/Staff'
import { Player } from '@/components/practice/Player'
import { Heading, Select } from '@/components/practice/Common'
import { Lesson } from '@/components/lesson'
export function PolyrhythmLab() {
  const query = useSearchParams(), p = useProgress(), [chosen, setChosen] = useState<string | null>(null)
  const ex = polyExercise(chosen ?? query.get('ex') ?? p.settings.polyId), hits = exerciseHits(ex)
  return <div className="space-y-6"><Heading eyebrow="03 · Independência e coordenação" title="Dois ritmos. Um encontro.">{ex.summary}</Heading>
    <Select label="Explorar um ciclo" value={ex.id} options={POLY_EXERCISES.map(e => ({ id: e.id, name: e.title }))} onChange={v => { setChosen(v); updateSettings({ polyId: v }) }} />
    <div className="space-y-4">{ex.voices.map((v, i) => <section key={i}><h2 className={`mb-2 text-sm ${i ? 'text-[#55c7b6]' : 'text-brass'}`}>{v.name} · {v.countLabel}</h2><Staff clef="treble" time={ex.meter} notes={v.notes} measureQuarters={barQuarters(ex.meter)} label={`Partitura da voz ${v.name}`} /></section>)}</div>
    <p className="text-sm text-muted-foreground">BPM marca {ex.pulseName}. Cada ciclo tem {ex.pulses} pulsos. Quiálteras mostram a proporção escrita (por exemplo, 3:2).</p>
    <Player key={ex.id} ratio={ex.ratio} hitsA={hits.a.hits.map(h => h.frac)} hitsB={hits.b.hits.map(h => h.frac)} pulses={ex.pulses} initialBpm={p.settings.polyBpm} onBpm={v => updateSettings({ polyBpm: v })} onComplete={(practice, score) => practice ? recordTap(ex.id, score.accuracy, score.meanAbsMs) : recordListen(ex.id)} />
    <Lesson title="Pratique passo a passo"><ol className="list-decimal space-y-2 pl-5">{ex.steps.map(s => <li key={s}>{s}</li>)}</ol></Lesson>
  </div>
}
