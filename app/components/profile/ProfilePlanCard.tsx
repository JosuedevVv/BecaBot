'use client'

import Link from 'next/link'
import type { SuscripcionUsuario } from '@/services/ProfileService'

export const ProfilePlanCard = ({
  suscripcion,
  totalChats,
  totalMensajes,
}: {
  suscripcion: SuscripcionUsuario
  totalChats: number
  totalMensajes: number
}) => {
  const esPremium = suscripcion.es_premium

  const fechaFin = suscripcion.fecha_fin
    ? new Date(suscripcion.fecha_fin).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000]">
      <div>
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <span className="rounded-md border-2 border-black bg-neutral-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
            NIVEL DE SUSCRIPCIÓN
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
              esPremium
                ? 'border-2 border-black bg-black text-white'
                : 'border border-neutral-300 bg-neutral-100 text-neutral-800'
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                esPremium ? 'bg-emerald-400' : 'bg-neutral-500'
              }`}
            />
            {esPremium ? 'Plan Premium Activo' : 'Plan Becario Libre'}
          </span>
        </div>

        {/* Encabezado del Plan */}
        <div className="mt-5">
          <h3 className="font-display text-2xl font-black text-black">
            {esPremium ? 'BecaBot Premium' : 'Plan Becario (Básico)'}
          </h3>
          <p className="mt-1 text-[13.5px] font-semibold text-neutral-700">
            {esPremium
              ? 'Tienes habilitadas alertas automáticas por correo, seguimiento de convocatorias y prioridad RAG.'
              : 'Consultas esenciales de becas en México sin costo. Actualiza para activar recordatorios automáticos.'}
          </p>
        </div>

        {/* Métricas de actividad en 3 casillas */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border-2 border-black bg-neutral-50 p-2.5 shadow-[2px_2px_0px_#000000]">
            <span className="block font-display text-2xl font-black text-black">
              {totalChats}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-600">
              Chats
            </span>
          </div>

          <div className="rounded-xl border-2 border-black bg-neutral-50 p-2.5 shadow-[2px_2px_0px_#000000]">
            <span className="block font-display text-2xl font-black text-black">
              {totalMensajes}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-600">
              Mensajes
            </span>
          </div>

          <div className="rounded-xl border-2 border-black bg-neutral-50 p-2.5 shadow-[2px_2px_0px_#000000]">
            <span className="block font-display text-2xl font-black text-black">
              {esPremium ? 'PRO' : 'FREE'}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-600">
              Nivel
            </span>
          </div>
        </div>

        {/* Vigencia si es premium */}
        {esPremium && fechaFin && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-800">
            <span>Próxima renovación / corte:</span>
            <span className="font-black text-black">{fechaFin}</span>
          </div>
        )}
      </div>

      <div className="mt-6 border-t-2 border-neutral-200 pt-4">
        {esPremium ? (
          <Link
            href="/asesor"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-black px-4 text-xs font-black text-white shadow-[3px_3px_0px_#000000] hover:bg-neutral-800"
          >
            <span>Consultar con Prioridad Premium →</span>
          </Link>
        ) : (
          <Link
            href="/premium"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-black px-4 text-xs font-black text-white shadow-[3px_3px_0px_#000000] hover:bg-neutral-800"
          >
            <span>Mejorar a Premium por $49 MXN/mes →</span>
          </Link>
        )}
      </div>
    </article>
  )
}
