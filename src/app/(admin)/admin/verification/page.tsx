'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, Search, Filter, Eye, CheckCircle2, 
  XCircle, Clock, MapPin, Wrench, AlertCircle 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toBanglaNumber } from '@/lib/utils'

export default function VerificationQueuePage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [searchQuery, setSearchQuery] = useState('')
  const [districtFilter, setDistrictFilter] = useState('all')

  const pendingApplicants = [
    {
      id: 'app-01',
      name: isBn ? 'মোঃ রফিকুল ইসলাম' : 'Md. Rafiqul Islam',
      phone: '01712345678',
      nidNumber: '1990521934000123',
      category: isBn ? 'ইলেকট্রিক্যাল কাজ' : 'Electrical',
      subcategories: isBn ? ['বাসা-বাড়ির ওয়্যারিং', 'ফ্যান ও লাইটিং ফিটিং'] : ['House Wiring', 'Fan Fitting'],
      experienceYears: 6,
      district: isBn ? 'ঠাকুরগাঁও' : 'Thakurgaon',
      upazila: isBn ? 'ঠাকুরগাঁও সদর' : 'Thakurgaon Sadar',
      submittedAt: '২০২৬-১১-০২, বিকাল ৪:৩০',
      status: 'pending',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'app-02',
      name: isBn ? 'মোঃ জাহিদুল ইসলাম' : 'Md. Zahidul Islam',
      phone: '01898765432',
      nidNumber: '1988271928000456',
      category: isBn ? 'প্লাম্বিং সার্ভিস' : 'Plumbing',
      subcategories: isBn ? ['পাইপ ফিটিং', 'পানির মোটর মেরামত'] : ['Pipe Fitting', 'Water Pump'],
      experienceYears: 8,
      district: isBn ? 'পঞ্চগড়' : 'Panchagarh',
      upazila: isBn ? 'বোদা' : 'Boda',
      submittedAt: '২০২৬-১১-০২, দুপুর ১:১৫',
      status: 'under_review',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'app-03',
      name: isBn ? 'সোহেল রানা' : 'Sohel Rana',
      phone: '01911223344',
      nidNumber: '1995271928000789',
      category: isBn ? 'রং করার কাজ' : 'Painting',
      subcategories: isBn ? ['দেয়াল রং', 'বার্নিশ ও পলিশ'] : ['Wall Paint', 'Varnish & Polish'],
      experienceYears: 4,
      district: isBn ? 'দিনাজপুর' : 'Dinajpur',
      upazila: isBn ? 'বীরগঞ্জ' : 'Birganj',
      submittedAt: '২০২৬-১১-০১, সকাল ১০:২০',
      status: 'pending',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  ]

  const filteredApplicants = pendingApplicants.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.phone.includes(searchQuery) || app.nidNumber.includes(searchQuery)
    const matchesDistrict = districtFilter === 'all' || app.district.toLowerCase().includes(districtFilter.toLowerCase())
    return matchesSearch && matchesDistrict
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isBn ? 'মিস্ত্রী এনআইডি ভেরিফিকেশন কিউ' : 'Mistri NID Verification Queue'}
          </h1>
          <p className="text-xs text-slate-500">
            {isBn 
              ? 'নিবন্ধিত আবেদনকারীদের পরিচয়পত্র ও তথ্য পরীক্ষা করে অনুমোদন বা প্রত্যাখ্যান করুন' 
              : 'Review submitted national ID documents and approve or reject worker applications'}
          </p>
        </div>
        <Badge variant="warning" className="text-xs font-bold px-3 py-1">
          {toBanglaNumber(filteredApplicants.length)} {isBn ? 'টি আবেদন অপেক্ষমান' : 'Applications Pending'}
        </Badge>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            id="search"
            placeholder={isBn ? 'নাম, ফোন বা এনআইডি নম্বর দিয়ে খুঁজুন...' : 'Search by name, phone or NID...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="w-full sm:w-48">
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

      {/* Applicants List Table/Cards */}
      <div className="space-y-3">
        {filteredApplicants.map((app) => (
          <Card key={app.id} className="p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Applicant Info */}
              <div className="flex items-start gap-4">
                <img
                  src={app.avatar}
                  alt={app.name}
                  className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">{app.name}</h3>
                    <Badge variant="primary" className="text-[10px]">
                      {app.category}
                    </Badge>
                    <Badge variant={app.status === 'under_review' ? 'warning' : 'neutral'} className="text-[10px]">
                      {app.status === 'under_review' ? (isBn ? 'পর্যালোচনাধীন' : 'Under Review') : (isBn ? 'নতুন আবেদন' : 'Pending')}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
                    <span>📱 <strong>{app.phone}</strong></span>
                    <span>🆔 NID: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">{app.nidNumber}</code></span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-blue-600" />
                      {app.upazila}, {app.district}
                    </span>
                    <span>⭐ {toBanglaNumber(app.experienceYears)} {isBn ? 'বছরের অভিজ্ঞতা' : 'yrs exp'}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>{isBn ? 'জমা দেয়ার সময়:' : 'Submitted:'} {app.submittedAt}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Link href={`/admin/verification/${app.id}`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-4 py-2">
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    <span>{isBn ? 'ডকুমেন্ট ও তথ্য যাচাই' : 'Inspect Documents'}</span>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}

        {filteredApplicants.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              {isBn ? 'কোনো অপেক্ষমান আবেদন নেই' : 'No Pending Applications'}
            </p>
            <p className="text-xs text-slate-400">
              {isBn ? 'সবগুলো আবেদন যাচাই ও নিষ্পত্তি করা হয়েছে।' : 'All pending worker applications have been processed.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
