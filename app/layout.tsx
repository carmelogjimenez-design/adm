import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ADM',
  description: 'ADM - Becas deportivas en EE. UU.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
