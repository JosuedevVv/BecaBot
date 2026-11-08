export const RagArchitectureSvg = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 420 260"
    fill="none"
    className={`w-full max-w-md ${className}`}
    aria-hidden
  >
    {/* Fondo arquitectónico punteado */}
    <defs>
      <pattern id="dot-grid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.8" fill="#D4D4D4" />
      </pattern>
    </defs>
    <rect width="420" height="260" rx="16" fill="#FBFBFB" stroke="#EBEBEB" />
    <rect width="420" height="260" rx="16" fill="url(#dot-grid)" />

    {/* Bloque 1: Convocatorias Oficiales México (PostgreSQL + pgvector) */}
    <g transform="translate(24, 30)">
      <rect width="160" height="88" rx="10" fill="#FFFFFF" stroke="#111111" strokeWidth="1.5" />
      <rect x="12" y="14" width="24" height="24" rx="6" fill="#111111" />
      <path d="M18 26L22 30L30 20" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="44" y="25" fill="#111111" fontSize="11" fontWeight="700" fontFamily="sans-serif">
        BASE DOCUMENTAL
      </text>
      <text x="44" y="36" fill="#717171" fontSize="9" fontWeight="500" fontFamily="sans-serif">
        pgvector · México
      </text>
      <text x="12" y="58" fill="#484848" fontSize="10" fontFamily="sans-serif">
        • Convocatorias oficiales
      </text>
      <text x="12" y="72" fill="#484848" fontSize="10" fontFamily="sans-serif">
        • Requisitos normalizados
      </text>
    </g>

    {/* Bloque 2: Búsqueda Web de Respaldo */}
    <g transform="translate(24, 142)">
      <rect width="160" height="88" rx="10" fill="#FFFFFF" stroke="#DDDDDD" strokeWidth="1.25" />
      <rect x="12" y="14" width="24" height="24" rx="6" fill="#F1F1F1" stroke="#DDDDDD" />
      <circle cx="24" cy="26" r="6" stroke="#111111" strokeWidth="1.4" />
      <path d="M28 30L32 34" stroke="#111111" strokeWidth="1.4" strokeLinecap="round" />
      <text x="44" y="25" fill="#111111" fontSize="11" fontWeight="700" fontFamily="sans-serif">
        RESPALDO WEB
      </text>
      <text x="44" y="36" fill="#717171" fontSize="9" fontWeight="500" fontFamily="sans-serif">
        Autoalimentación RAG
      </text>
      <text x="12" y="58" fill="#717171" fontSize="10" fontFamily="sans-serif">
        • Fuentes gubernamentales
      </text>
      <text x="12" y="72" fill="#717171" fontSize="10" fontFamily="sans-serif">
        • Juez LLM de utilidad
      </text>
    </g>

    {/* Conectores / Flechas de Trazabilidad */}
    <path d="M184 74H236" stroke="#111111" strokeWidth="1.5" strokeDasharray="3 3" />
    <path d="M184 186H210V100H236" stroke="#717171" strokeWidth="1.25" strokeDasharray="3 3" />

    {/* Bloque 3: Asesor BecaBot (Respuesta con Cita) */}
    <g transform="translate(236, 44)">
      <rect width="160" height="172" rx="12" fill="#111111" />
      <rect x="14" y="14" width="22" height="22" rx="6" fill="#FFFFFF" />
      <path d="M21 21L25 25L31 17" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="42" y="24" fill="#FFFFFF" fontSize="11" fontWeight="700" fontFamily="sans-serif">
        BECABOT
      </text>
      <text x="42" y="34" fill="#A8A8A8" fontSize="8.5" fontWeight="600" fontFamily="sans-serif">
        EXCLUSIVO MÉXICO
      </text>

      {/* Tarjeta simulada de respuesta */}
      <rect x="12" y="46" width="136" height="72" rx="6" fill="#1E1E1E" />
      <text x="20" y="62" fill="#FFFFFF" fontSize="9.5" fontWeight="600" fontFamily="sans-serif">
        Beca Benito Juárez
      </text>
      <text x="20" y="74" fill="#D4D4D4" fontSize="8" fontFamily="sans-serif">
        Monto: $920 MXN / mes
      </text>
      <text x="20" y="86" fill="#D4D4D4" fontSize="8" fontFamily="sans-serif">
        Requisitos: Estar inscrito
      </text>
      <text x="20" y="98" fill="#D4D4D4" fontSize="8" fontFamily="sans-serif">
        en escuela pública prioritaria.
      </text>
      <text x="20" y="110" fill="#34D399" fontSize="8" fontWeight="600" fontFamily="sans-serif">
        ✓ Vigencia verificada
      </text>

      {/* Cita de trazabilidad */}
      <rect x="12" y="128" width="136" height="30" rx="6" fill="#292929" />
      <circle cx="22" cy="143" r="3" fill="#FFFFFF" />
      <text x="30" y="146" fill="#D4D4D4" fontSize="8" fontFamily="sans-serif">
        Fuente: Convocatoria SEP
      </text>
    </g>
  </svg>
)
