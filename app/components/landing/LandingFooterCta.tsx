import Link from 'next/link'

export const LandingFooterCta = () => {
  return (
    <section className="border-t-2 border-black bg-black py-20 text-white">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-6">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border-2 border-white bg-black px-4 py-1 text-[11px] font-black uppercase tracking-wider text-white">
          <span className="size-2 rounded-full bg-white animate-pulse" />
          CONSULTA DIRECTA DE BECAS EN MÉXICO
        </div>

        <h2 className="mt-6 font-display text-3xl font-black tracking-tight text-white sm:text-5xl">
          ¿Listo para postular con toda la información en orden?
        </h2>

        <p className="mx-auto mt-4 max-w-lg text-[15px] font-medium leading-relaxed text-neutral-300">
          Pregunta sobre promedios, documentación oficial y calendarios de cierre en México. Sin costo y con respuestas verificadas.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/asesor"
            className="inline-flex h-12 items-center justify-center rounded-full border-2 border-white bg-white px-8 text-sm font-black text-black shadow-[4px_4px_0px_#555555] transition-transform hover:scale-105 active:scale-95"
          >
            Abrir Asesor BecaBot →
          </Link>
          <Link
            href="/premium"
            className="inline-flex h-12 items-center justify-center rounded-full border-2 border-white/40 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            Conocer Planes Premium
          </Link>
        </div>

        <p className="mt-12 text-[11px] font-medium text-neutral-400">
          © {new Date().getFullYear()} BecaBot · Asesoría de becas en México basada en RAG. No sustituye las convocatorias oficiales emitidas por las instituciones.
        </p>
      </div>
    </section>
  )
}
