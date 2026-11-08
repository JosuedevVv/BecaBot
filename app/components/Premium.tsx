import Link from "next/link"

export const PremiumBadge = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-deep ${className}`}
  >
    <span className="size-1 rounded-full bg-accent-deep" />
    Premium
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
    className={`shadow-foil inline-flex items-center justify-center rounded-full bg-accent font-medium text-foil-vault transition-all duration-200 hover:bg-accent-deep active:scale-[0.97] ${sizes[size]} ${block ? "w-full" : ""
      } ${className}`}
  >
    {children}
  </Link>
)
