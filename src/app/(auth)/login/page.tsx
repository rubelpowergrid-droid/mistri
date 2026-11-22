'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Phone, Lock, Eye, EyeOff, Loader2, ArrowRight, 
  Wrench, UserPlus, ShieldCheck, AlertCircle, CheckCircle2 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { signInWithGooglePopup } from '@/lib/firebase'
import { setStoredUser } from '@/lib/auth-client'

function GoogleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  // Tab: 'phone' or 'google'
  const [authMethod, setAuthMethod] = useState<'phone' | 'google'>('phone')

  // Phone & Password form state
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeAction, setActiveAction] = useState<'phone' | 'signin' | 'signup' | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Convert Bengali digits to English digits
  const handlePhoneChange = (val: string) => {
    if (val.includes('@') || val.toLowerCase().startsWith('admin')) {
      setPhone(val)
      return
    }
    const converted = val.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString())
    const digitsOnly = converted.replace(/[^0-9]/g, '').slice(0, 11)
    setPhone(digitsOnly)
  }

  // 1. Phone + Password Login Submission
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!phone || phone.trim().length < 4) {
      setError(isBn ? 'সঠিক মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)' : 'Please enter a valid phone number')
      return
    }

    if (!password || password.length < 4) {
      setError(isBn ? 'কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড দিন' : 'Password must be at least 4 characters')
      return
    }

    setIsLoading(true)
    setActiveAction('phone')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), password: password.trim() }),
      })

      const data = await res.json()
      setIsLoading(false)
      setActiveAction(null)

      if (data.success && data.user) {
        setStoredUser(data.user)
        setSuccess(data.message || (isBn ? 'লগইন সফল হয়েছে!' : 'Login successful!'))

        const targetUrl = data.redirectUrl || (
          data.role === 'admin' 
            ? '/admin/dashboard' 
            : data.role === 'mistri' 
            ? '/mistri/profile' 
            : '/'
        )

        setTimeout(() => {
          router.push(targetUrl)
        }, 300)
      } else {
        setError(data.error || (isBn ? 'ভুল মোবাইল নম্বর বা পাসওয়ার্ড' : 'Invalid phone or password'))
      }
    } catch {
      setIsLoading(false)
      setActiveAction(null)
      setError(isBn ? 'সার্ভারে সংযোগ স্থাপন সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' : 'Failed to connect to server.')
    }
  }

  // 2. Google Authentication
  const handleGoogleAuth = async (mode: 'signin' | 'signup') => {
    setIsLoading(true)
    setActiveAction(mode)
    setError('')
    setSuccess('')

    try {
      const res = await signInWithGooglePopup()

      if (!res.success || !res.user) {
        setIsLoading(false)
        setActiveAction(null)
        if (res.error && !res.error.includes('popup-closed')) {
          setError(res.error || (isBn ? 'গুগল সাইন-ইন সম্পন্ন হয়নি।' : 'Google sign-in incomplete.'))
        }
        return
      }

      // Sync user with backend API
      const apiRes = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: res.user.uid,
          email: res.user.email,
          name: res.user.displayName,
          avatar: res.user.photoURL,
          phone: res.user.phoneNumber,
          role: 'customer',
        }),
      })

      const data = await apiRes.json()
      setIsLoading(false)
      setActiveAction(null)

      if (data.success && data.user) {
        setStoredUser(data.user)
        const destination = data.redirectUrl || (data.user.role === 'mistri' ? '/mistri/profile' : '/')
        router.push(destination)
      } else {
        setError(data.error || (isBn ? 'অ্যাকাউন্টে প্রবেশ করতে সমস্যা হয়েছে।' : 'Failed to access account.'))
      }
    } catch (err: any) {
      setIsLoading(false)
      setActiveAction(null)
      setError(err?.message || (isBn ? 'গুগল সাইন-ইনে ত্রুটি ঘটেছে।' : 'Google authentication error.'))
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8 sm:py-14">
      <div className="w-full max-w-[460px] rounded-[32px] bg-[#fdfcf7] border border-[#2c7865]/20 p-6 sm:p-9 shadow-[0_12px_40px_rgba(44,120,101,0.08)] space-y-6">
        {/* Main App Logo & Title */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden shadow-md transition-transform hover:scale-105">
            <img
              src="/mistri24.png"
              alt="mistri24"
              className="h-full w-full object-contain rounded-2xl"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1b5e4c] tracking-tight">
              mistri24
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#2c7865] mt-0.5">
              {isBn ? 'আপনার অ্যাকাউন্টে সহজে প্রবেশ করুন' : 'Sign in to your account'}
            </p>
          </div>
        </div>

        {/* Tab Switcher: Mobile Phone vs Google */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-stone-200/70 border border-stone-300/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone')
              setError('')
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMethod === 'phone'
                ? 'bg-white text-[#1b5e4c] shadow-sm font-black'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Phone className="h-3.5 w-3.5 text-[#2c7865]" />
            <span>{isBn ? 'মোবাইল নম্বর' : 'Phone'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('google')
              setError('')
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMethod === 'google'
                ? 'bg-white text-[#1b5e4c] shadow-sm font-black'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <GoogleIcon className="h-3.5 w-3.5" />
            <span>Google</span>
          </button>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="rounded-2xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 border border-red-200 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-2xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 border border-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* ── METHOD 1: MOBILE NUMBER & PASSWORD LOGIN WINDOW ── */}
        {authMethod === 'phone' && (
          <form onSubmit={handlePhoneLogin} className="space-y-4 animate-in fade-in duration-200">
            {/* Phone Number Input */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-stone-800 block">
                {isBn ? 'মোবাইল নম্বর (১১ ডিজিট):' : 'Mobile Number (11 digits):'}
              </label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  leftIcon={<Phone className="h-4 w-4 text-stone-500" />}
                  required
                  className="rounded-xl text-xs sm:text-sm font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-stone-500">
                {isBn ? 'মিস্ত্রী অনবোর্ডিং বা রেজিস্ট্রেশনে ব্যবহৃত মোবাইল নম্বর' : 'Phone used during registration or onboarding'}
              </p>
            </div>

            {/* Password Input */}
            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800 block">
                  {isBn ? 'পাসওয়ার্ড:' : 'Password:'}
                </label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4 text-stone-500" />}
                  required
                  className="rounded-xl pr-10 text-xs sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full skeuo-btn-dark py-3.5 text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md transition-all mt-2"
            >
              {isLoading && activeAction === 'phone' ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isBn ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>{isBn ? 'লগইন করুন' : 'Sign In'}</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        )}

        {/* ── METHOD 2: GOOGLE AUTHENTICATION BUTTONS ── */}
        {authMethod === 'google' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <button
              type="button"
              onClick={() => handleGoogleAuth('signin')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 text-[#1b5e4c] font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer disabled:opacity-60 group"
            >
              {isLoading && activeAction === 'signin' ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#1b5e4c]" />
              ) : (
                <GoogleIcon className="h-4 w-4 shrink-0 group-hover:scale-110 transition-transform" />
              )}
              <span>Sign in With Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleGoogleAuth('signup')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 text-[#2c5384] font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer disabled:opacity-60 group"
            >
              {isLoading && activeAction === 'signup' ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#2c5384]" />
              ) : (
                <GoogleIcon className="h-4 w-4 shrink-0 group-hover:scale-110 transition-transform" />
              )}
              <span>Sign Up With Google</span>
            </button>
          </div>
        )}

        {/* Divider if in phone mode */}
        {authMethod === 'phone' && (
          <div className="relative pt-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone-300/80" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#fdfcf7] px-2 text-stone-500 font-bold">
                {isBn ? 'অথবা গুগল দিয়ে' : 'Or with Google'}
              </span>
            </div>
          </div>
        )}

        {authMethod === 'phone' && (
          <button
            type="button"
            onClick={() => handleGoogleAuth('signin')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-bold text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-60"
          >
            <GoogleIcon className="h-4 w-4" />
            <span>Google একাউন্ট দিয়ে এক-ক্লিকে লগইন</span>
          </button>
        )}

        {/* Footer Registration Shortcuts */}
        <div className="pt-3 border-t border-stone-200/80 space-y-2 text-xs">
          <p className="text-stone-500 text-[11px] font-semibold text-center">
            {isBn ? 'অ্যাকাউন্ট নেই? নিচে থেকে যোগ দিন:' : "Don't have an account? Join below:"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link
              href="/onboarding"
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#2c7865]/10 hover:bg-[#2c7865]/20 text-[#1b5e4c] font-bold transition-colors text-center border border-[#2c7865]/20"
            >
              <Wrench className="h-3.5 w-3.5 text-[#2c7865]" />
              <span>{isBn ? 'মিস্ত্রী হিসেবে আবেদন' : 'Join as Mistri'}</span>
            </Link>

            <Link
              href="/register"
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold transition-colors text-center border border-stone-300"
            >
              <UserPlus className="h-3.5 w-3.5 text-stone-600" />
              <span>{isBn ? 'কাস্টমার অ্যাকাউন্ট' : 'Customer Account'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
