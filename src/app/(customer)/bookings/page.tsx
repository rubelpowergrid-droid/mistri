'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  Calendar, Clock, MapPin, Navigation, Phone, 
  CheckCircle2, XCircle, AlertCircle, Star, 
  RotateCcw, ShieldCheck, ArrowRight, MessageSquare, X, AlertTriangle
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

const CANCELLATION_REASONS = [
  'ভুলবশত বুক করেছি',
  'মিস্ত্রী সাড়া বা কনফার্মেশন দিতে দেরি করছে',
  'অন্য মিস্ত্রী পেয়ে গেছি',
  'সমস্যাটি নিজে নিজেই সমাধান হয়ে গেছে',
  'জরুরি কারণে পরিকল্পনা পরিবর্তন হয়েছে',
  'অন্যান্য কারণ',
]

function BookingsListContent() {
  const searchParams = useSearchParams()
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [activeTab, setActiveTab] = useState<string>('all')
  const [successBanner, setSuccessBanner] = useState(searchParams.get('success') === 'true')
  const [reviewBooking, setReviewBooking] = useState<BookingRecord | null>(null)

  // Cancellation Modal State
  const [cancellingBooking, setCancellingBooking] = useState<BookingRecord | null>(null)
  const [cancelReason, setCancelReason] = useState<string>(CANCELLATION_REASONS[0])
  const [cancelNotes, setCancelNotes] = useState<string>('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelFeedback, setCancelFeedback] = useState<string>('')

  const [bookings, setBookings] = useState<BookingRecord[]>([
    {
      id: 'b-1',
      bookingNumber: 'MST-261108-PK99',
      mistriId: 'm-1',
      mistriName: 'মোঃ রফিকুল ইসলাম',
      mistriTitle: 'সিনিয়র ইলেকট্রিশিয়ান',
      mistriPhone: '01712345678',
      mistriAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      category: 'ইলেকট্রিক্যাল কাজ',
      workDescription: 'মাস্টার বেডরুমের সিলিং ফ্যান খুব আস্তে ঘুরছে এবং সুইচ বোর্ডে স্পার্ক করছে।',
      jobAddress: 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
      preferredDate: '২০২৬-১১-০৮',
      preferredTime: 'সকাল ১১:০০',
      status: 'pending', // Realistic starting state (Awaiting confirmation)
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

  // Load any stored bookings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('mistri_customer_bookings')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBookings(parsed)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const saveBookingsToStorage = (updated: BookingRecord[]) => {
    setBookings(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mistri_customer_bookings', JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
    }
  }

  const handleOpenCancelModal = (booking: BookingRecord) => {
    setCancellingBooking(booking)
    setCancelReason(CANCELLATION_REASONS[0])
    setCancelNotes('')
  }

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return

    setIsCancelling(true)
    try {
      await fetch(`/api/bookings/${cancellingBooking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          reason: cancelReason + (cancelNotes ? `: ${cancelNotes}` : ''),
        }),
      })
    } catch {
      // Continue locally
    }

    const updated = bookings.map(b =>
      b.id === cancellingBooking.id ? { ...b, status: 'cancelled' as const } : b
    )
    saveBookingsToStorage(updated)
    setIsCancelling(false)
    setCancellingBooking(null)
    setCancelFeedback(isBn ? '✓ বুকিং অনুরোধটি সফলভাবে বাতিল করা হয়েছে।' : 'Booking request cancelled successfully.')
    setTimeout(() => setCancelFeedback(''), 4500)
  }

  const handleReviewSuccess = () => {
    if (reviewBooking) {
      const updated = bookings.map(b =>
        b.id === reviewBooking.id ? { ...b, hasReviewed: true } : b
      )
      saveBookingsToStorage(updated)
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
        <div className="rounded-2xl bg-stone-900 text-white p-4 border border-stone-700 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{isBn ? 'আপনার বুকিং অনুরোধটি সফলভাবে পাঠানো হয়েছে! মিস্ত্রী গ্রহণ করার অপেক্ষায় রয়েছে।' : 'Booking request sent successfully! Awaiting mistri confirmation.'}</span>
          </div>
          <button onClick={() => setSuccessBanner(false)} className="text-stone-300 hover:text-white font-bold p-1 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Cancellation Feedback Banner */}
      {cancelFeedback && (
        <div className="rounded-2xl bg-stone-900 text-white p-4 border border-red-500/50 text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{cancelFeedback}</span>
          </div>
          <button onClick={() => setCancelFeedback('')} className="text-stone-300 hover:text-white font-bold p-1 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-stone-900" />
            <span>{isBn ? 'আমার বুকিং ইতিহাস (My Bookings)' : 'My Bookings History'}</span>
          </h1>
          <p className="text-xs text-stone-500">
            {isBn 
              ? 'সকল চলমান, নির্ধারিত এবং পূর্ববর্তী সম্পন্ন বুকিং ট্র্যাক ও পরিচালনা করুন' 
              : 'Track active, scheduled and previous completed service requests'}
          </p>
        </div>
        <Link href="/search">
          <Button size="sm" className="skeuo-btn-dark font-bold text-xs">
            {isBn ? 'নতুন মিস্ত্রী বুক করুন' : 'Book a Mistri'}
          </Button>
        </Link>
      </div>

      {/* Categorized Tabs (Skeuomorphic) */}
      <div className="flex border-b border-stone-300 overflow-x-auto text-xs font-semibold scrollbar-none gap-2 sm:gap-3 pb-1">
        {[
          { key: 'all', label: isBn ? 'সকল বুকিং' : 'All' },
          { key: 'active', label: isBn ? 'চলমান ও নির্ধারিত' : 'Active / Scheduled' },
          { key: 'pending', label: isBn ? 'অপেক্ষমান (Pending)' : 'Pending' },
          { key: 'completed', label: isBn ? 'সম্পন্ন (Completed)' : 'Completed' },
          { key: 'cancelled', label: isBn ? 'বাতিলকৃত (Cancelled)' : 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-2 px-3 rounded-xl whitespace-nowrap transition-all text-xs font-bold cursor-pointer ${
              activeTab === tab.key
                ? 'skeuo-btn-dark'
                : 'skeuo-btn-light'
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
          const canCancel = b.status === 'pending' || b.status === 'accepted'

          return (
            <Card key={b.id} className="p-5 skeuo-surface space-y-4">
              {/* Header: Booking No & Status Badge */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-900">{b.bookingNumber}</span>
                  <Badge variant="neutral" className="skeuo-pill text-[10px] bg-stone-100 text-stone-900 font-bold">
                    {b.category}
                  </Badge>
                </div>

                <Badge 
                  variant={
                    b.status === 'completed' ? 'neutral' :
                    b.status === 'accepted' ? 'neutral' :
                    b.status === 'in_progress' ? 'neutral' :
                    b.status === 'cancelled' ? 'danger' : 'neutral'
                  }
                  className={`text-[11px] font-bold skeuo-pill px-2.5 py-0.5 ${
                    b.status === 'pending' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                    b.status === 'accepted' ? 'bg-stone-900 text-white' :
                    b.status === 'completed' ? 'bg-stone-200 text-stone-900' :
                    b.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-300' : ''
                  }`}
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
                    className="h-14 w-14 rounded-2xl object-cover border border-stone-300 shrink-0 shadow-sm"
                  />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-stone-900">{b.mistriName}</h3>
                    <p className="text-xs text-stone-500">{b.mistriTitle}</p>
                    <p className="text-xs text-stone-800 skeuo-input-well p-2.5 rounded-xl font-medium">
                      "{b.workDescription}"
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] text-stone-500 block font-semibold">{isBn ? 'মজুরি / বাজেট' : 'Charge / Budget'}</span>
                  <span className="text-base font-black text-stone-900">
                    {formatBDT(b.agreedPrice || b.estimatedBudget, isBn)}
                  </span>
                </div>
              </div>

              {/* Timing & Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 bg-stone-100/70 p-3 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-stone-900 shrink-0" />
                  <span>{b.preferredDate}, {b.preferredTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-stone-900 shrink-0" />
                  <span className="truncate">{b.jobAddress}</span>
                </div>
              </div>

              {/* Action Buttons based on status */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200">
                <div>
                  {b.status === 'accepted' && (
                    <span className="text-[11px] font-semibold text-stone-900 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{isBn ? 'মিস্ত্রী অনুরোধ গ্রহণ করেছেন ও প্রস্তত' : 'Request Accepted by Mistri'}</span>
                    </span>
                  )}
                  {b.status === 'pending' && (
                    <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      <span>{isBn ? 'মিস্ত্রীর অনুমোদনের অপেক্ষায় রয়েছে' : 'Awaiting worker confirmation'}</span>
                    </span>
                  )}
                  {b.status === 'cancelled' && (
                    <span className="text-[11px] font-bold text-red-700 flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200">
                      <XCircle className="h-3.5 w-3.5 text-red-600" />
                      <span>{isBn ? 'এই বুকিং বাতিল করা হয়েছে' : 'Booking cancelled'}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Cancel Button if pending or accepted */}
                  {canCancel && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenCancelModal(b)}
                      className="skeuo-btn-light text-xs text-red-600 border-red-300 hover:bg-red-50 font-bold"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      <span>{isBn ? 'বুকিং বাতিল করুন' : 'Cancel Booking'}</span>
                    </Button>
                  )}

                  {/* Call & Live Track buttons if accepted or in_progress */}
                  {isEnRouteOrActive && (
                    <>
                      <a href={`tel:${b.mistriPhone}`}>
                        <Button size="sm" variant="outline" className="skeuo-btn-light text-xs font-bold">
                          <Phone className="h-3.5 w-3.5 mr-1 text-stone-800" />
                          <span>{isBn ? 'কল করুন' : 'Call'}</span>
                        </Button>
                      </a>

                      <Link href={`/bookings/${b.id}/live-track`}>
                        <Button size="sm" className="skeuo-btn-dark text-xs font-bold">
                          <Navigation className="h-3.5 w-3.5 mr-1 text-white animate-pulse" />
                          <span>{isBn ? 'লাইভ ট্র্যাকিং' : 'Track Live GPS'}</span>
                        </Button>
                      </Link>
                    </>
                  )}

                  {/* If pending, also allow viewing status tracking details */}
                  {b.status === 'pending' && (
                    <Link href={`/bookings/${b.id}/live-track?status=pending`}>
                      <Button size="sm" variant="outline" className="skeuo-btn-light text-xs font-bold">
                        <Clock className="h-3.5 w-3.5 mr-1 text-stone-700" />
                        <span>{isBn ? 'অগ্রগতি ট্র্যাকিং' : 'Track Progress'}</span>
                      </Button>
                    </Link>
                  )}

                  {/* Review & Rebook if completed */}
                  {b.status === 'completed' && (
                    <>
                      <Link href={`/bookings/new/${b.mistriId}`}>
                        <Button size="sm" variant="outline" className="skeuo-btn-light text-xs font-bold">
                          <RotateCcw className="h-3.5 w-3.5 mr-1" />
                          <span>{isBn ? 'পুনরায় বুক করুন' : 'Book Again'}</span>
                        </Button>
                      </Link>

                      {!b.hasReviewed ? (
                        <Button
                          size="sm"
                          onClick={() => setReviewBooking(b)}
                          className="skeuo-btn-dark text-xs font-bold"
                        >
                          <Star className="h-3.5 w-3.5 mr-1 fill-amber-400 text-amber-400" />
                          <span>{isBn ? 'রেটিং ও রিভিউ দিন' : 'Rate & Review'}</span>
                        </Button>
                      ) : (
                        <Badge variant="neutral" className="skeuo-pill text-xs bg-stone-200 text-stone-900">
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
          <div className="p-12 text-center skeuo-surface space-y-3">
            <Calendar className="h-10 w-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-bold text-stone-800">
              {isBn ? 'এই ট্যাবে কোনো বুকিং নেই' : 'No Bookings Found'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {isBn 
                ? 'আপনার প্রয়োজনীয় কাজের জন্য স্থানীয় দক্ষ কারিগরদের সাথে সহজেই যোগাযোগ করুন।' 
                : 'Discover and book local professionals in your area.'}
            </p>
            <Link href="/search">
              <Button size="sm" className="skeuo-btn-dark font-bold text-xs">{isBn ? 'মিস্ত্রী খুঁজুন' : 'Explore Professionals'}</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Cancellation Modal Dialog */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl skeuo-surface p-6 shadow-2xl space-y-4 border border-stone-300">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-100 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">বুকিং বাতিলকরণ</h3>
                  <p className="text-[11px] text-stone-500">বুকিং নং: {cancellingBooking.bookingNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-stone-700 font-medium">
                আপনি কি নিশ্চিত যে <span className="font-bold text-stone-900">"{cancellingBooking.mistriName}"</span> এর নিকট পাঠানো এই বুকিংটি বাতিল করতে চান?
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 block">বাতিলের প্রধান কারণ নির্বাচন করুন:</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
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
                        name="cancelReason"
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
                <label className="text-xs font-bold text-stone-800 block">মন্তব্য (ঐচ্ছিক):</label>
                <textarea
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="অতিরিক্ত কোনো তথ্য থাকলে লিখুন..."
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
                onClick={() => setCancellingBooking(null)}
                className="skeuo-btn-light text-xs font-bold"
              >
                না, রেখে দিন
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
