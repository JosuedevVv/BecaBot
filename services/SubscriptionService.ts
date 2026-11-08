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
}
