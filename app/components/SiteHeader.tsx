"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Seal } from "./Seal"

const nav = [
  { label: "Asesor", href: "/" },
  { label: "Convocatorias", href: "/comming-soon" },
  { label: "Mi perfil", href: "/comming-soon" },
  { label: "Cómo opera", href: "/como-opera" },
]

export const SiteHeader = () => {
  const pathname = usePathname()

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="rule-fade h-px" />

      <div className="flex justify-center px-4 pt-3.5 sm:px-6">
        <div className="pointer-events-auto flex h-11 max-w-full items-center gap-0.5 rounded-full border border-line-soft bg-bg/55 p-1 pl-1.5 shadow-elevated backdrop-blur-xl">
          <Link
            href="/"
            aria-label="BecaBot"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150 hover:bg-surface-2"
          >
            <Seal size={22} />
          </Link>

          <nav className="ml-1 hidden items-center md:flex" aria-label="Principal">
            {nav.map((item) => {
              const active = pathname === item.href

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3 py-1.5 text-[13px] transition-colors duration-150 ${active
                    ? "bg-surface-2 text-text"
                    : "text-tertiary hover:bg-surface-2/60 hover:text-secondary"
                    }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <Link
            href="/premium"
            className="foil-ring foil-ring-lit group ml-0.5 flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium text-accent-deep transition-colors duration-150 hover:bg-surface-2"
          >
            <Seal size={12} />
            Premium
          </Link>
        </div>
      </div>
    </header>
  )
}
