'use client'

import React, { useState, useEffect, Suspense, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  Calendar, Clock, MapPin, Navigation, Phone, 
  CheckCircle2, XCircle, AlertCircle, Star, 
  RotateCcw, ShieldCheck, ArrowRight, MessageSquare, X, AlertTriangle, User,
  Search, Filter, Printer
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatBDT, toBanglaNumber } from '@/lib/utils'
import { ReviewModal } from '@/components/reviews/review-modal'
import { getStoredUser } from '@/lib/auth-client'

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
  proposedDate?: string | null
  proposedTime?: string | null
  cancellationReason?: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [activeTab, setActiveTab] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<'all' | '7d' | '30d' | '3m' | '6m' | '1y'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [successBanner, setSuccessBanner] = useState(searchParams.get('success') === 'true')
  const [reviewBooking, setReviewBooking] = useState<BookingRecord | null>(null)
  const [userRole, setUserRole] = useState<'admin' | 'mistri' | 'customer' | null>(null)

  // Cancellation Modal State
  const [cancellingBooking, setCancellingBooking] = useState<BookingRecord | null>(null)
  const [cancelReason, setCancelReason] = useState<string>(CANCELLATION_REASONS[0])
  const [cancelNotes, setCancelNotes] = useState<string>('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelFeedback, setCancelFeedback] = useState<string>('')

  const [bookings, setBookings] = useState<BookingRecord[]>([])

  // If user is a mistri, automatically redirect them to /mistri/bookings
  useEffect(() => {
    const user = getStoredUser()
    if (user?.role) {
      setUserRole(user.role)
      if (user.role === 'mistri') {
        router.replace('/mistri/bookings')
      }
    }
  }, [router])

  // Load bookings from localStorage and sync from server in real-time
  useEffect(() => {
    // 1. Initial local load
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

    // 2. Fetch live updates from server API
    const syncBookings = async () => {
      const user = getStoredUser()
      const cleanPhone = user?.phone ? user.phone.replace(/[^0-9]/g, '') : ''
      try {
        const url = cleanPhone 
          ? `/api/bookings?role=customer&customerPhone=${cleanPhone}`
          : `/api/bookings?role=customer`
        const res = await fetch(url, { cache: 'no-store' })
        const json = await res.json()
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setBookings(prev => {
            const mergedMap = new Map<string, any>()
            // Put server items first
            for (const item of json.data) {
              mergedMap.set(item.id, {
                id: item.id,
                bookingNumber: item.bookingNumber || item.booking_number,
                mistriId: item.mistriId,
                mistriName: item.mistriName,
                mistriTitle: item.mistriTitle || item.category || 'দক্ষ কারিগর',
                mistriPhone: item.mistriPhone || item.customerPhone,
                mistriAvatar: item.mistriAvatar || '',
                category: item.category || item.serviceName || 'ইলেকট্রিক্যাল কাজ',
                workDescription: item.description || item.workDescription,
                jobAddress: item.jobAddress || item.location,
                preferredDate: item.preferredDate || item.date,
                preferredTime: item.preferredTime,
                proposedDate: item.proposedDate,
                proposedTime: item.proposedTime,
                status: item.status,
                agreedPrice: item.agreedPrice,
                estimatedBudget: item.estimatedBudget || item.amount,
                cancellationReason: item.cancellationReason,
                createdAt: item.createdAt || item.created_at,
                acceptedAt: item.acceptedAt || item.accepted_at,
                startedAt: item.startedAt || item.started_at,
                completedAt: item.completedAt || item.completed_at,
                updatedAt: item.updatedAt || item.updated_at,
                hasReviewed: false,
              })
            }
            // Merge existing local items
            for (const l of prev) {
              if (!mergedMap.has(l.id)) {
                mergedMap.set(l.id, l)
              } else {
                const s = mergedMap.get(l.id)
                mergedMap.set(l.id, { ...l, ...s })
              }
            }
            const finalArr = Array.from(mergedMap.values())
            try {
              localStorage.setItem('mistri_customer_bookings', JSON.stringify(finalArr))
            } catch {}
            return finalArr
          })
        }
      } catch (err) {
        console.error('Failed to sync bookings:', err)
      }
    }

    syncBookings()
    const interval = setInterval(syncBookings, 3000)
    window.addEventListener('focus', syncBookings)

    // Cross-tab BroadcastChannel listener
    let bc: BroadcastChannel | null = null
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('mistri_booking_events')
        bc.onmessage = () => {
          syncBookings()
        }
      }
    } catch {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mistri_customer_bookings') {
        syncBookings()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', syncBookings)
      window.removeEventListener('storage', handleStorageChange)
      if (bc) {
        try { bc.close() } catch {}
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

  // Date period calculation helper
  const isWithinPeriod = (dateStr: string | undefined, period: string): boolean => {
    if (period === 'all') return true
    if (!dateStr) return true
    try {
      const itemTime = new Date(dateStr).getTime()
      if (isNaN(itemTime)) return true
      const diffMs = Date.now() - itemTime
      const oneDayMs = 24 * 60 * 60 * 1000
      if (period === '7d') return diffMs <= 7 * oneDayMs
      if (period === '30d') return diffMs <= 30 * oneDayMs
      if (period === '3m') return diffMs <= 90 * oneDayMs
      if (period === '6m') return diffMs <= 182 * oneDayMs
      if (period === '1y') return diffMs <= 365 * oneDayMs
      return true
    } catch {
      return true
    }
  }

  // Tab counts
  const tabCounts = useMemo(() => {
    let active = 0
    let pending = 0
    let completed = 0
    let cancelled = 0
    for (const b of bookings) {
      if (b.status === 'accepted' || b.status === 'in_progress' || (b.status as any) === 'on_the_way') {
        active++
      } else if (b.status === 'pending') {
        pending++
      } else if (b.status === 'completed') {
        completed++
      } else if (b.status === 'cancelled' || b.status === 'rejected') {
        cancelled++
      }
    }
    return { all: bookings.length, active, pending, completed, cancelled }
  }, [bookings])

  // Selected period summary statistics
  const periodStats = useMemo(() => {
    const list = bookings.filter(b => isWithinPeriod((b as any).completedAt || (b as any).createdAt || b.preferredDate, periodFilter))
    const total = list.length
    const completed = list.filter(b => b.status === 'completed')
    const totalSpent = completed.reduce((sum, b) => sum + (Number(b.agreedPrice || b.estimatedBudget) || 0), 0)
    return {
      total,
      completedCount: completed.length,
      totalSpent
    }
  }, [bookings, periodFilter])

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (activeTab === 'active') {
        const isActive = b.status === 'accepted' || b.status === 'in_progress' || (b.status as any) === 'on_the_way'
        if (!isActive) return false
      } else if (activeTab !== 'all') {
        if (b.status !== activeTab) return false
      }

      // Time period filter (last 6 months, 30 days, etc.)
      const bookingDate = (b as any).completedAt || (b as any).createdAt || b.preferredDate
      if (!isWithinPeriod(bookingDate, periodFilter)) return false

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const match =
          b.bookingNumber?.toLowerCase().includes(q) ||
          b.mistriName?.toLowerCase().includes(q) ||
          b.mistriPhone?.includes(q) ||
          b.category?.toLowerCase().includes(q) ||
          b.workDescription?.toLowerCase().includes(q) ||
          b.jobAddress?.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
    .sort((a, b) => {
      const timeA = new Date((a as any).createdAt || a.preferredDate || 0).getTime()
      const timeB = new Date((b as any).createdAt || b.preferredDate || 0).getTime()
      return timeB - timeA // Latest on top
    })
  }, [bookings, activeTab, periodFilter, searchQuery])

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

      {/* Mistri redirection alert banner */}
      {userRole === 'mistri' && (
        <div className="rounded-2xl bg-[#2c7865] text-[#fefded] p-4 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#fefded] shrink-0" />
            <span>{isBn ? 'আপনি মিস্ত্রী হিসেবে লগইন আছেন। আপনার মিস্ত্রী কাজ ও আয়ের ইতিহাস দেখতে এখানে চাপ দিন:' : 'You are logged in as Mistri. View your job history & earnings:'}</span>
          </div>
          <Link href="/mistri/bookings">
            <Button size="sm" className="skeuo-btn-light text-xs font-black text-[#2c7865] whitespace-nowrap">
              <span>{isBn ? 'মিস্ত্রী কাজের ইতিহাসে যান' : 'Go to Mistri Jobs'}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
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
              ? 'সকল চলমান, নির্ধারিত এবং পূর্ববর্তী সম্পন্ন বুকিং ট্র্যাক ও পরিচালনা করুন (বিগত ৬ মাসের রেকর্ড সহ)' 
              : 'Track active, scheduled and previous completed service requests (including 6-month history)'}
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
          { key: 'all', label: isBn ? 'সকল বুকিং' : 'All', count: tabCounts.all },
          { key: 'active', label: isBn ? 'চলমান ও নির্ধারিত' : 'Active / Scheduled', count: tabCounts.active },
          { key: 'pending', label: isBn ? 'অপেক্ষমান' : 'Pending', count: tabCounts.pending },
          { key: 'completed', label: isBn ? 'সম্পন্ন' : 'Completed', count: tabCounts.completed },
          { key: 'cancelled', label: isBn ? 'বাতিলকৃত' : 'Cancelled', count: tabCounts.cancelled },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-2 px-3 rounded-xl whitespace-nowrap transition-all text-xs font-bold cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'skeuo-btn-dark'
                : 'skeuo-btn-light'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
            }`}>
              {toBanglaNumber(tab.count)}
            </span>
          </button>
        ))}
      </div>

      {/* ── 6-MONTH / PERIOD FILTER BAR & SEARCH ───── */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Period selector pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-stone-600 flex items-center gap-1 mr-1">
              <Filter className="h-3.5 w-3.5 text-stone-700" />
              <span>{isBn ? 'সময়কাল:' : 'Period:'}</span>
            </span>
            {[
              { key: 'all', label: isBn ? 'সব সময়' : 'All Time' },
              { key: '7d', label: isBn ? 'গত ৭ দিন' : 'Last 7 Days' },
              { key: '30d', label: isBn ? 'গত ৩০ দিন' : 'Last 30 Days' },
              { key: '3m', label: isBn ? 'গত ৩ মাস' : 'Last 3 Months' },
              { key: '6m', label: isBn ? 'গত ৬ মাস' : 'Last 6 Months' },
              { key: '1y', label: isBn ? 'গত ১ বছর' : 'Last 1 Year' },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriodFilter(p.key as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  periodFilter === p.key
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Quick print summary */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-200 px-3 py-1 rounded-xl bg-stone-50 cursor-pointer self-start sm:self-auto"
            title="রিপোর্ট প্রিন্ট করুন"
          >
            <Printer className="h-3.5 w-3.5 text-stone-700" />
            <span>{isBn ? 'প্রিন্ট' : 'Print'}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder={isBn ? 'বুকিং নম্বর, মিস্ত্রীর নাম, মোবাইল নম্বর অথবা কাজের বিবরণ দিয়ে খুঁজুন...' : 'Search by booking number, mistri name, phone, or service...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* Selected Period Summary Banner */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center">
          <div className="bg-stone-50 p-2 rounded-xl">
            <span className="text-[10px] text-stone-500 font-semibold block">{isBn ? 'মোট বুকিং' : 'Total Bookings'}</span>
            <span className="text-sm font-black text-stone-900">{toBanglaNumber(periodStats.total)} টি</span>
          </div>
          <div className="bg-emerald-50/70 p-2 rounded-xl">
            <span className="text-[10px] text-emerald-700 font-semibold block">{isBn ? 'সম্পন্ন সেবা' : 'Completed'}</span>
            <span className="text-sm font-black text-emerald-800">{toBanglaNumber(periodStats.completedCount)} টি</span>
          </div>
          <div className="bg-blue-50/70 p-2 rounded-xl">
            <span className="text-[10px] text-blue-700 font-semibold block">{isBn ? 'মোট ব্যয়/বিল' : 'Total Spent'}</span>
            <span className="text-sm font-black text-blue-900">{formatBDT(periodStats.totalSpent)}</span>
          </div>
        </div>
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
                    b.status === 'rejected' ? 'danger' :
                    b.status === 'cancelled' ? 'danger' : 'neutral'
                  }
                  className={`text-[11px] font-bold skeuo-pill px-2.5 py-0.5 ${
                    b.status === 'pending' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                    b.status === 'accepted' ? 'bg-[#2c7865] text-[#fefded]' :
                    b.status === 'completed' ? 'bg-stone-200 text-stone-900' :
                    b.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                    b.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-300' : ''
                  }`}
                >
                  {b.status === 'rejected' 
                    ? (isBn ? 'মিস্ত্রী ব্যস্ত / বাতিল' : 'Declined (Busy)')
                    : isBn ? t(`booking.status.${b.status}`) : b.status}
                </Badge>
              </div>

              {/* Main Content: Worker info & Job Description */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  {b.mistriAvatar ? (
                    <img
                      src={b.mistriAvatar}
                      alt={b.mistriName}
                      className="h-14 w-14 rounded-2xl object-cover border border-stone-300 shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-2xl bg-[#2c7865] text-[#fefded] flex items-center justify-center font-bold text-lg shrink-0 shadow-sm border border-[#225f50]">
                      {b.mistriName ? b.mistriName.charAt(0) : <User className="h-6 w-6" />}
                    </div>
                  )}
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
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-[#2c7865] flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#2c7865]" />
                        <span>{isBn ? 'মিস্ত্রী অনুরোধ গ্রহণ করেছেন ও প্রস্তুত' : 'Request Accepted by Mistri'}</span>
                      </span>
                      {(b.proposedTime || b.proposedDate) && (
                        <span className="text-[11px] font-bold text-[#2c7865] flex items-center gap-1 bg-[#2c7865]/10 px-2 py-0.5 rounded-lg border border-[#2c7865]/20">
                          <Clock className="h-3.5 w-3.5 text-[#2c7865]" />
                          <span>
                            {isBn 
                              ? `মিস্ত্রী প্রস্তাবিত সময়ে কাজ করতে সম্মত: ${b.proposedDate || ''} (${b.proposedTime || ''})` 
                              : `Worker proposed schedule: ${b.proposedDate} (${b.proposedTime})`}
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                  {b.status === 'pending' && (
                    <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      <span>{isBn ? 'মিস্ত্রীর অনুমোদনের অপেক্ষায় রয়েছে' : 'Awaiting worker confirmation'}</span>
                    </span>
                  )}
                  {b.status === 'rejected' && (
                    <span className="text-[11px] font-bold text-red-700 flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-xl border border-red-200">
                      <XCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                      <span>
                        {isBn ? 'মিস্ত্রী বর্তমানে ব্যস্ত থাকায় অনুরোধটি গ্রহণ করতে পারেননি' : 'Declined: Worker is busy'}
                        {b.cancellationReason ? ` (কারণ: ${b.cancellationReason})` : ''}
                      </span>
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
                      <Link href={`/bookings/${b.id}/live-track`}>
                        <Button size="sm" variant="outline" className="skeuo-btn-light text-xs font-bold text-[#2c7865] border-[#2c7865]/30">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>{isBn ? 'টাইমলাইন ও হিস্টোরি' : 'View Timeline'}</span>
                        </Button>
                      </Link>

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
