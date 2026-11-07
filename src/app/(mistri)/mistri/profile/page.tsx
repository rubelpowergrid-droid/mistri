'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  User, Phone, ShieldCheck, Wrench, Lock, CheckCircle2, 
  MapPin, Clock, Star, AlertCircle, Save, ArrowLeft, 
  Camera, MessageCircle, LogOut, ExternalLink, RefreshCw, X
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toBanglaNumber, formatBDT } from '@/lib/utils'

const SERVICE_SUBCATEGORIES: Record<string, string[]> = {
  'electrical-services': [
    'বাসা-বাড়ির ওয়্যারিং',
    'ফ্যান ও লাইটিং ফিটিং',
    'সুইচ ও সকেট মেরামত',
    'সার্কিট ব্রেকার ও ডিবি বোর্ড',
    'আইপিএস ও ইউপিএস ওয়্যারিং',
    'সাব-মার্সিবল মোটর ওয়্যারিং',
  ],
  'plumbing-services': [
    'পাইপ ফিটিং ও মেরামত',
    'পানির মোটর ও পাম্প মেরামত',
    'স্যানিটারি ও বাথরুম ফিটিংস',
    'পানির ট্যাংক পরিষ্কার',
  ],
  'painting-services': [
    'ঘরের ভেতরের দেয়াল রং',
    'বাইরের দেয়াল ও ওয়েদারকোট',
    'কাঠের বার্নিশ ও পলিশ',
    'পুটিং ও প্রাইমার কাজ',
  ],
  'masonry-services': [
    'ইট গাঁথুনি ও প্লাস্টার',
    'টাইলস ও মার্বেল ফিটিংস',
    'ছাদ ঢালাই ও কংক্রিট কাজ',
  ],
  'carpentry-services': [
    'দরজা-জানালার ফ্রেম',
    'ফার্নিচার মেরামত ও অ্যাসেম্বলি',
    'মডুলার ক্যাবিনেট',
  ],
}

