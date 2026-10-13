import Link from "next/link"
import { GraduationCap } from "../components/GraduationCap"
import { PremiumCTA } from "../components/Premium"
import { Seal } from "../components/Seal"
import { comparison, freePlan, premiumPlan } from "@/data/premium"

export default function Premium() {
  return (
    <section className="mx-auto h-full w-full max-w-4xl overflow-y-auto px-5 pb-16 pt-20">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-secondary transition-colors duration-150 hover:border-accent-deep/40 hover:text-text"
      >
        ← Volver al asesor
      </Link>

      <header className="mt-8">
        <div className="flex items-center gap-2.5">
          <Seal size={20} lit />
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-tertiary">
            Planes · BecaBot Premium
          </span>
        </div>

        <h1 className="mt-6 max-w-xl font-display text-[2.25rem] font-light leading-[1.08] tracking-tight text-text [text-wrap:balance]">
          Todas las becas,{" "}
          <span className="font-normal foil-text">sin límite</span> de consultas
        </h1>

        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-tertiary">
          La orientación siempre será gratuita. Premium agrega el seguimiento:
          alertas de fechas límite, comparador de becas y revisión de tu
          expediente.
        </p>
      </header>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <article className="flex flex-col rounded-card border border-line bg-surface p-5 shadow-card">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
            {freePlan.name}
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-4xl font-light tracking-tight text-text">
              {freePlan.price}
            </span>
            <span className="text-[13px] text-tertiary">{freePlan.cadence}</span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-tertiary">
            {freePlan.summary}
          </p>

          <ul className="mt-5 flex flex-col gap-3">
            {freePlan.features.map((feature) => (
              <li key={feature.label} className="flex items-start gap-2.5">
                <span className="mt-[7px] size-1 shrink-0 rounded-full bg-surface-3" />
                <div className="flex flex-col">
                  <span className="text-[13px] text-secondary">{feature.label}</span>
                  <span className="text-[11.5px] leading-relaxed text-muted">
                    {feature.detail}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center gap-2 rounded-control border border-line-soft bg-input px-3.5 py-2.5 text-[13px] text-muted">
            <span className="size-1.5 rounded-full bg-success/70" />
            {freePlan.cta}
          </div>
        </article>

        <article className="foil-ring foil-ring-lit foil-surface relative flex flex-col rounded-card p-5 shadow-foil">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-foil-deep/30 bg-foil-wash px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] foil-text">
            <Seal size={11} />
            Recomendado
          </span>

          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="font-display text-4xl font-light tracking-tight text-text">
              {premiumPlan.price}
            </span>
            <span className="text-[13px] text-tertiary">{premiumPlan.cadence}</span>
          </div>

          <p className="mt-3 text-[13px] leading-relaxed text-secondary">
            {premiumPlan.summary}
          </p>

          <ul className="mt-5 flex flex-col gap-3">
            {premiumPlan.features.map((feature) => (
              <li key={feature.label} className="flex items-start gap-2.5">
                <span className="mt-[7px] size-1 shrink-0 rounded-full bg-foil-mid" />
                <div className="flex flex-col">
                  <span className="text-[13px] text-text">{feature.label}</span>
                  <span className="text-[11.5px] leading-relaxed text-tertiary">
                    {feature.detail}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <PremiumCTA block size="lg" className="mt-6">
            {premiumPlan.cta}
          </PremiumCTA>

          <p className="mt-2.5 text-center text-[11px] text-muted">
            O paga anual y ahorra 2 meses
          </p>
        </article>
      </div>

      <div className="mt-8 rounded-card border border-line bg-surface p-5 shadow-card">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent-dim">
          Comparativa
        </span>
        <h2 className="mt-2 font-display text-xl font-medium tracking-tight text-text">
          Qué cambia con Premium
        </h2>

        <div className="mt-5 overflow-hidden rounded-control border border-line-soft">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr>
                <th className="bg-surface-3 px-3.5 py-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-tertiary">
                  Función
                </th>
                <th className="w-24 bg-surface-3 px-3.5 py-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-tertiary">
                  Becario
                </th>
                <th className="w-32 bg-surface-3 px-3.5 py-2.5 text-[10px] font-medium uppercase tracking-[0.18em] foil-text">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.label} className="border-t border-line-soft">
                  <td className="px-3.5 py-2.5 text-secondary">{row.label}</td>
                  <td className="px-3.5 py-2.5 text-amber-100">{row.free}</td>
                  <td className="px-3.5 py-2.5 text-text">{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 pb-2">
        <GraduationCap size={11} />
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
          Pago de prueba · sin compromiso · cancela cuando quieras
        </span>
      </div>
    </section>
  )
}
