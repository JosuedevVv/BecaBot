import type { ChatMessage } from './chat-stream'

const PATRONES_SEGUIMIENTO = [
  /^cuales son (los |sus )?requisitos/i,
  /^que requisitos/i,
  /^como aplico/i,
  /^como postulo/i,
  /^cuando vence/i,
  /^cuando cierra/i,
  /^cual es la fecha/i,
  /^cuanto pagan/i,
  /^cuanto dan/i,
  /^de cuanto es el monto/i,
  /^y los requisitos/i,
  /^y el monto/i,
  /^y las fechas/i,
]

export function construirPreguntaContextualizada(messages: ChatMessage[]): string {
  const ultimos = messages.slice(-5)
  const preguntaActual =
    [...ultimos].reverse().find((m) => m.role === 'user')?.content?.trim() ?? ''

  if (!preguntaActual) return ''

  const esSeguimiento =
    preguntaActual.length < 50 &&
    PATRONES_SEGUIMIENTO.some((patron) => patron.test(preguntaActual))

  if (!esSeguimiento || ultimos.length <= 1) {
    return preguntaActual
  }

  const contextoPrevio = ultimos
    .slice(0, -1)
    .map((m) => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`)
    .join('\n')

  return `Contexto de la conversación previa:\n${contextoPrevio}\n\nPregunta específica de seguimiento del usuario:\n${preguntaActual}`
}
