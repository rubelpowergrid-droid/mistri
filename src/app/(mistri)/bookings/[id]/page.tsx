'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, MapPin, Phone, User, CheckCircle2, 
  Navigation, DollarSign, Clock, ShieldCheck, 
  ExternalLink, AlertTriangle, Radio, Loader2, Wrench
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Coordinates, 
  generateGoogleMapsDirectionUrl 
} from '@/lib/geo'
import { formatBDT, toBanglaNumber } from '@/lib/utils'

export default function MistriJobExecutionPage() {
  const params = useParams()
  const router = useRouter()
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const bookingId = (params?.id as string) || ''

  const [booking, setBooking] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [jobStatus, setJobStatus] = useState<'pending' | 'accepted' | 'in_progress' | 'completed'>('accepted')
  const [isLocationSharing, setIsLocationSharing] = useState(false)
  const [lastPingTime, setLastPingTime] = useState<string | null>(null)
  const [finalAgreedPrice, setFinalAgreedPrice] = useState<number>(400)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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

  // Toggle live location sharing
  const toggleLocationSharing = async () => {
    const nextState = !isLocationSharing
    setIsLocationSharing(nextState)

    if (nextState) {
      setLastPingTime(new Date().toLocaleTimeString('bn-BD'))
      try {
        await fetch('/api/tracking/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking?.id || bookingId,
            latitude: 26.0425,
            longitude: 88.4550,
            speed: 18.5,
          }),
        })
      } catch {}
    } else {
      setLastPingTime(null)
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
      setIsLocationSharing(false)
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
      setShowCompletionModal(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsCompleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#2c7865]" />
        <p className="text-xs font-semibold text-stone-600">
          {isBn ? 'কাজের তথ্য লোড হচ্ছে...' : 'Loading job details...'}
        </p>
      </div>
    )
  }

  if (errorMessage || !booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-bold text-stone-900">
          {errorMessage || (isBn ? 'বুকিং পাওয়া যায়নি' : 'Booking not found')}
        </h2>
        <Button onClick={() => router.push('/mistri/bookings')} className="skeuo-btn-dark text-xs">
          {isBn ? 'বুকিং তালিকায় ফিরে যান' : 'Back to Bookings'}
        </Button>
      </div>
    )
  }

  // Google Maps Direction URL
  const googleMapsUrl = booking.customerAddress || booking.jobAddress
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
                  ? 'কাস্টমারের ঠিকানার উদ্দেশ্যে রওনা হলে এটি অন করুন। কাস্টমার ম্যাপে আপনার অবস্থান দেখতে পারবেন।' 
                  : 'Turn on when traveling to customer location. Customer can track your arrival in real-time.'}
              </p>
              {lastPingTime && (
                <span className="inline-block text-[10px] text-amber-200 font-medium">
                  সর্বশেষ জিপিএস পিং: {lastPingTime}
                </span>
              )}
            </div>

            <Button
              onClick={toggleLocationSharing}
              className={`font-bold text-xs px-5 py-2.5 shadow-xs cursor-pointer ${
                isLocationSharing 
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950' 
                  : 'skeuo-btn-dark text-xs'
              }`}
            >
              <Navigation className="h-4 w-4 mr-1.5" />
              <span>{isLocationSharing ? (isBn ? 'শেয়ারিং বন্ধ করুন' : 'Stop Sharing') : (isBn ? 'আমি রওনা হয়েছি (Share Live GPS)' : 'I am on the way')}</span>
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

        {/* Work Photos if attached */}
        {Array.isArray(booking.workPhotos) && booking.workPhotos.length > 0 && (
          <div className="pt-2 border-t border-stone-200 space-y-2">
            <span className="text-stone-600 font-semibold text-xs block">{isBn ? 'কাস্টমারের সংযুক্ত কাজের ছবি:' : 'Customer Attached Photos:'}</span>
            <div className="flex flex-wrap gap-3">
              {booking.workPhotos.map((photo: string, idx: number) => (
                <a key={idx} href={photo} target="_blank" rel="noopener noreferrer">
                  <img src={photo} alt={`Work ${idx + 1}`} className="h-16 w-16 rounded-xl object-cover border border-stone-300 shadow-xs hover:scale-105 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Execution Actions (Start Work / Mark Completed) */}
      <Card className="p-6 space-y-4 skeuo-surface border-stone-300">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h3 className="text-sm font-bold text-stone-900">
            {isBn ? 'কাজের অগ্রগতি নিয়ন্ত্রণ' : 'Job State Controls'}
          </h3>
          <div className="text-right">
            <span className="text-[10px] text-stone-500 block font-semibold">{isBn ? 'মজুরি' : 'Amount'}</span>
            <span className="text-sm font-black text-[#2c7865]">
              {formatBDT(booking.agreedPrice || booking.estimatedBudget || booking.amount || 400, isBn)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {jobStatus === 'accepted' && (
            <Button
              onClick={handleStartJob}
              isLoading={isStarting}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-3 px-6 cursor-pointer shadow-md"
            >
              <Clock className="h-4 w-4 mr-1.5" />
              <span>{isBn ? 'আমি পৌঁছেছি, কাজ শুরু করুন' : 'I Have Arrived - Start Work'}</span>
            </Button>
          )}

          {jobStatus === 'in_progress' && (
            <Button
              onClick={() => setShowCompletionModal(true)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6 cursor-pointer shadow-md"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              <span>{isBn ? 'কাজ সম্পন্ন হয়েছে (Mark Completed)' : 'Mark Job as Completed'}</span>
            </Button>
          )}

          {jobStatus === 'completed' && (
            <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-300 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>{isBn ? 'কাজটি সফলভাবে সম্পন্ন হয়েছে। চূড়ান্ত চার্জ সংরক্ষিত।' : 'Job marked as completed. Customer can now leave a review.'}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Completion & Agreed Price Handshake Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6 space-y-4 skeuo-surface shadow-2xl border-stone-300">
            <h3 className="text-base font-bold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>{isBn ? 'কাজ সম্পন্ন নিশ্চিতকরণ' : 'Confirm Completion'}</span>
            </h3>

            <p className="text-xs text-stone-600 leading-relaxed">
              {isBn 
                ? 'কাস্টমারের সাথে আলোচনার ভিত্তিতে চূড়ান্ত সম্মত পারিশ্রমিক নিশ্চিত করুন:' 
                : 'Confirm the final agreed service charge with the customer:'}
            </p>

            <Input
              id="finalPrice"
              type="number"
              label={isBn ? 'চূড়ান্ত সম্মত পারিশ্রমিক (টাকা)' : 'Final Agreed Charge (BDT)'}
              value={finalAgreedPrice}
              onChange={(e) => setFinalAgreedPrice(Number(e.target.value))}
              leftIcon={<DollarSign className="h-4 w-4" />}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowCompletionModal(false)} className="cursor-pointer text-xs">
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button size="sm" isLoading={isCompleting} onClick={handleConfirmCompletion} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs">
                {isBn ? 'সম্পন্ন নিশ্চিত করুন' : 'Confirm Completed'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
