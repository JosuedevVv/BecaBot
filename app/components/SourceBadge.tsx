'use client'

import type { OrigenRespuesta } from "@/lib/chat-stream"
import { Icon, type IconName } from "./Icon"

const META: Record<
  OrigenRespuesta,
  {
    label: string
    shortTag: string
    icon: IconName
    hint: string
    buscandoTitulo: string
    buscandoDetalle: string
  }
> = {
  rag: {
    label: "Base Documental RAG",
    shortTag: "RAG · MÉXICO",
    icon: "layers",
    hint: "Respuesta verificada en los documentos oficiales de BecaBot",
    buscandoTitulo: "Consultando Base Documental de Becas…",
    buscandoDetalle: "Verificando convocatorias, requisitos y fechas vigentes en México",
  },
  web: {
    label: "Búsqueda Web Oficial",
    shortTag: "WEB · OFICIAL",
    icon: "compass",
    hint: "Respuesta tomada de fuentes web públicas oficiales",
    buscandoTitulo: "Consultando portales oficiales en la web…",
    buscandoDetalle: "Buscando información actualizada en sitios gubernamentales e institucionales",
  },
}

export const SearchingStatus = ({ phase }: { phase?: OrigenRespuesta | null }) => {
  const meta = phase ? META[phase] : null

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3 rounded-xl border-2 border-black bg-neutral-50 p-3 shadow-[2px_2px_0px_#000000]">
        {/* Loader geométrico de alto contraste */}
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-black text-white">
          <span className="size-4 animate-spin rounded-xs border-2 border-white border-t-transparent" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-black text-black">
              {meta ? meta.buscandoTitulo : "Analizando tu consulta sobre becas…"}
            </span>
          </div>
          <span className="text-[11.5px] font-bold text-neutral-600">
            {meta
              ? meta.buscandoDetalle
              : "Preparando búsqueda en el índice de becas de México"}
          </span>
        </div>

        {meta && (
          <span className="hidden shrink-0 items-center gap-1 rounded-md border-2 border-black bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black sm:inline-flex">
            <Icon name={meta.icon} className="size-3" />
            <span>{meta.shortTag}</span>
          </span>
        )}
      </div>

      {/* Barras skeleton estilo wireframe mientras piensa */}
      <div className="flex flex-col gap-2 px-1" aria-hidden>
        <div className="h-2.5 w-11/12 animate-pulse rounded-full bg-neutral-200" />
        <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-neutral-200 [animation-delay:150ms]" />
        <div className="h-2.5 w-3/5 animate-pulse rounded-full bg-neutral-200 [animation-delay:300ms]" />
      </div>
    </div>
  )
}

export const SourceBadge = ({ source }: { source: OrigenRespuesta }) => {
  const meta = META[source]
  const esRag = source === "rag"

  return (
    <span
      title={meta.hint}
      className={`inline-flex items-center gap-1.5 rounded-md border-2 border-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000] ${
        esRag ? "bg-black text-white" : "bg-neutral-100 text-black"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          esRag ? "bg-emerald-400" : "bg-black"
        }`}
      />
      <Icon name={meta.icon} className="size-3" />
      <span>{meta.label}</span>
    </span>
  )
}
