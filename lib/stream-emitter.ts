import type { ChatEvent, ChatFuente, ChatMessage } from './chat-stream'
import { dedupeFuentes } from './sources'
import { webSearchService } from '@/services/WebSearchService'

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function emitirTextoPorLotes(
  enviar: (event: ChatEvent) => void,
  texto: string,
  delayMs = 14
): Promise<void> {
  const tokens = texto.split(/(?<=\s)/)
  let lote = ''

  for (let i = 0; i < tokens.length; i++) {
    lote += tokens[i]
    if (lote.length >= 12 || i === tokens.length - 1) {
      enviar({ type: 'delta', text: lote })
      lote = ''
      await esperar(delayMs)
    }
  }
}

export async function consumirStreamWeb(
  enviar: (event: ChatEvent) => void,
  messages: ChatMessage[]
): Promise<{ texto: string; fuentes: ChatFuente[] }> {
  const fuentes: ChatFuente[] = []
  let texto = ''

  try {
    const resultado = webSearchService.responder(messages)

    for await (const part of resultado.fullStream) {
      if (part.type === 'text-delta') {
        texto += part.text
        enviar({ type: 'delta', text: part.text })
      } else if (part.type === 'source' && part.sourceType === 'url') {
        fuentes.push({ title: part.title ?? part.url, url: part.url })
      } else if (part.type === 'error') {
        throw new Error(
          (part.error as Error)?.message ?? 'La búsqueda web devolvió un error'
        )
      }
    }
  } catch (err) {
    console.warn(
      '[stream-emitter] Falló el stream con plugin web (posible límite de créditos o rate-limit). Activando cadena de modelos gratuitos...',
      (err as Error)?.message ?? err
    )

    if (!texto.trim()) {
      const textoFallback = await webSearchService.responderConFallbackGratuito(messages)
      texto = textoFallback
      await emitirTextoPorLotes(enviar, textoFallback)
    }
  }

  if (!texto.trim()) {
    const textoFallback = await webSearchService.responderConFallbackGratuito(messages)
    texto = textoFallback
    await emitirTextoPorLotes(enviar, textoFallback)
  }

  const items = dedupeFuentes(fuentes)
  if (items.length > 0) {
    enviar({ type: 'citations', items })
  }

  return { texto, fuentes: items }
}
