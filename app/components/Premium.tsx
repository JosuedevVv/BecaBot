import Link from "next/link"
import { Seal } from "./Seal"

export const PremiumBadge = ({ className = "" }: { className?: string }) => (
  <span className={`inline-flex items-center gap-1.5 ${className}`}>
    <Seal size={13} />
    <span className="text-[10px] font-medium uppercase tracking-[0.2em] foil-text">
      Premium
    </span>
  </span>
)

type PremiumCTAProps = {
  href?: string
  children?: React.ReactNode
  size?: "sm" | "md" | "lg"
  block?: boolean
  className?: string
}

const sizes = {
  sm: "h-8 px-3 text-[12px] gap-1.5",
  md: "h-10 px-4 text-[13px] gap-2",
  lg: "h-12 px-5 text-sm gap-2",
}

export const PremiumCTA = ({
  href = "/premium",
  children = "Hazte Premium",
  size = "md",
  block = false,
  className = "",
}: PremiumCTAProps) => (
  <Link
    href={href}
    className={`foil-fill foil-fill-lift shadow-foil inline-flex items-center justify-center rounded-full font-medium text-foil-vault transition-transform duration-150 active:scale-[0.97] ${sizes[size]} ${block ? "w-full" : ""
      } ${className}`}
  >
    <Seal size={size === "lg" ? 16 : 13} tone="invert" />
    {children}
  </Link>
)
