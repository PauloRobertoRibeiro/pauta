"use client"

import { validProgress } from "./progress-validation"
import type { Naming, OctaveSystem } from "@/lib/music/types"
import { useSyncExternalStore } from "react"

export type LevelScore = { answered: number; correct: number }
export type RhythmScore = { attempts: number; bestAccuracy: number; lastAccuracy: number }
export type PolyScore = {
  listens: number
  taps: number
  bestAccuracy: number | null
  bestDeviationMs: number | null
}

export type ProgressState = {
  notes: {
    answered: number
    correct: number
    streak: number
    bestStreak: number
    byLevel: Record<string, LevelScore>
  }
  rhythm: {
    attempts: number
    bestAccuracy: number
    byLevel: Record<string, RhythmScore>
  }
  poly: {
    listens: number
    taps: number
    byExercise: Record<string, PolyScore>
  }
  settings: {
    naming: Naming
    octave: OctaveSystem
    noteLevel: string
    rhythmLevel: string
    polyId: string
    rhythmBpm: number
    polyBpm: number
  }
  lastHref: string | null
}

const KEY = "pauta-progress-v1"

export const EMPTY_PROGRESS: ProgressState = {
  notes: { answered: 0, correct: 0, streak: 0, bestStreak: 0, byLevel: {} },
  rhythm: { attempts: 0, bestAccuracy: 0, byLevel: {} },
  poly: { listens: 0, taps: 0, byExercise: {} },
  settings: {
    naming: "solfege",
    octave: "franco",
    noteLevel: "sol-centro",
    rhythmLevel: "seminimas",
    polyId: "3-2",
    rhythmBpm: 72,
    polyBpm: 56,
  },
  lastHref: null,
}

let cache: ProgressState = EMPTY_PROGRESS
let loaded = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function normalize(value: unknown): ProgressState {
  if (!validProgress(value)) throw new Error("Progresso inválido")
  return structuredClone(value)
}
let storageError = ''
export function getStorageError() { return storageError }
function warnStorage() {
  storageError = 'Não foi possível ler ou salvar o progresso neste navegador. Exporte uma cópia na Trilha antes de fechar.'
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('pauta-storage-error'))
}
export function restoreProgress(value: unknown) {
  if (!validProgress(value)) throw new Error('Arquivo de progresso inválido ou incompatível.')
  write(structuredClone(value))
}

export function readProgress() {
  if (typeof window === "undefined") return EMPTY_PROGRESS
  if (!loaded) {
    loaded = true
    try {
      const raw = window.localStorage.getItem(KEY)
      cache = raw ? normalize(JSON.parse(raw)) : structuredClone(EMPTY_PROGRESS)
    } catch {
      cache = structuredClone(EMPTY_PROGRESS)
      warnStorage()
    }
  }
  return cache
}

function write(next: ProgressState) {
  cache = next
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(KEY, JSON.stringify(next)) } catch { warnStorage() }
  }
  emit()
}

function draft(): ProgressState {
  return structuredClone(readProgress())
}

export function recordNote(levelId: string, correct: boolean) {
  const next = draft()
  next.notes.answered += 1
  next.notes.streak = correct ? next.notes.streak + 1 : 0
  next.notes.bestStreak = Math.max(next.notes.bestStreak, next.notes.streak)
  if (correct) next.notes.correct += 1
  const level = next.notes.byLevel[levelId] ?? { answered: 0, correct: 0 }
  level.answered += 1
  if (correct) level.correct += 1
  next.notes.byLevel[levelId] = level
  next.lastHref = `/leitura?nivel=${levelId}`
  next.settings.noteLevel = levelId
  write(next)
}

export function recordRhythm(levelId: string, accuracy: number) {
  const next = draft()
  next.rhythm.attempts += 1
  next.rhythm.bestAccuracy = Math.max(next.rhythm.bestAccuracy, accuracy)
  const level = next.rhythm.byLevel[levelId] ?? { attempts: 0, bestAccuracy: 0, lastAccuracy: 0 }
  level.attempts += 1
  level.lastAccuracy = accuracy
  level.bestAccuracy = Math.max(level.bestAccuracy, accuracy)
  next.rhythm.byLevel[levelId] = level
  next.lastHref = `/ritmo?nivel=${levelId}`
  next.settings.rhythmLevel = levelId
  write(next)
}

export function recordListen(exerciseId: string) {
  const next = draft()
  next.poly.listens += 1
  const item = next.poly.byExercise[exerciseId] ?? { listens: 0, taps: 0, bestAccuracy: null, bestDeviationMs: null }
  item.listens += 1
  next.poly.byExercise[exerciseId] = item
  next.lastHref = `/polirritmos?ex=${exerciseId}`
  next.settings.polyId = exerciseId
  write(next)
}

export function recordTap(exerciseId: string, accuracy: number, deviationMs: number | null) {
  const next = draft()
  next.poly.taps += 1
  const item = next.poly.byExercise[exerciseId] ?? { listens: 0, taps: 0, bestAccuracy: null, bestDeviationMs: null }
  item.taps += 1
  item.bestAccuracy = item.bestAccuracy === null ? accuracy : Math.max(item.bestAccuracy, accuracy)
  if (deviationMs !== null) {
    item.bestDeviationMs = item.bestDeviationMs === null ? deviationMs : Math.min(item.bestDeviationMs, deviationMs)
  }
  next.poly.byExercise[exerciseId] = item
  next.lastHref = `/polirritmos?ex=${exerciseId}`
  next.settings.polyId = exerciseId
  write(next)
}

export function updateSettings(partial: Partial<ProgressState["settings"]>) {
  const next = draft()
  next.settings = { ...next.settings, ...partial }
  write(next)
}

export function rememberHref(href: string) {
  const next = draft()
  next.lastHref = href
  write(next)
}

export function resetProgress() {
  const settings = readProgress().settings
  write({ ...structuredClone(EMPTY_PROGRESS), settings })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useProgress() {
  return useSyncExternalStore(subscribe, readProgress, () => EMPTY_PROGRESS)
}

export function accuracyOf(answered: number, correct: number) {
  if (answered === 0) return 0
  return correct / answered
}
