import type { ProgressState } from "@/lib/progress"

export type PathStep = {
  id: string
  title: string
  detail: string
  href: string
  done: boolean
}

function noteReady(progress: ProgressState, id: string, minimum = 12) {
  const level = progress.notes.byLevel[id]
  if (!level || level.answered < minimum) return false
  return level.correct / level.answered >= 0.75
}

function rhythmReady(progress: ProgressState, id: string) {
  return (progress.rhythm.byLevel[id]?.bestAccuracy ?? 0) >= 0.75
}

function polyReady(progress: ProgressState, id: string) {
  const item = progress.poly.byExercise[id]
  if (!item) return false
  return item.listens > 0 || item.taps > 0
}

export function studyPath(progress: ProgressState): PathStep[] {
  return [
    {
      id: "sol",
      title: "Ler a clave de sol",
      detail: "Doze notas no centro da pauta, com pelo menos três quartos de acerto.",
      href: "/leitura?nivel=sol-centro",
      done: noteReady(progress, "sol-centro"),
    },
    {
      id: "fa",
      title: "Ler a clave de fá",
      detail: "A mesma meta, agora na pauta grave.",
      href: "/leitura?nivel=fa-centro",
      done: noteReady(progress, "fa-centro"),
    },
    {
      id: "colcheias",
      title: "Bater colcheias",
      detail: "Um compasso com 75% das notas no tempo.",
      href: "/ritmo?nivel=colcheias",
      done: rhythmReady(progress, "colcheias"),
    },
    {
      id: "tres-dois",
      title: "Sentir 3 contra 2",
      detail: "Ouça o ciclo inteiro antes de tentar tocar junto.",
      href: "/polirritmos?ex=3-2",
      done: polyReady(progress, "3-2"),
    },
    {
      id: "armadura",
      title: "Ler com armadura",
      detail: "O fá de sol maior já soa sustenido sem o acidente na nota.",
      href: "/leitura?nivel=armaduras",
      done: noteReady(progress, "armaduras", 10),
    },
    {
      id: "quatro-tres",
      title: "Encostar 4 contra 3",
      detail: "O pé fica nas três. A outra voz preenche com quatro iguais.",
      href: "/polirritmos?ex=4-3",
      done: polyReady(progress, "4-3"),
    },
  ]
}
