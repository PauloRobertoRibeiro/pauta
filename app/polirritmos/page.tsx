import { PolyrhythmLab } from "@/components/poly/PolyrhythmLab"
import { Suspense } from "react"

export default function PolirritmosPage() {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-muted" />}>
      <PolyrhythmLab />
    </Suspense>
  )
}
