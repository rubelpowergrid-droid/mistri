'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, Navigation, MapPin, Phone, User, Clock, 
  CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink,
  Play, Radio, DollarSign, Loader2, Sparkles, AlertCircle, Wrench
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/locales'
import { BookingHistoryTimeline } from '@/components/bookings/booking-history-timeline'

export default function MistriJobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const bookingId = (params?.id as string) || ''

  const [booking, setBooking] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [jobStatus, setJobStatus] = useState<'pending' | 'accepted' | 'on_the_way' | 'in_progress' | 'completed'>('accepted')
  
  // Real GPS tracking states
  const [isLocationSharing, setIsLocationSharing] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [lastPingTime, setLastPingTime] = useState<string | null>(null)
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null)
  const [gpsSpeed, setGpsSpeed] = useState<number | null>(null)
  const [permissionError, setPermissionError] = useState<string | null>(null)

  const [finalAgreedPrice, setFinalAgreedPrice] = useState<number>(400)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const watchIdRef = useRef<number | null>(null)
  const lastPosRef = useRef<{ lat: number; lng: number; speed: number | null; heading: number | null; accuracy: number | null } | null>(null)

  // Load live booking details dynamically by ID
  useEffect(() => {
    if (!bookingId) return

    let isMounted = true

    async function loadBooking() {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/bookings/${bookingId}`, { cache: 'no-store' })
        const json = await res.json()

        if (isMounted) {
          if (json.success && json.data) {
            const b = json.data
            setBooking(b)
            setJobStatus(b.status || 'accepted')
            setFinalAgreedPrice(b.agreedPrice || b.estimatedBudget || b.amount || 400)
          } else {
            setErrorMessage(json.error || (isBn ? 'বুকিংয়ের তথ্য পাওয়া যায়নি' : 'Booking not found'))
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(isBn ? 'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি' : 'Connection failed')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadBooking()

    return () => {
      isMounted = false
    }
  }, [bookingId, isBn])

  // Send real GPS position to tracking API
  const sendGpsPing = useCallback(async (pos: GeolocationPosition) => {
    const lat = pos.coords.latitude
    const lng = pos.coords.longitude
    const accuracy = Math.round(pos.coords.accuracy)
    const speed = pos.coords.speed !== null && pos.coords.speed !== undefined 
      ? Math.round(pos.coords.speed * 3.6) // m/s to km/h
      : null
    const heading = pos.coords.heading || 0

    setGpsCoords({ lat, lng })
    setGpsAccuracy(accuracy)
    setGpsSpeed(speed)
    setLastPingTime(new Date().toLocaleTimeString('bn-BD'))
    setIsLocating(false)

    lastPosRef.current = { lat, lng, speed, heading, accuracy }

    try {
      await fetch('/api/tracking/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking?.id || bookingId,
          latitude: lat,
          longitude: lng,
          accuracy,
          speed: speed || 0,
          heading,
        }),
      })
    } catch (err) {
      console.warn('GPS ping sync failed:', err)
    }
  }, [booking?.id, bookingId])

  // Stop location sharing cleanup
  const stopLocationWatch = useCallback(async () => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsLocationSharing(false)
    setIsLocating(false)
    setLastPingTime(null)
    setGpsAccuracy(null)
    setGpsSpeed(null)

    try {
      await fetch('/api/tracking/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking?.id || bookingId }),
      })
    } catch {}
  }, [booking?.id, bookingId])

  // Toggle live location sharing with Real GPS
  const toggleLocationSharing = async () => {
    if (isLocationSharing) {
      await stopLocationWatch()
      return
    }

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setPermissionError('আপনার মোবাইলে বা ব্রাউজারে জিপিএস লোকেশন সমর্থিত নয়।')
      return
    }

    setPermissionError(null)
    setIsLocating(true)
    setIsLocationSharing(true)

    // 1. Get immediate high-accuracy position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        sendGpsPing(pos)
      },
      (err) => {
        setIsLocating(false)
        if (err.code === 1) { // PERMISSION_DENIED
          setPermissionError('লোকেশন পারমিশন বন্ধ রয়েছে! ফোনের সেটিংস বা ব্রাউজার পারমিশনে গিয়ে লোকেশন "Allow" করুন।')
          setIsLocationSharing(false)
        } else if (err.code === 2) {
          setPermissionError('জিপিএস সংকেত পাওয়া যায়নি। অনুগ্রহ করে ফোনের লোকেশন/GPS সুইচ চালু করুন।')
          setIsLocationSharing(false)
        } else {
          setPermissionError('লোকেশন সনাক্ত করতে সময়সীমা পার হয়েছে। পুনরায় চেষ্টা করুন।')
          setIsLocationSharing(false)
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    )

    // 2. Continuous watchPosition for live movement
    try {
      const wid = navigator.geolocation.watchPosition(
        (pos) => {
          sendGpsPing(pos)
        },
        (err) => {
          if (err.code === 1) {
            setPermissionError('লোকেশন পারমিশন প্রত্যাহার করা হয়েছে।')
            stopLocationWatch()
          }
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 3000 }
      )
      watchIdRef.current = wid
    } catch (e: any) {
      console.warn('watchPosition failed:', e)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  // Handle Start Journey (En Route)
  const handleStartJourney = async () => {
    try {
      await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'on_the_way' }),
      })
      setJobStatus('on_the_way')
      setBooking((prev: any) => ({
        ...prev,
        status: 'on_the_way',
        journeyStartedAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
      }))
      if (!isLocationSharing) {
        toggleLocationSharing()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Handle Start Job
  const handleStartJob = async () => {
    setIsStarting(true)
    try {
      await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' }),
      })
      setJobStatus('in_progress')
      setBooking((prev: any) => ({
        ...prev,
        status: 'in_progress',
        startedAt: prev?.startedAt || new Date().toISOString(),
      }))
      await stopLocationWatch()
    } catch (e) {
      console.error(e)
    } finally {
      setIsStarting(false)
    }
  }

  // Handle Mark Completed
  const handleConfirmCompletion = async () => {
    setIsCompleting(true)
    try {
      await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          agreedPrice: finalAgreedPrice,
        }),
      })
      setJobStatus('completed')
      setBooking((prev: any) => ({
        ...prev,
        status: 'completed',
        agreedPrice: finalAgreedPrice,
        completedAt: new Date().toISOString(),
      }))
      setShowCompletionModal(false)
      await stopLocationWatch()
    } catch (e) {
      console.error(e)
    } finally {
      setIsCompleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 flex flex-col items-center justify-center gap-3 text-stone-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-[#2c7865]" />
        <span>বুকিং ও কাস্টমারের তথ্য লোড হচ্ছে...</span>
      </div>
    )
  }

  if (errorMessage && !booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-stone-900">{errorMessage}</h3>
        <Button onClick={() => router.push('/mistri/bookings')} className="skeuo-btn-dark text-xs">
          কাজের তালিকায় ফিরুন
        </Button>
      </div>
    )
  }

  const destLat = booking?.latitude
  const destLng = booking?.longitude
  const googleMapsUrl = (destLat && destLng)
    ? `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`
    : booking?.customerAddress || booking?.jobAddress
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.customerAddress || booking.jobAddress)}`
    : `https://www.google.com/maps`

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/mistri/bookings')}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isBn ? 'মিস্ত্রী কাজ তালিকায় ফিরুন' : 'Back to Jobs'}</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-[#2c7865] tracking-tight">
              {isBn ? 'কাজের বিস্তারিত ও লাইভ একশন' : 'Job Execution & Location Desk'}
            </h1>
            <Badge 
              variant="neutral"
              className={`text-xs px-2.5 py-0.5 font-bold ${
                jobStatus === 'completed' 
                  ? 'bg-emerald-600 text-white' 
                  : jobStatus === 'in_progress' 
                  ? 'bg-amber-500 text-slate-950' 
                  : 'bg-[#2c7865] text-[#fefded]'
              }`}
            >
              {jobStatus === 'completed' 
                ? (isBn ? 'কাজ সম্পন্ন' : 'Completed') 
                : jobStatus === 'in_progress' 
                ? (isBn ? 'কাজ চলমান' : 'In Progress') 
                : (isBn ? 'অনুরোধ গৃহীত' : 'Accepted')}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-mono bg-stone-200/60 px-2.5 py-1 rounded-lg">
            বুকিং নং: {booking.bookingNumber || booking.id}
          </span>
        </div>
      </div>

      {/* Permission Error Warning */}
      {permissionError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">জিপিএস লোকেশন পারমিশন সমস্যা:</span>
            <span>{permissionError}</span>
          </div>
        </div>
      )}

      {/* GPS Live Sharing Switcher Banner */}
      {jobStatus !== 'completed' && (
        <Card className={`p-5 transition-all ${
          isLocationSharing 
            ? 'bg-[#2c7865] text-[#fefded] shadow-lg border-[#1e5548]' 
            : 'skeuo-surface border-stone-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Radio className={`h-5 w-5 ${isLocationSharing ? 'text-amber-300 animate-pulse' : 'text-stone-500'}`} />
                <h3 className={`text-base font-bold ${isLocationSharing ? 'text-[#fefded]' : 'text-stone-900'}`}>
                  {isBn ? 'কাস্টমারের সাথে লাইভ লোকেশন শেয়ারিং' : 'Live Location Sharing with Customer'}
                </h3>
              </div>
              <p className={`text-xs ${isLocationSharing ? 'text-[#fefded]/85' : 'text-stone-600'}`}>
                {isBn 
                  ? 'কাস্টমারের ঠিকানার উদ্দেশ্যে রওনা হলে এটি অন করুন। মোবাইলের জিপিএস থেকে সরাসরি গ্রাহক আপনার অবস্থান দেখতে পারবেন।' 
                  : 'Turn on when traveling to customer location. Customer can track your arrival in real-time.'}
              </p>
              
              {isLocationSharing && (
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-amber-200">
                  {isLocating ? (
                    <span className="flex items-center gap-1 font-semibold text-white animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" /> জিপিএস পজিশন নেওয়া হচ্ছে...
                    </span>
                  ) : (
                    <>
                      {lastPingTime && <span>সর্বশেষ জিপিএস পিং: <strong>{lastPingTime}</strong></span>}
                      {gpsAccuracy && <span>নির্ভুলতা: <strong>±{gpsAccuracy} মিটার</strong></span>}
                      {gpsSpeed !== null && gpsSpeed > 0 && <span>গতি: <strong>{gpsSpeed} কিমি/ঘণ্টা</strong></span>}
                    </>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={toggleLocationSharing}
              disabled={isLocating}
              className={`font-bold text-xs px-5 py-2.5 shadow-xs cursor-pointer ${
                isLocationSharing 
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950' 
                  : 'skeuo-btn-dark text-xs'
              }`}
            >
              <Navigation className="h-4 w-4 mr-1.5" />
              <span>
                {isLocationSharing 
                  ? (isBn ? 'শেয়ারিং বন্ধ করুন' : 'Stop Sharing') 
                  : (isBn ? 'আমি রওনা হয়েছি (Share Live GPS)' : 'I am on the way')}
              </span>
            </Button>
          </div>
        </Card>
      )}

      {/* Customer & Location Details Card */}
      <Card className="p-6 space-y-4 skeuo-surface border-stone-300">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <User className="h-4 w-4 text-[#2c7865]" />
            <span>{isBn ? 'কাস্টমার ও কাজের সঠিক ঠিকানা' : 'Customer & Job Site'}</span>
          </div>
          <Badge variant="neutral" className="skeuo-pill text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
            {isBn ? 'বুকিং গ্রহণ সাপেক্ষে দৃশ্যমান' : 'Contact Unveiled'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-3">
            <div>
              <span className="text-stone-500 block text-[11px] font-semibold">{isBn ? 'গ্রাহকের নাম' : 'Customer Name'}</span>
              <span className="text-sm font-bold text-stone-900">{booking.customerName || 'সম্মানিত গ্রাহক'}</span>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px] font-semibold">{isBn ? 'মোবাইল নম্বর' : 'Phone'}</span>
              <a href={`tel:${booking.customerPhone}`} className="text-sm font-bold text-[#2c7865] hover:underline flex items-center gap-1.5 mt-0.5">
                <Phone className="h-3.5 w-3.5" />
                <span>{booking.customerPhone}</span>
              </a>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px] font-semibold">{isBn ? 'কাঙ্ক্ষিত সময়' : 'Preferred Slot'}</span>
              <span className="font-semibold text-stone-800">
                {booking.preferredDate || booking.date}, {booking.preferredTime || 'সকাল ১০:০০ - ১২:০০'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-stone-500 block text-[11px] font-semibold">{isBn ? 'কাজের ঠিকানা' : 'Job Address'}</span>
              <p className="font-bold text-stone-900 leading-snug">{booking.customerAddress || booking.jobAddress}</p>
              {destLat && destLng && (
                <span className="text-[10px] text-stone-500 font-mono mt-0.5 block">
                  📍 জিপিএস পিন: {Number(destLat).toFixed(4)}, {Number(destLng).toFixed(4)}
                </span>
              )}
            </div>

            <div>
              <span className="text-stone-500 block text-[11px] font-semibold">{isBn ? 'সেবা ও কাজের ধরন' : 'Service Name'}</span>
              <p className="font-bold text-[#2c7865]">{booking.serviceName || booking.category}</p>
            </div>

            {/* Direct Google Maps Turn-by-Turn Link */}
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-full pt-1">
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-stone-300 text-stone-800 hover:bg-stone-100 cursor-pointer">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5 text-[#2c7865]" />
                <span>{isBn ? 'গুগল ম্যাপে দিকনির্দেশনা (Directions)' : 'Open in Google Maps'}</span>
              </Button>
            </a>
          </div>
        </div>

        {/* Work Description Box */}
        <div className="pt-3 border-t border-stone-200 space-y-1">
          <span className="text-stone-600 font-semibold text-xs block">{isBn ? 'সমস্যার বিবরণ:' : 'Problem Description:'}</span>
          <p className="text-xs text-stone-800 bg-[#fefded] p-3 rounded-xl border border-stone-200 font-medium leading-relaxed">
            "{booking.description || (isBn ? 'কোনো বিবরণ দেওয়া হয়নি।' : 'No description provided.')}"
          </p>
        </div>
      </Card>

      {/* Action Desk Card */}
      <Card className="p-6 skeuo-surface border-stone-300 space-y-4">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
          <Play className="h-4 w-4 text-[#2c7865]" />
          <span>{isBn ? 'কাজের অগ্রগতি স্ট্যাটাস আপডেট' : 'Job Lifecycle Action'}</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {jobStatus === 'accepted' && (
            <>
              <Button
                onClick={handleStartJourney}
                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Navigation className="h-4 w-4" />
                <span>{isBn ? 'আমি রওনা হয়েছি (যাত্রা শুরু)' : 'Start Journey'}</span>
              </Button>
              <Button
                onClick={handleStartJob}
                disabled={isStarting}
                className="w-full sm:flex-1 skeuo-btn-dark py-3 text-xs font-bold cursor-pointer"
              >
                {isStarting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Play className="h-4 w-4 mr-1.5" />
                )}
                <span>{isBn ? 'কাজ শুরু করেছি' : 'Mark Job Started'}</span>
              </Button>
            </>
          )}

          {jobStatus === 'on_the_way' && (
            <Button
              onClick={handleStartJob}
              disabled={isStarting}
              className="w-full sm:flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {isStarting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wrench className="h-4 w-4" />
              )}
              <span>{isBn ? 'ঠিকানায় পৌঁছে কাজ শুরু করেছি' : 'Arrived & Start Job'}</span>
            </Button>
          )}

          {jobStatus === 'in_progress' && (
            <Button
              onClick={() => setShowCompletionModal(true)}
              className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs shadow-md cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              <span>{isBn ? 'কাজ সম্পন্ন হয়েছে ও বিল কনফার্ম করুন' : 'Mark Job Completed & Collect Payment'}</span>
            </Button>
          )}

          {jobStatus === 'completed' && (
            <div className="w-full p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                কাজটি সফলভাবে সম্পন্ন হয়েছে। মোট পারিশ্রমিক: ৳{finalAgreedPrice}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Booking History Timeline with Bangla Date & Time */}
      <BookingHistoryTimeline 
        booking={booking} 
        perspective="mistri" 
      />

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#fefded] p-6 shadow-2xl border-2 border-stone-300 space-y-4">
            <h3 className="text-base font-bold text-stone-900">
              {isBn ? 'কাজ সম্পন্ন ও চূড়ান্ত পারিশ্রমিক' : 'Confirm Final Bill'}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              গ্রাহকের সাথে আলোচনা করে চূড়ান্ত নির্ধারিত পারিশ্রমিক লিখুন।
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">চূড়ান্ত বিল (টাকা)</label>
              <Input
                type="number"
                value={finalAgreedPrice}
                onChange={(e) => setFinalAgreedPrice(Number(e.target.value) || 0)}
                className="font-bold text-lg text-[#2c7865]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={handleConfirmCompletion}
                disabled={isCompleting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                {isCompleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'সম্পন্ন নিশ্চিত করুন'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCompletionModal(false)}
                className="text-xs cursor-pointer"
              >
                বাতিল
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
