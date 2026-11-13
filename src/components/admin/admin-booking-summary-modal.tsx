'use client'

import React, { useState } from 'react'
import { 
  X, Calendar, Clock, DollarSign, User, Phone, Mail, 
  MapPin, Wrench, ShieldCheck, Copy, Check, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookingHistoryTimeline, BookingTimelineData } from '@/components/bookings/booking-history-timeline'

interface AdminBookingSummaryModalProps {
  booking: BookingTimelineData | null
  isOpen: boolean
  onClose: () => void
}

export function AdminBookingSummaryModal({
  booking,
  isOpen,
  onClose,
}: AdminBookingSummaryModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !booking) return null

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-3xl w-full max-h-[92vh] overflow-y-auto relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[#2c7865] text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900 leading-tight">
                বুকিং বিস্তারিত ও সমন্বিত সামারি
              </h2>
              <p className="text-[11px] text-stone-500">
                অ্যাডমিন প্রিভিউ প্যানেল ও রিয়েল-টাইম অডিট হিস্টোরি
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          <BookingHistoryTimeline 
            booking={booking} 
            perspective="admin" 
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 bg-stone-50 px-6 py-3.5 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleCopy(booking.bookingNumber || booking.id)}
            className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'কপি হয়েছে' : 'বুকিং নম্বর কপি করুন'}</span>
          </button>

          <Button
            type="button"
            onClick={onClose}
            className="skeuo-btn-dark px-5 py-2 text-xs font-bold"
          >
            ঠিক আছে (বন্ধ করুন)
          </Button>
        </div>
      </div>
    </div>
  )
}
