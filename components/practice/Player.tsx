'use client'
import { useEffect, useRef, useState } from 'react'
import { audio } from '@/lib/audio'
import { scoreTaps, timingWindow, type TapScore } from '@/lib/music/score-taps'
import { Wheel } from '@/components/wheel/Wheel'
import { button, secondary } from './Common'

type Voice = 'a' | 'b'
type Run = { start: number; end: number; cycle: number; beat: number; taps: number[]; expected: number[]; practice: boolean }
export function Player({ hitsA, hitsB = [], pulses, initialBpm, ratio, onComplete, onBpm }: {
  hitsA: number[]; hitsB?: number[]; pulses: number; initialBpm: number; ratio?: string;
  onComplete: (practice: boolean, result: TapScore) => void; onBpm: (bpm: number) => void
}) {
  const [bpm, setBpm] = useState(initialBpm), [voice, setVoice] = useState<Voice>('a')
  const [busy, setBusy] = useState(false), [status, setStatus] = useState('Pronto para começar.')
  const [phase, setPhase] = useState(0), [count, setCount] = useState(0), [result, setResult] = useState<TapScore | null>(null)
  const run = useRef<Run | null>(null), raf = useRef(0), token = useRef(0)
  const tapButton = useRef<HTMLButtonElement>(null)
  function cancel() { token.current++; run.current = null; cancelAnimationFrame(raf.current); audio.stopAll(); setBusy(false); setPhase(0); setStatus('Interrompido. Esta tentativa não foi registrada.') }
  useEffect(() => () => { token.current++; run.current = null; cancelAnimationFrame(raf.current); audio.stopAll() }, [])
  function tap() {
    const r = run.current
    if (!r?.practice) return
    const now = audio.now()
    if (now < r.start || now >= r.end) return
    r.taps.push(now - r.start); setCount(r.taps.length); audio.hitAt(now, voice)
  }
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.code !== 'Space' || e.repeat || !run.current?.practice) return
      const target = e.target as HTMLElement
      if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'].includes(target.tagName) && target !== tapButton.current) return
      e.preventDefault()
      const r = run.current, now = audio.now()
      if (now >= r.start && now < r.end) { r.taps.push(now - r.start); setCount(r.taps.length); audio.hitAt(now, voice) }
    }
    window.addEventListener('keydown', key)
    function hidden() { if (document.hidden) { token.current++; run.current = null; cancelAnimationFrame(raf.current); audio.stopAll(); setBusy(false); setStatus('Pausado ao sair da aba. Comece uma nova tentativa.') } }
    document.addEventListener('visibilitychange', hidden)
    return () => { window.removeEventListener('keydown', key); document.removeEventListener('visibilitychange', hidden) }
  }, [voice])
  async function start(practice: boolean) {
    const own = ++token.current
    setBusy(true); setResult(null); setCount(0)
    try {
      await audio.unlock()
      if (own !== token.current) return
      audio.stopAll()
      const beat = 60 / bpm, cycle = pulses * beat, base = audio.now() + .15, start = base + cycle, cycles = ratio ? 4 : 2
      const target = voice === 'a' ? hitsA : hitsB
      const expected = Array.from({ length: cycles }, (_, c) => target.map(f => (c + f) * cycle)).flat()
      run.current = { start, end: start + cycles * cycle, cycle, beat, taps: [], expected, practice }
      for (let i = 0; i < pulses; i++) audio.hitAt(base + i * beat, 'metro')
      for (let c = 0; c < cycles; c++) {
        if (!practice || voice !== 'a') hitsA.forEach(f => audio.hitAt(start + (c + f) * cycle, 'a'))
        if (!practice || voice !== 'b') hitsB.forEach(f => audio.hitAt(start + (c + f) * cycle, 'b'))
        if (!ratio) for (let i = 0; i < pulses; i++) audio.hitAt(start + c * cycle + i * beat, 'metro')
      }
      const animate = () => {
        const r = run.current
        if (!r || own !== token.current) return
        const t = audio.now()
        if (t >= r.end) {
          const scored = scoreTaps(r.expected, r.taps, timingWindow(beat))
          run.current = null; setBusy(false); setPhase(0); setStatus(practice ? 'Exercício concluído.' : 'Escuta concluída. Agora experimente tocar.'); if (practice) setResult(scored)
          onComplete(practice, scored); return
        }
        setPhase(t < start ? 0 : ((t - start) % cycle) / cycle)
        setStatus(t < start ? `Preparar: ${Math.min(pulses, Math.floor((t - base) / beat) + 1)} / ${pulses}` : `${practice ? 'Sua vez' : 'Ouça'} · ciclo ${Math.floor((t - start) / cycle) + 1} de ${cycles}`)
        raf.current = requestAnimationFrame(animate)
      }
      animate()
      if (practice) tapButton.current?.focus()
    } catch { if (own === token.current) { setBusy(false); run.current = null; audio.stopAll(); setStatus('Não foi possível iniciar o áudio. Verifique as permissões do navegador.') } }
  }
  return <section className="space-y-5 rounded-3xl border bg-card p-5">
    <div className="flex flex-wrap items-end justify-between gap-4"><label className="space-y-2 text-sm"><span className="block">Andamento · <strong>{bpm} BPM</strong></span><input aria-label="Andamento" type="range" min="40" max="160" step="1" value={bpm} disabled={busy} onChange={e => { const v = +e.target.value; setBpm(v); onBpm(v) }} className="w-56 accent-[#e0b15a]" /></label>
      {ratio && <label className="text-sm">Voz para tocar<select aria-label="Voz para tocar" disabled={busy} className="ml-2 rounded-lg border bg-card p-2" value={voice} onChange={e => setVoice(e.target.value as Voice)}><option value="a">Âmbar (externa)</option><option value="b">Mar (interna)</option></select></label>}
    </div>
    {ratio ? <div className="mx-auto max-w-64"><Wheel ratio={ratio} hitsA={hitsA} hitsB={hitsB} phase={phase} /></div> : <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-brass" style={{ width: `${phase * 100}%` }} /></div>}
    <p role="status" className="text-center text-lg text-brass">{status}</p>
    <div className="flex flex-wrap justify-center gap-3"><button disabled={busy} onClick={() => void start(false)} className={secondary}>▶ Ouvir</button><button disabled={busy} onClick={() => void start(true)} className={button}>Começar a tocar</button>{busy && <button className={secondary} onClick={cancel}>Parar</button>}</div>
    <button ref={tapButton} aria-label="Bater no tempo" disabled={!busy} onPointerDown={e => { if (e.button !== 0) return; e.preventDefault(); tap() }} onKeyDown={e => { if (e.key === 'Enter' && !e.repeat) { e.preventDefault(); tap() } }} className="min-h-28 w-full touch-none rounded-2xl border-2 border-dashed border-brass/40 bg-brass/5 p-5 text-xl font-semibold text-brass active:bg-brass/25 disabled:opacity-40">BATER NO TEMPO<span className="mt-2 block text-xs font-normal">Toque aqui ou use a barra de espaço · {count} toques</span></button>
    <p className="text-xs text-muted-foreground">Espere a contagem. {ratio ? 'A voz escolhida fica muda enquanto você toca; acompanhe a outra.' : 'Bata somente no início das notas e respeite as pausas.'} Use o alto-falante ou fones com fio para reduzir o atraso do áudio.</p>
    {result && <div aria-live="polite" className="rounded-2xl bg-muted p-4"><strong className="text-2xl text-brass">{Math.round(result.accuracy * 100)}% no tempo</strong><p className="mt-2 text-sm">{result.onTime} de {result.expected} ataques no tempo · {result.extras.length} toques extras · {result.matches.filter(m => m.tap === null).length} ausentes.</p><p className="mt-1 text-xs text-muted-foreground">Tolerância: ±{Math.round(timingWindow(60 / bpm) * 1000)} ms. Atrasos do aparelho podem influenciar esta medida.</p></div>}
  </section>
}
