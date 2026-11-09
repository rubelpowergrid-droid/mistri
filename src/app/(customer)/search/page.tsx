'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useSearchParams, useRouter } from 'next/navigation'

const OsmMapView = dynamic(
  () => import('@/components/maps/osm-map-view').then((mod) => mod.OsmMapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 w-full rounded-2xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
        <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span>ওপেনস্ট্রিটম্যাপ লোড হচ্ছে...</span>
      </div>
    ),
  }
)
import { 
  Search, Filter, MapPin, Star, ShieldCheck, 
  Calendar, Wrench, ArrowUpDown, SlidersHorizontal, 
  X, Check, Heart, Scale, Map as MapIcon, List,
  DollarSign, CheckCircle2, ChevronRight, ArrowRight
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatBDT, formatDistance, toBanglaNumber } from '@/lib/utils'

interface MistriResult {
  id: string
  name_bn: string
  name_en: string
  avatar_url?: string
  professional_title: string
  category_slug: string
  category_name_bn: string
  category_name_en: string
  subcategories: string[]
  district: string
  district_bn: string
  upazila: string
  upazila_bn: string
  experience_years: number
  average_rating: number
  total_reviews: number
  total_completed_jobs: number
  base_charge: number
  charge_type: string
  is_available: boolean
  available_today: boolean
  available_tomorrow: boolean
  is_verified: true
  distance_km: number
  avatar: string
  bio: string
}

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  // Query state
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [selectedSubcat, setSelectedSubcat] = useState(searchParams.get('subcat') || 'all')
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || 'all')
  const [selectedRating, setSelectedRating] = useState<number>(Number(searchParams.get('rating') || 0))
  const [selectedExp, setSelectedExp] = useState<number>(Number(searchParams.get('exp') || 0))
  const [selectedJobs, setSelectedJobs] = useState<number>(Number(searchParams.get('jobs') || 0))
  const [maxDistance, setMaxDistance] = useState<number>(Number(searchParams.get('distance') || 50))
  const [maxPrice, setMaxPrice] = useState<number>(Number(searchParams.get('maxPrice') || 2000))
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(searchParams.get('verified') === 'true')
  const [availableToday, setAvailableToday] = useState<boolean>(searchParams.get('today') === 'true')
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'nearest')
  
  // UI states
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [results, setResults] = useState<MistriResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Compare & Favorites local state
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])

  const categories = [
    { slug: 'all', name_bn: 'সকল ক্যাটাগরি', name_en: 'All Categories' },
    { slug: 'electrical-services', name_bn: 'ইলেকট্রিক্যাল কাজ', name_en: 'Electrical Services' },
    { slug: 'plumbing-services', name_bn: 'প্লাম্বিং সার্ভিস', name_en: 'Plumbing Services' },
    { slug: 'painting-services', name_bn: 'রং করার কাজ', name_en: 'Painting Services' },
    { slug: 'masonry-services', name_bn: 'রাজমিস্ত্রীর কাজ', name_en: 'Masonry Services' },
    { slug: 'tin-roofing-services', name_bn: 'ঘরের টিনের কাজ', name_en: 'Tin Roofing Services' },
    { slug: 'carpentry-services', name_bn: 'কাঠের কাজ', name_en: 'Carpentry Services' },
  ]

  // Fetch search results from API
  useEffect(() => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (selectedCategory !== 'all') params.set('category', selectedCategory)
    if (selectedSubcat !== 'all') params.set('subcat', selectedSubcat)
    if (selectedDistrict !== 'all') params.set('district', selectedDistrict)
    if (selectedRating > 0) params.set('rating', String(selectedRating))
    if (selectedExp > 0) params.set('exp', String(selectedExp))
    if (selectedJobs > 0) params.set('jobs', String(selectedJobs))
    if (maxDistance < 50) params.set('distance', String(maxDistance))
    if (maxPrice < 2000) params.set('maxPrice', String(maxPrice))
    if (verifiedOnly) params.set('verified', 'true')
    if (availableToday) params.set('today', 'true')
    params.set('sort', sortBy)

    fetch(`/api/mistris/search?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setResults(json.data)
        }
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [
    query, selectedCategory, selectedSubcat, selectedDistrict, 
    selectedRating, selectedExp, selectedJobs, maxDistance, 
    maxPrice, verifiedOnly, availableToday, sortBy
  ])

  // Load favorites & compare from localStorage
  useEffect(() => {
    try {
      const savedFavs = JSON.parse(localStorage.getItem('mistri_favs') || '[]')
      setFavoriteIds(savedFavs)
      const savedComp = JSON.parse(localStorage.getItem('mistri_compare') || '[]')
      setCompareIds(savedComp)
    } catch {}
  }, [])

  const toggleFavorite = (id: string) => {
    const next = favoriteIds.includes(id) 
      ? favoriteIds.filter(f => f !== id) 
      : [...favoriteIds, id]
    setFavoriteIds(next)
    localStorage.setItem('mistri_favs', JSON.stringify(next))
  }

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      const next = compareIds.filter(c => c !== id)
      setCompareIds(next)
      localStorage.setItem('mistri_compare', JSON.stringify(next))
    } else {
      if (compareIds.length >= 3) {
        alert(isBn ? 'সর্বোচ্চ ৩ জন মিস্ত্রীকে একসাথে তুলনা করা যাবে' : 'You can compare up to 3 professionals')
        return
      }
      const next = [...compareIds, id]
      setCompareIds(next)
      localStorage.setItem('mistri_compare', JSON.stringify(next))
    }
  }

  const clearAllFilters = () => {
    setQuery('')
    setSelectedCategory('all')
    setSelectedSubcat('all')
    setSelectedDistrict('all')
    setSelectedRating(0)
    setSelectedExp(0)
    setSelectedJobs(0)
    setMaxDistance(50)
    setMaxPrice(2000)
    setVerifiedOnly(false)
    setAvailableToday(false)
    setSortBy('nearest')
  }

  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedDistrict !== 'all',
    selectedRating > 0,
    selectedExp > 0,
    selectedJobs > 0,
    maxDistance < 50,
    maxPrice < 2000,
    verifiedOnly,
    availableToday,
  ].filter(Boolean).length

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Search Bar & View Modes */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex-1 flex items-center gap-2 px-2">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.search_placeholder')}
            className="w-full bg-transparent py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-3 justify-between sm:justify-start">
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterDrawerOpen(true)}
            className="sm:hidden text-xs font-semibold"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1 text-stone-900" />
            <span>{isBn ? 'ফিল্টার' : 'Filters'} ({toBanglaNumber(activeFiltersCount)})</span>
          </Button>

          {/* List vs Map View Switcher */}
          <div className="flex rounded-xl bg-stone-100 p-0.5 text-xs font-semibold border border-stone-200">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>{isBn ? 'তালিকা' : 'List'}</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'map' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span>{isBn ? 'ম্যাপ' : 'Map'}</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-stone-300 bg-white py-1.5 px-3 text-xs font-semibold text-stone-800 focus:border-black focus:outline-none"
            >
              <option value="nearest">{isBn ? 'সবচেয়ে কাছে (Nearest)' : 'Nearest First'}</option>
              <option value="highest_rated">{isBn ? 'সেরা রেটিং (Top Rated)' : 'Highest Rated'}</option>
              <option value="most_jobs">{isBn ? 'সর্বোচ্চ কাজ সম্পন্ন' : 'Most Completed Jobs'}</option>
              <option value="most_experienced">{isBn ? 'সবচেয়ে অভিজ্ঞ' : 'Most Experienced'}</option>
              <option value="price_low">{isBn ? 'কম খরচ থেকে বেশি' : 'Price: Low to High'}</option>
              <option value="price_high">{isBn ? 'বেশি খরচ থেকে কম' : 'Price: High to Low'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Compare Queue Pill (if items selected) */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 z-40 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-bounce-once">
          <Scale className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold">
            {toBanglaNumber(compareIds.length)} {isBn ? 'জন নির্বাচিত' : 'selected to compare'}
          </span>
          <Link href={`/compare?ids=${compareIds.join(',')}`}>
            <Button size="sm" className="skeuo-btn-dark bg-stone-900 hover:bg-black text-xs font-bold py-1 px-3">
              <span>{isBn ? 'তুলনা করুন' : 'Compare Now'}</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
          <button onClick={() => setCompareIds([])} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Content Layout (Sidebar + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block space-y-5">
          <Card className="p-5 space-y-5 border-stone-300 skeuo-surface">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-stone-900" />
                <h3 className="text-sm font-bold text-stone-900">{isBn ? 'ফিল্টার সমূহ' : 'Filters'}</h3>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-bold text-stone-900 hover:underline cursor-pointer"
                >
                  {isBn ? 'রিসেট' : 'Reset'}
                </button>
              )}
            </div>

            {/* Service Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">
                {isBn ? 'সার্ভিস ক্যাটাগরি' : 'Category'}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white py-2 px-3 text-xs text-stone-800 focus:border-black focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {isBn ? c.name_bn : c.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* District Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">
                {isBn ? 'জেলা' : 'District'}
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white py-2 px-3 text-xs text-stone-800 focus:border-black focus:outline-none"
              >
                <option value="all">{isBn ? 'সকল জেলা' : 'All Districts'}</option>
                <option value="Thakurgaon">{isBn ? 'ঠাকুরগাঁও' : 'Thakurgaon'}</option>
                <option value="Panchagarh">{isBn ? 'পঞ্চগড়' : 'Panchagarh'}</option>
                <option value="Dinajpur">{isBn ? 'দিনাজপুর' : 'Dinajpur'}</option>
              </select>
            </div>

            {/* Distance Slider */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-stone-700">{isBn ? 'দূরত্ব ব্যাসার্ধ' : 'Distance Radius'}</span>
                <span className="text-stone-900 font-bold bg-stone-100 px-2 py-0.5 rounded border border-stone-300">
                  {maxDistance >= 50 ? (isBn ? 'পুরো জেলা' : 'Entire District') : `${toBanglaNumber(maxDistance)} কিমি`}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-stone-900 cursor-pointer"
              />
            </div>

            {/* Rating Filter (Daraz-style) */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <label className="text-xs font-bold text-stone-700 block">
                {isBn ? 'গ্রাহক রেটিং' : 'Rating'}
              </label>
              <div className="space-y-1.5">
                {[5, 4, 3].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setSelectedRating(selectedRating === stars ? 0 : stars)}
                    className={`flex items-center justify-between w-full p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      selectedRating === stars ? 'bg-stone-900 text-white font-bold border border-black' : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < stars ? (selectedRating === stars ? 'fill-white text-white' : 'fill-stone-900 text-stone-900') : 'text-stone-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-[11px] font-semibold">{toBanglaNumber(stars)} {isBn ? 'স্টার ও উপরে' : '★ & above'}</span>
                    </div>
                    {selectedRating === stars && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Filter */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <label className="text-xs font-bold text-stone-700 block">
                {isBn ? 'কাজের অভিজ্ঞতা' : 'Experience'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[1, 3, 5, 10].map((exp) => (
                  <button
                    key={exp}
                    onClick={() => setSelectedExp(selectedExp === exp ? 0 : exp)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                      selectedExp === exp 
                        ? 'border-black bg-stone-900 text-white' 
                        : 'border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {toBanglaNumber(exp)}+ {isBn ? 'বছর' : 'Years'}
                  </button>
                ))}
              </div>
            </div>

            {/* Completed Jobs */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <label className="text-xs font-bold text-stone-700 block">
                {isBn ? 'সম্পন্ন করা কাজের সংখ্যা' : 'Completed Jobs'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[10, 50, 100].map((jobs) => (
                  <button
                    key={jobs}
                    onClick={() => setSelectedJobs(selectedJobs === jobs ? 0 : jobs)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                      selectedJobs === jobs 
                        ? 'border-black bg-stone-900 text-white' 
                        : 'border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {toBanglaNumber(jobs)}+ {isBn ? 'কাজ' : 'Jobs'}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles: Verified & Today */}
            <div className="space-y-2.5 pt-2 border-t border-stone-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-stone-900 focus:ring-black h-4 w-4 accent-stone-900"
                />
                <span>{isBn ? 'অ্যাডমিন ভেরিফাইড কারিগর' : 'Admin Verified Only'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                <input
                  type="checkbox"
                  checked={availableToday}
                  onChange={(e) => setAvailableToday(e.target.checked)}
                  className="rounded text-stone-900 focus:ring-black h-4 w-4 accent-stone-900"
                />
                <span>{isBn ? 'আজকেই প্রস্তুত (Available Today)' : 'Available Today'}</span>
              </label>
            </div>
          </Card>
        </aside>

        {/* RESULTS AREA */}
        <section className="lg:col-span-3 space-y-4">
          {/* Active Filter Badges */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">{isBn ? 'সক্রিয় ফিল্টার:' : 'Active:'}</span>
              {selectedCategory !== 'all' && (
                <Badge variant="primary" className="gap-1 py-1">
                  <span>{categories.find(c => c.slug === selectedCategory)?.name_bn}</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                </Badge>
              )}
              {selectedDistrict !== 'all' && (
                <Badge variant="primary" className="gap-1 py-1">
                  <span>{selectedDistrict}</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDistrict('all')} />
                </Badge>
              )}
              {selectedRating > 0 && (
                <Badge variant="warning" className="gap-1 py-1">
                  <span>{toBanglaNumber(selectedRating)}★ ও উপরে</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedRating(0)} />
                </Badge>
              )}
              {selectedExp > 0 && (
                <Badge variant="neutral" className="gap-1 py-1">
                  <span>{toBanglaNumber(selectedExp)}+ বছর অভিজ্ঞতা</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedExp(0)} />
                </Badge>
              )}
              {verifiedOnly && (
                <Badge variant="success" className="gap-1 py-1">
                  <span>ভেরিফাইড</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setVerifiedOnly(false)} />
                </Badge>
              )}
              <button onClick={clearAllFilters} className="text-red-600 font-bold hover:underline text-[11px] ml-1">
                {isBn ? 'সব মুছুন' : 'Clear All'}
              </button>
            </div>
          )}

          {/* Result Count Banner */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {isBn 
                ? `মোট ${toBanglaNumber(results.length)} জন কারিগর পাওয়া গেছে` 
                : `Showing ${results.length} professionals`}
            </span>
          </div>

          {/* MAP VIEW */}
          {viewMode === 'map' && (
            <Card className="p-4 space-y-3 bg-slate-900 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5 text-blue-400">
                  <MapPin className="h-4 w-4" />
                  {isBn ? 'জিপিএস ম্যাপ ভিউ (ঠাকুরগাঁও, পঞ্চগড় ও দিনাজপুর)' : 'GPS Map View'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {toBanglaNumber(results.length)} {isBn ? 'টি পিন প্রদর্শিত' : 'markers placed'}
                </span>
              </div>

              {/* Real OpenStreetMap Live Layer */}
              <div className="space-y-2">
                <OsmMapView
                  center={
                    selectedDistrict === 'Panchagarh'
                      ? [26.3333, 88.5500]
                      : selectedDistrict === 'Dinajpur'
                      ? [25.6279, 88.6332]
                      : [26.0333, 88.4667]
                  }
                  zoom={13}
                  customerLocation={{
                    latitude: 26.0333,
                    longitude: 88.4667,
                    address: isBn ? 'আপনার বর্তমান অবস্থান (ঠাকুরগাঁও সদর)' : 'Your Location (Thakurgaon Sadar)',
                  }}
                  radiusKm={maxDistance}
                  showRadius={true}
                  mistris={results.map((r) => ({
                    id: r.id,
                    name_bn: r.name_bn,
                    category_name_bn: r.category_name_bn,
                    distance_km: r.distance_km,
                    rating_avg: r.average_rating,
                    hourly_rate: r.base_charge,
                    avatar_url: r.avatar_url,
                  }))}
                  height="460px"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-1 px-1 pt-1">
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <span>💡 ম্যাপের যেকোনো মিস্ত্রী পিনে (🔧) ক্লিক করে বিস্তারিত বিবরণ দেখুন।</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    OpenStreetMap Live Tiles © ঠাকুরগাঁও, পঞ্চগড় ও দিনাজপুর
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* LIST VIEW (Results Cards) */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {results.map((mistri) => {
                const isFavorite = favoriteIds.includes(mistri.id)
                const isCompared = compareIds.includes(mistri.id)
                return (
                  <Card key={mistri.id} className="p-4 sm:p-5 hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      {/* Left: Avatar & Basic Information */}
                      <div className="flex items-start gap-3.5">
                        <div className="relative shrink-0">
                          <img
                            src={mistri.avatar}
                            alt={mistri.name_bn}
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-stone-300"
                          />
                          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-white border border-stone-700 shadow-xs" title="Admin Verified">
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="neutral" className="skeuo-pill bg-stone-900 text-white border-stone-800 text-[10px] px-2 py-0.5">
                              {isBn ? mistri.category_name_bn : mistri.category_name_en}
                            </Badge>
                            <span className="flex items-center gap-1 text-xs font-semibold text-stone-800">
                              <Star className="h-3.5 w-3.5 fill-stone-900 text-stone-900" />
                              {mistri.average_rating} ({toBanglaNumber(mistri.total_reviews)})
                            </span>
                            {mistri.available_today ? (
                              <span className="text-[10px] font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-300">
                                {isBn ? 'আজকে প্রস্তুত' : 'Available Today'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                                {isBn ? 'কালকে প্রস্তুত' : 'Available Tomorrow'}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-stone-900 hover:underline transition-colors">
                            <Link href={`/mistri/${mistri.id}`}>{mistri.name_bn}</Link>
                          </h3>

                          <p className="text-xs text-stone-600 font-medium">{mistri.professional_title}</p>

                          {/* Subcategory skill tags */}
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {mistri.subcategories.slice(0, 3).map((sub, i) => (
                              <span key={i} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium border border-stone-200">
                                {sub}
                              </span>
                            ))}
                            {mistri.subcategories.length > 3 && (
                              <span className="text-[10px] text-stone-400">+{mistri.subcategories.length - 3}</span>
                            )}
                          </div>

                          {/* Distance & Experience metrics */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600 pt-1">
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3.5 w-3.5 text-stone-700" />
                              {mistri.upazila_bn}, {mistri.district_bn}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                              {formatDistance(mistri.distance_km, isBn)}
                            </span>
                            <span>•</span>
                            <span>{toBanglaNumber(mistri.experience_years)} {isBn ? 'বছরের অভিজ্ঞতা' : 'yrs exp'}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-800">
                              {toBanglaNumber(mistri.total_completed_jobs)} {isBn ? 'টি কাজ সম্পন্ন' : 'jobs'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Pricing & Action Buttons */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-3 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 block">{isBn ? 'আনুমানিক প্রারম্ভিক মজুরি' : 'Starting Charge'}</span>
                          <span className="text-lg font-black text-slate-900">
                            {formatBDT(mistri.base_charge, isBn)}
                          </span>
                          <span className="text-[10px] text-slate-500 block">({mistri.charge_type})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Favorite Button */}
                          <button
                            type="button"
                            onClick={() => toggleFavorite(mistri.id)}
                            className={`p-2 rounded-xl border transition-colors ${
                              isFavorite 
                                ? 'bg-rose-50 text-rose-600 border-rose-200' 
                                : 'border-slate-200 hover:bg-slate-50 text-slate-400'
                            }`}
                            title={isFavorite ? 'পছন্দ থেকে সরান' : 'পছন্দে রাখুন'}
                          >
                            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-rose-600' : ''}`} />
                          </button>

                          {/* Compare Button */}
                          <button
                            type="button"
                            onClick={() => toggleCompare(mistri.id)}
                            className={`p-2 rounded-xl border transition-colors ${
                              isCompared 
                                ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold' 
                                : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                            }`}
                            title={isCompared ? 'তুলনা থেকে সরান' : 'তুলনা করুন'}
                          >
                            <Scale className="h-4 w-4" />
                          </button>

                          {/* Details / Book */}
                          <Link href={`/bookings/new/${mistri.id}`}>
                            <Button size="sm" className="px-4 font-semibold text-xs">
                              {t('booking.book_now')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}

              {/* Empty state */}
              {results.length === 0 && !isLoading && (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                  <Wrench className="h-10 w-10 text-slate-300 mx-auto" />
                  <h4 className="text-base font-bold text-slate-800">
                    {t('search.no_mistri_found')}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {isBn 
                      ? 'আপনার বর্তমান ফিল্টারের সাথে মিলে এমন কোনো মিস্ত্রী পাওয়া যায়নি। অনুসন্ধান দূরত্ব বৃদ্ধি করুন বা ফিল্টার পরিবর্তন করুন।'
                      : 'No professionals matched your current filter criteria. Try expanding search distance.'}
                  </p>
                  <Button variant="outline" size="sm" onClick={clearAllFilters}>
                    {isBn ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">{isBn ? 'ফিল্টার নির্বাচন' : 'Filters'}</h3>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">{isBn ? 'ক্যাটাগরি' : 'Category'}</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{isBn ? c.name_bn : c.name_en}</option>
                ))}
              </select>
            </div>

            {/* Distance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>{isBn ? 'দূরত্ব ব্যাসার্ধ' : 'Distance'}</span>
                <span className="font-bold text-stone-900">{toBanglaNumber(maxDistance)} কিমি</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-stone-900 cursor-pointer"
              />
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">{isBn ? 'ন্যূনতম রেটিং' : 'Rating'}</label>
              <div className="flex gap-2">
                {[3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setSelectedRating(selectedRating === stars ? 0 : stars)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      selectedRating === stars ? 'bg-stone-900 text-white border-black' : 'border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {toBanglaNumber(stars)}★+
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={clearAllFilters}>
                {isBn ? 'রিসেট' : 'Reset'}
              </Button>
              <Button className="flex-1" onClick={() => setIsFilterDrawerOpen(false)}>
                {isBn ? 'ফলাফল দেখুন' : 'Apply'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">অনুসন্ধান লোড হচ্ছে...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}

