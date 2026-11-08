'use client'

import { useRouter } from 'next/navigation'

const CATEGORIAS = [
  {
    titulo: 'Básica y Media Superior',
    subtitulo: 'Primaria, secundaria y bachillerato (Beca Benito Juárez)',
    ejemplo: 'Beca Benito Juárez preparatoria requisitos y registro',
    badge: 'Federal SEP',
    imagen:
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=600&auto=format&fit=crop',
  },
  {
    titulo: 'Licenciatura e Ingeniería',
    subtitulo: 'Universidades públicas y estatales (UNAM, IPN, UAM, IPES)',
    ejemplo: 'Beca Jóvenes Escribiendo el Futuro monto y registro',
    badge: 'Universitaria',
    imagen:
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop',
  },
  {
    titulo: 'Posgrado e Investigación',
    subtitulo: 'Maestrías, doctorados y estancias CONAHCYT en México',
    ejemplo: 'Becas nacionales de posgrado CONAHCYT requisitos',
    badge: 'Ciencia / CONAHCYT',
    imagen:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop',
  },
  {
    titulo: 'Fundaciones y Movilidad',
    subtitulo: 'Manutención Santander, BBVA, Fundación Telmex y apoyo social',
    ejemplo: 'Beca de manutención Santander requisitos y fechas',
    badge: 'Privada / Fundación',
    imagen:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop',
  },
]

export const LandingCategoriesGrid = () => {
  const router = useRouter()

  const handleSelect = (ejemplo: string) => {
    router.push(`/asesor?q=${encodeURIComponent(ejemplo)}`)
  }

  return (
    <section className="border-t-2 border-black bg-neutral-50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="rounded-md border-2 border-black bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-black">
              Catálogo Nacional
            </span>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-black sm:text-4xl">
              Explora convocatorias por tu nivel de estudio
            </h2>
          </div>
          <p className="max-w-md text-[15px] font-bold leading-relaxed text-neutral-800">
            Toca cualquier categoría para abrir el Asesor IA con la consulta lista para responderte.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.titulo}
              type="button"
              onClick={() => handleSelect(cat.ejemplo)}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-black bg-white text-left shadow-[4px_4px_0px_#000000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#000000] active:scale-[0.98]"
            >
              {/* Fotografía Real con filtro contrastado */}
              <div className="relative h-36 w-full overflow-hidden border-b-2 border-black bg-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.imagen}
                  alt={cat.titulo}
                  className="h-full w-full object-cover grayscale contrast-125 transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute left-2.5 top-2.5 rounded-full border border-black bg-white px-2.5 py-0.5 text-[10px] font-black uppercase text-black">
                  {cat.badge}
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <h3 className="font-display text-lg font-black tracking-tight text-black group-hover:underline">
                    {cat.titulo}
                  </h3>
                  <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-neutral-700">
                    {cat.subtitulo}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t-2 border-neutral-200 pt-3 text-[12.5px] font-black text-black">
                  <span>Ver requisitos</span>
                  <span className="text-base transition-transform group-hover:translate-x-1.5">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
