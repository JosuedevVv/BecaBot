import { json, preflight } from './_shared/http.ts';
import { adminClient, getUserId } from './_shared/insforge.ts';
import { type ChatMessage } from './_shared/openrouter.ts';
import { chat } from './_shared/groq.ts';
import {
  tituloDesdePregunta,
  esRespuestaSinInformacion,
  FRASE_SIN_INFORMACION,
  TOKEN_SIN_INFORMACION,
} from './_shared/text.ts';
import { recuperarContexto } from './_shared/rag-retriever.ts';

const INSTRUCCION_LLM =
  'Eres BecaBot, un asistente especializado única y exclusivamente en becas en México.\n' +
  'Responde la pregunta del usuario basándote con rigor en la información del "Contexto" provisto.\n' +
  'Si el Contexto contiene información de la beca, explica requisitos, fechas y detalles con claridad.\n' +
  'REGLA ESTRICTA DE PAÍSES: Si el usuario pregunta por becas de otro país (fuera de México), NUNCA proporciones detalles ' +
  '(prohibido dar montos o requisitos de becas extranjeras); indícale brevemente a dónde puede consultar (ministerio de educación ' +
  'del país, embajada, AMEXCID) y recuerda que tu ámbito es exclusivamente México.\n' +
  'Si el Contexto realmente NO contiene la información necesaria para responder la pregunta, ' +
  `responde exactamente: '${FRASE_SIN_INFORMACION}' o incluye '${TOKEN_SIN_INFORMACION}'.`;

type AskBody = {
  pregunta?: string;
  pregunta_contextualizada?: string;
  id_conversacion?: string | null;
  grado_academico?: string | null;
  historial?: ChatMessage[];
};

type Fuente = {
  id_beca: string | null;
  name: string;
  tipo_fuente: string;
  score: number;
};

export default async function (req: Request): Promise<Response> {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== 'POST') {
    return json({ error: 'Metodo no permitido' }, 405);
  }

  let body: AskBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON invalido' }, 400);
  }

  const pregunta = String(body.pregunta ?? '').trim();
  if (!pregunta) return json({ error: 'pregunta es obligatoria' }, 400);

  const preguntaBusqueda = String(body.pregunta_contextualizada ?? pregunta).trim();
  const grado = body.grado_academico ? String(body.grado_academico) : null;

  const admin = adminClient();
  const userId = await getUserId(req);

  // 1) Recuperación semántica modular
  let contextoTexto = '';
  let resultadosBecas: any[] = [];
  let conocimientoWeb: any[] = [];
  let hayContexto = false;

  try {
    const res = await recuperarContexto(preguntaBusqueda, grado);
    contextoTexto = res.contextoTexto;
    resultadosBecas = res.resultadosBecas;
    conocimientoWeb = res.conocimientoWeb;
    hayContexto = res.hayContexto;
  } catch (err) {
    return json({ error: `Error en recuperación RAG: ${(err as Error).message}` }, 502);
  }

  // 2) Conversación (si hay usuario autenticado)
  let idConversacion: string | null = body.id_conversacion ? String(body.id_conversacion) : null;
  if (userId && !idConversacion) {
    const { data } = await admin.database
      .from('conversaciones')
      .insert([{ id_usuario: userId, title: tituloDesdePregunta(pregunta) }])
      .select();
    idConversacion = data?.[0]?.id_conversacion ?? null;
  }

  let respuesta: string;
  let fuentes: Fuente[] = [];
  let sinInformacion = false;

  if (!hayContexto) {
    respuesta = FRASE_SIN_INFORMACION;
    sinInformacion = true;
  } else {
    // Historial: si vino en body se usa, de lo contrario se consulta si hay idConversacion
    let historialMensajes: ChatMessage[] = Array.isArray(body.historial) ? body.historial : [];
    if (userId && idConversacion && historialMensajes.length === 0) {
      const { data } = await admin.database
        .from('mensajes')
        .select('mensaje,tipo,created_at')
        .eq('id_conversacion', idConversacion)
        .order('created_at', { ascending: false })
        .limit(8);
      historialMensajes = (data ?? [])
        .slice()
        .reverse()
        .map((m: { mensaje: string; tipo: string }) => ({
          role: m.tipo === 'assistant' ? 'assistant' : 'user',
          content: m.mensaje,
        }));
    }

    try {
      respuesta = await chat([
        { role: 'system', content: `${INSTRUCCION_LLM}\n\nContexto:\n${contextoTexto}` },
        ...historialMensajes,
        { role: 'user', content: pregunta },
      ]);
    } catch (err) {
      return json({ error: `Error consultando el modelo: ${(err as Error).message}` }, 502);
    }

    if (!respuesta || esRespuestaSinInformacion(respuesta)) {
      respuesta = FRASE_SIN_INFORMACION;
      sinInformacion = true;
      fuentes = [];
    } else {
      sinInformacion = false;
      fuentes = [
        ...resultadosBecas.map((r) => ({
          id_beca: r.id_beca,
          name: r.name,
          tipo_fuente: r.tipo_fuente,
          score: r.score,
        })),
        ...conocimientoWeb.map((c) => ({
          id_beca: null,
          name: c.pregunta,
          tipo_fuente: 'web',
          score: c.score,
        })),
      ];
    }
  }

  if (userId && idConversacion) {
    await admin.database.from('mensajes').insert([
      { id_conversacion: idConversacion, mensaje: pregunta, tipo: 'user' },
      { id_conversacion: idConversacion, mensaje: respuesta, tipo: 'assistant' },
    ]);
  }

  return json({
    respuesta,
    fuentes,
    sin_informacion: sinInformacion,
    id_conversacion: idConversacion,
  });
}
