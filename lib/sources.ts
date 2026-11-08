import type { ChatFuente } from './chat-stream'

export function dedupeFuentes(fuentes: ChatFuente[]): ChatFuente[] {
  const vistas = new Set<string>()
  return fuentes.filter((fuente) => {
    const clave = (fuente.url ?? fuente.title ?? '').trim().toLowerCase()
    if (!clave || vistas.has(clave)) return false
    vistas.add(clave)
    return true
  })
}
