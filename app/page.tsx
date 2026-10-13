import { Welcome } from "./components/Welcome"
import { InfoPanel } from "./components/InfoPanel"

export default function Home() {
  return (
    <section className="mx-auto grid h-full w-full max-w-7xl grid-cols-1 px-5 pt-16 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-8">
      <aside className="hidden min-h-0 overflow-y-auto pb-6 lg:block">
        <InfoPanel />
      </aside>

      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)] overflow-hidden">
        <Welcome />
      </div>
    </section>
  )
}