import Deno from 'deno';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

const EMBEDDING_MODEL =
  Deno.env.get('OPENROUTER_EMBEDDING_MODEL') ?? 'openai/text-embedding-3-small';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

function apiKey(): string {
  const key = Deno.env.get('OPENROUTER_API_KEY');
  if (!key) {
    throw new Error('OPENROUTER_API_KEY no configurada en el Model Gateway');
  }
  return key;
}

async function openrouter(path: string, payload: unknown): Promise<any> {
  const res = await fetch(`${OPENROUTER_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`OpenRouter ${path} -> ${res.status}: ${detail}`);
  }
  return res.json();
}

export async function generarEmbedding(texto: string): Promise<number[]> {
  const json = await openrouter('/embeddings', {
    model: EMBEDDING_MODEL,
    input: texto,
  });
  const emb = json?.data?.[0]?.embedding;
  if (!Array.isArray(emb)) {
    throw new Error('Respuesta de embeddings invalida');
  }
  return emb;
}

export async function generarEmbeddings(textos: string[]): Promise<number[][]> {
  if (textos.length === 0) return [];
  const json = await openrouter('/embeddings', {
    model: EMBEDDING_MODEL,
    input: textos,
  });
  const data = Array.isArray(json?.data) ? json.data : [];
  return data
    .slice()
    .sort((a: any, b: any) => (a.index ?? 0) - (b.index ?? 0))
    .map((d: any) => d.embedding);
}

export { EMBEDDING_MODEL };
