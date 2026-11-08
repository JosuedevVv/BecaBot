'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/services/AuthService'
import {
  profileService,
  type PerfilUsuario,
  type SuscripcionUsuario,
  type ConversacionConMensajes,
  type AlertaRecordatorio,
} from '@/services/ProfileService'
import { ProfileIdentityCard } from '../components/profile/ProfileIdentityCard'
import { ProfilePlanCard } from '../components/profile/ProfilePlanCard'
import { ProfileRemindersSection } from '../components/profile/ProfileRemindersSection'
import { ProfileChatsSection } from '../components/profile/ProfileChatsSection'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
  const [suscripcion, setSuscripcion] = useState<SuscripcionUsuario>({
    estado: 'ninguna',
    es_premium: false,
  })
  const [conversaciones, setConversaciones] = useState<ConversacionConMensajes[]>([])
  const [totalMensajes, setTotalMensajes] = useState(0)
  const [alertas, setAlertas] = useState<AlertaRecordatorio[]>([])

  useEffect(() => {
    let active = true

    const loadProfile = async () => {
      try {
        const { data } = await authService.obtenerUsuarioActual()
        if (!active) return

        if (!data?.user) {
          router.replace('/login')
          return
        }

        const uid = data.user.id
        setUserId(uid)

        const result = await profileService.obtenerDatosPerfil(uid, data.user.email)
        if (!active) return

        setPerfil(result.perfil)
        setSuscripcion(result.suscripcion)
        setConversaciones(result.conversaciones)
        setTotalMensajes(result.totalMensajes)
        setAlertas(result.alertas)
      } catch (err) {
        console.error('Error cargando el perfil:', err)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [router])

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-5xl items-center justify-center px-5 py-12">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-black bg-white px-6 py-4 font-black text-black shadow-[4px_4px_0px_#000000]">
          <span className="size-4 animate-spin rounded-xs border-2 border-black border-t-transparent" />
          <span>Cargando expediente de perfil…</span>
        </div>
      </div>
    )
  }

  if (!userId) return null

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-black px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span>EXPEDIENTE DE ESTUDIANTE</span>
          </div>

          <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-black sm:text-4xl">
            Mi Cuenta y Seguimiento de Becas
          </h1>
          <p className="mt-1 text-sm font-semibold text-neutral-700">
            Administra tu información, estado de suscripción, historial de consultas y alertas
            programadas en México.
          </p>
        </div>

        <Link
          href="/asesor"
          className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-black bg-black px-5 text-xs font-black text-white shadow-[3px_3px_0px_#000000] hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <span>Ir al Asesor IA</span>
          <span>→</span>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <ProfileIdentityCard
          perfil={perfil}
          userId={userId}
          onUsernameUpdated={(newUsername) => {
            setPerfil((prev) => (prev ? { ...prev, username: newUsername } : null))
          }}
        />

        <ProfilePlanCard
          suscripcion={suscripcion}
          totalChats={conversaciones.length}
          totalMensajes={totalMensajes}
        />
      </div>

      <div className="mt-8">
        <ProfileRemindersSection
          isPremium={suscripcion.es_premium}
          userId={userId}
          initialAlertas={alertas}
        />
      </div>

      <div className="mt-8">
        <ProfileChatsSection initialConversaciones={conversaciones} />
      </div>
    </main>
  )
}
