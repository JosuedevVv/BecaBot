'use client'

import { useAIStore } from "@/stores/chatStore"

export const Brand = () => {
  const resetChat = useAIStore((store) => store.resetChat)

  return (
    <button
      type="button"
      onClick={resetChat}
      aria-label="BecaBot"
      className="inline-flex w-fit items-center font-display text-3xl font-semibold leading-none tracking-tight text-text"
    >
      Beca<span className="text-accent-deep">Bot</span>
    </button>
  )
}