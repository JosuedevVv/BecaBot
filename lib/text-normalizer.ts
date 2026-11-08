export function normalizarTexto(texto: string): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export const TOKEN_SIN_INFORMACION = '[[SIN_INFORMACION]]'
export const FRASE_SIN_INFORMACION = 'No tengo esa información en mis documentos.'

export function esRespuestaSinInformacion(texto: string): boolean {
  if (!texto) return true
  const limpio = texto.trim()
  if (limpio.includes(TOKEN_SIN_INFORMACION)) return true

  const normalizado = normalizarTexto(limpio)
  const fraseNormalizada = normalizarTexto(FRASE_SIN_INFORMACION)

  if (normalizado === fraseNormalizada) return true
  if (normalizado.startsWith(fraseNormalizada) && normalizado.length < 140) return true
  if (normalizado.includes(fraseNormalizada) && normalizado.length < 140) return true

  return false
}
