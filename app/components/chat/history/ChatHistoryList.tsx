'use client'

import { useChatHistoryStore } from '@/stores/chatHistoryStore'
import { esDeHoy } from '@/lib/chat-title'
import { ChatHistoryItemCard } from './ChatHistoryItemCard'

export const ChatHistoryList = () => {
  const conversaciones = useChatHistoryStore((s) => s.conversaciones)
  const searchQuery = useChatHistoryStore((s) => s.searchQuery)
  const activeConversationId = useChatHistoryStore((s) => s.activeConversationId)

  const filtradas = conversaciones.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const deHoy = filtradas.filter((c) => esDeHoy(c.fecha))
  const anteriores = filtradas.filter((c) => !esDeHoy(c.fecha))

  if (filtradas.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-3 text-center">
        {searchQuery ? (
          <p className="text-[11.5px] font-semibold text-neutral-500">
            No hay chats que coincidan con &ldquo;{searchQuery}&rdquo;.
          </p>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-neutral-300 p-4 text-center">
            <p className="text-xs font-bold text-black">Sin conversaciones aún</p>
            <p className="mt-1 text-[11px] font-semibold text-neutral-600">
              Escribe tu primera pregunta en el asesor para guardarla aquí automáticamente.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto pr-0.5">
      {/* Grupo: Hoy */}
      {deHoy.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[9.5px] font-black uppercase tracking-wider text-neutral-500">
            Hoy
          </span>
          <div className="flex flex-col gap-1.5">
            {deHoy.map((chat) => (
              <ChatHistoryItemCard
                key={chat.id_conversacion}
                chat={chat}
                isActive={chat.id_conversacion === activeConversationId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Grupo: Anteriores */}
      {anteriores.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[9.5px] font-black uppercase tracking-wider text-neutral-500">
            Anteriores
          </span>
          <div className="flex flex-col gap-1.5">
            {anteriores.map((chat) => (
              <ChatHistoryItemCard
                key={chat.id_conversacion}
                chat={chat}
                isActive={chat.id_conversacion === activeConversationId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
