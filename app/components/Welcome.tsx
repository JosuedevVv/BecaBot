'use client'

import { useEffect, useRef } from "react"
import { useAIStore } from "@/stores/chatStore"
import AIResponse from "./AIResponse"
import { ChatInput } from "./ChatInput"
import { SearchingStatus, SourceBadge } from "./SourceBadge"
import { Icon, type IconName } from "./Icon"
import { questions } from "@/data/questions"

const suggestions = [
  "¿Qué becas hay disponibles?",
  "¿Qué requisitos se piden?",
  "¿Cómo es el proceso de aplicar?",
  "¿Cuáles son las fechas límite?",
]

const promptIcons: Record<number, IconName> = {
  1: "layers",
  2: "requirements",
  3: "apply",
  4: "calendar",
}

const ArrowRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.6"
    stroke="currentColor"
    aria-hidden
    className="size-4 shrink-0 -translate-x-1 text-accent-deep opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m0 0-5-5m5 5-5 5" />
  </svg>
)

const Refresh = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.7"
    stroke="currentColor"
    aria-hidden
    className="size-3.5 transition-transform duration-200 group-hover:-rotate-45"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 4v6h6M20 20v-6h-6M20 9a8 8 0 0 0-14.3-2.9L4 10M4 15a8 8 0 0 0 14.3 2.9L20 14"
    />
  </svg>
)

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-muted">
    {children}
  </span>
)

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
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-2 pb-10 pt-3">
              <div className="sticky top-0 z-10 -mx-2 flex items-center justify-between border-b border-line bg-bg/85 px-2 py-3 backdrop-blur-sm">
                <Eyebrow>Sesión</Eyebrow>
                <button
                  type="button"
                  onClick={resetChat}
                  className="group flex items-center gap-1.5 text-[12px] text-tertiary transition-colors duration-150 hover:text-text"
                >
                  <Refresh />
                  Nueva consulta
                </button>
              </div>

              {messages.map((message) =>
                message.role === "user" ? (
                  <div
                    key={message.id}
                    className="rise-in flex flex-col items-end gap-2"
                  >
                    <Eyebrow>Tú</Eyebrow>
                    <div className="max-w-[82%] rounded-bubble rounded-br-[6px] bg-accent-soft px-4 py-2.5 text-sm leading-relaxed text-text">
                      {message.content}
                    </div>
                  </div>
                ) : message.content === "" ? null : (
                  <article key={message.id} className="rise-in relative pl-5">
                    <span
                      aria-hidden
                      className={`absolute inset-y-1 left-0 w-px ${
                        message.source === "rag" ? "bg-accent-deep/45" : "bg-line"
                      }`}
                    />
                    <div className="flex flex-col gap-3">
                      {message.source && (
                        <SourceBadge source={message.source} />
                      )}

                      <AIResponse response={message.content} />

                      {message.citations && message.citations.length > 0 && (
                        <div className="flex flex-col gap-2.5 border-t border-line-soft pt-3">
                          <Eyebrow>Fuentes</Eyebrow>
                          <div className="flex flex-wrap gap-x-5 gap-y-2">
                            {message.citations.map((fuente) =>
                              fuente.url ? (
                                <a
                                  key={fuente.url}
                                  href={fuente.url}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  className="text-[13px] text-secondary underline decoration-line underline-offset-4 transition-colors duration-150 hover:text-accent-deep hover:decoration-accent-deep/50"
                                >
                                  {fuente.title}
                                </a>
                              ) : (
                                <span
                                  key={fuente.title}
                                  className="text-[13px] text-muted"
                                >
                                  {fuente.title}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {message.source === "web" && message.knowledge && (
                        <p className="flex items-center gap-2 text-[11px] text-muted">
                          <span className="size-1 rounded-full bg-accent-deep/60" />
                          Guardado para responder consultas similares sin volver
                          a buscar en la web.
                        </p>
                      )}

                      <p className="border-t border-line-soft pt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                        Orientación, no sustituye la convocatoria oficial
                      </p>
                    </div>
                  </article>
                ),
              )}

              {showTyping && (
                <div className="rise-in relative pl-5">
                  <span aria-hidden className="absolute inset-y-1 left-0 w-px bg-line" />
                  {lastMessage?.phase ? (
                    <SearchingStatus phase={lastMessage.phase} />
                  ) : (
                    <div className="flex items-center gap-1.5 py-1.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-accent-deep/60"
                          style={{
                            animation: `pulse 1.2s ease-in-out ${i * 0.18}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-line pt-4">
                <Eyebrow>¿Qué más preguntar?</Eyebrow>
                <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setPrompt(suggestion)}
                      className="text-[13px] text-tertiary underline-offset-4 transition-colors duration-150 hover:text-accent-deep hover:underline"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <ChatInput />
          </div>
        </>
      ) : (
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-2 py-10 md:py-14">
            <div className="flex items-center gap-3">
              <span className="h-px w-7 bg-accent-deep/60" />
              <span className="text-[10px] font-medium uppercase tracking-[0.26em] text-tertiary">
                Asesor de becas · México
              </span>
            </div>

            <h1 className="mt-6 max-w-xl font-display text-[2.625rem] font-light leading-[1.05] tracking-[-0.025em] text-text sm:text-[3.25rem] [text-wrap:balance]">
              Encuentra la beca que{" "}
              <span className="font-semibold text-accent-deep">sí</span> te
              corresponde
            </h1>

            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-tertiary">
              Convocatorias, requisitos, plazos y proceso de solicitud —
              explicados por un asesor que te dice de dónde viene cada dato.
            </p>

            <div className="mt-10 max-w-xl">
              <Eyebrow>Empieza por</Eyebrow>
              <ul className="mt-3 border-t border-line">
                {questions.map((question) => (
                  <li key={question.id}>
                    <button
                      type="button"
                      onClick={() => setPrompt(question.text)}
                      className="group flex w-full items-center gap-4 border-b border-line py-3.5 text-left transition-colors duration-200 hover:border-accent-deep/40"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] border border-line text-tertiary transition-colors duration-200 group-hover:border-accent-deep/40 group-hover:text-accent-deep">
                        <Icon
                          name={promptIcons[question.id]}
                          className="size-[15px]"
                        />
                      </span>
                      <span className="flex-1 text-[15px] text-secondary transition-colors duration-200 group-hover:text-text">
                        {question.text}
                      </span>
                      <ArrowRight />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <ChatInput />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
