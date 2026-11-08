import { NextResponse } from 'next/server'
import { mercadoPagoService } from '@/services/MercadoPagoService'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, email } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para contratar el Plan Premium.' },
        { status: 400 }
      )
    }

    const origin = new URL(req.url).origin
    const sesion = await mercadoPagoService.crearSesionCheckout({
      userId,
      email,
      origin,
    })

    return NextResponse.json({
      ok: true,
      preferenceId: sesion.preferenceId,
      initPoint: sesion.initPoint,
      mode: sesion.mode,
    })
  } catch (err: any) {
    console.error('[MP Preference API] Error:', err)
    return NextResponse.json(
      { error: err?.message ?? 'No se pudo generar la preferencia de pago en Mercado Pago.' },
      { status: 500 }
    )
  }
}
