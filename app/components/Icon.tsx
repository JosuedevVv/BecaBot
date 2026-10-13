
import type { ReactElement } from "react"

export type IconName =
  | "cards"
  | "requirements"
  | "apply"
  | "calendar"
  | "compass"
  | "layers"

const paths: Record<IconName, ReactElement> = {
  cards: (
    <>
      <rect x="2.5" y="4.5" width="4" height="4" rx="1" />
      <rect x="2.5" y="10.5" width="4" height="4" rx="1" />
      <rect x="2.5" y="16.5" width="4" height="4" rx="1" />
      <path d="M9.5 6.5h11M9.5 12.5h11M9.5 18.5h11" />
    </>
  ),
  requirements: (
    <>
      <rect x="6" y="3.5" width="12" height="17" rx="2" />
      <path d="M9 3.5a3 3 0 0 1 6 0v1H9z" />
      <path d="M9.5 10h5M9.5 14h5M9.5 18h3" />
    </>
  ),
  apply: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
    />
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2.1 5-4.9 2 2.1-5z" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3.5 12.5 8.5 4.8 8.5-4.8" />
    </>
  ),
}

type IconProps = {
  name: IconName
  className?: string
}

export const Icon = ({ name, className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.6"
    stroke="currentColor"
    aria-hidden
    className={className}
  >
    {paths[name]}
  </svg>
)
