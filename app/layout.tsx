import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Ethio Tour Guider Portal | Connecting Guides & Tour Operators',
  description: 'The premium digital platform connecting verified tour operators with elite licensed guides. Professional, secure, and reliable tour services.',
  keywords: 'tour guides, tour operators, licensed guides, tourism, travel, ethio tour guid portal',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-full flex flex-col font-sans overflow-x-hidden gradient-mesh antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
