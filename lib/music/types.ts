export const STEPS = ["C", "D", "E", "F", "G", "A", "B"] as const

export type Step = (typeof STEPS)[number]
export type Clef = "treble" | "bass"
export type Accidental = "sharp" | "flat" | "natural"
export type DurationName = "w" | "h" | "q" | "8" | "16"
export type Naming = "solfege" | "letter"
export type OctaveSystem = "franco" | "scientific"

export type Pitch = {
  step: Step
  octave: number
  accidental?: Accidental | null
}

export type Meter = {
  beats: number
  beatValue: number
}

export type Tuplet = {
  actual: number
  normal: number
  group: string
}

/** A symbol on the staff. Sounding length can differ from the written value when a tuplet is set. */
export type NoteInput = {
  pitch?: Pitch
  /** Printed accidental. The key signature is drawn separately and is not repeated here. */
  accidental?: Accidental | null
  rest?: boolean
  duration: DurationName
  dots?: number
  tuplet?: Tuplet
}

export type RhythmEvent = {
  quarters: number
  rest: boolean
}

export const WRITTEN_QUARTERS: Record<DurationName, number> = {
  w: 4,
  h: 2,
  q: 1,
  "8": 0.5,
  "16": 0.25,
}
