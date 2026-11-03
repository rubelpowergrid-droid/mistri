'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Phone, Lock, Wrench, ArrowRight, ShieldCheck } from 'lucide-react'
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
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!phone || phone.length < 11) {
      setError(isBn ? 'সঠিক ১১-সংখ্যার মোবাইল নম্বর দিন' : 'Enter a valid 11-digit phone number')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      // If customer, redirect to home; if mistri, redirect to dashboard; if admin, to admin
      if (phone.includes('admin') || phone === '01700000000') {
        router.push('/admin/dashboard')
      } else if (phone.endsWith('99')) {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    }, 800)
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
            {isBn ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'Sign in to your account'}
          </p>
        </div>

        {/* Tab switch for Password vs OTP */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAuthMode('password')}
            className={`flex-1 rounded-lg py-2 transition-all ${
              authMode === 'password' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            {isBn ? 'পাসওয়ার্ড দিয়ে' : 'With Password'}
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('otp')}
            className={`flex-1 rounded-lg py-2 transition-all ${
              authMode === 'otp' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            {isBn ? 'মোবাইল ওটিপি (OTP)' : 'With SMS OTP'}
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
            label={t('auth.phone_number')}
            placeholder="017XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="h-4 w-4" />}
            required
          />

          {authMode === 'password' ? (
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
          ) : (
            <div className="rounded-xl bg-blue-50/70 p-3 text-xs text-blue-700 border border-blue-100 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
              <span>
                {isBn 
                  ? 'লগইনে ক্লিক করলে আপনার মোবাইলে ৪ সংখ্যার একটি যাচাইকরণ কোড পাঠানো হবে।' 
                  : 'Clicking login will send a 4-digit SMS OTP code to verify your phone number.'}
              </span>
            </div>
          )}

          <Button type="submit" isLoading={isLoading} className="w-full py-3 text-sm font-semibold">
            <span>{authMode === 'password' ? t('auth.login') : (isBn ? 'ওটিপি কোড পাঠান' : 'Send OTP Code')}</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          <span>{isBn ? 'অ্যাকাউন্ট নেই? ' : "Don't have an account? "}</span>
          <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4">
            {t('auth.register')}
          </Link>
        </div>
      </Card>
    </div>
  )
}

