'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  Star, ShieldCheck, MapPin, Calendar, Wrench, 
  CheckCircle2, Heart, Scale, ArrowLeft, Phone, 
  MessageSquare, DollarSign, Clock, ZoomIn, X 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBDT, formatDistance, toBanglaNumber } from '@/lib/utils'

export default function MistriProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [mistri, setMistri] = useState<any>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isCompared, setIsCompared] = useState(false)
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/mistris/${params.id}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setMistri(json.data)
        }
      })
      .catch(() => {})

    // Check favorite & compare status
    try {
      const favs = JSON.parse(localStorage.getItem('mistri_favs') || '[]')
      setIsFavorite(favs.includes(params.id))
      const comp = JSON.parse(localStorage.getItem('mistri_compare') || '[]')
      setIsCompared(comp.includes(params.id))
    } catch {}
  }, [params.id])

  const toggleFavorite = () => {
    try {
      const favs = JSON.parse(localStorage.getItem('mistri_favs') || '[]')
      const next = favs.includes(params.id) 
        ? favs.filter((id: string) => id !== params.id)
        : [...favs, params.id]
      setIsFavorite(!isFavorite)
      localStorage.setItem('mistri_favs', JSON.stringify(next))
    } catch {}
  }

  const toggleCompare = () => {
    try {
      const comp = JSON.parse(localStorage.getItem('mistri_compare') || '[]')
      if (comp.includes(params.id)) {
        const next = comp.filter((id: string) => id !== params.id)
        setIsCompared(false)
        localStorage.setItem('mistri_compare', JSON.stringify(next))
      } else {
        if (comp.length >= 3) {
          alert(isBn ? 'সর্বোচ্চ ৩ জন মিস্ত্রীকে তুলনা করা যাবে' : 'Maximum 3 professionals allowed in comparison')
          return
        }
        const next = [...comp, params.id]
        setIsCompared(true)
        localStorage.setItem('mistri_compare', JSON.stringify(next))
      }
    } catch {}
  }

  if (!mistri) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center text-xs text-slate-500">
        {isBn ? 'প্রোফাইল তথ্য লোড হচ্ছে...' : 'Loading profile...'}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 sm:pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isBn ? 'ফলাফলে ফিরুন' : 'Back to Results'}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Favorite Toggle */}
          <button
            onClick={toggleFavorite}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              isFavorite 
                ? 'bg-rose-50 text-rose-600 border-rose-200' 
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-rose-600' : ''}`} />
            <span>{isFavorite ? (isBn ? 'পছন্দ তালিকায় আছে' : 'Favorited') : (isBn ? 'পছন্দ করুন' : 'Favorite')}</span>
          </button>

          {/* Compare Toggle */}
          <button
            onClick={toggleCompare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              isCompared 
                ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold' 
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>{isCompared ? (isBn ? 'তুলনায় যুক্ত' : 'Compared') : (isBn ? 'তুলনা করুন' : 'Compare')}</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <Card className="p-6 sm:p-8 space-y-6 shadow-sm border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={mistri.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'}
                alt={mistri.name_bn}
                onError={(e) => {
                  const target = e.currentTarget
                  target.onerror = null
                  target.src = 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'
                }}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl object-cover border-2 border-slate-200 shadow-xs"
              />
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-md" title="Admin Verified">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-bold">
                  {isBn ? mistri.category_name_bn : mistri.category_name_en}
                </Badge>
                <Badge variant="success" className="text-xs px-2.5 py-0.5">
                  {isBn ? 'ভেরিফাইড কারিগর' : 'Admin Verified'}
                </Badge>
                {mistri.available_today && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {isBn ? 'আজকে প্রস্তুত' : 'Available Today'}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{mistri.name_bn}</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">{mistri.professional_title}</p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-900">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {mistri.average_rating} ({toBanglaNumber(mistri.total_reviews)} {isBn ? 'টি রিভিউ' : 'reviews'})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  {mistri.upazila_bn}, {mistri.district_bn}
                </span>
                <span>•</span>
                <span className="font-bold text-emerald-600">
                  {formatDistance(mistri.distance_km, isBn)}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Highlight & Booking CTA (Desktop) */}
          <div className="hidden sm:flex flex-col items-end gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">{isBn ? 'প্রারম্ভিক ভিজিট ফি / চার্জ' : 'Base Charge'}</span>
              <span className="text-2xl font-black text-slate-900">{formatBDT(mistri.base_charge, isBn)}</span>
              <span className="text-xs text-slate-500 block">({mistri.charge_type})</span>
            </div>
            <Link href={`/bookings/new/${mistri.id}`} className="w-full">
              <Button size="lg" className="w-full text-xs font-bold px-6">
                {t('booking.book_now')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500 block">{isBn ? 'কাজের অভিজ্ঞতা' : 'Experience'}</span>
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {toBanglaNumber(mistri.experience_years)} {isBn ? 'বছর' : 'Years'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500 block">{isBn ? 'সফল কাজ সম্পন্ন' : 'Completed Jobs'}</span>
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {toBanglaNumber(mistri.total_completed_jobs)} {isBn ? 'টি' : ''}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500 block">{isBn ? 'গ্রাহক সন্তুষ্টি' : 'Satisfaction'}</span>
            <span className="text-base sm:text-lg font-bold text-emerald-600">৯৮%</span>
          </div>
        </div>
      </Card>

      {/* Grid: Services & Bio + Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Services & Subcategories */}
          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-600" />
              <span>{isBn ? 'প্রদত্ত সেবা ও বিশেষ পারদর্শিতা' : 'Offered Services & Skills'}</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {mistri.subcategories.map((sub: string, i: number) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/80 text-blue-800 text-xs font-semibold border border-blue-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>{sub}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-700 mb-1">{isBn ? 'কারিগর পরিচিতি ও কাজের ধরন' : 'About Mistri'}</h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {mistri.bio}
              </p>
            </div>
          </Card>

          {/* Portfolio Lightbox Gallery */}
          {mistri.portfolio && mistri.portfolio.length > 0 && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  {isBn ? 'কাজের পোর্টফোলিও ছবি' : 'Completed Work Portfolio'}
                </h2>
                <span className="text-[11px] text-slate-400">
                  {toBanglaNumber(mistri.portfolio.length)} {isBn ? 'টি কাজের ছবি' : 'photos'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mistri.portfolio.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => setLightboxImg(item.image_url)}
                    className="relative group h-28 sm:h-36 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer bg-slate-100"
                  >
                    <img src={item.image_url} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
                      <span className="text-[11px] font-bold line-clamp-1">{item.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Customer Reviews Section */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {isBn ? 'যাচাইকৃত গ্রাহক রিভিউ ও রেটিং' : 'Verified Customer Reviews'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isBn ? 'শুধুমাত্র সফল বুকিং সম্পন্নকারী গ্রাহকগণের মতামত' : 'Feedback from verified completed bookings'}
                </p>
              </div>
              <Badge variant="warning" className="text-xs font-bold gap-1 px-2.5 py-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{mistri.average_rating}</span>
              </Badge>
            </div>

            <div className="space-y-3">
              {mistri.reviews.map((rev: any) => (
                <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{rev.customer_name}</span>
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < rev.rating_overall ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Location & Trust Badges */}
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {isBn ? 'কাজের এলাকা ও কভারেজ' : 'Service Coverage Area'}
            </h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                <span><strong>{isBn ? 'জেলা:' : 'District:'}</strong> {mistri.district_bn}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                <span><strong>{isBn ? 'উপজেলা:' : 'Upazila:'}</strong> {mistri.upazila_bn}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                <span><strong>{isBn ? 'কাজের সময়:' : 'Availability:'}</strong> সকাল ৮টা - রাত ৮টা</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3 bg-blue-50/60 border-blue-200 text-blue-900">
            <h3 className="text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>{isBn ? 'mistri নিরাপদ সেবা গ্যারান্টি' : 'mistri Safety Guarantee'}</span>
            </h3>
            <ul className="text-[11px] space-y-1.5 text-blue-800 list-disc list-inside">
              <li>{isBn ? 'জাতীয় পরিচয়পত্র অ্যাডমিন কর্তৃক পরীক্ষিত' : 'NID Verified by Admin Team'}</li>
              <li>{isBn ? 'সরাসরি কাজের পর মূল্য পরিশোধের সুযোগ' : 'Pay after work completion'}</li>
              <li>{isBn ? 'যেকোনো অসন্তুষ্টিতে ডিসপিউট ও সাপোর্ট হটলাইন' : 'Dispute mediation available'}</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile Booking */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:hidden flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block">{isBn ? 'মজুরি' : 'Charge'}</span>
          <span className="text-base font-black text-slate-900">{formatBDT(mistri.base_charge, isBn)}</span>
        </div>
        <Link href={`/bookings/new/${mistri.id}`}>
          <Button className="px-6 text-xs font-bold">
            {t('booking.book_now')}
          </Button>
        </Link>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div 
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={lightboxImg} alt="Portfolio item" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}

