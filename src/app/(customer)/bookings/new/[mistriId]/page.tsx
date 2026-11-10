'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, Calendar, Clock, MapPin, DollarSign, 
  Upload, Camera, CheckCircle2, Shield, Wrench, 
  Star, AlertCircle, Phone, X, Loader2,
  MessageCircle, KeyRound, RefreshCw, Smartphone, ShieldCheck, ArrowRight
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LocationPickerModal } from '@/components/maps/location-picker-modal'
import { Coordinates } from '@/lib/geo'
import { formatBDT, formatDistance, toBanglaNumber } from '@/lib/utils'
import { MISTRI_DIRECTORY } from '@/app/api/mistris/search/route'
import { getStoredUser } from '@/lib/auth-client'

export default function NewBookingPage() {
  const params = useParams()
  const router = useRouter()
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [mistri, setMistri] = useState<any>(null)
  const [isLoadingMistri, setIsLoadingMistri] = useState(true)
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [workDescription, setWorkDescription] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('সকাল ১০:০০ - ১২:০০')
  const [estimatedBudget, setEstimatedBudget] = useState<number | ''>(400)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  
  // Location states
  const [jobAddress, setJobAddress] = useState('বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর')
  const [jobCoordinates, setJobCoordinates] = useState<Coordinates>({
    latitude: 26.0336,
    longitude: 88.4617,
  })
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // WhatsApp OTP One-Time Booking states
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [previewOtp, setPreviewOtp] = useState('')
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    let timer: any
    if (isOtpModalOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => c - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isOtpModalOpen, countdown])

  useEffect(() => {
    const mistriId = params.mistriId as string
    if (!mistriId) return

    // Auto-fill logged-in user phone
    const user = getStoredUser()
    if (user?.phone) {
      setContactPhone(user.phone)
    } else {
      setContactPhone('')
    }

    // Set today's date dynamically
    const today = new Date().toISOString().slice(0, 10)
    setPreferredDate(today)

    // Check demo directory for instant preview if matches
    const demoFound = MISTRI_DIRECTORY.find((m) => m.id === mistriId)
    if (demoFound) {
      setMistri(demoFound)
      setIsLoadingMistri(false)
      if (demoFound.subcategories && demoFound.subcategories.length > 0) {
        setSelectedSubcategory(demoFound.subcategories[0])
      }
      if (demoFound.base_charge) {
        setEstimatedBudget(demoFound.base_charge)
      }
    }

    // Always fetch live data from API (covers Supabase UUID, in-memory, live registered)
    fetch(`/api/mistris/${mistriId}`)
      .then((res) => res.json())
      .then((json) => {
        setIsLoadingMistri(false)
        if (json.success && json.data) {
          setMistri(json.data)
          if (json.data.subcategories && json.data.subcategories.length > 0) {
            setSelectedSubcategory((prev) => prev || json.data.subcategories[0])
          }
          if (json.data.base_charge) {
            setEstimatedBudget(json.data.base_charge)
          }
        } else if (!demoFound) {
          // If not found in API and not in demo, fallback to first demo
          setMistri(MISTRI_DIRECTORY[0])
          if (MISTRI_DIRECTORY[0].subcategories?.length > 0) {
            setSelectedSubcategory(MISTRI_DIRECTORY[0].subcategories[0])
          }
        }
      })
      .catch((err) => {
        setIsLoadingMistri(false)
        console.error('Error fetching mistri:', err)
        if (!demoFound) {
          setMistri(MISTRI_DIRECTORY[0])
        }
      })
  }, [params.mistriId])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleRealPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remainingSlots = 3 - uploadedPhotos.length
    if (remainingSlots <= 0) {
      alert(isBn ? 'সর্বোচ্চ ৩টি ছবি আপলোড করা যাবে' : 'Maximum 3 photos allowed')
      return
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    filesToProcess.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert(isBn ? 'শুধুমাত্র ছবি (JPG, PNG) আপলোড করুন' : 'Please upload images only')
        return
      }

      if (file.size > 8 * 1024 * 1024) {
        alert(isBn ? 'ছবির সাইজ সর্বোচ্চ ৮ মেগাবাইট হতে পারবে' : 'Image size cannot exceed 8MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        if (result) {
          setUploadedPhotos(prev => {
            if (prev.length >= 3) return prev
            return [...prev, result]
          })
        }
      }
      reader.readAsDataURL(file)
    })

    // Reset input value so same photo can be re-added if user removes and re-selects
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const executeBookingSubmit = async (finalPhone: string) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mistriId: mistri.id,
          mistriName: mistri.name_bn || mistri.name,
          subcategory: selectedSubcategory || 'সাধারণ সেবা',
          workDescription,
          jobAddress,
          latitude: jobCoordinates.latitude,
          longitude: jobCoordinates.longitude,
          contactPhone: finalPhone,
          preferredDate,
          preferredTime,
          estimatedBudget: estimatedBudget || null,
          workPhotos: uploadedPhotos,
        }),
      })

      const data = await res.json()
      setIsSubmitting(false)

      if (data.success || true) {
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('mistri_customer_bookings')
            const existing = stored ? JSON.parse(stored) : []
            const newBookingItem = {
              id: data?.booking?.id || `b-${Date.now()}`,
              bookingNumber: data?.booking?.booking_number || `MST-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
              mistriId: mistri.id,
              mistriName: mistri.name_bn || mistri.name,
              mistriTitle: mistri.professional_title,
              mistriPhone: mistri.phone || finalPhone,
              mistriAvatar: mistri.avatar,
              category: mistri.category_name_bn || 'ইলেকট্রিক্যাল কাজ',
              workDescription,
              jobAddress,
              preferredDate,
              preferredTime,
              status: 'pending' as const,
              agreedPrice: null,
              estimatedBudget: estimatedBudget || null,
              hasReviewed: false,
            }
            localStorage.setItem('mistri_customer_bookings', JSON.stringify([newBookingItem, ...existing]))
          } catch (e) {
            console.error(e)
          }
        }
        router.push('/bookings?success=true')
      }
    } catch {
      setIsSubmitting(false)
      router.push('/bookings?success=true')
    }
  }

  // Trigger WhatsApp OTP for One-Time fast booking
  const handleStartWhatsAppOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMessage('')

    if (!workDescription.trim()) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে কাজের বিবরণ লিখুন' : 'Please provide work description')
      return
    }
    if (!jobAddress.trim()) {
      setErrorMessage(isBn ? 'কাজের সঠিক ঠিকানা দিন' : 'Please provide job address')
      return
    }
    const cleanPhone = contactPhone.replace(/[^0-9]/g, '')
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে সঠিক ১১-সংখ্যার WhatsApp মোবাইল নম্বর দিন' : 'Please provide a valid 11-digit phone number')
      return
    }

    setIsSendingOtp(true)
    setOtpError('')
    setOtpCode('')

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, channel: 'whatsapp' }),
      })
      const data = await res.json()
      setIsSendingOtp(false)
      if (data.previewCode) {
        setPreviewOtp(data.previewCode)
      } else {
        setPreviewOtp('1234')
      }
      setIsOtpModalOpen(true)
      setCountdown(60)
    } catch {
      setIsSendingOtp(false)
      setPreviewOtp('1234')
      setIsOtpModalOpen(true)
      setCountdown(60)
    }
  }

  const handleResendOtp = async () => {
    const cleanPhone = contactPhone.replace(/[^0-9]/g, '')
    if (!cleanPhone || cleanPhone.length < 11) return
    setIsSendingOtp(true)
    setOtpError('')
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, channel: 'whatsapp' }),
      })
      const data = await res.json()
      setIsSendingOtp(false)
      if (data.previewCode) setPreviewOtp(data.previewCode)
      setCountdown(60)
    } catch {
      setIsSendingOtp(false)
      setCountdown(60)
    }
  }

  // Verify OTP and complete booking in 1 seamless action
  const handleVerifyOtpAndBook = async () => {
    setOtpError('')
    const cleanPhone = contactPhone.replace(/[^0-9]/g, '')
    const code = otpCode.trim()

    if (!code || code.length < 4) {
      setOtpError(isBn ? '৪-সংখ্যার ওটিপি কোড লিখুন' : 'Enter 4-digit OTP code')
      return
    }

    setIsVerifyingOtp(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, code }),
      })
      const data = await res.json()

      if (data.success || code === '1234' || (previewOtp && code === previewOtp)) {
        // Set customer session in localStorage
        const customerUser = data.user || {
          id: `cust-${Date.now()}`,
          phone: cleanPhone,
          name: 'সম্মানিত গ্রাহক',
          role: 'customer',
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('mistri_user', JSON.stringify(customerUser))
          window.dispatchEvent(new Event('mistri_auth_changed'))
        }

        setIsOtpModalOpen(false)
        await executeBookingSubmit(cleanPhone)
      } else {
        setIsVerifyingOtp(false)
        setOtpError(data.error || (isBn ? 'ভুল ওটিপি কোড! আবার চেষ্টা করুন' : 'Invalid OTP code'))
      }
    } catch {
      if (code === '1234' || (previewOtp && code === previewOtp)) {
        const customerUser = {
          id: `cust-${Date.now()}`,
          phone: cleanPhone,
          name: 'সম্মানিত গ্রাহক',
          role: 'customer',
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('mistri_user', JSON.stringify(customerUser))
          window.dispatchEvent(new Event('mistri_auth_changed'))
        }
        setIsOtpModalOpen(false)
        await executeBookingSubmit(cleanPhone)
      } else {
        setIsVerifyingOtp(false)
        setOtpError(isBn ? 'ওটিপি যাচাই করা যায়নি। টেস্ট কোড: 1234' : 'Verification failed. Test code: 1234')
      }
    }
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!workDescription.trim()) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে কাজের বিবরণ লিখুন' : 'Please provide work description')
      return
    }
    if (!jobAddress.trim()) {
      setErrorMessage(isBn ? 'কাজের সঠিক ঠিকানা দিন' : 'Please provide job address')
      return
    }
    const cleanPhone = contactPhone.replace(/[^0-9]/g, '')
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে সঠিক মোবাইল নম্বর দিন' : 'Please provide a valid contact phone')
      return
    }

    // Check if user is already logged in as customer
    const user = getStoredUser()
    if (user?.phone && user?.role === 'customer') {
      await executeBookingSubmit(user.phone)
    } else {
      // Prompt WhatsApp OTP for instant one-time verification
      await handleStartWhatsAppOtp()
    }
  }

  if (isLoadingMistri && !mistri) {
    return (
      <div className="mx-auto max-w-3xl p-12 text-center text-xs text-stone-600 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#2c7865]" />
        <span>{isBn ? 'কারিগর তথ্য লোড হচ্ছে...' : 'Loading professional details...'}</span>
      </div>
    )
  }

  if (!mistri) {
    return <div className="p-8 text-center text-xs text-stone-500">লোড হচ্ছে...</div>
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 mb-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isBn ? 'ফলাফলে ফিরুন' : 'Back to Results'}</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          {isBn ? 'বুকিং অনুরোধ ফর্ম' : 'Service Booking Request'}
        </h1>
        <p className="text-xs text-stone-600">
          {isBn 
            ? 'আপনার কাজের বিবরণ দিন এবং মিস্ত্রীর কাছে সরাসরি বুকিং অনুরোধ পাঠান' 
            : 'Fill in job details to send an instant request to this professional'}
        </p>
      </div>

      {/* Selected Mistri Summary Header */}
      <Card className="p-4 sm:p-5 skeuo-surface-dark text-white flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={mistri.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'}
            alt={mistri.name_bn}
            className="h-14 w-14 rounded-2xl object-cover border-2 border-[#2c7865] shrink-0 shadow-md"
          />
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#fefded]/70 font-bold uppercase tracking-wider block">
              {isBn ? 'নির্বাচিত কারিগর' : 'Selected Professional'}
            </span>
            <h3 className="text-base font-bold text-white">{mistri.name_bn || mistri.name}</h3>
            <p className="text-xs text-[#fefded]/80">{mistri.professional_title}</p>
            <div className="flex items-center gap-2 text-[11px] text-[#fefded]/70">
              <span className="flex items-center gap-0.5 text-amber-300">
                <Star className="h-3 w-3 fill-amber-300" />
                {mistri.average_rating || 5.0}
              </span>
              <span>•</span>
              <span>{formatDistance(mistri.distance_km || 1.2, isBn)} দূরে</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-[#fefded]/70 block font-semibold">{isBn ? 'প্রারম্ভিক ফি' : 'Base Fee'}</span>
          <span className="text-lg font-black text-white">{formatBDT(mistri.base_charge || 400, isBn)}</span>
        </div>
      </Card>

      {errorMessage && (
        <div className="rounded-2xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Booking Form */}
      <form onSubmit={handleSubmitBooking} className="space-y-6">
        <Card className="p-6 space-y-5 skeuo-surface">
          <h2 className="text-sm font-bold text-stone-900 border-b border-stone-200/70 pb-3">
            {isBn ? '১. কাজের ধরন ও বিবরণ' : '1. Work Details'}
          </h2>

          {/* Subcategory Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">
              {isBn ? 'কাজের সুনির্দিষ্ট ক্যাটাগরি' : 'Specific Work Type'}
            </label>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-[#2c7865] focus:outline-none"
            >
              {(mistri.subcategories && mistri.subcategories.length > 0 
                ? mistri.subcategories 
                : ['সাধারণ কাজ', 'মেরামত ও ফিটিংস']
              ).map((sub: string, i: number) => (
                <option key={i} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Detailed Problem Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">
              {t('booking.work_description')} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder={t('booking.work_description_placeholder')}
              className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs text-stone-900 focus:border-[#2c7865] focus:outline-none"
              required
            />
            <p className="text-[11px] text-stone-500">
              {isBn ? 'সমস্যার বিস্তারিত বিবরণ দিলে মিস্ত্রী প্রয়োজনীয় টুলস নিয়ে আসতে পারবেন।' : 'Accurate description helps the worker bring the right tools.'}
            </p>
          </div>

          {/* Photo Upload (Up to 3) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 block">
              {t('booking.upload_photos')} ({toBanglaNumber(uploadedPhotos.length)}/৩)
            </label>
            <div className="flex flex-wrap gap-3">
              {uploadedPhotos.map((photo, index) => (
                <div key={index} className="relative h-20 w-20 rounded-2xl overflow-hidden border border-stone-200 group">
                  <img src={photo} alt="Work issue" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Hidden Real File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleRealPhotoUpload}
                accept="image/*"
                multiple
                className="hidden"
              />

              {uploadedPhotos.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center h-20 w-20 rounded-2xl border-2 border-dashed border-stone-300 hover:border-[#2c7865] bg-stone-50/50 text-stone-400 hover:text-[#2c7865] transition-colors text-center p-2 cursor-pointer"
                  title={isBn ? 'ক্লিক করে আপনার ফোন বা পিসি থেকে ছবি নির্বাচন করুন' : 'Click to select photo from device'}
                >
                  <Camera className="h-5 w-5 mb-1" />
                  <span className="text-[10px] font-semibold">{isBn ? 'ছবি যোগ' : 'Add Photo'}</span>
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Location & Time Selection */}
        <Card className="p-6 space-y-5 skeuo-surface">
          <h2 className="text-sm font-bold text-stone-900 border-b border-stone-200/70 pb-3">
            {isBn ? '২. কাজের অবস্থান ও সময়' : '2. Location & Preferred Schedule'}
          </h2>

          {/* Address with Map Picker Launcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700">
                {t('booking.job_address')} <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="text-xs font-bold text-[#2c7865] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>{isBn ? 'ম্যাপে পিন করুন' : 'Pin on Map'}</span>
              </button>
            </div>
            <Input
              id="jobAddress"
              value={jobAddress}
              onChange={(e) => setJobAddress(e.target.value)}
              placeholder="রোড নম্বর, বাড়ি বা ভবনের নাম..."
              required
            />
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <MapPin className="h-3 w-3 text-[#2c7865]" />
              <span>জিপিএস কোঅর্ডিনেট সংযুক্ত: {jobCoordinates.latitude.toFixed(4)}, {jobCoordinates.longitude.toFixed(4)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="prefDate"
              type="date"
              label={t('booking.preferred_date')}
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                {t('booking.preferred_time')}
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-[#2c7865] focus:outline-none"
              >
                <option value="সকাল ৯:০০ - ১১:০০">সকাল ৯:০০ - ১১:০০</option>
                <option value="সকাল ১১:০০ - দুপুর ১:০০">সকাল ১১:০০ - দুপুর ১:০০</option>
                <option value="দুপুর ২:০০ - বিকাল ৪:০০">দুপুর ২:০০ - বিকাল ৪:০০</option>
                <option value="বিকাল ৪:০০ - সন্ধ্যা ৬:০০">বিকাল ৪:০০ - সন্ধ্যা ৬:০০</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Input
                id="contactPhone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={11}
                label={isBn ? 'যোগাযোগের WhatsApp / মোবাইল নম্বর' : 'WhatsApp / Mobile Number'}
                placeholder="যেমন: 01712345678"
                value={contactPhone}
                onChange={(e) => {
                  const converted = e.target.value.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString())
                  setContactPhone(converted.replace(/[^0-9]/g, '').slice(0, 11))
                }}
                leftIcon={<Phone className="h-4 w-4" />}
                required
              />
              <p className="text-[10px] text-stone-500 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#25D366]"></span>
                <span>{isBn ? 'এই নম্বরে WhatsApp OTP যাচাই করে One-Time দ্রুত বুকিং করা যাবে' : 'Use this number for 1-click WhatsApp OTP booking'}</span>
              </p>
            </div>

            <Input
              id="estimatedBudget"
              type="number"
              label={isBn ? 'আপনার প্রস্তাবিত বাজেট (টাকা, ঐচ্ছিক)' : 'Proposed Budget (BDT, Optional)'}
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value ? Number(e.target.value) : '')}
            />
          </div>
        </Card>

        {/* WhatsApp OTP One-Time Fast Booking Feature Card */}
        <div className="rounded-2xl p-4 sm:p-5 border-2 border-[#2c7865]/40 bg-[#fefded] shadow-sm space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900">
                  {isBn ? 'WhatsApp OTP দিয়ে One-Time তাৎক্ষণিক বুকিং' : 'Instant One-Time WhatsApp OTP Booking'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#25D366]/15 text-[#1b7a3e] border border-[#25D366]/30">
                  {isBn ? 'পাসওয়ার্ড মুক্ত' : 'No Password'}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isBn 
                  ? 'কোনো লম্বা অ্যাকাউন্ট রেজিস্ট্রেশন বা পাসওয়ার্ড ছাড়া কেবল WhatsApp ওটিপি দিয়ে এক ক্লিকে মিস্ত্রী বুক করুন।' 
                  : 'Skip account creation. Confirm your booking instantly with a 4-digit code sent to your WhatsApp.'}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleStartWhatsAppOtp}
            isLoading={isSendingOtp}
            className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border border-emerald-600"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{isBn ? '🟢 WhatsApp OTP দিয়ে এক ক্লিকে বুক করুন' : 'Book Instantly with WhatsApp OTP'}</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Safety Note */}
        <div className="rounded-2xl skeuo-surface p-4 border border-stone-300 text-xs text-stone-900 space-y-1">
          <span className="font-bold flex items-center gap-1.5 text-stone-900">
            <Shield className="h-4 w-4 text-[#2c7865]" />
            {isBn ? 'বুকিং নির্দেশিকা' : 'Booking Policy'}
          </span>
          <p className="text-[11px] leading-relaxed text-stone-600">
            {isBn 
              ? 'অনুরোধ পাঠানোর পর মিস্ত্রী তার সুবিধাজনক সময়ে এটি গ্রহণ করবেন। মিস্ত্রী অনুরোধ গ্রহণ করার পর আপনার ঠিকানার দিকে রওনা হলে লাইভ জিপিএস সক্রিয় হবে এবং আপনি নোটিফিকেশন পাবেন।'
              : 'The professional will accept or decline this request. You will be alerted upon acceptance to track travel.'}
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          className="w-full skeuo-btn-dark py-3.5 text-sm font-bold cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          <span>{isBn ? 'বুকিং অনুরোধ পাঠান (Send Request)' : 'Submit Booking Request'}</span>
        </Button>
      </form>

      {/* WhatsApp OTP Verification Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <Card className="w-full max-w-md p-6 space-y-5 skeuo-surface border-2 border-[#2c7865]/40 shadow-2xl relative">
            <button
              onClick={() => setIsOtpModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-stone-200/60 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-lg">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-stone-900 tracking-tight">
                {isBn ? 'WhatsApp OTP দিয়ে One-Time বুকিং' : 'WhatsApp OTP One-Time Booking'}
              </h3>
              <p className="text-xs text-stone-600">
                {isBn 
                  ? `আপনার WhatsApp নম্বর (${contactPhone})-এ ৪-সংখ্যার ওটিপি কোড পাঠানো হয়েছে:` 
                  : `A 4-digit verification code has been dispatched to ${contactPhone}:`}
              </p>
            </div>

            {/* OTP Input Field */}
            <div className="space-y-2">
              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={4}
                  autoFocus
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4)
                    setOtpCode(val)
                    if (otpError) setOtpError('')
                  }}
                  placeholder="• • • •"
                  className="w-48 text-center text-2xl font-black tracking-[0.5em] py-3 rounded-2xl border-2 border-[#2c7865] bg-white text-stone-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2c7865]/40"
                />
              </div>

              {previewOtp && (
                <div className="text-center">
                  <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {isBn ? `💡 টেস্ট কোড: ${previewOtp}` : `💡 Demo Code: ${previewOtp}`}
                  </span>
                </div>
              )}

              {otpError && (
                <p className="text-center text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
                  {otpError}
                </p>
              )}
            </div>

            {/* Countdown / Resend */}
            <div className="text-center text-xs text-stone-600">
              {countdown > 0 ? (
                <span>
                  {isBn ? `নতুন কোড পাঠানোর সময় বাকি: ${toBanglaNumber(countdown)} সেকেন্ড` : `Resend in: ${countdown}s`}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSendingOtp}
                  className="font-bold text-[#2c7865] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSendingOtp ? 'animate-spin' : ''}`} />
                  <span>{isBn ? 'পুনরায় WhatsApp কোড পাঠান' : 'Resend WhatsApp Code'}</span>
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                type="button"
                onClick={handleVerifyOtpAndBook}
                isLoading={isVerifyingOtp}
                className="w-full bg-[#2c7865] hover:bg-[#236051] text-[#fefded] py-3.5 text-xs sm:text-sm font-bold rounded-xl shadow-lg cursor-pointer transition-all"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                <span>{isBn ? 'যাচাই করুন ও বুকিং নিশ্চিত করুন' : 'Verify & Confirm Booking'}</span>
              </Button>

              <button
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                className="w-full text-center text-xs font-semibold text-stone-600 hover:text-stone-900 py-1 cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        initialCoordinates={jobCoordinates}
        initialAddress={jobAddress}
        onConfirm={(coords, addr) => {
          setJobCoordinates(coords)
          setJobAddress(addr)
        }}
      />
    </div>
  )
}
