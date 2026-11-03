'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  Calendar, Clock, MapPin, Navigation, Phone, 
  CheckCircle2, XCircle, AlertCircle, Star, 
  RotateCcw, ShieldCheck, ArrowRight, MessageSquare 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBDT, toBanglaNumber } from '@/lib/utils'
import { ReviewModal } from '@/components/reviews/review-modal'

interface BookingRecord {
  id: string
  bookingNumber: string
  mistriId: string
  mistriName: string
  mistriTitle: string
  mistriPhone: string
  mistriAvatar: string
  category: string
  workDescription: string
  jobAddress: string
  preferredDate: string
  preferredTime: string
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  agreedPrice: number | null
  estimatedBudget: number | null
  hasReviewed: boolean
}

function BookingsListContent() {
  const searchParams = useSearchParams()
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [activeTab, setActiveTab] = useState<string>('all')
  const [successBanner, setSuccessBanner] = useState(searchParams.get('success') === 'true')
  const [reviewBooking, setReviewBooking] = useState<BookingRecord | null>(null)

  const [bookings, setBookings] = useState<BookingRecord[]>([
    {
      id: 'b-1',
      bookingNumber: 'MST-261103-AB12',
      mistriId: 'm-1',
      mistriName: 'মোঃ রফিকুল ইসলাম',
      mistriTitle: 'সিনিয়র ইলেকট্রিশিয়ান',
      mistriPhone: '01712345678',
      mistriAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      category: 'ইলেকট্রিক্যাল কাজ',
      workDescription: 'মাস্টার বেডরুমের সিলিং ফ্যান খুব আস্তে ঘুরছে এবং সুইচ বোর্ডে স্পার্ক করছে।',
      jobAddress: 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
      preferredDate: '২০২৬-১১-০৩',
      preferredTime: 'সকাল ১১:০০',
      status: 'accepted',
      agreedPrice: 400,
      estimatedBudget: 400,
      hasReviewed: false,
    },
    {
      id: 'b-2',
      bookingNumber: 'MST-261028-XY89',
      mistriId: 'm-2',
      mistriName: 'আব্দুল করিম',
      mistriTitle: 'দক্ষ প্লাম্বিং টেকনিশিয়ান',
      mistriPhone: '01898765432',
      mistriAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      category: 'প্লাম্বিং সার্ভিস',
      workDescription: 'পানির মোটরের ক্যাপাসিটর নষ্ট ও পাইপলাইন লিকেজ মেরামত।',
      jobAddress: 'সদর হাসপাতাল রোড, ঠাকুরগাঁও',
      preferredDate: '২০২৬-১০-২৮',
      preferredTime: 'বিকাল ৪:০০',
      status: 'completed',
      agreedPrice: 500,
      estimatedBudget: 500,
      hasReviewed: false,
    },
    {
      id: 'b-3',
      bookingNumber: 'MST-261104-CD45',
      mistriId: 'm-3',
      mistriName: 'তরিকুল হাসান',
      mistriTitle: 'রাজমিস্ত্রী ও টাইলস স্পেশালিস্ট',
      mistriPhone: '01911223344',
      mistriAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      category: 'রাজমিস্ত্রীর কাজ',
      workDescription: 'বাথরুমের ফ্লোর টাইলস পরিবর্তনের কাজ।',
      jobAddress: 'বোদা বাজার, পঞ্চগড়',
      preferredDate: '২০২৬-১১-০৫',
      preferredTime: 'সকাল ৯:০০',
      status: 'pending',
      agreedPrice: null,
      estimatedBudget: 800,
      hasReviewed: false,
    },
  ])

  const handleCancelBooking = (bookingId: string) => {
    if (confirm(isBn ? 'আপনি কি নিশ্চিত যে বুকিং অনুরোধ বাতিল করতে চান?' : 'Are you sure you want to cancel this booking request?')) {
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
      )
    }
  }

  const handleReviewSuccess = () => {
    if (reviewBooking) {
      setBookings(prev =>
        prev.map(b => b.id === reviewBooking.id ? { ...b, hasReviewed: true } : b)
      )
    }
  }

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return b.status === 'accepted' || b.status === 'in_progress'
    return b.status === activeTab
  })

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Success banner if redirected from form */}
      {successBanner && (
        <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{isBn ? 'আপনার বুকিং অনুরোধটি সফলভাবে পাঠানো হয়েছে! মিস্ত্রী গ্রহণ করলে নোটিফিকেশন পাবেন।' : 'Booking request sent successfully!'}</span>
          </div>
          <button onClick={() => setSuccessBanner(false)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span>{isBn ? 'আমার বুকিং ইতিহাস (My Bookings)' : 'My Bookings History'}</span>
          </h1>
          <p className="text-xs text-slate-500">
            {isBn 
              ? 'সকল চলমান, নির্ধারিত এবং পূর্ববর্তী সম্পন্ন বুকিং ট্র্যাক করুন' 
              : 'Track active, scheduled and previous completed service requests'}
          </p>
        </div>
        <Link href="/search">
          <Button size="sm" className="font-bold text-xs">
            {isBn ? 'নতুন মিস্ত্রী বুক করুন' : 'Book a Mistri'}
          </Button>
        </Link>
      </div>

      {/* Categorized Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto text-xs font-semibold scrollbar-none gap-2 sm:gap-4">
        {[
          { key: 'all', label: isBn ? 'সকল' : 'All' },
          { key: 'active', label: isBn ? 'চলমান ও নির্ধারিত' : 'Active / Scheduled' },
          { key: 'pending', label: isBn ? 'অপেক্ষমান' : 'Pending' },
          { key: 'completed', label: isBn ? 'সম্পন্ন' : 'Completed' },
          { key: 'cancelled', label: isBn ? 'বাতিল' : 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-2 whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List Cards */}
      <div className="space-y-4">
        {filteredBookings.map((b) => {
          const isEnRouteOrActive = b.status === 'accepted' || b.status === 'in_progress'
          return (
            <Card key={b.id} className="p-5 hover:shadow-md transition-shadow space-y-4 border-slate-200">
              {/* Header: Booking No & Status Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">{b.bookingNumber}</span>
                  <Badge variant="primary" className="text-[10px]">
                    {b.category}
                  </Badge>
                </div>

                <Badge 
                  variant={
                    b.status === 'completed' ? 'success' :
                    b.status === 'accepted' ? 'primary' :
                    b.status === 'in_progress' ? 'warning' :
                    b.status === 'cancelled' ? 'danger' : 'neutral'
                  }
                  className="text-[11px] font-bold"
                >
                  {isBn ? t(`booking.status.${b.status}`) : b.status}
                </Badge>
              </div>

              {/* Main Content: Worker info & Job Description */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <img
                    src={b.mistriAvatar}
                    alt={b.mistriName}
                    className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">{b.mistriName}</h3>
                    <p className="text-xs text-slate-500">{b.mistriTitle}</p>
                    <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      "{b.workDescription}"
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">{isBn ? 'মজুরি / বাজেট' : 'Charge / Budget'}</span>
                  <span className="text-base font-black text-slate-900">
                    {formatBDT(b.agreedPrice || b.estimatedBudget, isBn)}
                  </span>
                </div>
              </div>

              {/* Timing & Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>{b.preferredDate}, {b.preferredTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{b.jobAddress}</span>
                </div>
              </div>

              {/* Action Buttons based on status */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div>
                  {b.status === 'accepted' && (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{isBn ? 'মিস্ত্রী অনুরোধ গ্রহণ করেছেন' : 'Request Accepted by Mistri'}</span>
                    </span>
                  )}
                  {b.status === 'pending' && (
                    <span className="text-[11px] text-slate-400">
                      {isBn ? 'মিস্ত্রীর অনুমোদনের অপেক্ষায় রয়েছে' : 'Awaiting worker confirmation'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Cancel Button if pending */}
                  {b.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {isBn ? 'অনুরোধ বাতিল করুন' : 'Cancel Request'}
                    </Button>
                  )}

                  {/* Call & Live Track buttons if accepted or in_progress */}
                  {isEnRouteOrActive && (
                    <>
                      <a href={`tel:${b.mistriPhone}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Phone className="h-3.5 w-3.5 mr-1" />
                          <span>{isBn ? 'কল করুন' : 'Call'}</span>
                        </Button>
                      </a>

                      <Link href={`/bookings/${b.id}/live-track`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs font-bold shadow-xs">
                          <Navigation className="h-3.5 w-3.5 mr-1 text-amber-300 animate-pulse" />
                          <span>{isBn ? 'লাইভ জিপিএস ট্র্যাকিং' : 'Track Live GPS'}</span>
                        </Button>
                      </Link>
                    </>
                  )}

                  {/* Review & Rebook if completed */}
                  {b.status === 'completed' && (
                    <>
                      <Link href={`/bookings/new/${b.mistriId}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          <RotateCcw className="h-3.5 w-3.5 mr-1" />
                          <span>{isBn ? 'পুনরায় বুক করুন' : 'Book Again'}</span>
                        </Button>
                      </Link>

                      {!b.hasReviewed ? (
                        <Button
                          size="sm"
                          onClick={() => setReviewBooking(b)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                        >
                          <Star className="h-3.5 w-3.5 mr-1 fill-slate-950" />
                          <span>{isBn ? 'রেটিং ও রিভিউ দিন' : 'Rate & Review'}</span>
                        </Button>
                      ) : (
                        <Badge variant="success" className="text-xs">
                          {isBn ? 'রিভিউ সম্পন্ন হয়েছে' : 'Reviewed'}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          )
        })}

        {filteredBookings.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {isBn ? 'এই ট্যাবে কোনো বুকিং নেই' : 'No Bookings Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isBn 
                ? 'আপনার প্রয়োজনীয় কাজের জন্য স্থানীয় দক্ষ কারিগরদের সাথে সহজেই যোগাযোগ করুন।' 
                : 'Discover and book local professionals in your area.'}
            </p>
            <Link href="/search">
              <Button size="sm">{isBn ? 'মিস্ত্রী খুঁজুন' : 'Explore Professionals'}</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Review Modal Dialog */}
      {reviewBooking && (
        <ReviewModal
          isOpen={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          bookingId={reviewBooking.id}
          mistriId={reviewBooking.mistriId}
          mistriName={reviewBooking.mistriName}
          category={reviewBooking.category}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  )
}

export default function CustomerBookingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">বুকিং লোড হচ্ছে...</div>}>
      <BookingsListContent />
    </Suspense>
  )
}
