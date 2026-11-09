'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Zap, Wrench, Paintbrush, Hammer, Home, Axe, 
  Armchair, ShieldAlert, Layers, Maximize, Users, 
  MoreHorizontal, ChevronRight, ArrowRight 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toBanglaNumber } from '@/lib/utils'

export default function CategoriesDirectoryPage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const categories = [
    {
      id: '1',
      name_bn: 'ইলেকট্রিক্যাল কাজ',
      name_en: 'Electrical Services',
      slug: 'electrical-services',
      icon: Zap,
      mistriCount: 78,
      subcategories: [
        'বাসা-বাড়ির ওয়্যারিং', 'ফ্যান ও লাইটিং ফিটিং', 'সুইচ ও সকেট মেরামত', 
        'সার্কিট ব্রেকার ও ডিবি বোর্ড', 'আইপিএস ও জেনারেটর সংযোগ'
      ],
    },
    {
      id: '2',
      name_bn: 'প্লাম্বিং সার্ভিস',
      name_en: 'Plumbing Services',
      slug: 'plumbing-services',
      icon: Wrench,
      mistriCount: 54,
      subcategories: [
        'পাইপ ফিটিং ও মেরামত', 'পানির মোটর ও পাম্প মেরামত', 
        'স্যানিটারি ও বাথরুম ফিটিংস', 'পানির ট্যাংক পরিষ্কার', 'পাইপলাইন লিকেজ সমাধান'
      ],
    },
    {
      id: '3',
      name_bn: 'রং করার কাজ',
      name_en: 'Painting Services',
      slug: 'painting-services',
      icon: Paintbrush,
      mistriCount: 42,
      subcategories: [
        'ঘরের ভেতরের দেয়াল রং', 'বাইরের দেয়াল ও ওয়েদারকোট', 
        'পুটিং ও প্রাইমার কাজ', 'কাঠের বার্নিশ ও পলিশ'
      ],
    },
    {
      id: '4',
      name_bn: 'রাজমিস্ত্রীর কাজ',
      name_en: 'Masonry Services',
      slug: 'masonry-services',
      icon: Hammer,
      mistriCount: 65,
      subcategories: [
        'ইট গাঁথুনি ও প্লাস্টার', 'টাইলস ও মার্বেল ফিটিংস', 
        'ছাদ ঢালাই ও কংক্রিট কাজ', 'বাউন্ডারি ওয়াল নির্মাণ'
      ],
    },
    {
      id: '5',
      name_bn: 'ঘরের টিনের কাজ',
      name_en: 'Tin Roofing Services',
      slug: 'tin-roofing-services',
      icon: Home,
      mistriCount: 31,
      subcategories: [
        'টিনশেড নির্মাণ', 'টিনের চাল মেরামত ও লিকেজ বন্ধ', 'স্টিল ট্রাস কাজ'
      ],
    },
    {
      id: '6',
      name_bn: 'কাঠের কাজ',
      name_en: 'Carpentry Services',
      slug: 'carpentry-services',
      icon: Axe,
      mistriCount: 39,
      subcategories: [
        'দরজা-জানালার ফ্রেম', 'কাঠের সিলিং ডিজাইন', 'মডুলার কিচেন ক্যাবিনেট'
      ],
    },
    {
      id: '7',
      name_bn: 'ফার্নিচারের কাজ',
      name_en: 'Furniture Services',
      slug: 'furniture-services',
      icon: Armchair,
      mistriCount: 28,
      subcategories: [
        'ফার্নিচার অ্যাসেম্বলি', 'সোফা রিপেয়ার ও পলিশ', 'কাস্টম খাট ও ওয়ারড্রব'
      ],
    },
    {
      id: '8',
      name_bn: 'এঙ্গেল মিস্ত্রী ও গ্রিল',
      name_en: 'Metal Fabrication',
      slug: 'metal-fabrication',
      icon: ShieldAlert,
      mistriCount: 22,
      subcategories: [
        'জানালা ও বারান্দার গ্রিল', 'মেইন গেট ও কলাপসিবল গেট', 'মেটাল রেলিং ও ওয়েল্ডিং'
      ],
    },
    {
      id: '9',
      name_bn: 'থাই গ্লাস ও অ্যালুমিনিয়াম',
      name_en: 'Thai Glass & Aluminium',
      slug: 'thai-glass-aluminium',
      icon: Layers,
      mistriCount: 19,
      subcategories: [
        'থাই স্লাইডিং জানালা', 'গ্লাস ডোর ফিটিং', 'অ্যালুমিনিয়াম পার্টিশন'
      ],
    },
    {
      id: '10',
      name_bn: 'ঘরের সিলিং কাজ',
      name_en: 'Ceiling Services',
      slug: 'ceiling-services',
      icon: Maximize,
      mistriCount: 16,
      subcategories: [
        'ফলস সিলিং ডিজাইন', 'জিপসাম সিলিং', 'পিভিসি সিলিং'
      ],
    },
    {
      id: '11',
      name_bn: 'দৈনিক লেবার',
      name_en: 'Daily Labour Services',
      slug: 'daily-labour',
      icon: Users,
      mistriCount: 45,
      subcategories: [
        'নির্মাণ কাজের হেল্পার', 'মালামাল লোড-আনলোড', 'বাসা বদল হেল্পার', 'বাগান পরিষ্কার'
      ],
    },
    {
      id: '12',
      name_bn: 'অন্যান্য সেবা',
      name_en: 'Other Services',
      slug: 'other-services',
      icon: MoreHorizontal,
      mistriCount: 25,
      subcategories: [
        'এসি সার্ভিসিং', 'সিসিটিভি ক্যামেরা ইনস্টলেশন', 'হোম অ্যাপ্লায়েন্স মেরামত'
      ],
    },
  ]

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

      {/* Categories Grid - Pure Black & White Skeuomorphic */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <Card key={cat.id} className="p-5 flex flex-col justify-between skeuo-surface border-stone-300 hover:border-black hover:shadow-lg transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-300 skeuo-btn-light bg-stone-100 text-stone-900 transition-all group-hover:bg-stone-900 group-hover:text-white group-hover:border-black group-hover:scale-105">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="neutral" className="skeuo-pill bg-stone-900 text-white text-[11px] font-bold px-2.5 py-0.5">
                    {toBanglaNumber(cat.mistriCount)} {isBn ? 'জন সক্রিয়' : 'available'}
                  </Badge>
                </div>

                <div>
                  <h2 className="text-base font-bold text-stone-900 group-hover:underline transition-colors">
                    {isBn ? cat.name_bn : cat.name_en}
                  </h2>
                  <p className="text-xs text-stone-500">{cat.name_en}</p>
                </div>

                {/* Subcategories preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.subcategories.map((sub, i) => (
                    <Link 
                      key={i} 
                      href={`/search?category=${cat.slug}&subcat=${encodeURIComponent(sub)}`}
                      className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[11px] font-semibold text-stone-800 border border-stone-200 transition-colors"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
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
    </div>
  )
}
