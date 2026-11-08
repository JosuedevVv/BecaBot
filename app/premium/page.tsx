import Link from "next/link"
import { comparison, freePlan, premiumPlan } from "@/data/premium"
import { PremiumSimulatorBanner } from "../components/premium/PremiumSimulatorBanner"

export default function Premium() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-12 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/asesor"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3.5 py-2 text-xs font-black text-black shadow-[3px_3px_0px_#000000] transition-all hover:bg-black hover:text-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <span>←</span>
          <span>Volver al Asesor IA</span>
        </Link>

        <span className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-black px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          <span>PLANES · BECABOT MÉXICO</span>
        </span>
      </div>

      {/* Banner de Simulador para Pruebas Inmediatas */}
      <div className="mt-6">
        <PremiumSimulatorBanner />
      </div>

      <header className="mt-8 rounded-2xl border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] sm:p-8">
        <h1 className="font-display text-3xl font-black tracking-tight text-black sm:text-4xl">
          Todas las becas en México, sin límite de consultas
        </h1>

        <p className="mt-3 max-w-2xl text-[15px] font-semibold leading-relaxed text-neutral-700">
          La orientación básica es libre para todos los estudiantes. Premium agrega seguimiento automatizado:
          alertas de fechas límite por correo (30, 7 y 1 día antes), comparador de montos y guardado de recordatorios desde el chat.
        </p>
      </header>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {/* Plan Becario */}
        <article className="flex flex-col justify-between rounded-2xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000000] sm:p-7">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <span className="rounded-md border-2 border-black bg-neutral-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-black">
                {freePlan.name}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                Acceso libre
              </span>
            </div>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl">
                {freePlan.price}
              </span>
              <span className="text-[13px] font-bold text-neutral-600">
                {freePlan.cadence}
              </span>
            </div>

            <p className="mt-3 text-[13.5px] font-semibold leading-relaxed text-neutral-700">
              {freePlan.summary}
            </p>

            <ul className="mt-6 flex flex-col gap-3.5 border-t-2 border-neutral-200 pt-5">
              {freePlan.features.map((feature) => (
                <li key={feature.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border-2 border-black bg-neutral-100 text-[11px] font-black text-black">
                    ✓
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[13.5px] font-black text-black">
                      {feature.label}
                    </span>
                    <span className="text-[12px] font-semibold text-neutral-600">
                      {feature.detail}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/asesor"
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl border-2 border-black bg-neutral-100 px-4 text-[13.5px] font-black text-black shadow-[3px_3px_0px_#000000] transition-all hover:bg-black hover:text-white"
          >
            {freePlan.cta}
          </Link>
        </article>

        {/* Plan Premium */}
        <article className="relative flex flex-col justify-between rounded-2xl border-2 border-black bg-white p-6 shadow-[8px_8px_0px_#000000] sm:p-7">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <span className="rounded-md border-2 border-black bg-black px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white">
                {premiumPlan.name}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-black bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000000]">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>Recomendado</span>
              </span>
            </div>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl">
                {premiumPlan.price}
              </span>
              <span className="text-[13px] font-bold text-neutral-600">
                {premiumPlan.cadence}
              </span>
            </div>

            <p className="mt-3 text-[13.5px] font-semibold leading-relaxed text-neutral-700">
              {premiumPlan.summary}
            </p>

            <ul className="mt-6 flex flex-col gap-3.5 border-t-2 border-neutral-200 pt-5">
              {premiumPlan.features.map((feature) => (
                <li key={feature.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border-2 border-black bg-black text-[11px] font-black text-white">
                    ✓
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[13.5px] font-black text-black">
                      {feature.label}
                    </span>
                    <span className="text-[12px] font-semibold text-neutral-700">
                      {feature.detail}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/signup"
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl border-2 border-black bg-black px-4 text-[14px] font-black text-white shadow-[4px_4px_0px_#000000] transition-all hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            {premiumPlan.cta} →
          </Link>
        </article>
      </div>

      {/* Tabla comparativa */}
      <div className="mt-12 rounded-2xl border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-black tracking-tight text-black">
            Comparativa detallada de planes
          </h2>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            Cobertura nacional en México
          </span>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border-2 border-black">
          <table className="w-full border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="border-b-2 border-black bg-black text-white">
                <th className="p-3.5 font-black uppercase tracking-wider">Función</th>
                <th className="p-3.5 font-black uppercase tracking-wider">Becario</th>
                <th className="p-3.5 font-black uppercase tracking-wider">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-neutral-200 bg-white">
              {comparison.map((row) => (
                <tr key={row.label} className="transition-colors hover:bg-neutral-50">
                  <td className="p-3.5 font-black text-black">{row.label}</td>
                  <td className="p-3.5 font-semibold text-neutral-700">{row.free}</td>
                  <td className="p-3.5 font-black text-black">{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
