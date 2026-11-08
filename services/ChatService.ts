import { encodeEvent, type ChatEvent, type ChatMessage } from '@/lib/chat-stream'
import { clasificarIntencionRapida } from '@/lib/intent-classifier'
import { construirPreguntaContextualizada } from '@/lib/query-context'
import { dedupeFuentes } from '@/lib/sources'
import { emitirTextoPorLotes, consumirStreamWeb } from '@/lib/stream-emitter'
import { knowledgeService } from './KnowledgeService'
import { ragService } from './RagService'

const encoder = new TextEncoder()

export const chatService = {
  responder(messages: ChatMessage[]): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>({
      async start(controller) {
        let abierto = true

        const enviar = (event: ChatEvent) => {
          if (!abierto) return
          try {
            controller.enqueue(encoder.encode(encodeEvent(event)))
          } catch {
            abierto = false
          }
        }

        const pregunta =
          [...messages].reverse().find((m) => m.role === 'user')?.content?.trim() ?? ''

        try {
          if (!pregunta) {
            enviar({ type: 'error', message: 'No se recibió ninguna pregunta.' })
            return
          }

          const intencion = clasificarIntencionRapida(pregunta)
          if (intencion.esRapida && intencion.respuesta) {
            enviar({ type: 'source', source: 'rag' })
            await emitirTextoPorLotes(enviar, intencion.respuesta, 10)
            return
          }

          let respondidoPorRag = false
          enviar({ type: 'status', phase: 'rag' })

          try {
            const preguntaContextualizada = construirPreguntaContextualizada(messages)
            const historialReciente = messages.slice(-6).map((m) => ({
              role: m.role,
              content: m.content,
            }))

            const rag = await ragService.consultar(
              pregunta,
              preguntaContextualizada,
              historialReciente
            )

            if (!rag.sinInformacion && rag.fuentes.length > 0) {
              respondidoPorRag = true
              enviar({ type: 'source', source: 'rag' })
              await emitirTextoPorLotes(enviar, rag.respuesta)
              enviar({
                type: 'citations',
                items: dedupeFuentes(rag.fuentes.map((f) => ({ title: f.title, url: f.url }))),
              })
            }
          } catch (err) {
            console.error('[ChatService][RAG Exception]:', err)
          }

          if (!respondidoPorRag) {
            try {
              enviar({ type: 'status', phase: 'web' })
              enviar({ type: 'source', source: 'web' })
              const { texto, fuentes } = await consumirStreamWeb(enviar, messages)
              const guardado = await knowledgeService.guardar(
                pregunta,
                texto,
                fuentes
              )
              enviar({ type: 'knowledge', guardado })
            } catch (err) {
              enviar({
                type: 'error',
                message: `No se pudo obtener una respuesta: ${(err as Error).message}`,
              })
            }
          }
        } finally {
          enviar({ type: 'done' })
          abierto = false
          try {
            controller.close()
          } catch {
          }
        }
      },
    })
  },
}
