import dns from 'node:dns'
import crypto from 'node:crypto'

dns.setDefaultResultOrder('ipv4first')

const MP_API_BASE = 'https://api.mercadopago.com'

export type CrearPreferenciaInput = {
  userId: string
  email?: string
  title: string
  unitPrice: number
  currencyId?: 'MXN'
  baseUrl: string
}

export type PreferenciaMercadoPagoResponse = {
  id: string
  init_point: string
  sandbox_init_point: string
}

export type PagoMercadoPagoResponse = {
  id: number | string
  status: 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled'
  status_detail?: string
  transaction_amount: number
  currency_id: string
  external_reference?: string
  metadata?: {
    user_id?: string
    plan?: string
  }
}

export function obtenerAccessTokenMercadoPago(): string | null {
  const token = process.env.MP_ACCESS_TOKEN?.trim()
  if (!token || token === 'tu_access_token_aqui') return null
  return token
}

export function esTokenSandboxMercadoPago(token: string): boolean {
  return token.startsWith('TEST-') || process.env.MP_SANDBOX === 'true'
}

export async function crearPreferenciaMercadoPago(
  input: CrearPreferenciaInput
): Promise<PreferenciaMercadoPagoResponse> {
  const accessToken = obtenerAccessTokenMercadoPago()
  if (!accessToken) {
    throw new Error('MP_ACCESS_TOKEN no está configurado en .env.local')
  }

  const cleanBaseUrl = input.baseUrl.replace(/\/$/, '')
  const esHttpsPublico =
    cleanBaseUrl.startsWith('https://') &&
    !cleanBaseUrl.includes('localhost') &&
    !cleanBaseUrl.includes('127.0.0.1')

  const payload: Record<string, unknown> = {
    items: [
      {
        id: 'becabot-premium-mensual',
        title: input.title,
        description:
          'Suscripción mensual BecaBot Premium (30 días): alertas por correo y consultas ilimitadas.',
        quantity: 1,
        currency_id: input.currencyId ?? 'MXN',
        unit_price: Number(input.unitPrice),
      },
    ],
    ...(esHttpsPublico && input.email ? { payer: { email: input.email } } : {}),
    external_reference: input.userId,
    metadata: {
      user_id: input.userId,
      plan: 'premium_mensual',
      payment_provider: 'mercadopago',
    },
    back_urls: {
      success: `${cleanBaseUrl}/premium?mp_return=1`,
      failure: `${cleanBaseUrl}/premium?mp_return=1`,
      pending: `${cleanBaseUrl}/premium?mp_return=1`,
    },
    ...(esHttpsPublico ? { auto_return: 'approved' } : {}),
    statement_descriptor: 'BECABOT MX',
  }

  const res = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Mercado Pago (/checkout/preferences) respondió ${res.status}: ${errorText}`)
  }

  const data = (await res.json()) as PreferenciaMercadoPagoResponse
  return data
}

export async function consultarPagoMercadoPago(
  paymentId: string
): Promise<PagoMercadoPagoResponse> {
  const accessToken = obtenerAccessTokenMercadoPago()
  if (!accessToken) {
    throw new Error('MP_ACCESS_TOKEN no está configurado en .env.local')
  }

  const res = await fetch(`${MP_API_BASE}/v1/payments/${encodeURIComponent(paymentId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Mercado Pago (/v1/payments/${paymentId}) respondió ${res.status}: ${errorText}`)
  }

  return (await res.json()) as PagoMercadoPagoResponse
}
