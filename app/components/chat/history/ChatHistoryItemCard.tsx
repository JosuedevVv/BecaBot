'use client'

import { formatearFechaChat } from '@/lib/chat-title'
import { useChatHistoryStore } from '@/stores/chatHistoryStore'
import type { ConversacionItem } from '@/services/ChatHistoryService'

export const ChatHistoryItemCard = ({
  chat,
  isActive,
}: {
  chat: ConversacionItem
  isActive: boolean
}) => {
  const selectConversation = useChatHistoryStore((s) => s.selectConversation)
  const deleteConversation = useChatHistoryStore((s) => s.deleteConversation)

  const handleSelect = () => {
    selectConversation(chat.id_conversacion)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteConversation(chat.id_conversacion)
  }

  return (
    <div
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleSelect()
        }
      }}
      className={`group flex cursor-pointer flex-col rounded-xl border-2 p-2.5 text-left transition-all active:translate-x-0.5 active:translate-y-0.5 ${
        isActive
          ? 'border-black bg-black text-white shadow-[3px_3px_0px_#555555]'
          : 'border-neutral-300 bg-white text-black shadow-[2px_2px_0px_#000000] hover:border-black hover:bg-neutral-50'
      }`}
    >
      <div className="flex items-start justify-between gap-1.5">
        <span
          className={`line-clamp-1 text-[12px] font-black ${
            isActive ? 'text-white' : 'text-black group-hover:underline'
          }`}
        >
          {chat.title}
        </span>
        <button
          type="button"
          onClick={handleDelete}
          title="Eliminar chat"
          className={`shrink-0 text-xs font-bold transition-opacity ${
            isActive
              ? 'text-neutral-400 hover:text-white'
              : 'opacity-0 hover:text-red-600 group-hover:opacity-100'
          }`}
        >
          ✕
        </button>
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px] font-semibold">
        <span className={isActive ? 'text-neutral-300' : 'text-neutral-600'}>
          {formatearFechaChat(chat.fecha)}
        </span>
        {isActive && (
          <span className="size-1.5 rounded-full bg-emerald-400" />
        )}
      </div>
    </div>
  )
}
