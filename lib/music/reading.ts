import type { NoteLevel } from "@/lib/music/catalog"
import { diatonic, fromDiatonic, octavesCovering, signatureAccidental, toMidi } from "@/lib/music/pitch"
import type { Accidental, Clef, Pitch, Step } from "@/lib/music/types"

const SHARPABLE: Step[] = ["C", "D", "F", "G", "A"]
const FLATABLE: Step[] = ["D", "E", "G", "A", "B"]

export type ReadingNote = {
  clef: Clef
  fifths: number
  written: Pitch
  sounding: Pitch
}

function pick<T>(items: T[], rng: () => number) {
  return items[Math.floor(rng() * items.length)]
}

/** Same note on the server and in the browser, so the staff is visible before hydration. */
export function openingReadingNote(level: NoteLevel): ReadingNote {
  const clef = level.clefs[0] ?? "treble"
  const range = level.range[clef]
  const fifths = level.keys[0] ?? 0
  if (!range) {
    const pitch = { step: "G" as const, octave: 4, accidental: null }
    return { clef, fifths: 0, written: pitch, sounding: pitch }
  }
  const min = diatonic(range.min)
  const max = diatonic(range.max)
  let pitch = fromDiatonic(Math.floor((min + max) / 2))
  let accidental: Accidental | null = null
  if (level.accidentals) {
    for (let value = min; value <= max; value += 1) {
      const candidate = fromDiatonic(value)
      if (candidate.step === "F" || candidate.step === "C" || candidate.step === "G") {
        pitch = candidate
        accidental = "sharp"
        break
      }
    }
  }
  const sounding = accidental ?? signatureAccidental(pitch.step, fifths)
  return {
    clef,
    fifths,
    written: { step: pitch.step, octave: pitch.octave, accidental },
    sounding: { step: pitch.step, octave: pitch.octave, accidental: sounding },
  }
}

export function randomReadingNote(level: NoteLevel, previous: ReadingNote | null, rng: () => number = Math.random): ReadingNote {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const clef = pick(level.clefs, rng)
    const range = level.range[clef]
    if (!range) continue
    const fifths = pick(level.keys, rng)
    let step: Step
    let octave: number
    let accidental: Accidental | null = null

    if (level.accidentals) {
      const sharp = rng() < 0.5
      step = pick(sharp ? SHARPABLE : FLATABLE, rng)
      const octaves = octavesCovering(step, range.min, range.max)
      if (octaves.length === 0) continue
      octave = pick(octaves, rng)
      accidental = sharp ? "sharp" : "flat"
    } else {
      const min = diatonic(range.min)
      const max = diatonic(range.max)
      const value = min + Math.floor(rng() * (max - min + 1))
      const pitch = fromDiatonic(value)
      step = pitch.step
      octave = pitch.octave
    }

    const soundingAccidental = accidental ?? signatureAccidental(step, fifths)
    const note: ReadingNote = {
      clef,
      fifths,
      written: { step, octave, accidental },
      sounding: { step, octave, accidental: soundingAccidental },
    }
    if (previous && previous.clef === note.clef && toMidi(previous.sounding) === toMidi(note.sounding)) continue
    return note
  }

  return {
    clef: "treble",
    fifths: 0,
    written: { step: "G", octave: 4, accidental: null },
    sounding: { step: "G", octave: 4, accidental: null },
  }
}
