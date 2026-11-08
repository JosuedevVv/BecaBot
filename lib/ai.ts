import dns from 'node:dns'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'

// Forzar resolución IPv4 primero en Node.js (evita UND_ERR_CONNECT_TIMEOUT hacia Cloudflare/OpenRouter en redes sin IPv6 global)
dns.setDefaultResultOrder('ipv4first')

const apiKey = process.env.OPENROUTER_API_KEY

export const openrouter = createOpenRouter({
  apiKey,
})

/**
 * Cadena priorizada de modelos 100% gratuitos en OpenRouter (:free).
 * Si el primer modelo alcanza su límite de peticiones por minuto (429) o no está
 * disponible temporalmente, el sistema rota automáticamente al siguiente sin fallar.
 */
export const MODELOS_GRATUITOS_OPENROUTER = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'openrouter/free',
] as const

export type OpcionesGeneracionFallback = {
  system: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  temperature?: number
}

/**
 * Ejecuta `generateText` probando en orden la cadena de modelos gratuitos (:free)
 * de OpenRouter (o Groq si GROQ_API_KEY está configurada en .env.local).
 */
export async function generarTextoConFallback({
  system,
  messages,
  temperature = 0.2,
}: OpcionesGeneracionFallback): Promise<{ text: string; modelUsed: string }> {
  // Opción A: Si el usuario configura GROQ_API_KEY en .env.local (capa gratuita de 14,400 req/día)
  const groqKey = process.env.GROQ_API_KEY
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: system }, ...messages],
          temperature,
        }),
      })

      if (res.ok) {
        const json = await res.json()
        const text = json?.choices?.[0]?.message?.content?.trim()
        if (text) {
          return { text, modelUsed: 'groq/llama-3.3-70b-versatile' }
        }
      }
    } catch (err) {
      console.warn('[AI Fallback] Falló intento inicial con Groq, rotando a OpenRouter :free', err)
    }
  }

  // Opción B: Rotación automática sobre modelos :free de OpenRouter
  let ultimoError: unknown = null

  for (const modelId of MODELOS_GRATUITOS_OPENROUTER) {
    try {
      const { text } = await generateText({
        model: openrouter(modelId),
        system,
        messages,
        temperature,
        maxRetries: 0, // Evita multiplicar 3 reintentos × 10s en el mismo modelo; salta de inmediato al siguiente
      })

      if (text && text.trim()) {
        return { text: text.trim(), modelUsed: modelId }
      }
    } catch (err) {
      ultimoError = err
      console.warn(
        `[AI Fallback] Modelo gratuito "${modelId}" saturado o sin cuota, probando siguiente...`,
        (err as Error)?.message
      )
    }
  }

  throw ultimoError instanceof Error
    ? ultimoError
    : new Error('Todos los modelos gratuitos están temporalmente saturados.')
}
