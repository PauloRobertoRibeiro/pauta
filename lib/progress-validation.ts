import type { ProgressState } from './progress'
import { NOTE_LEVELS, RHYTHM_LEVELS, POLY_EXERCISES } from './music/catalog'
const object = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const num = (x: unknown, max = 1e9) => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= max
const count = (x: unknown) => num(x) && Number.isInteger(x)
export function validProgress(x: unknown): x is ProgressState {
  if (!object(x) || !object(x.notes) || !object(x.rhythm) || !object(x.poly) || !object(x.settings)) return false
  const n = x.notes, r = x.rhythm, p = x.poly, s = x.settings
  if (![n.answered,n.correct,n.streak,n.bestStreak,r.attempts,p.listens,p.taps].every(count) || !num(r.bestAccuracy,1)) return false
  if ((n.correct as number) > (n.answered as number) || (n.streak as number) > (n.bestStreak as number)) return false
  if (!object(n.byLevel) || !object(r.byLevel) || !object(p.byExercise)) return false
  if (!Object.entries(n.byLevel).every(([id,v]) => NOTE_LEVELS.some(l => l.id === id) && object(v) && count(v.answered) && count(v.correct) && (v.correct as number) <= (v.answered as number))) return false
  if (!Object.entries(r.byLevel).every(([id,v]) => RHYTHM_LEVELS.some(l => l.id === id) && object(v) && count(v.attempts) && num(v.bestAccuracy,1) && num(v.lastAccuracy,1))) return false
  if (!Object.entries(p.byExercise).every(([id,v]) => POLY_EXERCISES.some(l => l.id === id) && object(v) && count(v.listens) && count(v.taps) && (v.bestAccuracy === null || num(v.bestAccuracy,1)) && (v.bestDeviationMs === null || num(v.bestDeviationMs)))) return false
  return ['solfege','letter'].includes(String(s.naming)) && ['franco','scientific'].includes(String(s.octave)) && NOTE_LEVELS.some(l => l.id === s.noteLevel) && RHYTHM_LEVELS.some(l => l.id === s.rhythmLevel) && POLY_EXERCISES.some(l => l.id === s.polyId) && num(s.rhythmBpm,160) && (s.rhythmBpm as number)>=40 && num(s.polyBpm,160) && (s.polyBpm as number)>=40 && (x.lastHref === null || (typeof x.lastHref === 'string' && /^\/(leitura|ritmo|polirritmos)(\?[a-zA-Z0-9=\-]+)?$/.test(x.lastHref)))
}
