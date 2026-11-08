'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SUGERENCIAS = [
  'Beca Benito Juárez',
  'Jóvenes Escribiendo el Futuro',
  'Posgrados CONAHCYT',
  'Beca Manutención Santander',
]

export const LandingHero = () => {
  const [consulta, setConsulta] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!consulta.trim()) return
    router.push(`/asesor?q=${encodeURIComponent(consulta.trim())}`)
  }

  const handleSugerencia = (texto: string) => {
    router.push(`/asesor?q=${encodeURIComponent(texto)}`)
  }

  return (
    <section className="relative mx-auto max-w-6xl px-5 py-12 md:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Columna Izquierda: Mensaje y Buscador con Contraste Total */}
        <div>
          {/* Badge con borde negro marcado y texto negro legible */}
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-neutral-100 px-4 py-1.5 text-[12px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000000]">
            <span className="size-2 rounded-full bg-black animate-ping" />
            100% BECAS EN MÉXICO · DOCUMENTOS OFICIALES
          </div>

          <h1 className="mt-6 font-display text-4xl font-black tracking-tight text-black sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
            Encuentra la beca que <span className="bg-black px-2.5 py-0.5 text-white underline decoration-wavy decoration-1">sí te toca</span> sin perderte en el papeleo.
          </h1>

          <p className="mt-5 max-w-xl text-[16.5px] font-semibold leading-relaxed text-neutral-800">
            Convocatorias oficiales, fechas límite, promedios mínimos y requisitos explicados con la franqueza de un estudiante y la precisión de documentos oficiales citados.
          </p>

          {/* Buscador de Alto Impacto con texto negro legible al escribir */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex max-w-lg items-center gap-2 rounded-2xl border-2 border-black bg-white p-2.5 shadow-[4px_4px_0px_#000000] transition-all focus-within:shadow-[6px_6px_0px_#000000]"
          >
            <div className="flex flex-1 items-center gap-3 pl-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000000"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 shrink-0"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={consulta}
                onChange={(e) => setConsulta(e.target.value)}
                placeholder="Escribe tu promedio, universidad o nivel…"
                className="w-full bg-transparent text-[15px] font-bold text-black outline-none placeholder:font-medium placeholder:text-neutral-500"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-black px-6 text-[14px] font-black text-white shadow-[2px_2px_0px_#555555] transition-all hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Consultar
            </button>
          </form>

          {/* Sugerencias Rápidas con Botones Negros Visibles */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[11.5px] font-black uppercase tracking-wider text-neutral-700">
              Prueba con:
            </span>
            {SUGERENCIAS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleSugerencia(sug)}
                className="rounded-full border-2 border-black bg-white px-3 py-1 text-[12px] font-bold text-black shadow-[2px_2px_0px_#000000] transition-all hover:bg-black hover:text-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                {sug}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-[13px] font-bold text-neutral-900">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-black" />
              Documentos Oficiales SEP/CONAHCYT
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-black" />
              Exclusivo México (Sin humo)
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-black" />
              Citas con enlaces reales
            </span>
          </div>
        </div>

        {/* Columna Derecha: Imagen Fotográfica Real de Estudiantes Universitarios en México */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-black bg-neutral-100 p-2 shadow-[8px_8px_0px_#000000]">
            <div className="relative h-[340px] w-full overflow-hidden rounded-2xl border-2 border-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop"
                alt="Estudiantes universitarios consultando convocatorias de becas"
                className="h-full w-full object-cover grayscale contrast-125"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Etiqueta flotante dentro de la foto */}
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/30 bg-black/85 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white">
                    VERIFICACIÓN OFICIAL 2026-2027
                  </span>
                  <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-black text-black">
                    100% MX
                  </span>
                </div>
                <p className="mt-1 text-[13px] font-bold text-white">
                  +120 Convocatorias Vigentes de Licenciatura y Posgrado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
