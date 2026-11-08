export function generarTituloConversacion(pregunta: string): string {
  const limpia = pregunta.replace(/[\r\n\t]+/g, ' ').trim()
  if (!limpia) return 'Nueva consulta de becas'
  if (limpia.length <= 48) return limpia
  return `${limpia.slice(0, 48).trim()}…`
}

export function formatearFechaChat(isoDate: string): string {
  try {
    const fecha = new Date(isoDate)
    const ahora = new Date()

    const esMismoDia =
      fecha.getDate() === ahora.getDate() &&
      fecha.getMonth() === ahora.getMonth() &&
      fecha.getFullYear() === ahora.getFullYear()

    if (esMismoDia) {
      return `Hoy, ${fecha.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    }

    const unDiaMs = 24 * 60 * 60 * 1000
    const diferenciaDias = Math.floor((ahora.getTime() - fecha.getTime()) / unDiaMs)

    if (diferenciaDias === 1) {
      return 'Ayer'
    }

    return fecha.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return 'Reciente'
  }
}

export function esDeHoy(isoDate: string): boolean {
  try {
    const fecha = new Date(isoDate)
    const ahora = new Date()
    return (
      fecha.getDate() === ahora.getDate() &&
      fecha.getMonth() === ahora.getMonth() &&
      fecha.getFullYear() === ahora.getFullYear()
    )
  } catch {
    return false
  }
}
