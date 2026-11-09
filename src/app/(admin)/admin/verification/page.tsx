'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, Search, Filter, Eye, CheckCircle2, 
  XCircle, Clock, MapPin, Wrench, AlertCircle, RefreshCw 
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

  const [applicants, setApplicants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [districtFilter, setDistrictFilter] = useState('all')
  const [statusTab, setStatusTab] = useState<'pending' | 'approved' | 'all'>('pending')
  const [actionMessage, setActionMessage] = useState('')

  const fetchApplicants = async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      const res = await fetch('/api/admin/verification', { cache: 'no-store' })
      const data = await res.json()
      if (data.success) {
        setApplicants(data.applicants || [])
      }
    } catch {
      // Fallback
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApplicants(true)
    const timer = setInterval(() => fetchApplicants(false), 4000)
    window.addEventListener('focus', () => fetchApplicants(false))
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', () => fetchApplicants(false))
    }
  }, [])

  const handleQuickAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/verification/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (data.success) {
        // Update status in local state so it moves out of pending tab into approved tab
        setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: action === 'approve' ? 'approved' : 'rejected' } : a))
        setActionMessage(
          action === 'approve'
            ? '✓ মিস্ত্রী সফলভাবে অনুমোদিত হয়েছে এবং পাবলিক সার্চ ও সকল মিস্ত্রী তালিকায় লাইভ করা হয়েছে!'
            : '✓ মিস্ত্রী আবেদন বাতিল ও তালিকা থেকে সরানো হয়েছে।'
        )
        setTimeout(() => setActionMessage(''), 4000)
      }
    } catch {
      alert('অ্যাকশন সম্পন্ন করা যায়নি')
    }
  }

  const pendingCount = applicants.filter(a => a.status === 'pending').length
  const approvedCount = applicants.filter(a => a.status === 'approved').length

  const filteredApplicants = applicants.filter((app) => {
    const matchesTab = 
      statusTab === 'all' || 
      (statusTab === 'pending' && app.status === 'pending') || 
      (statusTab === 'approved' && app.status === 'approved')

    const matchesSearch = 
      app.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      app.phone?.includes(searchQuery) || 
      app.nidNumber?.includes(searchQuery)

    const matchesDistrict = 
      districtFilter === 'all' || 
      app.district?.toLowerCase().includes(districtFilter.toLowerCase())

    return matchesTab && matchesSearch && matchesDistrict
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isBn ? 'মিস্ত্রী এনআইডি ভেরিফিকেশন কিউ' : 'Mistri NID Verification Queue'}
            </h1>
            <Badge variant="warning" className="px-2 py-0.5 text-xs font-bold">
              {toBanglaNumber(pendingCount)} টি অপেক্ষমাণ
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isBn 
              ? 'নতুন আবেদন পর্যালোচনা করুন। অনুমোদন করার সাথে সাথে মিস্ত্রী পাবলিক সাইটে লাইভ হয়ে যাবে।' 
              : 'Review and approve new mistri registrations to make them live instantly.'}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => fetchApplicants(true)} isLoading={isLoading}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          <span>রিফ্রেশ</span>
        </Button>
      </div>

      {actionMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setStatusTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusTab === 'pending'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{isBn ? 'পেন্ডিং ভেরিফিকেশন' : 'Pending Verification'}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-black">
              {toBanglaNumber(pendingCount)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusTab('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusTab === 'approved'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{isBn ? 'অনুমোদিত মিস্ত্রী' : 'Approved Workers'}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-black">
              {toBanglaNumber(approvedCount)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{isBn ? 'সকল আবেদন' : 'All Registrations'}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800 font-black">
              {toBanglaNumber(applicants.length)}
            </span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="w-full sm:w-64">
            <Input
              id="searchQueue"
              placeholder={isBn ? 'নাম, মোবাইল বা এনআইডি...' : 'Search name, phone, NID...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full sm:w-36 rounded-xl border border-slate-300 bg-white py-2 px-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="all">{isBn ? 'সকল জেলা' : 'All Districts'}</option>
              <option value="ঠাকুরগাঁও">{isBn ? 'ঠাকুরগাঁও' : 'Thakurgaon'}</option>
              <option value="পঞ্চগড়">{isBn ? 'পঞ্চগড়' : 'Panchagarh'}</option>
              <option value="দিনাজপুর">{isBn ? 'দিনাজপুর' : 'Dinajpur'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Verification Applicants Table */}
      <Card className="overflow-hidden border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">{isBn ? 'আবেদনকারী' : 'Applicant'}</th>
                <th className="py-3.5 px-4">{isBn ? 'ক্যাটাগরি ও দক্ষতা' : 'Category & Skills'}</th>
                <th className="py-3.5 px-4">{isBn ? 'এলাকা' : 'Location'}</th>
                <th className="py-3.5 px-4">{isBn ? 'আবেদনের সময়' : 'Submitted At'}</th>
                <th className="py-3.5 px-4">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="py-3.5 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <span className="text-sm font-bold text-slate-800 block">
                      {isBn ? 'কোনো অপেক্ষমাণ আবেদন নেই!' : 'No pending applications!'}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      {isBn ? 'সবগুলো আবেদন যাচাই ও নিষ্পত্তি সম্পন্ন হয়েছে।' : 'All registrations have been reviewed.'}
                    </span>
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.avatar}
                          alt={app.name}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{app.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono block">{app.phone}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">NID: {app.nidNumber}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-800 text-xs block">{app.category}</span>
                        <div className="flex flex-wrap gap-1">
                          {app.subcategories?.slice(0, 2).map((s: string, idx: number) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-600 text-xs">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{app.district}, {app.upazila}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
                      {app.submittedAt}
                    </td>

                    <td className="py-3.5 px-4">
                      {app.status === 'approved' ? (
                        <Badge variant="success" className="text-[10px] py-0.5 bg-emerald-100 text-emerald-800 border-emerald-300">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                          <span>অনুমোদিত (লাইভ)</span>
                        </Badge>
                      ) : app.status === 'rejected' ? (
                        <Badge variant="danger" className="text-[10px] py-0.5 bg-red-100 text-red-800 border-red-300">
                          <XCircle className="h-3 w-3 mr-1 text-red-600" />
                          <span>বাতিলকৃত</span>
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px] py-0.5">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>অপেক্ষমাণ</span>
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/verification/${app.id}`}>
                          <Button variant="outline" size="sm" className="h-8 text-xs px-2.5">
                            <Eye className="h-3.5 w-3.5 mr-1 text-slate-500" />
                            <span>পরিদর্শন</span>
                          </Button>
                        </Link>
                        {app.status === 'approved' ? (
                          <Link href="/admin/mistris">
                            <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5">
                              <Wrench className="h-3.5 w-3.5 mr-1" />
                              <span>সকল মিস্ত্রীতে দেখুন</span>
                            </Button>
                          </Link>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleQuickAction(app.id, 'approve')}
                              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              <span>অনুমোদন</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuickAction(app.id, 'reject')}
                              className="h-8 text-xs text-red-600 hover:bg-red-50 border-red-200 px-2.5"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              <span>বাতিল</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
