'use client'

import { useEffect, useState } from 'react'
import { subscriptionService } from '@/services/SubscriptionService'
import { authService } from '@/services/AuthService'
import Link from 'next/link'

export const PremiumSimulatorBanner = ({ onStatusChange }: { onStatusChange?: () => void }) => {
  const [loading, setLoading] = useState(false)
  const [esPremium, setEsPremium] = useState(false)
  const [isLogged, setIsLogged] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const checkStatus = async () => {
    const { data } = await authService.obtenerUsuarioActual()
    setIsLogged(!!data?.user?.id)

    if (data?.user?.id) {
      const { esPremium: prem } = await subscriptionService.obtenerEstadoSuscripcion()
      setEsPremium(prem)
    } else {
      setEsPremium(false)
    }
  }

  useEffect(() => {
    checkStatus()

    const handleUpdate = () => checkStatus()
    window.addEventListener('becabot:subscription-updated', handleUpdate)
    return () => window.removeEventListener('becabot:subscription-updated', handleUpdate)
  }, [])

  const handleTogglePremium = async (activar: boolean) => {
    setLoading(true)
    setNotice(null)
    try {
      if (activar) {
        const res = await subscriptionService.activarPremiumDemo(30)
        if (res.ok) {
          setEsPremium(true)
          setNotice('¡Plan Premium activado en modo prueba (30 días)! Ya puedes agendar recordatorios.')
        } else {
          setNotice(res.error || 'Error al activar plan de prueba')
        }
      } else {
        const res = await subscriptionService.desactivarPremiumDemo()
        if (res.ok) {
          setEsPremium(false)
          setNotice('Plan cambiado a Becario Gratuito (modo prueba).')
        } else {
          setNotice(res.error || 'Error al desactivar')
        }
      }
      onStatusChange?.()
    } catch (e: any) {
      setNotice(e.message || 'Error en simulador')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0px_#000000]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md border-2 border-black bg-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
            HERRAMIENTA DE PRUEBAS
          </span>
          <h4 className="font-display text-sm font-black text-black sm:text-base">
            Simulador de Suscripción Premium
          </h4>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-black uppercase tracking-wider ${
            esPremium
              ? 'border-2 border-black bg-black text-white'
              : 'border-2 border-neutral-300 bg-neutral-100 text-neutral-800'
          }`}
        >
          <span
            className={`size-2 rounded-full ${
              esPremium ? 'bg-emerald-400' : 'bg-neutral-500'
            }`}
          />
          {esPremium ? 'Estado: Premium (PRO)' : 'Estado: Becario (Free)'}
        </span>
      </div>

      <p className="mt-3 text-xs font-semibold leading-relaxed text-neutral-700">
        Prueba el flujo completo sin pasarela bancaria. Alterna entre cuentas con 1 clic para validar
        el guardado de recordatorios desde el chat y su visualización en tu perfil.
      </p>

      {!isLogged ? (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-neutral-400 bg-neutral-50 p-3 text-xs font-bold text-neutral-700">
          <span>Inicia sesión para activar el simulador en tu usuario:</span>
          <Link
            href="/login"
            className="rounded-lg border-2 border-black bg-black px-3 py-1 text-xs font-black text-white hover:bg-neutral-800"
          >
            Iniciar sesión →
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {esPremium ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleTogglePremium(false)}
              className="inline-flex h-9 items-center justify-center rounded-xl border-2 border-black bg-white px-4 text-xs font-black text-black shadow-[2px_2px_0px_#000000] hover:bg-neutral-100 disabled:opacity-50"
            >
              {loading ? 'Cambiando…' : 'Cambiar a Plan Becario (Desactivar PRO)'}
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleTogglePremium(true)}
              className="inline-flex h-9 items-center justify-center rounded-xl border-2 border-black bg-black px-4 text-xs font-black text-white shadow-[2px_2px_0px_#000000] hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading ? 'Activando…' : '⚡ Activar Plan Premium (Modo Prueba)'}
            </button>
          )}

          <Link
            href="/asesor"
            className="inline-flex h-9 items-center justify-center rounded-xl border-2 border-dashed border-black px-3.5 text-xs font-black text-black hover:bg-neutral-100"
          >
            Ir a probar en el Asesor →
          </Link>
        </div>
      )}

      {notice && (
        <div className="mt-3 rounded-lg border-2 border-black bg-neutral-100 p-2.5 text-xs font-bold text-black">
          {notice}
        </div>
      )}
    </div>
  )
}
