'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, Zap, Wrench, Paintbrush, Hammer, Home as HomeIcon, 
  Axe, Armchair, ShieldAlert, Layers, Maximize, Users, 
  MoreHorizontal, Star, ShieldCheck, MapPin, ArrowRight 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatBDT, formatDistance, toBanglaNumber } from '@/lib/utils'

export default function HomePage() {
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('Thakurgaon')

  const categories = [
    { id: '1', name_bn: 'ইলেকট্রিক্যাল কাজ', name_en: 'Electrical Services', icon: Zap, slug: 'electrical-services' },
    { id: '2', name_bn: 'প্লাম্বিং সার্ভিস', name_en: 'Plumbing Services', icon: Wrench, slug: 'plumbing-services' },
    { id: '3', name_bn: 'রং করার কাজ', name_en: 'Painting Services', icon: Paintbrush, slug: 'painting-services' },
    { id: '4', name_bn: 'রাজমিস্ত্রীর কাজ', name_en: 'Masonry Services', icon: Hammer, slug: 'masonry-services' },
    { id: '5', name_bn: 'ঘরের টিনের কাজ', name_en: 'Tin Roofing Services', icon: HomeIcon, slug: 'tin-roofing-services' },
    { id: '6', name_bn: 'কাঠের কাজ', name_en: 'Carpentry Services', icon: Axe, slug: 'carpentry-services' },
    { id: '7', name_bn: 'ফার্নিচারের কাজ', name_en: 'Furniture Services', icon: Armchair, slug: 'furniture-services' },
    { id: '8', name_bn: 'এঙ্গেল মিস্ত্রী ও গ্রিল', name_en: 'Metal Fabrication', icon: ShieldAlert, slug: 'metal-fabrication' },
    { id: '9', name_bn: 'থাই গ্লাস ও অ্যালুমিনিয়াম', name_en: 'Thai Glass & Aluminium', icon: Layers, slug: 'thai-glass-aluminium' },
    { id: '10', name_bn: 'ঘরের সিলিং কাজ', name_en: 'Ceiling Services', icon: Maximize, slug: 'ceiling-services' },
    { id: '11', name_bn: 'দৈনিক লেবার', name_en: 'Daily Labour Services', icon: Users, slug: 'daily-labour' },
    { id: '12', name_bn: 'অন্যান্য সেবা', name_en: 'Other Services', icon: MoreHorizontal, slug: 'other-services' },
  ]

  const [featuredMistris, setFeaturedMistris] = useState<any[]>([])
  const [loadingMistris, setLoadingMistris] = useState(true)

  useEffect(() => {
    fetch('/api/mistris/search')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const mapped = data.data.slice(0, 3).map((m: any) => ({
            id: m.id,
            name: isBn ? m.name_bn : (m.name_en || m.name_bn),
            title: m.professional_title || m.title || (isBn ? 'দক্ষ কারিগর' : 'Skilled Worker'),
            rating: m.average_rating || m.rating || 5.0,
            reviewsCount: m.total_reviews || m.reviewsCount || 1,
            completedJobs: m.total_completed_jobs || m.completedJobs || 0,
            experienceYears: m.experience_years || m.experienceYears || 5,
            distanceKm: m.distance_km || 1.4,
            upazila: isBn ? (m.upazila_bn || m.upazila) : (m.upazila || m.upazila_bn),
            baseCharge: m.base_charge || 400,
            chargeType: m.charge_type || 'negotiable',
            avatar: m.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
            category: isBn ? (m.category_name_bn || m.category) : (m.category_name_en || m.category),
          }))
          setFeaturedMistris(mapped)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMistris(false))
  }, [isBn])

  return (
    <div className="space-y-6 sm:space-y-8 pb-2 sm:pb-4">
      {/* Hero Section - Aligned with Header & Main Content in max-w-7xl */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="relative overflow-hidden skeuo-surface-dark bg-gradient-to-b from-[#378b75] via-[#2c7865] to-[#1c5245] text-[#fefded] py-8 sm:py-12 px-4 sm:px-8 rounded-3xl border border-[#225f50] shadow-xl">
          <div className="mx-auto max-w-4xl text-center space-y-4">
            <Badge variant="neutral" className="skeuo-pill bg-[#1e5548]/90 text-[#fefded] border-[#38967f] px-3 py-1 text-xs shadow-xs font-semibold">
              {isBn ? 'ঠাকুরগাঁও • পঞ্চগড় • দিনাজপুর' : 'Thakurgaon • Panchagarh • Dinajpur'}
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#fefded]">
              {isBn ? 'আপনার এলাকার দক্ষ মিস্ত্রী, এখন হাতের মুঠোয়' : 'Find Trusted Local Professionals In Your Area'}
            </h1>
            <p className="text-sm sm:text-base text-[#fefded]/85 max-w-2xl mx-auto">
              {isBn 
                ? 'ইলেকট্রিশিয়ান, প্লাম্বার, রংমিস্ত্রী থেকে শুরু করে যে কোনো কারিগর খুঁজুন সহজেই এবং সরাসরি বুক করুন।'
                : 'Search verified electricians, plumbers, painters, and carpenters nearby with transparent ratings.'}
            </p>

            {/* Search Box - Skeuomorphic Tactile Well in #fefded */}
            <div className="mx-auto max-w-2xl pt-2">
              <div className="flex flex-col sm:flex-row items-center gap-2 rounded-2xl bg-[#fefded] p-2 shadow-2xl border border-[#2c7865]/20">
                <div className="flex w-full items-center gap-2 px-3 text-[#2c7865]">
                  <Search className="h-5 w-5 text-[#2c7865]/60 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search.search_placeholder')}
                    className="w-full bg-transparent py-2 text-sm text-[#14382f] placeholder:text-[#2c7865]/50 focus:outline-none"
                  />
                </div>
                <Link href={`/search?q=${encodeURIComponent(searchQuery)}`} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold skeuo-btn-dark text-[#fefded]">
                    {t('nav.search')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* District Quick Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
              <span className="text-[#fefded]/70 font-medium">{isBn ? 'জেলা বেছে নিন:' : 'Select District:'}</span>
              {[
                { id: 'Thakurgaon', bn: 'ঠাকুরগাঁও', en: 'Thakurgaon' },
                { id: 'Panchagarh', bn: 'পঞ্চগড়', en: 'Panchagarh' },
                { id: 'Dinajpur', bn: 'দিনাজপুর', en: 'Dinajpur' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDistrict(d.id)}
                  className={`rounded-full px-3.5 py-1 font-semibold transition-all cursor-pointer ${
                    selectedDistrict === d.id 
                      ? 'bg-[#fefded] text-[#2c7865] shadow-md font-bold' 
                      : 'bg-[#1e5548]/80 text-[#fefded]/80 hover:bg-[#1e5548] border border-[#38967f]/40'
                  }`}
                >
                  {isBn ? d.bn : d.en}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid - Black & White Skeuomorphic */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              {isBn ? 'সকল সেবা ক্যাটাগরি' : 'All Service Categories'}
            </h2>
            <p className="text-xs text-stone-500">
              {isBn ? 'আপনার প্রয়োজনীয় কাজের ধরন নির্বাচন করুন' : 'Choose the service you need'}
            </p>
          </div>
          <Link href="/categories" className="text-xs font-bold text-stone-900 hover:underline flex items-center gap-1 cursor-pointer">
            <span>{isBn ? 'সব দেখুন' : 'View All'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link key={cat.id} href={`/search?category=${cat.slug}`}>
                <Card className="flex flex-col items-center justify-center p-3 sm:p-4 text-center skeuo-surface border-stone-300 hover:border-stone-900 hover:shadow-lg transition-all cursor-pointer h-full group">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl skeuo-btn-light bg-stone-100 text-stone-900 border border-stone-300 mb-2.5 transition-all group-hover:bg-stone-900 group-hover:text-white group-hover:border-black group-hover:scale-105">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2">
                    {isBn ? cat.name_bn : cat.name_en}
                  </span>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Nearby Professionals Carousel - Monochrome Styling */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-stone-900 animate-pulse"></div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                {isBn ? 'কাছের দক্ষ মিস্ত্রীগণ' : 'Nearby Available Professionals'}
              </h2>
              <p className="text-xs text-stone-500">
                {isBn ? 'জিপিএস ভিত্তিক দূরত্বের ক্রমানুসারে' : 'Ranked by geodesic distance'}
              </p>
            </div>
          </div>
          <Link href="/search?sort=nearest" className="text-xs font-bold text-stone-900 hover:underline flex items-center gap-1 cursor-pointer">
            <span>{isBn ? 'ম্যাপে দেখুন' : 'View on Map'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loadingMistris ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4 skeuo-surface border-stone-300 animate-pulse h-36 flex items-center justify-center">
                <span className="text-xs text-stone-400">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</span>
              </Card>
            ))
          ) : featuredMistris.length > 0 ? (
            featuredMistris.map((mistri) => (
              <Card key={mistri.id} className="flex flex-col justify-between p-4 skeuo-surface border-stone-300 hover:border-stone-400 hover:shadow-md transition-all">
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={mistri.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'}
                      alt={mistri.name}
                      onError={(e) => {
                        const target = e.currentTarget
                        target.onerror = null
                        target.src = 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'
                      }}
                      className="h-16 w-16 rounded-2xl object-cover border border-stone-300 bg-stone-100"
                    />
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-white border border-stone-700 shadow-xs" title="Admin Verified">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="neutral" className="skeuo-pill bg-stone-900 text-white border-stone-800 text-[10px] px-2 py-0.5">
                        {mistri.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs font-bold text-stone-900">
                        <Star className="h-3.5 w-3.5 fill-stone-900 text-stone-900" />
                        {mistri.rating} ({toBanglaNumber(mistri.reviewsCount)})
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 truncate">{mistri.name}</h3>
                    <p className="text-xs text-stone-600 truncate">{mistri.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-stone-600 pt-0.5">
                      <span className="flex items-center gap-0.5 font-medium">
                        <MapPin className="h-3 w-3 text-stone-700" />
                        {mistri.upazila}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-300">
                        {formatDistance(mistri.distanceKm, isBn)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-500 text-[10px] block">{isBn ? 'মজুরি / পারিশ্রমিক' : 'Estimated Charge'}</span>
                    <span className="font-black text-stone-900 text-sm">{formatBDT(mistri.baseCharge, isBn)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/mistri/${mistri.id}`}>
                      <Button variant="outline" size="sm" className="skeuo-btn-light text-xs font-bold">
                        {t('common.view_details')}
                      </Button>
                    </Link>
                    <Link href={`/bookings/new/${mistri.id}`}>
                      <Button size="sm" className="skeuo-btn-dark text-xs font-bold">
                        {t('booking.book_now')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-stone-500">
              {isBn ? 'বর্তমানে কোনো সক্রিয় কারিগর তালিকাভুক্ত নেই।' : 'No active professionals listed.'}
            </div>
          )}
        </div>
      </section>

      {/* Mistri Onboarding Callout Banner - #2c7865 & #fefded Skeuomorphic */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="skeuo-surface-dark bg-gradient-to-b from-[#378b75] via-[#2c7865] to-[#1c5245] text-[#fefded] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-[#225f50] rounded-3xl">
          <div className="space-y-2 text-center md:text-left">
            <Badge variant="neutral" className="skeuo-pill bg-[#1e5548] text-[#fefded] border-[#38967f] font-bold text-xs px-3 py-1">
              {isBn ? 'মিস্ত্রীদের জন্য' : 'For Skilled Workers'}
            </Badge>
            <h3 className="text-xl sm:text-2xl font-black text-[#fefded]">
              {isBn ? 'আপনি কি দক্ষ মিস্ত্রী? mistri-তে যোগ দিয়ে আয় বাড়ান!' : 'Are you a skilled worker? Join mistri and grow your earnings!'}
            </h3>
            <p className="text-xs sm:text-sm text-[#fefded]/85 max-w-xl">
              {isBn 
                ? 'আপনার এনআইডি কার্ড দিয়ে ফ্রিতে রেজিস্ট্রেশন করুন। ভেরিফিকেশন সম্পন্ন হলেই আপনার এলাকার কাস্টমারদের থেকে সরাসরি কাজের অনুরোধ পাবেন।'
                : 'Register free with your NID card. Get verified by admin to receive job requests directly from nearby customers.'}
            </p>
          </div>
          <Link href="/register?role=mistri">
            <Button size="lg" className="shrink-0 skeuo-btn-dark text-[#fefded] font-bold shadow-xl px-6 py-3 rounded-2xl text-xs sm:text-sm">
              {isBn ? 'মিস্ত্রী হিসেবে যোগ দিন' : 'Register as a Mistri'}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
