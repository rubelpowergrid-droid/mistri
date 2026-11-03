'use client'

import React, { useState } from 'react'
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
    { id: '1', name_bn: 'ইলেকট্রিক্যাল কাজ', name_en: 'Electrical Services', icon: Zap, slug: 'electrical-services', color: 'bg-amber-50 text-amber-600' },
    { id: '2', name_bn: 'প্লাম্বিং সার্ভিস', name_en: 'Plumbing Services', icon: Wrench, slug: 'plumbing-services', color: 'bg-blue-50 text-blue-600' },
    { id: '3', name_bn: 'রং করার কাজ', name_en: 'Painting Services', icon: Paintbrush, slug: 'painting-services', color: 'bg-purple-50 text-purple-600' },
    { id: '4', name_bn: 'রাজমিস্ত্রীর কাজ', name_en: 'Masonry Services', icon: Hammer, slug: 'masonry-services', color: 'bg-orange-50 text-orange-600' },
    { id: '5', name_bn: 'ঘরের টিনের কাজ', name_en: 'Tin Roofing Services', icon: HomeIcon, slug: 'tin-roofing-services', color: 'bg-teal-50 text-teal-600' },
    { id: '6', name_bn: 'কাঠের কাজ', name_en: 'Carpentry Services', icon: Axe, slug: 'carpentry-services', color: 'bg-yellow-50 text-yellow-700' },
    { id: '7', name_bn: 'ফার্নিচারের কাজ', name_en: 'Furniture Services', icon: Armchair, slug: 'furniture-services', color: 'bg-rose-50 text-rose-600' },
    { id: '8', name_bn: 'এঙ্গেল মিস্ত্রী ও গ্রিল', name_en: 'Metal Fabrication', icon: ShieldAlert, slug: 'metal-fabrication', color: 'bg-slate-100 text-slate-700' },
    { id: '9', name_bn: 'থাই গ্লাস ও অ্যালুমিনিয়াম', name_en: 'Thai Glass & Aluminium', icon: Layers, slug: 'thai-glass-aluminium', color: 'bg-cyan-50 text-cyan-600' },
    { id: '10', name_bn: 'ঘরের সিলিং কাজ', name_en: 'Ceiling Services', icon: Maximize, slug: 'ceiling-services', color: 'bg-emerald-50 text-emerald-600' },
    { id: '11', name_bn: 'দৈনিক লেবার', name_en: 'Daily Labour Services', icon: Users, slug: 'daily-labour', color: 'bg-indigo-50 text-indigo-600' },
    { id: '12', name_bn: 'অন্যান্য সেবা', name_en: 'Other Services', icon: MoreHorizontal, slug: 'other-services', color: 'bg-neutral-100 text-neutral-600' },
  ]

  const featuredMistris = [
    {
      id: 'm-1',
      name: isBn ? 'মোঃ রফিকুল ইসলাম' : 'Md. Rafiqul Islam',
      title: isBn ? 'সিনিয়র ইলেকট্রিশিয়ান' : 'Senior Electrician',
      rating: 4.9,
      reviewsCount: 38,
      completedJobs: 142,
      experienceYears: 8,
      distanceKm: 1.4,
      upazila: isBn ? 'ঠাকুরগাঁও সদর' : 'Thakurgaon Sadar',
      baseCharge: 500,
      chargeType: 'negotiable',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      category: isBn ? 'ইলেকট্রিক্যাল কাজ' : 'Electrical',
    },
    {
      id: 'm-2',
      name: isBn ? 'আব্দুল করিম' : 'Abdul Karim',
      title: isBn ? 'দক্ষ প্লাম্বিং কারিগর' : 'Expert Plumber',
      rating: 4.8,
      reviewsCount: 29,
      completedJobs: 98,
      experienceYears: 6,
      distanceKm: 2.1,
      upazila: isBn ? 'পীরগঞ্জ' : 'Pirganj',
      baseCharge: 400,
      chargeType: 'negotiable',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      category: isBn ? 'প্লাম্বিং সার্ভিস' : 'Plumbing',
    },
    {
      id: 'm-3',
      name: isBn ? 'তরিকুল হাসান' : 'Tariqul Hasan',
      title: isBn ? 'রাজমিস্ত্রী ও টাইলস স্পেশালিস্ট' : 'Mason & Tiles Specialist',
      rating: 5.0,
      reviewsCount: 52,
      completedJobs: 210,
      experienceYears: 12,
      distanceKm: 3.5,
      upazila: isBn ? 'বোদা, পঞ্চগড়' : 'Boda, Panchagarh',
      baseCharge: 800,
      chargeType: 'negotiable',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      category: isBn ? 'রাজমিস্ত্রীর কাজ' : 'Masonry',
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-600 to-blue-700 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <Badge variant="neutral" className="bg-white/15 text-white border-white/20 px-3 py-1 text-xs">
            {isBn ? '📍 ঠাকুরগাঁও • পঞ্চগড় • দিনাজপুর' : '📍 Thakurgaon • Panchagarh • Dinajpur'}
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {isBn ? 'আপনার এলাকার দক্ষ মিস্ত্রী, এখন হাতের মুঠোয়' : 'Find Trusted Local Professionals In Your Area'}
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            {isBn 
              ? 'ইলেকট্রিশিয়ান, প্লাম্বার, রংমিস্ত্রী থেকে শুরু করে যে কোনো কারিগর খুঁজুন সহজেই এবং সরাসরি বুক করুন।'
              : 'Search verified electricians, plumbers, painters, and carpenters nearby with transparent ratings.'}
          </p>

          {/* Search Box */}
          <div className="mx-auto max-w-2xl pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 rounded-2xl bg-white p-2 shadow-lg">
              <div className="flex w-full items-center gap-2 px-3 text-slate-800">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search.search_placeholder')}
                  className="w-full bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <Link href={`/search?q=${encodeURIComponent(searchQuery)}`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold">
                  {t('nav.search')}
                </Button>
              </Link>
            </div>
          </div>

          {/* District Quick Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-blue-200">{isBn ? 'জেলা বেছে নিন:' : 'Select District:'}</span>
            {[
              { id: 'Thakurgaon', bn: 'ঠাকুরগাঁও', en: 'Thakurgaon' },
              { id: 'Panchagarh', bn: 'পঞ্চগড়', en: 'Panchagarh' },
              { id: 'Dinajpur', bn: 'দিনাজপুর', en: 'Dinajpur' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDistrict(d.id)}
                className={`rounded-full px-3 py-1 font-medium transition-all ${
                  selectedDistrict === d.id 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isBn ? d.bn : d.en}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {isBn ? 'সকল সেবা ক্যাটাগরি' : 'All Service Categories'}
            </h2>
            <p className="text-xs text-slate-500">
              {isBn ? 'আপনার প্রয়োজনীয় কাজের ধরন নির্বাচন করুন' : 'Choose the service you need'}
            </p>
          </div>
          <Link href="/categories" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>{isBn ? 'সব দেখুন' : 'View All'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link key={cat.id} href={`/search?category=${cat.slug}`}>
                <Card className="flex flex-col items-center justify-center p-3 sm:p-4 text-center hover:border-blue-400 hover:shadow-md transition-all cursor-pointer h-full group">
                  <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl ${cat.color} mb-2.5 transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2">
                    {isBn ? cat.name_bn : cat.name_en}
                  </span>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Nearby Professionals Carousel */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {isBn ? 'কাছের উপলব্ধ মিস্ত্রীগণ' : 'Nearby Available Professionals'}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn ? 'জিপিএস ভিত্তিক দূরত্বের ক্রমানুসারে' : 'Ranked by geodesic distance'}
              </p>
            </div>
          </div>
          <Link href="/search?sort=nearest" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>{isBn ? 'ম্যাপে দেখুন' : 'View on Map'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredMistris.map((mistri) => (
            <Card key={mistri.id} className="flex flex-col justify-between p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={mistri.avatar}
                    alt={mistri.name}
                    className="h-16 w-16 rounded-2xl object-cover border border-slate-200"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white" title="Admin Verified">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" className="text-[10px] px-2 py-0.5">
                      {mistri.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {mistri.rating} ({toBanglaNumber(mistri.reviewsCount)})
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 truncate">{mistri.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{mistri.title}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-0.5">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3 text-blue-600" />
                      {mistri.upazila}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-600">
                      {formatDistance(mistri.distanceKm, isBn)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">{isBn ? 'মজুরি / পারিশ্রমিক' : 'Estimated Charge'}</span>
                  <span className="font-bold text-slate-900 text-sm">{formatBDT(mistri.baseCharge, isBn)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/mistri/${mistri.id}`}>
                    <Button variant="outline" size="sm">
                      {t('common.view_details')}
                    </Button>
                  </Link>
                  <Link href={`/bookings/new/${mistri.id}`}>
                    <Button size="sm">
                      {t('booking.book_now')}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Mistri Onboarding Callout Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <Badge variant="warning" className="bg-amber-400/20 text-amber-300 border-amber-400/30">
              {isBn ? '👷‍♂️ মিস্ত্রীদের জন্য' : '👷‍♂️ For Skilled Workers'}
            </Badge>
            <h3 className="text-xl sm:text-2xl font-bold">
              {isBn ? 'আপনি কি দক্ষ মিস্ত্রী? mistri-তে যোগ দিয়ে আয় বাড়ান!' : 'Are you a skilled worker? Join mistri and grow your earnings!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {isBn 
                ? 'আপনার এনআইডি কার্ড দিয়ে ফ্রিতে রেজিস্ট্রেশন করুন। ভেরিফিকেশন সম্পন্ন হলেই আপনার এলাকার কাস্টমারদের থেকে সরাসরি কাজের অনুরোধ পাবেন।'
                : 'Register free with your NID card. Get verified by admin to receive job requests directly from nearby customers.'}
            </p>
          </div>
          <Link href="/register?role=mistri">
            <Button variant="primary" size="lg" className="shrink-0 bg-blue-500 hover:bg-blue-600 shadow-md">
              {isBn ? 'মিস্ত্রী হিসেবে যোগ দিন' : 'Register as a Mistri'}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

