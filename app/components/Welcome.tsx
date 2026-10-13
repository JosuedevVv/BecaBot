'use client'

import { useEffect, useRef } from "react"
import { useAIStore } from "@/stores/chatStore"
import AIResponse from "./AIResponse"
import { ChatInput } from "./ChatInput"
import { GraduationCap } from "./GraduationCap"
// import { PremiumStrip } from "./PremiumCard"
import { questions } from "@/data/questions"

const suggestions = [
  "¿Qué becas hay disponibles?",
  "¿Qué requisitos se piden?",
  "¿Cómo es el proceso de aplicar?",
  "¿Cuáles son las fechas límite?",
]

export const Welcome = () => {
  const hasSubmited = useAIStore((store) => store.hasSubmitted)
  const messages = useAIStore((store) => store.messages)
  const isGenerating = useAIStore((store) => store.isGenerating)
  const resetChat = useAIStore((store) => store.resetChat)
  const setPrompt = useAIStore((store) => store.setPrompt)

  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMessage = messages[messages.length - 1]

  const showTyping =
    isGenerating &&
    (lastMessage?.role === "user" ||
      (lastMessage?.role === "assistant" && lastMessage.content === ""))

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, isGenerating, hasSubmited])

  return (
    <div className="flex min-h-0 flex-col">
      {hasSubmited ? (
        <>
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          >
            <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-3 px-2 pb-10 pt-2">
              <GraduationCap
                aria-hidden
                className="pointer-events-none absolute -bottom-4 -right-6 hidden opacity-[0.06] lg:block"
                size={220}
              />
              <div className="sticky top-0 z-10 -mx-2 mb-1 flex items-center justify-between rounded-card border border-line bg-bg/90 px-4 py-3 backdrop-blur-[2px]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-secondary">
                    Chat Actual
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetChat}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-secondary transition-colors duration-150 hover:border-accent-deep/40 hover:text-text"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                    className="size-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v6h6M20 20v-6h-6M20 9a8 8 0 0 0-14.3-2.9L4 10M4 15a8 8 0 0 0 14.3 2.9L20 14"
                    />
                  </svg>
                  Nueva consulta
                </button>
              </div>

              {messages.map((message) =>
                message.role === "user" ? (
                  <div key={message.id} className="flex flex-col items-end gap-1.5">
                    <span className="pr-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                      Tu consulta
                    </span>
                    <div className="relative max-w-[82%] rounded-[18px] rounded-br-[6px] border border-accent-deep/15 bg-accent-soft px-4 py-3 text-sm leading-relaxed text-text shadow-card">
                      {message.content}
                      <span className="absolute -right-1.5 -top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-bg">
                        <GraduationCap size={9} />
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    key={message.id}
                    className="rounded-card border border-line bg-surface px-5 py-4 shadow-card"
                  >
                    <div className="pt-3">
                      <AIResponse response={message.content} />
                    </div>
                    <div className="mt-3 border-t border-line-soft pt-3 text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                      Este chatbot es de orientacion y no sustituye la convocatoria oficial
                    </div>
                  </div>
                ),
              )}

              <div className="flex flex-col gap-2.5 rounded-card border border-line bg-surface px-5 py-4 shadow-card">
                <div className="flex items-center justify-center gap-2.5 border-b border-line-soft pb-3">
                  <div>
                    <p className="font-display text-[15px] font-medium leading-tight text-text">
                      ¿Que mas preguntar?
                    </p>
                    <p className="text-[11px] text-tertiary">
                    </p>
                  </div>
                </div>
                <div className="flex justify-center flex-wrap gap-1.5">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setPrompt(suggestion)}
                      className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-xs text-secondary transition-colors duration-150 hover:border-accent-deep/40 hover:text-text"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {showTyping && (
                <div className="rounded-card border border-line bg-surface px-5 py-4 shadow-card">
                  <div className="flex items-center gap-1.5 pt-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-accent-deep/60"
                        style={{ animation: `pulse 1.2s ease-in-out ${i * 0.18}s infinite` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <ChatInput />
            {/* <PremiumStrip /> */}
          </div>
        </>
      ) : (
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="relative mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-2 py-8 md:py-12">
            <GraduationCap
              aria-hidden
              className="pointer-events-none absolute -top-4 right-0 hidden opacity-[0.1] md:block"
              size={256}
            />
            <h1 className="mt-6 max-w-lg font-display text-[2.5rem] font-light leading-[1.08] tracking-tight text-text [text-wrap:balance]">
              Explora becas y{" "}
              <span className="font-normal text-accent-deep">orienta</span> tu
              solicitud
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-tertiary">
              Convocatorias, requisitos, plazos y proceso de solicitud — con un
              asesor dedicado a becas en México.
            </p>

            <div className="mt-8 max-w-lg">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
                ¿Que preguntar?
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {questions.map((question) => (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setPrompt(question.text)}
                    className="rounded-full border border-line bg-surface-2 px-4 py-2.5 text-sm text-secondary transition-all duration-150 hover:-translate-y-0.5 hover:border-accent-deep/40 hover:text-text active:translate-y-0"
                  >
                    {question.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <ChatInput />
            </div>

            {/* <PremiumStrip /> */}
          </div>
        </div>
      )}
    </div>
  )
}
