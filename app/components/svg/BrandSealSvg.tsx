type BrandSealProps = {
  size?: number
  className?: string
}

export const BrandSealSvg = ({ size = 28, className = "" }: BrandSealProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    fill="none"
    style={{ width: size, height: size }}
    className={`shrink-0 ${className}`}
    aria-hidden
  >
    <rect x="2" y="2" width="28" height="28" rx="8" stroke="#111111" strokeWidth="1.75" />
    <path
      d="M16 8L7 13.5L16 19L25 13.5L16 8Z"
      fill="#111111"
      stroke="#111111"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    <path
      d="M10 16.5V21.5C10 23.5 12.5 25 16 25C19.5 25 22 23.5 22 21.5V16.5"
      stroke="#111111"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M24 14.5V20.5"
      stroke="#111111"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="24" cy="21.5" r="1" fill="#111111" />
  </svg>
)
