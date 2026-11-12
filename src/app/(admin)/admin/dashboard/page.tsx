'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, Wrench, ShieldCheck, Calendar,
  Layers, MapPin, ArrowRight, Trash2, AlertTriangle, RefreshCw
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toBanglaNumber } from '@/lib/utils'

interface DashboardStats {
  totalCustomers: number
  approvedMistris: number
  pendingVerifications: number
  totalBookings: number
  completedBookings?: number
  districtDistribution: Array<{
    name_bn: string
    name_en: string
    percentage: number
    count: number
    color: string
  }>
  categoryBookingShares: Array<{
    name_bn: string
    name_en: string
    count: number
    share: string
  }>
}

export default function AdminDashboardPage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    approvedMistris: 0,
    pendingVerifications: 0,
    totalBookings: 0,
    completedBookings: 0,
    districtDistribution: [],
    categoryBookingShares: [],
  })

  const [isCleaning, setIsCleaning] = useState(false)
  const [cleanFeedback, setCleanFeedback] = useState('')

  const handleCleanup = async (target: 'bookings' | 'customers' | 'all') => {
    const confirmMsg =
      target === 'all'
        ? isBn
          ? 'আপনি কি নিশ্চিত যে সকল টেস্ট বুকিং, কাস্টমার ও ডেমো ডাটা মুছে ফ্রেশ করতে চান?'
          : 'Are you sure you want to wipe all test bookings and customers?'
        : isBn
        ? 'আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান?'
        : 'Are you sure you want to proceed?'

    if (!window.confirm(confirmMsg)) return

    setIsCleaning(true)
    setCleanFeedback('')

    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      })
      const data = await res.json()
      setIsCleaning(false)

      if (data.success) {
        if (typeof window !== 'undefined') {
          if (target === 'bookings' || target === 'all') {
            localStorage.removeItem('mistri_customer_bookings')
          }
        }
        setCleanFeedback(data.message || 'ডাটা সফলভাবে মুছে ফেলা হয়েছে')
        setTimeout(() => {
          window.location.reload()
        }, 1200)
      } else {
        setCleanFeedback(data.error || 'সমস্যা হয়েছে')
      }
    } catch {
      setIsCleaning(false)
      setCleanFeedback('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি')
    }
  }

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats', { cache: 'no-store' })
        const data = await res.json()
        if (data.success && data.stats) {
          setStats(data.stats)
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err)
      }
    }
    loadStats()
  }, [])

  const kpis = [
    {
      title: isBn ? 'মোট কাস্টমার' : 'Total Customers',
      value: stats.totalCustomers,
      change: isBn ? 'নিবন্ধিত সক্রিয় কাস্টমার' : 'Active registered users',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      actionHref: '/admin/customers',
    },
    {
      title: isBn ? 'অনুমোদিত মিস্ত্রী' : 'Approved Mistris',
      value: stats.approvedMistris,
      change: isBn ? 'সার্চে লাইভ ও সক্রিয়' : 'Live and active in search',
      icon: Wrench,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      actionHref: '/admin/mistris',
    },
    {
      title: isBn ? 'যাচাইকরণ বাকি (NID)' : 'Pending Verifications',
      value: stats.pendingVerifications,
      change: stats.pendingVerifications > 0 
        ? (isBn ? 'জরুরি পর্যালোচনা প্রয়োজন' : 'Needs review') 
        : (isBn ? 'সবগুলো যাচাই সম্পন্ন' : 'All verified'),
      icon: ShieldCheck,
      color: stats.pendingVerifications > 0 
        ? 'bg-amber-50 text-amber-600 border-amber-200' 
        : 'bg-emerald-50 text-emerald-600 border-emerald-200',
      actionHref: '/admin/verification',
    },
    {
      title: isBn ? 'মোট সফল বুকিং' : 'Completed Bookings',
      value: stats.completedBookings !== undefined ? stats.completedBookings : stats.totalBookings,
      change: isBn ? 'সফল সম্পন্ন কাজ' : 'Completed orders',
      icon: Calendar,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      actionHref: '/admin/bookings',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isBn ? 'সিস্টেম এনালাইটিক্স ও ওভারভিউ' : 'System Overview & Analytics'}
          </h1>
          <p className="text-xs text-slate-500">
            {isBn 
              ? 'ঠাকুরগাঁও, পঞ্চগড় ও দিনাজপুরের লাইভ সার্ভিস ও ভেরিফিকেশন স্ট্যাটাস' 
              : 'Live marketplace activity across Thakurgaon, Panchagarh & Dinajpur'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/verification">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs">
              <ShieldCheck className="h-4 w-4 mr-1" />
              <span>
                {isBn 
                  ? `এনআইডি যাচাইকরণ কিউ (${toBanglaNumber(stats.pendingVerifications)})` 
                  : `Verify NIDs (${stats.pendingVerifications})`}
              </span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <Card key={idx} className="p-4 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{kpi.title}</span>
                <div className={`p-2 rounded-xl border ${kpi.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-black text-slate-900">
                  {toBanglaNumber(kpi.value)}
                </span>
                <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <span>{kpi.change}</span>
                </p>
              </div>
              {kpi.actionHref && (
                <Link href={kpi.actionHref} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-1 border-t border-slate-100">
                  <span>{isBn ? 'বিস্তারিত তালিকা দেখুন' : 'View Full List'}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </Card>
          )
        })}
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District-wise Distribution */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                {isBn ? 'জেলা ভিত্তিক ইউজার বন্টন' : 'District User Distribution'}
              </h2>
            </div>
            <Badge variant="primary" className="text-[10px]">
              {isBn ? '৩ জেলা' : '3 Districts'}
            </Badge>
          </div>

          <div className="space-y-4">
            {stats.districtDistribution.map((dist, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">{isBn ? dist.name_bn : dist.name_en}</span>
                  <span className="text-slate-900">{toBanglaNumber(dist.percentage)}% ({toBanglaNumber(dist.count)})</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={`h-full ${dist.color} rounded-full`}
                    style={{ width: `${dist.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-200">
            {isBn 
              ? 'পরবর্তী সম্প্রসারণের জন্য নতুন জেলা বা উপজেলা যোগ করতে জিও লোকেশন ম্যানেজারে যান।'
              : 'To expand to additional districts or upazilas, visit the Geo Locations manager.'}
          </div>
        </Card>

        {/* Category-wise Booking Volume */}
        <Card className="p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                {isBn ? 'ক্যাটাগরি ভিত্তিক সার্ভিস ও কাজ' : 'Category Services & Completed Jobs'}
              </h2>
            </div>
            <Link href="/admin/categories" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              {isBn ? 'ক্যাটাগরি পরিচালনা' : 'Manage Categories'}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stats.categoryBookingShares.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800">{isBn ? cat.name_bn : cat.name_en}</span>
                  <span className="block text-[10px] text-slate-500">{toBanglaNumber(cat.count)} টি কাজ সম্পন্ন</span>
                </div>
                <Badge variant="neutral" className="font-bold text-xs bg-white">
                  {cat.share}
                </Badge>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>{isBn ? 'লাইভ ডাটাবেজ ও সক্রিয় ইউজারদের তথ্য থেকে সংগৃহীত' : 'Dynamic metrics calculated from live database'}</span>
            <Link href="/admin/reports" className="font-semibold text-blue-600 hover:text-blue-700">
              {isBn ? 'সম্পূর্ণ রিপোর্ট ডাউনলোড (CSV)' : 'Export Full Report (CSV)'}
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Action Queue Banner */}
      <Card className="p-5 skeuo-surface-dark bg-gradient-to-r from-[#1c5245] via-[#2c7865] to-[#378b75] text-[#fefded] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Badge 
              variant="warning" 
              className="bg-[#fefded] text-[#2c7865] font-bold"
            >
              {stats.pendingVerifications > 0 
                ? (isBn ? 'জরুরি একশন' : 'Action Required') 
                : (isBn ? 'সব যাচাই সম্পন্ন' : 'All Verified')}
            </Badge>
            <span className="text-xs text-[#fefded]/80">
              {stats.pendingVerifications > 0
                ? (isBn ? `${toBanglaNumber(stats.pendingVerifications)} জন নতুন মিস্ত্রীর আবেদন জমা হয়েছে` : `${stats.pendingVerifications} worker applications pending`)
                : (isBn ? 'বর্তমানে কোনো পেন্ডিং আবেদন নেই' : 'No pending applications')}
            </span>
          </div>
          <h3 className="text-base font-bold text-[#fefded]">
            {stats.pendingVerifications > 0
              ? (isBn ? 'জাতীয় পরিচয়পত্র ও মোবাইল যাচাইকরণ সম্পাদন করুন' : 'Review Pending NID Credentials and Approve Workers')
              : (isBn ? 'সকল মিস্ত্রীর প্রোফাইল যাচাইকৃত ও লাইভ রয়েছে' : 'All worker profiles are verified and live in search')}
          </h3>
        </div>
        <Link href={stats.pendingVerifications > 0 ? "/admin/verification" : "/admin/mistris"}>
          <Button variant="primary" className="skeuo-btn-dark text-[#fefded] text-xs font-bold px-5 shrink-0">
            <span>
              {stats.pendingVerifications > 0 
                ? (isBn ? 'ভেরিফিকেশন ডেস্কে যান' : 'Open Verification Desk') 
                : (isBn ? 'অনুমোদিত মিস্ত্রী তালিকা' : 'View Approved Mistris')}
            </span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </Card>

      {/* Test / Demo Data Management Card */}
      <Card className="p-5 skeuo-surface border-2 border-stone-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                {isBn ? 'ডেটাবেজ ও ডেমো ডাটা রিসেট ম্যানেজমেন্ট' : 'Database & Demo Data Clean-up'}
              </h3>
              <p className="text-xs text-stone-500">
                {isBn ? 'টেস্টিংয়ের সময় জমা হওয়া ডেমো বুকিং ও টেস্ট অ্যাকাউন্টগুলো এক ক্লিকে মুছে ফ্রেশ করুন' : 'Clear test bookings and demo accounts accumulated during testing'}
              </p>
            </div>
          </div>

          {cleanFeedback && (
            <span className="text-xs font-bold text-[#2c7865] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
              {cleanFeedback}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isCleaning}
            onClick={() => handleCleanup('bookings')}
            className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-stone-700 hover:text-red-700 hover:border-red-300 cursor-pointer"
          >
            <Trash2 className="h-4 w-4 text-rose-600" />
            <span>{isBn ? '🗑️ সকল টেস্ট বুকিং মুছুন' : 'Clear All Bookings'}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isCleaning}
            onClick={() => handleCleanup('customers')}
            className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-stone-700 hover:text-red-700 hover:border-red-300 cursor-pointer"
          >
            <Users className="h-4 w-4 text-blue-600" />
            <span>{isBn ? '🗑️ টেস্ট কাস্টমার মুছুন' : 'Clear Test Customers'}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isCleaning}
            onClick={() => handleCleanup('all')}
            className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-red-700 bg-red-50/50 hover:bg-red-100 border-red-300 cursor-pointer"
          >
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span>{isBn ? '⚠️ সম্পূর্ণ টেস্ট ডাটা রিসেট' : 'Full Test Data Reset'}</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
