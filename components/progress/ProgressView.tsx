'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { readProgress, resetProgress, restoreProgress, useProgress } from '@/lib/progress'
import { validProgress } from '@/lib/progress-validation'
import { studyPath } from '@/lib/path'
import { Heading, button, secondary } from '@/components/practice/Common'
export function ProgressView() {
  const p = useProgress(), path = studyPath(p), file = useRef<HTMLInputElement>(null), [message, setMessage] = useState('')
  function backup() {
    const blob = new Blob([JSON.stringify({ app: 'Pauta', version: 1, exportedAt: new Date().toISOString(), progress: readProgress() }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = `Pauta-progresso-${new Date().toISOString().slice(0,10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('Cópia de segurança exportada. Guarde o arquivo em um lugar seguro.')
  }
  async function restore(f: File | undefined) {
    if (!f) return
    try {
      if (f.size > 1000000) throw new Error('O arquivo é grande demais para ser um progresso do Pauta.')
      const data = JSON.parse(await f.text())
      if (data.app !== 'Pauta' || data.version !== 1 || !validProgress(data.progress)) throw new Error('Arquivo inválido. Escolha uma cópia exportada pelo Pauta.')
      if (!window.confirm('Restaurar esta cópia substituirá seu progresso atual. Deseja continuar?')) return
      restoreProgress(data.progress); setMessage('Progresso restaurado.')
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Não foi possível importar.') }
    finally { if (file.current) file.current.value = '' }
  }
  return <div className="space-y-7"><Heading eyebrow="04 · Seu caminho musical" title="Um pouco, todos os dias.">Seu progresso fica neste navegador. Exporte uma cópia para guardar ou transferir para outro computador.</Heading>
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Notas respondidas',p.notes.answered],['Notas corretas',p.notes.correct],['Treinos de ritmo',p.rhythm.attempts],['Treinos de poli',p.poly.taps]].map(([label,value]) => <div key={String(label)} className="rounded-2xl border bg-card p-5"><strong className="text-3xl text-brass">{value}</strong><p className="mt-2 text-sm text-muted-foreground">{label}</p></div>)}</section>
    <section><h2 className="mb-4 font-display text-2xl">Sua trilha · {path.filter(s => s.done).length}/{path.length}</h2><ol className="space-y-3">{path.map((s,i) => <li key={s.id}><Link href={s.href} className="flex gap-4 rounded-2xl border bg-card p-5 hover:border-brass"><span className="text-xl text-brass">{s.done ? '✓' : String(i+1).padStart(2,'0')}</span><div><h3 className="font-semibold">{s.title}</h3><p className="mt-1 text-sm text-muted-foreground">{s.detail}</p></div></Link></li>)}</ol></section>
    <section className="space-y-4 rounded-2xl border bg-card p-5"><h2 className="font-display text-2xl">Cópia de segurança</h2><div className="flex flex-wrap gap-3"><button className={button} onClick={backup}>Exportar progresso</button><button className={secondary} onClick={() => file.current?.click()}>Restaurar cópia</button><input ref={file} type="file" accept=".json,application/json" hidden onChange={e => void restore(e.target.files?.[0])} /></div><p role="status" className="text-sm text-brass">{message}</p><p className="text-xs text-muted-foreground">Não há sincronização automática entre navegadores. Ao limpar os dados do navegador, o progresso local pode ser removido.</p></section>
    <details className="rounded-2xl border p-4"><summary className="cursor-pointer text-sm text-muted-foreground">Recomeçar os estudos</summary><p className="my-4 text-sm">Zera as estatísticas e mantém as preferências. Exporte uma cópia antes.</p><button className={secondary} onClick={() => { if (confirm('Zerar o progresso? Esta ação não pode ser desfeita sem uma cópia exportada.')) { resetProgress(); setMessage('Estatísticas zeradas.') } }}>Zerar progresso</button></details>
  </div>
}
