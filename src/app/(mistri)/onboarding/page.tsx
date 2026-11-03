'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, Shield, MapPin, Wrench, CheckCircle2, 
  Upload, ArrowRight, ArrowLeft, Camera, DollarSign,
  AlertCircle
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toBanglaNumber } from '@/lib/utils'

export default function MistriOnboardingPage() {
  const router = useRouter()
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Form States
  // Step 1: Personal
  const [fullName, setFullName] = useState('মোঃ রফিকুল ইসলাম')
  const [phone, setPhone] = useState('01712345678')
  const [dateOfBirth, setDateOfBirth] = useState('1990-05-15')
  const [gender, setGender] = useState('male')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
  )

  // Step 2: NID Identity
  const [nidNumber, setNidNumber] = useState('1990521934000123')
  const [nidFront, setNidFront] = useState<string | null>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
  )
  const [nidBack, setNidBack] = useState<string | null>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
  )

  // Step 3: Location
  const [district, setDistrict] = useState('Thakurgaon')
  const [upazila, setUpazila] = useState('Thakurgaon Sadar')
  const [area, setArea] = useState('বাসস্ট্যান্ড এলাকা')
  const [streetAddress, setStreetAddress] = useState('রোড নং ৩, পূর্ব হাজীপাড়া, ঠাকুরগাঁও')
  const [maxRadiusKm, setMaxRadiusKm] = useState(15)

  // Step 4: Skills & Pricing
  const [selectedCategory, setSelectedCategory] = useState('electrical-services')
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([
    'house-wiring', 'fan-lighting-fitting'
  ])
  const [experienceYears, setExperienceYears] = useState(6)
  const [professionalTitle, setProfessionalTitle] = useState('দক্ষ ইলেকট্রিশিয়ান ও টেকনিশিয়ান')
  const [bio, setBio] = useState('আমি বিগত ৬ বছর ধরে ঠাকুরগাঁও সদর ও আশপাশের এলাকায় সব ধরনের বৈদ্যুতিক ওয়্যারিং, ফ্যান ফিটিংস ও মেরামতের কাজ সুনামের সাথে করে আসছি।')
  const [chargeType, setChargeType] = useState('negotiable')
  const [baseCharge, setBaseCharge] = useState(400)

  const categories = [
    { id: 'electrical-services', name_bn: 'ইলেকট্রিক্যাল কাজ', name_en: 'Electrical Services' },
    { id: 'plumbing-services', name_bn: 'প্লাম্বিং সার্ভিস', name_en: 'Plumbing Services' },
    { id: 'painting-services', name_bn: 'রং করার কাজ', name_en: 'Painting Services' },
    { id: 'masonry-services', name_bn: 'রাজমিস্ত্রীর কাজ', name_en: 'Masonry Services' },
    { id: 'tin-roofing-services', name_bn: 'ঘরের টিনের কাজ', name_en: 'Tin Roofing Services' },
    { id: 'carpentry-services', name_bn: 'কাঠের কাজ', name_en: 'Carpentry Services' },
  ]

  const subcategoriesMap: Record<string, { id: string; name_bn: string; name_en: string }[]> = {
    'electrical-services': [
      { id: 'house-wiring', name_bn: 'বাসা-বাড়ির ওয়্যারিং', name_en: 'House Wiring' },
      { id: 'fan-lighting-fitting', name_bn: 'ফ্যান ও লাইটিং ফিটিং', name_en: 'Fan & Light Fitting' },
      { id: 'switch-socket-repair', name_bn: 'সুইচ ও সকেট মেরামত', name_en: 'Switch Socket Repair' },
      { id: 'db-breaker', name_bn: 'সার্কিট ব্রেকার ও ডিবি বোর্ড', name_en: 'Breaker & DB Board' },
    ],
    'plumbing-services': [
      { id: 'pipe-fitting', name_bn: 'পাইপ ফিটিং ও মেরামত', name_en: 'Pipe Fitting' },
      { id: 'water-pump-repair', name_bn: 'পানির মোটর ও পাম্প মেরামত', name_en: 'Water Pump Repair' },
      { id: 'sanitary-fitting', name_bn: 'স্যানিটারি ও বাথরুম ফিটিংস', name_en: 'Sanitary Fitting' },
    ],
  }

  const toggleSubcategory = (subId: string) => {
    setSelectedSubcategories(prev => 
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    )
  }

  const handleNextStep = () => {
    setErrorMessage('')
    if (currentStep === 1) {
      if (!fullName || !phone) {
        setErrorMessage(isBn ? 'নাম ও মোবাইল নম্বর পূরণ করুন' : 'Provide full name and phone')
        return
      }
    } else if (currentStep === 2) {
      if (!nidNumber || !nidFront || !nidBack) {
        setErrorMessage(isBn ? 'এনআইডি নম্বর এবং উভয় পাশের ছবি আপলোড করা আবশ্যক' : 'NID number and both front & back photos are required')
        return
      }
    } else if (currentStep === 3) {
      if (!streetAddress) {
        setErrorMessage(isBn ? 'আপনার স্থায়ী বা কাজের ঠিকানা লিখুন' : 'Enter your street address')
        return
      }
    } else if (currentStep === 4) {
      if (selectedSubcategories.length === 0) {
        setErrorMessage(isBn ? 'কমপক্ষে একটি সাব-ক্যাটাগরি বা কাজের ধরন নির্বাচন করুন' : 'Select at least one subcategory')
        return
      }
    }
    setCurrentStep(prev => prev + 1)
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      router.push('/onboarding/status')
    }, 1200)
  }

  const stepTitles = [
    { num: 1, title: isBn ? 'ব্যক্তিগত তথ্য' : 'Personal Info', icon: User },
    { num: 2, title: isBn ? 'জাতীয় পরিচয়পত্র' : 'NID Document', icon: Shield },
    { num: 3, title: isBn ? 'এলাকা ও দূরত্ব' : 'Work Area', icon: MapPin },
    { num: 4, title: isBn ? 'দক্ষতা ও পারিশ্রমিক' : 'Skills & Rates', icon: Wrench },
    { num: 5, title: isBn ? 'পর্যালোচনা' : 'Review', icon: CheckCircle2 },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <Badge variant="primary" className="text-xs px-3 py-1">
          {isBn ? '👷‍♂️ মিস্ত্রী ভেরিফিকেশন অনবোর্ডিং' : '👷‍♂️ Professional Verification Onboarding'}
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {isBn ? 'আপনার প্রফেশনাল প্রোফাইল তৈরি করুন' : 'Build Your Professional Profile'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          {isBn 
            ? 'এডমিন দ্বারা অনুমোদিত হলে আপনি সরাসরি কাস্টমারদের বুকিং পাবেন ও অ্যাপের সার্চ লিস্টে স্থান পাবেন।'
            : 'Upon Admin review and approval, your profile will go live to receive customer bookings.'}
        </p>
      </div>

      {/* Stepper Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-0 -translate-y-1/2"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -z-0 -translate-y-1/2 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (stepTitles.length - 1)) * 100}%` }}
          ></div>

          {stepTitles.map((step) => {
            const Icon = step.icon
            const isCompleted = step.num < currentStep
            const isCurrent = step.num === currentStep
            return (
              <div key={step.num} className="flex flex-col items-center relative z-10 bg-slate-50 px-1">
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border-2 transition-all ${
                    isCompleted
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : isCurrent
                      ? 'border-blue-600 bg-white text-blue-600 ring-4 ring-blue-100 shadow-sm'
                      : 'border-slate-300 bg-white text-slate-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                  isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step Contents */}
      <Card className="p-6 sm:p-8 shadow-md border-slate-200 space-y-6">
        {/* STEP 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {isBn ? 'ধাপ ১: ব্যক্তিগত তথ্য' : 'Step 1: Personal Details'}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn ? 'আপনার প্রোফাইলে প্রদর্শিত মূল তথ্য দিন' : 'Provide your primary profile information'}
              </p>
            </div>

            {/* Profile Photo */}
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <div className="space-y-1">
                <Button variant="outline" size="sm" type="button" onClick={() => setAvatarPreview('https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80')}>
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  {isBn ? 'ছবি পরিবর্তন করুন' : 'Change Photo'}
                </Button>
                <p className="text-[11px] text-slate-400">
                  {isBn ? 'ক্লিয়ার পোর্ট্রেট ছবি দিন (সর্বোচ্চ ৫ মেগাবাইট)' : 'Clear portrait photo (Max 5MB)'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="fullName"
                label={isBn ? 'পূর্ণ নাম (জাতীয় পরিচয়পত্র অনুযায়ী)' : 'Full Name (as per NID)'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                id="phone"
                type="tel"
                label={t('auth.phone_number')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
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
                <label className="text-xs font-semibold text-slate-700">
                  {isBn ? 'লিঙ্গ' : 'Gender'}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="male">{isBn ? 'পুরুষ (Male)' : 'Male'}</option>
                  <option value="female">{isBn ? 'মহিলা (Female)' : 'Female'}</option>
                  <option value="other">{isBn ? 'অন্যান্য (Other)' : 'Other'}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: NID Documents */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {isBn ? 'ধাপ ২: জাতীয় পরিচয়পত্র (NID) ভেরিফিকেশন' : 'Step 2: NID Identity Document Verification'}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn 
                  ? 'এই তথ্য এবং ছবিগুলো সম্পূর্ণ সুরক্ষিত ও গোপন থাকবে। শুধুমাত্র অ্যাডমিন পর্যালোচনার জন্য ব্যবহার করা হবে।'
                  : 'NID documents remain strictly private and accessible only to authorized administrators.'}
              </p>
            </div>

            <Input
              id="nidNumber"
              label={isBn ? '১০ বা ১৭ সংখ্যার এনআইডি নম্বর' : '10 or 17 digit NID Number'}
              placeholder="1990XXXXXXXXXXXXX"
              value={nidNumber}
              onChange={(e) => setNidNumber(e.target.value)}
              leftIcon={<Shield className="h-4 w-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* NID Front */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  {isBn ? 'NID কার্ডের সামনের দিকের ছবি' : 'NID Card Front Photo'}
                </label>
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center hover:border-blue-400 transition-colors">
                  {nidFront ? (
                    <div className="space-y-2">
                      <img src={nidFront} alt="NID Front" className="h-32 w-full object-cover rounded-xl" />
                      <Badge variant="success" className="text-[10px]">
                        {isBn ? 'ছবি সংযুক্ত হয়েছে' : 'Photo Attached'}
                      </Badge>
                    </div>
                  ) : (
                    <div className="py-6 space-y-2">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                      <span className="text-xs text-slate-500 block">
                        {isBn ? 'ক্লিয়ার সামনের ছবি আপলোড করুন' : 'Upload front side photo'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* NID Back */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  {isBn ? 'NID কার্ডের পেছনের দিকের ছবি' : 'NID Card Back Photo'}
                </label>
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center hover:border-blue-400 transition-colors">
                  {nidBack ? (
                    <div className="space-y-2">
                      <img src={nidBack} alt="NID Back" className="h-32 w-full object-cover rounded-xl" />
                      <Badge variant="success" className="text-[10px]">
                        {isBn ? 'ছবি সংযুক্ত হয়েছে' : 'Photo Attached'}
                      </Badge>
                    </div>
                  ) : (
                    <div className="py-6 space-y-2">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                      <span className="text-xs text-slate-500 block">
                        {isBn ? 'ক্লিয়ার পেছনের ছবি আপলোড করুন' : 'Upload back side photo'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Location & Service Area */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {isBn ? 'ধাপ ৩: কাজের এলাকা ও সার্ভিস দূরত্ব' : 'Step 3: Location & Service Radius'}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn ? 'আপনি যে এলাকায় কাস্টমারদের সেবা দিতে পারবেন' : 'The geographic area where you are available to work'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  {t('locations.select_district')}
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="Thakurgaon">{isBn ? 'ঠাকুরগাঁও' : 'Thakurgaon'}</option>
                  <option value="Panchagarh">{isBn ? 'পঞ্চগড়' : 'Panchagarh'}</option>
                  <option value="Dinajpur">{isBn ? 'দিনাজপুর' : 'Dinajpur'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  {t('locations.select_upazila')}
                </label>
                <select
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="Thakurgaon Sadar">{isBn ? 'ঠাকুরগাঁও সদর' : 'Thakurgaon Sadar'}</option>
                  <option value="Pirganj">{isBn ? 'পীরগঞ্জ' : 'Pirganj'}</option>
                  <option value="Ranisankail">{isBn ? 'রাণীশংকৈল' : 'Ranisankail'}</option>
                  <option value="Baliadangi">{isBn ? 'বালিয়াডাঙ্গী' : 'Baliadangi'}</option>
                  <option value="Boda">{isBn ? 'বোদা' : 'Boda'}</option>
                </select>
              </div>
            </div>

            <Input
              id="area"
              label={isBn ? 'ইউনিয়ন / এলাকা / গ্রাম' : 'Union / Area / Village'}
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder={isBn ? 'যেমন: বাসস্ট্যান্ড, হাজীপাড়া' : 'e.g. Bus Stand area'}
            />

            <Input
              id="streetAddress"
              label={isBn ? 'পূর্ণ ঠিকানা' : 'Full Street Address'}
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              required
            />

            {/* Radius Slider */}
            <div className="space-y-2 rounded-2xl bg-blue-50/60 p-4 border border-blue-100">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800">
                  {isBn ? 'সর্বোচ্চ কত দূরত্বের কাজ করতে চান?' : 'Maximum Service Radius'}
                </span>
                <span className="text-blue-700 font-bold">
                  {toBanglaNumber(maxRadiusKm)} {isBn ? 'কিলোমিটার' : 'km'}
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={50}
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                {isBn 
                  ? 'আপনার অবস্থান থেকে এই দূরত্বের মধ্যকার কাস্টমারদের নিকট আপনি সার্চ লিস্টে দৃশ্যমান হবেন।'
                  : 'Customers within this radius from your center will be able to discover and book you.'}
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Skills & Rates */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {isBn ? 'ধাপ ৪: পেশাগত দক্ষতা ও পারিশ্রমিক' : 'Step 4: Professional Skills & Pricing'}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn ? 'আপনার প্রধান সেবা এবং দক্ষতার ধরন নির্বাচন করুন' : 'Select your primary work category and skills'}
              </p>
            </div>

            {/* Main Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {isBn ? 'প্রধান সার্ভিস ক্যাটাগরি' : 'Primary Service Category'}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setSelectedSubcategories([])
                }}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isBn ? c.name_bn : c.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategories Checkbox Pills */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                {isBn ? 'বিশেষ পারদর্শিতা (সাব-ক্যাটাগরি সমূহ নির্বাচন করুন)' : 'Specific Skills / Subcategories'}
              </label>
              <div className="flex flex-wrap gap-2">
                {(subcategoriesMap[selectedCategory] || subcategoriesMap['electrical-services']).map((sub) => {
                  const isChecked = selectedSubcategories.includes(sub.id)
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleSubcategory(sub.id)}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all border ${
                        isChecked
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {isBn ? sub.name_bn : sub.name_en}
                    </button>
                  )
                })}
              </div>
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
                <label className="text-xs font-semibold text-slate-700">
                  {isBn ? 'মজুরি নির্ধারণ পদ্ধতি' : 'Charge Model'}
                </label>
                <select
                  value={chargeType}
                  onChange={(e) => setChargeType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
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
                leftIcon={<DollarSign className="h-4 w-4" />}
              />
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {isBn ? 'কাজের বিবরণ বা আত্মপরিচয়' : 'Bio / Experience Description'}
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 5: Final Review */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {isBn ? 'ধাপ ৫: তথ্য পর্যালোচনা ও সাবমিশন' : 'Step 5: Review & Submit Application'}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn ? 'সবগুলো তথ্য সঠিক আছে কিনা যাচাই করে সাবমিট করুন' : 'Confirm your details before sending to Admin for verification'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 space-y-3 text-xs text-slate-700 border border-slate-200">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-semibold text-slate-500">{isBn ? 'নাম:' : 'Name:'}</span>
                <span className="font-bold text-slate-900">{fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-semibold text-slate-500">{isBn ? 'মোবাইল:' : 'Phone:'}</span>
                <span className="font-bold text-slate-900">{phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-semibold text-slate-500">{isBn ? 'এনআইডি:' : 'NID:'}</span>
                <span className="font-bold text-slate-900">{nidNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-semibold text-slate-500">{isBn ? 'কাজের এলাকা:' : 'Area:'}</span>
                <span className="font-bold text-slate-900">{district}, {upazila} ({toBanglaNumber(maxRadiusKm)} কিমি ব্যাসার্ধ)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-semibold text-slate-500">{isBn ? 'অভিজ্ঞতা:' : 'Experience:'}</span>
                <span className="font-bold text-slate-900">{toBanglaNumber(experienceYears)} বছর</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold text-slate-500">{isBn ? 'বেস মজুরি:' : 'Base Charge:'}</span>
                <span className="font-bold text-blue-600">৳{toBanglaNumber(baseCharge)} ({chargeType})</span>
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50/70 p-4 border border-blue-200 text-xs text-blue-800 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-blue-600" />
                {isBn ? 'অ্যাডমিন পর্যালোচনা শর্তাবলী' : 'Admin Review Policy'}
              </span>
              <p>
                {isBn 
                  ? 'আপনার আবেদন জমা দেয়ার পর অ্যাডমিন টিম ২৪ ঘণ্টার মধ্যে এনআইডি তথ্য পর্যালোচনা করবে। আবেদন অনুমোদিত হলে আপনি মেসেজের মাধ্যমে নোটিফিকেশন পাবেন এবং আপনার অ্যাকাউন্ট সক্রিয় হবে।'
                  : 'Your application will be verified within 24 hours. Once verified, you will be alerted and able to accept customer bookings.'}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              {isBn ? 'পেছনে যান' : 'Back'}
            </Button>
          ) : <div></div>}

          {currentStep < 5 ? (
            <Button type="button" onClick={handleNextStep} className="text-xs">
              <span>{isBn ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold px-6"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              <span>{isBn ? 'ভেরিফিকেশনের জন্য জমা দিন' : 'Submit for Verification'}</span>
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