export default function MistriProfilePage() {
  const router = useRouter()
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  // Loading & state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('')
  const [saveErrorMessage, setSaveErrorMessage] = useState('')

  // Mistri profile data
  const [profile, setProfile] = useState<any>({
    id: '',
    fullName: 'মোঃ জুয়েল রানা',
    fatherName: 'মোঃ আব্দুল জব্বার',
    phone: '01722159830',
    nidNumber: '1990521934000123',
    dateOfBirth: '১৯৯০-০৫-১৫',
    gender: 'পুরুষ (Male)',
    professionalTitle: 'সিনিয়র ইলেকট্রিশিয়ান ও টেকনিশিয়ান',
    category: 'ইলেকট্রিক্যাল কাজ',
    categorySlug: 'electrical-services',
    subcategories: ['বাসা-বাড়ির ওয়্যারিং', 'ফ্যান ও লাইটিং ফিটিং', 'সুইচ ও সকেট মেরামত'],
    experienceYears: 6,
    district: 'ঠাকুরগাঁও',
    upazila: 'ঠাকুরগাঁও সদর',
    streetAddress: 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
    serviceRadiusKm: 15,
    chargeType: 'আলোচনা সাপেক্ষে (Negotiable)',
    baseCharge: 400,
    bio: 'আমি বিগত ৬ বছর ধরে ঠাকুরগাঁও সদর ও আশপাশের এলাকায় সব ধরনের বৈদ্যুতিক ওয়্যারিং, ফ্যান ফিটিংস ও মেরামতের কাজ সুনামের সাথে করে আসছি।',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    nidFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    nidBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    approvalStatus: 'approved',
    isAvailable: true,
    rating: 5.0,
    reviewsCount: 1,
    completedJobs: 14,
  })

  // Phone Change Modal States
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpChannel, setOtpChannel] = useState<'whatsapp' | 'sms'>('whatsapp')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isOtpLoading, setIsOtpLoading] = useState(false)
  const [phoneModalError, setPhoneModalError] = useState('')
  const [phoneModalSuccess, setPhoneModalSuccess] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load profile on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      let phoneToLoad = '01722159830'
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('mistri_user')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (parsed.phone) phoneToLoad = parsed.phone
          } catch {}
        }
      }

      try {
        const res = await fetch(`/api/mistri/profile?phone=${phoneToLoad}`)
        const data = await res.json()
        if (data.success && data.profile) {
          setProfile(data.profile)
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Subcategory toggle
  const toggleSubcategory = (sub: string) => {
    setProfile((prev: any) => {
      const current = prev.subcategories || []
      const updated = current.includes(sub)
        ? current.filter((s: string) => s !== sub)
        : [...current, sub]
      return { ...prev, subcategories: updated }
    })
  }

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert(isBn ? 'অনুগ্রহ করে শুধুমাত্র ছবি ফাইল নির্বাচন করুন' : 'Please upload an image')
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      alert(isBn ? 'ছবির সাইজ সর্বোচ্চ ৮ মেগাবাইট হতে পারবে' : 'Image cannot exceed 8MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        setProfile((prev: any) => ({ ...prev, avatar: result }))
      }
    }
    reader.readAsDataURL(file)
  }

  // Save editable profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccessMessage('')
    setSaveErrorMessage('')

    try {
      const res = await fetch('/api/mistri/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: profile.phone,
          professionalTitle: profile.professionalTitle,
          category: profile.category,
          categorySlug: profile.categorySlug,
          subcategories: profile.subcategories,
          experienceYears: profile.experienceYears,
          district: profile.district,
          upazila: profile.upazila,
          streetAddress: profile.streetAddress,
          serviceRadiusKm: profile.serviceRadiusKm,
          chargeType: profile.chargeType,
          baseCharge: profile.baseCharge,
          bio: profile.bio,
          isAvailable: profile.isAvailable,
          avatar: profile.avatar,
        }),
      })

      const data = await res.json()
      setIsSaving(false)

      if (data.success) {
        setSaveSuccessMessage(isBn ? '✓ আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Profile saved successfully!')
        setTimeout(() => setSaveSuccessMessage(''), 5000)
      } else {
        setSaveErrorMessage(data.error || 'সংরক্ষণ করতে ব্যর্থ হয়েছে')
      }
    } catch {
      setIsSaving(false)
      setSaveErrorMessage('সার্ভার ত্রুটি, পুনরায় চেষ্টা করুন')
    }
  }

  // Send OTP for phone change
  const handleSendOtp = async () => {
    setPhoneModalError('')
    setPhoneModalSuccess('')
    const clean = newPhone.replace(/[^0-9]/g, '')

    if (clean.length < 11) {
      setPhoneModalError(isBn ? 'সঠিক ১১ সংখ্যার নতুন মোবাইল নম্বর লিখুন' : 'Enter a valid 11-digit phone number')
      return
    }

    if (clean === profile.phone.replace(/[^0-9]/g, '')) {
      setPhoneModalError(isBn ? 'নতুন নম্বরটি আপনার বর্তমান নম্বরের চেয়ে ভিন্ন হতে হবে' : 'Must be different from current phone')
      return
    }

    setIsOtpLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean, channel: otpChannel }),
      })
      const data = await res.json()
      setIsOtpLoading(false)

      if (data.success) {
        setIsOtpSent(true)
        setPhoneModalSuccess(
          isBn 
            ? `✓ ${otpChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'}-এ ৪ ডিজিটের ওটিপি পাঠানো হয়েছে!` 
            : 'OTP code sent successfully!'
        )
      } else {
        setPhoneModalError(data.error || 'ওটিপি পাঠাতে সমস্যা হয়েছে')
      }
    } catch {
      setIsOtpLoading(false)
      setIsOtpSent(true)
      setPhoneModalSuccess('টেস্ট ওটিপি কোড পাঠানো হয়েছে (১১৮১ বা ১২৩৪)')
    }
  }

  // Verify OTP and apply new phone number
  const handleVerifyAndChangePhone = async () => {
    setPhoneModalError('')
    setPhoneModalSuccess('')
    const clean = newPhone.replace(/[^0-9]/g, '')

    if (!otpCode || otpCode.length < 4) {
      setPhoneModalError(isBn ? 'সঠিক ওটিপি কোড লিখুন' : 'Enter valid OTP code')
      return
    }

    setIsOtpLoading(true)
    try {
      const res = await fetch('/api/mistri/profile/change-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPhone: profile.phone,
          newPhone: clean,
          otpCode,
        }),
      })

      const data = await res.json()
      setIsOtpLoading(false)

      if (data.success) {
        setProfile((prev: any) => ({ ...prev, phone: clean }))
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('mistri_user')
          if (stored) {
            const parsed = JSON.parse(stored)
            parsed.phone = clean
            localStorage.setItem('mistri_user', JSON.stringify(parsed))
          }
        }
        setPhoneModalSuccess('✓ মোবাইল নম্বর সফলভাবে পরিবর্তন ও আপডেট করা হয়েছে!')
        setTimeout(() => {
          setIsPhoneModalOpen(false)
          setIsOtpSent(false)
          setNewPhone('')
          setOtpCode('')
          setPhoneModalSuccess('')
        }, 1800)
      } else {
        setPhoneModalError(data.error || 'ভুল ওটিপি কোড! পুনরায় চেষ্টা করুন')
      }
    } catch {
      setIsOtpLoading(false)
      setPhoneModalError('সার্ভার সমস্যা, পুনরায় চেষ্টা করুন')
    }
  }

  const handleLogout = () => {
    if (confirm(isBn ? 'আপনি কি নিশ্চিত যে লগআউট করতে চান?' : 'Are you sure you want to log out?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mistri_user')
      }
      router.push('/login')
    }
  }

  const availableSubcategories = SERVICE_SUBCATEGORIES[profile.categorySlug] || SERVICE_SUBCATEGORIES['electrical-services']

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6 pb-28 sm:pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isBn ? 'হোম' : 'Home'}</span>
          </button>
          <span className="text-slate-300">|</span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isBn ? 'আমার মিস্ত্রী প্রোফাইল ও ড্যাশবোর্ড' : 'My Mistri Profile & Dashboard'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {profile.approvalStatus === 'approved' && (
            <Link href={`/mistri/${profile.id || 'm-jewel-rana'}`} target="_blank">
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLink className="h-3.5 w-3.5 mr-1 text-blue-600" />
                <span>{isBn ? 'পাবলিক ভিউ দেখুন' : 'View Public Profile'}</span>
              </Button>
            </Link>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="text-xs text-red-600 hover:bg-red-50 border-red-200"
          >
            <LogOut className="h-3.5 w-3.5 mr-1" />
            <span>{isBn ? 'লগআউট' : 'Logout'}</span>
          </Button>
        </div>
      </div>

      {/* Main Profile Summary Banner Card */}
      <Card className="p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl shadow-xl border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 text-center md:text-left">
          {/* Avatar with Camera upload button */}
          <div className="relative group">
            <img
              src={profile.avatar}
              alt={profile.fullName}
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-2 border-blue-500 shadow-lg"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer"
              title="প্রোফাইল ছবি পরিবর্তন করুন"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 justify-center md:justify-start">
              <h2 className="text-2xl font-black tracking-tight">{profile.fullName}</h2>
              {profile.approvalStatus === 'approved' ? (
                <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-2.5 py-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                  <span>ভেরিফাইড ও অনুমোদিত কারিগর</span>
                </Badge>
              ) : (
                <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs px-2.5 py-0.5">
                  <Clock className="h-3.5 w-3.5 mr-1 text-amber-400" />
                  <span>ভেরিফিকেশন পর্যালোচনায় রয়েছে</span>
                </Badge>
              )}
            </div>

            <p className="text-sm text-blue-400 font-semibold">{profile.professionalTitle}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300 pt-1 font-mono">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-blue-400" />
                <span>{profile.phone}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-400" />
                <span>{profile.district}, {profile.upazila}</span>
              </span>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 shrink-0 text-left">
            <span className="text-xs font-bold text-slate-300 block">কাজের প্রাপ্যতা:</span>
            <button
              type="button"
              onClick={() => setProfile((p: any) => ({ ...p, isAvailable: !p.isAvailable }))}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-3 ${
                profile.isAvailable
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-700/60 text-slate-400 border border-slate-600'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${profile.isAvailable ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                <span>{profile.isAvailable ? 'আমি কাজ নিতে প্রস্তুত' : 'সাময়িক বন্ধ'}</span>
              </span>
              <span className="text-[10px] underline">{profile.isAvailable ? 'অন' : 'অফ'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-center">
          <div>
            <span className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>৫.০</span>
            </span>
            <span className="text-[11px] text-slate-400">গ্রাহক সন্তুষ্টি</span>
          </div>
          <div>
            <span className="text-xl font-black text-white">{toBanglaNumber(profile.completedJobs || 14)}</span>
            <span className="text-[11px] text-slate-400">সম্পন্ন কাজ</span>
          </div>
          <div>
            <span className="text-xl font-black text-white">{toBanglaNumber(profile.reviewsCount || 1)}</span>
            <span className="text-[11px] text-slate-400">পাবলিক রিভিউ</span>
          </div>
        </div>
      </Card>

      {/* Success / Error Banners */}
      {saveSuccessMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {saveErrorMessage && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-bold text-red-800 flex items-center gap-2 shadow-xs">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <span>{saveErrorMessage}</span>
        </div>
      )}

      {/* SECTION 1: NON-EDITABLE / LOCKED NID INFO */}
      <Card className="p-5 sm:p-6 space-y-4 border-slate-200 shadow-xs bg-slate-50/50">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isBn ? 'জাতীয় পরিচয়পত্র ও ব্যক্তিগত তথ্য (স্থায়ী ও ভেরিফাইড)' : 'Verified NID & Personal Details (Locked)'}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {isBn 
                ? 'নিরাপত্তা ও গ্রাহক সুরক্ষার স্বার্থে এনআইডি এবং পরিচয় সংক্রান্ত তথ্য অ্যাডমিন দ্বারা অনুমোদিত হওয়ায় সরাসরি পরিবর্তনযোগ্য নয়।'
                : 'For security and fraud prevention, verified identity credentials cannot be modified.'}
            </p>
          </div>
          <Badge variant="neutral" className="text-[10px] bg-slate-200 text-slate-700 shrink-0">
            🔒 অপরিবর্তনযোগ্য
          </Badge>
        </div>

        {/* Locked Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <span>পূর্ণ নাম (এনআইডি অনুযায়ী)</span>
              <Lock className="h-3 w-3 text-slate-400" />
            </label>
            <input
              type="text"
              value={profile.fullName}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2 px-3 text-xs text-slate-700 font-bold cursor-not-allowed select-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <span>পিতার নাম / অভিভাবক</span>
              <Lock className="h-3 w-3 text-slate-400" />
            </label>
            <input
              type="text"
              value={profile.fatherName || 'মোঃ আব্দুল জব্বার'}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2 px-3 text-xs text-slate-700 cursor-not-allowed select-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <span>জন্ম তারিখ</span>
              <Lock className="h-3 w-3 text-slate-400" />
            </label>
            <input
              type="text"
              value={profile.dateOfBirth}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2 px-3 text-xs text-slate-700 cursor-not-allowed select-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <span>১০ বা ১৭ সংখ্যার এনআইডি নম্বর</span>
              <Lock className="h-3 w-3 text-slate-400" />
            </label>
            <input
              type="text"
              value={profile.nidNumber}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2 px-3 text-xs text-slate-700 font-mono font-bold cursor-not-allowed select-none"
            />
          </div>
        </div>

        {/* NID Card Preview Cards */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-600 block mb-2">সংরক্ষিত জাতীয় পরিচয়পত্রের ছবি:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">এনআইডি সামনের দিক:</span>
              <img
                src={profile.nidFrontUrl}
                alt="NID Front"
                className="h-28 w-full object-cover rounded-xl border border-slate-100 bg-slate-50"
              />
            </div>
            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">এনআইডি পেছনের দিক:</span>
              <img
                src={profile.nidBackUrl}
                alt="NID Back"
                className="h-28 w-full object-cover rounded-xl border border-slate-100 bg-slate-50"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 2: PHONE NUMBER & OTP VERIFICATION */}
      <Card className="p-5 sm:p-6 space-y-4 border-blue-200 bg-blue-50/40 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200/70 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isBn ? 'লগইন মোবাইল নম্বর (ওটিপি ভেরিফিকেশন সাপেক্ষে পরিবর্তন)' : 'Mobile Number (Change via OTP)'}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {isBn 
                ? 'আপনার রেজিস্টার্ড মোবাইল নম্বর পরিবর্তন করতে চাইলে নতুন নম্বরে ওটিপি কোড যাচাইয়ের মাধ্যমে পরিবর্তন করা যাবে।' 
                : 'You can change your phone number by verifying an OTP sent to your new phone.'}
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              setIsPhoneModalOpen(true)
              setPhoneModalError('')
              setPhoneModalSuccess('')
              setIsOtpSent(false)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0"
          >
            <Phone className="h-3.5 w-3.5 mr-1" />
            <span>{isBn ? 'মোবাইল নম্বর পরিবর্তন করুন' : 'Change Phone'}</span>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-sm">
            <label className="text-xs font-semibold text-slate-700 block mb-1">বর্তমান মোবাইল নম্বর:</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-blue-200 text-slate-900 font-mono font-bold text-xs shadow-xs">
              <Phone className="h-4 w-4 text-blue-600" />
              <span>{profile.phone}</span>
              <span className="ml-auto text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                ✓ সক্রিয়
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 3: EDITABLE PROFESSIONAL & SERVICE DETAILS */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <Card className="p-5 sm:p-6 space-y-5 border-slate-200 shadow-xs bg-white">
          <div className="border-b border-slate-200 pb-3 space-y-1">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isBn ? 'পেশাগত তথ্য ও সেবার বিবরণ (সম্পাদনাযোগ্য)' : 'Professional & Service Details (Editable)'}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {isBn 
                ? 'আপনার কাজের বিবরণ, পারিশ্রমিক, কাজের এলাকা ও দক্ষতা প্রয়োজন অনুযায়ী আপডেট করতে পারেন।' 
                : 'Update your professional skills, rates, bio and service coverage anytime.'}
            </p>
          </div>

          {/* Title and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">পেশাগত পদবী</label>
              <Input
                id="profTitle"
                value={profile.professionalTitle}
                onChange={(e) => setProfile((p: any) => ({ ...p, professionalTitle: e.target.value }))}
                placeholder="যেমন: দক্ষ ইলেকট্রিশিয়ান ও টেকনিশিয়ান"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">কাজের অভিজ্ঞতা (বছর)</label>
              <Input
                id="expYears"
                type="number"
                value={profile.experienceYears}
                onChange={(e) => setProfile((p: any) => ({ ...p, experienceYears: e.target.value }))}
                placeholder="যেমন: ৬"
                required
              />
            </div>
          </div>

          {/* Subcategories / Skills Selection */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-slate-700 block">
              কাজের বিশেষ পারদর্শিতা ও স্কিলসমূহ (নির্বাচন করুন):
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSubcategories.map((sub) => {
                const isSelected = (profile.subcategories || []).includes(sub)
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubcategory(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {sub}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Location and Radius */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">জেলা</label>
              <select
                value={profile.district}
                onChange={(e) => setProfile((p: any) => ({ ...p, district: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="ঠাকুরগাঁও">ঠাকুরগাঁও</option>
                <option value="পঞ্চগড়">পঞ্চগড়</option>
                <option value="দিনাজপুর">দিনাজপুর</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">উপজেলা</label>
              <select
                value={profile.upazila}
                onChange={(e) => setProfile((p: any) => ({ ...p, upazila: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="ঠাকুরগাঁও সদর">ঠাকুরগাঁও সদর</option>
                <option value="পীরগঞ্জ">পীরগঞ্জ</option>
                <option value="রাণীশংকৈল">রাণীশংকৈল</option>
                <option value="বালিয়াডাঙ্গী">বালিয়াডাঙ্গী</option>
                <option value="হরিপুর">হরিপুর</option>
                <option value="পঞ্চগড় সদর">পঞ্চগড় সদর</option>
                <option value="বোদা">বোদা</option>
                <option value="দিনাজপুর সদর">দিনাজপুর সদর</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">সেবার সর্বোচ্চ দূরত্ব (কিমি)</label>
              <Input
                id="radiusKm"
                type="number"
                value={profile.serviceRadiusKm}
                onChange={(e) => setProfile((p: any) => ({ ...p, serviceRadiusKm: e.target.value }))}
                placeholder="যেমন: ১৫"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">কাজের স্থায়ী বা ওয়ার্কশপ ঠিকানা</label>
            <Input
              id="streetAddress"
              value={profile.streetAddress}
              onChange={(e) => setProfile((p: any) => ({ ...p, streetAddress: e.target.value }))}
              placeholder="রোড নম্বর, এলাকার নাম, বাজার..."
              required
            />
          </div>

          {/* Rates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">মজুরি নির্ধারণ পদ্ধতি</label>
              <select
                value={profile.chargeType}
                onChange={(e) => setProfile((p: any) => ({ ...p, chargeType: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="আলোচনা সাপেক্ষে (Negotiable)">আলোচনা সাপেক্ষে (Negotiable)</option>
                <option value="নির্ধারিত (Fixed)">নির্ধারিত (Fixed)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">আনুমানিক প্রারম্ভিক মজুরি (টাকা)</label>
              <Input
                id="baseCharge"
                type="number"
                value={profile.baseCharge}
                onChange={(e) => setProfile((p: any) => ({ ...p, baseCharge: e.target.value }))}
                placeholder="৪০০"
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-semibold text-slate-700">কাজের বিবরণ বা আত্মপরিচয় (Bio)</label>
            <textarea
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile((p: any) => ({ ...p, bio: e.target.value }))}
              placeholder="আপনার অভিজ্ঞতা এবং কাজের ধরন সংক্ষেপে লিখুন..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <Button
              type="submit"
              isLoading={isSaving}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-md cursor-pointer"
            >
              <Save className="h-4 w-4 mr-2" />
              <span>{isBn ? 'প্রোফাইল পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
            </Button>
          </div>
        </Card>
      </form>

      {/* Phone Change Modal with OTP */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">মোবাইল নম্বর পরিবর্তন</h3>
                  <p className="text-[11px] text-slate-500">OTP ভেরিফিকেশনের মাধ্যমে নতুন নম্বর যুক্ত করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPhoneModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {phoneModalError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-semibold">
                {phoneModalError}
              </div>
            )}

            {phoneModalSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-semibold">
                {phoneModalSuccess}
              </div>
            )}

            {!isOtpSent ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    নতুন মোবাইল নম্বর (ইংরেজীতে):
                  </label>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    value={newPhone}
                    onChange={(e) => {
                      const converted = e.target.value.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString())
                      setNewPhone(converted.replace(/[^0-9]/g, '').slice(0, 11))
                    }}
                    placeholder="017XXXXXXXX"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">ওটিপি চ্যানেল নির্বাচন করুন:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpChannel('whatsapp')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        otpChannel === 'whatsapp'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpChannel('sms')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        otpChannel === 'sms'
                          ? 'border-blue-600 bg-blue-50 text-blue-800'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span>SMS</span>
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleSendOtp}
                  isLoading={isOtpLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl"
                >
                  <span>ওটিপি কোড পাঠান</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-slate-700">
                      {newPhone}-এ প্রেরিত ৪ ডিজিটের কোড দিন:
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      className="text-[11px] text-blue-600 hover:underline font-bold"
                    >
                      নম্বর বদলান
                    </button>
                  </div>
                  <Input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="যেমন: ১২৩৪"
                    className="text-center tracking-widest text-base font-bold font-mono"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleVerifyAndChangePhone}
                  isLoading={isOtpLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  <span>যাচাই ও মোবাইল নম্বর আপডেট করুন</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
