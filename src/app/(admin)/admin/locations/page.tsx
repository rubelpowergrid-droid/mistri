'use client'

import React, { useState } from 'react'
import { MapPin, Plus, Check, X, Eye, EyeOff, Globe, ChevronRight } from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toBanglaNumber } from '@/lib/utils'

interface UpazilaItem {
  id: string
  name_bn: string
  name_en: string
  is_active: boolean
  areasCount: number
}

interface DistrictItem {
  id: string
  name_bn: string
  name_en: string
  is_active: boolean
  upazilas: UpazilaItem[]
}

export default function AdminLocationsPage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [districts, setDistricts] = useState<DistrictItem[]>([
    {
      id: 'dist-1',
      name_bn: 'ঠাকুরগাঁও',
      name_en: 'Thakurgaon',
      is_active: true,
      upazilas: [
        { id: 'up-1', name_bn: 'ঠাকুরগাঁও সদর', name_en: 'Thakurgaon Sadar', is_active: true, areasCount: 14 },
        { id: 'up-2', name_bn: 'পীরগঞ্জ', name_en: 'Pirganj', is_active: true, areasCount: 10 },
        { id: 'up-3', name_bn: 'রাণীশংকৈল', name_en: 'Ranisankail', is_active: true, areasCount: 8 },
        { id: 'up-4', name_bn: 'হরিপুর', name_en: 'Haripur', is_active: true, areasCount: 6 },
        { id: 'up-5', name_bn: 'বালিয়াডাঙ্গী', name_en: 'Baliadangi', is_active: true, areasCount: 8 },
      ],
    },
    {
      id: 'dist-2',
      name_bn: 'পঞ্চগড়',
      name_en: 'Panchagarh',
      is_active: true,
      upazilas: [
        { id: 'up-6', name_bn: 'পঞ্চগড় সদর', name_en: 'Panchagarh Sadar', is_active: true, areasCount: 10 },
        { id: 'up-7', name_bn: 'বোদা', name_en: 'Boda', is_active: true, areasCount: 10 },
        { id: 'up-8', name_bn: 'দেবীগঞ্জ', name_en: 'Debiganj', is_active: true, areasCount: 10 },
        { id: 'up-9', name_bn: 'আটোয়ারী', name_en: 'Atwari', is_active: true, areasCount: 6 },
        { id: 'up-10', name_bn: 'তেঁতুলিয়া', name_en: 'Tetulia', is_active: true, areasCount: 7 },
      ],
    },
    {
      id: 'dist-3',
      name_bn: 'দিনাজপুর',
      name_en: 'Dinajpur',
      is_active: true,
      upazilas: [
        { id: 'up-11', name_bn: 'দিনাজপুর সদর', name_en: 'Dinajpur Sadar', is_active: true, areasCount: 14 },
        { id: 'up-12', name_bn: 'বীরগঞ্জ', name_en: 'Birganj', is_active: true, areasCount: 11 },
        { id: 'up-13', name_bn: 'কাহারোল', name_en: 'Kaharole', is_active: true, areasCount: 6 },
        { id: 'up-14', name_bn: 'বোচাগঞ্জ', name_en: 'Bochaganj', is_active: true, areasCount: 6 },
        { id: 'up-15', name_bn: 'পার্বতীপুর', name_en: 'Parbatipur', is_active: true, areasCount: 10 },
      ],
    },
  ])

  const [selectedDistId, setSelectedDistId] = useState<string>('dist-1')
  const [isAddDistModalOpen, setIsAddDistModalOpen] = useState(false)
  const [newDistBn, setNewDistBn] = useState('')
  const [newDistEn, setNewDistEn] = useState('')

  const [isAddUpazilaModalOpen, setIsAddUpazilaModalOpen] = useState(false)
  const [newUpBn, setNewUpBn] = useState('')
  const [newUpEn, setNewUpEn] = useState('')

  const activeDistrict = districts.find(d => d.id === selectedDistId) || districts[0]

  const toggleDistrictActive = (distId: string) => {
    setDistricts(prev =>
      prev.map(d => d.id === distId ? { ...d, is_active: !d.is_active } : d)
    )
  }

  const toggleUpazilaActive = (distId: string, upId: string) => {
    setDistricts(prev =>
      prev.map(d => {
        if (d.id !== distId) return d
        return {
          ...d,
          upazilas: d.upazilas.map(u => u.id === upId ? { ...u, is_active: !u.is_active } : u)
        }
      })
    )
  }

  const handleAddDistrict = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDistBn || !newDistEn) return
    const newDist: DistrictItem = {
      id: 'dist-' + Date.now(),
      name_bn: newDistBn,
      name_en: newDistEn,
      is_active: true,
      upazilas: [],
    }
    setDistricts(prev => [...prev, newDist])
    setSelectedDistId(newDist.id)
    setNewDistBn('')
    setNewDistEn('')
    setIsAddDistModalOpen(false)
  }

  const handleAddUpazila = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUpBn || !newUpEn) return
    const newUp: UpazilaItem = {
      id: 'up-' + Date.now(),
      name_bn: newUpBn,
      name_en: newUpEn,
      is_active: true,
      areasCount: 0,
    }
    setDistricts(prev =>
      prev.map(d => d.id === selectedDistId ? { ...d, upazilas: [...d.upazilas, newUp] } : d)
    )
    setNewUpBn('')
    setNewUpEn('')
    setIsAddUpazilaModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isBn ? 'জেলা ও উপজেলা জিও-লোকেশন ব্যবস্থাপনা' : 'District & Upazila Geo Locations'}
          </h1>
          <p className="text-xs text-slate-500">
            {isBn 
              ? 'সার্ভিস এরিয়া সক্রিয়/নিষ্ক্রিয় করুন এবং কোড পরিবর্তন ছাড়াই নতুন জেলা সম্প্রসারণ করুন' 
              : 'Configure service coverage and expand to new districts without modifying code'}
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => setIsAddDistModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 font-semibold text-xs"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span>{isBn ? 'নতুন জেলা যুক্ত করুন' : 'Add New District'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* District Selector List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isBn ? 'পরিচালনাকৃত জেলা সমূহ' : 'Active Districts'}
          </h2>
          <div className="space-y-2">
            {districts.map((dist) => {
              const isSelected = dist.id === selectedDistId
              return (
                <div
                  key={dist.id}
                  onClick={() => setSelectedDistId(dist.id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="text-sm font-bold text-slate-900">
                        {isBn ? dist.name_bn : dist.name_en}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        {toBanglaNumber(dist.upazilas.length)} {isBn ? 'টি উপজেলা' : 'Upazilas'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleDistrictActive(dist.id)
                      }}
                      className={`p-1 rounded-md text-[10px] font-bold ${
                        dist.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {dist.is_active ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'অফ' : 'Off')}
                    </button>
                    <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected District's Upazilas & Areas */}
        <div className="md:col-span-2 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isBn ? activeDistrict.name_bn : activeDistrict.name_en} {isBn ? 'জেলার উপজেলা সমূহ' : 'Upazilas'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isBn ? 'এই জেলার অন্তর্ভুক্ত সকল উপজেলা ও ইউনিয়ন/ওয়ার্ড' : 'Upazilas and union areas under this district'}
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => setIsAddUpazilaModalOpen(true)}
                className="text-xs bg-slate-900 hover:bg-slate-800"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>{isBn ? 'উপজেলা যোগ করুন' : 'Add Upazila'}</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeDistrict.upazilas.map((up) => (
                <div
                  key={up.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white text-xs hover:border-slate-300 transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {isBn ? up.name_bn : up.name_en}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {up.name_en} • {toBanglaNumber(up.areasCount)} {isBn ? 'টি সংরক্ষিত এলাকা' : 'areas'}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleUpazilaActive(activeDistrict.id, up.id)}
                    className={`p-1.5 rounded-lg border text-xs font-semibold ${
                      up.is_active 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                        : 'border-slate-200 bg-slate-100 text-slate-400'
                    }`}
                  >
                    {up.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>

            {activeDistrict.upazilas.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                {isBn ? 'এই জেলায় এখনো কোনো উপজেলা যুক্ত করা হয়নি।' : 'No upazilas added to this district yet.'}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add District Modal */}
      {isAddDistModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              {isBn ? 'নতুন জেলা যুক্ত করুন' : 'Add New District'}
            </h3>
            <form onSubmit={handleAddDistrict} className="space-y-3">
              <Input
                id="distBn"
                label={isBn ? 'জেলার নাম (বাংলা)' : 'District Name (Bengali)'}
                placeholder="যেমন: রংপুর"
                value={newDistBn}
                onChange={(e) => setNewDistBn(e.target.value)}
                required
              />
              <Input
                id="distEn"
                label={isBn ? 'জেলার নাম (English)' : 'District Name (English)'}
                placeholder="e.g. Rangpur"
                value={newDistEn}
                onChange={(e) => setNewDistEn(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsAddDistModalOpen(false)}>
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

      {/* Add Upazila Modal */}
      {isAddUpazilaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              {isBn ? `"${activeDistrict.name_bn}" জেলায় নতুন উপজেলা যুক্ত করুন` : `Add Upazila to ${activeDistrict.name_en}`}
            </h3>
            <form onSubmit={handleAddUpazila} className="space-y-3">
              <Input
                id="upBn"
                label={isBn ? 'উপজেলার নাম (বাংলা)' : 'Upazila Name (Bengali)'}
                placeholder="যেমন: মিঠাপুকুর"
                value={newUpBn}
                onChange={(e) => setNewUpBn(e.target.value)}
                required
              />
              <Input
                id="upEn"
                label={isBn ? 'উপজেলার নাম (English)' : 'Upazila Name (English)'}
                placeholder="e.g. Mithapukur"
                value={newUpEn}
                onChange={(e) => setNewUpEn(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsAddUpazilaModalOpen(false)}>
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

