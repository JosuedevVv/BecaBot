import { json, preflight } from './_shared/http.ts';
import { adminClient, isServiceRole } from './_shared/insforge.ts';
import { generarEmbedding, generarEmbeddings } from './_shared/openrouter.ts';
import { chunkText } from './_shared/text.ts';

type IngestBody = {
  name?: string;
  description?: string;
  grado_academico?: string;
  fecha_expiracion?: string | null;
  requisitos?: string[];
};

export default async function (req: Request): Promise<Response> {
  const pf = preflight(req);
  if (pf) return pf;

  // Solo service role / clave de admin.
  if (!isServiceRole(req)) {
    return json({ error: 'No autorizado: se requiere service role' }, 401);
  }
  if (req.method !== 'POST') {
    return json({ error: 'Metodo no permitido' }, 405);
  }

  let body: IngestBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON invalido' }, 400);
  }

  const name = String(body.name ?? '').trim();
  const description = String(body.description ?? '').trim();
  const grado = String(body.grado_academico ?? '').trim() || null;
  const fechaExp = body.fecha_expiracion ? String(body.fecha_expiracion) : null;
  const requisitos = Array.isArray(body.requisitos)
    ? body.requisitos.map((r) => String(r).trim()).filter(Boolean)
    : [];

  if (!name) return json({ error: 'name es obligatorio' }, 400);
  if (fechaExp && !/^\d{4}-\d{2}-\d{2}$/.test(fechaExp)) {
    return json({ error: 'fecha_expiracion debe tener formato YYYY-MM-DD' }, 400);
  }

  const admin = adminClient();

  // 1) Beca + embedding de "name + grado + description"
  let embeddingBeca: number[];
  try {
    const textoBeca = `Beca: ${name}${grado ? ` (Grado: ${grado})` : ''}\n\n${description}`;
    embeddingBeca = await generarEmbedding(textoBeca);
  } catch (err) {
    return json({ error: `Error generando embedding: ${(err as Error).message}` }, 502);
  }

  const { data: becas, error: becaError } = await admin.database
    .from('becas')
    .insert([
      {
        name,
        description: description || null,
        grado_academico: grado,
        fecha_expiracion: fechaExp,
        embedding: embeddingBeca,
        fecha_consulta: new Date().toISOString(),
      },
    ])
    .select();

  if (becaError || !becas?.length) {
    return json({ error: `Error insertando beca: ${becaError?.message ?? 'desconocido'}` }, 500);
  }
  const id_beca: string = becas[0].id_beca;

  // 2) Chunks: con prefijo contextual de la beca para el embedding
  const trozos = chunkText(description);
  const idsChunks: string[] = [];
  if (trozos.length > 1) {
    try {
      const trozosParaEmbedding = trozos.map(
        (t) => `Fragmento de la beca "${name}"${grado ? ` (${grado})` : ''}:\n${t}`
      );
      const embeddings = await generarEmbeddings(trozosParaEmbedding);
      const filas = trozos.map((content, i) => ({
        id_beca,
        content,
        embedding: embeddings[i],
      }));
      const { data, error } = await admin.database.from('beca_chunks').insert(filas).select();
      if (error) {
        return json({ error: `Error insertando chunks: ${error.message}` }, 500);
      }
      for (const row of data ?? []) idsChunks.push(row.id_chunk);
    } catch (err) {
      return json({ error: `Error generando chunks: ${(err as Error).message}` }, 502);
    }
  }

  // 3) Requisitos: con prefijo contextual de la beca para el embedding
  const idsRequisitos: string[] = [];
  if (requisitos.length > 0) {
    try {
      const reqsParaEmbedding = requisitos.map(
        (r) => `Requisito de la beca "${name}"${grado ? ` (${grado})` : ''}: ${r}`
      );
      const embeddings = await generarEmbeddings(reqsParaEmbedding);
      const filas = requisitos.map((descripcion, i) => ({
        id_beca,
        descripcion,
        embedding: embeddings[i],
      }));
      const { data, error } = await admin.database.from('requisitos').insert(filas).select();
      if (error) {
        return json({ error: `Error insertando requisitos: ${error.message}` }, 500);
      }
      for (const row of data ?? []) idsRequisitos.push(row.id_requisito);
    } catch (err) {
      return json({ error: `Error generando requisitos: ${(err as Error).message}` }, 502);
    }
  }

  return json({
    id_beca,
    ids_requisitos: idsRequisitos,
    ids_chunks: idsChunks,
    chunks_generados: idsChunks.length,
  });
}
