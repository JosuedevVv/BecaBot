import { streamText } from "ai"
import { openrouter, generarTextoConFallback } from "../lib/ai"
import { SYSTEM_BECA_BOT_WEB } from "../lib/prompts"
import type { ChatMessage } from "../lib/chat-stream"

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
