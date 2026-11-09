'use client'

import React, { useState, useEffect } from 'react'
import { 
  Layers, Plus, Trash2, Check, X, 
  ChevronDown, ChevronRight, Eye, EyeOff
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toBanglaNumber } from '@/lib/utils'
import { DEFAULT_CATEGORIES, CategoryOption, SubcategoryOption } from '@/lib/categories'

export default function AdminCategoriesPage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [categories, setCategories] = useState<CategoryOption[]>(DEFAULT_CATEGORIES)
  const [isLoading, setIsLoading] = useState(false)
  const [expandedCatId, setExpandedCatId] = useState<string | null>('electrical-services')
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newCatBn, setNewCatBn] = useState('')
  const [newCatEn, setNewCatEn] = useState('')
  const [newCatSlug, setNewCatSlug] = useState('')

  // Add new subcategory state
  const [targetCatIdForSub, setTargetCatIdForSub] = useState<string | null>(null)
  const [newSubBn, setNewSubBn] = useState('')
  const [newSubEn, setNewSubEn] = useState('')

  // Load categories from API on mount
  useEffect(() => {
    async function loadCategories() {
      setIsLoading(true)
      try {
        const res = await fetch('/api/admin/categories')
        const data = await res.json()
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories)
        }
      } catch (err) {
        console.warn('Failed to load live categories:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadCategories()
  }, [])

  const toggleCategoryActive = async (catId: string) => {
    // Optimistic UI update
    setCategories(prev =>
      prev.map(c => c.id === catId || c.slug === catId ? { ...c, is_active: !c.is_active } : c)
    )

    try {
      await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_active',
          type: 'category',
          categoryId: catId,
        }),
      })
    } catch (err) {
      console.warn('Failed to toggle category active status:', err)
    }
  }

  const toggleSubcategoryActive = async (catId: string, subId: string) => {
    setCategories(prev =>
      prev.map(c => {
        if (c.id !== catId && c.slug !== catId) return c
        return {
          ...c,
          subcategories: c.subcategories.map(s => s.id === subId || s.slug === subId ? { ...s, is_active: !s.is_active } : s)
        }
      })
    )

    try {
      await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_active',
          type: 'subcategory',
          categoryId: catId,
          subcategoryId: subId,
        }),
      })
    } catch (err) {
      console.warn('Failed to toggle subcategory status:', err)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatBn || !newCatEn) return

    const slug = newCatSlug || newCatEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'category',
          name_bn: newCatBn,
          name_en: newCatEn,
          slug,
        }),
      })
      const data = await res.json()
      if (data.success && data.categories) {
        setCategories(data.categories)
      } else {
        const fallbackNew: CategoryOption = {
          id: slug,
          name_bn: newCatBn,
          name_en: newCatEn,
          slug,
          icon: 'Layers',
          display_order: categories.length + 1,
          is_active: true,
          subcategories: [],
        }
        setCategories(prev => [...prev, fallbackNew])
      }
    } catch {
      // fallback local update
    }

    setNewCatBn('')
    setNewCatEn('')
    setNewCatSlug('')
    setIsAddModalOpen(false)
  }

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetCatIdForSub || !newSubBn || !newSubEn) return

    const subSlug = newSubEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subcategory',
          categoryId: targetCatIdForSub,
          name_bn: newSubBn,
          name_en: newSubEn,
          slug: subSlug,
        }),
      })
      const data = await res.json()
      if (data.success && data.categories) {
        setCategories(data.categories)
      } else {
        const newSub: SubcategoryOption = {
          id: subSlug,
          name_bn: newSubBn,
          name_en: newSubEn,
          slug: subSlug,
          is_active: true,
        }
        setCategories(prev =>
          prev.map(c => (c.id === targetCatIdForSub || c.slug === targetCatIdForSub) ? { ...c, subcategories: [...c.subcategories, newSub] } : c)
        )
      }
    } catch {
      // fallback
    }

    setNewSubBn('')
    setNewSubEn('')
    setTargetCatIdForSub(null)
  }

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm(isBn ? 'আপনি কি নিশ্চিত যে এই ক্যাটাগরিটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this category?')) return

    try {
      const res = await fetch(`/api/admin/categories?type=category&categoryId=${catId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success && data.categories) {
        setCategories(data.categories)
      } else {
        setCategories(prev => prev.filter(c => c.id !== catId && c.slug !== catId))
      }
    } catch {
      setCategories(prev => prev.filter(c => c.id !== catId && c.slug !== catId))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {isBn ? 'সার্ভিস ক্যাটাগরি ও সাব-ক্যাটাগরি পরিচালনা' : 'Service Categories & Subcategories'}
          </h1>
          <p className="text-xs text-stone-600">
            {isBn 
              ? 'এডমিন দ্বারা নির্ধারিত ক্যাটাগরি ও সাব-ক্যাটাগরি সমূহ মিস্ত্রী অনবোর্ডিং এবং কাস্টমার অ্যাপে সরাসরি প্রদর্শিত হয়' 
              : 'Configure service taxonomies, add new skills, and manage subcategories'}
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => setIsAddModalOpen(true)}
          className="skeuo-btn-dark font-semibold text-xs"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span>{isBn ? 'নতুন ক্যাটাগরি যোগ করুন' : 'Add New Category'}</span>
        </Button>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const isExpanded = expandedCatId === cat.id || expandedCatId === cat.slug
          const catKey = cat.id || cat.slug
          return (
            <Card key={catKey} className="p-0 overflow-hidden border-stone-300 shadow-xs">
              {/* Category Header Row */}
              <div className="flex items-center justify-between p-4 bg-white hover:bg-stone-50 transition-colors">
                <button
                  type="button"
                  onClick={() => setExpandedCatId(isExpanded ? null : catKey)}
                  className="flex items-center gap-3 text-left flex-1"
                >
                  <div className={`p-2 rounded-xl border ${cat.is_active ? 'bg-stone-900 text-white border-black' : 'bg-stone-100 text-stone-400 border-stone-200'}`}>
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900">
                        {isBn ? cat.name_bn : cat.name_en}
                      </span>
                      <span className="text-xs text-stone-400">({cat.name_en})</span>
                      <Badge variant="neutral" className={`text-[10px] ${cat.is_active ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-600'}`}>
                        {cat.is_active ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-stone-600">
                      {toBanglaNumber(cat.subcategories.length)} {isBn ? 'টি সাব-ক্যাটাগরি সংযুক্ত' : 'subcategories'} • স্লাগ: <code className="font-mono text-[10px] bg-stone-100 px-1 py-0.5 rounded">{cat.slug}</code>
                    </span>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCategoryActive(catKey)}
                    className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                      cat.is_active ? 'border-stone-300 bg-stone-100 text-stone-800 hover:bg-stone-200' : 'border-stone-300 bg-stone-800 text-white hover:bg-stone-900'
                    }`}
                    title={cat.is_active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                  >
                    {cat.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    onClick={() => setTargetCatIdForSub(catKey)}
                    className="p-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="সাব-ক্যাটাগরি যোগ করুন"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-[11px]">{isBn ? 'সাব-ক্যাটাগরি' : 'Subcategory'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteCategory(catKey)}
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs transition-colors cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedCatId(isExpanded ? null : catKey)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Subcategories Collapsible Section */}
              {isExpanded && (
                <div className="border-t border-stone-200 bg-stone-50 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                    <span>{isBn ? 'সাব-ক্যাটাগরি সমূহ (এডমিন নিয়ন্ত্রিত)' : 'Subcategories'}</span>
                    <button
                      onClick={() => setTargetCatIdForSub(catKey)}
                      className="text-stone-900 hover:underline flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>{isBn ? 'নতুন সাব-ক্যাটাগরি যোগ করুন' : 'Add Subcategory'}</span>
                    </button>
                  </div>

                  {cat.subcategories.length === 0 ? (
                    <div className="text-center py-4 text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
                      {isBn ? 'এখনও কোনো সাব-ক্যাটাগরি যুক্ত করা হয়নি' : 'No subcategories added yet'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {cat.subcategories.map((sub) => (
                        <div
                          key={sub.id || sub.slug}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-stone-300 bg-white text-xs shadow-2xs"
                        >
                          <div>
                            <p className="font-bold text-stone-900">{isBn ? sub.name_bn : sub.name_en}</p>
                            <p className="text-[10px] text-stone-500">{sub.name_en}</p>
                          </div>
                          <button
                            onClick={() => toggleSubcategoryActive(catKey, sub.id || sub.slug)}
                            className={`p-1 rounded-md text-[10px] font-bold cursor-pointer ${
                              sub.is_active ? 'text-white bg-stone-900' : 'text-stone-500 bg-stone-200'
                            }`}
                          >
                            {sub.is_active ? (isBn ? 'অন' : 'ON') : (isBn ? 'অফ' : 'OFF')}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl border-stone-300">
            <h3 className="text-base font-bold text-stone-900">
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
                <Button size="sm" type="submit" className="skeuo-btn-dark">
                  {isBn ? 'সংরক্ষণ করুন' : 'Save'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {targetCatIdForSub && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl border-stone-300">
            <h3 className="text-base font-bold text-stone-900">
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
                <Button size="sm" type="submit" className="skeuo-btn-dark">
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
