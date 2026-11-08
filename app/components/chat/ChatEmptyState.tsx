import { Icon, type IconName } from "../Icon"
import { questions } from "@/data/questions"

const promptIcons: Record<number, IconName> = {
  1: "layers",
  2: "requirements",
  3: "apply",
  4: "calendar",
}

export const ChatEmptyState = ({ onSelectPrompt }: { onSelectPrompt: (p: string) => void }) => {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-3 py-6">
      {/* Banner de Inicio Tipográfico Limpio Sin Icono */}
      <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000]">
        <div className="inline-flex items-center gap-2 rounded-md border border-black bg-black px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          ASESOR OFICIAL DE BECAS EN MÉXICO
        </div>
        <h1 className="mt-3 font-display text-2xl font-black tracking-tight text-black sm:text-3xl">
          ¿Qué beca o convocatoria revisamos hoy?
        </h1>
        <p className="mt-1.5 text-[14px] font-semibold leading-relaxed text-neutral-800">
          Consulta requisitos, fechas límite o montos. Te respondo con base en documentos oficiales y citando cada fuente.
        </p>
      </div>

      <div className="mt-6">
        <span className="text-[11.5px] font-black uppercase tracking-wider text-neutral-800">
          Preguntas frecuentes para iniciar:
        </span>

        <ul className="mt-2.5 divide-y-2 divide-neutral-200 border-y-2 border-black">
          {questions.map((question) => (
            <li key={question.id}>
              <button
                type="button"
                onClick={() => onSelectPrompt(question.text)}
                className="group flex w-full items-center gap-3.5 py-3.5 text-left transition-colors hover:bg-neutral-50"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-white text-black shadow-[2px_2px_0px_#000000] transition-transform group-hover:scale-105">
                  <Icon name={promptIcons[question.id]} className="size-4" />
                </span>
                <span className="flex-1 text-[14.5px] font-bold text-neutral-900 transition-colors group-hover:text-black">
                  {question.text}
                </span>
                <span className="font-extrabold text-black transition-transform group-hover:translate-x-1.5">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
