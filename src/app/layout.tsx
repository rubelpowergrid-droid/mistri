import type { Metadata, Viewport } from 'next'
import { Tiro_Bangla } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/locales'
import { Header } from '@/components/navigation/header'
import { Footer } from '@/components/navigation/footer'
import { CustomerBottomNav } from '@/components/navigation/customer-bottom-nav'
import { PwaRegistrar } from '@/components/pwa-registrar'
import { PwaInstallBanner } from '@/components/pwa-install-banner'
import { GlobalNotificationListener } from '@/components/notifications/global-notification-listener'

const tiroBangla = Tiro_Bangla({
  weight: '400',
  subsets: ['bengali'],
  display: 'swap',
  variable: '--font-tiro-bangla',
})

export const metadata: Metadata = {
  title: 'mistri24 – আপনার এলাকার বিশ্বস্ত মিস্ত্রী',
  description: 'ঠাকুরগাঁও, পঞ্চগড় ও দিনাজপুরের সেরা হোম ও প্রফেশনাল কারিগর সার্ভিস মার্কেটপ্লেস',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'mistri24',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2c7865',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn" className={tiroBangla.variable}>
      <body className={`${tiroBangla.className} min-h-screen bg-[#fefded] text-[#14382f] antialiased pb-20 sm:pb-0`}>
        <I18nProvider>
          <PwaRegistrar />
          <PwaInstallBanner />
          <GlobalNotificationListener />
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CustomerBottomNav />
          </div>
        </I18nProvider>
      </body>
    </html>
  )
}
