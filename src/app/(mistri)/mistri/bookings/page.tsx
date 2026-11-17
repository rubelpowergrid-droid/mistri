'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { 
  Calendar, Clock, MapPin, Navigation, Phone, 
  CheckCircle2, XCircle, ArrowRight, ShieldCheck, User, Inbox, ArrowLeft,
  Search, Bell, BellOff, Sparkles, Filter, TrendingUp, Check, AlertCircle,
  RefreshCw, DollarSign, Download, Printer, Smartphone
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatBDT, toBanglaNumber } from '@/lib/utils'
import { getStoredUser } from '@/lib/auth-client'
import { createClient } from '@/lib/supabase/client'
import { formatBanglaDateOnly } from '@/components/bookings/booking-history-timeline'

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
  status: 'pending' | 'accepted' | 'on_the_way' | 'in_progress' | 'completed' | 'rejected' | 'cancelled' | 'scheduled'
  agreedPrice: number
  createdAt?: string
  completedAt?: string
  startedAt?: string
  acceptedAt?: string
}

type PeriodFilter = 'all' | '7d' | '30d' | '3m' | '6m' | '1y'

export default function MistriBookingsPage() {
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [bookings, setBookings] = useState<MistriBookingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Notification status
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [isSubscribingNotif, setIsSubscribingNotif] = useState(false)
  const [testAlertMessage, setTestAlertMessage] = useState<string | null>(null)

  // Check notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission)
    } else {
      setNotifPermission('unsupported')
    }
  }, [])

  const handleEnableNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    try {
      setIsSubscribingNotif(true)
      const perm = await Notification.requestPermission()
      setNotifPermission(perm)
      if (perm === 'granted') {
        const user = getStoredUser()
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready
          const sub = await reg.pushManager.getSubscription()
          if (sub) {
            await fetch('/api/notifications/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subscription: sub.toJSON(),
                phone: user?.phone || null,
                userId: user?.id || null,
                role: 'mistri',
              }),
            })
          }
        }
      }
    } catch (e) {
      console.warn('Failed to enable notification:', e)
    } finally {
      setIsSubscribingNotif(false)
    }
  }

  const handleTestPushNotification = async () => {
    const user = getStoredUser()
    setTestAlertMessage('৫ সেকেন্ড পর টেস্ট নোটিফিকেশন আসছে... এখনই স্ক্রিন লক বা অফ করুন!')
    try {
      await fetch('/api/notifications/test-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phone || null,
          userId: user?.id || null,
          delaySeconds: 5,
          title: '🔔 mistri24 - টেস্ট ব্যাকগ্রাউন্ড নোটিফিকেশন',
          message: 'স্ক্রিন অফ থাকলেও সফলভাবে নোটিফিকেশন পৌছেছে!',
        }),
      })
      setTimeout(() => setTestAlertMessage(null), 8000)
    } catch {
      setTestAlertMessage('টেস্ট পুশ পাঠাতে সমস্যা হয়েছে')
      setTimeout(() => setTestAlertMessage(null), 3000)
    }
  }

  // ── Fetch & Realtime Synchronization ───────────────────────────────────────
  const fetchMistriBookings = useCallback(async () => {
    const user = getStoredUser()
    const cleanPhone = user?.phone ? user.phone.replace(/[^0-9]/g, '') : ''
    const userId = user?.id || ''

    try {
      // 1. Query server API passing both mistriPhone and mistriId
      const params = new URLSearchParams({ role: 'mistri' })
      if (cleanPhone) params.set('mistriPhone', cleanPhone)
      if (userId) params.set('mistriId', userId)

      const res = await fetch(`/api/bookings?${params.toString()}`, { cache: 'no-store' })
      const json = await res.json()
      const serverList = (json.success && Array.isArray(json.data)) ? json.data : []

      // 2. Also check local storage for offline / cross-tab resilience
      let localList: any[] = []
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('mistri_customer_bookings')
          if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed)) localList = parsed
          }
        } catch {}
      }

      // Merge and deduplicate
      const map = new Map<string, MistriBookingItem>()

      // Add local items matching this mistri
      for (const item of localList) {
        const itemMPhone = (item.mistriPhone || '').replace(/[^0-9]/g, '')
        const matchesPhone = cleanPhone && itemMPhone && (itemMPhone.slice(-10) === cleanPhone.slice(-10))
        const matchesId = userId && (item.mistriId === userId || item.mistriId === `m-live-${userId}`)

        if (!cleanPhone && !userId) {
          // Fallback: show local item if user not logged in
          map.set(item.id || item.bookingNumber, {
            id: item.id,
            bookingNumber: item.bookingNumber || item.booking_number || 'MST-LIVE',
            customerName: item.customerName || 'সম্মানিত গ্রাহক',
            customerPhone: item.customerPhone || item.contact_phone || '017XXXXXXXX',
            jobAddress: item.jobAddress || item.location || '',
            serviceName: item.serviceName || item.category || 'সাধারণ সেবা',
            description: item.description || item.workDescription || '',
            preferredDate: item.preferredDate || item.date || '',
            preferredTime: item.preferredTime || '',
            status: item.status || 'accepted',
            agreedPrice: item.agreedPrice || item.estimatedBudget || item.amount || 400,
            createdAt: item.createdAt,
            completedAt: item.completedAt,
            startedAt: item.startedAt,
            acceptedAt: item.acceptedAt,
          })
        } else if (matchesPhone || matchesId) {
          map.set(item.id || item.bookingNumber, {
            id: item.id,
            bookingNumber: item.bookingNumber || item.booking_number || 'MST-LIVE',
            customerName: item.customerName || 'সম্মানিত গ্রাহক',
            customerPhone: item.customerPhone || item.contact_phone || '017XXXXXXXX',
            jobAddress: item.jobAddress || item.location || '',
            serviceName: item.serviceName || item.category || 'সাধারণ সেবা',
            description: item.description || item.workDescription || '',
            preferredDate: item.preferredDate || item.date || '',
            preferredTime: item.preferredTime || '',
            status: item.status || 'accepted',
            agreedPrice: item.agreedPrice || item.estimatedBudget || item.amount || 400,
            createdAt: item.createdAt,
            completedAt: item.completedAt,
            startedAt: item.startedAt,
            acceptedAt: item.acceptedAt,
          })
        }
      }

      // Add server items (they override local items with authoritative data)
      for (const item of serverList) {
        map.set(item.id || item.bookingNumber, {
          id: item.id,
          bookingNumber: item.bookingNumber || item.booking_number || 'MST-LIVE',
          customerName: item.customerName || 'সম্মানিত গ্রাহক',
          customerPhone: item.customerPhone || item.contact_phone || '017XXXXXXXX',
          jobAddress: item.jobAddress || item.location || '',
          serviceName: item.serviceName || item.subcategory || item.category || 'সাধারণ কাজ',
          description: item.description || item.workDescription || '',
          preferredDate: item.preferredDate || item.date || '',
          preferredTime: item.preferredTime || '',
          status: item.status || 'accepted',
          agreedPrice: item.agreedPrice || item.estimatedBudget || item.amount || 400,
          createdAt: item.createdAt,
          completedAt: item.completedAt,
          startedAt: item.startedAt,
          acceptedAt: item.acceptedAt,
        })
      }

      const sortedList = Array.from(map.values()).sort((a, b) => {
        const timeA = new Date(a.createdAt || a.acceptedAt || a.startedAt || a.preferredDate || 0).getTime()
        const timeB = new Date(b.createdAt || b.acceptedAt || b.startedAt || b.preferredDate || 0).getTime()
        return timeB - timeA // Latest on top
      })
      setBookings(sortedList)
    } catch (err) {
      console.error('Error fetching mistri bookings:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Setup real-time listeners: BroadcastChannel + Supabase + Storage Event
  useEffect(() => {
    fetchMistriBookings()

    // 1. Polling every 2.5s for real-time responsiveness
    const interval = setInterval(fetchMistriBookings, 2500)
    window.addEventListener('focus', fetchMistriBookings)

    // 2. Cross-tab BroadcastChannel listener (0ms instant sync)
    let bc: BroadcastChannel | null = null
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('mistri_booking_events')
        bc.onmessage = (e) => {
          fetchMistriBookings()
        }
      }
    } catch {}

    // 3. Storage event listener (syncs across open tabs)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mistri_customer_bookings') {
        fetchMistriBookings()
      }
    }
    window.addEventListener('storage', onStorage)

    // 4. Supabase Realtime Channel
    let supaChannel: any = null
    try {
      const supabase = createClient()
      supaChannel = supabase
        .channel('mistri-bookings-global-list')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
          fetchMistriBookings()
        })
        .subscribe()
    } catch {}

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', fetchMistriBookings)
      window.removeEventListener('storage', onStorage)
      if (bc) try { bc.close() } catch {}
      if (supaChannel) {
        try {
          const supabase = createClient()
          supabase.removeChannel(supaChannel)
        } catch {}
      }
    }
  }, [fetchMistriBookings])

  // ── Date Period Calculation Helper ─────────────────────────────────────────
  const isWithinPeriod = (dateStr: string | undefined, period: PeriodFilter): boolean => {
    if (period === 'all') return true
    if (!dateStr) return true // include if no explicit date

    try {
      const itemTime = new Date(dateStr).getTime()
      if (isNaN(itemTime)) return true
      const now = Date.now()
      const diffMs = now - itemTime

      const oneDayMs = 24 * 60 * 60 * 1000
      if (period === '7d') return diffMs <= 7 * oneDayMs
      if (period === '30d') return diffMs <= 30 * oneDayMs
      if (period === '3m') return diffMs <= 90 * oneDayMs
      if (period === '6m') return diffMs <= 182 * oneDayMs // 6 Months!
      if (period === '1y') return diffMs <= 365 * oneDayMs
      return true
    } catch {
      return true
    }
  }

  // ── Filtered Bookings ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Tab Status Filter
      if (activeTab === 'active') {
        const isActive =
          b.status === 'accepted' ||
          b.status === 'on_the_way' ||
          b.status === 'in_progress' ||
          b.status === 'pending' ||
          b.status === 'scheduled'
        if (!isActive) return false
      } else if (activeTab === 'completed') {
        if (b.status !== 'completed') return false
      }

      // 2. Time Period Filter (e.g. 6 months, 3 months, 30 days)
      const bookingDate = b.completedAt || b.createdAt || b.preferredDate
      if (!isWithinPeriod(bookingDate, periodFilter)) {
        return false
      }

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const match =
          (b.bookingNumber && b.bookingNumber.toLowerCase().includes(q)) ||
          (b.customerName && b.customerName.toLowerCase().includes(q)) ||
          (b.customerPhone && b.customerPhone.includes(q)) ||
          (b.serviceName && b.serviceName.toLowerCase().includes(q)) ||
          (b.jobAddress && b.jobAddress.toLowerCase().includes(q)) ||
          (b.description && b.description.toLowerCase().includes(q))
        if (!match) return false
      }

      return true
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || a.acceptedAt || a.startedAt || a.preferredDate || 0).getTime()
      const timeB = new Date(b.createdAt || b.acceptedAt || b.startedAt || b.preferredDate || 0).getTime()
      return timeB - timeA // Latest on top
    })
  }, [bookings, activeTab, periodFilter, searchQuery])

  // ── Tab Counts ─────────────────────────────────────────────────────────────
  const counts = useMemo(() => {
    let active = 0
    let completed = 0
    for (const b of bookings) {
      if (
        b.status === 'accepted' ||
        b.status === 'on_the_way' ||
        b.status === 'in_progress' ||
        b.status === 'pending' ||
        b.status === 'scheduled'
      ) {
        active++
      } else if (b.status === 'completed') {
        completed++
      }
    }
    return {
      active,
      completed,
      all: bookings.length,
    }
  }, [bookings])

  // ── Selected Period Stats (Last 6 Months, etc.) ─────────────────────────────
  const periodStats = useMemo(() => {
    const listInPeriod = bookings.filter((b) =>
      isWithinPeriod(b.completedAt || b.createdAt || b.preferredDate, periodFilter)
    )
    const totalJobs = listInPeriod.length
    const completedJobs = listInPeriod.filter((b) => b.status === 'completed')
    const totalEarnings = completedJobs.reduce((sum, b) => sum + (Number(b.agreedPrice) || 0), 0)
    const avgFee = completedJobs.length > 0 ? Math.round(totalEarnings / completedJobs.length) : 0

    return {
      totalJobs,
      completedCount: completedJobs.length,
      totalEarnings,
      avgFee,
    }
  }, [bookings, periodFilter])

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-28">
      {/* ── Test Notification Status Toast ──────────────────────────────────── */}
      {testAlertMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="rounded-2xl bg-stone-900 text-amber-300 px-4 py-3 shadow-2xl border border-amber-400/40 flex items-center gap-3">
            <Bell className="h-5 w-5 animate-pulse text-amber-400 shrink-0" />
            <p className="text-xs font-semibold leading-relaxed text-white">
              {testAlertMessage}
            </p>
          </div>
        </div>
      )}

      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/mistri/profile" className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 mb-2 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            <span>{isBn ? 'মিস্ত্রী প্রোফাইল ও ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <Calendar className="h-6 w-6 text-[#2c7865]" />
              <span>{isBn ? 'মিস্ত্রী কাজ ও বুকিং ইতিহাস' : 'My Jobs & Booking History'}</span>
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>লাইভ সিঙ্ক</span>
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            {isBn 
              ? 'চলমান ও নির্ধারিত কাজ পরিচালনা করুন এবং বিগত ৬ মাস বা যেকোনো সময়ের কাজের রেকর্ড ও আয় দেখুন' 
              : 'Manage active jobs and review full 6-month work logs and earnings'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {notifPermission !== 'granted' ? (
            <Button 
              size="sm" 
              onClick={handleEnableNotification}
              disabled={isSubscribingNotif}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
              title={isBn ? 'ব্যাকগ্রাউন্ড নোটিফিকেশন অনুমোদন দিন' : 'Enable Background Push'}
            >
              <Bell className="h-3.5 w-3.5 mr-1" />
              <span>{isSubscribingNotif ? 'অনুমোদন হচ্ছে...' : (isBn ? 'নোটিফিকেশন চালু' : 'Enable Alerts')}</span>
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleTestPushNotification}
              className="text-xs font-bold text-stone-700 border-stone-300 bg-white hover:bg-stone-50 cursor-pointer"
              title={isBn ? 'মোবাইল স্ক্রিন অফ করে টেস্ট নোটিফিকেশন পরখ করুন' : 'Test lockscreen push alert'}
            >
              <Smartphone className="h-3.5 w-3.5 mr-1 text-[#2c7865]" />
              <span>{isBn ? 'টেস্ট অ্যালার্ট' : 'Test Alert'}</span>
            </Button>
          )}

          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => fetchMistriBookings()} 
            className="text-xs font-semibold cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
          </Button>

          <Link href="/requests">
            <Button size="sm" className="skeuo-btn-dark text-xs font-bold px-3.5 py-2 cursor-pointer">
              <Inbox className="h-3.5 w-3.5 mr-1 text-[#fefded]" />
              <span>{isBn ? 'নতুন অনুরোধ দেখুন' : 'New Requests'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Status Tabs (Active, Completed, All) ────────────────────────────── */}
      <div className="flex border-b border-stone-200 text-xs font-semibold gap-3 sm:gap-6 overflow-x-auto pb-0.5">
        {[
          { key: 'active', label: isBn ? 'চলমান ও নির্ধারিত কাজ' : 'Active / Scheduled', count: counts.active },
          { key: 'completed', label: isBn ? 'সম্পন্ন কাজ' : 'Completed', count: counts.completed },
          { key: 'all', label: isBn ? 'সকল কাজ' : 'All Jobs', count: counts.all },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.key 
                ? 'border-[#2c7865] text-[#2c7865] font-black' 
                : 'border-transparent text-stone-500 hover:text-stone-800 font-semibold'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === tab.key ? 'bg-[#2c7865] text-white' : 'bg-stone-200 text-stone-700'
            }`}>
              {toBanglaNumber(tab.count)}
            </span>
          </button>
        ))}
      </div>

      {/* ── 6-MONTH / PERIOD FILTER BAR & SEARCH (Point 02 & 03 Solution) ───── */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Period selector pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-stone-600 flex items-center gap-1 mr-1">
              <Filter className="h-3.5 w-3.5 text-[#2c7865]" />
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
                onClick={() => setPeriodFilter(p.key as PeriodFilter)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  periodFilter === p.key
                    ? 'bg-[#2c7865] text-white shadow-xs'
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
            title="কাজের বিবরণ প্রিন্ট করুন"
          >
            <Printer className="h-3.5 w-3.5 text-stone-700" />
            <span>{isBn ? 'রিপোর্ট প্রিন্ট' : 'Print'}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder={isBn ? 'গ্রাহকের নাম, মোবাইল নম্বর, কাজের ধরন বা বুকিং নং দিয়ে খুঁজুন...' : 'Search by name, phone, service, or booking ID...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* Selected Period Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] text-stone-500 font-bold block">{isBn ? 'মোট কাজ (নির্বাচিত সময়)' : 'Total Jobs'}</span>
            <span className="text-base font-black text-stone-900">{toBanglaNumber(periodStats.totalJobs)} টি</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] text-stone-500 font-bold block">{isBn ? 'সম্পন্ন হয়েছে' : 'Completed'}</span>
            <span className="text-base font-black text-emerald-700">{toBanglaNumber(periodStats.completedCount)} টি</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] text-stone-500 font-bold block">{isBn ? 'মোট পারিশ্রমিক/বিল' : 'Total Earnings'}</span>
            <span className="text-base font-black text-[#2c7865]">{formatBDT(periodStats.totalEarnings, isBn)}</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] text-stone-500 font-bold block">{isBn ? 'গড় কাজের রেট' : 'Average Job Fee'}</span>
            <span className="text-base font-black text-stone-900">{formatBDT(periodStats.avgFee, isBn)}</span>
          </div>
        </div>
      </div>

      {/* ── Jobs List ───────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {filtered.map((job) => (
          <Card key={job.id} className="p-5 skeuo-surface border-stone-300 space-y-4 hover:border-black transition-all">
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
                  job.status === 'completed' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                  job.status === 'in_progress' ? 'bg-blue-100 text-blue-900 border border-blue-300 animate-pulse' :
                  job.status === 'on_the_way' ? 'bg-teal-100 text-teal-900 border border-teal-300 animate-pulse' :
                  job.status === 'accepted' ? 'bg-[#2c7865] text-[#fefded]' :
                  job.status === 'pending' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  job.status === 'cancelled' || job.status === 'rejected' ? 'bg-red-100 text-red-900 border border-red-300' :
                  'bg-stone-100 text-stone-800'
                }`}
              >
                {job.status === 'completed' 
                  ? (isBn ? '✓ সম্পন্ন' : 'Completed') 
                  : job.status === 'in_progress'
                  ? (isBn ? '⏳ কাজ চলছে' : 'In Progress')
                  : job.status === 'on_the_way'
                  ? (isBn ? '🚗 পথে আছেন' : 'En Route')
                  : job.status === 'pending'
                  ? (isBn ? 'অপেক্ষমাণ অনুরোধ' : 'Pending Request')
                  : job.status === 'cancelled'
                  ? (isBn ? '✕ বাতিল' : 'Cancelled')
                  : (isBn ? 'অনুরোধ গৃহীত (গৃহীত)' : 'Accepted')}
              </Badge>
            </div>

            {/* Customer & Location */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <User className="h-3.5 w-3.5 text-[#2c7865]" />
                  <span>{job.customerName}</span>
                  <a href={`tel:${job.customerPhone}`} className="text-[#2c7865] font-semibold hover:underline ml-2">
                    {job.customerPhone}
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <MapPin className="h-3.5 w-3.5 text-[#2c7865] shrink-0" />
                  <span>{job.jobAddress}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>{formatBanglaDateOnly(job.preferredDate)}, {job.preferredTime}</span>
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
          <div className="p-12 text-center skeuo-surface rounded-3xl border border-stone-300 text-xs text-stone-500 space-y-2">
            <p className="font-bold text-stone-700">
              {isBn ? 'এই ফিল্টারে কোনো কাজের রেকর্ড পাওয়া যায়নি।' : 'No job records found for this filter.'}
            </p>
            <p className="text-[11px] text-stone-500">
              {isBn ? 'অন্য সময়সীমা (যেমন: "সব সময়") নির্বাচন করুন অথবা অনুসন্ধান শব্দ পরিবর্তন করুন।' : 'Try selecting "All Time" or clearing search query.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
