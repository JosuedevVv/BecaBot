import dns from 'node:dns'

dns.setDefaultResultOrder('ipv4first')

export async function generarEmbedding(texto: string): Promise<number[]> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('Falta OPENROUTER_API_KEY en variables de entorno.')
  }

  const limpio = texto.replace(/[\r\n\t]+/g, ' ').trim()
  if (!limpio) {
    throw new Error('El texto para generar embedding no puede estar vacío.')
  }

  let ultimoError: unknown = null

  for (let intento = 1; intento <= 2; intento++) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/text-embedding-3-small',
          input: limpio,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`OpenRouter /embeddings devolvió ${res.status}: ${errorText}`)
      }

      const json = await res.json()
      const vector = json?.data?.[0]?.embedding

      if (!Array.isArray(vector) || vector.length === 0) {
        throw new Error('Respuesta inválida de embeddings de OpenRouter')
      }

      return vector as number[]
    } catch (err) {
      ultimoError = err
      if (intento < 2) {
        await new Promise((r) => setTimeout(r, 400))
      }
    }
  }

  throw ultimoError instanceof Error
    ? ultimoError
    : new Error('No se pudo generar el embedding con OpenRouter')
}
