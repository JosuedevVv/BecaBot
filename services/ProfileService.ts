import { insforge } from '@/lib/insforge'

export type PerfilUsuario = {
  id_usuario: string
  username: string
  email: string
  created_at?: string
}

export type SuscripcionUsuario = {
  id_suscripcion?: string
  estado: 'activa' | 'cancelada' | 'vencida' | 'ninguna'
  fecha_inicio?: string
  fecha_fin?: string
  precio_aplicado?: number
  moneda?: string
  es_premium: boolean
}

export type ConversacionConMensajes = {
  id_conversacion: string
  title: string
  fecha: string
  mensajes_count: number
  mensajes?: Array<{
    id_mensaje: string
    mensaje: string
    tipo: 'user' | 'assistant'
    created_at: string
  }>
}

export type AlertaRecordatorio = {
  id_alerta: string
  id_beca: string
  nombre_beca: string
  grado_academico?: string
  fecha_expiracion?: string
  dias_antes: number[]
  canal: string
  activa: boolean
  estado_postulacion?: string
  created_at: string
}

export const profileService = {
  async obtenerDatosPerfil(userId: string, emailFallback?: string): Promise<{
    perfil: PerfilUsuario | null
    suscripcion: SuscripcionUsuario
    conversaciones: ConversacionConMensajes[]
    totalMensajes: number
    alertas: AlertaRecordatorio[]
  }> {
    // 1. Perfil de usuario (public.usuarios)
    let perfil: PerfilUsuario | null = null
    try {
      const { data, error } = await insforge.database
        .from('usuarios')
        .select('*')
        .eq('id_usuario', userId)
        .single()

      if (!error && data) {
        perfil = data as PerfilUsuario
      } else if (emailFallback) {
        // Autosanación si no existe la fila aún
        const defaultUsername = emailFallback.split('@')[0] || 'estudiante'
        const { data: nuevo, error: errInsert } = await insforge.database
          .from('usuarios')
          .insert([{ id_usuario: userId, username: defaultUsername, email: emailFallback }])
          .select()
          .single()

        if (!errInsert && nuevo) {
          perfil = nuevo as PerfilUsuario
        }
      }
    } catch (e) {
      console.error('Error al consultar perfil:', e)
    }

    // 2. Suscripción y es_premium
    let esPremium = false
    let suscripcion: SuscripcionUsuario = {
      estado: 'ninguna',
      es_premium: false,
    }

    try {
      const { data: rpcPremium } = await insforge.database.rpc('es_premium', { uid: userId })
      esPremium = !!rpcPremium

      const { data: subData } = await insforge.database
        .from('suscripciones')
        .select('*')
        .eq('id_usuario', userId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (subData && subData.length > 0) {
        const sub = subData[0]
        suscripcion = {
          id_suscripcion: sub.id_suscripcion,
          estado: sub.estado,
          fecha_inicio: sub.fecha_inicio,
          fecha_fin: sub.fecha_fin,
          precio_aplicado: sub.precio_aplicado,
          moneda: sub.moneda,
          es_premium: esPremium || sub.estado === 'activa',
        }
      } else {
        suscripcion.es_premium = esPremium
      }
    } catch (e) {
      console.error('Error al consultar suscripción:', e)
    }

    // 3. Conversaciones y mensajes
    let conversaciones: ConversacionConMensajes[] = []
    let totalMensajes = 0

    try {
      const { data: convData } = await insforge.database
        .from('conversaciones')
        .select('*')
        .eq('id_usuario', userId)
        .order('fecha', { ascending: false })

      if (convData && convData.length > 0) {
        const convIds = convData.map((c: any) => c.id_conversacion)
        const { data: msgData } = await insforge.database
          .from('mensajes')
          .select('id_mensaje, id_conversacion, mensaje, tipo, created_at')
          .in('id_conversacion', convIds)
          .order('created_at', { ascending: true })

        totalMensajes = msgData?.length || 0

        conversaciones = convData.map((c: any) => {
          const msgs = (msgData || []).filter((m: any) => m.id_conversacion === c.id_conversacion)
          return {
            id_conversacion: c.id_conversacion,
            title: c.title || 'Consulta de becas',
            fecha: c.fecha || c.created_at,
            mensajes_count: msgs.length,
            mensajes: msgs,
          }
        })
      }
    } catch (e) {
      console.error('Error al consultar conversaciones:', e)
    }

    // 4. Alertas y postulaciones (exclusivo / relevante para premium)
    let alertas: AlertaRecordatorio[] = []
    try {
      const { data: alertData } = await insforge.database
        .from('alertas_beca')
        .select(`
          id_alerta,
          id_beca,
          dias_antes,
          canal,
          activa,
          created_at,
          becas:id_beca (
            name,
            grado_academico,
            fecha_expiracion
          )
        `)
        .eq('id_usuario', userId)
        .order('created_at', { ascending: false })

      if (alertData) {
        const { data: postData } = await insforge.database
          .from('postulaciones')
          .select('id_beca, estado')
          .eq('id_usuario', userId)

        const postMap = new Map<string, string>()
        if (postData) {
          postData.forEach((p: any) => postMap.set(p.id_beca, p.estado))
        }

        alertas = alertData.map((a: any) => ({
          id_alerta: a.id_alerta,
          id_beca: a.id_beca,
          nombre_beca: a.becas?.name || 'Convocatoria oficial',
          grado_academico: a.becas?.grado_academico,
          fecha_expiracion: a.becas?.fecha_expiracion,
          dias_antes: a.dias_antes || [30, 7, 1],
          canal: a.canal || 'email',
          activa: a.activa,
          estado_postulacion: postMap.get(a.id_beca) || 'pendiente',
          created_at: a.created_at,
        }))
      }
    } catch (e) {
      console.error('Error al consultar alertas:', e)
    }

    return {
      perfil,
      suscripcion,
      conversaciones,
      totalMensajes,
      alertas,
    }
  },

  async actualizarUsername(userId: string, nuevoUsername: string) {
    return insforge.database
      .from('usuarios')
      .update({ username: nuevoUsername.trim() })
      .eq('id_usuario', userId)
  },

  async alternarAlerta(idAlerta: string, activa: boolean) {
    return insforge.database
      .from('alertas_beca')
      .update({ activa })
      .eq('id_alerta', idAlerta)
  },

  async eliminarConversacion(idConversacion: string) {
    return insforge.database
      .from('conversaciones')
      .delete()
      .eq('id_conversacion', idConversacion)
  },

  async obtenerBecasDisponiblesParaRecordatorio() {
    return insforge.database
      .from('becas')
      .select('id_beca, name, grado_academico, fecha_expiracion')
      .not('fecha_expiracion', 'is', null)
      .limit(10)
  },

  async crearAlertaRecordatorio(userId: string, idBeca: string) {
    const { data: existente } = await insforge.database
      .from('alertas_beca')
      .select('id_alerta')
      .eq('id_usuario', userId)
      .eq('id_beca', idBeca)
      .maybeSingle()

    if (existente?.id_alerta) {
      return insforge.database
        .from('alertas_beca')
        .update({ activa: true, dias_antes: [30, 7, 1], canal: 'email' })
        .eq('id_alerta', existente.id_alerta)
    }

    return insforge.database
      .from('alertas_beca')
      .insert([
        {
          id_usuario: userId,
          id_beca: idBeca,
          dias_antes: [30, 7, 1],
          canal: 'email',
          activa: true,
        },
      ])
  },
}
