export function approxTokens(texto: string): number {
  return Math.ceil((texto ?? '').length / 4);
}

export function chunkText(texto: string, maxTokens = 500, overlapTokens = 50): string[] {
  const t = (texto ?? '').trim();
  if (!t) return [];
  if (approxTokens(t) <= maxTokens) return [t];

  const maxChars = maxTokens * 4;
  const overlapChars = overlapTokens * 4;
  const chunks: string[] = [];
  let start = 0;

  while (start < t.length) {
    let end = Math.min(start + maxChars, t.length);
    if (end < t.length) {
      const lastSpace = t.lastIndexOf(' ', end);
      if (lastSpace > start + maxChars * 0.6) end = lastSpace;
    }
    const chunk = t.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= t.length) break;
    start = Math.max(end - overlapChars, start + 1);
  }

  return chunks;
}

export function tituloDesdePregunta(pregunta: string, maxPalabras = 6): string {
  const palabras = (pregunta ?? '').trim().split(/\s+/).filter(Boolean).slice(0, maxPalabras);
  const titulo = palabras.join(' ');
  return titulo.length > 60 ? titulo.slice(0, 60).trim() : titulo;
}

export function normalizarTexto(texto: string): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export const TOKEN_SIN_INFORMACION = '[[SIN_INFORMACION]]';
export const FRASE_SIN_INFORMACION = 'No tengo esa información en mis documentos.';

export function esRespuestaSinInformacion(texto: string): boolean {
  if (!texto) return true;
  const limpio = texto.trim();
  if (limpio.includes(TOKEN_SIN_INFORMACION)) return true;

  const normalizado = normalizarTexto(limpio);
  const fraseNormalizada = normalizarTexto(FRASE_SIN_INFORMACION);

  if (normalizado === fraseNormalizada) return true;
  if (normalizado.startsWith(fraseNormalizada) && normalizado.length < 140) return true;
  if (normalizado.includes(fraseNormalizada) && normalizado.length < 140) return true;

  return false;
}
