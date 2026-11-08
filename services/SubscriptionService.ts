import { insforge } from '@/lib/insforge'
import { authService } from './AuthService'

export type EstadoSuscripcion = {
  esPremium: boolean
  estado: string
  fechaFin?: string
  diasRestantes?: number
}

export const subscriptionService = {
  async obtenerEstadoSuscripcion(): Promise<EstadoSuscripcion> {
    try {
      const { data } = await authService.obtenerUsuarioActual()
      if (!data?.user?.id) {
        return { esPremium: false, estado: 'sin_sesion' }
      }

      const uid = data.user.id
      const { data: rpcPrem } = await insforge.database.rpc('es_premium', { uid })
      const esPremium = !!rpcPrem

      const { data: subData } = await insforge.database
        .from('suscripciones')
        .select('estado, fecha_fin')
        .eq('id_usuario', uid)
        .order('created_at', { ascending: false })
        .limit(1)

      const sub = subData?.[0]
      return {
        esPremium,
        estado: sub?.estado || (esPremium ? 'activa' : 'ninguna'),
        fechaFin: sub?.fecha_fin,
      }
    } catch (e) {
      console.error('Error al obtener estado de suscripción:', e)
      return { esPremium: false, estado: 'error' }
    }
  },

  async activarPremiumDemo(dias: number = 30): Promise<{ ok: boolean; error?: string }> {
    try {
      const { data: userAuth } = await authService.obtenerUsuarioActual()
      if (!userAuth?.user?.id) return { ok: false, error: 'Inicia sesión primero' }

      // Llamar al endpoint server-side con credenciales de admin (evita bloqueo RLS)
      const res = await fetch('/api/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userAuth.user.id,
          action: 'activate',
          days: dias,
        }),
      })

      const json = await res.json()
      if (!res.ok || json.error) {
        return { ok: false, error: json.error || 'Error en servidor' }
      }

      // Notificar a componentes en tiempo real
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('becabot:subscription-updated'))
      }

      return { ok: true }
    } catch (e: any) {
      console.error('Error activando premium demo:', e)
      return { ok: false, error: e.message || 'Error desconocido' }
    }
  },

  async desactivarPremiumDemo(): Promise<{ ok: boolean; error?: string }> {
    try {
      const { data: userAuth } = await authService.obtenerUsuarioActual()
      if (!userAuth?.user?.id) return { ok: false, error: 'Inicia sesión primero' }

      const res = await fetch('/api/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userAuth.user.id,
          action: 'deactivate',
        }),
      })

      const json = await res.json()
      if (!res.ok || json.error) {
        return { ok: false, error: json.error || 'Error en servidor' }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('becabot:subscription-updated'))
      }

      return { ok: true }
    } catch (e: any) {
      console.error('Error desactivando premium demo:', e)
      return { ok: false, error: e.message || 'Error desconocido' }
    }
  },
}
