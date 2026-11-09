'use client'

import React, { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  User, Shield, MapPin, Wrench, CheckCircle2, 
  Upload, ArrowRight, ArrowLeft, Camera,
  AlertCircle, Lock, KeyRound, Eye, EyeOff, MessageSquare
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toBanglaNumber } from '@/lib/utils'
import { DEFAULT_DISTRICTS, DistrictOption, getUpazilasForDistrict } from '@/lib/locations'
import { DEFAULT_CATEGORIES, CategoryOption, SubcategoryOption, getSubcategoriesForCategory } from '@/lib/categories'
import { getStoredUser } from '@/lib/auth-client'

function MistriOnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paramPhone = searchParams.get('phone') || ''
  const paramName = searchParams.get('name') || ''
  const paramFather = searchParams.get('fatherName') || ''
  const paramDistrict = searchParams.get('district') || ''
  const paramUpazila = searchParams.get('upazila') || ''

  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const nidFrontInputRef = useRef<HTMLInputElement>(null)
  const nidBackInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert(isBn ? 'শুধুমাত্র ছবি (JPG, PNG) আপলোড করুন' : 'Please upload image files')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      alert(isBn ? 'ছবির সাইজ সর্বোচ্চ ৮ মেগাবাইট হতে পারবে' : 'Image size cannot exceed 8MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) setter(result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Form States initialized with query params or clean defaults
  // Step 1: Personal Info
  const [fullName, setFullName] = useState(paramName || '')
  const [fatherName, setFatherName] = useState(paramFather || '')
  const [phone, setPhone] = useState(paramPhone || '')
  const [dateOfBirth, setDateOfBirth] = useState('1990-05-15')
  const [gender, setGender] = useState('male')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
  )

  // Synchronize state if URL query params arrive or from stored user
  useEffect(() => {
    const stored = getStoredUser()
    const activePhone = paramPhone || (stored?.role === 'mistri' ? stored.phone : '')
    const activeName = paramName || (stored?.role === 'mistri' ? stored.name : '')
    if (activePhone && !phone) setPhone(activePhone)
    if (activeName && !fullName) setFullName(activeName)
    if (paramFather && !fatherName) setFatherName(paramFather)
    if (paramDistrict) setDistrict(paramDistrict)
    if (paramUpazila) setUpazila(paramUpazila)
  }, [paramPhone, paramName, paramFather, paramDistrict, paramUpazila])

  // Input Sanitizers for English Digits Only
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

  // Step 2: NID Identity
  const [nidNumber, setNidNumber] = useState('1990521934000123')
  const [nidFront, setNidFront] = useState<string | null>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
  )
  const [nidBack, setNidBack] = useState<string | null>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
  )

  // Step 3: Location
  const [districtsList, setDistrictsList] = useState<DistrictOption[]>(DEFAULT_DISTRICTS)
  const [district, setDistrict] = useState(paramDistrict || 'Thakurgaon')
  const [upazila, setUpazila] = useState(paramUpazila || 'Thakurgaon Sadar')
  const [area, setArea] = useState('বাসস্ট্যান্ড এলাকা')
  const [streetAddress, setStreetAddress] = useState('রোড নং ৩, পূর্ব হাজীপাড়া')
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

  // Step 4: Skills & Pricing (Admin managed categories & subcategories)
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>(DEFAULT_CATEGORIES)
  const [selectedCategory, setSelectedCategory] = useState('electrical-services')
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [experienceYears, setExperienceYears] = useState(6)
  const [professionalTitle, setProfessionalTitle] = useState('দক্ষ ইলেকট্রিশিয়ান ও টেকনিশিয়ান')
  const [bio, setBio] = useState('আমি বিগত ৬ বছর ধরে ঠাকুরগাঁও সদর ও আশপাশের এলাকায় সব ধরনের বৈদ্যুতিক ওয়্যারিং, ফ্যান ফিটিংস ও মেরামতের কাজ সুনামের সাথে করে আসছি।')
  const [chargeType, setChargeType] = useState('negotiable')
  const [baseCharge, setBaseCharge] = useState(400)

  // Load live admin categories & subcategories
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

  // Dynamic subcategories for currently selected category
  const activeSubcategories = getSubcategoriesForCategory(selectedCategory, categoriesList)

  const toggleSubcategory = (subIdentifier: string) => {
    setSelectedSubcategories(prev => 
      prev.includes(subIdentifier) 
        ? prev.filter(id => id !== subIdentifier) 
        : [...prev, subIdentifier]
    )
  }

  // Step 5: Password & WhatsApp OTP States
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
            ? `আপনার WhatsApp নম্বরে (${phone}) ওটিপি পাঠানো হয়েছে। কোডটি নিচে লিখে যাচাই করুন।`
            : `OTP sent to your WhatsApp (${phone}). Enter it below.`
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

  const handleNextStep = () => {
    setErrorMessage('')
    if (currentStep === 1) {
      if (!fullName || !phone) {
        setErrorMessage(isBn ? 'নাম ও মোবাইল নম্বর পূরণ করুন' : 'Provide full name and phone')
        return
      }
      if (phone.length < 11) {
        setErrorMessage(isBn ? 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন' : 'Provide valid 11-digit mobile number')
        return
      }
    } else if (currentStep === 2) {
      if (!nidNumber || !nidFront || !nidBack) {
        setErrorMessage(isBn ? 'এনআইডি নম্বর এবং উভয় পাশের ছবি আপলোড করা আবশ্যক' : 'NID number and both front & back photos are required')
        return
      }
      if (nidNumber.length !== 10 && nidNumber.length !== 17) {
        setErrorMessage(isBn ? 'এনআইডি নম্বর অবশ্যই ১০ বা ১৭ সংখ্যার হতে হবে' : 'NID number must be 10 or 17 digits')
        return
      }
    } else if (currentStep === 3) {
      if (!streetAddress) {
        setErrorMessage(isBn ? 'আপনার স্থায়ী বা কাজের ঠিকানা লিখুন' : 'Enter your street address')
        return
      }
    } else if (currentStep === 4) {
      // Subcategories selection is strictly OPTIONAL as requested by user!
    }
    setCurrentStep(prev => prev + 1)
  }

  const handleFinalSubmit = async () => {
    setErrorMessage('')

    if (!isOtpVerified) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে প্রথমে WhatsApp ওটিপি কোডটি যাচাই করুন' : 'Please verify WhatsApp OTP code first')
      return
    }

    if (!password || password.length < 6) {
      setErrorMessage(isBn ? 'কমপক্ষে ৬ অক্ষরের একটি গোপন পাসওয়ার্ড সেট করুন' : 'Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড দুটি মেলেনি, অনুগ্রহ করে সঠিক পাসওয়ার্ড নিশ্চিত করুন' : 'Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          fatherName,
          phone,
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
          professionalTitle,
          bio,
          chargeType,
          baseCharge,
        }),
      })

      const data = await res.json()
      setIsSubmitting(false)

      if (data.success) {
        if (typeof window !== 'undefined' && data.applicant) {
          localStorage.setItem(
            'mistri_user',
            JSON.stringify({
              id: data.applicant.id,
              name: fullName,
              phone,
              role: 'mistri',
              status: 'pending',
            })
          )
          window.dispatchEvent(new Event('mistri_auth_changed'))
        }
        router.push('/onboarding/status?id=' + (data.applicant?.id || ''))
      } else {
        setErrorMessage(data.error || 'আবেদন জমা দিতে সমস্যা হয়েছে')
      }
    } catch {
      setIsSubmitting(false)
      router.push('/onboarding/status')
    }
  }

  const stepTitles = [
    { num: 1, title: isBn ? 'ব্যক্তিগত তথ্য' : 'Personal Info', icon: User },
    { num: 2, title: isBn ? 'জাতীয় পরিচয়পত্র' : 'NID Document', icon: Shield },
    { num: 3, title: isBn ? 'এলাকা ও দূরত্ব' : 'Work Area', icon: MapPin },
    { num: 4, title: isBn ? 'দক্ষতা ও পারিশ্রমিক' : 'Skills & Rates', icon: Wrench },
    { num: 5, title: isBn ? 'যাচাই ও পাসওয়ার্ড' : 'Verify & Password', icon: CheckCircle2 },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <Badge variant="neutral" className="skeuo-pill bg-black text-white border-black text-xs px-3 py-1">
          {isBn ? '👷‍♂️ মিস্ত্রী ভেরিফিকেশন অনবোর্ডিং' : '👷‍♂️ Professional Verification Onboarding'}
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          {isBn ? 'আপনার প্রফেশনাল প্রোফাইল তৈরি করুন' : 'Build Your Professional Profile'}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          {isBn 
            ? 'এডমিন দ্বারা অনুমোদিত হলে আপনি সরাসরি কাস্টমারদের বুকিং পাবেন ও অ্যাপের সার্চ লিস্টে স্থান পাবেন।'
            : 'Upon Admin review and approval, your profile will go live to receive customer bookings.'}
        </p>
      </div>

      {/* Stepper Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-300 -z-0 -translate-y-1/2"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-black -z-0 -translate-y-1/2 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (stepTitles.length - 1)) * 100}%` }}
          ></div>

          {stepTitles.map((step) => {
            const Icon = step.icon
            const isCompleted = step.num < currentStep
            const isCurrent = step.num === currentStep
            return (
              <div key={step.num} className="flex flex-col items-center relative z-10 bg-transparent px-1">
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl transition-all ${
                    isCompleted
                      ? 'skeuo-btn-dark bg-stone-900 text-white'
                      : isCurrent
                      ? 'skeuo-surface-dark bg-black text-white ring-4 ring-stone-300 shadow-md'
                      : 'skeuo-btn-light bg-white border border-stone-300 text-stone-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-[11px] font-bold mt-1.5 hidden sm:block ${
                  isCurrent ? 'text-black' : isCompleted ? 'text-stone-700' : 'text-stone-400'
                }`}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl bg-stone-100 p-3.5 text-xs font-semibold text-stone-900 border border-stone-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-stone-900" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step Contents */}
      <Card className="p-6 sm:p-8 skeuo-surface border-stone-300 space-y-6">
        {/* STEP 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="border-b border-stone-200 pb-3">
              <h2 className="text-base font-bold text-stone-900">
                {isBn ? 'ধাপ ১: ব্যক্তিগত তথ্য' : 'Step 1: Personal Details'}
              </h2>
              <p className="text-xs text-stone-600">
                {isBn ? 'আপনার প্রোফাইলে প্রদর্শিত মূল তথ্য দিন' : 'Provide your primary profile information'}
              </p>
            </div>

            {/* Profile Photo */}
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={avatarInputRef}
                onChange={(e) => handleFileUpload(e, setAvatarPreview)}
                accept="image/*"
                className="hidden"
              />
              <div 
                onClick={() => avatarInputRef.current?.click()}
                className="relative h-20 w-20 rounded-2xl border-2 border-dashed border-stone-300 hover:border-black bg-stone-50 flex items-center justify-center overflow-hidden cursor-pointer group"
                title={isBn ? 'ছবি পরিবর্তন করতে ক্লিক করুন' : 'Click to change photo'}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover group-hover:opacity-80 transition-opacity" />
                ) : (
                  <Camera className="h-6 w-6 text-stone-400 group-hover:text-black transition-colors" />
                )}
              </div>
              <div className="space-y-1">
                <Button variant="outline" size="sm" type="button" onClick={() => avatarInputRef.current?.click()} className="skeuo-btn-light">
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  {isBn ? 'ছবি পরিবর্তন করুন' : 'Change Photo'}
                </Button>
                <p className="text-[11px] text-stone-500">
                  {isBn ? 'ক্লিয়ার পোর্ট্রেট ছবি দিন (সর্বোচ্চ ৮ মেগাবাইট)' : 'Clear portrait photo (Max 8MB)'}
                </p>
              </div>
            </div>

            {/* Row 1: Full Name and Father's Name / Guardian */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="fullName"
                label={isBn ? 'পূর্ণ নাম (জাতীয় পরিচয়পত্র অনুযায়ী)' : 'Full Name (as per NID)'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                id="fatherName"
                label={isBn ? 'পিতার নাম / অভিভাবক' : "Father's Name / Guardian"}
                placeholder={isBn ? 'যেমন: মোঃ আব্দুল জলিল' : "e.g. Md. Abdul Jalil"}
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
              />
            </div>

            {/* Row 2: Mobile Number & Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={11}
                label={isBn ? 'মোবাইল নম্বর (ইংরেজীতে)' : 'Mobile Number (English)'}
                placeholder="017XXXXXXXX"
                value={phone}
                onChange={(e) => handlePhoneInput(e.target.value)}
                required
              />
              <Input
                id="dob"
                type="date"
                label={isBn ? 'জন্ম তারিখ' : 'Date of Birth'}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            {/* Row 3: Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                {isBn ? 'লিঙ্গ' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-black focus:outline-none"
              >
                <option value="male">{isBn ? 'পুরুষ (Male)' : 'Male'}</option>
                <option value="female">{isBn ? 'মহিলা (Female)' : 'Female'}</option>
                <option value="other">{isBn ? 'অন্যান্য (Other)' : 'Other'}</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: NID Documents */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="border-b border-stone-200 pb-3">
              <h2 className="text-base font-bold text-stone-900">
                {isBn ? 'ধাপ ২: জাতীয় পরিচয়পত্র (NID) ভেরিফিকেশন' : 'Step 2: NID Identity Document Verification'}
              </h2>
              <p className="text-xs text-stone-600">
                {isBn 
                  ? 'এই তথ্য এবং ছবিগুলো সম্পূর্ণ সুরক্ষিত ও গোপন থাকবে। শুধুমাত্র অ্যাডমিন পর্যালোচনার জন্য ব্যবহার করা হবে।'
                  : 'NID documents remain strictly private and accessible only to authorized administrators.'}
              </p>
            </div>

            <Input
              id="nidNumber"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={17}
              label={isBn ? '১০ বা ১৭ সংখ্যার এনআইডি নম্বর (ইংরেজীতে)' : '10 or 17 digit NID Number (English)'}
              placeholder="e.g. 1990521934000123"
              value={nidNumber}
              onChange={(e) => handleNidInput(e.target.value)}
              required
            />

            {/* NID Photos Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Front Photo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  {isBn ? 'NID কার্ডের সামনের দিকের ছবি' : 'NID Card Front Photo'}
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
                  className="rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-4 text-center hover:border-black transition-colors cursor-pointer group"
                >
                  {nidFront ? (
                    <div className="space-y-2">
                      <img src={nidFront} alt="NID Front" className="h-32 w-full object-cover rounded-xl" />
                      <span className="text-[11px] font-bold text-stone-900 group-hover:underline block">
                        {isBn ? 'ছবি পরিবর্তন করতে ক্লিক করুন' : 'Click to change'}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1 py-4">
                      <Upload className="h-8 w-8 text-stone-400 group-hover:text-black mx-auto transition-colors" />
                      <span className="text-xs text-stone-600 group-hover:text-black block transition-colors">
                        {isBn ? 'সামনের ছবি আপলোড করুন' : 'Upload Front Image'}
                      </span>
                      <span className="text-[10px] text-stone-400 block">JPG, PNG (Max 8MB)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Back Photo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  {isBn ? 'NID কার্ডের পেছনের দিকের ছবি' : 'NID Card Back Photo'}
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
                  className="rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-4 text-center hover:border-black transition-colors cursor-pointer group"
                >
                  {nidBack ? (
                    <div className="space-y-2">
                      <img src={nidBack} alt="NID Back" className="h-32 w-full object-cover rounded-xl" />
                      <span className="text-[11px] font-bold text-stone-900 group-hover:underline block">
                        {isBn ? 'ছবি পরিবর্তন করতে ক্লিক করুন' : 'Click to change'}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1 py-4">
                      <Upload className="h-8 w-8 text-stone-400 group-hover:text-black mx-auto transition-colors" />
                      <span className="text-xs text-stone-600 group-hover:text-black block transition-colors">
                        {isBn ? 'পেছনের ছবি আপলোড করুন' : 'Upload Back Image'}
                      </span>
                      <span className="text-[10px] text-stone-400 block">JPG, PNG (Max 8MB)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Work Area & Distance */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="border-b border-stone-200 pb-3">
              <h2 className="text-base font-bold text-stone-900">
                {isBn ? 'ধাপ ৩: কাজের এলাকা ও সেবার পরিধি' : 'Step 3: Work Area & Coverage'}
              </h2>
              <p className="text-xs text-stone-600">
                {isBn ? 'আপনি যেসব এলাকায় সেবা প্রদান করতে চান তা নির্ধারণ করুন' : 'Specify locations where you provide service'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* District */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  {isBn ? 'জেলা' : 'District'}
                </label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-black focus:outline-none"
                >
                  {districtsList.map((d) => (
                    <option key={d.id} value={d.name_en}>
                      {isBn ? d.name_bn : d.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upazila */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  {isBn ? 'উপজেলা' : 'Upazila'}
                </label>
                <select
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-black focus:outline-none"
                >
                  {availableUpazilas.map((u) => (
                    <option key={u.id} value={u.name_en || u.name_bn}>
                      {isBn ? u.name_bn : u.name_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="area"
                label={isBn ? 'নির্দিষ্ট এলাকা বা পাড়া' : 'Area / Neighborhood'}
                placeholder={isBn ? 'যেমন: বাসস্ট্যান্ড, পূর্ব হাজীপাড়া' : 'e.g. East Hazipara'}
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
              <Input
                id="address"
                label={isBn ? 'পূর্ণ ঠিকানা (বাড়ি/রোড)' : 'Street Address'}
                placeholder={isBn ? 'রোড নং ৩, পূর্ব হাজীপাড়া' : 'Road 3, East Hazipara'}
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                required
              />
            </div>

            {/* Service Radius Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-700">
                  {isBn ? 'সর্বোচ্চ সেবা প্রদানের দূরত্ব' : 'Maximum Service Radius'}
                </span>
                <span className="font-bold text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-300">
                  {toBanglaNumber(maxRadiusKm)} কি.মি. (km)
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={50}
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                className="w-full accent-stone-900 cursor-pointer"
              />
              <p className="text-[11px] text-stone-500">
                {isBn 
                  ? 'আপনার অবস্থান থেকে এই দূরত্বের মধ্যকার কাস্টমারদের নিকট আপনি সার্চ লিস্টে দৃশ্যমান হবেন।'
                  : 'Customers within this radius from your center will be able to discover and book you.'}
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Skills & Rates (Dynamic Category & Subcategories, Admin Regulated) */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="border-b border-stone-200 pb-3">
              <h2 className="text-base font-bold text-stone-900">
                {isBn ? 'ধাপ ৪: পেশাগত দক্ষতা ও পারিশ্রমিক' : 'Step 4: Professional Skills & Pricing'}
              </h2>
              <p className="text-xs text-stone-600">
                {isBn ? 'আপনার প্রধান সেবা এবং দক্ষতার ধরন নির্বাচন করুন' : 'Select your primary work category and skills'}
              </p>
            </div>

            {/* Main Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                {isBn ? 'প্রধান সার্ভিস ক্যাটাগরি' : 'Primary Service Category'}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setSelectedSubcategories([])
                }}
                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-black focus:outline-none"
              >
                {categoriesList.map((c) => (
                  <option key={c.id || c.slug} value={c.slug || c.id}>
                    {isBn ? c.name_bn : c.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategories Checkbox Pills (Dynamically matched & Optional) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700">
                  {isBn ? 'বিশেষ পারদর্শিতা (ঐচ্ছিক - সাব-ক্যাটাগরি সমূহ নির্বাচন করুন)' : 'Specific Skills / Subcategories (Optional)'}
                </label>
                <span className="text-[10px] text-stone-500 font-normal">
                  {isBn ? 'প্রযোজ্য না হলে খালি রাখতে পারেন' : 'Optional - can be left blank'}
                </span>
              </div>

              {activeSubcategories.length === 0 ? (
                <div className="p-3 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-stone-200">
                  {isBn ? 'এই ক্যাটাগরিতে সরাসরি প্রধান সেবা প্রযোজ্য' : 'No subcategories required for this category'}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {activeSubcategories.map((sub) => {
                    const identifier = sub.name_bn
                    const isChecked = selectedSubcategories.includes(identifier) || selectedSubcategories.includes(sub.id) || selectedSubcategories.includes(sub.slug)
                    return (
                      <button
                        key={sub.id || sub.slug}
                        type="button"
                        onClick={() => toggleSubcategory(identifier)}
                        className={`rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                          isChecked
                            ? 'skeuo-btn-dark bg-stone-900 text-white'
                            : 'skeuo-btn-light bg-stone-100 text-stone-700 border border-stone-300'
                        }`}
                      >
                        {isBn ? sub.name_bn : sub.name_en}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="title"
                label={isBn ? 'প্রফেশনাল পদবী' : 'Professional Title'}
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                placeholder={isBn ? 'যেমন: সিনিয়র ওয়্যারিং মিস্ত্রী' : 'e.g. Master Electrician'}
              />
              <Input
                id="expYears"
                type="number"
                label={isBn ? 'কাজের অভিজ্ঞতা (বছর)' : 'Experience (Years)'}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
              />
            </div>

            {/* Pricing Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  {isBn ? 'মজুরি নির্ধারণ পদ্ধতি' : 'Charge Model'}
                </label>
                <select
                  value={chargeType}
                  onChange={(e) => setChargeType(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-black focus:outline-none"
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

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                {isBn ? 'কাজের বিবরণ বা আত্মপরিচয়' : 'Bio / Experience Description'}
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={isBn ? 'আপনার অভিজ্ঞতা ও বিশ্বস্ততা সম্পর্কে গ্রাহককে জানান...' : 'Tell customers about your experience...'}
                className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs text-stone-900 focus:border-black focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 5: Verification & Password */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-3">
              <h2 className="text-base font-bold text-stone-900">
                {isBn ? 'ধাপ ৫: হোয়াটসঅ্যাপ ওটিপি যাচাই ও পাসওয়ার্ড সেট করুন' : 'Step 5: WhatsApp OTP & Password Setup'}
              </h2>
              <p className="text-xs text-stone-600">
                {isBn 
                  ? 'নিরাপত্তা নিশ্চিত করতে আপনার হোয়াটসঅ্যাপ নম্বরে ওটিপি পাঠানো হবে এবং ভবিষ্যতে লগইনের জন্য পাসওয়ার্ড সেট করুন।'
                  : 'Verify your WhatsApp mobile number and set your secure login password.'}
              </p>
            </div>

            {/* Summary Review Pill Card */}
            <div className="p-4 rounded-2xl skeuo-surface border border-stone-300 space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="text-stone-500">{isBn ? 'নাম:' : 'Name:'}</span>
                <span className="font-bold text-stone-900">{fullName}</span>
              </div>
              {fatherName && (
                <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                  <span className="text-stone-500">{isBn ? 'পিতার নাম:' : "Father's Name:"}</span>
                  <span className="font-bold text-stone-900">{fatherName}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="text-stone-500">{isBn ? 'মোবাইল নম্বর:' : 'Phone:'}</span>
                <span className="font-bold font-mono text-stone-900">{phone}</span>
              </div>
              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="text-stone-500">{isBn ? 'প্রধান ক্যাটাগরি:' : 'Category:'}</span>
                <span className="font-bold text-stone-900">
                  {categoriesList.find(c => c.slug === selectedCategory || c.id === selectedCategory)?.name_bn || selectedCategory}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">{isBn ? 'প্রারম্ভিক মজুরি:' : 'Starting Charge:'}</span>
                <span className="font-bold text-stone-900">৳{toBanglaNumber(baseCharge)} ({chargeType})</span>
              </div>
            </div>

            {/* WhatsApp OTP Verification Box */}
            <div className="rounded-2xl border-2 border-stone-300 bg-stone-50 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl skeuo-btn-dark bg-stone-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    ১
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                      {isBn ? 'হোয়াটসঅ্যাপ (WhatsApp) ওটিপি যাচাই' : 'WhatsApp OTP Verification'}
                    </h3>
                    <p className="text-[11px] text-stone-600">
                      {isBn ? `আপনার নম্বর: ${phone}` : `Phone: ${phone}`}
                    </p>
                  </div>
                </div>
                {isOtpVerified && (
                  <Badge variant="neutral" className="bg-stone-900 text-white text-[11px] px-2.5 py-1 font-bold">
                    ✓ {isBn ? 'যাচাইকৃত' : 'Verified'}
                  </Badge>
                )}
              </div>

              {!isOtpVerified ? (
                <div className="space-y-3 pt-1">
                  {!isOtpSent ? (
                    <Button
                      type="button"
                      onClick={handleSendOtp}
                      isLoading={isOtpSending}
                      className="w-full skeuo-btn-dark bg-stone-900 hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl shadow-xs"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      <span>{isBn ? 'WhatsApp-এ ওটিপি পাঠান' : 'Send OTP via WhatsApp'}</span>
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          id="otpCode"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="৪-সংখ্যার কোড দিন (যেমন: 1234)"
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
                          className="skeuo-btn-dark bg-stone-900 text-white text-xs font-bold px-5 shrink-0"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          <span>{isBn ? 'যাচাই করুন' : 'Verify'}</span>
                        </Button>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-800 font-medium">{otpMessage}</span>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isOtpSending}
                          className="text-stone-900 hover:underline font-bold cursor-pointer"
                        >
                          {isBn ? 'পুনরায় পাঠান' : 'Resend OTP'}
                        </button>
                      </div>
                    </div>
                  )}

                  {otpError && (
                    <div className="rounded-xl bg-stone-200 p-2.5 text-xs text-stone-900 border border-stone-400 font-medium">
                      {otpError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-stone-100 p-3 text-xs text-stone-900 font-bold flex items-center gap-2 border border-stone-300">
                  <CheckCircle2 className="h-4 w-4 text-stone-900 shrink-0" />
                  <span>{isBn ? 'আপনার WhatsApp নম্বরটি সফলভাবে নিশ্চিত ও সুরক্ষিত করা হয়েছে।' : 'WhatsApp number verified and secured.'}</span>
                </div>
              )}
            </div>

            {/* Password Setup Box */}
            <div className="rounded-2xl skeuo-surface p-4 sm:p-5 space-y-4 border border-stone-300">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl skeuo-btn-dark text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  ২
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                    {isBn ? 'অ্যাকাউন্টের পাসওয়ার্ড সেট করুন (Set Password)' : 'Set Account Password'}
                  </h3>
                  <p className="text-[11px] text-stone-600">
                    {isBn ? 'পরবর্তীতে অ্যাপে লগইন করার জন্য এই পাসওয়ার্ড ব্যবহার করবেন।' : 'Use this password for future logins.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    label={isBn ? 'গোপন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'Password (min 6 characters)'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
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
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="flex items-center gap-1.5 text-stone-700 hover:text-black font-semibold cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{showPassword ? (isBn ? 'পাসওয়ার্ড লুকান' : 'Hide Password') : (isBn ? 'পাসওয়ার্ড দেখুন' : 'Show Password')}</span>
                </button>
                <span className="text-[11px] text-stone-500">
                  {isBn ? 'লগইন আইডি: আপনার মোবাইল নম্বর' : 'Login ID: Your Phone Number'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="skeuo-btn-light text-xs font-bold"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              {isBn ? 'পেছনে যান' : 'Back'}
            </Button>
          ) : <div></div>}

          {currentStep < 5 ? (
            <Button type="button" onClick={handleNextStep} className="skeuo-btn-dark text-xs font-bold">
              <span>{isBn ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              className="skeuo-btn-dark text-xs font-bold px-6"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              <span>{isBn ? 'রেজিস্ট্রেশন ও পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Registration & Password'}</span>
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

export default function MistriOnboardingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-semibold text-stone-600">অনবোর্ডিং লোড হচ্ছে...</div>}>
      <MistriOnboardingContent />
    </Suspense>
  )
}
