import { normalizarTexto } from './text-normalizer'

export type IntencionRapida = {
  esRapida: boolean
  respuesta?: string
}

const SALUDOS = ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal', 'hey']
const IDENTIDAD = ['quien eres', 'que eres', 'como te llamas']
const FUNCION = ['que haces', 'para que sirves', 'que puedes hacer', 'como funcionas', 'como me ayudas']

export function clasificarIntencionRapida(pregunta: string): IntencionRapida {
  const norm = normalizarTexto(pregunta)
    .replace(/[¿?¡!.,;:_]/g, '')
    .trim()

  if (SALUDOS.includes(norm)) {
    return {
      esRapida: true,
      respuesta:
        '¡Hola! Soy BecaBot, tu asesor especializado exclusivamente en becas en México. ' +
        'Puedo orientarte sobre requisitos, convocatorias, montos, fechas y procesos de solicitud. ¿Qué estás buscando?',
    }
  }

  if (IDENTIDAD.some((frase) => norm === frase || norm.startsWith(`${frase} `))) {
    return {
      esRapida: true,
      respuesta:
        'Soy BecaBot, un asistente especializado únicamente en información y orientación sobre becas en México.',
    }
  }

  if (FUNCION.some((frase) => norm === frase || norm.startsWith(`${frase} `))) {
    return {
      esRapida: true,
      respuesta:
        'Te ayudo a encontrar y entender becas en México: convocatorias oficiales, requisitos, fechas límite, montos y procesos de postulación.',
    }
  }

  return { esRapida: false }
}
