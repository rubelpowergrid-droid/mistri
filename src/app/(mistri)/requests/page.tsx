'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Inbox, Check, X, Calendar, Clock, MapPin, 
  DollarSign, CheckCircle2, AlertTriangle, ArrowRight, Phone,
  Camera, ArrowLeft, Loader2, MessageSquare, AlertCircle
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatBDT, formatDistance, toBanglaNumber } from '@/lib/utils'
import { getStoredUser } from '@/lib/auth-client'

interface BookingRequest {
  id: string
  bookingNumber: string
  mistriId?: string
  mistriPhone?: string
  customerName: string
  customerPhone: string
  customerGeneralArea: string
  jobAddress?: string
  distanceKm?: number
  serviceName: string
  description: string
  preferredDate: string
  preferredTime: string
  proposedBudget: number
  workPhotos?: string[]
  submittedAt: string
  status: 'pending' | 'accepted' | 'rejected'
}

export default function MistriIncomingRequestsPage() {
  const router = useRouter()
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  // Decline Modal States
  const [selectedDeclineReq, setSelectedDeclineReq] = useState<BookingRequest | null>(null)
  const [declineReason, setDeclineReason] = useState('আমি বর্তমানে অন্য কাজে ব্যস্ত আছি')
  const [customDeclineReason, setCustomDeclineReason] = useState('')
  const [isSubmittingDecline, setIsSubmittingDecline] = useState(false)

  // Proposal Modal States
  const [selectedProposalReq, setSelectedProposalReq] = useState<BookingRequest | null>(null)
  const [proposedDate, setProposedDate] = useState('')
  const [proposedTime, setProposedTime] = useState('সকাল ১১:০০ - দুপুর ১:০০')
  const [proposedPrice, setProposedPrice] = useState<number | ''>(400)
  const [proposalNotes, setProposalNotes] = useState('')
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false)

  // Fetch real incoming requests for this mistri
  const fetchRequests = async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    const user = getStoredUser()
    const cleanPhone = user?.phone ? user.phone.replace(/[^0-9]/g, '') : ''

    try {
      const url = cleanPhone 
        ? `/api/bookings?role=mistri&mistriPhone=${cleanPhone}&status=pending`
        : `/api/bookings?role=mistri&status=pending`
      
      const res = await fetch(url, { cache: 'no-store' })
      const json = await res.json()

      if (json.success && Array.isArray(json.data)) {
        const mapped: BookingRequest[] = json.data.map((item: any) => ({
          id: item.id,
          bookingNumber: item.bookingNumber || item.booking_number || 'MST-LIVE',
          mistriId: item.mistriId,
          mistriPhone: item.mistriPhone,
          customerName: item.customerName || item.customer_name || 'সম্মানিত গ্রাহক',
          customerPhone: item.customerPhone || item.contact_phone || '017XXXXXXXX',
          customerGeneralArea: item.jobAddress || item.location || 'ঠাকুরগাঁও সদর',
          jobAddress: item.jobAddress || item.location || '',
          distanceKm: item.distanceKm || 1.4,
          serviceName: item.serviceName || item.subcategory || 'সাধারণ কারিগরি কাজ',
          description: item.description || item.workDescription || 'কাজের বিবরণ দেওয়া হয়নি।',
          preferredDate: item.preferredDate || item.date || new Date().toISOString().slice(0, 10),
          preferredTime: item.preferredTime || 'সকাল ১০:০০ - ১২:০০',
          proposedBudget: item.estimatedBudget || item.amount || 400,
          workPhotos: item.workPhotos || [],
          submittedAt: 'আজকে',
          status: item.status || 'pending',
        }))
        setRequests(mapped)
      }
    } catch (err) {
      console.error('Error fetching requests:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests(true)

    // Real-time polling every 4 seconds
    const interval = setInterval(() => fetchRequests(false), 4000)
    window.addEventListener('focus', () => fetchRequests(false))
    window.addEventListener('storage', () => fetchRequests(false))

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', () => fetchRequests(false))
      window.removeEventListener('storage', () => fetchRequests(false))
    }
  }, [])

  // 1. Direct Accept Handler
  const handleAcceptDirect = async (reqId: string) => {
    try {
      const res = await fetch(`/api/bookings/${reqId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      })
      const data = await res.json()
      if (data.success) {
        setRequests(prev => prev.filter(r => r.id !== reqId))
        setSuccessToast(isBn ? '✓ বুকিং অনুরোধটি সরাসরি গ্রহণ করা হয়েছে! কাস্টমারের পূর্ণ বিবরণ উন্মুক্ত হয়েছে।' : 'Request accepted successfully!')
        setTimeout(() => setSuccessToast(null), 4000)
      }
    } catch (err) {
      console.error('Failed to accept request:', err)
    }
  }

  // 2. Reject with Busy Reason Handler
  const handleConfirmDecline = async () => {
    if (!selectedDeclineReq) return
    setIsSubmittingDecline(true)

    const finalReason = customDeclineReason.trim() 
      ? customDeclineReason.trim() 
      : declineReason

    try {
      const res = await fetch(`/api/bookings/${selectedDeclineReq.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          reason: finalReason,
        }),
      })
      const data = await res.json()
      setIsSubmittingDecline(false)

      if (data.success) {
        setRequests(prev => prev.filter(r => r.id !== selectedDeclineReq.id))
        setSelectedDeclineReq(null)
        setCustomDeclineReason('')
        setSuccessToast(isBn ? '✓ বুকিং অনুরোধটি ব্যস্ততা জানিয়ে প্রত্যাখ্যান করা হয়েছে।' : 'Request declined due to schedule.')
        setTimeout(() => setSuccessToast(null), 4000)
      }
    } catch (err) {
      setIsSubmittingDecline(false)
      console.error('Failed to decline:', err)
    }
  }

  // 3. Accept with Proposal (Custom Time) Handler
  const handleConfirmProposal = async () => {
    if (!selectedProposalReq) return
    setIsSubmittingProposal(true)

    try {
      const res = await fetch(`/api/bookings/${selectedProposalReq.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'accepted',
          proposedDate: proposedDate || selectedProposalReq.preferredDate,
          proposedTime: proposedTime,
          agreedPrice: proposedPrice ? Number(proposedPrice) : selectedProposalReq.proposedBudget,
          reason: proposalNotes || 'মিস্ত্রী সুবিধাজনক নতুন সময় প্রস্তাব করেছেন',
        }),
      })
      const data = await res.json()
      setIsSubmittingProposal(false)

      if (data.success) {
        setRequests(prev => prev.filter(r => r.id !== selectedProposalReq.id))
        setSelectedProposalReq(null)
        setSuccessToast(isBn ? '✓ নতুন সুবিধাজনক সময়ের প্রস্তাব সহ বুকিং গ্রহণ করা হয়েছে! গ্রাহককে জানানো হয়েছে।' : 'Accepted with your proposed schedule!')
        setTimeout(() => setSuccessToast(null), 4000)
      }
    } catch (err) {
      setIsSubmittingProposal(false)
      console.error('Failed to submit proposal:', err)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-28">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/mistri/profile')}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 mb-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isBn ? 'মিস্ত্রী প্রোফাইল ও ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Inbox className="h-6 w-6 text-[#2c7865]" />
            <span>{isBn ? 'নতুন কাজের অনুরোধ ইনবক্স' : 'Incoming Booking Requests'}</span>
          </h1>
          <p className="text-xs text-stone-600">
            {isBn 
              ? 'গ্রাহকদের পাঠানো কাজের অনুরোধ সরাসরি গ্রহণ করুন, ব্যস্ত থাকলে কারণ লিখে বাতিল করুন বা সুবিধাজনক সময় প্রস্তাব দিন' 
              : 'Review customer booking requests, accept directly, decline if busy, or propose an alternative time'}
          </p>
        </div>

        <Badge variant="neutral" className="skeuo-pill bg-[#2c7865] text-[#fefded] text-xs font-bold px-3 py-1 self-start sm:self-center">
          {toBanglaNumber(requests.length)} {isBn ? 'টি নতুন অনুরোধ' : 'New Requests'}
        </Badge>
      </div>

      {successToast && (
        <div className="rounded-2xl bg-[#2c7865] text-[#fefded] p-4 text-xs font-bold flex items-center gap-2 shadow-md">
          <CheckCircle2 className="h-5 w-5 text-[#fefded]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center text-xs text-stone-600 flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#2c7865]" />
          <span>{isBn ? 'অনুরোধ তালিকা লোড হচ্ছে...' : 'Loading requests...'}</span>
        </div>
      )}

      {/* Requests List */}
      {!isLoading && (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="p-5 skeuo-surface space-y-4 border border-stone-300">
              <div className="flex items-center justify-between border-b border-stone-200/70 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-900">{req.bookingNumber}</span>
                  <Badge variant="neutral" className="bg-[#2c7865]/10 text-[#2c7865] border border-[#2c7865]/30 text-[10px] font-bold">
                    {req.serviceName}
                  </Badge>
                </div>
                <span className="text-[11px] text-stone-500 font-medium">
                  ⏱️ {req.submittedAt}
                </span>
              </div>

              {/* Description and location */}
              <div className="space-y-2">
                <p className="text-xs text-stone-800 bg-[#fefded] p-3 rounded-2xl border border-stone-200 leading-relaxed font-medium">
                  "{req.description}"
                </p>

                {/* Uploaded Photos */}
                {req.workPhotos && req.workPhotos.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[11px] font-semibold text-stone-600 block mb-1.5 flex items-center gap-1">
                      <Camera className="h-3.5 w-3.5 text-[#2c7865]" />
                      <span>গ্রাহকের সংযুক্ত ছবি ({toBanglaNumber(req.workPhotos.length)}টি):</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {req.workPhotos.map((photo, pIdx) => (
                        <a key={pIdx} href={photo} target="_blank" rel="noreferrer">
                          <img 
                            src={photo} 
                            alt="Problem photo" 
                            className="h-16 w-16 rounded-xl object-cover border border-stone-300 hover:scale-105 transition-transform cursor-pointer shadow-xs" 
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-700 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-stone-900">
                    <MapPin className="h-3.5 w-3.5 text-[#2c7865]" />
                    <span>{req.customerGeneralArea}</span>
                  </span>
                  <span>•</span>
                  <span className="font-bold text-[#2c7865]">
                    {formatDistance(req.distanceKm || 1.4, isBn)} দূরে
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-stone-800">
                    <Calendar className="h-3.5 w-3.5 text-stone-500" />
                    <span>{req.preferredDate}, {req.preferredTime}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-stone-600 font-mono">
                    <Phone className="h-3.5 w-3.5 text-stone-500" />
                    <span>{req.customerPhone}</span>
                  </span>
                </div>
              </div>

              {/* Bottom Actions & Price */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-stone-200/70">
                <div>
                  <span className="text-[10px] text-stone-500 block font-semibold">{isBn ? 'গ্রাহকের প্রস্তাবিত বাজেট' : 'Proposed Budget'}</span>
                  <span className="text-base font-black text-stone-900">{formatBDT(req.proposedBudget, isBn)}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                  {/* Reject / Busy Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedDeclineReq(req)
                      setDeclineReason('আমি বর্তমানে অন্য কাজে ব্যস্ত আছি')
                      setCustomDeclineReason('')
                    }}
                    className="skeuo-btn-light text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    <span>{isBn ? 'ব্যস্ততা জানিয়ে বাতিল' : 'Decline (Busy)'}</span>
                  </Button>

                  {/* Propose Convenient Time Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedProposalReq(req)
                      setProposedDate(req.preferredDate)
                      setProposedTime(req.preferredTime)
                      setProposedPrice(req.proposedBudget)
                      setProposalNotes('')
                    }}
                    className="skeuo-btn-light text-xs font-bold text-[#2c7865] border-[#2c7865]/30 hover:bg-[#2c7865]/10 cursor-pointer"
                  >
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{isBn ? 'সুবিধাজনক সময় প্রস্তাব দিন' : 'Propose Time'}</span>
                  </Button>

                  {/* Direct Accept Button */}
                  <Button
                    size="sm"
                    onClick={() => handleAcceptDirect(req.id)}
                    className="skeuo-btn-dark text-xs font-bold px-4 cursor-pointer"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    <span>{isBn ? 'সরাসরি গ্রহণ করুন' : 'Accept Directly'}</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {requests.length === 0 && (
            <div className="p-12 text-center skeuo-surface rounded-3xl border border-stone-300 space-y-3">
              <CheckCircle2 className="h-10 w-10 text-[#2c7865] mx-auto" />
              <h3 className="text-base font-bold text-stone-900">
                {isBn ? 'বর্তমানে কোনো নতুন অপেক্ষমান অনুরোধ নেই' : 'No New Requests'}
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                {isBn 
                  ? 'আপনার সেবা চেয়ে কোনো গ্রাহক বুকিং অনুরোধ পাঠালে সাথে সাথে এখানে প্রদর্শিত হবে এবং আপনি নোটিফিকেশন পাবেন।' 
                  : 'Customer booking requests will appear here in real-time as they arrive.'}
              </p>
              <div className="pt-2">
                <Link href="/mistri/bookings">
                  <Button variant="outline" size="sm" className="skeuo-btn-light text-xs font-bold text-[#2c7865]">
                    {isBn ? 'চলমান ও অতীতের বুকিং ইতিহাস দেখুন' : 'View Job History'}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Decline with Reason / Busy (বিজি লিখে রিজেক্ট) */}
      {selectedDeclineReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 skeuo-surface border-stone-400 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span>{isBn ? 'ব্যস্ততা জানিয়ে অনুরোধ বাতিল' : 'Decline Request'}</span>
              </h3>
              <button 
                onClick={() => setSelectedDeclineReq(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              {isBn 
                ? 'গ্রাহককে অবহিত করার জন্য বাতিলের কারণ নির্বাচন করুন অথবা নিজের মতো লিখে দিন:' 
                : 'Select or write a reason to inform the customer:'}
            </p>

            <div className="space-y-3">
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900 focus:border-red-600 focus:outline-none"
              >
                <option value="আমি বর্তমানে অন্য কাজে ব্যস্ত আছি">{isBn ? 'আমি বর্তমানে অন্য কাজে ব্যস্ত আছি' : 'Currently busy with another job'}</option>
                <option value="আজকের দিনের সব শিডিউল পূর্ণ">{isBn ? 'আজকের দিনের সব শিডিউল পূর্ণ' : 'Fully booked today'}</option>
                <option value="কাজের স্থান অনেক দূরে">{isBn ? 'কাজের স্থান অনেক দূরে' : 'Location too far away'}</option>
                <option value="প্রস্তাবিত বাজেট কম">{isBn ? 'প্রস্তাবিত বাজেট কম' : 'Proposed budget too low'}</option>
                <option value="জরুরি কারণে আজ কাজ নিতে পারছি না">{isBn ? 'জরুরি কারণে আজ কাজ নিতে পারছি না' : 'Unavailable due to emergency'}</option>
              </select>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-700">
                  {isBn ? 'অথবা নিজের মন্তব্য লিখুন (ঐচ্ছিক):' : 'Or write custom reason (Optional):'}
                </label>
                <input
                  type="text"
                  value={customDeclineReason}
                  onChange={(e) => setCustomDeclineReason(e.target.value)}
                  placeholder={isBn ? 'যেমন: ভাই আমি বিকালে বিজি, কাল সকালে পারব...' : 'Custom note...'}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900 focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedDeclineReq(null)}
                className="skeuo-btn-light text-xs font-bold"
              >
                {isBn ? 'ফিরে যান' : 'Back'}
              </Button>
              <Button 
                size="sm" 
                onClick={handleConfirmDecline}
                isLoading={isSubmittingDecline}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                {isBn ? 'বাতিল নিশ্চিত করুন' : 'Confirm Decline'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal 2: Accept with Proposal (সুবিধাজনক সময় Proposal দিয়ে গ্রহণ) */}
      {selectedProposalReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 skeuo-surface border-stone-400 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#2c7865]" />
                <span>{isBn ? 'সুবিধাজনক সময় প্রস্তাব দিয়ে গ্রহণ' : 'Propose New Time & Accept'}</span>
              </h3>
              <button 
                onClick={() => setSelectedProposalReq(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              {isBn 
                ? 'গ্রাহকের অনুরোধটি আপনি গ্রহণ করছেন, তবে আপনার সুবিধাজনক তারিখ ও সময় নিচে নির্ধারণ করে দিন:' 
                : 'Accept this job by proposing your convenient alternative date and time:'}
            </p>

            <div className="space-y-3">
              {/* Proposed Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  {isBn ? 'প্রস্তাবিত কাজের তারিখ' : 'Proposed Date'}
                </label>
                <input
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900 focus:border-[#2c7865] focus:outline-none"
                  required
                />
              </div>

              {/* Proposed Time Slot */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  {isBn ? 'প্রস্তাবিত সময়' : 'Proposed Time Slot'}
                </label>
                <select
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900 focus:border-[#2c7865] focus:outline-none"
                >
                  <option value="সকাল ৯:০০ - ১১:০০">সকাল ৯:০০ - ১১:০০</option>
                  <option value="সকাল ১১:০০ - দুপুর ১:০০">সকাল ১১:০০ - দুপুর ১:০০</option>
                  <option value="দুপুর ২:০০ - বিকাল ৪:০০">দুপুর ২:০০ - বিকাল ৪:০০</option>
                  <option value="বিকাল ৪:০০ - সন্ধ্যা ৬:০০">বিকাল ৪:০০ - সন্ধ্যা ৬:০০</option>
                  <option value="সন্ধ্যা ৬:০০ - রাত ৮:০০">সন্ধ্যা ৬:০০ - রাত ৮:০০</option>
                </select>
              </div>

              {/* Proposed Price */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  {isBn ? 'সম্মানী / মজুরি (টাকা)' : 'Fee / Wage (BDT)'}
                </label>
                <input
                  type="number"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900 focus:border-[#2c7865] focus:outline-none"
                />
              </div>

              {/* Note to customer */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-700">
                  {isBn ? 'গ্রাহকের উদ্দেশ্যে বিশেষ বার্তা (ঐচ্ছিক):' : 'Message to Customer (Optional):'}
                </label>
                <input
                  type="text"
                  value={proposalNotes}
                  onChange={(e) => setProposalNotes(e.target.value)}
                  placeholder={isBn ? 'যেমন: আমি এই সময়ে এসে প্রয়োজনীয় যন্ত্রাংশ নিয়ে চেক করব...' : 'Note for customer...'}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900 focus:border-[#2c7865] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedProposalReq(null)}
                className="skeuo-btn-light text-xs font-bold"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button 
                size="sm" 
                onClick={handleConfirmProposal}
                isLoading={isSubmittingProposal}
                className="skeuo-btn-dark text-xs font-bold px-4 cursor-pointer"
              >
                {isBn ? 'প্রস্তাব সহ গ্রহণ করুন' : 'Submit & Accept'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
