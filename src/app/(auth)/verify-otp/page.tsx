'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react'
import { useI18n } from '@/locales'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') || '০১XXXXXXXXX'
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 4) {
      setError(isBn ? '৪-সংখ্যার সঠিক ওটিপি কোড লিখুন' : 'Enter a valid 4-digit OTP code')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push('/')
    }, 700)
  }

  const handleResend = () => {
    setResendSuccess(true)
    setTimeout(() => setResendSuccess(false), 3000)
  }

  return (
    <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 shadow-lg border-slate-200 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
        <ShieldCheck className="h-7 w-7" />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-xl font-bold text-slate-900">{t('auth.otp_title')}</h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          {isBn 
            ? `${phone} নম্বরে পাঠানো ৪-সংখ্যার ওটিপি কোডটি লিখুন:`
            : `Enter the 4-digit code sent to ${phone}:`}
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {resendSuccess && (
        <div className="rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700 border border-emerald-200">
          {isBn ? 'নতুন ওটিপি কোড পাঠানো হয়েছে!' : 'New OTP code sent!'}
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
            className="w-40 text-center tracking-[1em] text-2xl font-bold rounded-2xl border-2 border-slate-300 py-3 bg-white focus:border-blue-600 focus:outline-none"
            autoFocus
          />
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full py-3 font-semibold">
          <span>{t('auth.verify_otp')}</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </form>

      <div className="pt-2">
        <button
          type="button"
          onClick={handleResend}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>{t('auth.resend_otp')}</span>
        </button>
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
