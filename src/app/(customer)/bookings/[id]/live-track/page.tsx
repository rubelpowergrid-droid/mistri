'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  Navigation, Phone, ShieldCheck, ArrowLeft, Clock, 
  MapPin, Wrench, ExternalLink, AlertCircle, Compass 
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

export default function CustomerLiveTrackPage() {
  const params = useParams()
  const router = useRouter()
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  // Booking counterpart details
  const [booking, setBooking] = useState({
    id: params.id || 'MST-261103-AB12',
    status: 'in_progress', // 'accepted' | 'in_progress'
    customerAddress: 'পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
    customerLocation: { latitude: 26.0336, longitude: 88.4617 },
    mistriName: 'মোঃ রফিকুল ইসলাম',
    mistriTitle: 'সিনিয়র ইলেকট্রিশিয়ান',
    mistriPhone: '01712345678',
    category: 'ইলেকট্রিক্যাল কাজ',
    mistriAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
  })

  // Simulated live moving coordinates of the Mistri
  const [mistriLocation, setMistriLocation] = useState<Coordinates>({
    latitude: 26.0425,
    longitude: 88.4550,
  })

  const [distanceMeters, setDistanceMeters] = useState(1200)
  const [etaMinutes, setEtaMinutes] = useState(5)
  const [isSessionActive, setIsSessionActive] = useState(true)

  // Realtime position animation simulator (approaching customer)
  useEffect(() => {
    if (!isSessionActive) return

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
  }, [isSessionActive, booking.customerLocation])

  const googleMapsUrl = generateGoogleMapsDirectionUrl(mistriLocation, booking.customerLocation)

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isBn ? 'বুকিংয়ে ফিরুন' : 'Back to Booking'}</span>
        </button>

        <Badge variant="success" className="gap-1 px-3 py-1 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{isBn ? 'লাইভ জিপিএস সক্রিয়' : 'Live Tracking Active'}</span>
        </Badge>
      </div>

      {/* ETA & Status Metric Card */}
      <Card className="p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-blue-200 font-semibold flex items-center gap-1">
              <Navigation className="h-3.5 w-3.5" />
              {isBn ? 'মিস্ত্রী আপনার ঠিকানার দিকে রওনা হয়েছেন' : 'Professional is Heading to Your Location'}
            </span>
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {toBanglaNumber(etaMinutes)} {isBn ? 'মিনিট' : 'mins'}
              </h1>
              <span className="text-sm font-semibold text-blue-100">
                ({formatDistance(distanceMeters / 1000, isBn)} দূরে)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a href={`tel:${booking.mistriPhone}`}>
              <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs shadow-xs">
                <Phone className="h-3.5 w-3.5 mr-1" />
                <span>{isBn ? 'কল করুন' : 'Call'}</span>
              </Button>
            </a>

            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold text-xs">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                <span>{isBn ? 'গুগল ম্যাপে দেখুন' : 'Google Maps'}</span>
              </Button>
            </a>
          </div>
        </div>
      </Card>

      {/* Interactive Live Map Component */}
      <InteractiveMap
        customerLocation={booking.customerLocation}
        customerAddress={booking.customerAddress}
        mistriLocation={mistriLocation}
        mistriName={booking.mistriName}
        mistriCategory={booking.category}
        height="420px"
        isLiveTracking={true}
      />

      {/* Worker Card and Safety Privacy Policy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Worker Details */}
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={booking.mistriAvatar}
              alt={booking.mistriName}
              className="h-12 w-12 rounded-2xl object-cover border border-slate-200"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900">{booking.mistriName}</h3>
              <p className="text-xs text-slate-500">{booking.mistriTitle}</p>
              <span className="text-[11px] font-semibold text-blue-600">{booking.mistriPhone}</span>
            </div>
          </div>
          <Badge variant="primary" className="text-[10px]">
            {isBn ? 'অন-রুট' : 'En Route'}
          </Badge>
        </Card>

        {/* Privacy Note */}
        <Card className="p-4 bg-slate-50 border-slate-200 space-y-1 text-slate-600 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>{isBn ? 'গোপনীয়তা ও নিরাপত্তা নীতি' : 'Privacy & Consent Protection'}</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {isBn 
              ? 'এই লাইভ জিপিএস সেশনটি উভয় পক্ষের সম্মতিতে শুধুমাত্র কাজ শুরুর পূর্ব পর্যন্ত সক্রিয় থাকবে। কাজ সম্পন্ন হলে সেশনটি স্বয়ংক্রিয়ভাবে বন্ধ ও মুছে যাবে।'
              : 'Live tracking is consent-based and strictly active while traveling. It terminates automatically upon job completion.'}
          </p>
        </Card>
      </div>
    </div>
  )
}

