import type { Metadata, Viewport } from 'next'
import { Tiro_Bangla } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/locales'
import { Header } from '@/components/navigation/header'
import { CustomerBottomNav } from '@/components/navigation/customer-bottom-nav'

const tiroBangla = Tiro_Bangla({
  weight: '400',
  subsets: ['bengali'],
  display: 'swap',
  variable: '--font-tiro-bangla',
})

export const metadata: Metadata = {
  title: 'mistri – আপনার এলাকার বিশ্বস্ত মিস্ত্রী',
  description: 'ঠাকুরগাঁও, পঞ্চগড় ও দিনাজপুরের সেরা হোম ও প্রফেশনাল সার্ভিস মার্কেটপ্লেস',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563EB',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn" className={tiroBangla.variable}>
      <body className={`${tiroBangla.className} min-h-screen bg-slate-50 text-slate-900 antialiased pb-20 sm:pb-0`}>
        <I18nProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <CustomerBottomNav />
          </div>
        </I18nProvider>
      </body>
    </html>
  )
}
