import { NextResponse } from 'next/server'
import { mercadoPagoService } from '@/services/MercadoPagoService'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { paymentId, userId, status } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Falta el identificador de pago (paymentId).' },
        { status: 400 }
      )
    }

    const resultado = await mercadoPagoService.verificarYActivarSuscripcion({
      paymentId: String(paymentId),
      userId,
      statusHint: status,
    })

    return NextResponse.json(resultado)
  } catch (err: any) {
    console.error('[MP Verify API] Error:', err)
    return NextResponse.json(
      {
        ok: false,
        status: 'rejected',
        esPremium: false,
        mensaje: err?.message ?? 'Error al verificar el pago con Mercado Pago.',
      },
      { status: 500 }
    )
  }
}
