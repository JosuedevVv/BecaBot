import './globals.css'
import { SiteHeader } from './components/SiteHeader'

type LayoutProps = {
  children: React.ReactNode
}

export const metadata = {
  title: 'BecaBot — Asesor de Becas en México',
  description:
    'Encuentra convocatorias, requisitos y fechas límite de becas en México con respuestas verificadas por RAG y citas oficiales.',
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col bg-bg text-text antialiased">
        <SiteHeader />
        <main className="flex-1 pt-20">{children}</main>
      </body>
    </html>
  )
}
