import { insforgeAdmin } from '@/lib/insforge-admin'
import {
  consultarPagoMercadoPago,
  crearPreferenciaMercadoPago,
  esTokenSandboxMercadoPago,
  obtenerAccessTokenMercadoPago,
} from '@/lib/mercadopago'

export const PRECIO_PREMIUM_MXN = 59.0
export const DIAS_SUSCRIPCION_PREMIUM = 30

export type ResultadoPreferenciaCheckout = {
  preferenceId: string
  initPoint: string
  mode: 'mercadopago_api' | 'local_sandbox'
}

export type ResultadoVerificacionPago = {
  ok: boolean
  status: 'approved' | 'pending' | 'in_process' | 'rejected'
  esPremium: boolean
  mensaje: string
  paymentId: string
  monto?: number
}

export const mercadoPagoService = {
  async crearSesionCheckout(params: {
    userId: string
    email?: string
    origin?: string
  }): Promise<ResultadoPreferenciaCheckout> {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      params.origin ||
      'http://localhost:3000'

    const accessToken = obtenerAccessTokenMercadoPago()

    if (accessToken) {
      const pref = await crearPreferenciaMercadoPago({
        userId: params.userId,
        email: params.email,
        title: 'BecaBot Plan Premium (30 días)',
        unitPrice: PRECIO_PREMIUM_MXN,
        currencyId: 'MXN',
        baseUrl,
      })

      const usarSandboxUrl = esTokenSandboxMercadoPago(accessToken)
      return {
        preferenceId: pref.id,
        initPoint: usarSandboxUrl ? pref.sandbox_init_point || pref.init_point : pref.init_point,
        mode: 'mercadopago_api',
      }
    }

    const sandboxPrefId = `PREF-SANDBOX-${Date.now()}`
    const query = new URLSearchParams({
      pref_id: sandboxPrefId,
      user_id: params.userId,
      email: params.email ?? '',
      amount: String(PRECIO_PREMIUM_MXN),
    })

    return {
      preferenceId: sandboxPrefId,
      initPoint: `/premium/checkout-sandbox?${query.toString()}`,
      mode: 'local_sandbox',
    }
  },

  async activarSuscripcionEnBaseDeDatos(
    userId: string,
    montoAplicado = PRECIO_PREMIUM_MXN,
    moneda = 'MXN'
  ): Promise<void> {
    await insforgeAdmin.database
      .from('suscripciones')
      .update({ estado: 'cancelada' })
      .eq('id_usuario', userId)
      .eq('estado', 'activa')

    const fechaFin = new Date(
      Date.now() + DIAS_SUSCRIPCION_PREMIUM * 24 * 60 * 60 * 1000
    ).toISOString()

    const { error } = await insforgeAdmin.database.from('suscripciones').insert([
      {
        id_usuario: userId,
        estado: 'activa',
        fecha_fin: fechaFin,
        precio_aplicado: montoAplicado,
        moneda,
      },
    ])

    if (error) {
      throw new Error(`Error activando suscripción en BD: ${error.message}`)
    }
  },

  async verificarYActivarSuscripcion(params: {
    paymentId: string
    userId?: string
    statusHint?: string
  }): Promise<ResultadoVerificacionPago> {
    const cleanPaymentId = params.paymentId.trim()

    if (cleanPaymentId.startsWith('MP-SANDBOX-')) {
      const partes = cleanPaymentId.split('-')
      const codigoTitular = (partes[2] || 'APRO').toUpperCase()
      const uid = params.userId

      if (!uid) {
        throw new Error('Se requiere userId para verificar el pago Sandbox.')
      }

      if (codigoTitular === 'APRO' || params.statusHint === 'approved') {
        await this.activarSuscripcionEnBaseDeDatos(uid, PRECIO_PREMIUM_MXN, 'MXN')
        return {
          ok: true,
          status: 'approved',
          esPremium: true,
          paymentId: cleanPaymentId,
          monto: PRECIO_PREMIUM_MXN,
          mensaje:
            '¡Pago aprobado en Mercado Pago (APRO)! Tu Plan Premium (30 días) ya está activo.',
        }
      }

      if (codigoTitular === 'CONT' || params.statusHint === 'pending' || params.statusHint === 'in_process') {
        return {
          ok: false,
          status: 'in_process',
          esPremium: false,
          paymentId: cleanPaymentId,
          monto: PRECIO_PREMIUM_MXN,
          mensaje:
            'Tu pago en Mercado Pago quedó pendiente de validación (código de prueba: CONT). Tu plan se activará en cuanto se acredite.',
        }
      }

      return {
        ok: false,
        status: 'rejected',
        esPremium: false,
        paymentId: cleanPaymentId,
        monto: PRECIO_PREMIUM_MXN,
        mensaje:
          'El pago fue rechazado por Mercado Pago (código de prueba: FUND — fondos insuficientes). Intenta con otra tarjeta o usa el titular APRO.',
      }
    }
    const pago = await consultarPagoMercadoPago(cleanPaymentId)
    const targetUserId =
      pago.external_reference || pago.metadata?.user_id || params.userId

    if (!targetUserId) {
      throw new Error('El pago de Mercado Pago no contiene external_reference (userId).')
    }

    if (params.userId && pago.external_reference && pago.external_reference !== params.userId) {
      throw new Error('El pago no pertenece al usuario autenticado actual.')
    }

    if (pago.status === 'approved') {
      await this.activarSuscripcionEnBaseDeDatos(
        targetUserId,
        pago.transaction_amount || PRECIO_PREMIUM_MXN,
        pago.currency_id || 'MXN'
      )

      return {
        ok: true,
        status: 'approved',
        esPremium: true,
        paymentId: String(pago.id),
        monto: pago.transaction_amount || PRECIO_PREMIUM_MXN,
        mensaje:
          '¡Pago verificado con éxito en Mercado Pago! Tu Plan Premium (30 días) ya está activo.',
      }
    }

    if (pago.status === 'pending' || pago.status === 'in_process') {
      return {
        ok: false,
        status: pago.status,
        esPremium: false,
        paymentId: String(pago.id),
        monto: pago.transaction_amount,
        mensaje:
          'Tu pago está en proceso de acreditación en Mercado Pago. Se activará automáticamente al confirmarse.',
      }
    }

    return {
      ok: false,
      status: 'rejected',
      esPremium: false,
      paymentId: String(pago.id),
      monto: pago.transaction_amount,
      mensaje: `El pago no pudo ser aprobado por Mercado Pago (estado: ${pago.status_detail || pago.status}).`,
    }
  },
}
