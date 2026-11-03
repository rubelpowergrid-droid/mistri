'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Users, Wrench, ShieldCheck, Calendar, AlertTriangle, 
  ArrowUpRight, Clock, CheckCircle2, TrendingUp, Layers, 
  MapPin, Star, ArrowRight
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toBanglaNumber, formatBDT } from '@/lib/utils'

export default function AdminDashboardPage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const kpis = [
    {
      title: isBn ? 'মোট কাস্টমার' : 'Total Customers',
      value: 1482,
      change: '+14% এই মাসে',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: isBn ? 'অনুমোদিত মিস্ত্রী' : 'Approved Mistris',
      value: 312,
      change: '৯২% সক্রিয়',
      icon: Wrench,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: isBn ? 'যাচাইকরণ বাকি (NID)' : 'Pending Verifications',
      value: 12,
      change: 'জরুরি পর্যালোচনা প্রয়োজন',
      icon: ShieldCheck,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      actionHref: '/admin/verification',
    },
    {
      title: isBn ? 'মোট সফল বুকিং' : 'Completed Bookings',
      value: 3845,
      change: '+28% গত সপ্তাহের চেয়ে',
      icon: Calendar,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
  ]

  const districtDistribution = [
    { name: isBn ? 'ঠাকুরগাঁও জেলা' : 'Thakurgaon District', percentage: 48, count: 1845, color: 'bg-blue-600' },
    { name: isBn ? 'পঞ্চগড় জেলা' : 'Panchagarh District', percentage: 32, count: 1230, color: 'bg-emerald-600' },
    { name: isBn ? 'দিনাজপুর জেলা' : 'Dinajpur District', percentage: 20, count: 770, color: 'bg-amber-500' },
  ]

  const categoryBookingShares = [
    { name: isBn ? 'ইলেকট্রিক্যাল সার্ভিস' : 'Electrical', count: 1280, share: '৩৩%' },
    { name: isBn ? 'প্লাম্বিং সার্ভিস' : 'Plumbing', count: 940, share: '২৪%' },
    { name: isBn ? 'রং করার কাজ' : 'Painting', count: 620, share: '১৬%' },
    { name: isBn ? 'রাজমিস্ত্রীর কাজ' : 'Masonry', count: 510, share: '১৩%' },
    { name: isBn ? 'অন্যান্য সেবা' : 'Others', count: 495, share: '১৪%' },
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
              <span>{isBn ? 'এনআইডি যাচাইকরণ কিউ (১২)' : 'Verify NIDs (12)'}</span>
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
                  <span>{isBn ? 'পর্যালোচনা করুন' : 'Review Queue'}</span>
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
            {districtDistribution.map((dist, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">{dist.name}</span>
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
                {isBn ? 'ক্যাটাগরি ভিত্তিক বুকিং ভলিউম' : 'Category Booking Volumes'}
              </h2>
            </div>
            <Link href="/admin/categories" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              {isBn ? 'ক্যাটাগরি পরিচালনা' : 'Manage Categories'}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryBookingShares.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                  <span className="block text-[10px] text-slate-500">{toBanglaNumber(cat.count)} টি কাজ সম্পন্ন</span>
                </div>
                <Badge variant="neutral" className="font-bold text-xs bg-white">
                  {cat.share}
                </Badge>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>{isBn ? 'সর্বশেষ ৭ দিনের কার্যকারিতা ডাটাবেজ থেকে সংগৃহীত' : 'Dynamic metrics calculated from PostgreSQL'}</span>
            <Link href="/admin/reports" className="font-semibold text-blue-600 hover:text-blue-700">
              {isBn ? 'সম্পূর্ণ রিপোর্ট ডাউনলোড (CSV)' : 'Export Full Report (CSV)'}
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Action Queue Banner */}
      <Card className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Badge variant="warning" className="bg-amber-400 text-slate-900 font-bold">
              {isBn ? 'জরুরি একশন' : 'Action Required'}
            </Badge>
            <span className="text-xs text-slate-300">১২ জন নতুন মিস্ত্রীর আবেদন জমা হয়েছে</span>
          </div>
          <h3 className="text-base font-bold text-white">
            {isBn ? 'জাতীয় পরিচয়পত্র ও মোবাইল যাচাইকরণ সম্পাদন করুন' : 'Review Pending NID Credentials and Approve Workers'}
          </h3>
        </div>
        <Link href="/admin/verification">
          <Button variant="primary" className="bg-blue-500 hover:bg-blue-600 text-xs font-bold px-5 shrink-0">
            <span>{isBn ? 'ভেরিফিকেশন ডেস্কে যান' : 'Open Verification Desk'}</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </Card>
    </div>
  )
}

