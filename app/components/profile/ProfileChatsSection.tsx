'use client'

import { useState } from 'react'
import Link from 'next/link'
import { profileService, type ConversacionConMensajes } from '@/services/ProfileService'

export const ProfileChatsSection = ({
  initialConversaciones,
}: {
  initialConversaciones: ConversacionConMensajes[]
}) => {
  const [conversaciones, setConversaciones] =
    useState<ConversacionConMensajes[]>(initialConversaciones)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterQuery, setFilterQuery] = useState('')

  const handleEliminar = async (idConversacion: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setConversaciones((prev) => prev.filter((c) => c.id_conversacion !== idConversacion))
    try {
      await profileService.eliminarConversacion(idConversacion)
    } catch {
      // Ignorar
    }
  }

  const filtered = conversaciones.filter((c) =>
    c.title.toLowerCase().includes(filterQuery.toLowerCase())
  )

  return (
    <section className="rounded-2xl border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md border-2 border-black bg-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
              HISTORIAL DE CONSULTAS
            </span>
            <h3 className="font-display text-xl font-black text-black">
              Tus Conversaciones con el Asesor
            </h3>
          </div>
          <p className="mt-1 text-xs font-semibold text-neutral-600">
            Revisa tus preguntas anteriores, requisitos analizados y respuestas de convocatorias.
          </p>
        </div>

        <Link
          href="/asesor"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border-2 border-black bg-black px-3.5 text-xs font-black text-white shadow-[2px_2px_0px_#000000] hover:bg-neutral-800"
        >
          <span>+ Nueva consulta</span>
          <span>→</span>
        </Link>
      </div>

      {/* Buscador de conversaciones */}
      {conversaciones.length > 0 && (
        <div className="mt-5">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Buscar en el título de tus consultas guardadas…"
            className="h-10 w-full rounded-xl border-2 border-black px-3.5 text-xs font-bold text-black outline-none placeholder:text-neutral-400 focus:shadow-[2px_2px_0px_#000000]"
          />
        </div>
      )}

      {/* Lista de conversaciones */}
      <div className="mt-5 flex flex-col gap-3">
        {conversaciones.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-neutral-300 p-8 text-center">
            <p className="text-sm font-bold text-black">Aún no tienes conversaciones registradas.</p>
            <p className="mt-1 text-xs font-semibold text-neutral-600">
              Inicia una consulta en el Asesor IA para ver aquí tu historial y seguimiento.
            </p>
            <div className="mt-4">
              <Link
                href="/asesor"
                className="inline-flex h-10 items-center gap-2 rounded-xl border-2 border-black bg-black px-4 text-xs font-black text-white shadow-[3px_3px_0px_#000000] hover:bg-neutral-800"
              >
                <span>Preguntar al Asesor ahora</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-neutral-300 p-6 text-center text-xs font-bold text-neutral-600">
            No hay consultas que coincidan con &ldquo;{filterQuery}&rdquo;.
          </div>
        ) : (
          filtered.map((chat) => {
            const isExpanded = expandedId === chat.id_conversacion
            const fechaStr = new Date(chat.fecha).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div
                key={chat.id_conversacion}
                className="rounded-xl border-2 border-black bg-neutral-50 shadow-[3px_3px_0px_#000000] transition-all"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : chat.id_conversacion)}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4 hover:bg-neutral-100"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-black">
                        {isExpanded ? '▼' : '►'}
                      </span>
                      <h4 className="truncate text-sm font-black text-black">{chat.title}</h4>
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-xs font-semibold text-neutral-600">
                      <span>{fechaStr}</span>
                      <span>·</span>
                      <span className="rounded bg-neutral-200 px-1.5 py-0.2 text-[10px] font-bold text-black">
                        {chat.mensajes_count} {chat.mensajes_count === 1 ? 'mensaje' : 'mensajes'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/asesor?chat=${encodeURIComponent(chat.id_conversacion)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg border-2 border-black bg-white px-3 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white"
                    >
                      Abrir en Asesor ↗
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => handleEliminar(chat.id_conversacion, e)}
                      title="Eliminar conversación"
                      className="rounded-lg border border-neutral-300 p-1.5 text-xs font-bold text-neutral-600 hover:border-red-600 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Vista previa de mensajes desplegados */}
                {isExpanded && chat.mensajes && chat.mensajes.length > 0 && (
                  <div className="border-t-2 border-neutral-200 bg-white p-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                      Mensajes intercambiados:
                    </span>
                    <div className="mt-3 flex flex-col gap-2.5">
                      {chat.mensajes.map((m) => (
                        <div
                          key={m.id_mensaje}
                          className={`rounded-lg border-2 p-3 text-xs leading-relaxed ${
                            m.tipo === 'user'
                              ? 'border-black bg-black text-white'
                              : 'border-neutral-300 bg-neutral-50 text-neutral-900'
                          }`}
                        >
                          <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-wider opacity-70">
                            <span>{m.tipo === 'user' ? 'Tú' : 'BecaBot Asesor'}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{m.mensaje}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
