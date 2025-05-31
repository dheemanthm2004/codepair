import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'


const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'CodePair+ | Real-Time Coding Interview Platform',
  description: 'Practice coding interviews with real-time collaboration, shared editor, and professional interview simulation.',
  keywords: ['coding interview', 'programming', 'technical interview', 'collaboration', 'real-time'],
  authors: [{ name: 'CodePair+ Team' }],
  openGraph: {
    title: 'CodePair+ | Real-Time Coding Interview Platform',
    description: 'Practice coding interviews with real-time collaboration',
    type: 'website',
    url: 'https://codepair-plus.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodePair+ | Real-Time Coding Interview Platform',
    description: 'Practice coding interviews with real-time collaboration',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
