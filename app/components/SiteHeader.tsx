"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HeaderUserActions } from "./header/HeaderUserActions"
import { authService } from "@/services/AuthService"
import { insforge } from "@/lib/insforge"

export const SiteHeader = () => {
  const pathname = usePathname()
  const isChatPage = pathname === "/asesor"
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    let mounted = true

    const checkPremiumStatus = async () => {
      try {
        const { data } = await authService.obtenerUsuarioActual()
        if (!mounted) return
        if (data?.user?.id) {
          const { data: rpcPremium } = await insforge.database.rpc("es_premium", {
            uid: data.user.id,
          })
          if (mounted) setIsPremium(!!rpcPremium)
        } else {
          if (mounted) setIsPremium(false)
        }
      } catch {
        if (mounted) setIsPremium(false)
      }
    }

    checkPremiumStatus()

    const handleUpdate = () => checkPremiumStatus()
    window.addEventListener("becabot:subscription-updated", handleUpdate)

    return () => {
      mounted = false
      window.removeEventListener("becabot:subscription-updated", handleUpdate)
    }
  }, [pathname])

  const nav = [
    { label: "Inicio", href: "/" },
    { label: "Asesor IA", href: "/asesor" },
    ...(!isPremium ? [{ label: "Planes", href: "/premium" }] : []),
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b-2 border-black bg-white shadow-sm">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link
          href="/"
          aria-label="BecaBot — inicio"
          className="group flex flex-col transition-transform hover:scale-105 active:scale-95"
        >
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-black tracking-tight text-black">
              BecaBot
            </span>
            <span className="rounded-md border border-black bg-black px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
              MÉXICO
            </span>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-600">
            Orientación Oficial
          </span>
        </Link>

        <nav
          aria-label="Principal"
          className="hidden items-center gap-2 md:flex"
        >
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-[14px] font-bold transition-all ${
                  active
                    ? "border-2 border-black bg-black text-white shadow-[2px_2px_0px_rgba(0,0,0,0.3)]"
                    : "border-2 border-transparent text-neutral-800 hover:border-black hover:bg-neutral-100 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3.5">
          <HeaderUserActions />

          {isChatPage ? (
            !isPremium && (
              <Link
                href="/premium"
                className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-black bg-white px-4 text-[13px] font-extrabold text-black shadow-[2px_2px_0px_#000000] transition-all hover:bg-neutral-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <span>Planes Premium</span>
                <span className="text-xs">↗</span>
              </Link>
            )
          ) : (
            <Link
              href="/asesor"
              className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-black bg-black px-5 text-[13.5px] font-extrabold text-white shadow-[3px_3px_0px_#555555] transition-all hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <span>Preguntar al Asesor</span>
              <span>→</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
