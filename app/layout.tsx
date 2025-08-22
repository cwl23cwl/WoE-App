import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Write on English - ESL Classroom App',
  description: 'Learn English writing with pictures and stories. ESL classroom management made simple.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Allow user scaling for browser zoom (no maximum-scale limit)
  userScalable: true,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}