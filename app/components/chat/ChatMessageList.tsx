'use client'

import { useEffect, useRef } from "react"
import { useAIStore } from "@/stores/chatStore"
import { useChatHistoryStore } from "@/stores/chatHistoryStore"
import { subscriptionService } from "@/services/SubscriptionService"
import { ChatMessageItem } from "./ChatMessageItem"
import { Icon } from "../Icon"
import { SearchingStatus } from "../SourceBadge"
import Link from "next/link"

const SUGERENCIAS = [
  "¿Qué becas hay disponibles?",
  "¿Cuáles son los requisitos de ",
  "Compara dos becas de licenciatura",
  "¿Cuándo es la fecha límite de ",
]

export const ChatMessageList = () => {
  const messages = useAIStore((s) => s.messages)
  const isGenerating = useAIStore((s) => s.isGenerating)
  const setPrompt = useAIStore((s) => s.setPrompt)
  const generateResponse = useAIStore((s) => s.generateResponse)
  const isAuthenticated = useChatHistoryStore((s) => s.isAuthenticated)
  const startNewConversation = useChatHistoryStore((s) => s.startNewConversation)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleReminderClick = async () => {
    const { esPremium } = await subscriptionService.obtenerEstadoSuscripcion()
    if (esPremium) {
      setPrompt("hazme un recordatorio de: ")
    } else {
      generateResponse("hazme un recordatorio")
    }
  }

  const lastMessage = messages[messages.length - 1]
  const showTyping =
    isGenerating &&
    (lastMessage?.role === "user" ||
      (lastMessage?.role === "assistant" && lastMessage.content === ""))

  const isNearBottomRef = useRef(true)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    isNearBottomRef.current = distanceToBottom < 100
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    if (!isNearBottomRef.current) return

    if (isGenerating) {
      el.scrollTop = el.scrollHeight
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    }
  }, [messages, isGenerating])

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-8 pt-2"
    >
      <div className="mx-auto flex min-w-0 w-full max-w-2xl flex-col gap-6">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border-2 border-black bg-white px-4 py-2.5 shadow-[3px_3px_0px_#000000]">
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${
                isGenerating ? "animate-ping bg-black" : "bg-emerald-500"
              }`}
            />
            <span className="text-[11px] font-black uppercase tracking-wider text-black">
              {isGenerating ? "Procesando consulta…" : "Sesión de consulta activa"}
            </span>
          </div>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => startNewConversation()}
              className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-white px-2.5 py-1 text-[11.5px] font-black text-black shadow-[2px_2px_0px_#000000] transition-all hover:bg-black hover:text-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <span>+</span>
              <span>Nueva conversación</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border-2 border-dashed border-black bg-neutral-100 px-2.5 py-1 text-[10.5px] font-black text-black hover:bg-black hover:text-white"
            >
              <span>🔒 Inicia sesión para más chats →</span>
            </Link>
          )}
        </div>

        {messages.map((message, idx) => {
          const isLastAssistantStreaming =
            isGenerating &&
            idx === messages.length - 1 &&
            message.role === "assistant" &&
            message.content !== ""

          return (
            <ChatMessageItem
              key={message.id}
              message={message}
              isStreaming={isLastAssistantStreaming}
            />
          )
        })}

        {showTyping && (
          <article
            aria-live="polite"
            className="rise-in rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000]"
          >
            <div className="mb-3.5 flex items-center justify-between border-b-2 border-neutral-200 pb-2.5">
              <span className="font-display text-[13px] font-black text-black">
                BecaBot Asesor
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-black bg-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span>Pensando…</span>
              </span>
            </div>

            <SearchingStatus phase={lastMessage?.phase} />
          </article>
        )}

        {!isGenerating && (
          <div className="rounded-2xl border-2 border-black bg-neutral-50 p-4 shadow-[3px_3px_0px_#000000]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-black">
                ¿Qué más quieres consultar?
              </span>
              <button
                type="button"
                onClick={handleReminderClick}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-black px-3 py-1.5 text-[12px] font-black text-white shadow-[2px_2px_0px_#000000] transition-all hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Icon name="bell" className="size-3.5" />
                <span>Hacer recordatorio</span>
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {SUGERENCIAS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setPrompt(sug)}
                  className="rounded-xl border-2 border-black bg-white px-3 py-1.5 text-[12px] font-black text-black shadow-[2px_2px_0px_#000000] transition-all hover:bg-black hover:text-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
