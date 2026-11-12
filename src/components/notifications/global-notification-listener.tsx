'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, ArrowRight, X, Phone, MapPin, Wrench } from 'lucide-react'
import { getStoredUser } from '@/lib/auth-client'

interface PendingBookingAlert {
  id: string
  bookingNumber?: string
  customerName?: string
  customerPhone?: string
  jobAddress?: string
  serviceName?: string
  amount?: number
  preferredDate?: string
  preferredTime?: string
}

// Synthesize pleasant 3-tone chime with Web Audio API (zero external assets, 100% reliable)
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12)

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12)
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.12 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + idx * 0.12)
      osc.stop(ctx.currentTime + idx * 0.12 + 0.4)
    })
  } catch (err) {
    console.warn('Audio chime playback error:', err)
  }
}

export function GlobalNotificationListener() {
  const router = useRouter()
  const [activeAlert, setActiveAlert] = useState<PendingBookingAlert | null>(null)
  const notifiedIdsRef = useRef<Set<string>>(new Set())

  // Request system notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        // Automatically request on first user interaction
        const handleFirstInteraction = () => {
          Notification.requestPermission().catch(() => {})
          window.removeEventListener('click', handleFirstInteraction)
          window.removeEventListener('touchstart', handleFirstInteraction)
        }
        window.addEventListener('click', handleFirstInteraction, { once: true })
        window.addEventListener('touchstart', handleFirstInteraction, { once: true })
      }
    }
  }, [])

  // Poll for live booking requests for logged-in mistri
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkIncomingBookings = async () => {
      const user = getStoredUser()
      if (!user || user.role !== 'mistri' || !user.phone) return

      const cleanPhone = user.phone.replace(/[^0-9]/g, '')
      if (!cleanPhone) return

      try {
        const res = await fetch(`/api/bookings?role=mistri&mistriPhone=${cleanPhone}&status=pending`, {
          cache: 'no-store',
        })
        const json = await res.json()

        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          // Find any pending booking not yet alerted in this session
          for (const item of json.data) {
            const bookingId = item.id || item.bookingNumber
            if (bookingId && !notifiedIdsRef.current.has(bookingId)) {
              notifiedIdsRef.current.add(bookingId)

              // 1. Play chime audio
              playNotificationChime()

              // 2. Vibrate mobile device
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                try {
                  navigator.vibrate([300, 150, 300, 150, 450])
                } catch {}
              }

              // 3. Trigger native System Notification
              const title = '🔔 নতুন কাজের বুকিং অনুরোধ!'
              const bodyText = `${item.customerName || 'গ্রাহক'} কাজের অনুরোধ পাঠিয়েছেন। কাজ: ${item.serviceName || item.subcategory || 'সার্ভিস'}। ঠিকানা: ${item.jobAddress || item.location || 'এলাকা'}`

              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                try {
                  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then((registration) => {
                      registration.showNotification(title, {
                        body: bodyText,
                        icon: '/icons/icon-192x192.png',
                        badge: '/icons/icon-192x192.png',
                        vibrate: [300, 150, 300],
                        tag: `booking-${bookingId}`,
                      } as any)
                    })
                  } else {
                    new Notification(title, {
                      body: bodyText,
                      icon: '/icons/icon-192x192.png',
                    })
                  }
                } catch (notifErr) {
                  console.warn('System notification trigger failed:', notifErr)
                }
              }

              // 4. Set In-App Visual Alert Toast
              setActiveAlert({
                id: item.id,
                bookingNumber: item.bookingNumber || item.booking_number,
                customerName: item.customerName || 'সম্মানিত গ্রাহক',
                customerPhone: item.customerPhone || item.contact_phone,
                jobAddress: item.jobAddress || item.location,
                serviceName: item.serviceName || item.subcategory || 'কারিগরি সেবা',
                amount: item.amount || item.estimatedBudget || 400,
                preferredDate: item.preferredDate || item.date,
                preferredTime: item.preferredTime,
              })

              // Notify rest of the app
              window.dispatchEvent(new CustomEvent('mistri_new_booking_arrived', { detail: item }))
              break
            }
          }
        }
      } catch (err) {
        // Ignore polling errors silently
      }
    }

    // Initial check
    checkIncomingBookings()

    // Active polling every 4 seconds
    const interval = setInterval(checkIncomingBookings, 4000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  if (!activeAlert) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-lg animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="rounded-2xl bg-gradient-to-r from-[#2c7865] via-[#246252] to-[#1a493d] p-4 text-[#fefded] shadow-2xl border-2 border-[#fefded]/30 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-stone-950 font-bold shadow-md animate-bounce">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-black/20 px-2 py-0.5 rounded-full mb-0.5">
                নতুন কাজের অনুরোধ!
              </span>
              <h4 className="text-sm font-black leading-tight text-white">
                {activeAlert.customerName}
              </h4>
            </div>
          </div>

          <button
            onClick={() => setActiveAlert(null)}
            className="rounded-full p-1 text-[#fefded]/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2.5 space-y-1 text-xs text-[#fefded]/90 bg-black/20 p-2.5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2">
            <Wrench className="h-3.5 w-3.5 text-amber-300 shrink-0" />
            <span className="font-semibold">{activeAlert.serviceName}</span>
          </div>
          {activeAlert.jobAddress && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <span className="truncate">{activeAlert.jobAddress}</span>
            </div>
          )}
          {activeAlert.customerPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <span>{activeAlert.customerPhone}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => {
              setActiveAlert(null)
              router.push('/requests')
            }}
            className="flex-1 skeuo-btn-light py-2 px-3 text-xs font-black text-[#2c7865] flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <span>অনুরোধ দেখুন ও গ্রহণ করুন</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setActiveAlert(null)}
            className="px-3 py-2 text-xs font-semibold text-[#fefded]/80 hover:text-white transition-colors cursor-pointer"
          >
            পরে দেখব
          </button>
        </div>
      </div>
    </div>
  )
}
