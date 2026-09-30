import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: { default: 'The Himalayan Travels | Tour Packages', template: '%s | The Himalayan Travels' },
  description: 'Handcrafted Himalayan tour packages to Ladakh, Manali, Spiti, Kedarnath & more. Best prices, expert guides, 5000+ happy travellers.',
  keywords: ['Himalayan tours', 'Ladakh packages', 'Manali tour', 'Spiti Valley', 'Char Dham Yatra'],
  openGraph: { type: 'website', siteName: 'The Himalayan Travels', url: 'https://thehimalayantravels.com' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  )
}
