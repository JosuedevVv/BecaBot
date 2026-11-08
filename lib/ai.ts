import dns from 'node:dns'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'

dns.setDefaultResultOrder('ipv4first')

const apiKey = process.env.OPENROUTER_API_KEY

export const openrouter = createOpenRouter({
  apiKey,
})

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

export async function generarTextoConFallback({
  system,
  messages,
  temperature = 0.2,
}: OpcionesGeneracionFallback): Promise<{ text: string; modelUsed: string }> {
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

  let ultimoError: unknown = null

  for (const modelId of MODELOS_GRATUITOS_OPENROUTER) {
    try {
      const { text } = await generateText({
        model: openrouter(modelId),
        system,
        messages,
        temperature,
        maxRetries: 0,
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
