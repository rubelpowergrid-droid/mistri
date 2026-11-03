'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Calendar, Clock, MapPin, Navigation, Phone, 
  CheckCircle2, XCircle, ArrowRight, ShieldCheck, User 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBDT, toBanglaNumber } from '@/lib/utils'

interface MistriBookingItem {
  id: string
  bookingNumber: string
  customerName: string
  customerPhone: string
  jobAddress: string
  serviceName: string
  description: string
  preferredDate: string
  preferredTime: string
  status: 'accepted' | 'in_progress' | 'completed' | 'rejected'
  agreedPrice: number
}

export default function MistriBookingsPage() {
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active')

  const [bookings] = useState<MistriBookingItem[]>([
    {
      id: 'b-1',
      bookingNumber: 'MST-261103-AB12',
      customerName: 'আহমেদ জুবায়ের',
      customerPhone: '01812345678',
      jobAddress: 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
      serviceName: 'সিলিং ফ্যান ও সুইচ মেরামত',
      description: 'মাস্টার বেডরুমের সিলিং ফ্যান খুব আস্তে ঘুরছে এবং সুইচ বোর্ডে স্পার্ক করছে।',
      preferredDate: '২০২৬-১১-০৩',
      preferredTime: 'সকাল ১১:০০',
      status: 'accepted',
      agreedPrice: 400,
    },
    {
      id: 'b-2',
      bookingNumber: 'MST-261028-XY89',
      customerName: 'কামরুল হাসান',
      customerPhone: '01799887766',
      jobAddress: 'সদর হাসপাতাল রোড, ঠাকুরগাঁও',
      serviceName: 'বাসা-বাড়ির সম্পূর্ণ ওয়্যারিং চেকআপ',
      description: 'পুরাতন ওয়্যারিং লাইনের শর্ট সার্কিট চেক এবং নতুন সার্কিট ব্রেকার ইনস্টলেশন।',
      preferredDate: '২০২৬-১০-২৮',
      preferredTime: 'বিকাল ৪:০০',
      status: 'completed',
      agreedPrice: 1200,
    },
  ])

  const filtered = bookings.filter((b) => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return b.status === 'accepted' || b.status === 'in_progress'
    return b.status === activeTab
  })

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span>{isBn ? 'মিস্ত্রী কাজ ও বুকিং ইতিহাস' : 'My Jobs & Booking History'}</span>
          </h1>
          <p className="text-xs text-slate-500">
            {isBn 
              ? 'চলমান কাজের অগ্রগতি আপডেট করুন এবং অতীতের কাজের রেকর্ড দেখুন' 
              : 'Execute ongoing jobs, trigger live location sharing, and view job logs'}
          </p>
        </div>

        <Link href="/requests">
          <Button size="sm" variant="outline" className="text-xs font-semibold">
            <span>{isBn ? 'নতুন অনুরোধ দেখুন' : 'New Requests'}</span>
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-4">
        {[
          { key: 'active', label: isBn ? 'চলমান ও নির্ধারিত কাজ' : 'Active / Scheduled' },
          { key: 'completed', label: isBn ? 'সম্পন্ন কাজ' : 'Completed' },
          { key: 'all', label: isBn ? 'সকল কাজ' : 'All Jobs' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === tab.key 
                ? 'border-blue-600 text-blue-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filtered.map((job) => (
          <Card key={job.id} className="p-5 hover:shadow-md transition-shadow border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900">{job.bookingNumber}</span>
                <Badge variant="primary" className="text-[10px]">
                  {job.serviceName}
                </Badge>
              </div>

              <Badge 
                variant={job.status === 'completed' ? 'success' : 'primary'}
                className="text-[11px] font-bold"
              >
                {job.status === 'completed' ? (isBn ? 'সম্পন্ন' : 'Completed') : (isBn ? 'অনুরোধ গৃহীত (Accepted)' : 'Accepted')}
              </Badge>
            </div>

            {/* Customer & Location */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  <span>{job.customerName}</span>
                  <a href={`tel:${job.customerPhone}`} className="text-blue-600 font-normal hover:underline ml-2">
                    {job.customerPhone}
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>{job.jobAddress}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{job.preferredDate}, {job.preferredTime}</span>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] text-slate-400 block">{isBn ? 'সম্মত পারিশ্রমিক' : 'Agreed Fee'}</span>
                <span className="text-base font-black text-slate-900">{formatBDT(job.agreedPrice, isBn)}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              "{job.description}"
            </p>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {isBn ? 'লাইভ জিপিএস ও কাজের স্ট্যাটাস আপডেট করতে ক্লিক করুন' : 'Click to update state'}
              </span>

              <Link href={`/bookings/${job.id}`}>
                <Button size="sm" className="font-bold text-xs bg-blue-600 hover:bg-blue-700">
                  <Navigation className="h-3.5 w-3.5 mr-1 text-amber-300" />
                  <span>{isBn ? 'কাজ শুরু ও লাইভ জিপিএস ডেস্ক' : 'Execute Job & GPS'}</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
            {isBn ? 'এই বিভাগে কোনো কাজের রেকর্ড নেই।' : 'No job records in this tab.'}
          </div>
        )}
      </div>
    </div>
  )
}
