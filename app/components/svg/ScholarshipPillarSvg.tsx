export type PillarIllustrationKind = "documentos" | "citas" | "mexico"

export const ScholarshipPillarSvg = ({
  kind,
  size = 72,
  className = "",
}: {
  kind: PillarIllustrationKind
  size?: number
  className?: string
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      style={{ width: size, height: size }}
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      {/* Fondo con marco marcado vintage */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="16"
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth="3.5"
      />
      <rect
        x="12"
        y="12"
        width="76"
        height="76"
        rx="10"
        fill="#F7F7F7"
        stroke="#000000"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

      {kind === "documentos" && (
        <g stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Hoja de convocatoria con doblez en esquina */}
          <path d="M30 22 H60 L74 36 V78 H30 Z" fill="#FFFFFF" strokeWidth="3" />
          <path d="M60 22 V36 H74" fill="#000000" />
          <line x1="38" y1="46" x2="66" y2="46" stroke="#000000" strokeWidth="2.5" />
          <line x1="38" y1="56" x2="66" y2="56" stroke="#000000" strokeWidth="2.5" />
          <line x1="38" y1="66" x2="54" y2="66" stroke="#000000" strokeWidth="2.5" />
          {/* Lupa examinadora sobre el documento */}
          <circle cx="68" cy="68" r="12" fill="#FFFFFF" stroke="#000000" strokeWidth="3" />
          <line x1="77" y1="77" x2="88" y2="88" stroke="#000000" strokeWidth="4" />
        </g>
      )}

      {kind === "citas" && (
        <g stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Escudo / Sello de verificación con check mark */}
          <path
            d="M50 20 L76 30 V52 C76 68 50 80 50 80 C50 80 24 68 24 52 V30 Z"
            fill="#FFFFFF"
            strokeWidth="3"
          />
          <path d="M50 28 L68 36 V50 C68 62 50 71 50 71 C50 71 32 62 32 50 V36 Z" fill="#000000" />
          {/* Paloma de verificación blanca */}
          <path d="M40 50 L47 57 L61 43" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {kind === "mexico" && (
        <g stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Birrete universitario sobre pergamino oficial de México */}
          <polygon points="50,22 84,36 50,50 16,36" fill="#000000" strokeWidth="3" />
          <circle cx="50" cy="36" r="3.5" fill="#FFFFFF" />
          <path d="M50 36 Q 74 38, 76 60" fill="none" strokeWidth="2.5" />
          <polygon points="72,60 80,60 78,72 70,72" fill="#000000" />
          {/* Medalla / Sello de aprobación */}
          <rect x="30" y="52" width="40" height="26" rx="6" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
          <text x="50" y="69" fill="#000000" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
            100% MX
          </text>
        </g>
      )}
    </svg>
  )
}
