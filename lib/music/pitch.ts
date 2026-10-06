import {
  STEPS,
  type Accidental,
  type Clef,
  type Naming,
  type OctaveSystem,
  type Pitch,
  type Step,
} from "@/lib/music/types"

const SEMITONE: Record<Step, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

const SOLFEGE = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"]
const LETTERS = ["C", "D", "E", "F", "G", "A", "B"]

const SHARP_ORDER: Step[] = ["F", "C", "G", "D", "A", "E", "B"]
const FLAT_ORDER: Step[] = ["B", "E", "A", "D", "G", "C", "F"]

/** Staff steps above the bottom line. Even numbers are lines. */
const SHARP_STEPS: Record<Clef, number[]> = {
  treble: [8, 5, 9, 6, 3, 7, 4],
  bass: [6, 3, 7, 4, 1, 5, 2],
}

const FLAT_STEPS: Record<Clef, number[]> = {
  treble: [4, 7, 3, 6, 2, 5, 1],
  bass: [2, 5, 1, 4, 0, 3, -1],
}

export function diatonic(pitch: { step: Step; octave: number }) {
  return pitch.octave * 7 + STEPS.indexOf(pitch.step)
}

export function fromDiatonic(value: number): { step: Step; octave: number } {
  const octave = Math.floor(value / 7)
  const step = STEPS[((value % 7) + 7) % 7]
  return { step, octave }
}

/** Scientific pitch: middle C is C4, MIDI 60. */
export function toMidi(pitch: Pitch) {
  let midi = (pitch.octave + 1) * 12 + SEMITONE[pitch.step]
  if (pitch.accidental === "sharp") midi += 1
  if (pitch.accidental === "flat") midi -= 1
  return midi
}

export function staffStep(pitch: { step: Step; octave: number }, clef: Clef) {
  const bottom = clef === "treble" ? diatonic({ step: "E", octave: 4 }) : diatonic({ step: "G", octave: 2 })
  return diatonic(pitch) - bottom
}

export function signatureAccidental(step: Step, fifths: number): Accidental | null {
  if (fifths > 0 && SHARP_ORDER.slice(0, fifths).includes(step)) return "sharp"
  if (fifths < 0 && FLAT_ORDER.slice(0, -fifths).includes(step)) return "flat"
  return null
}

export function signatureSteps(clef: Clef, fifths: number) {
  if (fifths > 0) return SHARP_STEPS[clef].slice(0, fifths)
  if (fifths < 0) return FLAT_STEPS[clef].slice(0, -fifths)
  return []
}

export function signatureGlyph(fifths: number): Accidental | null {
  if (fifths > 0) return "sharp"
  if (fifths < 0) return "flat"
  return null
}

export function keyLabel(fifths: number) {
  const names: Record<number, string> = {
    0: "Dó maior",
    1: "Sol maior",
    2: "Ré maior",
    3: "Lá maior",
    [-1]: "Fá maior",
    [-2]: "Si♭ maior",
    [-3]: "Mi♭ maior",
  }
  return names[fifths] ?? "Tonalidade"
}

export function formatPitch(pitch: Pitch, naming: Naming, system: OctaveSystem) {
  const index = STEPS.indexOf(pitch.step)
  const name = naming === "solfege" ? SOLFEGE[index] : LETTERS[index]
  const mark =
    pitch.accidental === "sharp" ? "♯" : pitch.accidental === "flat" ? "♭" : pitch.accidental === "natural" ? "♮" : ""
  const octave = system === "franco" ? pitch.octave - 1 : pitch.octave
  return `${name}${mark} ${octave}`
}

export function formatPitchPlain(pitch: Pitch, naming: Naming, system: OctaveSystem) {
  return formatPitch(pitch, naming, system).replace("♯", " sustenido").replace("♭", " bemol").replace("♮", " bequadro")
}

const PITCH_CLASS: { step: Step; accidental: Accidental | null }[] = [
  { step: "C", accidental: null },
  { step: "C", accidental: "sharp" },
  { step: "D", accidental: null },
  { step: "D", accidental: "sharp" },
  { step: "E", accidental: null },
  { step: "F", accidental: null },
  { step: "F", accidental: "sharp" },
  { step: "G", accidental: null },
  { step: "G", accidental: "sharp" },
  { step: "A", accidental: null },
  { step: "A", accidental: "sharp" },
  { step: "B", accidental: null },
]

export function pitchFromMidi(midi: number): Pitch {
  const pitchClass = ((midi % 12) + 12) % 12
  const spelling = PITCH_CLASS[pitchClass]
  return { step: spelling.step, octave: Math.floor(midi / 12) - 1, accidental: spelling.accidental }
}

export function octaveNumber(scientificOctave: number, system: OctaveSystem) {
  return system === "franco" ? scientificOctave - 1 : scientificOctave
}

export function pitchInRange(pitch: { step: Step; octave: number }, min: Pitch, max: Pitch) {
  const value = diatonic(pitch)
  return value >= diatonic(min) && value <= diatonic(max)
}

export function octavesCovering(step: Step, min: Pitch, max: Pitch) {
  const found: number[] = []
  for (let octave = 1; octave <= 6; octave += 1) {
    if (pitchInRange({ step, octave }, min, max)) found.push(octave)
  }
  return found
}
