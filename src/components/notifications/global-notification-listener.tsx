'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, ArrowRight, X, Phone, MapPin, Wrench, ShieldCheck, Check, Smartphone } from 'lucide-react'
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

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BEls45QXodFHlbmdaMT71OGqLvNzayCHOpazELkYkjdQ3xlPB-EG6caHxthm8RpllBAHgGyd4xDLB6G8PIOUs2U'

function urlB64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
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
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default')
  const [showPermissionBanner, setShowPermissionBanner] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [testNotificationStatus, setTestNotificationStatus] = useState<string | null>(null)
  const notifiedIdsRef = useRef<Set<string>>(new Set())

  // Check and setup push subscription
  const subscribeToPush = useCallback(async () => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setPermissionStatus('unsupported')
      return
    }

    try {
      setIsSubscribing(true)
      const registration = await navigator.serviceWorker.ready
      let sub = await registration.pushManager.getSubscription()

      if (!sub) {
        const convertedVapidKey = urlB64ToUint8Array(VAPID_PUBLIC_KEY)
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        })
      }

      if (sub) {
        const user = getStoredUser()
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: sub.toJSON(),
            phone: user?.phone || null,
            userId: user?.id || null,
            role: user?.role || 'mistri',
          }),
        })
      }
    } catch (err) {
      console.warn('[GlobalNotificationListener] Web push subscription warning:', err)
    } finally {
      setIsSubscribing(false)
    }
  }, [])

  // Initial check on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) {
      setPermissionStatus('unsupported')
      return
    }

    setPermissionStatus(Notification.permission)

    if (Notification.permission === 'granted') {
      subscribeToPush()
    } else if (Notification.permission === 'default') {
      // Check if user is logged in
      const user = getStoredUser()
      if (user) {
        // Show permission request banner after a brief 2-second delay
        const timer = setTimeout(() => setShowPermissionBanner(true), 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [subscribeToPush])

  // Request permission explicitly on user button click
  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return

    try {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)
      if (permission === 'granted') {
        setShowPermissionBanner(false)
        await subscribeToPush()
      } else {
        setShowPermissionBanner(false)
      }
    } catch (err) {
      console.warn('Notification permission request error:', err)
    }
  }

  // Trigger delayed test push notification
  const handleSendTestPush = async () => {
    const user = getStoredUser()
    setTestNotificationStatus('৫ সেকেন্ড পর নোটিফিকেশন আসছে... এখনই মোবাইলের স্ক্রিন অফ করুন!')
    try {
      const res = await fetch('/api/notifications/test-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phone || null,
          userId: user?.id || null,
          delaySeconds: 5,
          title: '🔔 টেস্ট নোটিফিকেশন (mistri24)',
          message: 'স্ক্রিন অফ থাকলেও সফলভাবে নোটিফিকেশন রিসিভ হয়েছে! শুভকামনা।',
        }),
      })
      const json = await res.json()
      if (json.success) {
        setTimeout(() => setTestNotificationStatus(null), 8000)
      }
    } catch {
      setTestNotificationStatus('টেস্ট পুশ পাঠাতে সমস্যা হয়েছে')
      setTimeout(() => setTestNotificationStatus(null), 4000)
    }
  }

  // Polling for live booking requests when logged-in as mistri (for instant foreground alerts)
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

              // 3. Trigger native System Notification if available
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

  return (
    <>
      {/* ── Test Notification Banner / Feedback ─────────────────────────────── */}
      {testNotificationStatus && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="rounded-2xl bg-stone-900 text-amber-300 px-4 py-3 shadow-2xl border border-amber-400/40 flex items-center gap-3">
            <Smartphone className="h-5 w-5 animate-pulse text-amber-400 shrink-0" />
            <p className="text-xs font-semibold leading-relaxed text-white">
              {testNotificationStatus}
            </p>
          </div>
        </div>
      )}

      {/* ── Screen-Off Push Permission Banner ───────────────────────────────── */}
      {showPermissionBanner && permissionStatus === 'default' && (
        <aside 
          aria-label="নোটিফিকেশন অনুমতি"
          className="fixed bottom-20 sm:bottom-4 left-4 right-4 z-40 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="rounded-2xl bg-[#2c7865] p-3.5 text-[#fefded] shadow-2xl border-2 border-amber-300/40 backdrop-blur-md">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-stone-900 font-bold shadow-md">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">
                    স্ক্রিন অফ থাকলেও নোটিফিকেশন পান
                  </h4>
                  <p className="text-[11px] text-[#fefded]/85 mt-0.5 leading-tight">
                    মোবাইলের স্ক্রিন বন্ধ থাকলেও নতুন কাজের অ্যালার্ট ও রিংটোন বাজবে।
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPermissionBanner(false)}
                className="rounded-full p-1 text-[#fefded]/70 hover:text-white cursor-pointer"
                aria-label="বাতিল"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={handleRequestPermission}
                disabled={isSubscribing}
                className="flex-1 py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{isSubscribing ? 'সংযুক্ত হচ্ছে...' : 'অনুমতি দিন (Allow)'}</span>
              </button>
              <button
                onClick={() => setShowPermissionBanner(false)}
                className="px-2.5 py-1.5 text-xs text-[#fefded]/80 hover:text-white cursor-pointer"
              >
                পরে
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ── Active Booking Alert Toast ─────────────────────────────────────── */}
      {activeAlert && (
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
      )}
    </>
  )
}
