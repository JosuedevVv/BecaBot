import { normalizarTexto } from './text-normalizer'

export type IntencionComparador = {
  esComparacion: boolean
  promptEnriquecido: string
}

const PATRONES_COMPARACION = [
  /\b(compara|comparar|comparame|comparacion|comparativa|comparador)\b/i,
  /\b(contrasta|contrastar|contrastame)\b/i,
  /\b(diferencia|diferencias)\s+entre\b/i,
  /\b(cual\s+es\s+mejor|cual\s+me\s+conviene\s+mas)\s+entre\b/i,
  /\bvs\b/i,
]

/**
 * Detecta si la consulta del usuario solicita usar el Comparador de Becas
 * (contrastar montos, requisitos, fechas o elegibilidad entre becas).
 */
export function detectarIntencionComparador(prompt: string): IntencionComparador {
  const limpio = (prompt || '').trim()
  const norm = normalizarTexto(limpio)

  if (!norm) {
    return { esComparacion: false, promptEnriquecido: limpio }
  }

  const coincidePatron = PATRONES_COMPARACION.some((regex) => regex.test(norm))

  if (!coincidePatron) {
    return { esComparacion: false, promptEnriquecido: limpio }
  }

  const promptEnriquecido = `${limpio}\n\n[Instrucción de Comparador Premium: Presenta una tabla comparativa clara en Markdown contrastando: Nombre de la Beca, Institución, Monto en MXN, Periodicidad, Nivel Académico, Requisitos Clave y Compatibilidad, seguida de una recomendación breve sobre cuál conviene según el perfil.]`

  return {
    esComparacion: true,
    promptEnriquecido,
  }
}

export function construirMensajeBloqueoComparador(autenticado: boolean): string {
  if (!autenticado) {
    return `🔒 **El Comparador de Becas es una función exclusiva del Plan Premium.**\n\nCon el **Comparador de Becas Premium** puedes contrastar lado a lado en una tabla:\n- **Montos en MXN y periodicidad de pago**\n- **Requisitos de promedio y elegibilidad**\n- **Fechas de convocatoria y compatibilidad entre becas**\n\n👉 [Inicia sesión en tu cuenta](/login) o conoce el [Plan Premium ($59 MXN/mes) →](/premium) para desbloquear el comparador y las alertas por correo.`
  }

  return `⭐ **El Comparador de Becas es exclusivo del Plan Premium.**\n\nActualmente estás en el **Plan Becario (Gratuito)**, el cual incluye **consultas individuales ilimitadas** sobre cualquier beca en México.\n\nAl mejorar a **BecaBot Premium ($59 MXN/mes)** desbloqueas:\n- 📊 **Comparador de becas en tabla** (contrasta montos en MXN, requisitos y compatibilidad entre 2 o más convocatorias).\n- 🔔 **Recordatorios desde el chat** guardados directamente en tu perfil.\n- 📧 **Alertas automáticas por correo** (30, 7 y 1 día antes del cierre).\n\n👉 [Mejorar a Plan Premium o activar en el Simulador de Pruebas →](/premium)`
}
