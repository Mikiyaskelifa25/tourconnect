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
  title: {
    default: 'Ethio Tour Guider Portal | Find Licensed Tour Guides & Operators in Ethiopia',
    template: '%s | Ethio Tour Guider Portal',
  },
  description: 'Ethiopia\'s premium platform connecting verified tour operators with elite licensed guides. Book professional tour guides in Addis Ababa, Lalibela, Gondar, and across all Ethiopian destinations.',
  keywords: [
    'Ethiopia tour guides', 'licensed tour guides Ethiopia', 'Ethiopia tour operators', 'Ethiopian travel agency',
    'tour guide booking Ethiopia', 'hire tour guide Ethiopia', 'Ethiopia travel', 'Addis Ababa tour guide',
    'Lalibela tour guide', 'Gondar tour guide', 'Simien Mountains guide', 'Danakil Depression tour',
    'Omo Valley tour', 'Ethiopia tourism', 'Ethiopia travel portal', 'tourist guide Ethiopia',
    'Ethiopia safari guide', 'historic Ethiopia tours', 'northern Ethiopia tours', 'southern Ethiopia tours',
    'best tour guides Ethiopia', 'Ethiopia vacation', 'travel to Ethiopia', 'Ethiopia travel planning',
    'licensed tour operator Ethiopia', 'Ethiopia cultural tours', 'Ethiopia trekking guide',
  ].join(', '),
  authors: [{ name: 'Ethio Tour Guider Portal' }],
  creator: 'Ethio Tour Guider Portal',
  publisher: 'Ethio Tour Guider Portal',
  metadataBase: new URL('https://ethiotourguider.com'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Ethio Tour Guider Portal',
    title: 'Ethio Tour Guider Portal | Find Licensed Tour Guides & Operators in Ethiopia',
    description: 'Ethiopia\'s premium platform connecting verified tour operators with elite licensed guides. Book professional tour guides across all Ethiopian destinations.',
    url: 'https://ethiotourguider.com',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Ethio Tour Guider Portal' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ethio Tour Guider Portal',
    description: 'Find licensed tour guides and operators across Ethiopia. Addis Ababa, Lalibela, Gondar, and beyond.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: { google: '' },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Ethio Tour Guider Portal',
              url: 'https://ethiotourguider.com',
              description: 'Connecting verified tour operators with elite licensed guides in Ethiopia.',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://ethiotourguider.com/?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="h-full flex flex-col font-sans overflow-x-hidden gradient-mesh antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
