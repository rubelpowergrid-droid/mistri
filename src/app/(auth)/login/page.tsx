'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Phone, Lock, Wrench, ArrowRight, ShieldCheck, MessageCircle, MessageSquare } from 'lucide-react'
import { useI18n } from '@/locales'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('otp') // Default to OTP for low-friction
  const [otpChannel, setOtpChannel] = useState<'whatsapp' | 'sms'>('whatsapp') // Default to WhatsApp
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    if (!cleanPhone || cleanPhone.length < 11) {
      setError(isBn ? 'সঠিক ১১-সংখ্যার মোবাইল নম্বর দিন' : 'Enter a valid 11-digit phone number')
      return
    }

    setIsLoading(true)

    if (authMode === 'password') {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, password }),
        })
        const data = await res.json()
        setIsLoading(false)

        if (data.success) {
          if (typeof window !== 'undefined' && data.user) {
            localStorage.setItem('mistri_user', JSON.stringify(data.user))
          }
          if (data.message) {
            alert(data.message)
          }
          router.push(data.redirectUrl || '/')
        } else {
          setError(data.error || (isBn ? 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন' : 'Invalid credentials'))
        }
      } catch {
        setIsLoading(false)
        setError(isBn ? 'লগইন করতে সমস্যা হয়েছে' : 'Failed to login')
      }
      return
    }

    // OTP Auth Mode (WhatsApp or SMS)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, channel: otpChannel }),
      })
      const data = await res.json()
      setIsLoading(false)

      if (data.success) {
        router.push(`/verify-otp?phone=${encodeURIComponent(cleanPhone)}&channel=${otpChannel}`)
      } else {
        setError(data.error || 'ওটিপি পাঠাতে ব্যর্থ হয়েছে')
      }
    } catch {
      setIsLoading(false)
      // Fallback
      router.push(`/verify-otp?phone=${encodeURIComponent(cleanPhone)}&channel=${otpChannel}`)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 shadow-lg border-slate-200">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
            <Wrench className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            mistri<span className="text-blue-600">.</span>
          </h1>
          <p className="text-sm text-slate-500">
            {isBn ? 'আপনার মোবাইল নম্বর দিয়ে সরাসরি প্রবেশ করুন' : 'Sign in to your account'}
          </p>
        </div>

        {/* Tab switch for OTP vs Password */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAuthMode('otp')}
            className={`flex-1 rounded-lg py-2 transition-all ${
              authMode === 'otp' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            {isBn ? 'ওটিপি যাচাই (OTP Login)' : 'With OTP'}
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('password')}
            className={`flex-1 rounded-lg py-2 transition-all ${
              authMode === 'password' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            {isBn ? 'পাসওয়ার্ড দিয়ে' : 'With Password'}
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            label={isBn ? 'মোবাইল নম্বর (ইংরেজীতে)' : 'Mobile Number (English)'}
            placeholder="017XXXXXXXX"
            value={phone}
            onChange={(e) => {
              const val = e.target.value
              if (val.toLowerCase().startsWith('admin')) {
                setPhone(val)
              } else {
                const converted = val.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString())
                setPhone(converted.replace(/[^0-9]/g, '').slice(0, 11))
              }
            }}
            leftIcon={<Phone className="h-4 w-4" />}
            required
          />

          {authMode === 'password' ? (
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                label={t('auth.password')}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                required
              />
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-slate-700 block">
                {isBn ? 'ওটিপি গ্রহণের মাধ্যম নির্বাচন করুন:' : 'Choose OTP Delivery Channel:'}
              </label>

              {/* Channel Selector: WhatsApp vs SMS */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setOtpChannel('whatsapp')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 text-center transition-all ${
                    otpChannel === 'whatsapp'
                      ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-xs">
                      💬
                    </span>
                    <span className="text-xs font-bold">WhatsApp</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    {isBn ? 'দ্রুত ও ফ্রি (প্রস্তাবিত)' : 'Instant & Free'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOtpChannel('sms')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 text-center transition-all ${
                    otpChannel === 'sms'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-950 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <MessageSquare className="h-4 w-4 text-slate-700" />
                    <span className="text-xs font-bold">{isBn ? 'সাধারণ SMS' : 'Regular SMS'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {isBn ? 'মোবাইল ইনবক্স' : 'Mobile Inbox'}
                  </span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                {otpChannel === 'whatsapp'
                  ? (isBn 
                      ? '🔒 আপনার WhatsApp মেসেজে ৪-সংখ্যার সিকিউর ওটিপি পাঠানো হবে।' 
                      : 'A 4-digit verification code will be sent to your WhatsApp.')
                  : (isBn 
                      ? '📱 সাধারণ মোবাইল এসএমএস হিসেবে কোড পাঠানো হবে।' 
                      : 'A code will be dispatched to your phone via SMS.')}
              </p>
            </div>
          )}

          <Button type="submit" isLoading={isLoading} className="w-full py-3 text-sm font-semibold">
            <span>
              {authMode === 'password'
                ? t('auth.login')
                : otpChannel === 'whatsapp'
                ? (isBn ? '🟢 WhatsApp-এ ওটিপি পাঠান' : 'Send WhatsApp OTP')
                : (isBn ? '✉️ SMS-এ ওটিপি পাঠান' : 'Send SMS OTP')}
            </span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          <span>{isBn ? 'নতুন মিস্ত্রী হিসেবে যুক্ত হতে চান? ' : 'Are you a skilled professional? '}</span>
          <Link href="/onboarding" className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4">
            {isBn ? 'মিস্ত্রী রেজিস্ট্রেশন' : 'Register as Mistri'}
          </Link>
        </div>
      </Card>
    </div>
  )
}
