'use client'

import React, { useState, useEffect, Suspense, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { 
  Navigation, Phone, ShieldCheck, ArrowLeft, Clock, 
  MapPin, Wrench, ExternalLink, AlertCircle, Compass,
  CheckCircle2, XCircle, AlertTriangle, X, Play, Loader2,
  Radio, Crosshair
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InteractiveMap } from '@/components/maps/interactive-map'
import { 
  Coordinates, 
  calculateHaversineDistance, 
  estimateTravelTimeMinutes, 
  generateGoogleMapsDirectionUrl 
} from '@/lib/geo'
import { formatDistance, toBanglaNumber } from '@/lib/utils'

const CANCELLATION_REASONS = [
  'ভুলবশত বুক করেছি',
  'মিস্ত্রী সাড়া দিতে দেরি করছে',
  'অন্য মিস্ত্রী পেয়ে গেছি',
  'সমস্যা ইতিমধ্যে সমাধান হয়ে গেছে',
  'অন্যান্য কারণ',
]

const DEFAULT_CUSTOMER_LOCATION: Coordinates = { latitude: 26.0336, longitude: 88.4617 }
const DEFAULT_MISTRI_START: Coordinates = { latitude: 26.0425, longitude: 88.4550 }

function CustomerLiveTrackContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const bookingId = (params?.id as string) || ''
  const initialStatus = searchParams.get('status') || 'pending'

  // ── State ──────────────────────────────────────────────────────────────────
  const [isLoadingBooking, setIsLoadingBooking] = useState(true)
  const [booking, setBooking] = useState({
    id: bookingId,
    status: initialStatus as 'pending' | 'accepted' | 'in_progress' | 'cancelled',
    customerAddress: 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
    customerLocation: DEFAULT_CUSTOMER_LOCATION,
    mistriName: '',
    mistriTitle: '',
    mistriPhone: '',
    category: '',
    mistriAvatar: '',
  })

  const [customerGpsAccuracy, setCustomerGpsAccuracy] = useState<number | null>(null)
  const [mistriLocation, setMistriLocation] = useState<Coordinates>(DEFAULT_MISTRI_START)
  const [mistriSpeed, setMistriSpeed] = useState<number | null>(null)
  const [lastMistriPing, setLastMistriPing] = useState<string | null>(null)
  const [distanceMeters, setDistanceMeters] = useState(1200)
  const [etaMinutes, setEtaMinutes] = useState(5)
  const [isSessionActive, setIsSessionActive] = useState(false)

  // Cancel Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0])
  const [cancelNotes, setCancelNotes] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  // ── 1. Request Customer's Real Device GPS Location ────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc: Coordinates = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }
        setBooking((prev) => ({
          ...prev,
          customerLocation: userLoc,
        }))
        setCustomerGpsAccuracy(Math.round(pos.coords.accuracy))
      },
      (err) => {
        console.warn('Customer GPS unavailable, using booking address coords:', err)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  // ── 2. Load real booking data from localStorage + API ─────────────────────
  useEffect(() => {
    if (!bookingId) return

    let found = false

    // Try localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('mistri_customer_bookings')
        if (stored) {
          const list = JSON.parse(stored) as any[]
          const match = list.find((b: any) => b.id === bookingId || b.bookingNumber === bookingId)
          if (match) {
            setBooking((prev) => ({
              ...prev,
              id: match.id || bookingId,
              status: (match.status as any) || initialStatus,
              customerAddress: match.jobAddress || prev.customerAddress,
              customerLocation: (match.latitude && match.longitude) 
                ? { latitude: match.latitude, longitude: match.longitude } 
                : prev.customerLocation,
              mistriName: match.mistriName || '',
              mistriTitle: match.mistriTitle || '',
              mistriPhone: match.mistriPhone || '',
              category: match.category || '',
              mistriAvatar: match.mistriAvatar || '',
            }))
            found = true
          }
        }
      } catch {}
    }

    // Fetch from API
    const fetchFromApi = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`, { cache: 'no-store' })
        const json = await res.json()
        if (json.success && json.data) {
          const match = json.data
          setBooking((prev) => ({
            ...prev,
            id: match.id || bookingId,
            status: (match.status as any) || prev.status,
            customerAddress: match.jobAddress || match.location || prev.customerAddress,
            customerLocation: (match.latitude && match.longitude)
              ? { latitude: match.latitude, longitude: match.longitude }
              : prev.customerLocation,
            mistriName: match.mistriName || prev.mistriName,
            mistriTitle: match.mistriTitle || prev.mistriTitle,
            mistriPhone: match.mistriPhone || prev.mistriPhone,
            category: match.serviceName || match.category || prev.category,
            mistriAvatar: match.mistriAvatar || prev.mistriAvatar,
          }))
        }
      } catch {}
      setIsLoadingBooking(false)
    }

    fetchFromApi()
    if (found) setIsLoadingBooking(false)
  }, [bookingId, initialStatus])

  // ── 3. Realtime GPS Polling for Mistri's Live Movement ─────────────────────
  useEffect(() => {
    if (booking.status === 'cancelled') return

    const pollMistriLocation = async () => {
      try {
        const res = await fetch(`/api/tracking/${bookingId}`, { cache: 'no-store' })
        const json = await res.json()

        if (json.success && json.is_active && json.data) {
          const { latitude, longitude, speed, last_ping_at } = json.data
          if (latitude && longitude) {
            const nextMistriLoc = { latitude: Number(latitude), longitude: Number(longitude) }
            setMistriLocation(nextMistriLoc)
            setMistriSpeed(speed ? Math.round(Number(speed)) : null)
            if (last_ping_at) {
              setLastMistriPing(new Date(last_ping_at).toLocaleTimeString('bn-BD'))
            }
            setIsSessionActive(true)

            // Recalculate distance and ETA dynamically
            const dist = calculateHaversineDistance(nextMistriLoc, booking.customerLocation)
            setDistanceMeters(Math.round(dist))
            setEtaMinutes(estimateTravelTimeMinutes(dist))
          }
        } else {
          // Mistri has not started or paused sharing
          setIsSessionActive(false)
        }
      } catch (err) {
        console.warn('Live tracking poll failed:', err)
      }
    }

    pollMistriLocation()
    const interval = setInterval(pollMistriLocation, 3500)

    return () => clearInterval(interval)
  }, [bookingId, booking.customerLocation, booking.status])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSimulateAccept = () => {
    setBooking((prev) => ({ ...prev, status: 'in_progress' }))
    setIsSessionActive(true)
  }

  const handleConfirmCancel = async () => {
    setIsCancelling(true)
    try {
      await fetch(`/api/bookings/${booking.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          reason: cancelReason + (cancelNotes ? `: ${cancelNotes}` : ''),
        }),
      })
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('mistri_customer_bookings')
          if (stored) {
            const list = JSON.parse(stored) as any[]
            const updated = list.map((b: any) =>
              b.id === booking.id ? { ...b, status: 'cancelled' } : b
            )
            localStorage.setItem('mistri_customer_bookings', JSON.stringify(updated))
          }
        } catch {}
      }
    } catch {}

    setBooking((prev) => ({ ...prev, status: 'cancelled' }))
    setIsSessionActive(false)
    setIsCancelling(false)
    setIsCancelModalOpen(false)
    setTimeout(() => router.push('/bookings'), 1200)
  }

  const googleMapsUrl = generateGoogleMapsDirectionUrl(mistriLocation, booking.customerLocation)
  const isEnRoute = (booking.status === 'in_progress' || booking.status === 'accepted') && isSessionActive

  if (isLoadingBooking && !booking.mistriName) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 flex flex-col items-center justify-center gap-3 text-stone-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-[#2c7865]" />
        <span>{isBn ? 'বুকিং তথ্য লোড হচ্ছে...' : 'Loading booking details...'}</span>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/bookings')}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isBn ? 'আমার বুকিং তালিকায় ফিরুন' : 'Back to Bookings'}</span>
        </button>

        {isEnRoute ? (
          <Badge variant="neutral" className="skeuo-pill gap-1.5 px-3 py-1 text-xs bg-stone-900 text-white font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isBn ? 'লাইভ জিপিএস ট্র্যাকিং সক্রিয়' : 'Live Tracking Active'}</span>
          </Badge>
        ) : booking.status === 'pending' ? (
          <Badge variant="neutral" className="skeuo-pill gap-1.5 px-3 py-1 text-xs bg-amber-100 text-amber-900 border-amber-300 font-bold">
            <Clock className="h-3 w-3 text-amber-600" />
            <span>{isBn ? 'মিস্ত্রীর সম্মতির অপেক্ষায়' : 'Awaiting Confirmation'}</span>
          </Badge>
        ) : (
          <Badge variant="neutral" className="skeuo-pill gap-1.5 px-3 py-1 text-xs bg-[#2c7865]/10 text-[#2c7865] border-[#2c7865]/30 font-bold">
            <CheckCircle2 className="h-3 w-3 text-[#2c7865]" />
            <span>{isBn ? 'অনুরোধ গৃহীত (রওয়ানার অপেক্ষায়)' : 'Booking Confirmed'}</span>
          </Badge>
        )}
      </div>

      {/* Customer GPS Accuracy Indicator */}
      {customerGpsAccuracy !== null && (
        <div className="flex items-center justify-between text-[11px] text-stone-600 bg-stone-100/80 px-3 py-1.5 rounded-xl border border-stone-200">
          <span className="flex items-center gap-1.5">
            <Crosshair className="h-3.5 w-3.5 text-[#2c7865]" />
            <span>আপনার ডিভাইস জিপিএস সনাক্ত হয়েছে (নির্ভুলতা: <strong>±{customerGpsAccuracy} মিটার</strong>)</span>
          </span>
          <span className="font-mono text-stone-500">
            {booking.customerLocation.latitude.toFixed(4)}, {booking.customerLocation.longitude.toFixed(4)}
          </span>
        </div>
      )}

      {/* Mistri Info Bar */}
      {booking.mistriName && (
        <Card className="p-4 skeuo-surface border-[#2c7865]/20 flex items-center gap-3">
          {booking.mistriAvatar && (
            <img
              src={booking.mistriAvatar}
              alt={booking.mistriName}
              className="h-12 w-12 rounded-2xl object-cover border border-[#2c7865]/30 shadow-sm shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[#14382f] truncate">{booking.mistriName}</h3>
            <p className="text-xs text-[#2c7865] truncate">{booking.mistriTitle || booking.category}</p>
          </div>
          <Badge variant="neutral" className={`text-[10px] skeuo-pill font-bold shrink-0 ${isEnRoute ? 'bg-[#2c7865] text-[#fefded]' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>
            {isEnRoute ? (isBn ? 'অন-রুট (লাইভ জিপিএস)' : 'En Route') : (isBn ? 'অপেক্ষমাণ' : 'Pending')}
          </Badge>
        </Card>
      )}

      {/* Realistic Pending State Banner */}
      {booking.status === 'pending' && (
        <Card className="p-6 skeuo-surface space-y-4 border-stone-300">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 shrink-0 border border-amber-200">
                <Clock className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-black text-stone-900">
                  {isBn ? 'বুকিং অনুরোধ জমা হয়েছে — মিস্ত্রীর সম্মতির অপেক্ষায় রয়েছে' : 'Booking Request Submitted — Awaiting Confirmation'}
                </h2>
                <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
                  {isBn 
                    ? 'আপনার অনুরোধটি কারিগরের কাছে পাঠানো হয়েছে। মিস্ত্রী অনুরোধ গ্রহণ করে আপনার ঠিকানার উদ্দেশ্যে রওনা হলে স্বয়ংক্রিয়ভাবে লাইভ জিপিএস ট্র্যাকিং সক্রিয় হবে।' 
                    : 'Your request was dispatched. Live GPS tracking will turn on as soon as the professional accepts and heads your way.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {booking.mistriPhone && (
                <a href={`tel:${booking.mistriPhone}`}>
                  <Button size="sm" variant="outline" className="skeuo-btn-light text-xs font-bold">
                    <Phone className="h-3.5 w-3.5 mr-1" />
                    <span>{isBn ? 'মিস্ত্রীকে কল করুন' : 'Call'}</span>
                  </Button>
                </a>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCancelModalOpen(true)}
                className="skeuo-btn-light text-xs text-red-600 border-red-300 font-bold hover:bg-red-50"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                <span>{isBn ? 'বুকিং বাতিল করুন' : 'Cancel Booking'}</span>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* When Mistri Accepted but has not started GPS Sharing yet */}
      {(booking.status === 'accepted' || booking.status === 'in_progress') && !isSessionActive && (
        <Card className="p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-950">
                {isBn ? 'মিস্ত্রী অনুরোধ গ্রহণ করেছেন' : 'Request Accepted by Professional'}
              </h3>
            </div>
            {booking.mistriPhone && (
              <a href={`tel:${booking.mistriPhone}`}>
                <Button size="sm" className="skeuo-btn-light text-stone-900 font-bold text-xs py-1 px-3">
                  <Phone className="h-3.5 w-3.5 mr-1" />
                  <span>{isBn ? 'কল দিন' : 'Call'}</span>
                </Button>
              </a>
            )}
          </div>
          <p className="text-xs text-amber-900/85 leading-relaxed">
            {isBn
              ? 'মিস্ত্রী আপনার উদ্দেশ্যে রওনা হয়ে তার ফোন থেকে লাইভ লোকেশন শেয়ার চালু করলেই সরাসরি এখানে তার গতি ও জিপিএস অবস্থান দেখা যাবে।'
              : 'As soon as the professional departs and enables GPS sharing from their device, their live position will appear on the map.'}
          </p>
        </Card>
      )}

      {/* En-Route Active Live Tracking Card */}
      {isEnRoute && (
        <Card className="p-5 skeuo-surface-dark text-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-stone-300 font-semibold flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>{isBn ? 'মিস্ত্রী সরাসরি আপনার ঠিকানার দিকে আসছেন (লাইভ জিপিএস)' : 'Professional is Heading to Your Location'}</span>
              </span>
              <div className="flex items-baseline gap-3">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  {toBanglaNumber(etaMinutes)} {isBn ? 'মিনিট' : 'mins'}
                </h1>
                <span className="text-sm font-semibold text-stone-300">
                  ({formatDistance(distanceMeters / 1000, isBn)} দূরে)
                </span>
                {mistriSpeed !== null && mistriSpeed > 0 && (
                  <span className="text-xs text-amber-300 font-mono">
                    • গতি: {mistriSpeed} কিমি/ঘণ্টা
                  </span>
                )}
              </div>
              {lastMistriPing && (
                <span className="text-[10px] text-stone-400 block">
                  সর্বশেষ জিপিএস আপডেট: {lastMistriPing}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {booking.mistriPhone && (
                <a href={`tel:${booking.mistriPhone}`}>
                  <Button size="sm" className="skeuo-btn-light text-stone-900 font-bold text-xs">
                    <Phone className="h-3.5 w-3.5 mr-1" />
                    <span>{isBn ? 'কল করুন' : 'Call'}</span>
                  </Button>
                </a>
              )}

              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="skeuo-btn-light text-stone-900 font-bold text-xs">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  <span>{isBn ? 'গুগল ম্যাপে দেখুন' : 'Google Maps'}</span>
                </Button>
              </a>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCancelModalOpen(true)}
                className="skeuo-btn-light text-xs text-red-600 border-red-300 font-bold hover:bg-red-50"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                <span>{isBn ? 'বাতিল' : 'Cancel'}</span>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Interactive Map Component */}
      <InteractiveMap
        customerLocation={booking.customerLocation}
        customerAddress={booking.customerAddress}
        mistriLocation={mistriLocation}
        mistriName={booking.mistriName || 'মিস্ত্রী'}
        mistriCategory={booking.category}
        height="420px"
        isLiveTracking={isEnRoute}
      />

      {/* Worker Card and Safety Privacy Policy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Worker Details */}
        <Card className="p-4 skeuo-surface flex items-center justify-between border-[#2c7865]/20">
          <div className="flex items-center gap-3">
            {booking.mistriAvatar ? (
              <img
                src={booking.mistriAvatar}
                alt={booking.mistriName}
                className="h-12 w-12 rounded-2xl object-cover border border-[#2c7865]/30 shadow-sm"
              />
            ) : (
              <div className="h-12 w-12 rounded-2xl bg-[#2c7865]/10 flex items-center justify-center border border-[#2c7865]/20">
                <Wrench className="h-5 w-5 text-[#2c7865]" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-[#14382f]">{booking.mistriName || '—'}</h3>
              <p className="text-xs text-[#2c7865]">{booking.mistriTitle || booking.category}</p>
              {booking.mistriPhone && (
                <span className="text-[11px] font-mono font-bold text-[#14382f]">{booking.mistriPhone}</span>
              )}
            </div>
          </div>
          <Badge variant="neutral" className={`text-[10px] skeuo-pill font-bold ${isEnRoute ? 'bg-[#2c7865] text-[#fefded]' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>
            {isEnRoute ? (isBn ? 'অন-রুট' : 'En Route') : (isBn ? 'অপেক্ষমাণ' : 'Pending')}
          </Badge>
        </Card>

        {/* Privacy Note */}
        <Card className="p-4 skeuo-surface space-y-1 text-[#14382f] text-xs border-[#2c7865]/20">
          <div className="flex items-center gap-1.5 font-bold text-[#2c7865]">
            <ShieldCheck className="h-4 w-4 text-[#2c7865]" />
            <span>{isBn ? 'গোপনীয়তা ও নিরাপত্তা নীতি' : 'Privacy & Consent Protection'}</span>
          </div>
          <p className="text-[11px] text-[#2c7865]/80 leading-relaxed">
            {isBn 
              ? 'এই লাইভ জিপিএস সেশনটি উভয় পক্ষের সম্মতিতে শুধুমাত্র কাজ শুরুর পূর্ব পর্যন্ত সক্রিয় থাকবে। কাজ সম্পন্ন বা বাতিল হলে সেশনটি স্বয়ংক্রিয়ভাবে বন্ধ ও মুছে যাবে।'
              : 'Live tracking is consent-based and strictly active while traveling. It terminates automatically upon job completion.'}
          </p>
        </Card>
      </div>

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6 skeuo-surface space-y-4 border-stone-300">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 text-stone-900 font-bold">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="text-sm">{isBn ? 'বুকিং বাতিলের কারণ' : 'Reason for Cancellation'}</h3>
              </div>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {CANCELLATION_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    cancelReason === reason
                      ? 'bg-[#2c7865]/10 border-[#2c7865] font-bold text-[#14382f]'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="accent-[#2c7865]"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              <div className="pt-2">
                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                  {isBn ? 'অতিরিক্ত মন্তব্য (ঐচ্ছিক)' : 'Additional Comments (Optional)'}
                </label>
                <textarea
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="বিস্তারিত লিখুন..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:border-[#2c7865] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
              <Button
                variant="outline"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 text-xs"
              >
                {isBn ? 'ফিরে যান' : 'Back'}
              </Button>
              <Button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {isCancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>{isBn ? 'বাতিল নিশ্চিত করুন' : 'Confirm Cancel'}</span>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function CustomerLiveTrackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-16 flex flex-col items-center justify-center gap-3 text-stone-500 text-xs">
          <Loader2 className="h-6 w-6 animate-spin text-[#2c7865]" />
          <span>লোড হচ্ছে...</span>
        </div>
      }
    >
      <CustomerLiveTrackContent />
    </Suspense>
  )
}
