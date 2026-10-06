export type TapMatch = {
  expected: number
  tap: number | null
  /** Tap time minus expected time. Negative means early. */
  delta: number | null
  onTime: boolean
}

export type TapScore = {
  matches: TapMatch[]
  extras: number[]
  onTime: number
  expected: number
  /** 0–1, extras count against the player. */
  accuracy: number
  meanAbsMs: number | null
}

/**
 * Matches expected onsets and taps in time order, maximizing correct matches.
 * Taps inside `windowSec` are "no tempo". Slightly wider misses still attach
 * so the feedback can say early or late instead of pretending the note vanished.
 */
export function scoreTaps(expected: number[], taps: number[], windowSec: number): TapScore {
  // Global monotone matching: first maximize on-time taps, then attachments,
  // then minimize deviation. A late tap must not steal the next correct note.
  expected = [...expected].sort((a,b) => a-b)
  taps = [...taps].sort((a,b) => a-b)
  type Cell = { on: number; matched: number; cost: number; action: 'tap' | 'note' | 'match' | 'end' }
  const rows = expected.length + 1, cols = taps.length + 1
  const table: Cell[][] = Array.from({length: rows}, () => Array.from({length: cols}, () => ({ on: 0, matched: 0, cost: 0, action: 'end' })))
  const better = (a: Cell, b: Cell) => a.on > b.on || (a.on === b.on && (a.matched > b.matched || (a.matched === b.matched && a.cost < b.cost)))
  for (let i = expected.length; i >= 0; i--) for (let j = taps.length; j >= 0; j--) {
    if (i === expected.length && j === taps.length) continue
    let best: Cell = i < expected.length ? { ...table[i+1][j], action: 'note' } : { ...table[i][j+1], action: 'tap' }
    if (j < taps.length) { const c: Cell = { ...table[i][j+1], action: 'tap' }; if (better(c,best)) best = c }
    if (i < expected.length && j < taps.length) {
      const distance = Math.abs(expected[i]-taps[j])
      if (distance <= windowSec * 1.85) {
        const tail = table[i+1][j+1]
        const c: Cell = { on: tail.on + (distance <= windowSec ? 1 : 0), matched: tail.matched+1, cost: tail.cost+distance, action: 'match' }
        if (better(c,best)) best = c
      }
    }
    table[i][j] = best
  }
  const used = new Set<number>(), matches: TapMatch[] = []
  let i = 0, j = 0
  while (i < expected.length || j < taps.length) {
    const action = table[i][j].action
    if (action === 'match') {
      const delta = taps[j]-expected[i]
      matches.push({ expected: expected[i], tap: taps[j], delta, onTime: Math.abs(delta)<=windowSec }); used.add(j); i++; j++
    } else if (action === 'note') { matches.push({ expected: expected[i], tap: null, delta: null, onTime: false }); i++ }
    else if (action === 'tap') j++
    else break
  }

  const extras = taps.filter((_, index) => !used.has(index))
  const onTime = matches.filter((match) => match.onTime).length
  const denominator = expected.length + extras.length
  const attached = matches.filter((match) => match.delta !== null)
  const meanAbsMs = attached.length
    ? (attached.reduce((sum, match) => sum + Math.abs(match.delta ?? 0), 0) / attached.length) * 1000
    : null

  return {
    matches,
    extras,
    onTime,
    expected: expected.length,
    accuracy: denominator === 0 ? 1 : onTime / denominator,
    meanAbsMs,
  }
}

export function timingWindow(beatSec: number) {
  return Math.min(0.14, Math.max(0.07, beatSec * 0.16))
}

export function timingWords(delta: number | null) {
  if (delta === null) return "faltou"
  if (Math.abs(delta) < 0.02) return "no tempo"
  return delta < 0 ? "cedo" : "atrasado"
}
