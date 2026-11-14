'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useI18n } from '@/locales'
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

  const [isLoading, setIsLoading] = useState(false)
  const [activeAction, setActiveAction] = useState<'signin' | 'signup' | null>(null)
  const [error, setError] = useState('')

  const handleGoogleAuth = async (mode: 'signin' | 'signup') => {
    setIsLoading(true)
    setActiveAction(mode)
    setError('')

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

      // Sync user with backend API as customer by default
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
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-[440px] rounded-[32px] bg-[#fdfcf7] border border-[#2c7865]/15 p-8 sm:p-10 shadow-[0_10px_35px_rgba(44,120,101,0.06)] space-y-7 text-center">
        {/* Main App Logo */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl overflow-hidden shadow-md transition-transform hover:scale-105">
          <img
            src="/mistri24.png"
            alt="mistri24"
            className="h-full w-full object-contain rounded-2xl"
          />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1b5e4c] tracking-tight">
            mistri24
          </h1>
          <p className="text-sm font-semibold text-[#2c7865]">
            {isBn ? 'আপনার অ্যাকাউন্টে সহজে প্রবেশ করুন' : 'Sign in to your account easily'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200 animate-in fade-in">
            {error}
          </div>
        )}

        {/* Google Authentication Buttons */}
        <div className="space-y-3.5 pt-2">
          {/* Button 1: Sign in With Google */}
          <button
            type="button"
            onClick={() => handleGoogleAuth('signin')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-full bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 text-[#1b5e4c] font-bold text-sm sm:text-base shadow-xs hover:shadow transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isLoading && activeAction === 'signin' ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#1b5e4c]" />
            ) : (
              <GoogleIcon className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
            )}
            <span>Sign in With Google</span>
          </button>

          {/* Button 2: Sign Up With Google */}
          <button
            type="button"
            onClick={() => handleGoogleAuth('signup')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-full bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 text-[#2c5384] font-bold text-sm sm:text-base shadow-xs hover:shadow transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isLoading && activeAction === 'signup' ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#2c5384]" />
            ) : (
              <GoogleIcon className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
            )}
            <span>Sign Up With Google</span>
          </button>
        </div>
      </div>
    </div>
  )
}
