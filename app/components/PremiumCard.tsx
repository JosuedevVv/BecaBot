import Link from "next/link"
import { PremiumCTA, PremiumBadge } from "./Premium"
import { Seal } from "./Seal"

const perks = [
  "Consultas ilimitadas",
  "Alertas de fecha límite",
  "Comparador de becas",
]
export const PremiumCard = () => (
  <div className="foil-ring foil-surface rounded-card p-4 shadow-card">
    <div className="flex items-center gap-2.5">
      <Seal size={22} lit />
      <div className="flex flex-col">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] foil-text">
          Premium
        </span>
        <span className="font-display text-[15px] font-medium leading-tight text-text">
          Tu búsqueda, sin cortes
        </span>
      </div>
    </div>

    <ul className="mt-3.5 flex flex-col gap-2">
      {perks.map((perk) => (
        <li key={perk} className="flex items-center gap-2">
          <span className="size-1 shrink-0 rounded-full bg-foil-mid" />
          <span className="text-[12.5px] leading-relaxed text-secondary">{perk}</span>
        </li>
      ))}
    </ul>

    <PremiumCTA size="sm" block className="mt-4" />

    <p className="mt-2.5 text-center text-[10px] leading-relaxed text-muted">
      Cancela cuando quieras · 2 meses gratis al pagar anual
    </p>
  </div>
)

export const UsageMeter = () => (
  <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4 shadow-card">
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
        Consultas hoy
      </span>
      <span className="font-display text-[13px] font-medium text-text">
        2 <span className="text-muted">/ 4</span>
      </span>
    </div>

    <div className="flex gap-1" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full ${i < 2 ? "bg-foil-deep" : "bg-surface-3"
            }`}
        />
      ))}
    </div>

    <p className="text-[11.5px] leading-relaxed text-tertiary">
      Te quedan 2 hoy. Con Premium no hay límite.
    </p>

    <Link
      href="/premium"
      className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent-dim transition-colors duration-150 hover:text-accent-deep"
    >
      Quitar el límite →
    </Link>
  </div>
)

// export const PremiumStrip = () => (
//   <div className="flex items-center justify-between gap-3 px-2 pb-5 lg:hidden">
//     <div className="flex min-w-0 flex-col gap-0.5">
//       <PremiumBadge />
//       <p className="truncate text-[11.5px] text-tertiary">
//         Te quedan 2 consultas hoy
//       </p>
//     </div>
//     <PremiumCTA size="sm" className="shrink-0">
//       Hazte Premium
//     </PremiumCTA>
//   </div>
// )
