import { streamText } from "ai"
import { openrouter, generarTextoConFallback } from "../lib/ai"
import { SYSTEM_BECA_BOT_WEB } from "../lib/prompts"
import type { ChatMessage } from "../lib/chat-stream"

/**
 * Estrategia de ahorro de créditos:
 * 1) Se usa el sufijo `:free` en el modelo para que los tokens de entrada/salida cuesten $0.00.
 * 2) Se reduce `max_results` de 5 a 2 en el plugin web para ahorrar 60% por búsqueda externa.
 */
const WEB_FREE_MODEL = "nvidia/nemotron-3-nano-30b-a3b:free"

export const webSearchService = {
  responder(messages: ChatMessage[]) {
    return streamText({
      model: openrouter(WEB_FREE_MODEL, {
        plugins: [{ id: "web", max_results: 2 }],
      }),
      system: SYSTEM_BECA_BOT_WEB,
      messages,
      maxRetries: 1,
    })
  },

  /**
   * Respaldo 100% gratuito sin plugin de pago en caso de que la cuenta de OpenRouter
   * no tenga saldo para el plugin Exa web o el modelo primario alcance rate-limit.
   */
  async responderConFallbackGratuito(messages: ChatMessage[]): Promise<string> {
    const cleanMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }))

    const { text } = await generarTextoConFallback({
      system: SYSTEM_BECA_BOT_WEB,
      messages: cleanMessages,
      temperature: 0.2,
    })

    return text
  },
}
