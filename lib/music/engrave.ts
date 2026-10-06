import { staffStep, signatureSteps } from './pitch'
import { soundingQuarters } from './rhythm'
import type { Clef, Meter, NoteInput } from './types'

export type Glyph = { x: number; y: number; text: string; size: number; music?: boolean }
export type Line = { x1: number; y1: number; x2: number; y2: number; width?: number }
export type Head = { x: number; y: number; hollow: boolean; whole: boolean }
export const SYMBOLS = { treble: '\uE050', bass: '\uE062', sharp: '\uE262', flat: '\uE260', natural: '\uE261' }
const REST = { w: '\uE4E3', h: '\uE4E4', q: '\uE4E5', '8': '\uE4E6', '16': '\uE4E7' }

/** Coordinates use 12px between staff lines; pitches use scientific octaves. */
export function engrave({ clef, time, notes, fifths = 0, measureQuarters = null }: {
  clef: Clef; time?: Meter; notes: NoteInput[]; fifths?: number; measureQuarters?: number | null
}) {
  const positions = notes.map(n => n.pitch ? staffStep(n.pitch, clef) : 4)
  const top = Math.max(68, 34 + Math.max(0, ...positions.map(p => (p - 8) * 6)))
  const bottom = top + 48
  const height = Math.max(bottom + 55, ...positions.map(p => bottom - p * 6 + 42))
  const lines: Line[] = []
  const heads: Head[] = []
  const glyphs: Glyph[] = [{ x: 18, y: clef === 'treble' ? bottom - 12 : bottom - 36, text: SYMBOLS[clef], size: 48, music: true }]
  let left = 66
  for (const p of signatureSteps(clef, fifths)) {
    glyphs.push({ x: left, y: bottom - p * 6, text: fifths > 0 ? SYMBOLS.sharp : SYMBOLS.flat, size: 48, music: true }); left += 14
  }
  if (time) {
    glyphs.push({ x: left + 4, y: top + 21, text: String(time.beats), size: 26 }, { x: left + 4, y: top + 45, text: String(time.beatValue), size: 26 }); left += 36
  }
  left += 20
  const total = notes.reduce((sum, n) => sum + soundingQuarters(n), 0)
  let onset = 0
  const xs = notes.map(n => { const x = left + onset * 110; onset += soundingQuarters(n); return x })
  const width = Math.max(340, left + total * 110 + 20)
  for (let i = 0; i < 5; i++) lines.push({ x1: 10, y1: top + i * 12, x2: width - 10, y2: top + i * 12 })
  lines.push({ x1: width - 14, y1: top, x2: width - 14, y2: bottom, width: 2 })
  let elapsed = 0
  notes.forEach((n, i) => {
    const x = xs[i], p = positions[i], y = bottom - p * 6
    if (i && measureQuarters && Math.abs(elapsed / measureQuarters - Math.round(elapsed / measureQuarters)) < 1e-6) lines.push({ x1: x - 32, y1: top, x2: x - 32, y2: bottom })
    elapsed += soundingQuarters(n)
    if (n.rest) glyphs.push({ x: x - 6, y: bottom - 24, text: REST[n.duration], size: 48, music: true })
    else {
      for (let s = -2; s >= p; s -= 2) lines.push({ x1: x - 12, y1: bottom - s * 6, x2: x + 12, y2: bottom - s * 6 })
      for (let s = 10; s <= p; s += 2) lines.push({ x1: x - 12, y1: bottom - s * 6, x2: x + 12, y2: bottom - s * 6 })
      heads.push({ x, y, hollow: n.duration === 'w' || n.duration === 'h', whole: n.duration === 'w' })
      if (n.accidental) glyphs.push({ x: x - 23, y, text: SYMBOLS[n.accidental], size: 48, music: true })
      if (n.duration !== 'w') {
        const up = p < 4, sx = x + (up ? 6 : -6), end = y + (up ? -36 : 36)
        lines.push({ x1: sx, y1: y, x2: sx, y2: end, width: 1.5 })
        if (n.duration === '8' || n.duration === '16') glyphs.push({ x: sx, y: end, text: n.duration === '8' ? (up ? '\uE240' : '\uE241') : (up ? '\uE242' : '\uE243'), size: 48, music: true })
      }
    }
    for (let d = 0; d < (n.dots ?? 0); d++) glyphs.push({ x: x + 12 + d * 7, y: (n.rest ? bottom - 24 : y) + (p % 2 === 0 ? -3 : 3), text: '·', size: 24 })
  })
  const groups = new Map<string, number[]>()
  notes.forEach((n, i) => { if (n.tuplet) groups.set(n.tuplet.group, [...(groups.get(n.tuplet.group) ?? []), i]) })
  for (const indices of groups.values()) {
    const a = indices[0], b = indices[indices.length - 1], t = notes[a].tuplet!
    const y = Math.min(top - 25, ...indices.map(i => bottom - positions[i] * 6 - 48))
    lines.push({ x1: xs[a] - 9, y1: y + 6, x2: xs[a] - 9, y2: y }, { x1: xs[a] - 9, y1: y, x2: xs[b] + 10, y2: y }, { x1: xs[b] + 10, y1: y, x2: xs[b] + 10, y2: y + 6 })
    glyphs.push({ x: (xs[a] + xs[b]) / 2 - 12, y: y - 5, text: `${t.actual}:${t.normal}`, size: 14 })
  }
  return { width, height, glyphs, lines, heads, positions: xs }
}
