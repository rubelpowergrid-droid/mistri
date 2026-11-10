'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Star, MapPin, Wrench, Trash2, ArrowRight, ShieldCheck } from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBDT, formatDistance, toBanglaNumber } from '@/lib/utils'
import { MISTRI_DIRECTORY } from '@/app/api/mistris/search/route'

export default function FavoritesPage() {
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [favorites, setFavorites] = useState<any[]>([])

  useEffect(() => {
    try {
      const savedIds = JSON.parse(localStorage.getItem('mistri_favs') || '[]')
      if (savedIds.length === 0) {
        setFavorites([])
        return
      }
      fetch('/api/mistris/search')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            const matched = savedIds
              .map((id: string) => data.data.find((m: any) => m.id === id))
              .filter(Boolean)
            setFavorites(matched)
          }
        })
        .catch(() => {})
    } catch {}
  }, [])

  const removeFavorite = (id: string) => {
    const next = favorites.filter(f => f.id !== id)
    setFavorites(next)
    try {
      localStorage.setItem('mistri_favs', JSON.stringify(next.map(f => f.id)))
    } catch {}
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
            <span>{isBn ? 'পছন্দের মিস্ত্রী তালিকা (Favorites)' : 'Favorite Professionals'}</span>
          </h1>
          <p className="text-xs text-slate-500">
            {isBn 
              ? 'আপনার সংরক্ষিত দক্ষ মিস্ত্রীদের তালিকা, যেকোনো সময় সরাসরি রি-বুকিং করুন' 
              : 'Your saved professionals for quick rebooking and contact'}
          </p>
        </div>

        <Badge variant="primary" className="text-xs px-3 py-1 font-bold">
          {toBanglaNumber(favorites.length)} {isBn ? 'জন সংরক্ষিত' : 'saved'}
        </Badge>
      </div>

      {favorites.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Heart className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {isBn ? 'পছন্দের তালিকায় কোনো মিস্ত্রী নেই' : 'No Favorite Professionals Yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isBn 
              ? 'সার্চ পেজ থেকে যেকোনো পছন্দের মিস্ত্রীর প্রোফাইলের হার্ট আইকনে ক্লিক করে সংরক্ষণ করুন।' 
              : 'Click the heart icon on any professional card to save them here for quick access.'}
          </p>
          <Link href="/search">
            <Button size="sm">{isBn ? 'মিস্ত্রী খুঁজুন' : 'Explore Professionals'}</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((mistri) => (
            <Card key={mistri.id} className="p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={mistri.avatar}
                    alt={mistri.name_bn}
                    className="h-16 w-16 rounded-2xl object-cover border border-slate-200"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white" title="Admin Verified">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" className="text-[10px] px-2 py-0.5">
                      {isBn ? mistri.category_name_bn : mistri.category_name_en}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {mistri.average_rating} ({toBanglaNumber(mistri.total_reviews)})
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    <Link href={`/mistri/${mistri.id}`}>{mistri.name_bn}</Link>
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{mistri.professional_title}</p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-0.5">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3 text-blue-600" />
                      {mistri.upazila_bn}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-600">
                      {formatDistance(mistri.distance_km, isBn)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">{isBn ? 'মজুরি' : 'Charge'}</span>
                  <span className="font-bold text-slate-900 text-sm">{formatBDT(mistri.base_charge, isBn)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeFavorite(mistri.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-50 transition-colors"
                    title="তালিকা থেকে বাদ দিন"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Link href={`/bookings/new/${mistri.id}`}>
                    <Button size="sm" className="font-bold text-xs">
                      {t('booking.book_now')}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

