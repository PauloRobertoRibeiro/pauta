import { RhythmTrainer } from "@/components/ritmo/RhythmTrainer"
import { Suspense } from "react"

export default function RitmoPage() {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-muted" />}>
      <RhythmTrainer />
    </Suspense>
  )
}
