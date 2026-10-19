import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sistema Escolar V2', description: 'Gestão escolar segura' }
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>
}
