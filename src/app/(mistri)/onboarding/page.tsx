'use client'

import React, { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  User, Shield, MapPin, Wrench, CheckCircle2, 
  Upload, Camera, AlertCircle, Lock, KeyRound, Eye, EyeOff, MessageSquare, Loader2, Mail
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toBanglaNumber } from '@/lib/utils'
import { DEFAULT_DISTRICTS, DistrictOption, getUpazilasForDistrict } from '@/lib/locations'
import { DEFAULT_CATEGORIES, CategoryOption, getSubcategoriesForCategory } from '@/lib/categories'
import { getStoredUser, setStoredUser } from '@/lib/auth-client'

function MistriOnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paramPhone = searchParams.get('phone') || ''
  const paramName = searchParams.get('name') || ''
  const paramFather = searchParams.get('fatherName') || ''
  const paramDistrict = searchParams.get('district') || ''
  const paramUpazila = searchParams.get('upazila') || ''

  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const nidFrontInputRef = useRef<HTMLInputElement>(null)
  const nidBackInputRef = useRef<HTMLInputElement>(null)

  const compressImage = (file: File, maxDim = 1200, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (readerEvent) => {
        const img = new Image()
        img.onload = () => {
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(readerEvent.target?.result as string)
            return
          }
          ctx.drawImage(img, 0, 0, width, height)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
          resolve(compressedDataUrl)
        }
        img.onerror = () => resolve(readerEvent.target?.result as string)
        img.src = readerEvent.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert(isBn ? 'শুধুমাত্র ছবি (JPG, PNG, WebP) আপলোড করুন' : 'Please upload image files')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(isBn ? 'ছবির সাইজ সর্বোচ্চ ১০ মেগাবাইট হতে পারবে' : 'Image size cannot exceed 10MB')
      return
    }
    try {
      const compressed = await compressImage(file, 1200, 0.85)
      setter(compressed)
    } catch {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        if (result) setter(result)
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  // Section 1: Personal Info
  const [fullName, setFullName] = useState(paramName || '')
  const [fatherName, setFatherName] = useState(paramFather || '')
  const [phone, setPhone] = useState(paramPhone || '')
  const [email, setEmail] = useState('')
  const [isGoogleEmail, setIsGoogleEmail] = useState(false)
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('male')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    const stored = getStoredUser()
    const activePhone = paramPhone || stored?.phone || ''
    const activeName = paramName || stored?.name || ''
    if (activePhone && !phone && !activePhone.startsWith('01000000000')) setPhone(activePhone)
    if (activeName && !fullName) setFullName(activeName)
    if (stored?.avatar && !avatarPreview) setAvatarPreview(stored.avatar)
    if (paramFather && !fatherName) setFatherName(paramFather)
    if (paramDistrict) setDistrict(paramDistrict)
    if (paramUpazila) setUpazila(paramUpazila)

    if (stored?.email && !stored.email.endsWith('@mistri.app') && !stored.email.endsWith('@mistri.internal')) {
      setEmail(stored.email)
      setIsGoogleEmail(true)
    }
  }, [paramPhone, paramName, paramFather, paramDistrict, paramUpazila])

  const handlePhoneInput = (val: string) => {
    const converted = val.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString())
    const digitsOnly = converted.replace(/[^0-9]/g, '').slice(0, 11)
    setPhone(digitsOnly)
  }

  const handleNidInput = (val: string) => {
    const converted = val.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString())
    const digitsOnly = converted.replace(/[^0-9]/g, '').slice(0, 17)
    setNidNumber(digitsOnly)
  }

  // Section 2: NID Identity
  const [nidNumber, setNidNumber] = useState('')
  const [nidFront, setNidFront] = useState<string | null>(null)
  const [nidBack, setNidBack] = useState<string | null>(null)

  // Section 3: Location
  const [districtsList, setDistrictsList] = useState<DistrictOption[]>(DEFAULT_DISTRICTS)
  const [district, setDistrict] = useState(paramDistrict || 'Thakurgaon')
  const [upazila, setUpazila] = useState(paramUpazila || 'Thakurgaon Sadar')
  const [area, setArea] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [maxRadiusKm, setMaxRadiusKm] = useState(15)

  useEffect(() => {
    async function loadLiveLocations() {
      try {
        const res = await fetch('/api/admin/locations')
        const data = await res.json()
        if (data.success && Array.isArray(data.districts) && data.districts.length > 0) {
          setDistrictsList(data.districts)
        }
      } catch (err) {
        console.warn('Failed to load live locations in onboarding:', err)
      }
    }
    loadLiveLocations()
  }, [])

  const availableUpazilas = getUpazilasForDistrict(district, districtsList)

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist)
    const newUpList = getUpazilasForDistrict(newDist, districtsList)
    if (newUpList && newUpList.length > 0) {
      setUpazila(newUpList[0].name_en || newUpList[0].name_bn)
    }
  }

  // Section 4: Skills & Pricing
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>(DEFAULT_CATEGORIES)
  const [selectedCategory, setSelectedCategory] = useState('painting-services')
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [experienceYears, setExperienceYears] = useState(5)
  const [professionalTitle, setProfessionalTitle] = useState('রং মিস্ত্রী')
  const [bio, setBio] = useState('')
  const [chargeType, setChargeType] = useState('negotiable')
  const [baseCharge, setBaseCharge] = useState(400)

  useEffect(() => {
    async function loadLiveCategories() {
      try {
        const res = await fetch('/api/admin/categories')
        const data = await res.json()
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategoriesList(data.categories)
        }
      } catch (err) {
        console.warn('Failed to load live categories in onboarding:', err)
      }
    }
    loadLiveCategories()
  }, [])

  const activeSubcategories = getSubcategoriesForCategory(selectedCategory, categoriesList)

  const toggleSubcategory = (subIdentifier: string) => {
    setSelectedSubcategories(prev => 
      prev.includes(subIdentifier) 
        ? prev.filter(id => id !== subIdentifier) 
        : [...prev, subIdentifier]
    )
  }

  // Section 5: Password & WhatsApp OTP
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isOtpSending, setIsOtpSending] = useState(false)
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [otpMessage, setOtpMessage] = useState('')
  const [otpError, setOtpError] = useState('')

  const handleSendOtp = async () => {
    if (!phone || phone.length < 11) {
      setOtpError(isBn ? 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন' : 'Provide 11-digit mobile number')
      return
    }
    setOtpError('')
    setOtpMessage('')
    setIsOtpSending(true)

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, channel: 'whatsapp' }),
      })
      const data = await res.json()
      setIsOtpSending(false)

      if (data.success) {
        setIsOtpSent(true)
        setOtpMessage(
          isBn
            ? `আপনার WhatsApp নম্বরে (${phone}) ওটিপি পাঠানো হয়েছে। কোডটি লিখে যাচাই করুন।`
            : `OTP sent to WhatsApp (${phone}). Enter it below.`
        )
      } else {
        setOtpError(data.error || 'WhatsApp ওটিপি পাঠাতে সমস্যা হয়েছে')
      }
    } catch {
      setIsOtpSending(false)
      setOtpError('ওটিপি পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।')
    }
  }

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length === 0) {
      setOtpError(isBn ? 'ওটিপি কোড লিখুন' : 'Enter OTP code')
      return
    }
    setOtpError('')
    setIsVerifyingOtp(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otpCode.trim() }),
      })
      const data = await res.json()
      setIsVerifyingOtp(false)

      if (data.success) {
        setIsOtpVerified(true)
        setOtpMessage(isBn ? '✓ হোয়াটসঅ্যাপ নম্বর সফলভাবে যাচাই হয়েছে!' : '✓ WhatsApp verified successfully!')
      } else {
        setOtpError(data.error || 'ভুল ওটিপি কোড, আবার চেষ্টা করুন')
      }
    } catch {
      setIsVerifyingOtp(false)
      setOtpError('যাচাইকরণে ত্রুটি হয়েছে')
    }
  }

  // Unified Single-Page Form Submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!fullName || fullName.trim().length < 2) {
      setErrorMessage(isBn ? 'আপনার পূর্ণ নাম সঠিকভাবে লিখুন' : 'Enter your full name')
      window.scrollTo({ top: 100, behavior: 'smooth' })
      return
    }

    if (!phone || phone.length < 11) {
      setErrorMessage(isBn ? 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন' : 'Enter 11-digit mobile number')
      window.scrollTo({ top: 200, behavior: 'smooth' })
      return
    }

    if (!nidNumber || (nidNumber.length !== 10 && nidNumber.length !== 17)) {
      setErrorMessage(isBn ? 'জাতীয় পরিচয়পত্র (NID) নম্বর ১০ বা ১৭ সংখ্যার হতে হবে' : 'NID must be 10 or 17 digits')
      window.scrollTo({ top: 400, behavior: 'smooth' })
      return
    }

    if (!nidFront || !nidBack) {
      setErrorMessage(isBn ? 'জাতীয় পরিচয়পত্রের সামনের ও পেছনের ছবি আপলোড করা আবশ্যক' : 'Both NID front & back photos are required')
      window.scrollTo({ top: 400, behavior: 'smooth' })
      return
    }

    if (!streetAddress || streetAddress.trim().length < 3) {
      setErrorMessage(isBn ? 'আপনার স্থায়ী বা কাজের সঠিক ঠিকানা লিখুন' : 'Enter your street address')
      window.scrollTo({ top: 600, behavior: 'smooth' })
      return
    }

    if (!password || password.length < 6) {
      setErrorMessage(isBn ? 'কমপক্ষে ৬ অক্ষরের একটি গোপন পাসওয়ার্ড সেট করুন' : 'Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড দুটি মেলেনি, নিশ্চিত করুন' : 'Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      const stored = getStoredUser()
      const cleanEmail = email.trim().toLowerCase() || (stored?.email && !stored.email.endsWith('@mistri.app') ? stored.email.toLowerCase() : '')
      const activeUserId = (stored as any)?.userId || stored?.id || undefined

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          fatherName: fatherName.trim(),
          phone,
          email: cleanEmail,
          userId: activeUserId,
          password,
          dateOfBirth,
          gender,
          avatarPreview,
          nidNumber,
          nidFront,
          nidBack,
          district,
          upazila,
          area,
          streetAddress,
          serviceRadiusKm: maxRadiusKm,
          selectedCategory,
          selectedSubcategories,
          experienceYears,
          professionalTitle: professionalTitle.trim() || 'রং মিস্ত্রী',
          bio,
          chargeType,
          baseCharge,
        }),
      })

      const data = await res.json()
      setIsSubmitting(false)

      if (data.success) {
        if (typeof window !== 'undefined') {
          const applicantUser = {
            id: data.applicant?.id || stored?.id || `mst-${Date.now()}`,
            userId: activeUserId || data.applicant?.userId,
            name: fullName.trim(),
            phone,
            email: cleanEmail || undefined,
            avatar: avatarPreview || stored?.avatar || '',
            role: 'mistri' as const,
            status: 'pending',
          }
          setStoredUser(applicantUser as any)
        }
        // Direct redirect to Mistri Profile & Dashboard (Zero multi-page jump!)
        router.push('/mistri/profile')
      } else {
        setErrorMessage(data.error || (isBn ? 'আবেদন জমা দিতে সমস্যা হয়েছে' : 'Failed to submit application'))
      }
    } catch {
      setIsSubmitting(false)
      setErrorMessage(isBn ? 'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি' : 'Connection failed')
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 pb-28">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <Badge variant="neutral" className="skeuo-pill bg-[#2c7865] text-[#fefded] border-[#225f50] text-xs px-3 py-1 font-bold">
          {isBn ? 'মিস্ত্রী এক পেজ রেজিস্ট্রেশন ও ভেরিফিকেশন' : 'Single-Page Mistri Registration'}
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2c7865] tracking-tight">
          {isBn ? 'আপনার প্রফেশনাল মিস্ত্রী প্রোফাইল তৈরি করুন' : 'Create Your Mistri Profile'}
        </h1>
        <p className="text-xs sm:text-sm text-[#2c7865]/80 max-w-xl mx-auto">
          {isBn 
            ? 'সকল প্রয়োজনীয় তথ্য এই এক পেজেই পূরণ করে সরাসরি আবেদন জমা দিন। আবেদন জমা হলে সরাসরি আপনার প্রোফাইল দেখতে পাবেন।'
            : 'Fill in all details in this single page and submit directly to go to your live dashboard.'}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-700 border border-red-300 flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleFinalSubmit} className="space-y-6">
        {/* SECTION 1: Personal Info & Avatar */}
        <Card className="p-6 sm:p-8 skeuo-surface border-stone-300 space-y-5">
          <div className="border-b border-stone-200 pb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2c7865] text-white font-bold text-xs shadow-xs">
              ১
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {isBn ? 'ব্যক্তিগত তথ্য ও প্রোফাইল ছবি' : '1. Personal Details & Photo'}
              </h2>
              <p className="text-xs text-stone-600">
                {isBn ? 'আপনার মৌলিক পরিচয় ও পাসপোর্ট সাইজ ছবি দিন' : 'Your basic details & profile photo'}
              </p>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="flex items-center gap-4 pt-1">
            <input
              type="file"
              ref={avatarInputRef}
              onChange={(e) => handleFileUpload(e, setAvatarPreview)}
              accept="image/*"
              className="hidden"
            />
            <div 
              onClick={() => avatarInputRef.current?.click()}
              className="relative h-24 w-24 rounded-2xl border-2 border-dashed border-stone-300 hover:border-[#2c7865] bg-stone-50 flex items-center justify-center overflow-hidden cursor-pointer group shadow-xs transition-colors shrink-0"
              title={isBn ? 'ছবি নির্বাচন করতে ক্লিক করুন' : 'Click to select photo'}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover group-hover:opacity-85 transition-opacity" />
              ) : (
                <div className="text-center p-2">
                  <Camera className="h-6 w-6 text-stone-400 group-hover:text-[#2c7865] mx-auto mb-1 transition-colors" />
                  <span className="text-[10px] text-stone-500 font-bold block">{isBn ? 'ছবি দিন' : 'Photo'}</span>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Button variant="outline" size="sm" type="button" onClick={() => avatarInputRef.current?.click()} className="skeuo-btn-light text-xs font-bold cursor-pointer">
                <Upload className="h-3.5 w-3.5 mr-1" />
                {avatarPreview ? (isBn ? 'ছবি পরিবর্তন করুন' : 'Change Photo') : (isBn ? 'প্রোফাইল ছবি আপলোড' : 'Upload Photo')}
              </Button>
              <p className="text-[11px] text-stone-500">
                {isBn ? 'পাসপোর্ট সাইজ বা স্পষ্ট ফ্রন্ট ফেস ছবি দিন (সর্বোচ্চ ১০MB)' : 'Clear front-facing photo'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="name"
              label={isBn ? 'আপনার পূর্ণ নাম (NID কার্ড অনুযায়ী)' : 'Full Name (as per NID)'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isBn ? 'যেমন: মো: সানোয়ার হোসেন' : 'e.g. Sanowar Hossain'}
              required
            />
            <Input
              id="fatherName"
              label={isBn ? 'পিতার নাম / অভিভাবক' : "Father's Name"}
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              placeholder={isBn ? 'পিতার নাম লিখুন' : "Father's name"}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Input
                id="phone"
                type="tel"
                label={isBn ? 'মোবাইল নম্বর (লগইন আইডি)' : 'Mobile Number'}
                value={phone}
                onChange={(e) => handlePhoneInput(e.target.value)}
                placeholder="017XXXXXXXX"
                required
              />
              <span className="text-[10px] text-stone-500">
                {isBn ? '১১ সংখ্যার সচল মোবাইল নম্বর' : '11-digit active phone number'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="email" className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-blue-600" />
                  <span>{isBn ? 'Gmail / ইমেইল ঠিকানা' : 'Gmail / Email'}</span>
                </label>
                {isGoogleEmail && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    {isBn ? '✓ গুগল ভেরিফাইড' : '✓ Google Verified'}
                  </span>
                )}
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isBn ? 'আপনার Gmail (যেমন: name@gmail.com)' : 'Your Gmail (e.g. name@gmail.com)'}
                readOnly={isGoogleEmail}
                className={isGoogleEmail ? 'bg-stone-100 font-mono text-stone-700 cursor-not-allowed' : ''}
              />
              <span className="text-[10px] text-stone-500">
                {isGoogleEmail 
                  ? (isBn ? 'আপনার লগইন করা গুগল অ্যাকাউন্ট থেকে নেওয়া হয়েছে' : 'Linked from your Google account')
                  : (isBn ? 'আপনার সক্রিয় Gmail অ্যাড্রেস' : 'Active Gmail address')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="dob"
              type="date"
              label={isBn ? 'জন্ম তারিখ' : 'Date of Birth'}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                {isBn ? 'লিঙ্গ' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-[#2c7865] focus:outline-none"
              >
                <option value="male">{isBn ? 'পুরুষ (Male)' : 'Male'}</option>
                <option value="female">{isBn ? 'নারী (Female)' : 'Female'}</option>
                <option value="other">{isBn ? 'অন্যান্য (Other)' : 'Other'}</option>
              </select>
            </div>
          </div>
        </Card>

        {/* SECTION 2: NID Identity */}
        <Card className="p-6 sm:p-8 skeuo-surface border-stone-300 space-y-5">
          <div className="border-b border-stone-200 pb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2c7865] text-white font-bold text-xs shadow-xs">
              ২
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {isBn ? 'জাতীয় পরিচয়পত্র (NID)' : '2. National ID Card (NID)'}
              </h2>
              <p className="text-xs text-stone-600">
                {isBn ? 'সুরক্ষা ও অ্যাডমিন যাচাইয়ের জন্য ১০ বা ১৭ সংখ্যার আসল এনআইডি দিন' : 'Enter real 10 or 17 digit NID number'}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <Input
              id="nid"
              label={isBn ? 'জাতীয় পরিচয়পত্র নম্বর (১০ বা ১৭ সংখ্যা)' : 'NID Number (10 or 17 digits)'}
              value={nidNumber}
              onChange={(e) => handleNidInput(e.target.value)}
              placeholder="যেমন: 1990521934000123"
              required
            />
            <span className="text-[10px] text-stone-500">
              {isBn ? 'স্মার্ট কার্ড (১০ সংখ্যা) অথবা পুরাতন এনআইডি (১৭ সংখ্যা)' : '10 or 17 digits English numbers'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* NID Front */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700 block">
                {isBn ? 'এনআইডি সামনের দিকের ছবি' : 'NID Front Photo'} <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                ref={nidFrontInputRef}
                onChange={(e) => handleFileUpload(e, setNidFront)}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => nidFrontInputRef.current?.click()}
                className="relative h-36 rounded-2xl border-2 border-dashed border-stone-300 hover:border-[#2c7865] bg-stone-50 flex flex-col items-center justify-center p-3 text-center cursor-pointer overflow-hidden group shadow-xs transition-colors"
              >
                {nidFront ? (
                  <img src={nidFront} alt="NID Front" className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-stone-400 group-hover:text-[#2c7865] mb-2 transition-colors" />
                    <span className="text-xs font-bold text-stone-800">{isBn ? 'সামনের ছবি আপলোড করুন' : 'Upload Front Side'}</span>
                    <span className="text-[10px] text-stone-500 mt-0.5">{isBn ? 'ক্লিক করে ছবি নির্বাচন করুন' : 'Click to select image'}</span>
                  </>
                )}
              </div>
            </div>

            {/* NID Back */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700 block">
                {isBn ? 'এনআইডি পেছনের দিকের ছবি' : 'NID Back Photo'} <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                ref={nidBackInputRef}
                onChange={(e) => handleFileUpload(e, setNidBack)}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => nidBackInputRef.current?.click()}
                className="relative h-36 rounded-2xl border-2 border-dashed border-stone-300 hover:border-[#2c7865] bg-stone-50 flex flex-col items-center justify-center p-3 text-center cursor-pointer overflow-hidden group shadow-xs transition-colors"
              >
                {nidBack ? (
                  <img src={nidBack} alt="NID Back" className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-stone-400 group-hover:text-[#2c7865] mb-2 transition-colors" />
                    <span className="text-xs font-bold text-stone-800">{isBn ? 'পেছনের ছবি আপলোড করুন' : 'Upload Back Side'}</span>
                    <span className="text-[10px] text-stone-500 mt-0.5">{isBn ? 'ক্লিক করে ছবি নির্বাচন করুন' : 'Click to select image'}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* SECTION 3: Location & Coverage */}
        <Card className="p-6 sm:p-8 skeuo-surface border-stone-300 space-y-5">
          <div className="border-b border-stone-200 pb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2c7865] text-white font-bold text-xs shadow-xs">
              ৩
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {isBn ? 'কাজের এলাকা ও ঠিকানা' : '3. Work Area & Address'}
              </h2>
              <p className="text-xs text-stone-600">
                {isBn ? 'যে এলাকায় আপনি সেবা প্রদান করবেন' : 'Service area and base workshop address'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">{isBn ? 'জেলা' : 'District'}</label>
              <select
                value={district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-[#2c7865] focus:outline-none font-medium"
              >
                {districtsList.map((d) => (
                  <option key={d.name_en || d.id} value={d.name_en || d.name_bn}>
                    {isBn ? d.name_bn : d.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">{isBn ? 'উপজেলা' : 'Upazila'}</label>
              <select
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-[#2c7865] focus:outline-none font-medium"
              >
                {availableUpazilas.map((u) => (
                  <option key={u.name_en || u.id} value={u.name_en || u.name_bn}>
                    {isBn ? u.name_bn : u.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                id="address"
                label={isBn ? 'কাজের স্থায়ী বা ওয়ার্কশপ ঠিকানা' : 'Permanent / Workshop Address'}
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder={isBn ? 'যেমন: বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর' : 'e.g. House 12, East Hajipara'}
                required
              />
            </div>
            <Input
              id="radius"
              type="number"
              label={isBn ? 'সেবার সর্বোচ্চ দূরত্ব (কিমি)' : 'Max Radius (km)'}
              value={maxRadiusKm}
              onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
            />
          </div>
        </Card>

        {/* SECTION 4: Category, Skills & Pricing */}
        <Card className="p-6 sm:p-8 skeuo-surface border-stone-300 space-y-5">
          <div className="border-b border-stone-200 pb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2c7865] text-white font-bold text-xs shadow-xs">
              ৪
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {isBn ? 'পেশা, দক্ষতা ও পারিশ্রমিক' : '4. Profession, Skills & Rates'}
              </h2>
              <p className="text-xs text-stone-600">
                {isBn ? 'আপনার প্রধান কাজের ক্যাটাগরি ও মজুরি নির্ধারণ করুন' : 'Service category and rate configuration'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                {isBn ? 'প্রধান ক্যাটাগরি' : 'Primary Category'}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  const cat = categoriesList.find(c => c.slug === e.target.value || c.id === e.target.value)
                  if (cat && !professionalTitle) {
                    setProfessionalTitle(cat.name_bn)
                  }
                }}
                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-[#2c7865] focus:outline-none font-medium"
              >
                {categoriesList.map((cat) => (
                  <option key={cat.id || cat.slug} value={cat.slug || cat.id}>
                    {isBn ? cat.name_bn : cat.name_en}
                  </option>
                ))}
              </select>
            </div>

            <Input
              id="title"
              label={isBn ? 'পেশাগত পদবী (যেমন: রং মিস্ত্রী)' : 'Professional Title'}
              value={professionalTitle}
              onChange={(e) => setProfessionalTitle(e.target.value)}
              placeholder={isBn ? 'যেমন: দক্ষ রং মিস্ত্রী' : 'e.g. Master Painter'}
              required
            />
          </div>

          {/* Subcategories (Optional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700">
                {isBn ? 'বিশেষ পারদর্শিতা ও স্কিলসমূহ (নির্বাচন করুন)' : 'Specific Skills (Select to apply)'}
              </label>
              <span className="text-[10px] text-stone-500 font-normal">
                {isBn ? 'ঐচ্ছিক' : 'Optional'}
              </span>
            </div>

            {activeSubcategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeSubcategories.map((sub) => {
                  const identifier = sub.name_bn
                  const isChecked = selectedSubcategories.includes(identifier)
                  return (
                    <button
                      key={sub.id || sub.slug}
                      type="button"
                      onClick={() => toggleSubcategory(identifier)}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                        isChecked
                          ? 'skeuo-btn-dark bg-[#2c7865] text-white shadow-xs'
                          : 'skeuo-btn-light bg-stone-100 text-stone-700 border border-stone-300'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}{isBn ? sub.name_bn : sub.name_en}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="expYears"
              type="number"
              label={isBn ? 'কাজের অভিজ্ঞতা (বছর)' : 'Experience (Years)'}
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                {isBn ? 'মজুরি নির্ধারণ পদ্ধতি' : 'Charge Model'}
              </label>
              <select
                value={chargeType}
                onChange={(e) => setChargeType(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-[#2c7865] focus:outline-none"
              >
                <option value="negotiable">{isBn ? 'আলোচনা সাপেক্ষে (Negotiable)' : 'Negotiable'}</option>
                <option value="fixed">{isBn ? 'নির্দিষ্ট ভিজিট ফি (Fixed Minimum)' : 'Fixed Minimum'}</option>
                <option value="hourly">{isBn ? 'ঘণ্টা ভিত্তিক (Hourly)' : 'Hourly'}</option>
              </select>
            </div>

            <Input
              id="baseCharge"
              type="number"
              label={isBn ? 'আনুমানিক প্রারম্ভিক মজুরি (টাকা)' : 'Estimated Starting Charge (BDT)'}
              value={baseCharge}
              onChange={(e) => setBaseCharge(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">
              {isBn ? 'কাজের বিবরণ বা আত্মপরিচয় (Bio)' : 'Bio / Experience Description'}
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={isBn ? 'আপনার অভিজ্ঞতা এবং কাজের ধরন সংক্ষেপে লিখুন...' : 'Tell customers about your experience...'}
              className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs text-stone-900 focus:border-[#2c7865] focus:outline-none"
            />
          </div>
        </Card>

        {/* SECTION 5: Password & WhatsApp OTP */}
        <Card className="p-6 sm:p-8 skeuo-surface border-stone-300 space-y-6">
          <div className="border-b border-stone-200 pb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2c7865] text-white font-bold text-xs shadow-xs">
              ৫
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {isBn ? 'পাসওয়ার্ড সেট ও হোয়াটসঅ্যাপ ওটিপি যাচাই' : '5. Password & WhatsApp OTP'}
              </h2>
              <p className="text-xs text-stone-600">
                {isBn ? 'ভবিষ্যতে লগইন করার জন্য পাসওয়ার্ড সেট করুন এবং আপনার নম্বর নিশ্চিত করুন' : 'Set your login password & verify WhatsApp phone'}
              </p>
            </div>
          </div>

          {/* Password Inputs */}
          <div className="rounded-2xl skeuo-surface p-4 sm:p-5 space-y-4 border border-stone-300">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#2c7865]" />
              <span>{isBn ? 'অ্যাকাউন্টের পাসওয়ার্ড নির্ধারণ করুন' : 'Set Account Password'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label={isBn ? 'গোপন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'Password (min 6 characters)'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                label={isBn ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="flex items-center gap-1.5 text-stone-700 hover:text-stone-950 font-semibold cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showPassword ? (isBn ? 'পাসওয়ার্ড লুকান' : 'Hide Password') : (isBn ? 'পাসওয়ার্ড দেখুন' : 'Show Password')}</span>
              </button>
              <span className="text-[11px] text-stone-500 font-mono">
                {isBn ? `লগইন নম্বর: ${phone || 'আপনার নম্বর'}` : `Login ID: ${phone}`}
              </span>
            </div>
          </div>

          {/* WhatsApp OTP Verification Box */}
          <div className="rounded-2xl border-2 border-stone-300 bg-stone-50 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#2c7865]" />
                  <span>{isBn ? 'হোয়াটসঅ্যাপ (WhatsApp) নম্বর যাচাই' : 'WhatsApp Verification'}</span>
                </h3>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  {isBn ? `নম্বর: ${phone || '১১ সংখ্যার নম্বর'}` : `Number: ${phone}`}
                </p>
              </div>
              {isOtpVerified && (
                <Badge variant="neutral" className="bg-[#2c7865] text-white text-[11px] px-2.5 py-1 font-bold">
                  ✓ {isBn ? 'যাচাইকৃত' : 'Verified'}
                </Badge>
              )}
            </div>

            {!isOtpVerified && (
              <div className="space-y-3 pt-1">
                {!isOtpSent ? (
                  <Button
                    type="button"
                    onClick={handleSendOtp}
                    isLoading={isOtpSending}
                    className="skeuo-btn-dark text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>{isBn ? 'WhatsApp-এ ওটিপি কোড পাঠান' : 'Send WhatsApp OTP'}</span>
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        id="otpCode"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="৪-সংখ্যার কোড (যেমন: 1234)"
                        value={otpCode}
                        onChange={(e) => {
                          const converted = e.target.value.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString())
                          setOtpCode(converted.replace(/[^0-9]/g, ''))
                        }}
                        className="text-center font-mono font-bold tracking-widest text-base"
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyOtp}
                        isLoading={isVerifyingOtp}
                        className="skeuo-btn-dark text-xs font-bold px-5 shrink-0 cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        <span>{isBn ? 'যাচাই করুন' : 'Verify'}</span>
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#2c7865] font-medium">{otpMessage}</span>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isOtpSending}
                        className="text-[#2c7865] hover:underline font-bold cursor-pointer"
                      >
                        {isBn ? 'পুনরায় পাঠান' : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                )}

                {otpError && (
                  <div className="rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-300 font-medium">
                    {otpError}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* BOTTOM SUBMIT BUTTON (Single Submit) */}
        <div className="pt-4 space-y-3">
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full skeuo-btn-dark py-4 text-base font-black text-[#fefded] shadow-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>{isBn ? 'অ্যাকাউন্ট তৈরি ও আবেদন জমা দিন' : 'Create Account & Submit Application'}</span>
          </Button>
          <p className="text-center text-[11px] text-stone-500">
            {isBn 
              ? 'আবেদন জমা দেওয়ার সাথে সাথেই আপনার অ্যাকাউন্ট সক্রিয় হবে এবং আপনি প্রোফাইলে প্রবেশ করতে পারবেন।'
              : 'Your profile will be created immediately and you will enter your dashboard.'}
          </p>
        </div>
      </form>
    </div>
  )
}

export default function MistriOnboardingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-semibold text-stone-600">লোড হচ্ছে...</div>}>
      <MistriOnboardingContent />
    </Suspense>
  )
}
