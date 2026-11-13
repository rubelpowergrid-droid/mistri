'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Wrench, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { useI18n } from '@/locales'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') === 'mistri' ? 'mistri' : 'customer'
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [role, setRole] = useState<'customer' | 'mistri'>(initialRole)

  return (
    <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 skeuo-surface border-stone-300">
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
            onClick={() => setRole('mistri')}
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

      {/* Google Sign-Up Box */}
      <div className="space-y-4 pt-2">
        <div className="rounded-2xl p-1.5 bg-gradient-to-r from-blue-50 to-emerald-50 border border-stone-200">
          <GoogleSignInButton mode="signup" role={role} />
        </div>

        {role === 'mistri' && (
          <div className="pt-2">
            <Button
              type="button"
              onClick={() => router.push('/onboarding')}
              className="w-full skeuo-btn-dark py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isBn ? 'মিস্ত্রী অনবোর্ডিং ফর্মে এগিয়ে যান' : 'Continue to Mistri Onboarding'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Login link */}
      <div className="pt-4 border-t border-stone-200 text-center text-xs text-stone-600">
        <span>{isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}</span>
        <Link href="/login" className="font-bold text-stone-900 hover:text-black underline underline-offset-4">
          {t('auth.login')}
        </Link>
      </div>
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
