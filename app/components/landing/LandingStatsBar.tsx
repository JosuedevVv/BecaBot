export const LandingStatsBar = () => {
  const stats = [
    { value: '+120', label: 'Convocatorias mapeadas en México' },
    { value: '100%', label: 'Enfoque exclusivo nacional' },
    { value: '2 Motores', label: 'Base RAG + Respaldo Web' },
    { value: '0%', label: 'Alucinaciones / datos inventados' },
  ]

  return (
    <section className="border-y border-line bg-surface py-8">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span className="font-display text-3xl font-bold tracking-tight text-text md:text-4xl">
                {stat.value}
              </span>
              <span className="mt-1 text-[13px] leading-snug text-secondary">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
