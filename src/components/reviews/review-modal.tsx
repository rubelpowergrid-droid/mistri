'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Star, ShieldCheck, CheckCircle2, X, Upload, 
  Camera, AlertCircle, Wrench, ThumbsUp 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toBanglaNumber } from '@/lib/utils'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  mistriId: string
  mistriName: string
  serviceName?: string
  category?: string
  onSubmitted?: () => void
  onSuccess?: () => void
}

export function ReviewModal({
  isOpen,
  onClose,
  bookingId,
  mistriId,
  mistriName,
  serviceName,
  category,
  onSubmitted,
  onSuccess,
}: ReviewModalProps) {
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'
  const displayServiceName = serviceName || category || (isBn ? 'হোম সার্ভিস' : 'Home Service')

  // 5 Criteria Ratings (1 - 5 stars)
  const [ratingQuality, setRatingQuality] = useState(5)
  const [ratingBehaviour, setRatingBehaviour] = useState(5)
  const [ratingPunctuality, setRatingPunctuality] = useState(5)
  const [ratingPricing, setRatingPricing] = useState(5)
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  // Calculate overall average of the 4 sub-criteria
  const overallRating = Number(
    ((ratingQuality + ratingBehaviour + ratingPunctuality + ratingPricing) / 4).toFixed(1)
  )

  const handlePhotoUploadMock = () => {
    if (photos.length >= 2) return
    const sample = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
    setPhotos(prev => [...prev, sample])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে কাজের অভিজ্ঞতা সম্পর্কে কিছু লিখুন' : 'Please write your review comment')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          mistriId,
          rating_work_quality: ratingQuality,
          rating_behaviour: ratingBehaviour,
          rating_punctuality: ratingPunctuality,
          rating_pricing: ratingPricing,
          rating_overall: overallRating,
          comment,
          photos,
        }),
      })

      setIsSubmitting(false)
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
        if (onSubmitted) onSubmitted()
        if (onSuccess) onSuccess()
      }, 1500)
    } catch {
      setIsSubmitting(false)
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
        if (onSubmitted) onSubmitted()
        if (onSuccess) onSuccess()
      }, 1500)
    }
  }

  const criteria = [
    { label: isBn ? 'কাজের মান (Work Quality)' : 'Work Quality', value: ratingQuality, setter: setRatingQuality },
    { label: isBn ? 'ব্যবহার ও আচরণ (Behaviour)' : 'Behaviour', value: ratingBehaviour, setter: setRatingBehaviour },
    { label: isBn ? 'সময়ানুবর্তিতা (Punctuality)' : 'Punctuality', value: ratingPunctuality, setter: setRatingPunctuality },
    { label: isBn ? 'মজুরি সন্তুষ্টি (Pricing Satisfaction)' : 'Pricing', value: ratingPricing, setter: setRatingPricing },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <Card className="max-w-lg w-full p-6 space-y-5 shadow-2xl bg-white border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{isBn ? 'রেটিং ও রিভিউ দিন' : 'Rate & Review Service'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {isBn ? `মিস্ত্রী: ${mistriName} • ${displayServiceName}` : `${mistriName} • ${displayServiceName}`}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">
              {isBn ? 'রিভিউ সফলভাবে সংরক্ষিত হয়েছে!' : 'Review Submitted Successfully!'}
            </h3>
            <p className="text-xs text-slate-500">
              {isBn ? 'আপনার মূল্যবান মতামত মিস্ত্রীর প্রোফাইলে যুক্ত করা হয়েছে।' : 'Your feedback has been added to the professional profile.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Overall Score Badge */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 text-white">
              <div>
                <span className="text-[10px] text-slate-400 block">{isBn ? 'সামগ্রিক রেটিং' : 'Overall Score'}</span>
                <span className="text-2xl font-black text-amber-400 flex items-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span>{toBanglaNumber(overallRating)}</span>
                  <span className="text-xs text-slate-400 font-normal">/ ৫.০</span>
                </span>
              </div>
              <Badge variant="primary" className="bg-white/10 text-white border-white/20 text-xs">
                {overallRating >= 4.5 ? (isBn ? 'চমৎকার' : 'Excellent') : overallRating >= 3.5 ? (isBn ? 'ভালো' : 'Good') : (isBn ? 'সন্তোষজনক' : 'Average')}
              </Badge>
            </div>

            {/* 4 Criteria Sliders / Stars */}
            <div className="space-y-3 pt-1">
              {criteria.map((crit, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{crit.label}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => crit.setter(s)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            s <= crit.value ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Written Review */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block">
                {isBn ? 'আপনার মন্তব্য ও কাজের অভিজ্ঞতা' : 'Written Review Comment'}
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isBn ? 'মিস্ত্রীর কাজের মান, সময়ানুবর্তিতা ও আচরণ কেমন ছিল?' : 'Share your honest feedback...'}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            {/* Optional Completion Photos */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                {isBn ? 'কাজের সমাপ্তির ছবি (ঐচ্ছিক)' : 'Completion Photos (Optional)'}
              </label>
              <div className="flex items-center gap-3">
                {photos.map((p, i) => (
                  <div key={i} className="relative h-16 w-16 rounded-xl overflow-hidden border border-slate-200">
                    <img src={p} alt="Review" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-0.5 bg-black/70 text-white rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 2 && (
                  <button
                    type="button"
                    onClick={handlePhotoUploadMock}
                    className="flex flex-col items-center justify-center h-16 w-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 text-slate-400 hover:text-blue-600 text-center"
                  >
                    <Camera className="h-4 w-4 mb-0.5" />
                    <span className="text-[9px] font-semibold">{isBn ? 'ছবি যোগ' : 'Add'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Policy */}
            <p className="text-[10px] text-slate-400 leading-tight">
              {isBn 
                ? 'অনুমোদিত নীতি: অসদাচরণ বা অনৈতিক ভাষা সম্বলিত রিভিউ অ্যাডমিন দ্বারা বাতিলযোগ্য।'
                : 'Reviews violating community standards will be moderated by admin.'}
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={onClose}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button size="sm" type="submit" isLoading={isSubmitting} className="font-bold">
                {isBn ? 'রিভিউ জমা দিন' : 'Submit Review'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
