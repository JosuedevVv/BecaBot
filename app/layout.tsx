import './globals.css'
import { SiteHeader } from './components/SiteHeader'

type LayoutProps = {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="es">
      <body className="flex h-dvh flex-col overflow-hidden">
        <SiteHeader />
        <main className="min-h-0 flex-1">{children}</main>
      </body>
    </html>
  )
}