'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, MapPin, Phone, User, CheckCircle2, 
  Navigation, DollarSign, Clock, ShieldCheck, 
  ExternalLink, AlertTriangle, Radio 
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
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [jobStatus, setJobStatus] = useState<'accepted' | 'in_progress' | 'completed'>('accepted')
  const [isLocationSharing, setIsLocationSharing] = useState(false)
  const [lastPingTime, setLastPingTime] = useState<string | null>(null)
  const [finalAgreedPrice, setFinalAgreedPrice] = useState(450)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  // Booking counterpart details
  const job = {
    id: params.id || 'MST-261103-AB12',
    customerName: 'আহমেদ জুবায়ের',
    customerPhone: '01812345678',
    customerAddress: 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
    jobCoordinates: { latitude: 26.0336, longitude: 88.4617 },
    mistriBaseCoords: { latitude: 26.0425, longitude: 88.4550 },
    serviceName: 'বাসা-বাড়ির সিলিং ফ্যান ও সুইচ মেরামত',
    description: 'মাস্টার বেডরুমের সিলিং ফ্যান খুব আস্তে ঘুরছে এবং সুইচ বোর্ডে স্পার্ক করছে। অনুগ্রহ করে দ্রুত আসবেন।',
    preferredDate: '২০২৬-১১-০৩',
    preferredTime: 'সকাল ১১:০০',
    estimatedBudget: 400,
  }

  // Toggle live location sharing
  const toggleLocationSharing = async () => {
    const nextState = !isLocationSharing
    setIsLocationSharing(nextState)

    if (nextState) {
      setLastPingTime(new Date().toLocaleTimeString())
      // Trigger API ping
      try {
        await fetch('/api/tracking/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: job.id,
            latitude: job.mistriBaseCoords.latitude,
            longitude: job.mistriBaseCoords.longitude,
            speed: 18.5,
          }),
        })
      } catch {}
    } else {
      setLastPingTime(null)
    }
  }

  const handleStartJob = () => {
    setJobStatus('in_progress')
    // Automatically turn off traveling live location when physically arrived and starting work
    setIsLocationSharing(false)
  }

  const handleConfirmCompletion = () => {
    setIsCompleting(true)
    setTimeout(() => {
      setIsCompleting(false)
      setJobStatus('completed')
      setShowCompletionModal(false)
    }, 800)
  }

  const googleMapsUrl = generateGoogleMapsDirectionUrl(job.mistriBaseCoords, job.jobCoordinates)

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isBn ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isBn ? 'কাজের বিস্তারিত ও লাইভ একশন' : 'Job Execution & Location Desk'}
            </h1>
            <Badge 
              variant={jobStatus === 'completed' ? 'success' : jobStatus === 'in_progress' ? 'warning' : 'primary'}
              className="text-xs px-2.5 py-0.5"
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
          <span className="text-xs text-slate-400 font-mono">আইডি: {job.id}</span>
        </div>
      </div>

      {/* GPS Live Sharing Switcher Banner */}
      {jobStatus !== 'completed' && (
        <Card className={`p-5 transition-all ${
          isLocationSharing 
            ? 'bg-blue-600 text-white shadow-lg border-blue-500' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Radio className={`h-5 w-5 ${isLocationSharing ? 'text-amber-300 animate-pulse' : 'text-slate-400'}`} />
                <h3 className={`text-base font-bold ${isLocationSharing ? 'text-white' : 'text-slate-900'}`}>
                  {isBn ? 'কাস্টমারের সাথে লাইভ লোকেশন শেয়ারিং' : 'Live Location Sharing with Customer'}
                </h3>
              </div>
              <p className={`text-xs ${isLocationSharing ? 'text-blue-100' : 'text-slate-500'}`}>
                {isBn 
                  ? 'কাস্টমারের ঠিকানার উদ্দেশ্যে রওনা হলে এটি অন করুন। কাস্টমার ম্যাপে আপনার আগমন দেখতে পারবেন।' 
                  : 'Turn on when traveling to customer location. Customer can track your arrival in real-time.'}
              </p>
              {lastPingTime && (
                <span className="inline-block text-[10px] text-blue-200">
                  সর্বশেষ জিপিএস পিং: {lastPingTime}
                </span>
              )}
            </div>

            <Button
              onClick={toggleLocationSharing}
              className={`font-bold text-xs px-5 py-2.5 shadow-xs ${
                isLocationSharing 
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Navigation className="h-4 w-4 mr-1.5" />
              <span>{isLocationSharing ? (isBn ? 'শেয়ারিং বন্ধ করুন' : 'Stop Sharing') : (isBn ? 'আমি রওনা হয়েছি (Share Live GPS)' : 'I am on the way')}</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Customer & Location Details Card */}
      <Card className="p-6 space-y-4 border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <User className="h-4 w-4 text-blue-600" />
            <span>{isBn ? 'কাস্টমার ও কাজের সঠিক ঠিকানা' : 'Customer & Job Site'}</span>
          </div>
          <Badge variant="success" className="text-[10px]">
            {isBn ? 'বুকিং গ্রহণ সাপেক্ষে দৃশ্যমান' : 'Contact Unveiled'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block">{isBn ? 'গ্রাহকের নাম' : 'Customer Name'}</span>
              <span className="text-sm font-bold text-slate-900">{job.customerName}</span>
            </div>

            <div>
              <span className="text-slate-400 block">{isBn ? 'মোবাইল নম্বর' : 'Phone'}</span>
              <a href={`tel:${job.customerPhone}`} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                <span>{job.customerPhone}</span>
              </a>
            </div>

            <div>
              <span className="text-slate-400 block">{isBn ? 'কাঙ্ক্ষিত সময়' : 'Preferred Slot'}</span>
              <span className="font-semibold text-slate-800">{job.preferredDate}, {job.preferredTime}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-slate-400 block">{isBn ? 'কাজের ঠিকানা' : 'Job Address'}</span>
              <p className="font-bold text-slate-900 leading-snug">{job.customerAddress}</p>
            </div>

            {/* Direct Google Maps Turn-by-Turn Link */}
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-full">
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-blue-200 text-blue-700 hover:bg-blue-50">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                <span>{isBn ? 'গুগল ম্যাপে দিকনির্দেশনা (Directions)' : 'Open in Google Maps'}</span>
              </Button>
            </a>
          </div>
        </div>

        {/* Work Description Box */}
        <div className="pt-3 border-t border-slate-100 space-y-1">
          <span className="text-slate-500 font-semibold text-xs block">{isBn ? 'সমস্যার বিবরণ:' : 'Problem Description:'}</span>
          <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {job.description}
          </p>
        </div>
      </Card>

      {/* Execution Actions (Start Work / Mark Completed) */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          {isBn ? 'কাজের অগ্রগতি নিয়ন্ত্রণ' : 'Job State Controls'}
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {jobStatus === 'accepted' && (
            <Button
              onClick={handleStartJob}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-3 px-6"
            >
              <Clock className="h-4 w-4 mr-1.5" />
              <span>{isBn ? 'আমি পৌঁছেছি, কাজ শুরু করুন' : 'I Have Arrived - Start Work'}</span>
            </Button>
          )}

          {jobStatus === 'in_progress' && (
            <Button
              onClick={() => setShowCompletionModal(true)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              <span>{isBn ? 'কাজ সম্পন্ন হয়েছে (Mark Completed)' : 'Mark Job as Completed'}</span>
            </Button>
          )}

          {jobStatus === 'completed' && (
            <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>{isBn ? 'কাজটি সফলভাবে সম্পন্ন হয়েছে। চূড়ান্ত চার্জ সংরক্ষিত।' : 'Job marked as completed. Customer can now leave a review.'}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Completion & Agreed Price Handshake Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>{isBn ? 'কাজ সম্পন্ন নিশ্চিতকরণ' : 'Confirm Completion'}</span>
            </h3>

            <p className="text-xs text-slate-600">
              {isBn 
                ? 'কাস্টমারের সাথে আলোচনার ভিত্তিতে চূড়ান্ত সম্মত পারিশ্রমিক নির্ধারণ করুন:' 
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
              <Button variant="outline" size="sm" onClick={() => setShowCompletionModal(false)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button size="sm" isLoading={isCompleting} onClick={handleConfirmCompletion} className="bg-emerald-600 hover:bg-emerald-700 font-bold">
                {isBn ? 'সম্পন্ন নিশ্চিত করুন' : 'Confirm Completed'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
