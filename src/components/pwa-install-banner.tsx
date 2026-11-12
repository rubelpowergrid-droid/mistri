'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { useI18n } from '@/locales'

export function PwaInstallBanner() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isDismissed, setIsDismissed] = useState(true)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    setIsStandalone(isStandaloneMode)

    if (isStandaloneMode) return

    // Check localStorage dismissal
    const dismissedUntil = localStorage.getItem('mistri_pwa_dismissed')
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsDismissed(false)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsDismissed(true)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    // Dismiss for 24 hours
    localStorage.setItem('mistri_pwa_dismissed', String(Date.now() + 24 * 60 * 60 * 1000))
  }

  if (isStandalone || isDismissed || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 z-50 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="skeuo-surface-dark bg-gradient-to-r from-[#2c7865] to-[#1c5245] text-[#fefded] p-3.5 rounded-2xl shadow-2xl border border-[#38967f]/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/icons/icon-192x192.png"
            alt="mistri24"
            className="h-10 w-10 rounded-xl border border-[#fefded]/30 shadow-md shrink-0 object-cover"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-black tracking-tight text-[#fefded] truncate">
              {isBn ? 'mistri24 অ্যাপ ইনস্টল করুন' : 'Install mistri24 App'}
            </h4>
            <p className="text-[11px] text-[#fefded]/80 truncate">
              {isBn ? 'হোমস্ক্রিন থেকে এক ক্লিকে ব্যবহার করুন' : 'Add to home screen for 1-tap access'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-[#fefded] text-[#2c7865] hover:bg-white text-xs font-black shadow-md transition-all flex items-center gap-1 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isBn ? 'ইনস্টল' : 'Install'}</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-lg text-[#fefded]/60 hover:text-[#fefded] transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

