import { adminClient } from './insforge.ts';
import { generarEmbedding } from './openrouter.ts';

export type Match = {
  id_beca: string;
  name: string;
  grado_academico?: string | null;
  fecha_expiracion?: string | null;
  vigente?: boolean;
  tipo_fuente: string;
  content: string;
  score: number;
};

export type ConocimientoWeb = {
  id_conocimiento: string;
  pregunta: string;
  contenido: string;
  fuentes: unknown;
  score: number;
};

export type ContextoResultado = {
  contextoTexto: string;
  resultadosBecas: Match[];
  conocimientoWeb: ConocimientoWeb[];
  hayContexto: boolean;
};

export async function recuperarContexto(
  preguntaBusqueda: string,
  grado?: string | null
): Promise<ContextoResultado> {
  const admin = adminClient();
  let resultadosBecas: Match[] = [];
  let conocimientoWeb: ConocimientoWeb[] = [];

  const embedding = await generarEmbedding(preguntaBusqueda);

  // 1) Búsqueda en becas, chunks y requisitos
  try {
    const { data, error } = await admin.database.rpc('match_contexto', {
      query_embedding: embedding,
      match_count: 6,
      filtro_grado: grado ?? null,
      min_score: 0.35,
    });
    if (!error && Array.isArray(data)) {
      resultadosBecas = data as Match[];
    }
  } catch (err) {
    console.error('Error en match_contexto:', err);
  }

  // 2) Enriquecimiento de requisitos hermanos para las becas principales
  const becaIds = Array.from(
    new Set(resultadosBecas.map((r) => r.id_beca).filter(Boolean))
  );

  const requisitosExtra: string[] = [];
  if (becaIds.length > 0) {
    try {
      const { data: reqs } = await admin.database
        .from('requisitos')
        .select('id_beca, descripcion')
        .in('id_beca', becaIds.slice(0, 3));

      if (Array.isArray(reqs) && reqs.length > 0) {
        const reqMap = new Map<string, string[]>();
        for (const r of reqs) {
          const list = reqMap.get(r.id_beca) ?? [];
          list.push(r.descripcion);
          reqMap.set(r.id_beca, list);
        }

        for (const [idBeca, lista] of reqMap.entries()) {
          const beca = resultadosBecas.find((b) => b.id_beca === idBeca);
          const nombreBeca = beca?.name ?? 'Beca';
          requisitosExtra.push(
            `[requisitos oficiales de "${nombreBeca}"]:\n- ` + lista.join('\n- ')
          );
        }
      }
    } catch (err) {
      console.error('Error recuperando requisitos hermanos:', err);
    }
  }

  // 3) Búsqueda en conocimiento web aprendido
  try {
    const { data: webData } = await admin.database.rpc('match_conocimiento_web', {
      query_embedding: embedding,
      match_count: 3,
      min_score: 0.45,
    });
    if (Array.isArray(webData)) {
      conocimientoWeb = webData as ConocimientoWeb[];
    }
  } catch (err) {
    console.error('Error en match_conocimiento_web:', err);
  }

  const hayContexto =
    resultadosBecas.length > 0 || conocimientoWeb.length > 0 || requisitosExtra.length > 0;

  const bloquesBecas = resultadosBecas.map((r) => {
    const vigencia = r.vigente === false ? '[CONVOCATORIA CERRADA]' : '[CONVOCATORIA VIGENTE/ABIERTA]';
    const fecha = r.fecha_expiracion ? ` (Fecha límite: ${r.fecha_expiracion})` : '';
    const nivel = r.grado_academico ? ` [Nivel: ${r.grado_academico}]` : '';
    return `[${r.tipo_fuente}] "${r.name}" ${vigencia}${fecha}${nivel}:\n${r.content}`;
  });

  const bloquesWeb = conocimientoWeb.map((c) => `[web previo] ${c.contenido}`);

  const contextoTexto = [
    ...bloquesBecas,
    ...requisitosExtra,
    ...bloquesWeb,
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    contextoTexto,
    resultadosBecas,
    conocimientoWeb,
    hayContexto,
  };
}
