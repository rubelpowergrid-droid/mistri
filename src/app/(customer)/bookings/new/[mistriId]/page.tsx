'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, Calendar, Clock, MapPin, DollarSign, 
  Upload, Camera, CheckCircle2, Shield, Wrench, 
  Star, AlertCircle, Phone, X 
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

export default function NewBookingPage() {
  const params = useParams()
  const router = useRouter()
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [mistri, setMistri] = useState<any>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [workDescription, setWorkDescription] = useState('')
  const [contactPhone, setContactPhone] = useState('01712345678')
  const [preferredDate, setPreferredDate] = useState('2026-11-04')
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

  useEffect(() => {
    const found = MISTRI_DIRECTORY.find(m => m.id === params.mistriId) || MISTRI_DIRECTORY[0]
    setMistri(found)
    if (found && found.subcategories.length > 0) {
      setSelectedSubcategory(found.subcategories[0])
    }
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
    if (!contactPhone.trim()) {
      setErrorMessage(isBn ? 'মোবাইল নম্বর দিন' : 'Please provide contact phone')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mistriId: mistri.id,
          subcategory: selectedSubcategory,
          workDescription,
          jobAddress,
          latitude: jobCoordinates.latitude,
          longitude: jobCoordinates.longitude,
          contactPhone,
          preferredDate,
          preferredTime,
          estimatedBudget: estimatedBudget || null,
          workPhotos: uploadedPhotos,
        }),
      })

      const data = await res.json()
      setIsSubmitting(false)

      if (data.success) {
        router.push('/bookings?success=true')
      } else {
        setErrorMessage(data.error || 'Failed to submit booking')
      }
    } catch {
      setIsSubmitting(false)
      // In local/demo mode redirect to bookings hub
      router.push('/bookings?success=true')
    }
  }

  if (!mistri) {
    return <div className="p-8 text-center text-xs text-slate-500">লোড হচ্ছে...</div>
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isBn ? 'প্রোফাইলে ফিরুন' : 'Back to Profile'}</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {isBn ? 'বুকিং অনুরোধ ফর্ম' : 'Service Booking Request'}
        </h1>
        <p className="text-xs text-slate-500">
          {isBn 
            ? 'আপনার কাজের বিবরণ দিন এবং মিস্ত্রীর কাছে সরাসরি বুকিং অনুরোধ পাঠান' 
            : 'Fill in job details to send an instant request to this professional'}
        </p>
      </div>

      {/* Selected Mistri Summary Header */}
      <Card className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={mistri.avatar}
            alt={mistri.name_bn}
            className="h-14 w-14 rounded-2xl object-cover border-2 border-slate-700 shrink-0"
          />
          <div className="space-y-0.5">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
              {isBn ? 'নির্বাচিত কারিগর' : 'Selected Professional'}
            </span>
            <h3 className="text-sm font-bold text-white">{mistri.name_bn}</h3>
            <p className="text-xs text-slate-300">{mistri.professional_title}</p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-0.5 text-amber-300">
                <Star className="h-3 w-3 fill-amber-300" />
                {mistri.average_rating}
              </span>
              <span>•</span>
              <span>{formatDistance(mistri.distance_km, isBn)} দূরে</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 block">{isBn ? 'প্রারম্ভিক ফি' : 'Base Fee'}</span>
          <span className="text-lg font-black text-amber-400">{formatBDT(mistri.base_charge, isBn)}</span>
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
        <Card className="p-6 space-y-5 border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            {isBn ? '১. কাজের ধরন ও বিবরণ' : '1. Work Details'}
          </h2>

          {/* Subcategory Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              {isBn ? 'কাজের সুনির্দিষ্ট ক্যাটাগরি' : 'Specific Work Type'}
            </label>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              {mistri.subcategories.map((sub: string, i: number) => (
                <option key={i} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Detailed Problem Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              {t('booking.work_description')} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder={t('booking.work_description_placeholder')}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              required
            />
            <p className="text-[11px] text-slate-400">
              {isBn ? 'সমস্যার বিস্তারিত বিবরণ দিলে মিস্ত্রী প্রয়োজনীয় টুলস নিয়ে আসতে পারবেন।' : 'Accurate description helps the worker bring the right tools.'}
            </p>
          </div>

          {/* Photo Upload (Up to 3) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              {t('booking.upload_photos')} ({toBanglaNumber(uploadedPhotos.length)}/৩)
            </label>
            <div className="flex flex-wrap gap-3">
              {uploadedPhotos.map((photo, index) => (
                <div key={index} className="relative h-20 w-20 rounded-2xl overflow-hidden border border-slate-200 group">
                  <img src={photo} alt="Work issue" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-red-600 transition-colors"
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
                  className="flex flex-col items-center justify-center h-20 w-20 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors text-center p-2 cursor-pointer"
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
        <Card className="p-6 space-y-5 border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            {isBn ? '২. কাজের অবস্থান ও সময়' : '2. Location & Preferred Schedule'}
          </h2>

          {/* Address with Map Picker Launcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                {t('booking.job_address')} <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <MapPin className="h-3 w-3 text-blue-600" />
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
              <label className="text-xs font-semibold text-slate-700">
                {t('booking.preferred_time')}
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="সকাল ৯:০০ - ১১:০০">সকাল ৯:০০ - ১১:০০</option>
                <option value="সকাল ১১:০০ - দুপুর ১:০০">সকাল ১১:০০ - দুপুর ১:০০</option>
                <option value="দুপুর ২:০০ - বিকাল ৪:০০">দুপুর ২:০০ - বিকাল ৪:০০</option>
                <option value="বিকাল ৪:০০ - সন্ধ্যা ৬:০০">বিকাল ৪:০০ - সন্ধ্যা ৬:০০</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="contactPhone"
              type="tel"
              label={isBn ? 'যোগাযোগের মোবাইল নম্বর' : 'Contact Phone Number'}
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              leftIcon={<Phone className="h-4 w-4" />}
              required
            />

            <Input
              id="estimatedBudget"
              type="number"
              label={isBn ? 'আপনার প্রস্তাবিত বাজেট (টাকা, ঐচ্ছিক)' : 'Proposed Budget (BDT, Optional)'}
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value ? Number(e.target.value) : '')}
              leftIcon={<DollarSign className="h-4 w-4" />}
            />
          </div>
        </Card>

        {/* Safety Note */}
        <div className="rounded-2xl bg-blue-50/70 p-4 border border-blue-200 text-xs text-blue-900 space-y-1">
          <span className="font-bold flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-blue-600" />
            {isBn ? 'বুকিং নির্দেশিকা' : 'Booking Policy'}
          </span>
          <p className="text-[11px] leading-relaxed">
            {isBn 
              ? 'অনুরোধ পাঠানোর পর মিস্ত্রী তার সুবিধাজনক সময়ে এটি গ্রহণ বা প্রত্যাখ্যান করবেন। মিস্ত্রী গ্রহণ করলে আপনি সরাসরি নোটিফিকেশন পাবেন এবং কাজ শুরুর সময় সম্মত মজুরি নিশ্চিত করতে পারবেন।'
              : 'The professional will accept or decline this request. You will be alerted upon acceptance to track travel.'}
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          className="w-full py-3.5 text-sm font-bold shadow-md"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          <span>{isBn ? 'বুকিং অনুরোধ পাঠান (Send Request)' : 'Submit Booking Request'}</span>
        </Button>
      </form>

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

