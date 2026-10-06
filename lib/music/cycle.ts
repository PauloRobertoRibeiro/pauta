import { soundingQuarters } from "@/lib/music/rhythm"
import type { NoteInput } from "@/lib/music/types"

export type CycleHit = {
  frac: number
  eventIndex: number
}

/** Hit positions inside one cycle, derived from the written rhythm so the wheel and the staff agree. */
export function cycleOf(notes: NoteInput[]) {
  const total = notes.reduce((sum, note) => sum + soundingQuarters(note), 0)
  let onset = 0
  const hits: CycleHit[] = []
  notes.forEach((note, eventIndex) => {
    if (!note.rest && total > 0) {
      const frac = onset / total
      hits.push({ frac: frac >= 0.999 ? 0 : frac, eventIndex })
    }
    onset += soundingQuarters(note)
  })
  return { total, hits }
}
