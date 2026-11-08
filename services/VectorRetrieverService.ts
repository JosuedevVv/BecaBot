import { insforgeAdmin } from '@/lib/insforge-admin'
import { generarEmbedding } from '@/lib/embeddings'

export type MatchBeca = {
  id_beca: string
  name: string
  tipo_fuente: string
  content: string
  score: number
  grado_academico?: string | null
  fecha_expiracion?: string | null
  vigente?: boolean
}

export type ConocimientoWebRecuperado = {
  id_conocimiento: string
  pregunta: string
  contenido: string
  fuentes: Array<{ title?: string; url?: string }>
  score: number
}

export type ContextoRAGResultado = {
  contextoTexto: string
  resultadosBecas: MatchBeca[]
  conocimientoWeb: ConocimientoWebRecuperado[]
  fuentes: Array<{ title: string; url?: string }>
  hayContexto: boolean
}

const MIN_SCORE_BECAS = 0.38
const MIN_SCORE_WEB = 0.45

export const vectorRetrieverService = {
  async recuperarContexto(
    preguntaBusqueda: string,
    grado?: string | null
  ): Promise<ContextoRAGResultado> {
    let resultadosBecas: MatchBeca[] = []
    let conocimientoWeb: ConocimientoWebRecuperado[] = []
    const fuentesMap = new Map<string, { title: string; url?: string }>()

    // 1. Generar embedding con OpenRouter usando la clave vigente de .env.local
    const embedding = await generarEmbedding(preguntaBusqueda)

    // 2. Búsqueda semántica en becas, chunks y requisitos (match_contexto)
    try {
      const { data, error } = await insforgeAdmin.database.rpc('match_contexto', {
        query_embedding: embedding,
        match_count: 6,
        filtro_grado: grado ?? null,
      })

      if (!error && Array.isArray(data)) {
        resultadosBecas = (data as any[])
          .filter((item) => Number(item.score) >= MIN_SCORE_BECAS)
          .map((item) => ({
            id_beca: item.id_beca,
            name: item.name,
            tipo_fuente: item.tipo_fuente || 'beca',
            content: item.content || '',
            score: Number(item.score),
          }))

        // Registrar fuentes de becas
        for (const b of resultadosBecas) {
          if (!fuentesMap.has(b.name)) {
            fuentesMap.set(b.name, { title: b.name })
          }
        }
      } else if (error) {
        console.error('[VectorRetriever] Error en match_contexto:', error)
      }
    } catch (err) {
      console.error('[VectorRetriever] Excepción en match_contexto:', err)
    }

    // 3. Enriquecer con requisitos hermanos de las becas encontradas
    const becaIds = Array.from(new Set(resultadosBecas.map((r) => r.id_beca).filter(Boolean)))
    const requisitosExtra: string[] = []

    if (becaIds.length > 0) {
      try {
        const { data: reqs } = await insforgeAdmin.database
          .from('requisitos')
          .select('id_beca, descripcion')
          .in('id_beca', becaIds.slice(0, 3))

        if (Array.isArray(reqs) && reqs.length > 0) {
          const reqMap = new Map<string, string[]>()
          for (const r of reqs) {
            const list = reqMap.get(r.id_beca) ?? []
            list.push(r.descripcion)
            reqMap.set(r.id_beca, list)
          }

          for (const [idBeca, lista] of reqMap.entries()) {
            const beca = resultadosBecas.find((b) => b.id_beca === idBeca)
            const nombreBeca = beca?.name ?? 'Beca'
            requisitosExtra.push(
              `[requisitos oficiales de "${nombreBeca}"]:\n- ` + lista.join('\n- ')
            )
          }
        }
      } catch (err) {
        console.error('[VectorRetriever] Error recuperando requisitos hermanos:', err)
      }
    }

    // 4. Búsqueda en conocimiento web aprendido (match_conocimiento_web)
    try {
      const { data: webData, error: webErr } = await insforgeAdmin.database.rpc(
        'match_conocimiento_web',
        {
          query_embedding: embedding,
          match_count: 4,
        }
      )

      if (!webErr && Array.isArray(webData)) {
        conocimientoWeb = (webData as any[])
          .filter((item) => Number(item.score) >= MIN_SCORE_WEB)
          .map((item) => {
            const parsedFuentes = Array.isArray(item.fuentes) ? item.fuentes : []
            return {
              id_conocimiento: item.id_conocimiento,
              pregunta: item.pregunta,
              contenido: item.contenido,
              fuentes: parsedFuentes,
              score: Number(item.score),
            }
          })

        // Registrar fuentes del conocimiento web (preservando title y url)
        for (const w of conocimientoWeb) {
          if (w.fuentes && Array.isArray(w.fuentes)) {
            for (const f of w.fuentes) {
              if (f.title && !fuentesMap.has(f.title)) {
                fuentesMap.set(f.title, { title: f.title, url: f.url })
              }
            }
          }
        }
      } else if (webErr) {
        console.error('[VectorRetriever] Error en match_conocimiento_web:', webErr)
      }
    } catch (err) {
      console.error('[VectorRetriever] Excepción en match_conocimiento_web:', err)
    }

    const hayContexto =
      resultadosBecas.length > 0 || conocimientoWeb.length > 0 || requisitosExtra.length > 0

    // Construcción del bloque textual de Contexto para el LLM
    const bloquesBecas = resultadosBecas.map(
      (r) => `[base documental] "${r.name}":\n${r.content}`
    )
    const bloquesWeb = conocimientoWeb.map(
      (c) => `[conocimiento web oficial aprendido]:\n${c.contenido}`
    )

    const contextoTexto = [
      ...bloquesBecas,
      ...requisitosExtra,
      ...bloquesWeb,
    ]
      .filter(Boolean)
      .join('\n\n')

    return {
      contextoTexto,
      resultadosBecas,
      conocimientoWeb,
      fuentes: Array.from(fuentesMap.values()),
      hayContexto,
    }
  },
}
