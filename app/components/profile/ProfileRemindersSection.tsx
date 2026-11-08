'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  profileService,
  type AlertaRecordatorio,
} from '@/services/ProfileService'

export const ProfileRemindersSection = ({
  isPremium,
  userId,
  initialAlertas,
}: {
  isPremium: boolean
  userId: string
  initialAlertas: AlertaRecordatorio[]
}) => {
  const [alertas, setAlertas] = useState<AlertaRecordatorio[]>(initialAlertas)
  const [becasDisponibles, setBecasDisponibles] = useState<any[]>([])
  const [selectedBeca, setSelectedBeca] = useState('')
  const [adding, setAdding] = useState(false)
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  useEffect(() => {
    if (isPremium) {
      profileService.obtenerBecasDisponiblesParaRecordatorio().then(({ data }) => {
        if (data) setBecasDisponibles(data)
      })
    }
  }, [isPremium])

  const handleToggle = async (idAlerta: string, estadoActual: boolean) => {
    const nuevoEstado = !estadoActual
    setAlertas((prev) =>
      prev.map((a) => (a.id_alerta === idAlerta ? { ...a, activa: nuevoEstado } : a))
    )
    try {
      await profileService.alternarAlerta(idAlerta, nuevoEstado)
    } catch {
      // Revertir en error
      setAlertas((prev) =>
        prev.map((a) => (a.id_alerta === idAlerta ? { ...a, activa: estadoActual } : a))
      )
    }
  }

  const handleCrearAlerta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBeca) return

    setAdding(true)
    setActionNotice(null)
    try {
      const { error } = await profileService.crearAlertaRecordatorio(userId, selectedBeca)
      if (error) {
        setActionNotice('No se pudo programar el recordatorio (tal vez ya esté asignado).')
        return
      }

      // Actualizar listado
      const { alertas: nuevasAlertas } = await profileService.obtenerDatosPerfil(userId)
      setAlertas(nuevasAlertas)
      setSelectedBeca('')
      setActionNotice('¡Recordatorio programado con éxito!')
    } catch {
      setActionNotice('Error al conectar con la base de datos.')
    } finally {
      setAdding(false)
    }
  }

  // Si NO es Premium: Bloque con candado tipográfico explicando el beneficio
  if (!isPremium) {
    return (
      <section className="rounded-2xl border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md border-2 border-black bg-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
              EXCLUSIVO PREMIUM
            </span>
            <h3 className="font-display text-xl font-black text-black">
              Recordatorios Automáticos de Becas
            </h3>
          </div>
          <span className="rounded-full border-2 border-dashed border-neutral-400 bg-neutral-100 px-3 py-1 text-[11px] font-bold text-neutral-600">
            Bloqueado en Plan Becario
          </span>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <p className="text-[14.5px] font-semibold leading-relaxed text-neutral-800">
              No dejes que se te pasen las fechas límite de las convocatorias en México. Con el plan
              Premium, BecaBot monitorea tus becas de interés y te envía alertas automáticas a tu
              correo:
            </p>

            <ul className="mt-4 flex flex-col gap-2.5">
              <li className="flex items-center gap-2 text-xs font-bold text-black">
                <span className="flex size-5 shrink-0 items-center justify-center rounded border-2 border-black bg-black text-[10px] text-white">
                  ✓
                </span>
                <span>Alerta preventiva 30 días antes del cierre de recepción</span>
              </li>
              <li className="flex items-center gap-2 text-xs font-bold text-black">
                <span className="flex size-5 shrink-0 items-center justify-center rounded border-2 border-black bg-black text-[10px] text-white">
                  ✓
                </span>
                <span>Alerta urgente 7 días antes para entrega de requisitos</span>
              </li>
              <li className="flex items-center gap-2 text-xs font-bold text-black">
                <span className="flex size-5 shrink-0 items-center justify-center rounded border-2 border-black bg-black text-[10px] text-white">
                  ✓
                </span>
                <span>Último aviso 24 horas antes del vencimiento oficial</span>
              </li>
            </ul>

            <div className="mt-6">
              <Link
                href="/premium"
                className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-black bg-black px-5 text-xs font-black text-white shadow-[3px_3px_0px_#000000] hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <span>Activar Recordatorios con Premium ($49/mes)</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Wireframe de ejemplo de recordatorio bloqueado */}
          <div
            aria-hidden
            className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 opacity-70"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-40 rounded-full bg-neutral-300" />
              <div className="h-4 w-16 rounded-full bg-neutral-200" />
            </div>
            <div className="h-2.5 w-3/4 rounded-full bg-neutral-200" />
            <div className="h-2.5 w-1/2 rounded-full bg-neutral-200" />
            <div className="mt-3 flex items-center justify-between border-t border-dashed border-neutral-300 pt-3">
              <div className="h-3 w-24 rounded-full bg-neutral-300" />
              <div className="h-6 w-16 rounded-md bg-neutral-300" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Si ES Premium: Panel de control completo de alertas
  return (
    <section className="rounded-2xl border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md border-2 border-black bg-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
              SERVICIO ACTIVO
            </span>
            <h3 className="font-display text-xl font-black text-black">
              Tus Recordatorios y Alertas de Becas
            </h3>
          </div>
          <p className="mt-1 text-xs font-semibold text-neutral-600">
            Avisos configurados a tu correo: 30, 7 y 1 día antes del cierre oficial.
          </p>
        </div>

        <span className="rounded-md border-2 border-black bg-neutral-100 px-2.5 py-1 text-xs font-black text-black">
          {alertas.length} {alertas.length === 1 ? 'alerta activa' : 'alertas activas'}
        </span>
      </div>

      {/* Formulario para programar nuevo recordatorio */}
      <form onSubmit={handleCrearAlerta} className="mt-5 flex flex-wrap items-center gap-3">
        <select
          value={selectedBeca}
          onChange={(e) => setSelectedBeca(e.target.value)}
          disabled={adding || becasDisponibles.length === 0}
          className="h-11 min-w-[280px] flex-1 rounded-xl border-2 border-black bg-white px-3 text-xs font-bold text-black outline-none focus:shadow-[2px_2px_0px_#000000]"
        >
          <option value="">Selecciona una convocatoria para monitorear…</option>
          {becasDisponibles.map((beca) => (
            <option key={beca.id_beca} value={beca.id_beca}>
              {beca.name} ({beca.grado_academico || 'General'} · Cierre:{' '}
              {beca.fecha_expiracion || 'Por definir'})
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={adding || !selectedBeca}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-black bg-black px-4 text-xs font-black text-white shadow-[3px_3px_0px_#000000] hover:bg-neutral-800 disabled:opacity-50"
        >
          {adding ? 'Agendando…' : '+ Añadir recordatorio'}
        </button>
      </form>

      {actionNotice && (
        <div className="mt-3 rounded-lg border-2 border-black bg-neutral-100 p-2.5 text-xs font-bold text-black">
          {actionNotice}
        </div>
      )}

      {/* Lista de alertas */}
      <div className="mt-6 flex flex-col gap-3">
        {alertas.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-neutral-300 p-6 text-center text-xs font-bold text-neutral-600">
            Aún no tienes recordatorios programados. Selecciona una beca en el selector superior para
            comenzar a recibir alertas antes del cierre.
          </div>
        ) : (
          alertas.map((alerta) => (
            <div
              key={alerta.id_alerta}
              className={`flex flex-col justify-between gap-3 rounded-xl border-2 border-black p-4 transition-all sm:flex-row sm:items-center ${
                alerta.activa ? 'bg-neutral-50 shadow-[3px_3px_0px_#000000]' : 'bg-white opacity-60'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-black text-black">{alerta.nombre_beca}</h4>
                  {alerta.grado_academico && (
                    <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[9.5px] font-bold text-neutral-800">
                      {alerta.grado_academico}
                    </span>
                  )}
                  <span className="rounded border border-black bg-white px-1.5 py-0.5 text-[9.5px] font-black uppercase text-black">
                    Postulación: {alerta.estado_postulacion}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-600">
                  <span>
                    Fecha de cierre:{' '}
                    <strong className="text-black">
                      {alerta.fecha_expiracion || 'Por confirmar'}
                    </strong>
                  </span>
                  <span>Canal: {alerta.canal.toUpperCase()}</span>
                  <span>Avisos: {alerta.dias_antes.join(', ')} días antes</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle(alerta.id_alerta, alerta.activa)}
                  className={`h-9 rounded-lg border-2 border-black px-3 text-xs font-black shadow-[2px_2px_0px_#000000] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                    alerta.activa
                      ? 'bg-black text-white hover:bg-neutral-800'
                      : 'bg-white text-black hover:bg-neutral-100'
                  }`}
                >
                  {alerta.activa ? 'Alerta activa ✓' : 'Pausada'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
