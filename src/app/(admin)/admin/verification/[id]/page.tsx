'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, ShieldCheck, CheckCircle2, XCircle, 
  AlertCircle, ZoomIn, Lock, MapPin, Phone, User, 
  Calendar, Wrench, Shield, FileText 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toBanglaNumber } from '@/lib/utils'

export default function DocumentInspectorPage() {
  const router = useRouter()
  const params = useParams()
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [activeModal, setActiveModal] = useState<'approve' | 'reject' | 'correction' | null>(null)
  const [internalNotes, setInternalNotes] = useState('NID নম্বর এবং ছবি সামঞ্জস্যপূর্ণ। মোবাইল নম্বর ভেরিফাইড।')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [zoomImage, setZoomImage] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const [applicant, setApplicant] = useState<any>({
    id: params.id || 'app-01',
    name: 'মোঃ রফিকুল ইসলাম',
    phone: '01712345678',
    phoneVerified: true,
    nidNumber: '1990521934000123',
    dateOfBirth: '১৯৯০-০৫-১৫',
    gender: 'পুরুষ',
    district: 'ঠাকুরগাঁও',
    upazila: 'ঠাকুরগাঁও সদর',
    area: 'বাসস্ট্যান্ড এলাকা',
    address: 'রোড নং ৩, পূর্ব হাজীপাড়া, ঠাকুরগাঁও',
    serviceRadiusKm: 15,
    category: 'ইলেকট্রিক্যাল কাজ',
    subcategories: ['বাসা-বাড়ির ওয়্যারিং', 'ফ্যান ও লাইটিং ফিটিং', 'সুইচ ও সকেট মেরামত'],
    experienceYears: 6,
    chargeType: 'আলোচনা সাপেক্ষে (Negotiable)',
    baseCharge: 400,
    bio: 'আমি বিগত ৬ বছর ধরে ঠাকুরগাঁও সদর ও আশপাশের এলাকায় সব ধরনের বৈদ্যুতিক ওয়্যারিং, ফ্যান ফিটিংস ও মেরামতের কাজ সুনামের সাথে করে আসছি।',
    nidFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    nidBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    submittedAt: '২০২৬-১১-০২, বিকাল ৪:৩০',
  })

  React.useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/admin/verification/${params.id}`)
        const data = await res.json()
        if (data.success && data.applicant) {
          setApplicant(data.applicant)
        }
      } catch {}
    }
    loadData()
  }, [params.id])

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await fetch(`/api/admin/verification/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', internalNotes }),
      })
      setIsProcessing(false)
      setActiveModal(null)
      setActionSuccess(isBn ? 'মিস্ত্রী সফলভাবে অনুমোদিত হয়েছে এবং পাবলিক সার্চে লাইভ করা হয়েছে!' : 'Mistri account successfully approved and is now live!')
      setTimeout(() => router.push('/admin/verification'), 1200)
    } catch {
      setIsProcessing(false)
      router.push('/admin/verification')
    }
  }

  const handleReject = async () => {
    if (!rejectionReason) return
    setIsProcessing(true)
    try {
      await fetch(`/api/admin/verification/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejectionReason }),
      })
      setIsProcessing(false)
      setActiveModal(null)
      setActionSuccess(isBn ? 'আবেদন প্রত্যাখ্যান করা হয়েছে এবং তালিকা থেকে মুছে দেওয়া হয়েছে।' : 'Application rejected and removed.')
      setTimeout(() => router.push('/admin/verification'), 1200)
    } catch {
      setIsProcessing(false)
      router.push('/admin/verification')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/verification">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>{isBn ? 'তালিকায় ফিরুন' : 'Back to Queue'}</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isBn ? 'ডকুমেন্ট ও প্রোফাইল পরিদর্শক' : 'NID Document Inspector'}
            </h1>
            <p className="text-xs text-slate-500">
              {isBn ? 'আবেদনকারী: ' : 'Applicant: '} <strong className="text-slate-800">{applicant.name}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setActiveModal('reject')}
            className="text-xs font-semibold"
          >
            <XCircle className="h-4 w-4 mr-1" />
            <span>{isBn ? 'প্রত্যাখ্যান করুন' : 'Reject'}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setActiveModal('approve')}
            className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold px-4"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            <span>{isBn ? 'অনুমোদন করুন (Approve)' : 'Approve Profile'}</span>
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid: Left Side NID Documents, Right Side Detailed Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: NID Document Vault */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4 border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Lock className="h-4 w-4 text-blue-600" />
                <span>{isBn ? 'সুরক্ষিত NID কার্ড ফাইল' : 'Protected NID Document Vault'}</span>
              </div>
              <Badge variant="warning" className="text-[10px]">
                {isBn ? 'ব্যক্তিগত ও গোপনীয়' : 'Strictly Confidential'}
              </Badge>
            </div>

            <div className="rounded-xl bg-slate-900/95 text-white p-3 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">{isBn ? 'যাচাইযোগ্য NID নম্বর' : 'NID Number'}</span>
                <span className="font-mono font-bold text-sm tracking-wider">{applicant.nidNumber}</span>
              </div>
              <Badge variant="success" className="text-[10px]">
                {isBn ? 'ফরম্যাটে সঠিক' : 'Valid Format'}
              </Badge>
            </div>

            {/* Side-by-side NID Photos */}
            <div className="space-y-3">
              {/* NID Front */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{isBn ? 'NID সামনের দিক (Front Side)' : 'Front Side'}</span>
                  <button
                    onClick={() => setZoomImage(applicant.nidFrontUrl)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-[11px]"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                    <span>{isBn ? 'বড় করে দেখুন' : 'Zoom In'}</span>
                  </button>
                </div>
                <div 
                  onClick={() => setZoomImage(applicant.nidFrontUrl)}
                  className="relative group rounded-2xl border-2 border-slate-200 overflow-hidden cursor-pointer bg-slate-100"
                >
                  <img
                    src={applicant.nidFrontUrl}
                    alt="NID Front"
                    className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                    <ZoomIn className="h-5 w-5" />
                    <span>ক্লিক করে জুম করুন</span>
                  </div>
                </div>
              </div>

              {/* NID Back */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{isBn ? 'NID পেছনের দিক (Back Side)' : 'Back Side'}</span>
                  <button
                    onClick={() => setZoomImage(applicant.nidBackUrl)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-[11px]"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                    <span>{isBn ? 'বড় করে দেখুন' : 'Zoom In'}</span>
                  </button>
                </div>
                <div 
                  onClick={() => setZoomImage(applicant.nidBackUrl)}
                  className="relative group rounded-2xl border-2 border-slate-200 overflow-hidden cursor-pointer bg-slate-100"
                >
                  <img
                    src={applicant.nidBackUrl}
                    alt="NID Back"
                    className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                    <ZoomIn className="h-5 w-5" />
                    <span>ক্লিক করে জুম করুন</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 p-2 bg-slate-50 rounded-xl">
              ⚠️ {isBn 
                ? 'আইনি সতর্কবার্তা: এই ছবিগুলো শুধুমাত্র ভেরিফিকেশন কাজের জন্য ক্ষণস্থায়ী সাইনড ইউআরএল দিয়ে প্রদর্শিত হচ্ছে। পাবলিক ডাটাবেজে এটি সুরক্ষিত।'
                : 'Legal Notice: These files are served via short-lived signed URLs for Admin audit only.'}
            </div>
          </Card>

          {/* Internal Notes Box */}
          <Card className="p-4 space-y-2">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-blue-600" />
              <span>{isBn ? 'অ্যাডমিন ভেরিফিকেশন মন্তব্য ও অভ্যন্তরীণ নোট' : 'Internal Admin Remarks & Verification Notes'}</span>
            </label>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              placeholder={isBn ? 'যাচাই সংক্রান্ত পর্যবেক্ষণ লিখুন...' : 'Add notes...'}
            />
          </Card>
        </div>

        {/* RIGHT: Applicant Information Checklist */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <User className="h-4 w-4 text-blue-600" />
                <span>{isBn ? 'আবেদনকারীর পূর্ণ পরিচিতি' : 'Applicant Information'}</span>
              </div>
              <Badge variant="success" className="text-[10px]">
                {isBn ? 'মোবাইল যাচাইকৃত' : 'OTP Verified'}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">{isBn ? 'নাম:' : 'Full Name:'}</span>
                <span className="font-bold text-slate-900">{applicant.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">{isBn ? 'মোবাইল নম্বর:' : 'Mobile Phone:'}</span>
                <span className="font-bold text-slate-900">{applicant.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">{isBn ? 'জন্ম তারিখ ও লিঙ্গ:' : 'DOB & Gender:'}</span>
                <span className="font-bold text-slate-900">{applicant.dateOfBirth} ({applicant.gender})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">{isBn ? 'জেলা ও উপজেলা:' : 'District & Upazila:'}</span>
                <span className="font-bold text-slate-900">{applicant.district}, {applicant.upazila}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">{isBn ? 'এলাকা ও ঠিকানা:' : 'Area & Address:'}</span>
                <span className="font-bold text-slate-900 text-right">{applicant.address}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">{isBn ? 'সার্ভিস ব্যাসার্ধ:' : 'Service Radius:'}</span>
                <span className="font-bold text-blue-600">{toBanglaNumber(applicant.serviceRadiusKm)} কিমি</span>
              </div>
            </div>
          </Card>

          {/* Professional Skills Card */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Wrench className="h-4 w-4 text-blue-600" />
                <span>{isBn ? 'দক্ষতা ও কাজের বিবরণ' : 'Skills & Rates'}</span>
              </div>
              <Badge variant="primary" className="text-[10px]">
                {toBanglaNumber(applicant.experienceYears)} {isBn ? 'বছরের অভিজ্ঞতা' : 'Years'}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block mb-1">{isBn ? 'প্রধান ক্যাটাগরি:' : 'Category:'}</span>
                <Badge variant="primary" className="text-xs">{applicant.category}</Badge>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1.5">{isBn ? 'নির্বাচিত সাব-ক্যাটাগরি সমূহ:' : 'Subcategories:'}</span>
                <div className="flex flex-wrap gap-1.5">
                  {(applicant.subcategories || []).map((sub: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between py-1.5 border-t border-slate-100">
                <span className="text-slate-500 font-semibold">{isBn ? 'মজুরি নির্ধারণ পদ্ধতি:' : 'Charge Model:'}</span>
                <span className="font-bold text-slate-900">{applicant.chargeType}</span>
              </div>

              <div className="flex justify-between py-1.5 border-t border-slate-100">
                <span className="text-slate-500 font-semibold">{isBn ? 'বেস মজুরি / ভিজিট ফি:' : 'Base Charge:'}</span>
                <span className="font-bold text-emerald-600">৳{toBanglaNumber(applicant.baseCharge)}</span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-semibold block mb-1">{isBn ? 'কাজের বিবরণ:' : 'Bio:'}</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl leading-relaxed">
                  {applicant.bio}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {zoomImage && (
        <div 
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={zoomImage} alt="Zoomed NID" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
            <p className="text-center text-white text-xs mt-2 font-semibold">
              {isBn ? 'বন্ধ করতে যেকোনো স্থানে ক্লিক করুন' : 'Click anywhere to close'}
            </p>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {activeModal === 'approve' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900">
                {isBn ? 'আবেদন অনুমোদনের নিশ্চয়তা' : 'Confirm Mistri Approval'}
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              {isBn 
                ? `আপনি কি নিশ্চিত যে "${applicant.name}" এর এনআইডি ও তথ্য যাচাই সঠিক হয়েছে এবং তাকে পাবলিক সার্চে দৃশ্যমান করতে চান?`
                : `Are you sure you want to approve ${applicant.name} and make their profile live for public booking?`}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button size="sm" isLoading={isProcessing} onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">
                {isBn ? 'হ্যাঁ, অনুমোদন করুন' : 'Confirm & Approve'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {activeModal === 'reject' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <XCircle className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900">
                {isBn ? 'আবেদন প্রত্যাখ্যানের কারণ' : 'Specify Rejection Reason'}
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              {isBn ? 'প্রত্যাখ্যানের সঠিক কারণ উল্লেখ করুন, যা আবেদনকারীর অ্যাকাউন্টে নির্দেশ করা হবে:' : 'Provide the reason for rejection:'}
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
              placeholder={isBn ? 'যেমন: আপলোডকৃত NID ছবি অস্পষ্ট বা তথ্যে গরমিল রয়েছে...' : 'e.g. Unclear NID image...'}
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button size="sm" variant="danger" isLoading={isProcessing} onClick={handleReject} disabled={!rejectionReason}>
                {isBn ? 'প্রত্যাখ্যান নিশ্চিত করুন' : 'Confirm Reject'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

