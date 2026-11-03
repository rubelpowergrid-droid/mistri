'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  Scale, ArrowLeft, Star, ShieldCheck, MapPin, 
  Wrench, Check, X, ArrowRight, Trash2, Plus 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBDT, formatDistance, toBanglaNumber } from '@/lib/utils'
import { MISTRI_DIRECTORY } from '@/app/api/mistris/search/route'

function CompareContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [comparedMistris, setComparedMistris] = useState<any[]>([])

  useEffect(() => {
    const rawIds = searchParams.get('ids')
    let idList: string[] = []
    if (rawIds) {
      idList = rawIds.split(',').filter(Boolean)
    } else {
      try {
        idList = JSON.parse(localStorage.getItem('mistri_compare') || '[]')
      } catch {}
    }

    // If no IDs provided, default to top 2 for demonstration
    if (idList.length === 0) {
      idList = ['m-1', 'm-2', 'm-3']
    }

    const matched = idList
      .map(id => MISTRI_DIRECTORY.find(m => m.id === id))
      .filter(Boolean)

    setComparedMistris(matched)
  }, [searchParams])

  const removeMistri = (id: string) => {
    const next = comparedMistris.filter(m => m.id !== id)
    setComparedMistris(next)
    try {
      localStorage.setItem('mistri_compare', JSON.stringify(next.map(m => m.id)))
    } catch {}
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isBn ? 'ফলাফলে ফিরুন' : 'Back'}</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Scale className="h-6 w-6 text-blue-600" />
            <span>{isBn ? 'মিস্ত্রী পাশাপাশি তুলনা করুন (Compare)' : 'Side-by-Side Professional Comparison'}</span>
          </h1>
          <p className="text-xs text-slate-500">
            {isBn 
              ? 'অভিজ্ঞতা, রেটিং, মজুরি ও দূরত্বের ভিত্তিতে সেরা কারিগর বেছে নিন (সর্বোচ্চ ৩ জন)' 
              : 'Compare ratings, experience, charges and distance side-by-side to make the right choice'}
          </p>
        </div>

        <Link href="/search">
          <Button variant="outline" size="sm" className="text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>{isBn ? 'আরও মিস্ত্রী যোগ করুন' : 'Add More to Compare'}</span>
          </Button>
        </Link>
      </div>

      {comparedMistris.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Scale className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {isBn ? 'তুলনার জন্য কোনো মিস্ত্রী নির্বাচিত নেই' : 'No Professionals Selected for Comparison'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isBn 
              ? 'সার্চ পেজ থেকে যেকোনো মিস্ত্রীর কার্ডের তুলনা বাটনে ক্লিক করে তালিকায় যুক্ত করুন।' 
              : 'Add professionals to compare from the search discovery page.'}
          </p>
          <Link href="/search">
            <Button size="sm">{isBn ? 'মিস্ত্রী খুঁজুন' : 'Search Professionals'}</Button>
          </Link>
        </Card>
      ) : (
        /* HORIZONTALLY SCROLLABLE COMPARISON TABLE */
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[650px] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            {/* Header Row: Avatars & Names */}
            <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isBn ? 'তুলনীয় বিষয়সমূহ' : 'Metrics'}
              </div>
              {comparedMistris.map((m) => (
                <div key={m.id} className="text-center space-y-2 px-2 relative">
                  <button
                    onClick={() => removeMistri(m.id)}
                    className="absolute -top-1 -right-1 p-1 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-100"
                    title="সরিয়ে ফেলুন"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <img
                    src={m.avatar}
                    alt={m.name_bn}
                    className="h-16 w-16 rounded-2xl object-cover mx-auto border-2 border-slate-200 shadow-xs"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{m.name_bn}</h4>
                    <span className="text-[11px] text-blue-600 font-semibold">{m.category_name_bn}</span>
                  </div>
                  <Link href={`/bookings/new/${m.id}`}>
                    <Button size="sm" className="w-full text-xs font-bold py-1.5 mt-1">
                      {t('booking.book_now')}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Metric Row: Rating */}
            <div className="grid grid-cols-4 p-4 border-b border-slate-100 text-xs items-center hover:bg-slate-50/40">
              <span className="font-semibold text-slate-500">{isBn ? 'গ্রাহক রেটিং' : 'Rating'}</span>
              {comparedMistris.map((m) => (
                <div key={m.id} className="text-center font-bold text-slate-900 flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{m.average_rating}</span>
                  <span className="text-slate-400 font-normal">({toBanglaNumber(m.total_reviews)})</span>
                </div>
              ))}
            </div>

            {/* Metric Row: Experience */}
            <div className="grid grid-cols-4 p-4 border-b border-slate-100 text-xs items-center hover:bg-slate-50/40">
              <span className="font-semibold text-slate-500">{isBn ? 'কাজের অভিজ্ঞতা' : 'Experience'}</span>
              {comparedMistris.map((m) => (
                <div key={m.id} className="text-center font-bold text-slate-900">
                  {toBanglaNumber(m.experience_years)} {isBn ? 'বছর' : 'Years'}
                </div>
              ))}
            </div>

            {/* Metric Row: Completed Jobs */}
            <div className="grid grid-cols-4 p-4 border-b border-slate-100 text-xs items-center hover:bg-slate-50/40">
              <span className="font-semibold text-slate-500">{isBn ? 'সম্পন্ন কাজ' : 'Completed Jobs'}</span>
              {comparedMistris.map((m) => (
                <div key={m.id} className="text-center font-bold text-emerald-600">
                  {toBanglaNumber(m.total_completed_jobs)} {isBn ? 'টি' : 'jobs'}
                </div>
              ))}
            </div>

            {/* Metric Row: Distance */}
            <div className="grid grid-cols-4 p-4 border-b border-slate-100 text-xs items-center hover:bg-slate-50/40">
              <span className="font-semibold text-slate-500">{isBn ? 'দূরত্ব' : 'Distance'}</span>
              {comparedMistris.map((m) => (
                <div key={m.id} className="text-center font-bold text-blue-600">
                  {formatDistance(m.distance_km, isBn)}
                </div>
              ))}
            </div>

            {/* Metric Row: Starting Charge */}
            <div className="grid grid-cols-4 p-4 border-b border-slate-100 text-xs items-center hover:bg-slate-50/40">
              <span className="font-semibold text-slate-500">{isBn ? 'প্রারম্ভিক চার্জ' : 'Base Charge'}</span>
              {comparedMistris.map((m) => (
                <div key={m.id} className="text-center font-black text-slate-900">
                  {formatBDT(m.base_charge, isBn)}
                </div>
              ))}
            </div>

            {/* Metric Row: Location */}
            <div className="grid grid-cols-4 p-4 border-b border-slate-100 text-xs items-center hover:bg-slate-50/40">
              <span className="font-semibold text-slate-500">{isBn ? 'কাজের এলাকা' : 'Service Area'}</span>
              {comparedMistris.map((m) => (
                <div key={m.id} className="text-center text-slate-700">
                  {m.upazila_bn}, {m.district_bn}
                </div>
              ))}
            </div>

            {/* Metric Row: Verification Status */}
            <div className="grid grid-cols-4 p-4 text-xs items-center hover:bg-slate-50/40">
              <span className="font-semibold text-slate-500">{isBn ? 'অ্যাডমিন ভেরিফিকেশন' : 'Verified'}</span>
              {comparedMistris.map((m) => (
                <div key={m.id} className="text-center">
                  <Badge variant="success" className="text-[10px]">
                    <ShieldCheck className="h-3.5 w-3.5 mr-0.5" />
                    <span>{isBn ? 'যাচাইকৃত' : 'Verified'}</span>
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">তুলনা লোড হচ্ছে...</div>}>
      <CompareContent />
    </Suspense>
  )
}
