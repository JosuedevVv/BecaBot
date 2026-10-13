import Link from "next/link"
import { Seal } from "../components/Seal"

export default function ComingSoon() {
  return (
    <section className="mx-auto grid h-full w-full max-w-xl place-content-center px-6 py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <Seal size={34} lit />

        <h1 className="max-w-md font-display text-2xl font-light tracking-tight text-text [text-wrap:balance]">
          Esta página todavía no está disponible, pero estará próximamente
        </h1>

        <p className="max-w-sm text-sm leading-relaxed text-tertiary">
          Convocatorias, requisitos y tu perfil llegarán aquí pronto.
        </p>

        <Link
          href="/premium"
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs text-secondary transition-colors duration-150 hover:border-accent-deep/40 hover:text-text"
        >
          Mientras tanto, revisa los planes Premium →
        </Link>
      </div>
    </section>
  )
}