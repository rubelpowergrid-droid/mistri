'use client'

import React, { useState } from 'react'
import { 
  Layers, Plus, Edit2, Trash2, Check, X, 
  ArrowUpDown, ChevronDown, ChevronRight, Zap, 
  Wrench, Paintbrush, Hammer, Home, Eye, EyeOff
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toBanglaNumber } from '@/lib/utils'

interface Subcategory {
  id: string
  name_bn: string
  name_en: string
  slug: string
  is_active: boolean
}

interface Category {
  id: string
  name_bn: string
  name_en: string
  slug: string
  icon: string
  display_order: number
  is_active: boolean
  subcategories: Subcategory[]
}

export default function AdminCategoriesPage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [categories, setCategories] = useState<Category[]>([
    {
      id: 'cat-1',
      name_bn: 'ইলেকট্রিক্যাল কাজ',
      name_en: 'Electrical Services',
      slug: 'electrical-services',
      icon: 'Zap',
      display_order: 1,
      is_active: true,
      subcategories: [
        { id: 'sub-1', name_bn: 'বাসা-বাড়ির ওয়্যারিং', name_en: 'House Wiring', slug: 'house-wiring', is_active: true },
        { id: 'sub-2', name_bn: 'ফ্যান ও লাইটিং ফিটিং', name_en: 'Fan & Light Fitting', slug: 'fan-light-fitting', is_active: true },
        { id: 'sub-3', name_bn: 'সুইচ ও সকেট মেরামত', name_en: 'Switch Socket Repair', slug: 'switch-socket-repair', is_active: true },
        { id: 'sub-4', name_bn: 'সার্কিট ব্রেকার ও ডিবি বোর্ড', name_en: 'Breaker & DB Board', slug: 'db-breaker', is_active: true },
      ],
    },
    {
      id: 'cat-2',
      name_bn: 'প্লাম্বিং সার্ভিস',
      name_en: 'Plumbing Services',
      slug: 'plumbing-services',
      icon: 'Wrench',
      display_order: 2,
      is_active: true,
      subcategories: [
        { id: 'sub-5', name_bn: 'পাইপ ফিটিং ও মেরামত', name_en: 'Pipe Fitting', slug: 'pipe-fitting', is_active: true },
        { id: 'sub-6', name_bn: 'পানির মোটর ও পাম্প মেরামত', name_en: 'Water Pump Repair', slug: 'water-pump-repair', is_active: true },
        { id: 'sub-7', name_bn: 'স্যানিটারি ও বাথরুম ফিটিংস', name_en: 'Sanitary Fitting', slug: 'sanitary-fitting', is_active: true },
      ],
    },
    {
      id: 'cat-3',
      name_bn: 'রং করার কাজ',
      name_en: 'Painting Services',
      slug: 'painting-services',
      icon: 'Paintbrush',
      display_order: 3,
      is_active: true,
      subcategories: [
        { id: 'sub-8', name_bn: 'ঘরের ভেতরের দেয়াল রং', name_en: 'Interior Wall Painting', slug: 'interior-paint', is_active: true },
        { id: 'sub-9', name_bn: 'বাইরের দেয়াল ও ওয়েদারকোট', name_en: 'Exterior Weathercoat', slug: 'exterior-paint', is_active: true },
        { id: 'sub-10', name_bn: 'কাঠের বার্নিশ ও পলিশ', name_en: 'Wood Polish', slug: 'wood-polish', is_active: true },
      ],
    },
    {
      id: 'cat-4',
      name_bn: 'রাজমিস্ত্রীর কাজ',
      name_en: 'Masonry Services',
      slug: 'masonry-services',
      icon: 'Hammer',
      display_order: 4,
      is_active: true,
      subcategories: [
        { id: 'sub-11', name_bn: 'ইট গাঁথুনি ও প্লাস্টার', name_en: 'Brick Laying', slug: 'brick-laying', is_active: true },
        { id: 'sub-12', name_bn: 'টাইলস ও মার্বেল ফিটিংস', name_en: 'Tiles Fitting', slug: 'tiles-fitting', is_active: true },
      ],
    },
  ])

  const [expandedCatId, setExpandedCatId] = useState<string | null>('cat-1')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newCatBn, setNewCatBn] = useState('')
  const [newCatEn, setNewCatEn] = useState('')
  const [newCatSlug, setNewCatSlug] = useState('')

  // Add new subcategory state
  const [targetCatIdForSub, setTargetCatIdForSub] = useState<string | null>(null)
  const [newSubBn, setNewSubBn] = useState('')
  const [newSubEn, setNewSubEn] = useState('')

  const toggleCategoryActive = (catId: string) => {
    setCategories(prev =>
      prev.map(c => c.id === catId ? { ...c, is_active: !c.is_active } : c)
    )
  }

  const toggleSubcategoryActive = (catId: string, subId: string) => {
    setCategories(prev =>
      prev.map(c => {
        if (c.id !== catId) return c
        return {
          ...c,
          subcategories: c.subcategories.map(s => s.id === subId ? { ...s, is_active: !s.is_active } : s)
        }
      })
    )
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatBn || !newCatEn) return
    const newCategory: Category = {
      id: 'cat-' + Date.now(),
      name_bn: newCatBn,
      name_en: newCatEn,
      slug: newCatSlug || newCatEn.toLowerCase().replace(/\s+/g, '-'),
      icon: 'Layers',
      display_order: categories.length + 1,
      is_active: true,
      subcategories: [],
    }
    setCategories(prev => [...prev, newCategory])
    setNewCatBn('')
    setNewCatEn('')
    setNewCatSlug('')
    setIsAddModalOpen(false)
  }

  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetCatIdForSub || !newSubBn || !newSubEn) return
    const newSub: Subcategory = {
      id: 'sub-' + Date.now(),
      name_bn: newSubBn,
      name_en: newSubEn,
      slug: newSubEn.toLowerCase().replace(/\s+/g, '-'),
      is_active: true,
    }
    setCategories(prev =>
      prev.map(c => c.id === targetCatIdForSub ? { ...c, subcategories: [...c.subcategories, newSub] } : c)
    )
    setNewSubBn('')
    setNewSubEn('')
    setTargetCatIdForSub(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isBn ? 'সার্ভিস ক্যাটাগরি ও সাব-ক্যাটাগরি পরিচালনা' : 'Service Categories & Subcategories'}
          </h1>
          <p className="text-xs text-slate-500">
            {isBn 
              ? 'নতুন সার্ভিস যুক্ত করুন, নাম পরিবর্তন করুন এবং সাব-ক্যাটাগরি নিয়ন্ত্রণ করুন' 
              : 'Configure service taxonomies, add new skills, and manage subcategories'}
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 font-semibold text-xs"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span>{isBn ? 'নতুন ক্যাটাগরি যোগ করুন' : 'Add New Category'}</span>
        </Button>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const isExpanded = expandedCatId === cat.id
          return (
            <Card key={cat.id} className="p-0 overflow-hidden border-slate-200">
              {/* Category Header Row */}
              <div className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/60 transition-colors">
                <button
                  type="button"
                  onClick={() => setExpandedCatId(isExpanded ? null : cat.id)}
                  className="flex items-center gap-3 text-left flex-1"
                >
                  <div className={`p-2 rounded-xl border ${cat.is_active ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {isBn ? cat.name_bn : cat.name_en}
                      </span>
                      <span className="text-xs text-slate-400">({cat.name_en})</span>
                      <Badge variant={cat.is_active ? 'success' : 'neutral'} className="text-[10px]">
                        {cat.is_active ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {toBanglaNumber(cat.subcategories.length)} {isBn ? 'টি সাব-ক্যাটাগরি সংযুক্ত' : 'subcategories'} • স্লাগ: <code className="font-mono text-[10px]">{cat.slug}</code>
                    </span>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCategoryActive(cat.id)}
                    className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 ${
                      cat.is_active ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}
                    title={cat.is_active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                  >
                    {cat.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    onClick={() => setTargetCatIdForSub(cat.id)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                    title="সাব-ক্যাটাগরি যোগ করুন"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-[11px]">{isBn ? 'সাব-ক্যাটাগরি' : 'Subcategory'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedCatId(isExpanded ? null : cat.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Subcategories Collapsible Section */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{isBn ? 'সাব-ক্যাটাগরি তালিকা' : 'Subcategories'}</span>
                    <button
                      onClick={() => setTargetCatIdForSub(cat.id)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-[11px]"
                    >
                      <Plus className="h-3 w-3" />
                      <span>{isBn ? 'নতুন সাব-ক্যাটাগরি যোগ করুন' : 'Add Subcategory'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {cat.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{isBn ? sub.name_bn : sub.name_en}</p>
                          <p className="text-[10px] text-slate-400">{sub.name_en}</p>
                        </div>
                        <button
                          onClick={() => toggleSubcategoryActive(cat.id, sub.id)}
                          className={`p-1 rounded-md text-[10px] font-bold ${
                            sub.is_active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-100'
                          }`}
                        >
                          {sub.is_active ? (isBn ? 'অন' : 'ON') : (isBn ? 'অফ' : 'OFF')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              {isBn ? 'নতুন সার্ভিস ক্যাটাগরি যুক্ত করুন' : 'Add New Category'}
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-3">
              <Input
                id="catBn"
                label={isBn ? 'ক্যাটাগরির নাম (বাংলা)' : 'Category Name (Bengali)'}
                placeholder="যেমন: এয়ার কন্ডিশনার সার্ভিস"
                value={newCatBn}
                onChange={(e) => setNewCatBn(e.target.value)}
                required
              />
              <Input
                id="catEn"
                label={isBn ? 'ক্যাটাগরির নাম (English)' : 'Category Name (English)'}
                placeholder="e.g. AC Services"
                value={newCatEn}
                onChange={(e) => setNewCatEn(e.target.value)}
                required
              />
              <Input
                id="catSlug"
                label={isBn ? 'ইউআরএল স্লাগ (Slug)' : 'URL Slug'}
                placeholder="ac-services"
                value={newCatSlug}
                onChange={(e) => setNewCatSlug(e.target.value)}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
                  {isBn ? 'বাতিল' : 'Cancel'}
                </Button>
                <Button size="sm" type="submit">
                  {isBn ? 'সংরক্ষণ করুন' : 'Save'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {targetCatIdForSub && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              {isBn ? 'নতুন সাব-ক্যাটাগরি যুক্ত করুন' : 'Add New Subcategory'}
            </h3>
            <form onSubmit={handleAddSubcategory} className="space-y-3">
              <Input
                id="subBn"
                label={isBn ? 'সাব-ক্যাটাগরির নাম (বাংলা)' : 'Subcategory Name (Bengali)'}
                placeholder="যেমন: গ্যাস রিফিল ও লিক মেরামত"
                value={newSubBn}
                onChange={(e) => setNewSubBn(e.target.value)}
                required
              />
              <Input
                id="subEn"
                label={isBn ? 'সাব-ক্যাটাগরির নাম (English)' : 'Subcategory Name (English)'}
                placeholder="e.g. Gas Refill & Leak Fix"
                value={newSubEn}
                onChange={(e) => setNewSubEn(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setTargetCatIdForSub(null)}>
                  {isBn ? 'বাতিল' : 'Cancel'}
                </Button>
                <Button size="sm" type="submit">
                  {isBn ? 'সংরক্ষণ করুন' : 'Save'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
