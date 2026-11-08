import { json, preflight } from './_shared/http.ts';
import { adminClient, isServiceRole } from './_shared/insforge.ts';
import { generarEmbedding } from './_shared/openrouter.ts';
import { chat } from './_shared/groq.ts';

const UMBRAL_DUPLICADO = 0.92;
const MIN_RESUMEN = 60;

const SISTEMA_JUEZ =
  'Eres un curador estricto de una base de conocimiento sobre becas en MÉXICO.\n' +
  'Recibes una pregunta y la respuesta que un asistente generó usando búsqueda web.\n' +
  'Decide si la respuesta aporta conocimiento factual, concreto, verídico y reutilizable sobre ' +
  'becas EN MÉXICO (nombres de becas mexicanas, montos en MXN, requisitos, fechas, instituciones de México como SEP, CONAHCYT, IPES, UNAM, etc.).\n' +
  'REGLAS DE DESCARTE OBLIGATORIAS:\n' +
  '- DESCARTA (util=false) cualquier beca de otro país (España, Colombia, EE.UU., etc.) o respuestas que solo den portales externos extranjeros.\n' +
  '- DESCARTA saludos, charla general, evasivas o respuestas que solo digan que no hay información.\n' +
  'Si es útil y exclusiva de México, redacta un "resumen" autocontenido en español (2 a 5 frases) que conserve los datos clave, y un "tema" (etiqueta corta en minúsculas).\n' +
  'Responde EXCLUSIVAMENTE con JSON válido, sin texto adicional ni fences:\n' +
  '{"util": true|false, "tema": "...", "resumen": "..."}';

type FuenteWeb = { title?: string; url?: string };

type GuardarBody = {
  pregunta?: string;
  respuesta?: string;
  fuentes?: FuenteWeb[];
};

type Juicio = {
  util: boolean;
  tema: string;
  resumen: string;
};

function extraerJson(raw: string): Record<string, unknown> | null {
  const texto = (raw ?? '').replace(/```json/gi, '').replace(/```/g, '').trim();
  const inicio = texto.indexOf('{');
  const fin = texto.lastIndexOf('}');
  if (inicio === -1 || fin === -1 || fin <= inicio) return null;
  try {
    return JSON.parse(texto.slice(inicio, fin + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function parsearJuicio(raw: string): Juicio {
  const obj = extraerJson(raw);
  if (!obj) return { util: false, tema: '', resumen: '' };
  return {
    util: obj.util === true || obj.util === 'true',
    tema: String(obj.tema ?? '').trim(),
    resumen: String(obj.resumen ?? '').trim(),
  };
}

function formatearFuentes(fuentes: FuenteWeb[]): string {
  if (fuentes.length === 0) return '(sin fuentes)';
  return fuentes
    .map((f) => `- ${f.title ?? f.url ?? 'fuente'}${f.url ? ` (${f.url})` : ''}`)
    .join('\n');
}

export default async function (req: Request): Promise<Response> {
  const pf = preflight(req);
  if (pf) return pf;

  if (!isServiceRole(req)) {
    return json({ error: 'No autorizado: se requiere service role' }, 401);
  }
  if (req.method !== 'POST') {
    return json({ error: 'Metodo no permitido' }, 405);
  }

  let body: GuardarBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON invalido' }, 400);
  }

  const pregunta = String(body.pregunta ?? '').trim();
  const respuesta = String(body.respuesta ?? '').trim();
  const fuentes = Array.isArray(body.fuentes)
    ? body.fuentes
        .map((f) => ({ title: f?.title ? String(f.title) : undefined, url: f?.url ? String(f.url) : undefined }))
        .filter((f) => f.title || f.url)
    : [];

  if (!pregunta) return json({ error: 'pregunta es obligatoria' }, 400);
  if (!respuesta) return json({ guardado: false, motivo: 'respuesta vacia' });

  let juicio: Juicio;
  try {
    const raw = await chat([
      { role: 'system', content: SISTEMA_JUEZ },
      {
        role: 'user',
        content:
          `PREGUNTA: ${pregunta}\n\n` +
          `RESPUESTA (de la web): ${respuesta}\n\n` +
          `FUENTES:\n${formatearFuentes(fuentes)}`,
      },
    ]);
    juicio = parsearJuicio(raw);
  } catch (err) {
    return json({ guardado: false, motivo: `error del juez: ${(err as Error).message}` });
  }

  if (!juicio.util) {
    return json({ guardado: false, motivo: 'no se considero util o es de otro pais' });
  }
  if (juicio.resumen.length < MIN_RESUMEN) {
    return json({ guardado: false, motivo: 'resumen demasiado corto' });
  }

  const contenido = juicio.tema
    ? `${juicio.tema}\n\n${juicio.resumen}`
    : juicio.resumen;

  const admin = adminClient();

  let embedding: number[];
  try {
    embedding = await generarEmbedding(`${pregunta}\n\n${contenido}`);
  } catch (err) {
    return json({ error: `Error generando embedding: ${(err as Error).message}` }, 502);
  }

  try {
    const { data } = await admin.database.rpc('match_conocimiento_web', {
      query_embedding: embedding,
      match_count: 1,
      min_score: UMBRAL_DUPLICADO,
    });
    const similar = Array.isArray(data) ? data[0] : null;
    if (similar && Number(similar.score) >= UMBRAL_DUPLICADO) {
      return json({
        guardado: false,
        motivo: 'ya existe conocimiento similar',
        id_conocimiento: similar.id_conocimiento,
      });
    }
  } catch {
  }

  const { data, error } = await admin.database
    .from('conocimiento_web')
    .insert([{ pregunta, contenido, fuentes, embedding }])
    .select();

  if (error || !data?.length) {
    return json({ error: `Error guardando conocimiento: ${error?.message ?? 'desconocido'}` }, 500);
  }

  return json({ guardado: true, id_conocimiento: data[0].id_conocimiento });
}
