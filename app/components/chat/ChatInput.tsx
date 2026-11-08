'use client'

import { useAIStore } from '@/stores/chatStore'

export const ChatInput = () => {
  const prompt = useAIStore((store) => store.prompt)
  const setPrompt = useAIStore((store) => store.setPrompt)
  const generateResponse = useAIStore((store) => store.generateResponse)
  const isGenerating = useAIStore((store) => store.isGenerating)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    setPrompt(textarea.value)
    textarea.style.height = "auto"
    const lineHeight = 24
    const maxHeight = lineHeight * 4
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    if (!prompt.trim() || isGenerating) return
    const copyMessage = prompt
    setPrompt("")
    await generateResponse(copyMessage)
  }

  const armed = prompt.trim().length > 0 && !isGenerating

  return (
    <div className="relative z-10 px-2 pb-5 pt-2">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-2xl items-end gap-3 rounded-2xl border-2 border-black bg-white px-4 py-3 shadow-[4px_4px_0px_#000000] transition-all focus-within:shadow-[6px_6px_0px_#000000]"
      >
        <textarea
          value={prompt}
          onChange={handleChange}
          disabled={isGenerating}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          rows={1}
          aria-label="Escribe tu consulta sobre becas"
          className="max-h-24 min-h-6 flex-1 resize-none self-center bg-transparent py-1 text-[15px] font-bold leading-6 text-black outline-none placeholder:font-medium placeholder:text-neutral-500 disabled:opacity-60"
          placeholder={
            isGenerating
              ? "BecaBot está respondiendo tu consulta…"
              : "Pregunta por una beca, promedio, requisitos o fechas…"
          }
        />

        <button
          type="submit"
          disabled={!armed}
          aria-label={isGenerating ? "Generando respuesta" : "Enviar consulta"}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black transition-all ${
            isGenerating
              ? "bg-black text-white shadow-[2px_2px_0px_#000000]"
              : armed
                ? "bg-black text-white shadow-[2px_2px_0px_#000000] hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                : "bg-neutral-100 text-neutral-400 opacity-60"
          }`}
        >
          {isGenerating ? (
            <span
              aria-hidden
              className="size-4 animate-spin rounded-xs border-2 border-white border-t-transparent"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              aria-hidden
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
              />
            </svg>
          )}
        </button>
      </form>

      <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] font-bold text-neutral-600">
        Presiona Enter para enviar · Shift + Enter para salto de línea
      </p>
    </div>
  )
}
