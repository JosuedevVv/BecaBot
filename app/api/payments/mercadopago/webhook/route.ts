import { NextResponse } from 'next/server'
import { mercadoPagoService } from '@/services/MercadoPagoService'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const body = await req.json().catch(() => ({}))

    const type = body?.type || searchParams.get('type') || searchParams.get('topic')
    const paymentId =
      body?.data?.id || searchParams.get('data.id') || searchParams.get('id')

    if ((type === 'payment' || body?.action?.startsWith('payment.')) && paymentId) {
      await mercadoPagoService.verificarYActivarSuscripcion({
        paymentId: String(paymentId),
      })
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err: any) {
    console.error('[MP Webhook] Error procesando notificación:', err)
    return NextResponse.json({ received: true, warning: err?.message }, { status: 200 })
  }
}
