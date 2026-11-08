export type OrigenRespuesta = "rag" | "web"

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type ChatFuente = {
  title: string
  url?: string
}

export type ChatEvent =
  | { type: "status"; phase: OrigenRespuesta }
  | { type: "source"; source: OrigenRespuesta }
  | { type: "delta"; text: string }
  | { type: "citations"; items: ChatFuente[] }
  | { type: "knowledge"; guardado: boolean }
  | { type: "error"; message: string }
  | { type: "done" }

export const SIN_INFORMACION = "No tengo esa información en mis documentos."

export const encodeEvent = (event: ChatEvent): string =>
  `${JSON.stringify(event)}\n`
