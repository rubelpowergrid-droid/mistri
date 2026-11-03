'use client'

import React, { useState } from 'react'
import { 
  Star, Eye, EyeOff, AlertTriangle, ShieldCheck, 
  Search, CheckCircle2, MessageSquare, Trash2 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toBanglaNumber } from '@/lib/utils'

interface ReviewItem {
  id: string
  booking_id: string
  mistri_name: string
  customer_name: string
  rating_overall: number
  rating_quality: number
  rating_behaviour: number
  rating_punctuality: number
  rating_pricing: number
  comment: string
  is_visible: boolean
  moderation_flagged: boolean
  created_at: string
}

export default function AdminReviewsPage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'flagged' | 'hidden'>('all')

  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev-01',
      booking_id: 'MST-261028-XY89',
      mistri_name: 'আব্দুল করিম (প্লাম্বার)',
      customer_name: 'কামরুল হাসান',
      rating_overall: 4.8,
      rating_quality: 5,
      rating_behaviour: 5,
      rating_punctuality: 5,
      rating_pricing: 4,
      comment: 'সময়ে এসেছেন এবং ওয়্যারিংয়ের সমস্যা দ্রুত শনাক্ত করেছেন। আচরণ খুব ভালো।',
      is_visible: true,
      moderation_flagged: false,
      created_at: '২০২৬-১০-২৯',
    },
    {
      id: 'rev-02',
      booking_id: 'MST-261015-CD11',
      mistri_name: 'মোঃ রফিকুল ইসলাম (ইলেকট্রিশিয়ান)',
      customer_name: 'আহমেদ জুবায়ের',
      rating_overall: 5.0,
      rating_quality: 5,
      rating_behaviour: 5,
      rating_punctuality: 5,
      rating_pricing: 5,
      comment: 'খুবই দক্ষ কারিগর। ফ্যানের শব্দ হচ্ছিল, ৩০ মিনিটে ঠিক করে দিয়েছেন।',
      is_visible: true,
      moderation_flagged: false,
      created_at: '২০২৬-১০-১৬',
    },
    {
      id: 'rev-03',
      booking_id: 'MST-261002-FK44',
      mistri_name: 'নুরুল হুদা (ফার্নিচার)',
      customer_name: 'আবুল কাসেম',
      rating_overall: 2.0,
      rating_quality: 2,
      rating_behaviour: 1,
      rating_punctuality: 2,
      rating_pricing: 3,
      comment: 'কাজে প্রচুর দেরি করেছেন এবং কথা ভালো বলেননি। কাজ শেষ করতে পারেননি।',
      is_visible: true,
      moderation_flagged: true,
      created_at: '২০২৬-১০-০৩',
    },
  ])

  const toggleVisibility = (id: string) => {
    setReviews(prev =>
      prev.map(r => r.id === id ? { ...r, is_visible: !r.is_visible } : r)
    )
  }

  const toggleFlag = (id: string) => {
    setReviews(prev =>
      prev.map(r => r.id === id ? { ...r, moderation_flagged: !r.moderation_flagged } : r)
    )
  }

  const filtered = reviews.filter(r => {
    const matchesSearch = r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.mistri_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.comment.toLowerCase().includes(searchQuery.toLowerCase())
    if (filterMode === 'flagged') return matchesSearch && r.moderation_flagged
    if (filterMode === 'hidden') return matchesSearch && !r.is_visible
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isBn ? 'গ্রাহক রিভিউ ও রেটিং মডারেশন ডেস্ক' : 'Review & Rating Moderation Desk'}
          </h1>
          <p className="text-xs text-slate-500">
            {isBn 
              ? 'কাস্টমারদের প্রদত্ত রিভিউ পর্যবেক্ষণ করুন এবং আপত্তিকর বা স্প্যাম রিভিউ দৃশ্যমানতা নিয়ন্ত্রণ করুন' 
              : 'Audit user feedback and moderate fraudulent or abusive content'}
          </p>
        </div>
        <Badge variant="primary" className="text-xs font-bold px-3 py-1">
          {toBanglaNumber(reviews.length)} {isBn ? 'টি মোট রিভিউ' : 'Total Reviews'}
        </Badge>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            id="searchRev"
            placeholder={isBn ? 'কাস্টমার, মিস্ত্রী বা মন্তব্যে খুঁজুন...' : 'Search by user or keyword...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex rounded-xl bg-white border border-slate-200 p-1 text-xs font-semibold">
          {[
            { key: 'all', label: isBn ? 'সকল' : 'All' },
            { key: 'flagged', label: isBn ? 'ফ্ল্যাগড (রিপোর্টকৃত)' : 'Flagged' },
            { key: 'hidden', label: isBn ? 'লুকানো (Hidden)' : 'Hidden' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterMode(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === tab.key ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-3">
        {filtered.map((rev) => (
          <Card key={rev.id} className="p-5 border-slate-200 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-slate-900">{rev.customer_name}</span>
                <span className="text-xs text-slate-400">➔</span>
                <span className="font-bold text-xs text-blue-600">{rev.mistri_name}</span>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {rev.booking_id}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">{rev.created_at}</span>
                <Badge variant={rev.is_visible ? 'success' : 'neutral'} className="text-[10px]">
                  {rev.is_visible ? (isBn ? 'পাবলিকে দৃশ্যমান' : 'Visible') : (isBn ? 'লুকানো' : 'Hidden')}
                </Badge>
                {rev.moderation_flagged && (
                  <Badge variant="warning" className="text-[10px]">
                    {isBn ? 'পর্যালোচিত' : 'Flagged'}
                  </Badge>
                )}
              </div>
            </div>

            {/* Criteria breakdown */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="h-4 w-4 fill-amber-400" />
                <span>{toBanglaNumber(rev.rating_overall)} / ৫</span>
              </span>
              <span>•</span>
              <span className="text-[11px] text-slate-500">কাজের মান: {toBanglaNumber(rev.rating_quality)}★</span>
              <span>•</span>
              <span className="text-[11px] text-slate-500">ব্যবহার: {toBanglaNumber(rev.rating_behaviour)}★</span>
              <span>•</span>
              <span className="text-[11px] text-slate-500">সময়ানুবর্তিতা: {toBanglaNumber(rev.rating_punctuality)}★</span>
              <span>•</span>
              <span className="text-[11px] text-slate-500">মজুরি: {toBanglaNumber(rev.rating_pricing)}★</span>
            </div>

            {/* Comment */}
            <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              "{rev.comment}"
            </p>

            {/* Moderation Controls */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleFlag(rev.id)}
                className={`text-xs ${rev.moderation_flagged ? 'text-amber-700 bg-amber-50 border-amber-200' : ''}`}
              >
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                <span>{rev.moderation_flagged ? (isBn ? 'আন-ফ্ল্যাগ করুন' : 'Unflag') : (isBn ? 'ফ্ল্যাগ চিহ্নিত' : 'Flag')}</span>
              </Button>

              <Button
                size="sm"
                onClick={() => toggleVisibility(rev.id)}
                className={`text-xs font-bold ${
                  rev.is_visible 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {rev.is_visible ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5 mr-1" />
                    <span>{isBn ? 'পাবলিক থেকে লুকান' : 'Hide from Public'}</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    <span>{isBn ? 'পুনরায় প্রদর্শন করুন' : 'Unhide'}</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            {isBn ? 'কোনো রিভিউ পাওয়া যায়নি।' : 'No reviews match this filter.'}
          </div>
        )}
      </div>
    </div>
  )
}
