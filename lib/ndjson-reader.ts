import type { ChatEvent } from './chat-stream'

export async function leerStreamNdjson(
  response: Response,
  onEvent: (event: ChatEvent) => void
): Promise<void> {
  if (!response.body) return

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lineas = buffer.split('\n')
      buffer = lineas.pop() ?? ''

      for (const linea of lineas) {
        const limpia = linea.trim()
        if (!limpia) continue
        try {
          const evento = JSON.parse(limpia) as ChatEvent
          onEvent(evento)
        } catch {
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
