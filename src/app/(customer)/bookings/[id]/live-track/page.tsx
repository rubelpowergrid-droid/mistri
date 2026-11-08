'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { 
  Navigation, Phone, ShieldCheck, ArrowLeft, Clock, 
  MapPin, Wrench, ExternalLink, AlertCircle, Compass,
  CheckCircle2, XCircle, AlertTriangle, X, Play
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
  'মিস্ত্রী সাড়া দিতে দেরি করছে',
  'অন্য মিস্ত্রী পেয়ে গেছি',
  'সমস্যা ইতিমধ্যে সমাধান হয়ে গেছে',
  'অন্যান্য কারণ',
]

function CustomerLiveTrackContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const initialStatus = searchParams.get('status') || 'pending'

  // Booking counterpart details
  const [booking, setBooking] = useState({
    id: params.id || 'MST-261108-PK99',
    status: initialStatus as 'pending' | 'accepted' | 'in_progress' | 'cancelled',
    customerAddress: 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
    customerLocation: { latitude: 26.0336, longitude: 88.4617 },
    mistriName: 'মোঃ রফিকুল ইসলাম',
    mistriTitle: 'সিনিয়র ইলেকট্রিশিয়ান',
    mistriPhone: '01712345678',
    category: 'ইলেকট্রিক্যাল কাজ',
    mistriAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
  })

  // Simulated live moving coordinates of the Mistri (starts 1.2km away when en-route)
  const [mistriLocation, setMistriLocation] = useState<Coordinates>({
    latitude: 26.0425,
    longitude: 88.4550,
  })

  const [distanceMeters, setDistanceMeters] = useState(1200)
  const [etaMinutes, setEtaMinutes] = useState(5)
  const [isSessionActive, setIsSessionActive] = useState(initialStatus === 'in_progress' || initialStatus === 'accepted')

  // Cancel Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0])
  const [cancelNotes, setCancelNotes] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  // Realtime position animation simulator (approaching customer only when active)
  useEffect(() => {
    if (!isSessionActive || booking.status === 'pending' || booking.status === 'cancelled') return

    const interval = setInterval(() => {
      setMistriLocation((prev) => {
        const dLat = (booking.customerLocation.latitude - prev.latitude) * 0.08
        const dLng = (booking.customerLocation.longitude - prev.longitude) * 0.08

        const nextLat = prev.latitude + dLat
        const nextLng = prev.longitude + dLng

        const dist = calculateHaversineDistance(
          { latitude: nextLat, longitude: nextLng },
          booking.customerLocation
        )
        setDistanceMeters(Math.round(dist))
        setEtaMinutes(estimateTravelTimeMinutes(dist))

        return { latitude: nextLat, longitude: nextLng }
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [isSessionActive, booking.customerLocation, booking.status])

  const handleSimulateAccept = () => {
    setBooking(prev => ({ ...prev, status: 'in_progress' }))
    setIsSessionActive(true)
  }

  const handleConfirmCancel = async () => {
    setIsCancelling(true)
    try {
      await fetch(`/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          reason: cancelReason + (cancelNotes ? `: ${cancelNotes}` : ''),
        }),
      })
    } catch {
      // Local fallback
    }

    setBooking(prev => ({ ...prev, status: 'cancelled' }))
    setIsSessionActive(false)
    setIsCancelling(false)
    setIsCancelModalOpen(false)
    setTimeout(() => {
      router.push('/bookings')
    }, 1200)
  }

  const googleMapsUrl = generateGoogleMapsDirectionUrl(mistriLocation, booking.customerLocation)

  const isEnRoute = booking.status === 'in_progress' || booking.status === 'accepted'

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
            <span>{isBn ? 'লাইভ জিপিএস ট্র্যাকিং সক্রিয়' : 'Live Tracking Active'}</span>
          </Badge>
        ) : booking.status === 'pending' ? (
          <Badge variant="neutral" className="skeuo-pill gap-1.5 px-3 py-1 text-xs bg-amber-100 text-amber-900 border-amber-300 font-bold">
            <Clock className="h-3 w-3 text-amber-600" />
            <span>{isBn ? 'মিস্ত্রীর সম্মতির অপেক্ষায়' : 'Awaiting Confirmation'}</span>
          </Badge>
        ) : (
          <Badge variant="neutral" className="skeuo-pill gap-1.5 px-3 py-1 text-xs bg-red-100 text-red-900 border-red-300 font-bold">
            <XCircle className="h-3 w-3 text-red-600" />
            <span>{isBn ? 'বুকিং বাতিলকৃত' : 'Booking Cancelled'}</span>
          </Badge>
        )}
      </div>

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
                  {isBn ? 'বুকিং অনুরোধ জমা হয়েছে — মিস্ত্রীর সম্মতির অপেক্ষায় রয়েছে' : 'Booking Request Submitted — Awaiting Confirmation'}
                </h2>
                <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
                  {isBn 
                    ? 'আপনার অনুরোধটি কারিগরের কাছে সফলভাবে পাঠানো হয়েছে। মিস্ত্রী অনুরোধ গ্রহণ করে আপনার ঠিকানার উদ্দেশ্যে রওনা হলে স্বয়ংক্রিয়ভাবে লাইভ জিপিএস এবং লাইভ ট্র্যাকিং ম্যাপ সক্রিয় হবে।' 
                    : 'Your request was dispatched. Live GPS tracking will turn on as soon as the professional accepts and heads your way.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a href={`tel:${booking.mistriPhone}`}>
                <Button size="sm" variant="outline" className="skeuo-btn-light text-xs font-bold">
                  <Phone className="h-3.5 w-3.5 mr-1" />
                  <span>{isBn ? 'মিস্ত্রীকে কল করুন' : 'Call'}</span>
                </Button>
              </a>

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

          {/* Step Timeline Indicator */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-200 text-xs">
            <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-300 space-y-1">
              <span className="text-[10px] text-stone-500 font-bold block">ধাপ ১</span>
              <span className="font-bold text-stone-900 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>অনুরোধ জমা</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 space-y-1">
              <span className="text-[10px] text-amber-700 font-bold block">ধাপ ২</span>
              <span className="font-bold text-amber-900 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-600 animate-spin" />
                <span>মিস্ত্রীর সম্মতি (চলছে)</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-400 space-y-1">
              <span className="text-[10px] font-bold block">ধাপ ৩</span>
              <span className="font-semibold flex items-center gap-1">
                <span>রওনা ও লাইভ জিপিএস</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-400 space-y-1">
              <span className="text-[10px] font-bold block">ধাপ ৪</span>
              <span className="font-semibold flex items-center gap-1">
                <span>কাজ শুরু ও সমাপ্তি</span>
              </span>
            </div>
          </div>

          {/* Test Simulation Helper Bar */}
          <div className="p-3 bg-stone-100 rounded-xl border border-stone-300 flex items-center justify-between text-xs">
            <span className="text-stone-600 font-medium">
              💡 টেস্টিং নোট: মিস্ত্রী গ্রহণ করার পরের দৃশ্য ও লাইভ জিপিএস দেখতে নিচের বাটনে ক্লিক করুন:
            </span>
            <Button
              size="sm"
              onClick={handleSimulateAccept}
              className="skeuo-btn-dark text-xs font-bold py-1 px-3"
            >
              <Play className="h-3 w-3 mr-1 fill-white" />
              <span>মিস্ত্রী গ্রহণ ও যাত্রা সিমুলেট করুন</span>
            </Button>
          </div>
        </Card>
      )}

      {/* En-Route Active Live Tracking Card */}
      {isEnRoute && (
        <Card className="p-5 skeuo-surface-dark text-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-stone-300 font-semibold flex items-center gap-1">
                <Navigation className="h-3.5 w-3.5 text-white animate-pulse" />
                {isBn ? 'মিস্ত্রী আপনার ঠিকানার উদ্দেশ্যে রওনা হয়েছেন' : 'Professional is Heading to Your Location'}
              </span>
              <div className="flex items-baseline gap-3">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  {toBanglaNumber(etaMinutes)} {isBn ? 'মিনিট' : 'mins'}
                </h1>
                <span className="text-sm font-semibold text-stone-300">
                  ({formatDistance(distanceMeters / 1000, isBn)} দূরে)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a href={`tel:${booking.mistriPhone}`}>
                <Button size="sm" className="skeuo-btn-light text-stone-900 font-bold text-xs">
                  <Phone className="h-3.5 w-3.5 mr-1" />
                  <span>{isBn ? 'কল করুন' : 'Call'}</span>
                </Button>
              </a>

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
        mistriName={booking.mistriName}
        mistriCategory={booking.category}
        height="420px"
        isLiveTracking={isEnRoute}
      />

      {/* Worker Card and Safety Privacy Policy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Worker Details */}
        <Card className="p-4 skeuo-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={booking.mistriAvatar}
              alt={booking.mistriName}
              className="h-12 w-12 rounded-2xl object-cover border border-stone-300 shadow-sm"
            />
            <div>
              <h3 className="text-sm font-bold text-stone-900">{booking.mistriName}</h3>
              <p className="text-xs text-stone-500">{booking.mistriTitle}</p>
              <span className="text-[11px] font-mono font-bold text-stone-800">{booking.mistriPhone}</span>
            </div>
          </div>
          <Badge variant="neutral" className={`text-[10px] skeuo-pill font-bold ${isEnRoute ? 'bg-stone-900 text-white' : 'bg-amber-100 text-amber-900'}`}>
            {isEnRoute ? (isBn ? 'অন-রুট' : 'En Route') : (isBn ? 'অপেক্ষমাণ' : 'Pending')}
          </Badge>
        </Card>

        {/* Privacy Note */}
        <Card className="p-4 skeuo-surface space-y-1 text-stone-700 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-stone-900">
            <ShieldCheck className="h-4 w-4 text-stone-900" />
            <span>{isBn ? 'গোপনীয়তা ও নিরাপত্তা নীতি' : 'Privacy & Consent Protection'}</span>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            {isBn 
              ? 'এই লাইভ জিপিএস সেশনটি উভয় পক্ষের সম্মতিতে শুধুমাত্র কাজ শুরুর পূর্ব পর্যন্ত সক্রিয় থাকবে। কাজ সম্পন্ন বা বাতিল হলে সেশনটি স্বয়ংক্রিয়ভাবে বন্ধ ও মুছে যাবে।'
              : 'Live tracking is consent-based and strictly active while traveling. It terminates automatically upon job completion.'}
          </p>
        </Card>
      </div>

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl skeuo-surface p-6 shadow-2xl space-y-4 border border-stone-300">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-100 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">বুকিং বাতিলকরণ নিশ্চিত করুন</h3>
                  <p className="text-[11px] text-stone-500">বুকিং আইডি: {booking.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-stone-700 font-medium">
                আপনি কি নিশ্চিত যে এই কারিগরের সাথে বুকিং অনুরোধটি বাতিল করতে চান?
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 block">বাতিলের প্রধান কারণ:</label>
                <div className="space-y-1.5">
                  {CANCELLATION_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        cancelReason === reason
                          ? 'border-stone-900 bg-stone-100 font-bold text-stone-900'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReasonTrack"
                        checked={cancelReason === reason}
                        onChange={() => setCancelReason(reason)}
                        className="accent-stone-900"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 block">অতিরিক্ত মন্তব্য (ঐচ্ছিক):</label>
                <textarea
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="অন্য কোনো কারণ থাকলে লিখুন..."
                  rows={2}
                  className="w-full skeuo-input-well p-2.5 text-xs text-stone-900 focus:outline-none rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCancelModalOpen(false)}
                className="skeuo-btn-light text-xs font-bold"
              >
                না, ফিরে যান
              </Button>

              <Button
                type="button"
                size="sm"
                isLoading={isCancelling}
                onClick={handleConfirmCancel}
                className="skeuo-btn-dark bg-red-700 hover:bg-red-800 text-xs font-bold text-white"
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                <span>হ্যাঁ, বুকিং বাতিল করুন</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CustomerLiveTrackPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">ট্র্যাকিং লোড হচ্ছে...</div>}>
      <CustomerLiveTrackContent />
    </Suspense>
  )
}


