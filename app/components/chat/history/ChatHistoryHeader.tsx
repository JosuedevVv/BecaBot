'use client'

import { useChatHistoryStore } from '@/stores/chatHistoryStore'

export const ChatHistoryHeader = () => {
  const conversaciones = useChatHistoryStore((s) => s.conversaciones)
  const searchQuery = useChatHistoryStore((s) => s.searchQuery)
  const setSearchQuery = useChatHistoryStore((s) => s.setSearchQuery)
  const startNewConversation = useChatHistoryStore((s) => s.startNewConversation)
  const activeConversationId = useChatHistoryStore((s) => s.activeConversationId)

  return (
    <div className="flex flex-col gap-2.5">
      {/* Cabecera y contador */}
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <span className="text-[11px] font-black uppercase tracking-wider text-black">
          Historial de chats
        </span>
        <span className="rounded border-2 border-black bg-neutral-100 px-1.5 py-0.5 text-[9.5px] font-black text-black">
          {conversaciones.length} {conversaciones.length === 1 ? 'chat' : 'chats'}
        </span>
      </div>

      {/* Botón Nueva Conversación */}
      <button
        type="button"
        onClick={() => startNewConversation()}
        className={`flex w-full items-center justify-between rounded-xl border-2 border-black px-3 py-2 text-[12.5px] font-black transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
          activeConversationId === null
            ? 'bg-black text-white shadow-[3px_3px_0px_#000000]'
            : 'bg-white text-black shadow-[2px_2px_0px_#000000] hover:bg-neutral-100'
        }`}
      >
        <span className="flex items-center gap-2">
          <span className="text-base leading-none">+</span>
          <span>Nueva conversación</span>
        </span>
        {activeConversationId === null && (
          <span className="rounded bg-neutral-800 px-1.5 py-0.2 text-[9px] text-neutral-300">
            Actual
          </span>
        )}
      </button>

      {/* Buscador de conversaciones */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en tus chats…"
          className="h-8 w-full rounded-lg border-2 border-neutral-300 bg-neutral-50 px-2.5 text-[11.5px] font-bold text-black outline-none placeholder:font-medium placeholder:text-neutral-500 focus:border-black focus:bg-white"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 text-xs font-bold text-neutral-500 hover:text-black"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
