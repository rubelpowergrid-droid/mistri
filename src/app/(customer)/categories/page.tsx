'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import { 
  Zap, Wrench, Paintbrush, Hammer, Home, Axe, 
  Armchair, ShieldAlert, Layers, Maximize, Users, 
  MoreHorizontal, Scissors, Truck, Sparkles, Cpu,
  Flame, Tv, Settings, Package, Lightbulb, Shield,
  ArrowRight, Loader2
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toBanglaNumber } from '@/lib/utils'

const ICON_MAP: Record<string, any> = {
  Zap,
  Wrench,
  Paintbrush,
  Hammer,
  Home,
  Axe,
  Armchair,
  ShieldAlert,
  Layers,
  Maximize,
  Users,
  Scissors,
  Truck,
  Sparkles,
  Cpu,
  Flame,
  Tv,
  Settings,
  Package,
  Lightbulb,
  Shield,
  MoreHorizontal,
}

function getCategoryIcon(iconName?: string) {
  if (!iconName) return Layers
  if (ICON_MAP[iconName]) return ICON_MAP[iconName]
  const match = (LucideIcons as Record<string, any>)[iconName]
  if (match && (typeof match === 'function' || typeof match === 'object')) {
    return match
  }
  return Layers
}

export default function CategoriesDirectoryPage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/categories', { cache: 'no-store' })
        const json = await res.json()
        if (json.success && Array.isArray(json.categories)) {
          setCategories(json.categories.filter((c: any) => c.is_active !== false))
        }
      } catch (err) {
        console.error('Failed to load categories:', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          {isBn ? 'সকল সার্ভিস ও কাজের ধরন' : 'All Service Categories'}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          {isBn 
            ? 'আপনার প্রয়োজনীয় সেবাটি নির্বাচন করুন এবং আপনার এলাকার দক্ষ মিস্ত্রীদের তালিকা দেখুন' 
            : 'Select the service you require to discover verified local professionals'}
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 h-44 animate-pulse skeuo-surface border-stone-300 flex items-center justify-center">
              <div className="flex items-center gap-2 text-xs text-stone-500 font-semibold">
                <Loader2 className="h-4 w-4 animate-spin text-[#2c7865]" />
                <span>{isBn ? 'ক্যাটাগরি লোড হচ্ছে...' : 'Loading categories...'}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Categories Grid - Pure Black & White Skeuomorphic */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon)
            const count = cat.mistriCount || 0
            const subList: string[] = Array.isArray(cat.subcategories) ? cat.subcategories : []

            return (
              <Card key={cat.id || cat.slug} className="p-5 flex flex-col justify-between skeuo-surface border-stone-300 hover:border-black hover:shadow-lg transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-300 skeuo-btn-light bg-stone-100 text-stone-900 transition-all group-hover:bg-stone-900 group-hover:text-white group-hover:border-black group-hover:scale-105">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="neutral" className="skeuo-pill bg-stone-900 text-white text-[11px] font-bold px-2.5 py-0.5">
                      {toBanglaNumber(count)} {isBn ? 'জন সক্রিয়' : 'available'}
                    </Badge>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-stone-900 group-hover:underline transition-colors">
                      {isBn ? cat.name_bn : cat.name_en}
                    </h2>
                    <p className="text-xs text-stone-500">{cat.name_en}</p>
                  </div>

                  {/* Subcategories preview */}
                  {subList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {subList.slice(0, 5).map((sub: string, i: number) => (
                        <Link 
                          key={i} 
                          href={`/search?category=${cat.slug}&subcat=${encodeURIComponent(sub)}`}
                          className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[11px] font-semibold text-stone-800 border border-stone-200 transition-colors"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-stone-200 flex items-center justify-between">
                  <Link
                    href={`/search?category=${cat.slug}`}
                    className="text-xs font-bold text-stone-900 hover:underline flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{isBn ? 'মিস্ত্রী খুঁজুন' : 'Find Professionals'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
