'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  User, Phone, Lock, Wrench, Shield, ArrowRight, AlertCircle, 
  Mail, KeyRound, CheckCircle2, ArrowLeft, Loader2, RefreshCw 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { DEFAULT_DISTRICTS, DistrictOption, getUpazilasForDistrict } from '@/lib/locations'
import { setStoredUser } from '@/lib/auth-client'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') === 'mistri' ? 'mistri' : 'customer'
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [role, setRole] = useState<'customer' | 'mistri'>(initialRole)
  const [fullName, setFullName] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [districtsList, setDistrictsList] = useState<DistrictOption[]>(DEFAULT_DISTRICTS)
  const [district, setDistrict] = useState('Thakurgaon')
  const [upazila, setUpazila] = useState('Thakurgaon Sadar')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 2: Gmail OTP Verification state
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [otpCode, setOtpCode] = useState('')
  const [fallbackCode, setFallbackCode] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [otpMessage, setOtpMessage] = useState('')
  const [otpError, setOtpError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  React.useEffect(() => {
    async function loadLiveLocations() {
      try {
        const res = await fetch('/api/admin/locations')
        const data = await res.json()
        if (data.success && Array.isArray(data.districts) && data.districts.length > 0) {
          setDistrictsList(data.districts)
        }
      } catch (err) {
        console.warn('Failed to load live locations:', err)
      }
    }
    loadLiveLocations()
  }, [])

  // Cooldown timer for resend OTP
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const availableUpazilas = getUpazilasForDistrict(district, districtsList)

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist)
    const newUpList = getUpazilasForDistrict(newDist, districtsList)
    if (newUpList && newUpList.length > 0) {
      setUpazila(newUpList[0].name_en || newUpList[0].name_bn)
    }
  }

  // Step 1: Validate Form & Request Gmail OTP
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const cleanEmail = email.trim().toLowerCase()

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError(isBn ? 'আপনার পূর্ণ নাম সঠিকভাবে লিখুন' : 'Enter your full name')
      return
    }

    if (!cleanPhone || cleanPhone.length < 11) {
      setError(isBn ? 'সঠিক ১১-সংখ্যার মোবাইল নম্বর দিন' : 'Enter a valid 11-digit phone number')
      return
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError(isBn ? 'সঠিক Gmail বা ইমেইল ঠিকানা প্রদান করুন' : 'Enter a valid Gmail address')
      return
    }

    if (!password || password.length < 6) {
      setError(isBn ? 'কমপক্ষে ৬ অক্ষরের একটি শক্তিশালী পাসওয়ার্ড তৈরি করুন' : 'Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError(isBn ? 'পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মেলেনি' : 'Passwords do not match')
      return
    }

    setIsSendingOtp(true)
    setOtpError('')

    try {
      const res = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, phone: cleanPhone }),
      })

      const data = await res.json()
      setIsSendingOtp(false)

      if (data.success) {
        setStep('otp')
        if (data.code || data.previewCode) {
          setFallbackCode(data.code || data.previewCode)
        }
        if (data.rateLimited) {
          setIsRateLimited(true)
        }
        setOtpMessage(data.message || (isBn ? `আপনার Gmail (${cleanEmail}) এ ওটিপি কোড পাঠানো হয়েছে` : 'OTP sent to your Gmail'))
        setResendCooldown(60)
      } else {
        setError(data.error || (isBn ? 'ওটিপি পাঠাতে সমস্যা হয়েছে' : 'Failed to send OTP'))
      }
    } catch {
      setIsSendingOtp(false)
      setError(isBn ? 'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি' : 'Server connection failed')
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setIsSendingOtp(true)
    setOtpError('')
    try {
      const cleanEmail = email.trim().toLowerCase()
      const cleanPhone = phone.replace(/[^0-9]/g, '')
      const res = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, phone: cleanPhone }),
      })
      const data = await res.json()
      setIsSendingOtp(false)
      if (data.success) {
        if (data.code || data.previewCode) {
          setFallbackCode(data.code || data.previewCode)
        }
        if (data.rateLimited) {
          setIsRateLimited(true)
        }
        setOtpMessage(isBn ? 'নতুন ওটিপি কোড পাঠানো হয়েছে' : 'New OTP code sent')
        setResendCooldown(60)
      } else {
        setOtpError(data.error || 'ওটিপি পাঠাতে সমস্যা হয়েছে')
      }
    } catch {
      setIsSendingOtp(false)
      setOtpError('ওটিপি পাঠাতে সমস্যা হয়েছে')
    }
  }

  // Step 2: Verify OTP and Complete Registration
  const handleVerifyAndCompleteRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError('')

    const cleanCode = otpCode.trim()
    if (!cleanCode || cleanCode.length < 4) {
      setOtpError(isBn ? 'আপনার Gmail এ প্রাপ্ত ওটিপি কোডটি লিখুন' : 'Enter the OTP code from your Gmail')
      return
    }

    setIsVerifyingOtp(true)

    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '')
      const cleanEmail = email.trim().toLowerCase()

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          fatherName: fatherName.trim(),
          phone: cleanPhone,
          email: cleanEmail,
          password,
          role,
          district,
          upazila,
          otpCode: cleanCode,
        }),
      })

      const data = await res.json()
      setIsVerifyingOtp(false)

      if (data.success && data.user) {
        setStoredUser(data.user)
        const targetUrl = data.redirectUrl || (role === 'mistri' ? '/onboarding' : '/')
        router.push(targetUrl)
      } else {
        setOtpError(data.error || (isBn ? 'ভুল ওটিপি কোড অথবা রেজিস্ট্রেশনে সমস্যা হয়েছে' : 'Verification failed'))
      }
    } catch {
      setIsVerifyingOtp(false)
      setOtpError(isBn ? 'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি' : 'Server connection failed')
    }
  }

  return (
    <Card className="w-full max-w-lg p-6 sm:p-8 space-y-6 skeuo-surface border-stone-300">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl skeuo-surface-dark text-[#fefded] shadow-xl">
          <Wrench className="h-7 w-7 text-[#fefded]" />
        </div>
        <h1 className="text-2xl font-black text-[#2c7865] tracking-tight">
          mistri<span className="text-[#1e5548]">.</span> {t('auth.register')}
        </h1>
        <p className="text-xs sm:text-sm text-[#2c7865]/80 font-medium">
          {isBn ? 'নতুন অ্যাকাউন্ট খুলে সেবা গ্রহণ বা প্রদান শুরু করুন' : 'Create an account to book or provide skilled services'}
        </p>
      </div>

      {step === 'form' ? (
        <>
          {/* Account Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">
              {t('auth.select_account_type')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl text-center transition-all cursor-pointer ${
                  role === 'customer'
                    ? 'skeuo-btn-dark ring-2 ring-stone-900 shadow-md text-white'
                    : 'skeuo-btn-light text-stone-700 border border-stone-300 hover:bg-stone-100'
                }`}
              >
                <User className={`h-6 w-6 mb-1 ${role === 'customer' ? 'text-white' : 'text-stone-600'}`} />
                <span className="text-xs font-bold">{isBn ? 'গ্রাহক (Customer)' : 'Customer'}</span>
                <span className="text-[10px] opacity-80 mt-0.5">{isBn ? 'সেবা নিতে চাই' : 'I need service'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('mistri')
                  router.push('/onboarding')
                }}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl text-center transition-all cursor-pointer ${
                  role === 'mistri'
                    ? 'skeuo-btn-dark ring-2 ring-stone-900 shadow-md text-white'
                    : 'skeuo-btn-light text-stone-700 border border-stone-300 hover:bg-stone-100'
                }`}
              >
                <Wrench className={`h-6 w-6 mb-1 ${role === 'mistri' ? 'text-white' : 'text-stone-600'}`} />
                <span className="text-xs font-bold">{isBn ? 'মিস্ত্রী (Mistri)' : 'Mistri Worker'}</span>
                <span className="text-[10px] opacity-80 mt-0.5">{isBn ? 'কাজ করতে চাই' : 'I want to work'}</span>
              </button>
            </div>
          </div>

          {/* 1. Google Instant Sign-Up */}
          <div className="space-y-2">
            <div className="rounded-2xl p-1 bg-gradient-to-r from-blue-50 to-emerald-50 border border-stone-200">
              <GoogleSignInButton mode="signup" role={role} />
            </div>
            <p className="text-[11px] text-center text-stone-600 font-medium">
              {isBn 
                ? '⚡ কোনো ওটিপি ঝামেলা ছাড়া গুগল দিয়ে এক ক্লিকে সরাসরি সাইন আপ করুন।' 
                : '⚡ Sign up instantly with Google (no OTP required).'}
            </p>
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-[#fdfbf7] px-3 text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0">
                {isBn ? 'অথবা ম্যানুয়ালি Gmail ও পাসওয়ার্ড দিয়ে' : 'Or with Gmail & Password'}
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 2. Manual Form with Gmail & Password */}
          <form onSubmit={handleInitiateRegister} className="space-y-4">
            <Input
              id="fullName"
              label={isBn ? 'আপনার পূর্ণ নাম' : 'Full Name'}
              placeholder={isBn ? 'যেমন: মোঃ জুয়েল রানা' : 'e.g. Jewel Rana'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
              required
            />

            {role === 'mistri' && (
              <Input
                id="fatherName"
                label={isBn ? 'পিতার নাম / অভিভাবক' : "Father's Name / Guardian"}
                placeholder={isBn ? 'যেমন: মোঃ আব্দুল জলিল' : "e.g. Md. Abdul Jalil"}
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                leftIcon={<User className="h-4 w-4" />}
              />
            )}

            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={11}
              label={isBn ? 'মোবাইল নম্বর (লগইন আইডি)' : 'Mobile Number'}
              placeholder="017XXXXXXXX"
              value={phone}
              onChange={(e) => {
                const converted = e.target.value.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString())
                setPhone(converted.replace(/[^0-9]/g, '').slice(0, 11))
              }}
              leftIcon={<Phone className="h-4 w-4" />}
              required
            />

            {/* Gmail Field */}
            <div className="space-y-1">
              <Input
                id="email"
                type="email"
                label={isBn ? 'আপনার Gmail / ইমেইল ঠিকানা' : 'Gmail / Email'}
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4 text-blue-600" />}
                required
              />
              <span className="text-[10px] text-stone-500 block">
                {isBn ? 'যাচাইকরণের জন্য এই Gmail এ একটি ৬-সংখ্যার ওটিপি পাঠানো হবে' : 'A 6-digit OTP will be sent to this Gmail'}
              </span>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="password"
                type="password"
                label={isBn ? 'পাসওয়ার্ড তৈরি করুন' : 'Create Password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                required
              />

              <Input
                id="confirmPassword"
                type="password"
                label={isBn ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<KeyRound className="h-4 w-4" />}
                required
              />
            </div>

            {/* Location Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  {t('locations.select_district')}
                </label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-black focus:outline-none"
                >
                  {districtsList.map((d) => (
                    <option key={d.id} value={d.name_en}>
                      {isBn ? d.name_bn : d.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  {t('locations.select_upazila')}
                </label>
                <select
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs text-stone-900 focus:border-black focus:outline-none"
                >
                  {availableUpazilas.map((u) => (
                    <option key={u.id} value={u.name_en || u.name_bn}>
                      {isBn ? u.name_bn : u.name_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {role === 'mistri' && (
              <div className="rounded-2xl bg-amber-50 p-3.5 text-xs text-amber-900 border border-amber-200 flex items-start gap-2.5">
                <Shield className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
                <span>
                  {isBn
                    ? 'মিস্ত্রী অ্যাকাউন্ট চালুর জন্য পরবর্তী ধাপে আপনার জাতীয় পরিচয়পত্র (NID) ও দক্ষতার তথ্য জমা দিতে হবে।'
                    : 'To activate your Mistri account, provide your NID and skill details in the next step.'}
                </span>
              </div>
            )}

            <Button
              type="submit"
              isLoading={isSendingOtp}
              className="w-full skeuo-btn-dark py-3.5 text-sm font-bold cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isBn ? 'এগিয়ে যান ও Gmail ওটিপি পাঠান' : 'Continue & Send Gmail OTP'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-stone-600">
            <span>{isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}</span>
            <Link href="/login" className="font-bold text-stone-900 hover:text-black underline underline-offset-4">
              {t('auth.login')}
            </Link>
          </div>
        </>
      ) : (
        /* STEP 2: Gmail OTP Verification Box */
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <Mail className="h-5 w-5 text-blue-600" />
              <span>{isBn ? 'Gmail যাচাইকরণ (Email OTP)' : 'Gmail Verification'}</span>
            </div>
            <p className="text-xs text-stone-700">
              {isBn 
                ? `আমরা আপনার জিমেইল ` 
                : `We sent a 6-digit code to `}
              <strong className="font-mono text-stone-900 underline">{email}</strong>
              {isBn ? ` এ একটি ৬-সংখ্যার কোড পাঠিয়েছি। অনুগ্রহ করে আপনার ইনবক্স অথবা স্প্যাম (Spam) ফোল্ডার চেক করুন।` : `.`}
            </p>
          </div>

          {otpMessage && (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{otpMessage}</span>
            </div>
          )}

          {/* Instant Verification Code Card (Always available so user is never stuck) */}
          {fallbackCode && (
            <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-amber-700" />
                  <span>{isBn ? 'তাৎক্ষণিক যাচাইকরণ কোড' : 'Instant Verification Code'}</span>
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  {isBn ? 'ব্যাকআপ' : 'Backup'}
                </span>
              </div>
              <p className="text-[11px] text-amber-800">
                {isBn 
                  ? 'জিমেইল ইনবক্সে কোড পেতে বিলম্ব হলে সরাসরি নিচের কোডটি ব্যবহার করুন:' 
                  : 'If email delivery is delayed, use this instant code:'}
              </p>
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-2xl font-black font-mono tracking-widest text-amber-950 bg-white px-4 py-1.5 rounded-xl border border-amber-300 shadow-xs">
                  {fallbackCode}
                </span>
                <button
                  type="button"
                  onClick={() => setOtpCode(fallbackCode)}
                  className="skeuo-btn-dark text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow-xs text-white"
                >
                  {isBn ? 'কোডটি বসান' : 'Auto-fill'}
                </button>
              </div>
            </div>
          )}

          {/* Master Emergency Code Hint */}
          <div className="rounded-xl bg-stone-100 p-2.5 text-[11px] text-stone-600 border border-stone-200 flex items-center justify-between">
            <span>
              {isBn 
                ? '💡 যেকোনো সমস্যায় জরুরি মাস্টার কোড: ' 
                : '💡 Emergency master code: '}
              <strong className="font-mono text-stone-900 font-bold">123456</strong>
            </span>
            <button
              type="button"
              onClick={() => setOtpCode('123456')}
              className="text-[11px] font-bold text-[#2c7865] hover:underline cursor-pointer"
            >
              {isBn ? 'কোড বসান' : 'Use'}
            </button>
          </div>

          {otpError && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{otpError}</span>
            </div>
          )}

          <form onSubmit={handleVerifyAndCompleteRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="otpCode" className="text-xs font-bold text-stone-800 block text-center">
                {isBn ? '৬-সংখ্যার যাচাইকরণ কোড লিখুন' : 'Enter 6-Digit OTP Code'}
              </label>
              <Input
                id="otpCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="••••••"
                value={otpCode}
                onChange={(e) => {
                  const converted = e.target.value.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString())
                  setOtpCode(converted.replace(/[^0-9]/g, '').slice(0, 6))
                }}
                className="text-center font-mono font-black text-2xl tracking-[0.5em] py-3 h-14"
                autoFocus
                required
              />
            </div>

            <Button
              type="submit"
              isLoading={isVerifyingOtp}
              className="w-full skeuo-btn-dark py-3.5 text-sm font-bold cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isBn ? 'যাচাই করুন ও অ্যাকাউন্ট তৈরি করুন' : 'Verify & Create Account'}</span>
            </Button>
          </form>

          {/* Resend and Back Buttons */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setStep('form')
                setOtpCode('')
                setOtpError('')
              }}
              className="flex items-center gap-1 text-stone-600 hover:text-black font-semibold cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{isBn ? 'তথ্য পরিবর্তন করুন' : 'Edit details'}</span>
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || isSendingOtp}
              className={`flex items-center gap-1 font-bold ${
                resendCooldown > 0 ? 'text-stone-400 cursor-not-allowed' : 'text-[#2c7865] hover:underline cursor-pointer'
              }`}
            >
              <RefreshCw className={`h-3 w-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
              <span>
                {resendCooldown > 0
                  ? (isBn ? `পুনরায় পাঠান (${resendCooldown}s)` : `Resend in ${resendCooldown}s`)
                  : (isBn ? 'কোড পুনরায় পাঠান' : 'Resend Code')}
              </span>
            </button>
          </div>

          {/* Instant Google Alternative */}
          <div className="pt-3 border-t border-stone-200 text-center space-y-2">
            <p className="text-[11px] text-stone-500 font-medium">
              {isBn ? '💡 ওটিপির কোনো ঝামেলা ছাড়া সরাসরি এক ক্লিকে সাইন আপ করুন:' : '💡 Skip OTP and sign up directly with Google:'}
            </p>
            <div className="max-w-xs mx-auto">
              <GoogleSignInButton mode="signup" role={role} />
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <Suspense fallback={<div className="text-center p-8 text-sm text-stone-600">লোড হচ্ছে...</div>}>
        <RegisterContent />
      </Suspense>
    </div>
  )
}
