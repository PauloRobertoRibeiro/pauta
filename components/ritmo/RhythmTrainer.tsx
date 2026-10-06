'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { RHYTHM_LEVELS, rhythmLevel } from '@/lib/music/catalog'
import { barQuarters, beatsPerBar, bpmLabel, durationFromQuarters, eventsOnsets, generateBar, seededRandom } from '@/lib/music/rhythm'
import { useProgress, recordRhythm, updateSettings } from '@/lib/progress'
import { Staff } from '@/components/staff/Staff'
import { Player } from '@/components/practice/Player'
import { Heading, Select, secondary } from '@/components/practice/Common'
import { Lesson } from '@/components/lesson'
export function RhythmTrainer() {
  const query = useSearchParams(), p = useProgress(), [chosen, setChosen] = useState<string | null>(null)
  const level = rhythmLevel(chosen ?? query.get('nivel') ?? p.settings.rhythmLevel)
  return <div className="space-y-6"><Heading eyebrow="02 · Escutar e tocar" title="Encontre o pulso.">Leia a partitura, ouça o modelo e repita os ataques no tempo.</Heading><Select label="Nível" value={level.id} options={RHYTHM_LEVELS} onChange={v => { setChosen(v); updateSettings({ rhythmLevel: v }) }} /><RhythmExercise key={level.id} levelId={level.id} /><Lesson title="Entenda este ritmo">{level.lesson}</Lesson></div>
}
function RhythmExercise({ levelId }: { levelId: string }) {
  const level = rhythmLevel(levelId), p = useProgress()
  const [seed, setSeed] = useState('inicio'), [meterIndex, setMeterIndex] = useState(0)
  const meter = level.meters[meterIndex]
  const events = generateBar(level.durations, meter, level.rests, seededRandom(seed)), onsets = eventsOnsets(events)
  const hits = onsets.filter((_, i) => !events[i].rest).map(t => t / barQuarters(meter))
  return <><div className="flex flex-wrap items-end justify-between gap-3"><Select label="Compasso" value={String(meterIndex)} options={level.meters.map((m, i) => ({ id: String(i), name: `${m.beats}/${m.beatValue}` }))} onChange={v => setMeterIndex(+v)} /><button className={secondary} onClick={() => setSeed(String(Date.now()))}>Novo compasso</button></div>
    <Staff clef="treble" time={meter} notes={events.map(e => ({ ...durationFromQuarters(e.quarters), rest: e.rest, pitch: { step: 'B', octave: 4 } }))} />
    <p className="text-sm text-muted-foreground">Um pulso = {bpmLabel(meter)}. {beatsPerBar(meter)} pulsos por compasso. O exercício repete o compasso duas vezes.</p>
    <Player key={`${seed}-${meterIndex}`} hitsA={hits} pulses={beatsPerBar(meter)} initialBpm={p.settings.rhythmBpm} onBpm={v => updateSettings({ rhythmBpm: v })} onComplete={(practice, score) => { if (practice) recordRhythm(levelId, score.accuracy) }} />
  </>
}
