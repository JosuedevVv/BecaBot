import Link from "next/link"

export default function ComingSoon() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-black bg-white p-8 shadow-[6px_6px_0px_#000000]">
        <div className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-black px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          <span>BECABOT · PRÓXIMAMENTE</span>
        </div>

        <h1 className="max-w-md font-display text-2xl font-black tracking-tight text-black sm:text-3xl">
          Esta sección estará disponible próximamente
        </h1>

        <p className="max-w-sm text-[14px] font-semibold leading-relaxed text-neutral-700">
          Estamos integrando el catálogo completo de convocatorias y el panel de seguimiento de postulaciones.
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/asesor"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-black px-5 py-2.5 text-xs font-black text-white shadow-[3px_3px_0px_#000000] transition-all hover:bg-neutral-800"
          >
            Ir al Asesor IA →
          </Link>
          <Link
            href="/premium"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white px-4 py-2.5 text-xs font-black text-black shadow-[3px_3px_0px_#000000] transition-all hover:bg-neutral-100"
          >
            Ver Planes
          </Link>
        </div>
      </div>
    </section>
  )
}
