import { NextResponse } from 'next/server'
import { mercadoPagoService } from '@/services/MercadoPagoService'

export const dynamic = 'force-dynamic'

/**
 * Webhook oficial de Mercado Pago (recibe notificaciones IPN / Webhooks v1).
 * Documentación: https://www.mercadopago.com.mx/developers/es/docs/your-integrations/notifications/webhooks
 */
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
    // Mercado Pago espera 200 OK para no reintentar indefinidamente si ya registramos el log
    return NextResponse.json({ received: true, warning: err?.message }, { status: 200 })
  }
}
