'use client'

import React from 'react'
import { 
  CheckCircle2, Clock, AlertCircle, XCircle, Navigation, 
  Wrench, DollarSign, Calendar, MapPin, User, Phone, Mail,
  ShieldCheck, ArrowRight, Timer
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { toBanglaNumber, formatBDT } from '@/lib/utils'

export interface BookingTimelineData {
  id?: string
  bookingNumber?: string
  status: 'pending' | 'accepted' | 'rejected' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled' | string
  createdAt?: string | null
  created_at?: string | null
  acceptedAt?: string | null
  accepted_at?: string | null
  journeyStartedAt?: string | null
  startedAt?: string | null
  started_at?: string | null
  completedAt?: string | null
  completed_at?: string | null
  updatedAt?: string | null
  updated_at?: string | null
  agreedPrice?: number | null
  agreed_price?: number | null
  amount?: number | null
  estimatedBudget?: number | null
  estimated_budget?: number | null
  cancellationReason?: string | null
  cancellation_reason?: string | null
  cancelledBy?: string | null
  cancelled_by?: string | null
  customerName?: string | null
  customerPhone?: string | null
  customerEmail?: string | null
  customerAddress?: string | null
  jobAddress?: string | null
  job_address?: string | null
  mistriName?: string | null
  mistriPhone?: string | null
  mistriEmail?: string | null
  mistriTitle?: string | null
  serviceName?: string | null
  description?: string | null
  work_description?: string | null
}

const banglaMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
]

export function formatBanglaDateTime(isoString?: string | null): string {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return ''
    const day = toBanglaNumber(d.getDate())
    const month = banglaMonths[d.getMonth()]
    const year = toBanglaNumber(d.getFullYear())
    
    const h = d.getHours()
    const m = toBanglaNumber(String(d.getMinutes()).padStart(2, '0'))
    
    let period = 'সকাল'
    if (h >= 12 && h < 15) period = 'দুপুর'
    else if (h >= 15 && h < 18) period = 'বিকাল'
    else if (h >= 18 && h < 20) period = 'সন্ধ্যা'
    else if (h >= 20 || h < 6) period = 'রাত'
    
    const displayHours = toBanglaNumber(h % 12 === 0 ? 12 : h % 12)
    return `${day} ${month} ${year}, ${period} ${displayHours}:${m} মিনিট`
  } catch {
    return ''
  }
}

export function formatBanglaDuration(startIso?: string | null, endIso?: string | null): string {
  if (!startIso) return ''
  try {
    const start = new Date(startIso).getTime()
    if (isNaN(start)) return ''
    const end = endIso ? new Date(endIso).getTime() : Date.now()
    const diffMs = Math.max(0, end - start)
    const totalMinutes = Math.floor(diffMs / (1000 * 60))
    if (totalMinutes < 1) return '১ মিনিটের কম'
    if (totalMinutes < 60) return `${toBanglaNumber(totalMinutes)} মিনিট`
    const hours = Math.floor(totalMinutes / 60)
    const remMinutes = totalMinutes % 60
    if (remMinutes === 0) return `${toBanglaNumber(hours)} ঘণ্টা`
    return `${toBanglaNumber(hours)} ঘণ্টা ${toBanglaNumber(remMinutes)} মিনিট`
  } catch {
    return ''
  }
}

interface TimelineStep {
  key: string
  title: string
  description: string
  timestamp: string | null
  status: 'completed' | 'active' | 'pending' | 'cancelled'
  icon: any
  badgeText: string
}

