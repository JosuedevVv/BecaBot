export const ScholarshipDocumentHeroSvg = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 520 380"
    fill="none"
    className={`w-full max-w-lg ${className}`}
    aria-label="Documentación oficial de becas e investigación académica en México"
  >
    <defs>
      {/* Fondo con medio tono / tramado retro */}
      <pattern id="doc-halftone" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="#E2E2E2" />
      </pattern>
    </defs>

    {/* Marco arquitectónico con trazo vintage marcado */}
    <rect x="8" y="8" width="504" height="364" rx="20" fill="#FFFFFF" stroke="#000000" strokeWidth="3.5" />
    <rect x="16" y="16" width="488" height="348" rx="14" fill="url(#doc-halftone)" />

    {/* Resplandor gráfico de fondo (líneas dinámicas de aprobación) */}
    <g stroke="#000000" strokeWidth="1.5" opacity="0.25">
      <line x1="260" y1="190" x2="40" y2="40" strokeDasharray="4 4" />
      <line x1="260" y1="190" x2="260" y2="20" strokeDasharray="4 4" />
      <line x1="260" y1="190" x2="480" y2="40" strokeDasharray="4 4" />
    </g>

    {/* Gran Convocatoria Oficial Central (Documento de Beca con Sellos Reales) */}
    <g transform="translate(130, 40)">
      {/* Sombra proyectada tipo cómic/retro */}
      <rect x="10" y="10" width="260" height="290" rx="12" fill="#000000" />
      {/* Hoja de papel principal */}
      <rect x="0" y="0" width="260" height="290" rx="12" fill="#FFFFFF" stroke="#000000" strokeWidth="3" />

      {/* Cabecera del Documento Oficial */}
      <rect x="0" y="0" width="260" height="48" rx="10" fill="#000000" />
      <circle cx="28" cy="24" r="12" fill="#FFFFFF" />
      {/* Escudo / Símbolo de Educación */}
      <path d="M28 16L20 22L28 28L36 22L28 16Z" fill="#000000" />
      <text x="50" y="22" fill="#FFFFFF" fontSize="11" fontWeight="900" fontFamily="sans-serif">
        GOBIERNO DE MÉXICO · SEP
      </text>
      <text x="50" y="34" fill="#E0E0E0" fontSize="9" fontWeight="700" fontFamily="sans-serif">
        CONVOCATORIA NACIONAL 2026-2027
      </text>

      {/* Título de la Beca en el Documento */}
      <text x="24" y="74" fill="#000000" fontSize="13" fontWeight="900" fontFamily="sans-serif">
        BECA PARA EL BIENESTAR
      </text>
      <text x="24" y="88" fill="#404040" fontSize="10" fontWeight="700" fontFamily="sans-serif">
        Educación Superior y Media Superior
      </text>
      <line x1="24" y1="96" x2="236" y2="96" stroke="#000000" strokeWidth="2" />

      {/* Cuerpo de Requisitos Simulados con Casillas de Verificación (Checklist) */}
      <g transform="translate(24, 110)">
        {/* Item 1 */}
        <rect x="0" y="0" width="14" height="14" rx="3" fill="#000000" stroke="#000000" strokeWidth="1.5" />
        <path d="M3 7L6 10L11 3" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="22" y="11" fill="#000000" fontSize="10" fontWeight="800" fontFamily="sans-serif">
          Estar inscrito en IPES prioritaria
        </text>

        {/* Item 2 */}
        <rect x="0" y="24" width="14" height="14" rx="3" fill="#000000" stroke="#000000" strokeWidth="1.5" />
        <path d="M3 31L6 34L11 27" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="22" y="35" fill="#000000" fontSize="10" fontWeight="800" fontFamily="sans-serif">
          No contar con otra beca federal activa
        </text>

        {/* Item 3 */}
        <rect x="0" y="48" width="14" height="14" rx="3" fill="#000000" stroke="#000000" strokeWidth="1.5" />
        <path d="M3 55L6 58L11 51" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="22" y="59" fill="#000000" fontSize="10" fontWeight="800" fontFamily="sans-serif">
          Promedio mínimo según tabulador
        </text>

        {/* Item 4 */}
        <rect x="0" y="72" width="14" height="14" rx="3" fill="#000000" stroke="#000000" strokeWidth="1.5" />
        <path d="M3 79L6 82L11 75" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="22" y="83" fill="#000000" fontSize="10" fontWeight="800" fontFamily="sans-serif">
          CURP y documentación oficial vigente
        </text>
      </g>

      {/* Sello Rojo/Negro Circular de Convocatoria Verificada */}
      <g transform="translate(160, 205)">
        <circle cx="36" cy="36" r="32" fill="#FFFFFF" stroke="#000000" strokeWidth="3" strokeDasharray="5 3" />
        <circle cx="36" cy="36" r="26" fill="#F7F7F7" stroke="#000000" strokeWidth="1.5" />
        <text x="36" y="32" fill="#000000" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          VERIFICADO
        </text>
        <text x="36" y="44" fill="#000000" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          100% MX
        </text>
      </g>
    </g>

    {/* Tarjeta Flotante Izquierda: Birrete y Grado Universitario */}
    <g transform="translate(30, 80)">
      <rect x="6" y="6" width="120" height="100" rx="12" fill="#000000" />
      <rect x="0" y="0" width="120" height="100" rx="12" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />

      {/* Birrete Vectorial Real */}
      <g transform="translate(20, 16)">
        <polygon points="40,6 74,18 40,30 6,18" fill="#000000" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="40" cy="18" r="3.5" fill="#FFFFFF" />
        <path d="M40 18 Q 58 20, 62 36" stroke="#000000" strokeWidth="2.5" fill="none" />
        <polygon points="58,36 66,36 64,44 57,44" fill="#000000" />
        <path d="M20 23 C 26 19, 54 19, 60 23 V 32 C 54 36, 26 36, 20 32 Z" fill="#000000" />
      </g>
      <text x="60" y="78" fill="#000000" fontSize="10.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
        LICENCIATURA
      </text>
      <text x="60" y="90" fill="#404040" fontSize="8.5" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
        UNAM · IPN · UAM
      </text>
    </g>

    {/* Tarjeta Flotante Derecha: Calendario y Alerta de Fecha Límite */}
    <g transform="translate(370, 180)">
      <rect x="6" y="6" width="120" height="110" rx="12" fill="#000000" />
      <rect x="0" y="0" width="120" height="110" rx="12" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />

      {/* Calendario con fecha de cierre */}
      <rect x="18" y="14" width="84" height="20" rx="4" fill="#000000" />
      <text x="60" y="28" fill="#FFFFFF" fontSize="9.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
        FECHA LÍMITE
      </text>
      <text x="60" y="60" fill="#000000" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
        28 OCT
      </text>
      <text x="60" y="76" fill="#000000" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
        CIERRE DE REGISTRO
      </text>
      <rect x="18" y="86" width="84" height="14" rx="4" fill="#F0F0F0" />
      <text x="60" y="96" fill="#000000" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
        ✓ Alerta Activa
      </text>
    </g>

    {/* Estrellas decorativas retro */}
    <g fill="#000000">
      <polygon points="120,30 123,37 131,39 125,45 127,53 120,49 113,53 115,45 109,39 117,37" />
      <polygon points="410,120 412,126 418,128 413,132 415,138 410,135 405,138 407,132 402,128 408,126" />
    </g>
  </svg>
)
