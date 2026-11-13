'use client'

import React, { useState } from 'react'
import { 
  X, Phone, Mail, MapPin, Wrench, Star, ShieldCheck, 
  Calendar, CheckCircle2, Ban, Trash2, Copy, Check, 
  ExternalLink, ZoomIn, FileText, User
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toBanglaNumber, formatBDT } from '@/lib/utils'

export interface MistriProfileData {
  id: string
  userId?: string
  name: string
  phone: string
  email?: string
  title: string
  category: string
  district: string
  upazila: string
  streetAddress?: string
  serviceRadiusKm?: number
  experienceYears: number
  chargeType?: string
  baseCharge?: number
  bio?: string
  gender?: string
  dateOfBirth?: string
  rating: number
  reviewsCount: number
  completedJobs: number
  status: 'approved' | 'pending' | 'suspended' | 'trash'
  avatar: string
  nidNumber?: string
  nidFront?: string
  nidBack?: string
  createdAt?: string
}

interface MistriProfileModalProps {
  mistri: MistriProfileData | null
  isOpen: boolean
  onClose: () => void
  onToggleSuspend?: (id: string, currentStatus: string) => void
  onTrash?: (mistri: MistriProfileData) => void
}

export function MistriProfileModal({
  mistri,
  isOpen,
  onClose,
  onToggleSuspend,
  onTrash,
}: MistriProfileModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null)

  if (!isOpen || !mistri) return null

  const cleanPhone = (mistri.phone || '').replace(/[^0-9]/g, '')
  const displayEmail = mistri.email || `mistri_${cleanPhone || 'account'}@mistri.app`

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-2xl w-full max-h-[92vh] overflow-y-auto relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[#2c7865] text-white flex items-center justify-center font-bold shadow-xs">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900 leading-tight">
                মিস্ত্রী সম্পূর্ণ প্রোফাইল বিবরণী
              </h2>
              <p className="text-[11px] text-stone-500">অ্যাডমিন প্রিভিউ প্যানেল</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mistri Hero Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-2xl bg-gradient-to-br from-stone-50 via-[#fefded]/60 to-[#2c7865]/10 border border-stone-200">
            <img
              src={mistri.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}
              alt={mistri.name}
              className="h-24 w-24 rounded-2xl object-cover border-2 border-stone-300 shadow-md shrink-0"
            />

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-black text-stone-900">{mistri.name}</h3>
                <Badge variant="primary" className="text-xs bg-[#2c7865] text-[#fefded] font-bold">
                  {mistri.category}
                </Badge>

                {mistri.status === 'trash' ? (
                  <Badge variant="danger" className="text-xs bg-rose-100 text-rose-800 border-rose-300">
                    ট্র্যাশে সংরক্ষিত
                  </Badge>
                ) : mistri.status === 'suspended' ? (
                  <Badge variant="danger" className="text-xs bg-amber-100 text-amber-900 border-amber-300">
                    স্থগিত (Suspended)
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-xs bg-emerald-100 text-emerald-800 border-emerald-300">
                    সক্রিয় ও লাইভ
                  </Badge>
                )}
              </div>

              <p className="text-xs font-semibold text-stone-700">
                {mistri.title} • {toBanglaNumber(mistri.experienceYears)} বছরের কাজের অভিজ্ঞতা
              </p>

              {/* Performance Metrics */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs">
                <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{mistri.rating} ({toBanglaNumber(mistri.reviewsCount)} রিভিউ)</span>
                </span>

                <span className="font-bold text-[#2c7865] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  ✓ {toBanglaNumber(mistri.completedJobs)} টি কাজ সম্পন্ন
                </span>
              </div>
            </div>
          </div>

          {/* Quick Contact Action Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>সরাসরি কল দিন</span>
            </a>

            <a
              href={`https://wa.me/88${cleanPhone}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <span className="text-sm">💬</span>
              <span>WhatsApp চ্যাট</span>
            </a>

            <a
              href={`mailto:${displayEmail}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>ইমেইল পাঠান</span>
            </a>
          </div>

          {/* SECTION 1: Contact & Credentials */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              যোগাযোগ ও পরিচয় বিবরণী
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Gmail / Email */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                    <span>Gmail / ইমেইল ঠিকানা</span>
                  </div>
                  <p className="text-xs font-bold text-stone-900 font-mono break-all">
                    {displayEmail}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(displayEmail, 'email')}
                  className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-600 hover:text-black cursor-pointer"
                  title="কপি করুন"
                >
                  {copiedField === 'email' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Mobile Phone */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    <span>মোবাইল নম্বর</span>
                  </div>
                  <p className="text-xs font-bold text-stone-900 font-mono">
                    {mistri.phone}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(mistri.phone, 'phone')}
                  className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-600 hover:text-black cursor-pointer"
                  title="কপি করুন"
                >
                  {copiedField === 'phone' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Location & Address */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1 sm:col-span-2">
                <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
                  <MapPin className="h-3.5 w-3.5 text-[#2c7865]" />
                  <span>কাজের এলাকা ও স্থায়ী ঠিকানা</span>
                </div>
                <p className="text-xs font-bold text-stone-900">
                  {mistri.upazila}, {mistri.district}
                </p>
                {mistri.streetAddress && (
                  <p className="text-xs text-stone-600">
                    বিস্তারিত ঠিকানা: {mistri.streetAddress}
                  </p>
                )}
                {mistri.serviceRadiusKm && (
                  <p className="text-[11px] text-[#2c7865] font-semibold pt-0.5">
                    সর্বোচ্চ কাজের পরিধি: {toBanglaNumber(mistri.serviceRadiusKm)} কিলোমিটার ব্যাসার্ধ
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Work & Rates */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              পেশাগত সেবা ও মজুরির তথ্য
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 block">মজুরির ধরন</span>
                <span className="font-bold text-stone-900 block">{mistri.chargeType || 'আলোচনা সাপেক্ষে'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 block">বেস চার্জ (শুরু)</span>
                <span className="font-black text-[#2c7865] block">{formatBDT(mistri.baseCharge || 400)}</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-stone-500 block">লিঙ্গ ও বয়স</span>
                <span className="font-bold text-stone-900 block">
                  {mistri.gender === 'female' ? 'নারী' : 'পুরুষ'} {mistri.dateOfBirth ? `(${mistri.dateOfBirth})` : ''}
                </span>
              </div>
            </div>

            {mistri.bio && (
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-xs text-stone-500 font-semibold block">কারিগর পরিচিতি / বায়ো:</span>
                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  {mistri.bio}
                </p>
              </div>
            )}
          </div>

          {/* SECTION 3: NID & Identity Documents */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              জাতীয় পরিচয়পত্র (NID) ও যাচাইকরণ ডকুমেন্টস
            </h4>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-stone-800">NID নম্বর:</span>
                  <span className="text-xs font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-300">
                    {mistri.nidNumber || 'তথ্য নেই'}
                  </span>
                </div>

                {mistri.nidNumber && (
                  <button
                    type="button"
                    onClick={() => handleCopy(mistri.nidNumber || '', 'nid')}
                    className="p-1 rounded-md text-stone-500 hover:text-black cursor-pointer text-xs flex items-center gap-1"
                  >
                    {copiedField === 'nid' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>কপি</span>
                  </button>
                )}
              </div>

              {/* NID Photos Preview */}
              {(mistri.nidFront || mistri.nidBack) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {mistri.nidFront && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-stone-600 block">NID সামনের অংশ:</span>
                      <div 
                        onClick={() => setZoomedImage({ url: mistri.nidFront!, title: `${mistri.name} - NID সামনের অংশ` })}
                        className="relative rounded-xl overflow-hidden border border-stone-300 bg-stone-100 group cursor-pointer aspect-video flex items-center justify-center"
                      >
                        <img
                          src={mistri.nidFront}
                          alt="NID Front"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                          <ZoomIn className="h-4 w-4 mr-1" />
                          <span>বড় করে দেখুন</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {mistri.nidBack && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-stone-600 block">NID পেছনের অংশ:</span>
                      <div 
                        onClick={() => setZoomedImage({ url: mistri.nidBack!, title: `${mistri.name} - NID পেছনের অংশ` })}
                        className="relative rounded-xl overflow-hidden border border-stone-300 bg-stone-100 group cursor-pointer aspect-video flex items-center justify-center"
                      >
                        <img
                          src={mistri.nidBack}
                          alt="NID Back"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                          <ZoomIn className="h-4 w-4 mr-1" />
                          <span>বড় করে দেখুন</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-stone-500 italic">
                  কোনো NID ছবি আপলোড করা হয়নি।
                </p>
              )}
            </div>
          </div>

          {/* Account Metadata */}
          <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-500 flex flex-wrap items-center justify-between gap-2">
            <span>প্রোফাইল আইডি: <code className="font-mono">{mistri.id}</code></span>
            {mistri.createdAt && (
              <span>নিবন্ধন: {new Date(mistri.createdAt).toLocaleDateString('bn-BD')}</span>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="sticky bottom-0 z-20 bg-stone-50 px-6 py-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onToggleSuspend && mistri.status !== 'trash' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onToggleSuspend(mistri.id, mistri.status)
                  onClose()
                }}
                className={`text-xs font-bold rounded-xl cursor-pointer ${
                  mistri.status === 'suspended'
                    ? 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                    : 'border-amber-300 text-amber-800 hover:bg-amber-50'
                }`}
              >
                {mistri.status === 'suspended' ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    <span>স্থগিতাদেশ তুলুন (সক্রিয় করুন)</span>
                  </>
                ) : (
                  <>
                    <Ban className="h-3.5 w-3.5 mr-1" />
                    <span>অ্যাকাউন্ট স্থগিত করুন</span>
                  </>
                )}
              </Button>
            )}

            {onTrash && mistri.status !== 'trash' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onTrash(mistri)
                  onClose()
                }}
                className="text-xs font-bold text-rose-700 border-rose-200 hover:bg-rose-50 rounded-xl cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                <span>ট্র্যাশে পাঠান</span>
              </Button>
            )}
          </div>

          <Button
            size="sm"
            onClick={onClose}
            className="skeuo-btn-dark text-xs font-bold px-5 py-2 cursor-pointer ml-auto"
          >
            <span>ঠিক আছে (বন্ধ করুন)</span>
          </Button>
        </div>
      </div>

      {/* Lightbox Image Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div className="max-w-3xl w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between text-white">
              <span className="text-sm font-bold">{zoomedImage.title}</span>
              <button
                onClick={() => setZoomedImage(null)}
                className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <img
              src={zoomedImage.url}
              alt={zoomedImage.title}
              className="w-full max-h-[80vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
