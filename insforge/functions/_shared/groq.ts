/**
 * Completaciones de chat via Groq (API compatible con OpenAI).
 * La clave vive en el secret GROQ_API_KEY del proyecto; nunca en el codigo.
 * Los embeddings NO se hacen aqui: Groq no ofrece embeddings, siguen en
 * OpenRouter (_shared/openrouter.ts).
 */
import type { ChatMessage } from './openrouter.ts';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const CHAT_MODEL = Deno.env.get('GROQ_CHAT_MODEL') ?? 'openai/gpt-oss-120b';

function apiKey(): string {
  const key = Deno.env.get('GROQ_API_KEY');
  if (!key) {
    throw new Error('GROQ_API_KEY no configurada');
  }
  return key;
}

/** Completacion de chat (respuesta del asistente). */
export async function chat(messages: ChatMessage[]): Promise<string> {
  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      temperature: 0.2,
      max_tokens: 800,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Groq /chat/completions -> ${res.status}: ${detail}`);
  }
  const json = await res.json();
  return json?.choices?.[0]?.message?.content ?? '';
}

export { CHAT_MODEL };
