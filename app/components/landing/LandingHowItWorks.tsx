import { ScholarshipPillarSvg } from '../svg/ScholarshipPillarSvg'

export const LandingHowItWorks = () => {
  const pasos = [
    {
      paso: '01',
      kind: 'documentos' as const,
      titulo: 'Lectura RAG de Convocatorias Oficiales',
      badge: 'Base de Datos Vectorial',
      descripcion:
        'Troceamos y vectorizamos los PDFs y lineamientos publicados por la SEP, CONAHCYT e IPES. Cuando preguntas por requisitos o fechas límite, extraemos la cláusula exacta.',
    },
    {
      paso: '02',
      kind: 'citas' as const,
      titulo: 'Citas y Trazabilidad en cada Respuesta',
      badge: 'Cero Alucinaciones',
      descripcion:
        'Cada respuesta viene con su sello de origen y enlaces directos a la convocatoria oficial para que no tengas que creerle a ciegas a una IA generalista.',
    },
    {
      paso: '03',
      kind: 'mexico' as const,
      titulo: 'Filtro Estricto: México al 100%',
      badge: 'Ámbito Garantizado',
      descripcion:
        'Si preguntas por becas de otro país, no te enredamos con detalles falsos: te indicamos brevemente el portal oficial (embajadas, AMEXCID) y mantenemos el foco en México.',
    },
  ]

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-24">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="rounded-md border-2 border-black bg-neutral-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-black">
            Arquitectura e Identidad
          </span>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-black sm:text-4xl">
            Cómo BecaBot te ahorra semanas de búsqueda
          </h2>
        </div>
        <p className="max-w-md text-[15px] font-medium leading-relaxed text-neutral-800">
          No somos un buscador genérico. Somos un asistente con memoria documental especializado en el sistema educativo mexicano.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {pasos.map((p) => (
          <div
            key={p.paso}
            className="group flex flex-col justify-between rounded-2xl border-2 border-black bg-white p-7 shadow-[4px_4px_0px_#000000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#000000]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-black bg-neutral-100 px-3 py-1 font-display text-[12px] font-extrabold text-black">
                  PASO {p.paso}
                </span>
                <span className="text-[11px] font-bold text-neutral-600">
                  {p.badge}
                </span>
              </div>

              <div className="my-6 flex justify-center">
                <div className="flex size-24 items-center justify-center rounded-2xl border-2 border-black bg-neutral-50 p-2 shadow-[2px_2px_0px_#000000] transition-transform group-hover:scale-105">
                  <ScholarshipPillarSvg kind={p.kind} size={72} />
                </div>
              </div>

              <h3 className="font-display text-xl font-bold tracking-tight text-black">
                {p.titulo}
              </h3>

              <p className="mt-3 text-[14px] leading-relaxed text-neutral-700">
                {p.descripcion}
              </p>
            </div>

            <div className="mt-6 border-t-2 border-neutral-200 pt-3 text-[12px] font-bold text-neutral-800">
              ✓ Verificado contra convocatorias oficiales
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
