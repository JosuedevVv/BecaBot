import { Suspense } from 'react'
import { InfoPanel } from '../components/InfoPanel'
import { ChatWorkspace } from '../components/chat/ChatWorkspace'

export const metadata = {
  title: 'Asesor IA — BecaBot México',
  description: 'Pregunta por becas en México, requisitos, convocatorias y fechas límite.',
}

export default function AsesorPage() {
  return (
    <div className="mx-auto grid h-[calc(100dvh-5rem)] w-full max-w-6xl grid-cols-1 overflow-hidden px-4 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
      <aside className="hidden min-h-0 overflow-y-auto py-4 lg:block">
        <InfoPanel />
      </aside>

      <section className="grid min-h-0 grid-rows-[minmax(0,1fr)] overflow-hidden">
        <Suspense
          fallback={
            <div className="m-auto flex items-center gap-3 rounded-2xl border-2 border-black bg-white px-5 py-4 text-sm font-black text-black shadow-[4px_4px_0px_#000000]">
              <span className="size-3 animate-spin border-2 border-black border-t-transparent" />
              <span>Cargando asesor de becas…</span>
            </div>
          }
        >
          <ChatWorkspace />
        </Suspense>
      </section>
    </div>
  )
}
