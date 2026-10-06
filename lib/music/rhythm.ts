import {
  WRITTEN_QUARTERS,
  type DurationName,
  type Meter,
  type NoteInput,
  type RhythmEvent,
} from "@/lib/music/types"

export function isCompound(meter: Meter) {
  return meter.beatValue === 8 && meter.beats % 3 === 0
}

export function barQuarters(meter: Meter) {
  return (meter.beats * 4) / meter.beatValue
}

/** Length of one felt beat, in quarter notes. 6/8 feels the dotted quarter. */
export function beatQuarters(meter: Meter) {
  if (isCompound(meter)) return 1.5
  return 4 / meter.beatValue
}

export function beatsPerBar(meter: Meter) {
  return isCompound(meter) ? meter.beats / 3 : meter.beats
}

/** BPM is the felt beat: the quarter in simple meter, the dotted quarter in 6/8. */
export function quarterSeconds(bpm: number, meter: Meter) {
  const beatSec = 60 / bpm
  return beatSec / beatQuarters(meter)
}

export function bpmLabel(meter: Meter) {
  return isCompound(meter) ? "semínima pontuada" : "semínima"
}

export function soundingQuarters(note: Pick<NoteInput, "duration" | "dots" | "tuplet">) {
  const written = WRITTEN_QUARTERS[note.duration] * (2 - 2 ** -(note.dots ?? 0))
  if (!note.tuplet) return written
  return written * (note.tuplet.normal / note.tuplet.actual)
}

const DURATION_BY_SIXTEENTHS: Record<number, { duration: DurationName; dots: number }> = {
  16: { duration: "w", dots: 0 },
  12: { duration: "h", dots: 1 },
  8: { duration: "h", dots: 0 },
  6: { duration: "q", dots: 1 },
  4: { duration: "q", dots: 0 },
  3: { duration: "8", dots: 1 },
  2: { duration: "8", dots: 0 },
  1: { duration: "16", dots: 0 },
}

export function durationFromQuarters(quarters: number) {
  const sixteenths = Math.round(quarters * 4)
  return DURATION_BY_SIXTEENTHS[sixteenths] ?? { duration: "q" as const, dots: 0 }
}

function almost(value: number) {
  return Math.round(value * 1000) / 1000
}

function pickWeighted(options: number[], rng: () => number) {
  const weights = options.map((duration) => 1 / Math.sqrt(duration))
  let cursor = rng() * weights.reduce((sum, weight) => sum + weight, 0)
  for (let index = 0; index < options.length; index += 1) {
    cursor -= weights[index]
    if (cursor <= 0) return options[index]
  }
  return options[options.length - 1]
}

/**
 * Fills one bar without crossing a beat, except for long notes that begin on a beat.
 * Durations are in quarter-note lengths.
 */
/** Deterministic 0..1 sequence. The same seed always rebuilds the same bar. */
export function seededRandom(seed: string) {
  let state = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index)
    state = Math.imul(state, 16777619)
  }
  return () => {
    state = Math.imul(state ^ (state >>> 15), state | 1)
    state ^= state + Math.imul(state ^ (state >>> 7), state | 61)
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296
  }
}

export function generateBar(durations: number[], meter: Meter, allowRests: boolean, rng: () => number = Math.random): RhythmEvent[] {
  const total = barQuarters(meter)
  const beat = beatQuarters(meter)
  const events: RhythmEvent[] = []
  let cursor = 0
  let guard = 0

  while (cursor < total - 0.001 && guard < 48) {
    guard += 1
    const rawInto = cursor % beat
    const intoBeat = rawInto < 0.001 || beat - rawInto < 0.001 ? 0 : almost(rawInto)
    const roomInBeat = almost(intoBeat === 0 ? beat : beat - intoBeat)
    const room = almost(total - cursor)
    const fitting = durations.filter((duration) => {
      if (duration > room + 0.001) return false
      if (duration <= roomInBeat + 0.001) return true
      return intoBeat < 0.001
    })
    const choice = fitting.length > 0 ? pickWeighted(fitting, rng) : Math.min(room, durations[0] ?? room)
    const safe = Math.min(choice, room)
    events.push({ quarters: almost(safe), rest: false })
    cursor = almost(cursor + safe)
  }

  if (allowRests && events.length > 1) {
    for (let index = 0; index < events.length; index += 1) {
      if (rng() < 0.42) events[index].rest = true
    }
    if (events.every((event) => event.rest)) events[0].rest = false
    if (events.every((event) => !event.rest)) {
      const index = 1 + Math.floor(rng() * (events.length - 1))
      events[index].rest = true
    }
  }

  if (!events.some((event) => !event.rest) && events[0]) events[0].rest = false
  return events
}

export function eventsOnsets(events: RhythmEvent[]) {
  const onsets: number[] = []
  let cursor = 0
  for (const event of events) {
    onsets.push(cursor)
    cursor += event.quarters
  }
  return onsets
}

export function tupletLabel(actual: number, normal: number) {
  if (normal === 2) return String(actual)
  if ((actual === 4 && normal === 3) || (actual === 5 && normal === 4) || (actual === 6 && normal === 4)) {
    return String(actual)
  }
  return `${actual}:${normal}`
}
