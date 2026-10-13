export type PremiumFeature = {
  label: string
  detail: string
}

export const freePlan = {
  id: "becario",
  name: "Becario",
  price: "$0",
  cadence: "para siempre",
  summary: "Orientación libre sobre cualquier beca, requisito o fecha límite.",
  cta: "Tu plan actual",
  features: [
    { label: "4 consultas diarias", detail: "Se renuevan cada día a las 00:00 h." },
    { label: "Requisitos y plazos", detail: "Orientación general de cualquier convocatoria." },
    { label: "Sugerencias de beca", detail: "Recomendaciones según lo que describes." },
  ] as PremiumFeature[],
}

export const premiumPlan = {
  id: "premium",
  name: "Premium",
  price: "$59",
  cadence: "MXN al mes",
  summary: "Todo lo de Becario, más el seguimiento de tu búsqueda.",
  cta: "Empezar con Premium",
  features: [
    { label: "Consultas ilimitadas", detail: "Pregunta todo lo que necesites, sin cortes." },
    { label: "Alertas de fecha límite", detail: "Aviso antes de que cierre cada convocatoria." },
    { label: "Comparador de becas", detail: "Contrasta monto, requisitos y elegibilidad." },
    { label: "Revisión de expediente", detail: "Revisamos tus documentos y requisitos faltantes." },
    { label: "Exportar a PDF", detail: "Descarga tu plan de solicitud en un solo archivo." },
  ] as PremiumFeature[],
}

export type ComparisonRow = {
  label: string
  free: string
  premium: string
}

export const comparison: ComparisonRow[] = [
  { label: "Consultas por día", free: "4", premium: "Ilimitadas" },
  { label: "Historial de consultas", free: "7 días", premium: "Sin límite" },
  { label: "Alertas de fecha límite", free: "—", premium: "Incluidas" },
  { label: "Comparador de becas", free: "—", premium: "Incluido" },
  { label: "Revisión de expediente", free: "—", premium: "Incluida" },
  { label: "Exportar a PDF", free: "—", premium: "Incluido" },
]

export const plans = [freePlan, premiumPlan]