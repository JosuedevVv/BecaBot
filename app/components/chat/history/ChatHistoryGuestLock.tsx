'use client'

import Link from 'next/link'

export const ChatHistoryGuestLock = () => {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-black">
            Historial de chats
          </span>
          <span className="rounded border-2 border-black bg-neutral-100 px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-black">
            Modo Invitado
          </span>
        </div>

        <button
          type="button"
          disabled
          aria-label="Iniciar sesión para abrir más chats"
          className="flex w-full cursor-not-allowed items-center justify-between rounded-xl border-2 border-dashed border-neutral-400 bg-neutral-100 px-3 py-2.5 text-[12px] font-bold text-neutral-500 opacity-80"
        >
          <span className="flex items-center gap-2">
            <span>🔒</span>
            <span>+ Nueva conversación</span>
          </span>
          <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[9px] font-bold text-neutral-600">
            Bloqueado
          </span>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-2 text-center">
        <div className="flex size-11 items-center justify-center rounded-xl border-2 border-black bg-neutral-100 text-lg shadow-[2px_2px_0px_#000000]">
          🔒
        </div>
        <h4 className="mt-3 font-display text-sm font-black text-black">
          Guarda tus consultas de becas
        </h4>
        <p className="mt-1.5 text-xs font-semibold leading-relaxed text-neutral-700">
          En modo invitado solo puedes realizar la consulta actual. Inicia sesión para guardar tu
          historial, abrir múltiples temas y revisarlos cuando quieras.
        </p>

        <div className="mt-4 flex w-full flex-col gap-2">
          <Link
            href="/login"
            className="inline-flex h-9 w-full items-center justify-center rounded-xl border-2 border-black bg-black text-xs font-black text-white shadow-[2px_2px_0px_#000000] hover:bg-neutral-800"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 w-full items-center justify-center rounded-xl border-2 border-black bg-white text-xs font-black text-black shadow-[2px_2px_0px_#000000] hover:bg-neutral-100"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </div>

      <div className="rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-2 text-center text-[10px] font-bold text-neutral-600">
        Orientación oficial de becas en México
      </div>
    </div>
  )
}
