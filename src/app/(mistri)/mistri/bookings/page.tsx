'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calendar, Clock, MapPin, Navigation, Phone, 
  CheckCircle2, XCircle, ArrowRight, ShieldCheck, User, Inbox, ArrowLeft 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBDT, toBanglaNumber } from '@/lib/utils'
import { getStoredUser } from '@/lib/auth-client'

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
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled'
  agreedPrice: number
}

export default function MistriBookingsPage() {
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active')

  const [bookings, setBookings] = useState<MistriBookingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchMistriBookings = async () => {
    const user = getStoredUser()
    const cleanPhone = user?.phone ? user.phone.replace(/[^0-9]/g, '') : ''
    try {
      const url = cleanPhone 
        ? `/api/bookings?role=mistri&mistriPhone=${cleanPhone}`
        : `/api/bookings?role=mistri`
      const res = await fetch(url, { cache: 'no-store' })
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setBookings(json.data.map((item: any) => ({
          id: item.id,
          bookingNumber: item.bookingNumber || item.booking_number || 'MST-LIVE',
          customerName: item.customerName || 'সম্মানিত গ্রাহক',
          customerPhone: item.customerPhone || '017XXXXXXXX',
          jobAddress: item.jobAddress || item.location || '',
          serviceName: item.serviceName || item.subcategory || 'সাধারণ কাজ',
          description: item.description || item.workDescription || '',
          preferredDate: item.preferredDate || item.date || '',
          preferredTime: item.preferredTime || '',
          status: item.status || 'accepted',
          agreedPrice: item.agreedPrice || item.estimatedBudget || item.amount || 400,
        })))
      }
    } catch (err) {
      console.error('Error fetching mistri bookings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMistriBookings()
    const interval = setInterval(fetchMistriBookings, 5000)
    window.addEventListener('focus', fetchMistriBookings)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', fetchMistriBookings)
    }
  }, [])

  const filtered = bookings.filter((b) => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return b.status === 'accepted' || b.status === 'in_progress' || b.status === 'pending'
    return b.status === activeTab
  })

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/mistri/profile" className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 mb-2 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            <span>{isBn ? 'মিস্ত্রী প্রোফাইল ও ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-[#2c7865]" />
            <span>{isBn ? 'মিস্ত্রী কাজ ও বুকিং ইতিহাস' : 'My Jobs & Booking History'}</span>
          </h1>
          <p className="text-xs text-stone-600">
            {isBn 
              ? 'চলমান কাজের অগ্রগতি আপডেট করুন এবং অতীতের কাজের রেকর্ড দেখুন' 
              : 'Execute ongoing jobs, trigger live location sharing, and view job logs'}
          </p>
        </div>

        <Link href="/requests">
          <Button size="sm" className="skeuo-btn-dark text-xs font-bold px-3.5 py-2 cursor-pointer">
            <Inbox className="h-3.5 w-3.5 mr-1 text-[#fefded]" />
            <span>{isBn ? 'নতুন অনুরোধ দেখুন' : 'New Requests'}</span>
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 text-xs font-semibold gap-4">
        {[
          { key: 'active', label: isBn ? 'চলমান ও নির্ধারিত কাজ' : 'Active / Scheduled' },
          { key: 'completed', label: isBn ? 'সম্পন্ন কাজ' : 'Completed' },
          { key: 'all', label: isBn ? 'সকল কাজ' : 'All Jobs' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === tab.key 
                ? 'border-[#2c7865] text-[#2c7865] font-black' 
                : 'border-transparent text-stone-500 hover:text-stone-800 font-semibold'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filtered.map((job) => (
          <Card key={job.id} className="p-5 skeuo-surface border-stone-300 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200/70 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-stone-900">{job.bookingNumber}</span>
                <Badge variant="neutral" className="bg-[#2c7865]/10 text-[#2c7865] border border-[#2c7865]/30 text-[10px] font-bold">
                  {job.serviceName}
                </Badge>
              </div>

              <Badge 
                variant="neutral"
                className={`text-[11px] font-bold skeuo-pill px-2.5 py-0.5 ${
                  job.status === 'completed' ? 'bg-stone-200 text-stone-900' :
                  job.status === 'accepted' ? 'bg-[#2c7865] text-[#fefded]' :
                  job.status === 'pending' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  'bg-stone-100 text-stone-800'
                }`}
              >
                {job.status === 'completed' 
                  ? (isBn ? 'সম্পন্ন' : 'Completed') 
                  : job.status === 'pending'
                  ? (isBn ? 'অপেক্ষমান অনুরোধ' : 'Pending Request')
                  : (isBn ? 'অনুরোধ গৃহীত (Accepted)' : 'Accepted')}
              </Badge>
            </div>

            {/* Customer & Location */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <User className="h-3.5 w-3.5 text-[#2c7865]" />
                  <span>{job.customerName}</span>
                  <a href={`tel:${job.customerPhone}`} className="text-[#2c7865] font-normal hover:underline ml-2">
                    {job.customerPhone}
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <MapPin className="h-3.5 w-3.5 text-[#2c7865] shrink-0" />
                  <span>{job.jobAddress}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>{job.preferredDate}, {job.preferredTime}</span>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] text-stone-500 block font-semibold">{isBn ? 'সম্মত পারিশ্রমিক' : 'Agreed Fee'}</span>
                <span className="text-base font-black text-stone-900">{formatBDT(job.agreedPrice, isBn)}</span>
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <p className="text-xs text-stone-800 bg-[#fefded] p-2.5 rounded-xl border border-stone-200">
                "{job.description}"
              </p>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between">
              <span className="text-[11px] text-stone-500">
                {isBn ? 'লাইভ জিপিএস ও কাজের স্ট্যাটাস আপডেট করতে ক্লিক করুন' : 'Click to update state'}
              </span>

              <Link href={`/bookings/${job.id}`}>
                <Button size="sm" className="skeuo-btn-dark font-bold text-xs cursor-pointer">
                  <Navigation className="h-3.5 w-3.5 mr-1 text-amber-300" />
                  <span>{isBn ? 'টাইমলাইন, জিপিএস ও কাজের একশন' : 'Timeline & Actions'}</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && !isLoading && (
          <div className="p-12 text-center skeuo-surface rounded-3xl border border-stone-300 text-xs text-stone-500">
            {isBn ? 'এই ট্যাবে কোনো কাজের রেকর্ড নেই।' : 'No job records in this tab.'}
          </div>
        )}
      </div>
    </div>
  )
}
