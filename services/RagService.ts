import { generarTextoConFallback } from '@/lib/ai'
import { vectorRetrieverService } from './VectorRetrieverService'
import { SYSTEM_BECA_BOT_RAG } from '@/lib/prompts'
import { esRespuestaSinInformacion, FRASE_SIN_INFORMACION } from '@/lib/text-normalizer'

export type FuenteRag = {
  title: string
  url?: string
}

export type ResultadoRag = {
  respuesta: string
  fuentes: FuenteRag[]
  sinInformacion: boolean
}

export const ragService = {
  async consultar(
    pregunta: string,
    preguntaContextualizada?: string,
    historial?: Array<{ role: 'user' | 'assistant'; content: string }>,
    gradoAcademico?: string | null
  ): Promise<ResultadoRag> {
    const consulta = (preguntaContextualizada || pregunta).trim()

    const resRetriever = await vectorRetrieverService.recuperarContexto(
      consulta,
      gradoAcademico
    )

    if (!resRetriever.hayContexto || !resRetriever.contextoTexto.trim()) {
      return {
        respuesta: FRASE_SIN_INFORMACION,
        fuentes: [],
        sinInformacion: true,
      }
    }

    const systemPrompt = `${SYSTEM_BECA_BOT_RAG}\n\nContexto:\n${resRetriever.contextoTexto}`
    const historialFormateado = (historial || [])
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-4)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

    try {
      const { text } = await generarTextoConFallback({
        system: systemPrompt,
        messages: [
          ...historialFormateado,
          { role: 'user', content: pregunta },
        ],
        temperature: 0.2,
      })

      const textoLimpio = text.trim()

      if (!textoLimpio || esRespuestaSinInformacion(textoLimpio)) {
        return {
          respuesta: FRASE_SIN_INFORMACION,
          fuentes: [],
          sinInformacion: true,
        }
      }

      return {
        respuesta: textoLimpio,
        fuentes: resRetriever.fuentes,
        sinInformacion: false,
      }
    } catch (err) {
      console.error('[RagService] Error generando respuesta con LLM:', err)
      return {
        respuesta: FRASE_SIN_INFORMACION,
        fuentes: [],
        sinInformacion: true,
      }
    }
  },
}
