export type ConversacionItem = {
  id_conversacion: string
  title: string
  fecha: string
  created_at: string
}

export type MensajeItem = {
  id_mensaje: string
  id_conversacion: string
  mensaje: string
  tipo: 'user' | 'assistant'
  created_at: string
}

export const chatHistoryService = {
  async listarConversaciones(userId: string): Promise<ConversacionItem[]> {
    try {
      const res = await fetch(`/api/chat-history?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        cache: 'no-store',
      })
      if (!res.ok) return []
      const json = await res.json()
      return (json.items ?? []) as ConversacionItem[]
    } catch (e) {
      console.error('Error al listar conversaciones:', e)
      return []
    }
  },

  async obtenerMensajes(idConversacion: string): Promise<MensajeItem[]> {
    try {
      const res = await fetch(
        `/api/chat-history?idConversacion=${encodeURIComponent(idConversacion)}`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      )
      if (!res.ok) return []
      const json = await res.json()
      return (json.items ?? []) as MensajeItem[]
    } catch (e) {
      console.error('Error al obtener mensajes de conversación:', e)
      return []
    }
  },

  async crearConversacion(userId: string, primeraPregunta: string): Promise<string | null> {
    try {
      const res = await fetch('/api/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'crear_conversacion',
          userId,
          primeraPregunta,
        }),
      })

      if (!res.ok) return null
      const json = await res.json()
      return json.id_conversacion ?? null
    } catch (e) {
      console.error('Error al crear conversación:', e)
      return null
    }
  },

  async guardarParMensajes(
    idConversacion: string,
    pregunta: string,
    respuesta: string
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'guardar_mensajes',
          idConversacion,
          pregunta,
          respuesta,
        }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        console.error('Error guardando mensajes:', errJson.error || res.statusText)
        return false
      }

      return true
    } catch (e) {
      console.error('Error en guardarParMensajes:', e)
      return false
    }
  },

  async eliminarConversacion(idConversacion: string): Promise<boolean> {
    try {
      const res = await fetch('/api/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'eliminar_conversacion',
          idConversacion,
        }),
      })

      return res.ok
    } catch (e) {
      console.error('Error eliminando conversación:', e)
      return false
    }
  },
}
