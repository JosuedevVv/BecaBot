import { normalizarTexto } from './text-normalizer'

export type IntencionRecordatorio = {
  esRecordatorio: boolean
  consultaBeca?: string
}

const PATRONES_RECORDATORIO = [
  'hazme un recordatorio',
  'haz un recordatorio',
  'hacer un recordatorio',
  'crear recordatorio',
  'crea un recordatorio',
  'guardar recordatorio',
  'guarda un recordatorio',
  'guardame un recordatorio',
  'guárdame un recordatorio',
  'pon un recordatorio',
  'ponme un recordatorio',
  'recuerdame',
  'recuérdame',
  'agendar recordatorio',
  'agenda un recordatorio',
  'crear alerta',
  'activa una alerta',
  'activar alerta',
  'pon una alerta',
  'avisame cuando cierre',
  'avísame cuando cierre',
  'quiero un recordatorio',
  'recordatorio',
  'alerta',
]

export function detectarIntencionRecordatorio(
  prompt: string,
  historialReciente: Array<{ role: string; content: string; citations?: Array<{ title: string }> }> = []
): IntencionRecordatorio {
  const norm = normalizarTexto(prompt).toLowerCase().trim()

  const coincidePatron = PATRONES_RECORDATORIO.some((patron) =>
    norm.includes(normalizarTexto(patron))
  )

  if (!coincidePatron) {
    return { esRecordatorio: false }
  }

  let becaExtraida = ''

  const prefijos = [
    /recordatorio\s+(?:de\s+la|para\s+la|de|para|sobre)\s+(?:beca\s+)?(.+)/i,
    /recuerdame\s+(?:la\s+convocatoria\s+de|la\s+beca|de\s+la|sobre\s+la|sobre|la)\s+(.+)/i,
    /alerta\s+(?:de\s+la|para\s+la|de|para|sobre)\s+(?:beca\s+)?(.+)/i,
    /avisame\s+(?:de\s+la|sobre\s+la|cuando\s+cierre\s+la)\s+(?:beca\s+)?(.+)/i,
  ]

  for (const regex of prefijos) {
    const match = prompt.match(regex)
    if (match && match[1]) {
      const candidato = match[1].replace(/[¿?¡!.,;]/g, '').trim()
      if (!/^(esta\s+beca|esa\s+beca|la\s+beca|una\s+beca|esto|ella)$/i.test(candidato)) {
        becaExtraida = candidato
        break
      }
    }
  }

  if (!becaExtraida && historialReciente.length > 0) {
    const ultimosAsistente = [...historialReciente]
      .reverse()
      .filter((m) => m.role === 'assistant')

    for (const msg of ultimosAsistente) {
      if (msg.citations && msg.citations.length > 0 && msg.citations[0].title) {
        becaExtraida = msg.citations[0].title
        break
      }

      const matchNegrita = msg.content.match(/\*\*([^*]+(?:Beca|Convocatoria)[^*]+)\*\*/i)
      if (matchNegrita && matchNegrita[1]) {
        becaExtraida = matchNegrita[1].trim()
        break
      }
    }

    if (!becaExtraida) {
      const ultimosUsuario = [...historialReciente]
        .reverse()
        .filter((m) => m.role === 'user')

      for (const uMsg of ultimosUsuario) {
        const uMatch = uMsg.content.match(/(?:beca|convocatoria)\s+([a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s]+)/i)
        if (uMatch && uMatch[1]) {
          becaExtraida = `Beca ${uMatch[1].trim()}`
          break
        }
      }
    }
  }

  return {
    esRecordatorio: true,
    consultaBeca: becaExtraida.trim() || undefined,
  }
}