export function BookingHistoryTimeline({
  booking,
  perspective = 'customer',
  className = '',
}: {
  booking: BookingTimelineData
  perspective?: 'customer' | 'mistri' | 'admin'
  className?: string
}) {
  const status = (booking.status || 'pending').toLowerCase()
  const isCancelled = status === 'rejected' || status === 'cancelled'
  const isCompleted = status === 'completed'
  const isInProgress = status === 'in_progress'
  const isOnTheWay = status === 'on_the_way'
  const isAccepted = status === 'accepted' || isOnTheWay || isInProgress || isCompleted

  const createdAt = booking.createdAt || booking.created_at || null
  const acceptedAt = booking.acceptedAt || booking.accepted_at || (isAccepted ? createdAt : null)
  const journeyStartedAt = booking.journeyStartedAt || booking.startedAt || booking.started_at || (isOnTheWay || isInProgress || isCompleted ? acceptedAt : null)
  const startedAt = booking.startedAt || booking.started_at || (isInProgress || isCompleted ? journeyStartedAt : null)
  const completedAt = booking.completedAt || booking.completed_at || (isCompleted ? booking.updatedAt || booking.updated_at || startedAt : null)
  const cancelledAt = isCancelled ? (booking.updatedAt || booking.updated_at || createdAt) : null

  const amountVal = booking.agreedPrice ?? booking.agreed_price ?? booking.estimatedBudget ?? booking.estimated_budget ?? booking.amount ?? 400
  const formattedPrice = formatBDT(amountVal)

  // Construct 6 Milestones
  const steps: TimelineStep[] = []

  // 1. বুকিং অনুরোধ (Booking Request)
  steps.push({
    key: 'requested',
    title: perspective === 'mistri' 
      ? 'বুকিং অনুরোধ প্রাপ্ত হয়েছে' 
      : perspective === 'admin' 
      ? 'বুকিং অনুরোধ গ্রহণ ও এন্ট্রি' 
      : 'বুকিং অনুরোধ পাঠানো হয়েছে',
    description: perspective === 'mistri'
      ? `${booking.customerName || 'গ্রাহক'} কাজের নতুন অনুরোধ পাঠিয়েছেন`
      : `${booking.mistriName || 'মিস্ত্রী'} বরাবর সেবার অনুরোধ দাখিল করা হয়েছে`,
    timestamp: formatBanglaDateTime(createdAt),
    status: 'completed',
    icon: Calendar,
    badgeText: 'সম্পন্ন',
  })

  // 2. বুকিং গ্রহণ / বাতিল (Accept / Reject)
  if (isCancelled) {
    steps.push({
      key: 'decision',
      title: perspective === 'mistri'
        ? 'বুকিং বাতিল করা হয়েছে'
        : 'মিস্ত্রী অনুরোধ গ্রহণ করতে পারেননি (বাতিল)',
      description: booking.cancellationReason || booking.cancellation_reason
        ? `কারণ: ${booking.cancellationReason || booking.cancellation_reason}`
        : 'অনিবার্য কারণে অনুরোধটি বাতিল করা হয়েছে',
      timestamp: formatBanglaDateTime(cancelledAt),
      status: 'cancelled',
      icon: XCircle,
      badgeText: 'বাতিল',
    })
  } else {
    steps.push({
      key: 'decision',
      title: perspective === 'mistri'
        ? 'বুকিং নিশ্চিত ও গ্রহণ করেছেন'
        : 'মিস্ত্রী কাজের অনুরোধ গ্রহণ করেছেন',
      description: isAccepted
        ? 'কাজের শর্ত ও প্রাথমিক সময় অনুযায়ী নিশ্চিত করা হয়েছে'
        : 'মিস্ত্রী বর্তমানে অনুরোধটি বিবেচনা করছেন',
      timestamp: isAccepted ? formatBanglaDateTime(acceptedAt) : null,
      status: isAccepted ? 'completed' : 'active',
      icon: CheckCircle2,
      badgeText: isAccepted ? 'গৃহীত' : 'অপেক্ষমাণ',
    })
  }

  // 3. যাত্রা শুরু (Journey Started)
  if (!isCancelled) {
    const isStepDone = isInProgress || isCompleted
    const isStepActive = isOnTheWay
    steps.push({
      key: 'journey',
      title: perspective === 'mistri'
        ? 'কাজের উদ্দেশ্যে যাত্রা শুরু'
        : 'মিস্ত্রীর যাত্রা শুরু (পথে আছেন)',
      description: isStepDone || isStepActive
        ? 'গ্রাহকের নির্ধারিত ঠিকানার উদ্দেশ্যে লাইভ জিপিএস সহ রওনা হয়েছেন'
        : 'মিস্ত্রী রওনা হওয়ার প্রস্তুতি নিচ্ছেন',
      timestamp: (isStepDone || isStepActive) ? formatBanglaDateTime(journeyStartedAt) : null,
      status: isStepDone ? 'completed' : isStepActive ? 'active' : 'pending',
      icon: Navigation,
      badgeText: isStepDone ? 'সম্পন্ন' : isStepActive ? 'পথে আছেন' : 'অপেক্ষমাণ',
    })
  }

  // 4. কাজ শুরু (Work Started)
  if (!isCancelled) {
    const isStepDone = isCompleted
    const isStepActive = isInProgress
    steps.push({
      key: 'started',
      title: perspective === 'mistri'
        ? '現場 কাজ শুরু করা হয়েছে'
        : 'মিস্ত্রী কাজ শুরু করেছেন',
      description: isStepDone || isStepActive
        ? 'ঠিকানায় পৌঁছে কাজ শুরু ও চলমান'
        : 'মিস্ত্রী কার্যস্থলে পৌঁছানোর পর কাজ শুরু হবে',
      timestamp: (isStepDone || isStepActive) ? formatBanglaDateTime(startedAt) : null,
      status: isStepDone ? 'completed' : isStepActive ? 'active' : 'pending',
      icon: Wrench,
      badgeText: isStepDone ? 'সম্পন্ন' : isStepActive ? 'চলমান' : 'অপেক্ষমাণ',
    })
  }

  // 5. পেমেন্ট গ্রহণ / প্রদান (Payment Received / Paid)
  if (!isCancelled) {
    const isStepDone = isCompleted
    steps.push({
      key: 'payment',
      title: perspective === 'mistri'
        ? `পেমেন্ট গ্রহণ সম্পন্ন (${formattedPrice})`
        : `পেমেন্ট প্রদান সম্পন্ন (${formattedPrice})`,
      description: isStepDone
        ? `কাজের চূড়ান্ত বিল বাবদ ${formattedPrice} সফলভাবে লেনদেন হয়েছে`
        : `ধার্য আনুমানিক বাজেট ${formattedPrice} (কাজ সমাপ্তিতে প্রদেয়)`,
      timestamp: isStepDone ? formatBanglaDateTime(completedAt) : null,
      status: isStepDone ? 'completed' : 'pending',
      icon: DollarSign,
      badgeText: isStepDone ? 'পরিশোধিত' : 'বকেয়া',
    })
  }

  // 6. কাজ শেষ (Work Completed)
  if (!isCancelled) {
    const isStepDone = isCompleted
    steps.push({
      key: 'completed',
      title: perspective === 'mistri'
        ? 'কাজ সম্পন্ন ও বুকিং সমাপ্ত'
        : 'কাজ সফলভাবে শেষ হয়েছে',
      description: isStepDone
        ? 'গ্রাহক সেবা বুঝে নিয়েছেন এবং কাজ সমাপ্ত হয়েছে'
        : 'কাজ সমাপ্ত হলে উভয় পক্ষ থেকে নিশ্চিত করা হবে',
      timestamp: isStepDone ? formatBanglaDateTime(completedAt) : null,
      status: isStepDone ? 'completed' : 'pending',
      icon: ShieldCheck,
      badgeText: isStepDone ? 'সমাপ্ত' : 'অপেক্ষমাণ',
    })
  }

  // Calculate turnaround time for admin
  const totalTurnaround = formatBanglaDuration(createdAt, completedAt)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── ADMIN CONSOLIDATED SUMMARY (সমন্বিত মোট সামারি) ── */}
      {perspective === 'admin' && (
        <Card className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50/70 via-stone-50 to-teal-50/40 border-2 border-[#2c7865]/30 rounded-3xl shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#2c7865] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#2c7865]" />
                অ্যাডমিন সমন্বিত বুকিং সামারি
              </span>
              <h3 className="text-lg font-black text-stone-900 mt-0.5">
                বুকিং নং: <span className="font-mono text-[#2c7865]">{booking.bookingNumber || booking.id}</span>
              </h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge 
                variant={isCompleted ? 'success' : isCancelled ? 'danger' : 'primary'}
                className="text-xs font-bold px-3 py-1"
              >
                {isCompleted ? '✓ সফলভাবে সমাপ্ত' : isCancelled ? '✕ বাতিল' : isInProgress ? '⏳ কাজ চলছে' : isOnTheWay ? '🚗 পথে আছেন' : 'অপেক্ষমাণ'}
              </Badge>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-500 block">মোট বিল / পেমেন্ট</span>
              <p className="text-base font-black text-stone-900 mt-0.5">{formattedPrice}</p>
              <span className={`text-[10px] font-bold ${isCompleted ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isCompleted ? 'পরিশোধ সম্পন্ন' : 'কাজ শেষে পরিশোধিত হবে'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-500 block">মোট অতিবাহিত সময়</span>
              <p className="text-base font-black text-stone-900 mt-0.5 flex items-center gap-1.5">
                <Timer className="h-4 w-4 text-[#2c7865]" />
                <span>{totalTurnaround || 'চলমান...'}</span>
              </p>
              <span className="text-[10px] text-stone-500">অনুরোধ দাখিল থেকে সমাপ্তি পর্যন্ত</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-500 block">সেবার ধরন / বিবরণ</span>
              <p className="text-xs font-black text-stone-900 mt-1 truncate">
                {booking.serviceName || booking.description || booking.work_description || 'সাধারণ গৃহস্থালি সেবা'}
              </p>
              <span className="text-[10px] text-stone-500 truncate block">
                {booking.jobAddress || booking.job_address || 'ঠাকুরগাঁও সদর'}
              </span>
            </div>
          </div>

          {/* Both Parties Profile Cards Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Summary Card */}
            <div className="p-4 rounded-2xl bg-white/90 border border-stone-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-700 border-b border-stone-100 pb-2">
                <User className="h-4 w-4 text-blue-600" />
                <span>গ্রাহক বিবরণী (Customer)</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-stone-900 text-sm">{booking.customerName || 'সম্মানিত গ্রাহক'}</p>
                <div className="flex items-center gap-2 text-stone-600">
                  <Phone className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span className="font-mono font-semibold">{booking.customerPhone || 'মোবাইল নম্বর যুক্ত নেই'}</span>
                </div>
                {booking.customerEmail && !booking.customerEmail.endsWith('@mistri.app') && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <Mail className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span className="font-mono text-[11px] break-all">{booking.customerEmail}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-stone-600 pt-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">{booking.jobAddress || booking.job_address || booking.customerAddress || 'ঠাকুরগাঁও'}</span>
                </div>
              </div>
            </div>

            {/* Mistri Summary Card */}
            <div className="p-4 rounded-2xl bg-white/90 border border-stone-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-700 border-b border-stone-100 pb-2">
                <Wrench className="h-4 w-4 text-[#2c7865]" />
                <span>মিস্ত্রী বিবরণী (Mistri)</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-stone-900 text-sm">{booking.mistriName || 'নির্ধারিত কারিগর'}</p>
                <p className="text-[11px] font-semibold text-[#2c7865]">{booking.mistriTitle || 'দক্ষ টেকনিশিয়ান'}</p>
                <div className="flex items-center gap-2 text-stone-600">
                  <Phone className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span className="font-mono font-semibold">{booking.mistriPhone || 'মোবাইল নম্বর যুক্ত নেই'}</span>
                </div>
                {booking.mistriEmail && !booking.mistriEmail.endsWith('@mistri.app') && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <Mail className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span className="font-mono text-[11px] break-all">{booking.mistriEmail}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── TIMELINE TRACKER (তারিখ ও সময় সহ হিস্টোরি টাইমলাইন) ── */}
      <Card className="p-5 sm:p-6 rounded-3xl border-stone-200 shadow-sm bg-white">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
          <div>
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#2c7865]" />
              <span>
                {perspective === 'mistri' 
                  ? 'কাজের টাইমলাইন ও অগ্রগতির ইতিহাস' 
                  : perspective === 'admin' 
                  ? 'সম্পূর্ণ বুকিং টাইমলাইন অডিট ট্রেইল' 
                  : 'সেবা ট্র্যাকিং টাইমলাইন'}
              </span>
            </h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              প্রতিটি ধাপের সঠিক বাংলা তারিখ ও সময় সহ রিয়েল-টাইম লগ
            </p>
          </div>
          <Badge variant="neutral" className="text-[11px] font-semibold bg-stone-50">
            {steps.filter(s => s.status === 'completed').length} / {steps.length} সম্পন্ন
          </Badge>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isStepDone = step.status === 'completed'
            const isStepActive = step.status === 'active'
            const isStepCancelled = step.status === 'cancelled'

            return (
              <div key={step.key} className="relative group">
                {/* Milestone Node Icon */}
                <div 
                  className={`absolute -left-6 sm:-left-8 top-0.5 h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center ring-4 ring-white shadow-xs transition-colors ${
                    isStepDone 
                      ? 'bg-emerald-600 text-white' 
                      : isStepActive 
                      ? 'bg-blue-600 text-white animate-pulse' 
                      : isStepCancelled 
                      ? 'bg-red-600 text-white' 
                      : 'bg-stone-100 text-stone-400 border border-stone-300'
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </div>

                {/* Milestone Content Box */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  isStepDone 
                    ? 'bg-emerald-50/40 border-emerald-200/70' 
                    : isStepActive 
                    ? 'bg-blue-50/50 border-blue-200 shadow-2xs' 
                    : isStepCancelled 
                    ? 'bg-red-50/50 border-red-200' 
                    : 'bg-stone-50/40 border-stone-200 text-stone-400'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black ${
                        isStepDone 
                          ? 'text-emerald-950' 
                          : isStepActive 
                          ? 'text-blue-950 font-extrabold' 
                          : isStepCancelled 
                          ? 'text-red-950' 
                          : 'text-stone-600'
                      }`}>
                        {step.title}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block w-fit ${
                      isStepDone 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : isStepActive 
                        ? 'bg-blue-100 text-blue-800' 
                        : isStepCancelled 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-stone-200 text-stone-600'
                    }`}>
                      {step.badgeText}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Exact Bangla Date & Time */}
                  {step.timestamp ? (
                    <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center gap-1.5 text-[11px] font-bold text-stone-700">
                      <Calendar className="h-3.5 w-3.5 text-[#2c7865] shrink-0" />
                      <span>{step.timestamp}</span>
                    </div>
                  ) : (
                    <div className="mt-1.5 text-[10px] italic text-stone-400">
                      তারিখ ও সময় অপেক্ষমাণ...
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
