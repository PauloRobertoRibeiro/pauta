"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"

export function Lesson({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <section className={cn("rounded-2xl bg-card ring-1 ring-foreground/10", className)}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{open ? "Fechar" : "Como ler"}</span>
      </button>
      {open ? <div className="px-4 pb-4 text-sm leading-6 text-muted-foreground">{children}</div> : null}
    </section>
  )
}
