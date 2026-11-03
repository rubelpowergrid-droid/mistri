'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Inbox, Check, X, Calendar, Clock, MapPin, 
  DollarSign, CheckCircle2, AlertTriangle, ArrowRight, Phone 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBDT, formatDistance, toBanglaNumber } from '@/lib/utils'

interface BookingRequest {
  id: string
  bookingNumber: string
  customerGeneralArea: string
  distanceKm: number
  serviceName: string
  description: string
  preferredDate: string
  preferredTime: string
  proposedBudget: number
  submittedAt: string
}

export default function MistriIncomingRequestsPage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [requests, setRequests] = useState<BookingRequest[]>([
    {
      id: 'req-01',
      bookingNumber: 'MST-261103-AB12',
      customerGeneralArea: 'পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
      distanceKm: 1.4,
      serviceName: 'সিলিং ফ্যান ও সুইচ মেরামত',
      description: 'মাস্টার বেডরুমের সিলিং ফ্যান খুব আস্তে ঘুরছে এবং সুইচ বোর্ডে স্পার্ক করছে। অনুগ্রহ করে দ্রুত আসবেন।',
      preferredDate: '২০২৬-১১-০৪',
      preferredTime: 'সকাল ১০:০০ - ১২:০০',
      proposedBudget: 400,
      submittedAt: '১০ মিনিট আগে',
    },
    {
      id: 'req-02',
      bookingNumber: 'MST-261103-GH34',
      customerGeneralArea: 'বাসস্ট্যান্ড রোড, ঠাকুরগাঁও',
      distanceKm: 2.8,
      serviceName: 'বাসা-বাড়ির মেইন ডিবি বোর্ড মেরামত',
      description: 'সার্কিট ব্রেকার বারবার ট্রিপ করছে, পুরো রান্নাঘরের লাইন বন্ধ হয়ে আছে।',
      preferredDate: '২০২৬-১১-০৪',
      preferredTime: 'বিকাল ২:০০ - ৪:০০',
      proposedBudget: 500,
      submittedAt: '২৫ মিনিট আগে',
    },
  ])

  const [selectedDeclineReqId, setSelectedDeclineReqId] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('ব্যস্ততা / সময়ের অমিল')
  const [successToast, setSuccessToast] = useState<string | null>(null)

  const handleAccept = (reqId: string) => {
    setRequests(prev => prev.filter(r => r.id !== reqId))
    setSuccessToast(isBn ? 'বুকিং অনুরোধটি গ্রহণ করা হয়েছে! কাস্টমারের পূর্ণ ঠিকানা উন্মুক্ত হয়েছে।' : 'Request accepted! Customer details revealed.')
    setTimeout(() => setSuccessToast(null), 4000)
  }

  const handleConfirmDecline = () => {
    if (!selectedDeclineReqId) return
    setRequests(prev => prev.filter(r => r.id !== selectedDeclineReqId))
    setSelectedDeclineReqId(null)
    setSuccessToast(isBn ? 'বুকিং অনুরোধটি প্রত্যাখ্যান করা হয়েছে।' : 'Request declined.')
    setTimeout(() => setSuccessToast(null), 3000)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Inbox className="h-6 w-6 text-blue-600" />
            <span>{isBn ? 'নতুন কাজের অনুরোধ ইনবক্স' : 'Incoming Booking Requests'}</span>
          </h1>
          <p className="text-xs text-slate-500">
            {isBn 
              ? 'কাস্টমারদের পাঠানো কাজের অনুরোধ পর্যালোচনা করে গ্রহণ বা প্রত্যাখ্যান করুন' 
              : 'Review customer booking requests and accept or decline with reason'}
          </p>
        </div>

        <Badge variant="warning" className="text-xs font-bold px-3 py-1">
          {toBanglaNumber(requests.length)} {isBn ? 'টি নতুন অনুরোধ' : 'New Requests'}
        </Badge>
      </div>

      {successToast && (
        <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((req) => (
          <Card key={req.id} className="p-5 hover:shadow-md transition-shadow border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900">{req.bookingNumber}</span>
                <Badge variant="primary" className="text-[10px]">
                  {req.serviceName}
                </Badge>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                ⏱️ {req.submittedAt}
              </span>
            </div>

            {/* Description and location */}
            <div className="space-y-2">
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                "{req.description}"
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-900">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  {req.customerGeneralArea}
                </span>
                <span>•</span>
                <span className="font-bold text-emerald-600">
                  {formatDistance(req.distanceKm, isBn)} দূরে
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {req.preferredDate}, {req.preferredTime}
                </span>
              </div>
            </div>

            {/* Bottom Actions & Price */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block">{isBn ? 'কাস্টমারের প্রস্তাবিত বাজেট' : 'Proposed Budget'}</span>
                <span className="text-base font-black text-slate-900">{formatBDT(req.proposedBudget, isBn)}</span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedDeclineReqId(req.id)}
                  className="text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  <span>{isBn ? 'প্রত্যাখ্যান' : 'Decline'}</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleAccept(req.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold px-5"
                >
                  <Check className="h-4 w-4 mr-1" />
                  <span>{isBn ? 'অনুরোধ গ্রহণ করুন (Accept)' : 'Accept Request'}</span>
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {requests.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {isBn ? 'বর্তমানে কোনো নতুন অনুরোধ নেই' : 'No New Requests'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isBn 
                ? 'আপনার এলাকার কোনো কাস্টমার বুকিং পাঠালে এখানে প্রদর্শিত হবে।' 
                : 'Customer booking requests will appear here in real-time.'}
            </p>
            <Link href="/mistri/bookings">
              <Button variant="outline" size="sm">
                {isBn ? 'চলমান বুকিং দেখুন' : 'View Ongoing Bookings'}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Decline Reason Modal */}
      {selectedDeclineReqId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              {isBn ? 'অনুরোধ প্রত্যাখ্যানের কারণ' : 'Reason for Declining'}
            </h3>
            <p className="text-xs text-slate-600">
              {isBn ? 'কাস্টমারকে অবহিত করার জন্য একটি কারণ নির্বাচন করুন:' : 'Select a reason for declining:'}
            </p>

            <select
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
            >
              <option value="ব্যস্ততা / সময়ের অমিল">{isBn ? 'অন্য কাজে ব্যস্ত / সময়ের অমিল' : 'Busy with another job'}</option>
              <option value="দূরত্ব বেশি">{isBn ? 'কাজের স্থান অনেক দূরে' : 'Location too far'}</option>
              <option value="বাজেট সামঞ্জস্যপূর্ণ নয়">{isBn ? 'প্রস্তাবিত বাজেট সামঞ্জস্যপূর্ণ নয়' : 'Budget mismatch'}</option>
              <option value="অসুস্থতা / অনুপলব্ধ">{isBn ? 'অনিবার্য কারণে আজ অনুপলব্ধ' : 'Unavailable today'}</option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedDeclineReqId(null)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button size="sm" variant="danger" onClick={handleConfirmDecline}>
                {isBn ? 'প্রত্যাখ্যান নিশ্চিত করুন' : 'Confirm Decline'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
