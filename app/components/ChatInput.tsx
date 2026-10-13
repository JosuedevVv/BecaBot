'use client'

import { useAIStore } from '@/stores/chatStore'
import { Icon } from './Icon'

export const ChatInput = () => {
  const prompt = useAIStore((store) => store.prompt)
  const setPrompt = useAIStore((store) => store.setPrompt)
  const generateResponse = useAIStore((store) => store.generateResponse)

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

    if (!prompt.trim()) return

    const copyMessage = prompt

    setPrompt("")
    await generateResponse(copyMessage)
  }

  const armed = prompt.trim().length > 0

  return (
    <div className="relative z-10 px-2 pb-5 pt-2">
      <div className="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-transparent to-bg" />

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-2xl items-end gap-2 rounded-card border border-line bg-surface-2 px-3 py-2.5 shadow-elevated transition-colors duration-200 focus-within:border-accent-deep/40"
      >
        <span className="shrink-0 pb-2.5 text-accent-deep/70">
          <Icon name="compass" className="size-5" />
        </span>

        <textarea
          value={prompt}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          rows={1}
          className="max-h-24 min-h-6 flex-1 resize-none self-center bg-transparent px-1 py-1 text-[15px] leading-6 text-text outline-none placeholder:text-tertiary"
          placeholder="Busca una beca, requisito o plazo…"
        />

        <button
          type="submit"
          disabled={!armed}
          aria-label="Enviar consulta"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
            armed
              ? "bg-accent-deep text-accent-soft shadow-card active:scale-[0.97]"
              : "border border-line bg-input text-tertiary"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
        </button>
      </form>

      <p className="mx-auto mt-2.5 max-w-2xl text-center text-[11px] text-muted">
        Enter para enviar · Shift + Enter para nueva línea
      </p>
    </div>
  )
}