'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const ESCENARIOS_MP = [
  {
    codigo: 'APRO',
    titulo: 'APRO · Pago Aprobado',
    descripcion: 'Simula acreditación instantánea en Mercado Pago y activa Plan Premium.',
    statusUrl: 'approved',
  },
  {
    codigo: 'FUND',
    titulo: 'FUND · Rechazado por Fondos',
    descripcion: 'Simula tarjeta rechazada por fondos insuficientes.',
    statusUrl: 'rejected',
  },
  {
    codigo: 'CONT',
    titulo: 'CONT · Pago Pendiente',
    descripcion: 'Simula pago en validación manual / pendiente de acreditación.',
    statusUrl: 'in_process',
  },
] as const

function CheckoutSandboxContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const prefId = searchParams.get('pref_id') || 'PREF-SANDBOX'
  const userId = searchParams.get('user_id') || ''
  const email = searchParams.get('email') || 'estudiante@becabot.mx'
  const amount = searchParams.get('amount') || '59.00'

  const [cardNumber, setCardNumber] = useState('4009 1956 3222 177')
  const [expiry, setExpiry] = useState('11/28')
  const [cvv, setCvv] = useState('123')
  const [cardholder, setCardholder] = useState<'APRO' | 'FUND' | 'CONT'>('APRO')
  const [processing, setProcessing] = useState(false)

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    const escenario =
      ESCENARIOS_MP.find((item) => item.codigo === cardholder) ?? ESCENARIOS_MP[0]

    const paymentId = `MP-SANDBOX-${escenario.codigo}-${Date.now()}`
    const returnParams = new URLSearchParams({
      mp_return: '1',
      status: escenario.statusUrl,
      collection_status: escenario.statusUrl,
      payment_id: paymentId,
      preference_id: prefId,
      external_reference: userId,
    })

    setTimeout(() => {
      router.push(`/premium?${returnParams.toString()}`)
    }, 650)
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-10 md:py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/premium"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3.5 py-2 text-xs font-black text-black shadow-[3px_3px_0px_#000000] transition-all hover:bg-black hover:text-white"
        >
          <span>←</span>
          <span>Cancelar y volver a BecaBot</span>
        </Link>

        <span className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-black px-3 py-1 text-[10.5px] font-black uppercase tracking-wider text-white">
          <span className="size-2 rounded-full bg-emerald-400" />
          <span>MERCADO PAGO · SANDBOX DE PRUEBA (MXN)</span>
        </span>
      </div>

      <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] sm:p-8">
        {/* Encabezado de Resumen de Compra */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-5">
          <div>
            <span className="rounded border-2 border-black bg-neutral-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
              Checkout Pro · México
            </span>
            <h1 className="mt-2 font-display text-2xl font-black text-black sm:text-3xl">
              BecaBot Plan Premium (30 días)
            </h1>
            <p className="mt-1 text-xs font-bold text-neutral-600">
              Comprador: <span className="text-black">{email}</span> · Ref:{' '}
              <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px]">
                {prefId}
              </code>
            </p>
          </div>

          <div className="rounded-xl border-2 border-black bg-neutral-50 px-4 py-3 text-right shadow-[3px_3px_0px_#000000]">
            <span className="block text-[10px] font-black uppercase tracking-wider text-neutral-600">
              Total a pagar
            </span>
            <span className="font-display text-3xl font-black text-black">
              ${amount} <span className="text-sm font-bold">MXN</span>
            </span>
          </div>
        </div>

        {/* Selector de Escenarios Oficiales de Mercado Pago */}
        <div className="mt-6">
          <p className="text-xs font-black uppercase tracking-wider text-black">
            1. Elige el código de titular de prueba de Mercado Pago:
          </p>
          <p className="mt-1 text-xs font-semibold text-neutral-600">
            En Mercado Pago Sandbox, el nombre del titular de la tarjeta determina la respuesta del procesador (`APRO`, `FUND` o `CONT`).
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {ESCENARIOS_MP.map((esc) => {
              const activo = cardholder === esc.codigo
              return (
                <button
                  key={esc.codigo}
                  type="button"
                  onClick={() => setCardholder(esc.codigo)}
                  className={`flex flex-col justify-between rounded-xl border-2 border-black p-3.5 text-left transition-all ${
                    activo
                      ? 'bg-black text-white shadow-[3px_3px_0px_#737373]'
                      : 'bg-white text-black shadow-[3px_3px_0px_#000000] hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">{esc.titulo}</span>
                    {activo && (
                      <span className="rounded bg-emerald-400 px-1.5 py-0.5 text-[9px] font-black text-black">
                        ACTIVO
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-2 text-[11px] font-semibold leading-snug ${
                      activo ? 'text-neutral-200' : 'text-neutral-600'
                    }`}
                  >
                    {esc.descripcion}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Formulario de Tarjeta de Prueba */}
        <form onSubmit={handlePay} className="mt-6 border-t-2 border-neutral-200 pt-6">
          <p className="mb-3 text-xs font-black uppercase tracking-wider text-black">
            2. Datos de la tarjeta de prueba (Visa / Mastercard México):
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-black">
                Número de tarjeta de prueba
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border-2 border-black bg-neutral-50 px-3.5 py-2.5 text-sm font-black text-black focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-black">
                Vencimiento (MM/AA)
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border-2 border-black bg-neutral-50 px-3.5 py-2.5 text-sm font-black text-black focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-black">
                Código de seguridad (CVV)
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border-2 border-black bg-neutral-50 px-3.5 py-2.5 text-sm font-black text-black focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-black">
                Nombre del titular (Código de estado de Mercado Pago)
              </label>
              <input
                type="text"
                value={cardholder}
                readOnly
                className="mt-1.5 w-full rounded-xl border-2 border-black bg-neutral-100 px-3.5 py-2.5 text-sm font-black text-black"
              />
            </div>
          </div>

          <div className="mt-5 rounded-xl border-2 border-dashed border-black bg-neutral-50 p-3.5 text-xs font-semibold text-neutral-700">
            <strong className="font-black text-black">Nota de entorno:</strong> Si configuras{' '}
            <code className="rounded bg-white px-1 font-bold text-black">
              MP_ACCESS_TOKEN=&quot;TEST-...&quot;
            </code>{' '}
            en tu <code className="rounded bg-white px-1 font-bold text-black">.env.local</code>, el botón te enviará directamente a{' '}
            <code className="rounded bg-white px-1 font-bold text-black">
              sandbox.mercadopago.com.mx
            </code>
            . Ambos flujos regresan a{' '}
            <code className="rounded bg-white px-1 font-bold text-black">
              /api/payments/mercadopago/verify
            </code>{' '}
            para activar tu suscripción en PostgreSQL.
          </div>

          <button
            type="submit"
            disabled={processing}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-black px-5 text-sm font-black text-white shadow-[4px_4px_0px_#000000] transition-all hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60"
          >
            {processing
              ? 'Procesando pago y redirigiendo a BecaBot…'
              : `Pagar $${amount} MXN en Mercado Pago (Titular: ${cardholder}) →`}
          </button>
        </form>
      </div>
    </section>
  )
}

export default function CheckoutSandboxPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-5 py-16 text-center text-sm font-black text-black">
          Cargando pasarela de prueba Mercado Pago…
        </div>
      }
    >
      <CheckoutSandboxContent />
    </Suspense>
  )
}
