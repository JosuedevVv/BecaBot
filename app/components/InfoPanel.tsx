'use client'

import { Brand } from "./Brand"
import { PremiumCard, UsageMeter } from "./PremiumCard"

const steps = [
  "Pregunta por becas, requisitos o plazos.",
  "Revisa la respuesta y la documentación sugerida.",
  "Prepárate para la convocatoria que más te convenga.",
]

export const InfoPanel = () => (
  <div className="flex h-full flex-col justify-center gap-6" aria-label="Información de BecaBot">
    <Brand />

    <div className="flex flex-col gap-2.5">
      <span className="px-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
        Cómo funciona
      </span>
      <ol className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
        {steps.map((step, i) => (
          <li key={step} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-accent-deep/35 font-display text-[10px] font-medium text-accent-deep">
              {i + 1}
            </span>
            <span className="text-xs leading-relaxed text-tertiary">{step}</span>
          </li>
        ))}
      </ol>
    </div>

    <UsageMeter />

    <PremiumCard />

    <div className="flex flex-col gap-2.5 rounded-card border border-accent-deep/20 bg-surface-2 p-4 shadow-card">
      <p className="font-display text-base font-medium tracking-tight text-accent-deep">
        BecaBot
      </p>
      <p className="text-xs leading-relaxed text-tertiary">
        La información mostrada es ilustrativa y no sustituye la convocatoria
        oficial.
      </p>
    </div>
  </div>
)