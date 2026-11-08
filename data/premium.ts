export type PremiumFeature = {
  label: string
  detail: string
}

export const freePlan = {
  id: "becario",
  name: "Becario",
  price: "$0",
  cadence: "para siempre",
  summary: "Orientación libre e ilimitada sobre cualquier beca, requisito o fecha límite en México.",
  cta: "Ir al Asesor IA",
  features: [
    {
      label: "Consultas ilimitadas",
      detail: "Pregunta todo lo que necesites sobre becas en México, sin cortes ni límite diario.",
    },
    {
      label: "Requisitos y plazos",
      detail: "Orientación general y verificada de cualquier convocatoria nacional.",
    },
    {
      label: "Sugerencias de beca",
      detail: "Recomendaciones según tu nivel académico y lo que describes.",
    },
    {
      label: "Historial de conversaciones",
      detail: "Guarda y retoma tus sesiones de consulta al iniciar sesión.",
    },
  ] as PremiumFeature[],
}

export const premiumPlan = {
  id: "premium",
  name: "Premium",
  price: "$59",
  cadence: "MXN al mes",
  summary: "Todo lo de Becario, más alertas automáticas por correo y comparador de becas.",
  cta: "Empezar con Premium",
  features: [
    {
      label: "Consultas ilimitadas",
      detail: "Pregunta todo lo que necesites sobre becas en México, sin cortes.",
    },
    {
      label: "Recordatorios desde el chat",
      detail: "Pide en el chat agendar cualquier beca y adminístrala desde tu perfil.",
    },
    {
      label: "Alertas de fecha límite",
      detail: "Avisos automáticos a tu correo (30, 7 y 1 día antes del cierre de la convocatoria).",
    },
    {
      label: "Comparador de becas",
      detail: "Contrasta monto en MXN, requisitos, plazos y elegibilidad entre becas.",
    },
  ] as PremiumFeature[],
}

export type ComparisonRow = {
  label: string
  free: string
  premium: string
}

export const comparison: ComparisonRow[] = [
  { label: "Consultas sobre becas en México", free: "Ilimitadas", premium: "Ilimitadas" },
  { label: "Requisitos, plazos y sugerencias", free: "Incluidos", premium: "Incluidos" },
  { label: "Historial de conversaciones", free: "Incluido (con cuenta)", premium: "Sin límite" },
  { label: "Agendar recordatorios desde el chat", free: "—", premium: "Incluido" },
  { label: "Alertas de fecha límite por correo", free: "—", premium: "Incluidas (30, 7 y 1 día)" },
  { label: "Comparador de becas (montos y requisitos)", free: "—", premium: "Exclusivo Premium" },
]

export const plans = [freePlan, premiumPlan]
