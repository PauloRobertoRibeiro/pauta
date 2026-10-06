"use client"

import { Wheel } from "@/components/wheel/Wheel"
import { exerciseHits, polyExercise } from "@/lib/music/catalog"
import { studyPath } from "@/lib/path"
import { useProgress } from "@/lib/progress"
import { cn } from "@/lib/utils"
import { BookOpen, Drum, Music2 } from "lucide-react"
import Link from "next/link"

const DOORS = [
  {
    href: "/leitura",
    title: "Notas",
    text: "Clave de sol, clave de fá, acidentes e armaduras. O nome vem antes da tecla.",
    icon: BookOpen,
  },
  {
    href: "/ritmo",
    title: "Ritmo",
    text: "Semínimas, colcheias, pausas e 6/8. Você bate, a pauta confere o tempo.",
    icon: Drum,
  },
  {
    href: "/polirritmos",
    title: "Polirritmos",
    text: "3 contra 2, 4 contra 3, tresillo e clave. O pé marca um. A mão aprende o outro.",
    icon: Music2,
  },
]

export function StudioHome() {
  const progress = useProgress()
  const path = studyPath(progress)
  const done = path.filter((step) => step.done).length
  const preview = exerciseHits(polyExercise("3-2"))

  return (
    <div className="space-y-8">
      <section className="grid items-center gap-6 md:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-xs tracking-[0.2em] text-brass uppercase">Estúdio de leitura</p>
          <h1 className="mt-2 font-display text-5xl leading-none tracking-tight sm:text-6xl">Pauta</h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-foreground/80">
            Treine o olho na partitura e o corpo nos polirritmos. Devagar, em voz alta, até o encontro do ciclo ficar óbvio.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={progress.lastHref ?? "/leitura"} className="rounded-full bg-brass px-5 py-2.5 text-sm font-medium text-[#23180b]">
              {progress.lastHref ? "Continuar" : "Começar pela clave de sol"}
            </Link>
            <Link href="/polirritmos?ex=3-2" className="rounded-full bg-muted px-5 py-2.5 text-sm">
              Ouvir 3 contra 2
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-xs">
          <Wheel
            ratio="3:2"
            spin
            hitsA={preview.a.hits.map((hit) => hit.frac)}
            hitsB={preview.b.hits.map((hit) => hit.frac)}
            foot="b"
          />
          <p className="mt-2 text-center text-xs text-muted-foreground">Três notas no tempo de duas. O mar, com o círculo aberto, é o pé.</p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {DOORS.map((door) => {
          const Icon = door.icon
          return (
            <Link key={door.href} href={door.href} className="rounded-3xl bg-card p-5 ring-1 ring-foreground/10 transition hover:ring-brass/50">
              <Icon className="size-5 text-brass" />
              <h2 className="mt-4 font-display text-2xl">{door.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{door.text}</p>
            </Link>
          )
        })}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl tracking-tight">Ordem sugerida</h2>
            <p className="text-sm text-muted-foreground">{done} de {path.length} passos com folga.</p>
          </div>
          <Link href="/progresso" className="text-sm text-brass">
            Ver a trilha
          </Link>
        </div>
        <ol className="space-y-2">
          {path.map((step, index) => (
            <li key={step.id}>
              <Link href={step.href} className="flex items-start gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10">
                <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-sm", step.done ? "bg-[#1f6b45] text-white" : "bg-muted text-foreground")}>
                  {step.done ? "✓" : index + 1}
                </span>
                <span>
                  <span className="block font-medium">{step.title}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{step.detail}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
