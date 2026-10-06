"use client"

import { useEffect, useState } from "react"
import { getStorageError } from "@/lib/progress"
import { cn } from "@/lib/utils"
import { BookOpen, ChartNoAxesColumn, Drum, House, Music2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV = [
  { href: "/", label: "Início", icon: House, match: (path: string) => path === "/" },
  { href: "/leitura", label: "Notas", icon: BookOpen, match: (path: string) => path.startsWith("/leitura") },
  { href: "/ritmo", label: "Ritmo", icon: Drum, match: (path: string) => path.startsWith("/ritmo") },
  { href: "/polirritmos", label: "Poli", icon: Music2, match: (path: string) => path.startsWith("/polirritmos") },
  { href: "/progresso", label: "Trilha", icon: ChartNoAxesColumn, match: (path: string) => path.startsWith("/progresso") },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [storageWarning, setStorageWarning] = useState('')
  useEffect(() => {
    const check = () => setStorageWarning(getStorageError())
    check(); window.addEventListener('pauta-storage-error', check)
    return () => window.removeEventListener('pauta-storage-error', check)
  }, [])

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-foreground/10 bg-[#100e0c]/95 px-4 py-6 md:flex">
        <Link href="/" className="px-2">
          <Brand />
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Seções">
          {NAV.map((item) => {
            const active = item.match(pathname)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active ? "bg-brass/15 text-brass" : "text-foreground/75 hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label === "Poli" ? "Polirritmos" : item.label === "Trilha" ? "Sua trilha" : item.label}
              </Link>
            )
          })}
        </nav>
        <p className="px-3 text-xs leading-5 text-muted-foreground">Devagar. O encontro do ciclo importa mais que a velocidade.</p>
      </aside>

      <div className="min-w-0 overflow-x-clip md:pl-60">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-foreground/10 bg-background/90 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/">
            <Brand compact />
          </Link>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 pt-5 pb-28 md:px-8 md:pt-8 md:pb-16">{storageWarning && <p role="alert" className="mb-5 rounded-xl border border-brass bg-card p-4 text-sm">{storageWarning}</p>}{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-foreground/10 bg-[#100e0c]/95 backdrop-blur md:hidden" aria-label="Seções">
        <ul className="grid grid-cols-5">
          {NAV.map((item) => {
            const active = item.match(pathname)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 text-[10px]",
                    active ? "text-brass" : "text-foreground/60",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#14110e" />
      <rect x="1" y="1" width="30" height="30" rx="7" fill="none" stroke="#e0b15a" strokeWidth="1.25" />
      <g fill="none" stroke="#f3ecdf" strokeWidth="1.15" strokeLinecap="round">
        <path d="M5 9h22M5 13h22M5 17h22M5 21h22M5 25h22" />
      </g>
      <circle cx="9" cy="17" r="2.15" fill="none" stroke="#3fafa3" strokeWidth="1.6" />
      <g fill="#e0b15a" stroke="#e0b15a" strokeLinecap="round">
        <ellipse cx="21.2" cy="17" rx="3.15" ry="2.15" transform="rotate(-18 21.2 17)" />
        <path d="M23.7 16.2V7.4" fill="none" strokeWidth="1.45" />
      </g>
    </svg>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <Mark />
      <span>
        <span className="block font-display text-lg leading-none tracking-tight">Pauta</span>
        {compact ? null : <span className="mt-1 block text-xs text-muted-foreground">Leitura e polirritmos</span>}
      </span>
    </span>
  )
}
