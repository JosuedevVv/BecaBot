import { generarTextoConFallback } from '@/lib/ai'
import { insforgeAdmin } from '@/lib/insforge-admin'
import { generarEmbedding } from '@/lib/embeddings'

export type FuenteConocimiento = {
  title?: string
  url?: string
}

const SISTEMA_JUEZ = `Eres un curador estricto de una base de conocimiento sobre becas en MÉXICO.
Recibes una pregunta, la respuesta generada de internet y las fuentes consultadas.
Decide si la respuesta aporta conocimiento factual, concreto, verídico y reutilizable sobre becas EN MÉXICO (nombres de becas mexicanas, montos en MXN, requisitos, fechas límite, instituciones mexicanas como SEP, CONAHCYT, IPES, UNAM, IPN, fundaciones, etc.).

REGLAS DE DESCARTE OBLIGATORIAS:
- DESCARTA (util=false) cualquier beca de otro país o respuestas que solo den portales externos extranjeros.
- DESCARTA saludos, charla general, evasivas o respuestas que solo digan que no hay información.

Si es útil y de México:
- Redacta un "resumen" autocontenido en español (2 a 5 párrafos concisos) que conserve nombres, requisitos, montos en MXN y fechas límite.
- Asigna un "tema" corto en minúsculas (ejemplo: "beca_benito_juarez", "beca_rita_cetina", "beca_santander_licenciatura").

Responde EXCLUSIVAMENTE con JSON válido, sin texto adicional ni bloques markdown:
{"util": true|false, "tema": "...", "resumen": "..."}`

function extraerJson(raw: string): any {
  const texto = (raw ?? '').replace(/```json/gi, '').replace(/```/g, '').trim()
  const inicio = texto.indexOf('{')
  const fin = texto.lastIndexOf('}')
  if (inicio === -1 || fin === -1 || fin <= inicio) return null
  try {
    return JSON.parse(texto.slice(inicio, fin + 1))
  } catch {
    return null
  }
}

export const knowledgeService = {
  async guardar(
    pregunta: string,
    respuesta: string,
    fuentes: FuenteConocimiento[] = []
  ): Promise<boolean> {
    const preguntaLimpia = (pregunta || '').trim()
    const respuestaLimpia = (respuesta || '').trim()

    if (!preguntaLimpia || !respuestaLimpia || respuestaLimpia.length < 50) {
      return false
    }

    try {
      const fuentesTexto = fuentes
        .map((f) => `- ${f.title || f.url || 'fuente'}${f.url ? ` (${f.url})` : ''}`)
        .join('\n')

      const promptUsuario = `PREGUNTA: ${preguntaLimpia}\n\nRESPUESTA (de la web): ${respuestaLimpia}\n\nFUENTES:\n${fuentesTexto || '(sin fuentes)'}`

      const { text: respuestaJuez } = await generarTextoConFallback({
        system: SISTEMA_JUEZ,
        messages: [{ role: 'user', content: promptUsuario }],
        temperature: 0.1,
      })

      const juicio = extraerJson(respuestaJuez)
      if (!juicio || juicio.util !== true || !juicio.resumen || juicio.resumen.length < 50) {
        return false
      }

      const contenidoFinal = juicio.tema
        ? `${juicio.tema}\n\n${juicio.resumen.trim()}`
        : juicio.resumen.trim()

      const embedding = await generarEmbedding(`${preguntaLimpia}\n\n${contenidoFinal}`)

      const { data: similares } = await insforgeAdmin.database.rpc('match_conocimiento_web', {
        query_embedding: embedding,
        match_count: 1,
      })

      const primerSimilar = Array.isArray(similares) && similares[0] ? similares[0] : null

      if (primerSimilar && Number(primerSimilar.score) >= 0.92) {
        await insforgeAdmin.database
          .from('conocimiento_web')
          .update({
            contenido: contenidoFinal,
            fuentes: fuentes,
            embedding: embedding,
          })
          .eq('id_conocimiento', primerSimilar.id_conocimiento)

        return true
      }

      const { error: insertErr } = await insforgeAdmin.database
        .from('conocimiento_web')
        .insert([
          {
            pregunta: preguntaLimpia,
            contenido: contenidoFinal,
            fuentes: fuentes,
            embedding: embedding,
          },
        ])

      if (insertErr) {
        console.error('[KnowledgeService] Error al insertar conocimiento_web:', insertErr)
        return false
      }

      return true
    } catch (err) {
      console.error('[KnowledgeService] Excepción guardando conocimiento:', err)
      return false
    }
  },
}
