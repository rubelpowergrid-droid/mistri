'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Wrench, Search, Star, ShieldCheck, ShieldAlert, 
  MapPin, CheckCircle2, Ban, Eye, Phone 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toBanglaNumber, formatBDT } from '@/lib/utils'

interface MistriWorker {
  id: string
  name: string
  phone: string
  title: string
  category: string
  district: string
  upazila: string
  experienceYears: number
  rating: number
  reviewsCount: number
  completedJobs: number
  status: 'approved' | 'pending' | 'suspended'
  avatar: string
}

export default function AdminMistrisPage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [districtFilter, setDistrictFilter] = useState('all')

  const [mistris, setMistris] = useState<MistriWorker[]>([
    {
      id: 'm-1',
      name: isBn ? 'মোঃ রফিকুল ইসলাম' : 'Md. Rafiqul Islam',
      phone: '01712345678',
      title: isBn ? 'সিনিয়র ইলেকট্রিশিয়ান' : 'Senior Electrician',
      category: isBn ? 'ইলেকট্রিক্যাল কাজ' : 'Electrical',
      district: isBn ? 'ঠাকুরগাঁও' : 'Thakurgaon',
      upazila: isBn ? 'ঠাকুরগাঁও সদর' : 'Thakurgaon Sadar',
      experienceYears: 8,
      rating: 4.9,
      reviewsCount: 38,
      completedJobs: 142,
      status: 'approved',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'm-2',
      name: isBn ? 'আব্দুল করিম' : 'Abdul Karim',
      phone: '01898765432',
      title: isBn ? 'দক্ষ প্লাম্বিং কারিগর' : 'Expert Plumber',
      category: isBn ? 'প্লাম্বিং সার্ভিস' : 'Plumbing',
      district: isBn ? 'ঠাকুরগাঁও' : 'Thakurgaon',
      upazila: isBn ? 'পীরগঞ্জ' : 'Pirganj',
      experienceYears: 6,
      rating: 4.8,
      reviewsCount: 29,
      completedJobs: 98,
      status: 'approved',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'm-3',
      name: isBn ? 'তরিকুল হাসান' : 'Tariqul Hasan',
      phone: '01911223344',
      title: isBn ? 'রাজমিস্ত্রী ও টাইলস স্পেশালিস্ট' : 'Masonry Specialist',
      category: isBn ? 'রাজমিস্ত্রীর কাজ' : 'Masonry',
      district: isBn ? 'পঞ্চগড়' : 'Panchagarh',
      upazila: isBn ? 'বোদা' : 'Boda',
      experienceYears: 12,
      rating: 5.0,
      reviewsCount: 52,
      completedJobs: 210,
      status: 'approved',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'm-4',
      name: isBn ? 'নুরুল হুদা' : 'Nurul Huda',
      phone: '01755667788',
      title: isBn ? 'কাঠের ফার্নিচার মিস্ত্রী' : 'Carpenter',
      category: isBn ? 'কাঠের কাজ' : 'Carpentry',
      district: isBn ? 'দিনাজপুর' : 'Dinajpur',
      upazila: isBn ? 'দিনাজপুর সদর' : 'Dinajpur Sadar',
      experienceYears: 5,
      rating: 3.8,
      reviewsCount: 11,
      completedJobs: 34,
      status: 'suspended',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    },
  ])

  const toggleSuspend = (mistriId: string) => {
    setMistris(prev =>
      prev.map(m => {
        if (m.id !== mistriId) return m
        const nextStatus = m.status === 'suspended' ? 'approved' : 'suspended'
        return { ...m, status: nextStatus }
      })
    )
  }

  const filteredMistris = mistris.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.phone.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter
    const matchesDistrict = districtFilter === 'all' || m.district.toLowerCase().includes(districtFilter.toLowerCase())
    return matchesSearch && matchesStatus && matchesDistrict
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isBn ? 'সকল মিস্ত্রী পরিচালনা' : 'Mistri Worker Management'}
          </h1>
          <p className="text-xs text-slate-500">
            {isBn 
              ? 'নিবন্ধিত কর্মীদের প্রোফাইল, কাজের ইতিহাস ও একাউন্ট স্ট্যাটাস নিয়ন্ত্রণ' 
              : 'Monitor active and suspended professionals across all districts'}
          </p>
        </div>
        <Badge variant="primary" className="text-xs px-3 py-1 font-bold">
          {toBanglaNumber(filteredMistris.length)} {isBn ? 'জন মিস্ত্রী' : 'Workers'}
        </Badge>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            id="searchMistri"
            placeholder={isBn ? 'নাম বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search by name or phone...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="w-full sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          >
            <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
            <option value="approved">{isBn ? 'অনুমোদিত (Approved)' : 'Approved'}</option>
            <option value="suspended">{isBn ? 'স্থগিত (Suspended)' : 'Suspended'}</option>
          </select>
        </div>
        <div className="w-full sm:w-44">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          >
            <option value="all">{isBn ? 'সকল জেলা' : 'All Districts'}</option>
            <option value="Thakurgaon">{isBn ? 'ঠাকুরগাঁও' : 'Thakurgaon'}</option>
            <option value="Panchagarh">{isBn ? 'পঞ্চগড়' : 'Panchagarh'}</option>
            <option value="Dinajpur">{isBn ? 'দিনাজপুর' : 'Dinajpur'}</option>
          </select>
        </div>
      </div>

      {/* Mistris Cards */}
      <div className="space-y-3">
        {filteredMistris.map((m) => (
          <Card key={m.id} className="p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
                    <Badge variant="primary" className="text-[10px]">
                      {m.category}
                    </Badge>
                    <Badge variant={m.status === 'approved' ? 'success' : 'danger'} className="text-[10px]">
                      {m.status === 'approved' ? (isBn ? 'সক্রিয় ও লাইভ' : 'Active') : (isBn ? 'অ্যাকাউন্ট স্থগিত' : 'Suspended')}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500">{m.title} • {toBanglaNumber(m.experienceYears)} {isBn ? 'বছরের অভিজ্ঞতা' : 'yrs exp'}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
                    <span>📱 <strong>{m.phone}</strong></span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-blue-600" />
                      {m.upazila}, {m.district}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {m.rating} ({toBanglaNumber(m.reviewsCount)})
                    </span>
                    <span className="font-bold text-emerald-600">
                      {toBanglaNumber(m.completedJobs)} {isBn ? 'টি কাজ সম্পন্ন' : 'jobs'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Button
                  size="sm"
                  variant={m.status === 'approved' ? 'outline' : 'primary'}
                  onClick={() => toggleSuspend(m.id)}
                  className={`text-xs font-semibold ${
                    m.status === 'approved' ? 'text-red-600 border-red-200 hover:bg-red-50' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {m.status === 'approved' ? (
                    <>
                      <Ban className="h-3.5 w-3.5 mr-1" />
                      <span>{isBn ? 'অ্যাকাউন্ট স্থগিত করুন' : 'Suspend'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      <span>{isBn ? 'স্থগিতাদেশ প্রত্যাহার' : 'Reactivate'}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

