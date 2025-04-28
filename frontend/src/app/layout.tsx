import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/AppContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Todo Calendar App',
  description: 'A modern todo list and calendar application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          <AppProvider>
            {children}
          </AppProvider>
        </main>
      </body>
    </html>
  )
} 