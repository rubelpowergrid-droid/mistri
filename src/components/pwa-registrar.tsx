'use client'

import { useEffect } from 'react'

export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[MISTRI PWA] Service Worker registered with scope:', reg.scope)
          })
          .catch((err) => {
            console.warn('[MISTRI PWA] Service Worker registration failed:', err)
          })
      })
    }
  }, [])

  return null
}
