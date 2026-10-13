import Link from "next/link"
import { GraduationCap } from "../components/GraduationCap"
import { PremiumCTA } from "../components/Premium"

const steps = [
  {
    title: "Pregunta",
    text: "Escribe tu consulta sobre becas, requisitos, plazos o el proceso de solicitud.",
  },
  {
    title: "Revisa",
    text: "El asesor responde con orientación y la documentación sugerida para tu caso.",
  },
  {
    title: "Prepárate",
    text: "Ordena tus documentos y presenta tu solicitud en la convocatoria que prefieras.",
  },
]

const alcance = [
  {
    title: "Orientación informativa",
    text: "Las respuestas sirven como guía y no sustituyen la convocatoria oficial.",
  },
  {
    title: "Verifica la fuente",
    text: "Confirma siempre plazos y requisitos en la página de la institución emisora.",
  },
  {
    title: "Sin trámite por ti",
    text: "El asistente no gestiona inscripciones ni envía documentos en tu nombre.",
  },
]

const terminos = [
  {
    title: "Uso gratuito",
    text: "El servicio de orientación no tiene costo para los estudiantes.",
  },
  {
    title: "Responsabilidad tuya",
    text: "La decisión final de postularte y cada convocatoria que elijas es tuya.",
  },
  {
    title: "Cuida tus datos",
    text: "Evita compartir información sensible en el chat (INE, CURP completa, cuentas bancarias).",
  },
  {
    title: "En desarrollo",
    text: "El proyecto sigue evolucionando; las funciones y descripciones pueden cambiar.",
  },
  {
    title: "La orientación es gratuita",
    text: "La orientación sobre becas, requisitos y plazos no tiene costo. Premium es opcional y solo agrega herramientas de seguimiento.",
  },
]

const Section = ({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children: React.ReactNode
}) => (
  <section className="rounded-card border border-line bg-surface p-5 shadow-card">
    <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent-dim">
      {label}
    </span>
    <h2 className="mt-2 font-display text-xl font-medium tracking-tight text-text">
      {title}
    </h2>
    <div className="mt-4">{children}</div>
  </section>
)

export default function ComoOpera() {
  return (
    <section className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-y-auto px-5 pb-10 pt-20">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-secondary transition-colors duration-150 hover:border-accent-deep/40 hover:text-text"
      >
        ← Volver al asesor
      </Link>

      <header className="mt-6">
        <div className="flex items-center gap-2.5">
          <GraduationCap size={14} />
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-tertiary">
            Cómo opera · Términos
          </span>
        </div>
        <h1 className="mt-5 font-display text-[2rem] font-light leading-[1.1] tracking-tight text-text [text-wrap:balance]">
          Asesoría gratuita con{" "}
          <span className="font-normal text-accent-deep">transparencia</span>
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-tertiary">
          BecaBot es un asistente conversacional que acompaña tu búsqueda de
          becas, requisitos y plazos de convocatorias en México, y te ayuda a
          preparar tu solicitud.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-4">
        <Section label="Pasos" title="Cómo funciona BecaBot">
          <ol className="flex flex-col gap-3">
            {steps.map((step, i) => (
              <li key={step.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-deep/35 font-display text-[11px] font-medium text-accent-deep">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-text">{step.title}</span>
                  <span className="text-[13px] leading-relaxed text-tertiary">
                    {step.text}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section label="Alcance" title="Hasta dónde llega la orientación">
          <ul className="flex flex-col gap-3">
            {alcance.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-deep" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-text">{item.title}</span>
                  <span className="text-[13px] leading-relaxed text-tertiary">
                    {item.text}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section label="Condiciones" title="Términos de uso">
          <ul className="flex flex-col gap-3">
            {terminos.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-deep" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-text">{item.title}</span>
                  <span className="text-[13px] leading-relaxed text-tertiary">
                    {item.text}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <div className="foil-ring foil-surface mt-8 flex flex-col items-start gap-4 rounded-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent-dim">
            Opcional
          </span>
          <p className="font-display text-base font-medium tracking-tight text-text">
            ¿Quieres alertas de fechas límite y consultas ilimitadas?
          </p>
          <p className="text-[13px] leading-relaxed text-tertiary">
            Premium agrega seguimiento; la orientación sigue siendo gratuita.
          </p>
        </div>
        <PremiumCTA className="shrink-0" />
      </div>

      <div className="mt-8 flex items-center gap-2 pb-2">
        <GraduationCap size={11} />
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
          BecaBot — orientación de convocatorias
        </span>
      </div>
    </section>
  )
}