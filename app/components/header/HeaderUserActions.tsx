'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { authService } from '@/services/AuthService'
import { insforge } from '@/lib/insforge'

export const HeaderUserActions = () => {
  const pathname = usePathname()
  const isProfilePage = pathname === '/profile'
  const isLoginPage = pathname === '/login' || pathname === '/signup'

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [username, setUsername] = useState<string>('')
  const [isPremium, setIsPremium] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      try {
        const { data } = await authService.obtenerUsuarioActual()
        if (!mounted) return

        if (data?.user) {
          setUser({ id: data.user.id, email: data.user.email })
          
          try {
            const { data: userData } = await insforge.database
              .from('usuarios')
              .select('username')
              .eq('id_usuario', data.user.id)
              .maybeSingle()

            if (mounted && userData?.username) {
              setUsername(userData.username)
            } else if (mounted && data.user.email) {
              setUsername(data.user.email.split('@')[0])
            }
          } catch {
            if (mounted && data.user.email) {
              setUsername(data.user.email.split('@')[0])
            }
          }

          try {
            const { data: rpcPremium } = await insforge.database.rpc('es_premium', {
              uid: data.user.id,
            })
            if (mounted) setIsPremium(!!rpcPremium)
          } catch {
          }
        } else {
          setUser(null)
        }
      } catch {
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    checkAuth()

    const handleUpdate = () => checkAuth()
    window.addEventListener('becabot:subscription-updated', handleUpdate)

    return () => {
      mounted = false
      window.removeEventListener('becabot:subscription-updated', handleUpdate)
    }
  }, [pathname])

  if (loading) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-full border-2 border-black bg-neutral-100" />
    )
  }

  if (user) {
    return (
      <Link
        href="/profile"
        aria-label="Ir a mi perfil"
        className={`inline-flex h-10 items-center gap-2 rounded-full border-2 border-black px-4 text-[13px] font-black transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
          isProfilePage
            ? 'bg-black text-white shadow-[2px_2px_0px_rgba(0,0,0,0.3)]'
            : 'bg-white text-black shadow-[2px_2px_0px_#000000] hover:bg-neutral-100'
        }`}
      >
        <span className="size-2 rounded-full bg-emerald-500" />
        <span className="max-w-[120px] truncate sm:max-w-[160px]">
          {username ? `@${username}` : 'Mi Perfil'}
        </span>
        {isPremium && (
          <span className="rounded bg-black px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider text-white">
            PRO
          </span>
        )}
      </Link>
    )
  }

  if (isLoginPage) {
    return null
  }

  return (
    <Link
      href="/login"
      className="text-[14px] font-bold text-neutral-800 transition-colors hover:text-black hover:underline"
    >
      Iniciar sesión
    </Link>
  )
}
