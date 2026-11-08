'use client'

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useAIStore } from "@/stores/chatStore"
import { useChatHistoryStore } from "@/stores/chatHistoryStore"
import { ChatEmptyState } from "./ChatEmptyState"
import { ChatMessageList } from "./ChatMessageList"
import { ChatInput } from "./ChatInput"

export const ChatWorkspace = () => {
  const searchParams = useSearchParams()
  const hasSubmitted = useAIStore((s) => s.hasSubmitted)
  const setPrompt = useAIStore((s) => s.setPrompt)
  const generateResponse = useAIStore((s) => s.generateResponse)
  const selectConversation = useChatHistoryStore((s) => s.selectConversation)
  const initializedParam = useRef(false)

  useEffect(() => {
    if (initializedParam.current) return

    const chatId = searchParams.get("chat")
    if (chatId && chatId.trim()) {
      initializedParam.current = true
      selectConversation(chatId.trim())
      return
    }

    const q = searchParams.get("q")
    if (q && q.trim()) {
      initializedParam.current = true
      generateResponse(q.trim())
    }
  }, [searchParams, generateResponse, selectConversation])

  const handleSelectPrompt = (texto: string) => {
    setPrompt(texto)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {hasSubmitted ? (
        <>
          <ChatMessageList />
          <div className="shrink-0">
            <ChatInput />
          </div>
        </>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <ChatEmptyState onSelectPrompt={handleSelectPrompt} />
          <div className="shrink-0">
            <ChatInput />
          </div>
        </div>
      )}
    </div>
  )
}
