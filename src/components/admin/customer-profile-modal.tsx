'use client'

import React, { useState } from 'react'
import { 
  X, Phone, Mail, MapPin, User, Calendar, 
  ShoppingBag, CheckCircle2, Copy, Check, ExternalLink
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toBanglaNumber } from '@/lib/utils'

export interface CustomerProfileData {
  id: string
  name: string
  phone: string
  email?: string
  district: string
  upazila: string
  address: string
  totalBookings: number
  lastBookingDate: string
  createdAt?: string
  status: 'active' | 'inactive'
  avatar: string
}

interface CustomerProfileModalProps {
  customer: CustomerProfileData | null
  isOpen: boolean
  onClose: () => void
}

export function CustomerProfileModal({
  customer,
  isOpen,
  onClose,
}: CustomerProfileModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!isOpen || !customer) return null

  const cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '')
  const isRealEmail = !!(
    customer.email &&
    customer.email.includes('@') &&
    !customer.email.endsWith('@mistri.app') &&
    !customer.email.endsWith('@mistri.internal')
  )
  const displayEmail = isRealEmail ? customer.email! : null

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-xl w-full max-h-[90vh] overflow-y-auto relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900 leading-tight">
                কাস্টমার সম্পূর্ণ প্রোফাইল বিবরণী
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
          {/* Customer Hero Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-stone-50 to-indigo-50/50 border border-blue-100">
            <img
              src={customer.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={customer.name}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
            />

            <div className="space-y-1.5 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-black text-stone-900">{customer.name}</h3>
                <Badge variant="primary" className="text-xs bg-blue-600 text-white font-bold">
                  গ্রাহক (Customer)
                </Badge>
                <Badge variant="success" className="text-xs bg-emerald-100 text-emerald-800 border-emerald-300">
                  {customer.status === 'active' ? 'সক্রিয় গ্রাহক' : 'নিষ্ক্রিয়'}
                </Badge>
              </div>

              <p className="text-xs text-stone-600 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                <span>{customer.district}, {customer.upazila}</span>
              </p>

              <div className="pt-1">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>মোট সম্পন্ন বুকিং: {toBanglaNumber(customer.totalBookings)} টি</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Contact Action Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
              href={`tel:${cleanPhone}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>সরাসরি কল দিন</span>
            </a>

            {displayEmail ? (
              <a
                href={`mailto:${displayEmail}`}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>ইমেইল পাঠান</span>
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-200 text-stone-500 text-xs font-semibold cursor-not-allowed">
                <Mail className="h-4 w-4" />
                <span>Gmail যুক্ত নেই</span>
              </div>
            )}
          </div>

          {/* Contact Details Card */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              যোগাযোগের তথ্য
            </h4>

            <div className="space-y-2.5">
              {/* Gmail / Email */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                    <span>Gmail / ইমেইল অ্যাড্রেস</span>
                  </div>
                  <p className="text-xs font-bold text-stone-900 font-mono break-all">
                    {displayEmail || 'কোনো Gmail যুক্ত নেই (মোবাইল দিয়ে নিবন্ধিত)'}
                  </p>
                </div>
                {displayEmail && (
                  <button
                    type="button"
                    onClick={() => handleCopy(displayEmail, 'email')}
                    className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-600 hover:text-black cursor-pointer"
                    title="কপি করুন"
                  >
                    {copiedField === 'email' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>

              {/* Mobile Phone */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    <span>মোবাইল নম্বর</span>
                  </div>
                  <p className="text-xs font-bold text-stone-900 font-mono">
                    {customer.phone}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(customer.phone, 'phone')}
                  className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-600 hover:text-black cursor-pointer"
                  title="কপি করুন"
                >
                  {copiedField === 'phone' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Address */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  <span>গ্রাহকের ঠিকানা ও এলাকা</span>
                </div>
                <p className="text-xs font-bold text-stone-900">
                  {customer.address}
                </p>
                <p className="text-[11px] text-stone-500">
                  উপজেলা: {customer.upazila} | জেলা: {customer.district}
                </p>
              </div>
            </div>
          </div>

          {/* Activity & Bookings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              অ্যাক্টিভিটি ও বুকিং হিস্ট্রি
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 block">মোট বুকিং সংখ্যা</span>
                <span className="text-base font-black text-blue-700 block">
                  {toBanglaNumber(customer.totalBookings)} টি
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 block">সর্বশেষ বুকিং</span>
                <span className="text-xs font-bold text-stone-900 block font-mono">
                  {customer.lastBookingDate || 'আজকে'}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-500 flex flex-wrap items-center justify-between gap-2">
            <span>কাস্টমার আইডি: <code className="font-mono">{customer.id}</code></span>
            {customer.createdAt && (
              <span>নিবন্ধন: {new Date(customer.createdAt).toLocaleDateString('bn-BD')}</span>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="sticky bottom-0 z-20 bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-end">
          <Button
            size="sm"
            onClick={onClose}
            className="skeuo-btn-dark text-xs font-bold px-5 py-2 cursor-pointer"
          >
            <span>ঠিক আছে (বন্ধ করুন)</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

