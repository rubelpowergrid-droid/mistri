'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  Wrench, Search, Star, ShieldCheck, ShieldAlert, 
  MapPin, CheckCircle2, Ban, Eye, Phone, RefreshCw,
  Trash2, RotateCcw, AlertTriangle, FolderArchive, X, Check
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
  status: 'approved' | 'pending' | 'suspended' | 'trash'
  avatar: string
}

function AdminMistrisContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const initialTab = searchParams.get('tab') === 'trash' ? 'trash' : 'active'
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>(initialTab)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [districtFilter, setDistrictFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Modals state
  const [selectedMistriForTrash, setSelectedMistriForTrash] = useState<MistriWorker | null>(null)
  const [selectedMistriForPermanentDelete, setSelectedMistriForPermanentDelete] = useState<MistriWorker | null>(null)
  const [isProcessingAction, setIsProcessingAction] = useState(false)

  const [mistris, setMistris] = useState<MistriWorker[]>([])

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'trash') {
      setActiveTab('trash')
    } else {
      setActiveTab('active')
    }
  }, [searchParams])

  const fetchMistris = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/mistris', { cache: 'no-store' })
      const data = await res.json()
      if (data.success && Array.isArray(data.mistris)) {
        setMistris(data.mistris)
      }
    } catch (err) {
      console.error('Failed to fetch admin mistris:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMistris()
  }, [])

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setActionFeedback({ type, text })
    setTimeout(() => setActionFeedback(null), 4500)
  }

  // Toggle Suspend / Reactivate
  const toggleSuspend = async (mistriId: string, currentStatus: string) => {
    const nextAction = currentStatus === 'suspended' ? 'reactivate' : 'suspend'
    try {
      const res = await fetch('/api/admin/mistris', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mistriId, action: nextAction }),
      })
      const data = await res.json()
      if (data.success) {
        setMistris(prev =>
          prev.map(m => {
            if (m.id !== mistriId) return m
            return { ...m, status: nextAction === 'suspend' ? 'suspended' : 'approved' }
          })
        )
        showFeedback(data.message || (nextAction === 'suspend' ? 'অ্যাকাউন্ট স্থগিত করা হয়েছে' : 'স্থগিতাদেশ প্রত্যাহার করা হয়েছে'))
      } else {
        showFeedback(data.error || 'সমস্যা হয়েছে', 'error')
      }
    } catch {
      showFeedback('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি', 'error')
    }
  }

  // Move to Trash (Soft Delete)
  const handleConfirmTrash = async () => {
    if (!selectedMistriForTrash) return
    setIsProcessingAction(true)
    try {
      const res = await fetch('/api/admin/mistris', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedMistriForTrash.id, action: 'trash' }),
      })
      const data = await res.json()
      setIsProcessingAction(false)
      if (data.success) {
        setMistris(prev =>
          prev.map(m => (m.id === selectedMistriForTrash.id ? { ...m, status: 'trash' } : m))
        )
        showFeedback(isBn ? 'অ্যাকাউন্টটি Trash ফোল্ডারে পাঠানো হয়েছে এবং পাবলিক ভিউ বন্ধ করা হয়েছে' : 'Moved to Trash')
        setSelectedMistriForTrash(null)
      } else {
        showFeedback(data.error || 'সমস্যা হয়েছে', 'error')
      }
    } catch {
      setIsProcessingAction(false)
      showFeedback('সার্ভার ত্রুটি, পুনরায় চেষ্টা করুন', 'error')
    }
  }

  // Restore from Trash
  const handleRestore = async (mistriId: string) => {
    try {
      const res = await fetch('/api/admin/mistris', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mistriId, action: 'restore' }),
      })
      const data = await res.json()
      if (data.success) {
        setMistris(prev =>
          prev.map(m => (m.id === mistriId ? { ...m, status: 'approved' } : m))
        )
        showFeedback(isBn ? 'অ্যাকাউন্টটি সফলভাবে সক্রিয় করা হয়েছে' : 'Restored from Trash')
      } else {
        showFeedback(data.error || 'সমস্যা হয়েছে', 'error')
      }
    } catch {
      showFeedback('সার্ভার ত্রুটি, পুনরায় চেষ্টা করুন', 'error')
    }
  }

  // Permanent Delete
  const handleConfirmPermanentDelete = async () => {
    if (!selectedMistriForPermanentDelete) return
    setIsProcessingAction(true)
    try {
      const res = await fetch(`/api/admin/mistris?id=${selectedMistriForPermanentDelete.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      setIsProcessingAction(false)
      if (data.success) {
        setMistris(prev => prev.filter(m => m.id !== selectedMistriForPermanentDelete.id))
        showFeedback(isBn ? 'অ্যাকাউন্টটি স্থায়ীভাবে সম্পূর্ণ মুছে ফেলা হয়েছে' : 'Permanently deleted')
        setSelectedMistriForPermanentDelete(null)
      } else {
        showFeedback(data.error || 'সমস্যা হয়েছে', 'error')
      }
    } catch {
      setIsProcessingAction(false)
      showFeedback('সার্ভার ত্রুটি, পুনরায় চেষ্টা করুন', 'error')
    }
  }

  // Counts
  const activeMistris = mistris.filter(m => m.status !== 'trash')
  const trashedMistris = mistris.filter(m => m.status === 'trash')

  // Filtering based on current tab
  const displayList = activeTab === 'trash' ? trashedMistris : activeMistris

  const filteredMistris = displayList.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery)
    const matchesStatus =
      activeTab === 'trash' ||
      statusFilter === 'all' ||
      m.status === statusFilter
    const matchesDistrict =
      districtFilter === 'all' ||
      m.district.toLowerCase().includes(districtFilter.toLowerCase())
    return matchesSearch && matchesStatus && matchesDistrict
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isBn ? 'সকল মিস্ত্রী পরিচালনা' : 'Mistri Worker Management'}</span>
            {activeTab === 'trash' && (
              <span className="text-xs px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 font-bold border border-rose-300">
                {isBn ? 'Trash ফোল্ডার' : 'Trash Folder'}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500">
            {isBn 
              ? 'নিবন্ধিত কর্মীদের প্রোফাইল, কাজের ইতিহাস, স্থগিতকরণ ও Trash ফোল্ডার নিয়ন্ত্রণ' 
              : 'Monitor active, suspended, and trashed professionals across all districts'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchMistris} isLoading={isLoading}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* Feedback Toast */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold border flex items-center justify-between animate-in fade-in shadow-xs ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-[#2c7865] border-emerald-300'
              : 'bg-rose-50 text-rose-700 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-[#2c7865]" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            )}
            <span>{actionFeedback.text}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="p-1 hover:opacity-70">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Folder Tabs: Active vs Trash */}
      <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('active')
            router.push('/admin/mistris')
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'skeuo-btn-dark shadow-md text-[#fefded]'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
          }`}
        >
          <Wrench className="h-4 w-4" />
          <span>{isBn ? 'সকল সক্রিয় মিস্ত্রী' : 'Active Mistris'}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'active' ? 'bg-[#1e5548] text-[#fefded]' : 'bg-stone-300 text-stone-800'}`}>
            {toBanglaNumber(activeMistris.length)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('trash')
            router.push('/admin/mistris?tab=trash')
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'trash'
              ? 'bg-rose-700 text-white shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
          }`}
        >
          <Trash2 className="h-4 w-4 text-rose-500" />
          <span>{isBn ? 'Trash ফোল্ডার' : 'Trash Folder'}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'trash' ? 'bg-rose-900 text-white' : 'bg-rose-200 text-rose-900'}`}>
            {toBanglaNumber(trashedMistris.length)}
          </span>
        </button>
      </div>

      {/* Trash Informational Banner */}
      {activeTab === 'trash' && (
        <div className="p-4 rounded-2xl bg-rose-50/80 border-2 border-rose-200 text-rose-950 flex items-start gap-3 shadow-xs">
          <FolderArchive className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <h4 className="font-bold text-rose-900">
              {isBn ? '📁 Trash ফোল্ডার (পাবলিক ভিউ বন্ধ)' : 'Trash Folder (Public View Hidden)'}
            </h4>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              {isBn
                ? 'এখানে থাকা মিস্ত্রীদের অ্যাকাউন্ট জনসাধারণের সার্চ বা প্রোফাইলে দেখা যাবে না। এডমিন চাইলে যেকোনো অ্যাকাউন্ট আবার "পুনরুদ্ধার" করতে পারেন অথবা ডাটাবেজ থেকে "স্থায়ীভাবে ডিলিট" করতে পারেন।'
                : 'Accounts in Trash are hidden from search and public discovery. You can restore them or permanently delete them.'}
            </p>
          </div>
        </div>
      )}

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

        {activeTab === 'active' && (
          <div className="w-full sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-[#2c7865] focus:outline-none"
            >
              <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
              <option value="approved">{isBn ? 'অনুমোদিত (Approved)' : 'Approved'}</option>
              <option value="suspended">{isBn ? 'স্থগিত (Suspended)' : 'Suspended'}</option>
            </select>
          </div>
        )}

        <div className="w-full sm:w-44">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-[#2c7865] focus:outline-none"
          >
            <option value="all">{isBn ? 'সকল জেলা' : 'All Districts'}</option>
            <option value="Thakurgaon">{isBn ? 'ঠাকুরগাঁও' : 'Thakurgaon'}</option>
            <option value="Panchagarh">{isBn ? 'পঞ্চগড়' : 'Panchagarh'}</option>
            <option value="Dinajpur">{isBn ? 'দিনাজপুর' : 'Dinajpur'}</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredMistris.length === 0 && (
        <Card className="p-12 text-center skeuo-surface border-stone-300 space-y-2">
          {activeTab === 'trash' ? (
            <>
              <Trash2 className="h-10 w-10 text-stone-400 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800">
                {isBn ? 'Trash ফোল্ডার সম্পূর্ণ ফাঁকা' : 'Trash folder is empty'}
              </h3>
              <p className="text-xs text-stone-500">
                {isBn ? 'কোনো ডিলিট করা মিস্ত্রী অ্যাকাউন্ট বর্তমানে ট্র্যাশে নেই।' : 'No deleted mistri accounts found in Trash.'}
              </p>
            </>
          ) : (
            <>
              <Wrench className="h-10 w-10 text-stone-400 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800">
                {isBn ? 'কোনো মিস্ত্রী পাওয়া যায়নি' : 'No mistris found'}
              </h3>
              <p className="text-xs text-stone-500">
                {isBn ? 'ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।' : 'Try adjusting your search or filters.'}
              </p>
            </>
          )}
        </Card>
      )}

      {/* Mistris Cards */}
      <div className="space-y-3">
        {filteredMistris.map((m) => (
          <Card key={m.id} className="p-4 sm:p-5 hover:shadow-md transition-shadow skeuo-surface border-stone-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <img
                  src={m.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}
                  alt={m.name}
                  className="h-14 w-14 rounded-2xl object-cover border border-stone-300 shrink-0 shadow-xs"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-stone-900">{m.name}</h3>
                    <Badge variant="primary" className="text-[10px] bg-[#2c7865] text-[#fefded]">
                      {m.category}
                    </Badge>

                    {m.status === 'trash' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                        <Trash2 className="h-3 w-3" />
                        <span>{isBn ? 'ট্র্যাশে সংরক্ষিত (পাবলিক লুকানো)' : 'In Trash (Hidden)'}</span>
                      </span>
                    ) : m.status === 'suspended' ? (
                      <Badge variant="danger" className="text-[10px]">
                        {isBn ? 'অ্যাকাউন্ট স্থগিত' : 'Suspended'}
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-[10px] bg-emerald-100 text-emerald-800 border-emerald-300">
                        {isBn ? 'সক্রিয় ও লাইভ' : 'Active & Live'}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-stone-500">
                    {m.title} • {toBanglaNumber(m.experienceYears)} {isBn ? 'বছরের অভিজ্ঞতা' : 'yrs exp'}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 pt-0.5">
                    <span>📱 <strong>{m.phone}</strong></span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#2c7865]" />
                      {m.upazila}, {m.district}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-stone-800">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {m.rating} ({toBanglaNumber(m.reviewsCount)})
                    </span>
                    <span className="font-bold text-[#2c7865]">
                      {toBanglaNumber(m.completedJobs)} {isBn ? 'টি কাজ সম্পন্ন' : 'jobs'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons based on Active vs Trash */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                {m.status === 'trash' ? (
                  <>
                    {/* Restore Button */}
                    <Button
                      size="sm"
                      onClick={() => handleRestore(m.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      <span>{isBn ? 'পুনরুদ্ধার করুন' : 'Restore'}</span>
                    </Button>

                    {/* Permanent Delete Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMistriForPermanentDelete(m)}
                      className="text-xs font-semibold text-rose-700 border-rose-300 hover:bg-rose-50 px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1 text-rose-600" />
                      <span>{isBn ? 'স্থায়ীভাবে ডিলিট' : 'Permanent Delete'}</span>
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Suspend / Reactivate Button */}
                    <Button
                      size="sm"
                      variant={m.status === 'approved' ? 'outline' : 'primary'}
                      onClick={() => toggleSuspend(m.id, m.status)}
                      className={`text-xs font-semibold cursor-pointer ${
                        m.status === 'approved'
                          ? 'text-amber-800 border-amber-300 hover:bg-amber-50'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {m.status === 'approved' ? (
                        <>
                          <Ban className="h-3.5 w-3.5 mr-1 text-amber-700" />
                          <span>{isBn ? 'অ্যাকাউন্ট স্থগিত করুন' : 'Suspend'}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          <span>{isBn ? 'স্থগিতাদেশ প্রত্যাহার' : 'Reactivate'}</span>
                        </>
                      )}
                    </Button>

                    {/* Delete (Move to Trash) Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMistriForTrash(m)}
                      className="text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 cursor-pointer"
                      title={isBn ? 'Trash ফোল্ডারে পাঠান' : 'Move to Trash'}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      <span>{isBn ? 'ডিলিট করুন' : 'Delete'}</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Move to Trash Modal */}
      {selectedMistriForTrash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <Card className="w-full max-w-md p-6 space-y-5 skeuo-surface border-2 border-stone-300 shadow-2xl relative">
            <button
              onClick={() => setSelectedMistriForTrash(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-stone-200/60 text-stone-500 hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 border border-rose-200">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">
                {isBn ? 'অ্যাকাউন্টটি ট্র্যাশে পাঠাতে চান?' : 'Move to Trash Folder?'}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isBn ? (
                  <>
                    <strong className="text-stone-900">{selectedMistriForTrash.name}</strong>-এর অ্যাকাউন্টটি Trash ফোল্ডারে পাঠানো হবে।
                    পাবলিক ওয়েবসাইট বা কাস্টমার সার্চ লিস্টে এটি সম্পূর্ণ লুকানো থাকবে।
                  </>
                ) : (
                  `"${selectedMistriForTrash.name}" will be hidden from public view and placed in the Trash folder.`
                )}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
              💡 {isBn ? 'এডমিন চাইলে পরবর্তীতে Trash ফোল্ডার থেকে এই অ্যাকাউন্টটি পুনরায় সক্রিয় করতে পারবেন।' : 'You can restore this account anytime from the Trash folder.'}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setSelectedMistriForTrash(null)}
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                className="flex-1 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold"
                isLoading={isProcessingAction}
                onClick={handleConfirmTrash}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                <span>{isBn ? 'হ্যাঁ, ট্র্যাশে পাঠান' : 'Move to Trash'}</span>
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Permanent Delete Modal */}
      {selectedMistriForPermanentDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <Card className="w-full max-w-md p-6 space-y-5 skeuo-surface border-2 border-rose-300 shadow-2xl relative">
            <button
              onClick={() => setSelectedMistriForPermanentDelete(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-stone-200/60 text-stone-500 hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">
                {isBn ? 'স্থায়ীভাবে ডিলিট করার চূড়ান্ত সতর্কতা' : 'Permanent Delete Warning'}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isBn ? (
                  <>
                    আপনি <strong className="text-stone-900">{selectedMistriForPermanentDelete.name}</strong>-এর প্রোফাইল এবং ডাটাবেজের সকল তথ্য স্থায়ীভাবে মুছে ফেলতে যাচ্ছেন।
                    <strong className="text-rose-600 block mt-1">এটি আর কোনোভাবেই পুনরুদ্ধার করা সম্ভব হবে না!</strong>
                  </>
                ) : (
                  `Are you sure you want to permanently delete "${selectedMistriForPermanentDelete.name}"? This action cannot be undone.`
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setSelectedMistriForPermanentDelete(null)}
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                isLoading={isProcessingAction}
                onClick={handleConfirmPermanentDelete}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                <span>{isBn ? 'স্থায়ীভাবে মুছে ফেলুন' : 'Delete Forever'}</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function AdminMistrisPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">লোড হচ্ছে...</div>}>
      <AdminMistrisContent />
    </Suspense>
  )
}
