export type CategoryStampKind = "basic" | "university" | "posgrado" | "santander"

export const CategoryVintageStampSvg = ({
  kind,
  size = 64,
  className = "",
}: {
  kind: CategoryStampKind
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
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="16"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="3.5"
      />
      <rect
        x="12"
        y="12"
        width="76"
        height="76"
        rx="10"
        fill="#F7F7F7"
        stroke="#111111"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

      {kind === "basic" && (
        <g stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="30" y="34" width="40" height="44" rx="8" fill="#111111" />
          <rect x="36" y="44" width="28" height="24" rx="4" fill="#FFFFFF" />
          <line x1="50" y1="44" x2="50" y2="68" stroke="#111111" strokeWidth="2" />
          <path d="M42 34 V 24 C 42 20, 58 20, 58 24 V 34" fill="none" strokeWidth="3" />
          <path d="M66 30 L 76 18 L 82 24 L 72 36 Z" fill="#FFFFFF" strokeWidth="2" />
          <polygon points="76,18 80,12 82,24" fill="#111111" />
        </g>
      )}

      {kind === "university" && (
        <g stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="50,22 84,36 50,50 16,36" fill="#111111" strokeWidth="3" />
          <circle cx="50" cy="36" r="3.5" fill="#FFFFFF" />
          <path d="M50 36 Q 72 38, 76 60" fill="none" strokeWidth="2.5" />
          <polygon points="72,60 80,60 78,72 70,72" fill="#111111" />
          <path d="M30 43 C 38 38, 62 38, 70 43 V 54 C 62 60, 38 60, 30 54 Z" fill="#FFFFFF" />
          <line x1="38" y1="50" x2="62" y2="50" stroke="#111111" strokeWidth="2" />
        </g>
      )}

      {kind === "posgrado" && (
        <g stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M44 22 H 56 V 38 L 74 68 C 78 75, 72 82, 64 82 H 36 C 28 82, 22 75, 26 68 L 44 38 Z"
            fill="#FFFFFF"
            strokeWidth="3"
          />
          <path d="M31 72 C 40 68, 60 76, 69 72 L 72 78 C 70 80, 30 80, 28 78 Z" fill="#111111" />
          <circle cx="50" cy="56" r="4" fill="#111111" />
          <ellipse cx="50" cy="56" rx="14" ry="5" fill="none" transform="rotate(30 50 56)" />
          <ellipse cx="50" cy="56" rx="14" ry="5" fill="none" transform="rotate(-30 50 56)" />
        </g>
      )}

      {kind === "santander" && (
        <g stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="22" y="38" width="56" height="42" rx="8" fill="#FFFFFF" strokeWidth="3" />
          <path d="M22 38 C 22 26, 78 26, 78 38 Z" fill="#111111" strokeWidth="3" />
          <circle cx="50" cy="56" r="10" fill="#111111" />
          <text x="50" y="60.5" fill="#FFFFFF" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
            $
          </text>
          <line x1="30" y1="56" x2="38" y2="56" stroke="#111111" strokeWidth="2.5" />
          <line x1="62" y1="56" x2="70" y2="56" stroke="#111111" strokeWidth="2.5" />
        </g>
      )}
    </svg>
  )
}
