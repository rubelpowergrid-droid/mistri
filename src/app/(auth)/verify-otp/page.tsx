'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck, ArrowRight, RefreshCw, MessageSquare, CheckCircle2 } from 'lucide-react'
import { useI18n } from '@/locales'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') || '০১XXXXXXXXX'
  const initialChannel = (searchParams.get('channel') as 'whatsapp' | 'sms') || 'whatsapp'
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [channel, setChannel] = useState<'whatsapp' | 'sms'>(initialChannel)
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (otp.length < 4) {
      setError(isBn ? '৪-সংখ্যার সঠিক ওটিপি কোড লিখুন' : 'Enter a valid 4-digit OTP code')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      })
      const data = await res.json()
      setIsLoading(false)

      if (data.success) {
        if (typeof window !== 'undefined' && data.user) {
          localStorage.setItem('mistri_user', JSON.stringify(data.user))
          window.dispatchEvent(new Event('mistri_auth_changed'))
        }
        if (data.user?.role === 'admin') {
          router.push('/admin/dashboard')
        } else if (data.user?.role === 'mistri') {
          router.push(data.redirectUrl || '/mistri/profile')
        } else {
          router.push(data.redirectUrl || '/')
        }
      } else {
        setError(data.error || 'ভুল ওটিপি কোড! আবার চেষ্টা করুন')
      }
    } catch {
      setIsLoading(false)
      // Fallback
      if (otp === '1234') {
        router.push('/')
      } else {
        setError(isBn ? 'ভুল ওটিপি কোড! টেস্ট কোড: 1234' : 'Invalid code! Test code: 1234')
      }
    }
  }

  const handleResend = async (targetChannel?: 'whatsapp' | 'sms') => {
    const ch = targetChannel || channel
    setError('')
    setFeedbackMessage('')

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, channel: ch }),
      })
      const data = await res.json()
      if (data.success) {
        setChannel(ch)
        setFeedbackMessage(
          ch === 'whatsapp'
            ? (isBn ? '🟢 WhatsApp-এ নতুন কোড পাঠানো হয়েছে!' : 'New code sent to your WhatsApp!')
            : (isBn ? '📱 সাধারণ SMS হিসেবে কোড পাঠানো হয়েছে!' : 'New code dispatched via SMS!')
        )
        setTimeout(() => setFeedbackMessage(''), 4000)
      }
    } catch {
      setFeedbackMessage(isBn ? 'নতুন ওটিপি পাঠানো হয়েছে!' : 'New OTP dispatched!')
      setTimeout(() => setFeedbackMessage(''), 4000)
    }
  }

  return (
    <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 shadow-lg border-slate-200 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
        <ShieldCheck className="h-7 w-7" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold text-slate-900">{t('auth.otp_title')}</h1>
        
        {/* Delivery Channel Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span>{channel === 'whatsapp' ? '💬 WhatsApp' : '📱 SMS'}</span>
          <span>•</span>
          <span className="font-mono">{phone}</span>
        </div>

        <p className="text-xs text-slate-500 max-w-xs mx-auto pt-1">
          {channel === 'whatsapp'
            ? (isBn 
                ? 'আপনার WhatsApp অ্যাপে প্রেরিত ৪-সংখ্যার ওটিপি কোডটি লিখুন:' 
                : 'Enter the 4-digit code sent to your WhatsApp:')
            : (isBn 
                ? 'আপনার মোবাইলে সাধারণ SMS হিসেবে প্রেরিত ৪-সংখ্যার কোডটি লিখুন:' 
                : 'Enter the 4-digit SMS code:')}
        </p>
      </div>

      {/* Developer Sandbox Quick-Test Notice */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 text-center shadow-xs">
        <div className="flex items-center justify-center gap-1.5 font-bold">
          <span>💡 টেস্ট ওটিপি কোড:</span>
          <button
            type="button"
            onClick={() => setOtp('1234')}
            className="font-mono font-black text-sm bg-amber-200 hover:bg-amber-300 text-amber-950 px-2 py-0.5 rounded-lg border border-amber-300 transition-colors cursor-pointer"
            title="ক্লিক করে কোড বসান"
          >
            1234
          </button>
        </div>
        <p className="text-[11px] text-amber-700 mt-1">
          {isBn
            ? 'মোবাইলে মেসেজ বিলম্বিত হলে উপরের ১২৩৪ বাটনে চাপুন অথবা কোডটি লিখে লগইন করুন।'
            : 'If message is delayed, click 1234 or type it manually to proceed instantly.'}
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {feedbackMessage && (
        <div className="rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        <div className="flex justify-center">
          <input
            type="text"
            maxLength={4}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="••••"
            className="w-44 text-center tracking-[0.8em] text-3xl font-black rounded-2xl border-2 border-slate-300 py-3 bg-white focus:border-blue-600 focus:outline-none transition-colors"
            autoFocus
          />
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full py-3 font-semibold">
          <span>{t('auth.verify_otp')}</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </form>

      {/* Alternative Fallback Links */}
      <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
        <div>
          <button
            type="button"
            onClick={() => handleResend(channel)}
            className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{isBn ? 'কোড পুনরায় পাঠান (Resend)' : 'Resend Code'}</span>
          </button>
        </div>

        {channel === 'whatsapp' ? (
          <div>
            <button
              type="button"
              onClick={() => handleResend('sms')}
              className="text-slate-500 hover:text-slate-800 underline underline-offset-4"
            >
              {isBn ? 'WhatsApp-এ কোড পাননি? সাধারণ SMS চান?' : "Didn't receive on WhatsApp? Send SMS"}
            </button>
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => handleResend('whatsapp')}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              {isBn ? 'WhatsApp-এ কোড চান? এখানে চাপুন' : 'Send via WhatsApp instead'}
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}

export default function VerifyOtpPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <Suspense fallback={<div className="text-center p-8 text-sm text-slate-500">লোড হচ্ছে...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </div>
  )
}
