'use client'
import { useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { NOTE_LEVELS, noteLevel } from '@/lib/music/catalog'
import { openingReadingNote, randomReadingNote } from '@/lib/music/reading'
import { formatPitch, pitchFromMidi, toMidi, keyLabel } from '@/lib/music/pitch'
import { audio } from '@/lib/audio'
import { recordNote, updateSettings, useProgress } from '@/lib/progress'
import { Staff } from '@/components/staff/Staff'
import { Lesson } from '@/components/lesson'
import { Heading, Select, button, secondary } from '@/components/practice/Common'

export function NoteTrainer() {
  const query = useSearchParams(), progress = useProgress()
  const [chosen, setChosen] = useState<string | null>(null)
  const level = noteLevel(chosen ?? query.get('nivel') ?? progress.settings.noteLevel)
  return <div className="space-y-6"><Heading eyebrow="01 · Ler e reconhecer" title="Cada nota, um passo.">Olhe a clave, leia a nota e encontre a tecla correspondente.</Heading>
    <div className="grid gap-4 sm:grid-cols-3"><Select label="Seu exercício" value={level.id} options={NOTE_LEVELS} onChange={v => { setChosen(v); updateSettings({ noteLevel: v }) }} />
    <Select label="Nome das notas" value={progress.settings.naming} options={[{ id: 'solfege', name: 'Dó Ré Mi' }, { id: 'letter', name: 'C D E' }]} onChange={v => updateSettings({ naming: v as 'solfege' | 'letter' })} />
    <Select label="Numeração das oitavas" value={progress.settings.octave} options={[{ id: 'franco', name: 'Dó central = 3' }, { id: 'scientific', name: 'Dó central = 4 (MIDI)' }]} onChange={v => updateSettings({ octave: v as 'franco' | 'scientific' })} /></div>
    <Exercise key={level.id} levelId={level.id} /><Lesson title="Como ler este exercício">{level.lesson}</Lesson>
  </div>
}
function Exercise({ levelId }: { levelId: string }) {
  const level = noteLevel(levelId), progress = useProgress()
  const [note, setNote] = useState(() => openingReadingNote(level))
  const [answer, setAnswer] = useState<number | null>(null), [error, setError] = useState('')
  const answered = useRef(false)
  const ranges = Object.values(level.range)
  const min = Math.min(...ranges.map(r => toMidi(r.min))) - (level.accidentals ? 1 : 0)
  const max = Math.max(...ranges.map(r => toMidi(r.max))) + (level.accidentals || level.keys.some(k => k > 0) ? 1 : 0)
  const expected = toMidi(note.sounding)
  const score = progress.notes.byLevel[levelId]
  async function hear(midi: number) { try { await audio.unlock(); audio.toneAt(midi, audio.now()) } catch { setError('Não foi possível iniciar o som. Verifique o áudio do navegador.') } }
  function respond(midi: number) {
    if (answered.current) return
    answered.current = true; setAnswer(midi); recordNote(levelId, midi === expected); void hear(midi)
  }
  return <section className="space-y-5 rounded-3xl border bg-card p-4 sm:p-6">
    <div className="flex flex-wrap justify-between gap-3 text-sm"><span className="text-brass">{note.clef === 'treble' ? 'Clave de sol' : 'Clave de fá'} · {keyLabel(note.fifths)}</span><span>{score?.correct ?? 0} acertos / {score?.answered ?? 0} respostas</span></div>
    <Staff clef={note.clef} fifths={note.fifths} notes={[{ pitch: note.written, accidental: note.written.accidental, duration: 'q' }]} />
    <div aria-live="polite" className="min-h-14">{answer === null ? <p>Qual tecla corresponde à nota? Confira também a oitava.</p> : <p className={answer === expected ? 'text-[#72d6ad]' : 'text-[#ffb29d]'}>{answer === expected ? 'Acertou!' : 'Vamos aprender:'} a nota é <strong>{formatPitch(note.sounding, progress.settings.naming, progress.settings.octave)}</strong>.{answer !== expected && ' Compare com a tecla destacada.'}</p>}{error && <p role="alert">{error}</p>}</div>
    <div className="overflow-x-auto pb-3" aria-label="Teclado de respostas"><div className="flex min-w-max gap-1">
      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(midi => {
        const pitch = pitchFromMidi(midi), black = !!pitch.accidental
        const label = formatPitch(pitch, progress.settings.naming, progress.settings.octave)
        return <button key={midi} aria-label={label} data-midi={midi} disabled={answer !== null} onClick={() => respond(midi)} className={`w-14 shrink-0 rounded-b-lg border-2 px-1 pt-14 pb-3 text-xs font-bold transition focus-visible:outline-4 focus-visible:outline-brass ${answer !== null && midi === expected ? 'border-[#55c7b6] bg-[#286b60] text-white' : black ? 'border-[#71604a] bg-[#15120e] text-[#f4ecdf]' : 'border-[#d9ccb8] bg-[#f3ecdf] text-[#241c16]'}`}>{label}</button>
      })}</div></div>
    <div className="flex flex-wrap gap-3"><button className={secondary} onClick={() => void hear(expected)}>Ouvir a nota</button><button className={button} disabled={answer === null} onClick={() => { setNote(randomReadingNote(level, note)); answered.current = false; setAnswer(null); setError('') }}>Próxima nota →</button></div>
    <p className="text-xs text-muted-foreground">Teclas organizadas por semitom. Um bemol pode corresponder à tecla com o nome sustenido equivalente.</p>
  </section>
}
