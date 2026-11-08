'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/services/AuthService'
import { subscriptionService } from '@/services/SubscriptionService'

type FeedbackPago = {
  tipo: 'approved' | 'pending' | 'rejected'
  mensaje: string
  paymentId?: string
}

function MercadoPagoCheckoutInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [esPremium, setEsPremium] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [creatingPreference, setCreatingPreference] = useState(false)
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackPago | null>(null)

  const verifiedPaymentRef = useRef<string | null>(null)

  const sincronizarEstado = useCallback(async () => {
    try {
      const { data } = await authService.obtenerUsuarioActual()
      if (!data?.user?.id) {
        setUserId(null)
        setUserEmail('')
        setEsPremium(false)
        return null
      }

      setUserId(data.user.id)
      setUserEmail(data.user.email ?? '')

      const estado = await subscriptionService.obtenerEstadoSuscripcion()
      setEsPremium(estado.esPremium)
      return data.user.id
    } catch {
      return null
    } finally {
      setLoadingAuth(false)
    }
  }, [])

  useEffect(() => {
    sincronizarEstado()

    const handleSync = () => {
      sincronizarEstado()
    }
    window.addEventListener('becabot:subscription-updated', handleSync)
    return () => {
      window.removeEventListener('becabot:subscription-updated', handleSync)
    }
  }, [sincronizarEstado])

  useEffect(() => {
    const paymentId =
      searchParams.get('payment_id') || searchParams.get('collection_id')
    const statusParam =
      searchParams.get('status') || searchParams.get('collection_status')

    if (!paymentId || verifiedPaymentRef.current === paymentId) return
    verifiedPaymentRef.current = paymentId

    const verificarRetorno = async () => {
      setVerifyingPayment(true)
      try {
        const uid = userId || (await sincronizarEstado())

        const res = await fetch('/api/payments/mercadopago/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            userId: uid,
            status: statusParam,
          }),
        })

        const data = await res.json()

        if (data.status === 'approved' && data.esPremium) {
          setEsPremium(true)
          setFeedback({
            tipo: 'approved',
            mensaje:
              data.mensaje ||
              '¡Pago acreditado en Mercado Pago! Tu Plan Premium (30 días) ya está activo.',
            paymentId,
          })
          window.dispatchEvent(new Event('becabot:subscription-updated'))
        } else if (data.status === 'pending' || data.status === 'in_process') {
          setFeedback({
            tipo: 'pending',
            mensaje:
              data.mensaje ||
              'Tu pago en Mercado Pago está pendiente de acreditación.',
            paymentId,
          })
        } else {
          setFeedback({
            tipo: 'rejected',
            mensaje:
              data.mensaje ||
              'El pago fue rechazado por Mercado Pago. Intenta nuevamente.',
            paymentId,
          })
        }
      } catch (err: any) {
        setFeedback({
          tipo: 'rejected',
          mensaje: err?.message ?? 'No se pudo verificar el pago con Mercado Pago.',
          paymentId,
        })
      } finally {
        setVerifyingPayment(false)
      }
    }

    verificarRetorno()
  }, [searchParams, userId, sincronizarEstado])

  const iniciarPagoMercadoPago = async () => {
    if (!userId) {
      router.push('/login')
      return
    }

    setCreatingPreference(true)
    setFeedback(null)

    try {
      const res = await fetch('/api/payments/mercadopago/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email: userEmail,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.initPoint) {
        throw new Error(data.error || 'No se pudo iniciar el checkout de Mercado Pago.')
      }

      window.location.href = data.initPoint
    } catch (err: any) {
      setFeedback({
        tipo: 'rejected',
        mensaje: err?.message ?? 'Error al conectar con Mercado Pago.',
      })
      setCreatingPreference(false)
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      {verifyingPayment && (
        <div className="rounded-xl border-2 border-black bg-neutral-100 p-3.5 text-xs font-black text-black shadow-[3px_3px_0px_#000000]">
          ⏳ Verificando estado de tu pago #{verifiedPaymentRef.current} con Mercado Pago…
        </div>
      )}

      {feedback && (
        <div
          className={`rounded-xl border-2 border-black p-3.5 text-xs font-bold shadow-[3px_3px_0px_#000000] ${
            feedback.tipo === 'approved'
              ? 'bg-black text-white'
              : feedback.tipo === 'pending'
                ? 'bg-neutral-100 text-black'
                : 'bg-white text-black'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-black uppercase tracking-wider">
              {feedback.tipo === 'approved'
                ? '✓ Pago Aprobado · Mercado Pago'
                : feedback.tipo === 'pending'
                  ? '⏳ Pago en Validación · Mercado Pago'
                  : '✕ Pago Rechazado · Mercado Pago'}
            </span>
            {feedback.paymentId && (
              <span className="rounded border border-current px-1.5 py-0.5 text-[10px] font-black">
                ID: {feedback.paymentId}
              </span>
            )}
          </div>
          <p className="mt-1.5 leading-relaxed">{feedback.mensaje}</p>
        </div>
      )}

      {loadingAuth ? (
        <div className="inline-flex h-12 w-full items-center justify-center rounded-xl border-2 border-black bg-neutral-100 px-4 text-xs font-black text-neutral-600">
          Comprobando tu cuenta…
        </div>
      ) : esPremium ? (
        <div className="flex flex-col gap-2">
          <Link
            href="/profile"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-black px-4 text-[13.5px] font-black text-white shadow-[4px_4px_0px_#000000] transition-all hover:bg-neutral-800"
          >
            <span className="size-2 rounded-full bg-emerald-400" />
            <span>Tu Plan Premium está Activo · Ver mi Perfil →</span>
          </Link>
        </div>
      ) : userId ? (
        <button
          type="button"
          onClick={iniciarPagoMercadoPago}
          disabled={creatingPreference || verifyingPayment}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-black px-4 text-[14px] font-black text-white shadow-[4px_4px_0px_#000000] transition-all hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60"
        >
          <span>
            {creatingPreference
              ? 'Abriendo Checkout de Mercado Pago…'
              : 'Pagar $59 MXN con Mercado Pago →'}
          </span>
        </button>
      ) : (
        <Link
          href="/login"
          className="inline-flex h-12 w-full items-center justify-center rounded-xl border-2 border-black bg-black px-4 text-[14px] font-black text-white shadow-[4px_4px_0px_#000000] transition-all hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          Inicia sesión para suscribirte con Mercado Pago →
        </Link>
      )}

      <span className="text-center text-[11px] font-bold text-neutral-600">
        Pasarela segura vía <strong className="font-black text-black">Mercado Pago México</strong> (Tarjetas, SPEI y OXXO)
      </span>
    </div>
  )
}

export function MercadoPagoCheckoutButton() {
  return (
    <Suspense
      fallback={
        <div className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl border-2 border-black bg-neutral-100 px-4 text-xs font-black text-black">
          Cargando botón de Mercado Pago…
        </div>
      }
    >
      <MercadoPagoCheckoutInner />
    </Suspense>
  )
}
