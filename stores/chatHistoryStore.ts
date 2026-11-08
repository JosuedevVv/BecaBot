import { create } from 'zustand'
import { authService } from '@/services/AuthService'
import { chatHistoryService, type ConversacionItem } from '@/services/ChatHistoryService'
import { useAIStore, type Message } from './chatStore'

type ChatHistoryStore = {
  isAuthenticated: boolean
  userId: string | null
  isLoadingHistory: boolean
  isLoadingChat: boolean
  conversaciones: ConversacionItem[]
  searchQuery: string
  activeConversationId: string | null

  setSearchQuery: (query: string) => void
  initHistory: () => Promise<void>
  startNewConversation: () => boolean
  selectConversation: (idConversacion: string) => Promise<void>
  persistTurn: (pregunta: string, respuesta: string) => Promise<void>
  deleteConversation: (idConversacion: string) => Promise<void>
}

export const useChatHistoryStore = create<ChatHistoryStore>((set, get) => ({
  isAuthenticated: false,
  userId: null,
  isLoadingHistory: true,
  isLoadingChat: false,
  conversaciones: [],
  searchQuery: '',
  activeConversationId: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  initHistory: async () => {
    set({ isLoadingHistory: true })
    try {
      const { data } = await authService.obtenerUsuarioActual()
      if (data?.user?.id) {
        const uid = data.user.id
        const list = await chatHistoryService.listarConversaciones(uid)
        set({
          isAuthenticated: true,
          userId: uid,
          conversaciones: list,
          isLoadingHistory: false,
        })
      } else {
        set({
          isAuthenticated: false,
          userId: null,
          conversaciones: [],
          isLoadingHistory: false,
        })
      }
    } catch {
      set({
        isAuthenticated: false,
        userId: null,
        conversaciones: [],
        isLoadingHistory: false,
      })
    }
  },

  startNewConversation: () => {
    const { isAuthenticated } = get()
    // REGLA: Si no está loggeado, NO se permite abrir más chats
    if (!isAuthenticated) {
      return false
    }

    set({ activeConversationId: null })
    useAIStore.getState().resetChat()
    return true
  },

  selectConversation: async (idConversacion: string) => {
    const { activeConversationId } = get()
    if (activeConversationId === idConversacion) return

    set({ isLoadingChat: true, activeConversationId: idConversacion })
    try {
      const dbMensajes = await chatHistoryService.obtenerMensajes(idConversacion)
      const mappedMessages: Message[] = dbMensajes.map((m) => ({
        id: m.id_mensaje,
        role: m.tipo === 'assistant' ? 'assistant' : 'user',
        content: m.mensaje,
        source: m.tipo === 'assistant' ? 'rag' : null,
      }))

      useAIStore.getState().setLoadedConversation(mappedMessages)
    } catch (e) {
      console.error('Error cargando conversacion:', e)
    } finally {
      set({ isLoadingChat: false })
    }
  },

  persistTurn: async (pregunta: string, respuesta: string) => {
    const { isAuthenticated, userId, activeConversationId, conversaciones } = get()
    if (!isAuthenticated || !userId) return

    try {
      let currentId = activeConversationId

      if (!currentId) {
        // Crear nueva conversación con el primer mensaje
        currentId = await chatHistoryService.crearConversacion(userId, pregunta)
        if (!currentId) return

        set({ activeConversationId: currentId })

        // Insertar en la lista local de conversaciones al principio
        const nuevaConv: ConversacionItem = {
          id_conversacion: currentId,
          title: pregunta.slice(0, 48),
          fecha: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }
        set({ conversaciones: [nuevaConv, ...conversaciones] })
      }

      // Guardar el par de mensajes
      await chatHistoryService.guardarParMensajes(currentId, pregunta, respuesta)

      // Actualizar la fecha y reordenar arriba en la lista local
      set((state) => {
        const ahora = new Date().toISOString()
        const filtradas = state.conversaciones.filter((c) => c.id_conversacion !== currentId)
        const actualizada = state.conversaciones.find((c) => c.id_conversacion === currentId)
        if (actualizada) {
          return {
            conversaciones: [{ ...actualizada, fecha: ahora }, ...filtradas],
          }
        }
        return state
      })
    } catch (e) {
      console.error('Error al persistir turno en chatHistoryStore:', e)
    }
  },

  deleteConversation: async (idConversacion: string) => {
    const { activeConversationId } = get()
    set((state) => ({
      conversaciones: state.conversaciones.filter((c) => c.id_conversacion !== idConversacion),
      activeConversationId:
        activeConversationId === idConversacion ? null : activeConversationId,
    }))

    if (activeConversationId === idConversacion) {
      useAIStore.getState().resetChat()
    }

    try {
      await chatHistoryService.eliminarConversacion(idConversacion)
    } catch (e) {
      console.error('Error eliminando conversación:', e)
    }
  },
}))
