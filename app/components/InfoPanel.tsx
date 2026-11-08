'use client'

import { useEffect } from 'react'
import { useChatHistoryStore } from '@/stores/chatHistoryStore'
import { ChatHistoryGuestLock } from './chat/history/ChatHistoryGuestLock'
import { ChatHistoryHeader } from './chat/history/ChatHistoryHeader'
import { ChatHistoryList } from './chat/history/ChatHistoryList'

export const InfoPanel = () => {
  const initHistory = useChatHistoryStore((s) => s.initHistory)
  const isAuthenticated = useChatHistoryStore((s) => s.isAuthenticated)
  const isLoadingHistory = useChatHistoryStore((s) => s.isLoadingHistory)

  useEffect(() => {
    initHistory()
  }, [initHistory])

  if (isLoadingHistory) {
    return (
      <div
        aria-label="Cargando historial"
        className="flex h-full flex-col justify-between gap-4 overflow-hidden rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000]"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
            <div className="h-3 w-28 animate-pulse rounded bg-neutral-300" />
            <div className="h-4 w-12 animate-pulse rounded bg-neutral-200" />
          </div>
          <div className="h-9 w-full animate-pulse rounded-xl bg-neutral-200" />
          <div className="h-8 w-full animate-pulse rounded-lg bg-neutral-100" />
        </div>

        <div className="flex flex-1 flex-col gap-2 pt-2">
          <div className="h-14 w-full animate-pulse rounded-xl bg-neutral-100" />
          <div className="h-14 w-full animate-pulse rounded-xl bg-neutral-100" />
          <div className="h-14 w-full animate-pulse rounded-xl bg-neutral-100" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <ChatHistoryGuestLock />
  }

  return (
    <div
      aria-label="Panel de Historial de Chats"
      className="flex h-full flex-col justify-between gap-3.5 overflow-hidden rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000]"
    >
      <ChatHistoryHeader />
      <ChatHistoryList />

      <div className="border-t-2 border-neutral-200 pt-2 text-center text-[10px] font-bold text-neutral-600">
        Chats guardados en tu expediente · BecaBot México
      </div>
    </div>
  )
}
