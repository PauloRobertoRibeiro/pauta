import { NoteTrainer } from "@/components/leitura/NoteTrainer"
import { Suspense } from "react"

export default function LeituraPage() {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-muted" />}>
      <NoteTrainer />
    </Suspense>
  )
}
