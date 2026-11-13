'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Phone, Lock, Wrench, ArrowRight, User } from 'lucide-react'
import { useI18n } from '@/locales'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { setStoredUser } from '@/lib/auth-client'

export default function LoginPage() {
  const router = useRouter()
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const cleanPhone = phone.trim().replace(/[^0-9a-zA-Z]/g, '')
    if (!cleanPhone || cleanPhone.length < 5) {
      setError(isBn ? 'সঠিক মোবাইল নম্বর অথবা ইউজারনেম দিন' : 'Enter a valid mobile number or username')
      return
    }

    if (!password) {
      setError(isBn ? 'পাসওয়ার্ড প্রদান করুন' : 'Password is required')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, password }),
      })
      const data = await res.json()
      setIsLoading(false)

      if (data.success && data.user) {
        setStoredUser(data.user)
        const destination = data.redirectUrl || (data.user.role === 'mistri' ? '/mistri/profile' : '/')
        router.push(destination)
      } else {
        setError(data.error || (isBn ? 'ভুল পাসওয়ার্ড অথবা মোবাইল নম্বর! সঠিক তথ্য দিন।' : 'Invalid credentials'))
      }
    } catch {
      setIsLoading(false)
      setError(isBn ? 'লগইন করতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করুন।' : 'Failed to login')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 skeuo-surface">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl skeuo-surface-dark text-[#fefded] shadow-xl">
            <Wrench className="h-7 w-7 text-[#fefded]" />
          </div>
          <h1 className="text-2xl font-black text-[#2c7865] tracking-tight">
            mistri<span className="text-[#1e5548]">.</span>
          </h1>
          <p className="text-sm text-[#2c7865]/80 font-medium">
            {isBn ? 'আপনার অ্যাকাউন্টে সহজে প্রবেশ করুন' : 'Sign in to your account'}
          </p>
        </div>

        {/* 1. Google One-Click Sign In (Priority) */}
        <div className="space-y-3">
          <GoogleSignInButton mode="signin" />
          
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0">
              {isBn ? 'অথবা মোবাইল ও পাসওয়ার্ড দিয়ে' : 'Or with Mobile & Password'}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* 2. Direct Mobile + Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            id="phone"
            type="text"
            label={isBn ? 'মোবাইল নম্বর' : 'Mobile Number'}
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

          <Button type="submit" isLoading={isLoading} className="w-full skeuo-btn-dark py-3.5 text-sm font-bold cursor-pointer">
            <span>{isBn ? 'লগইন করুন' : 'Log In'}</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        {/* Footer Registration Links */}
        <div className="pt-4 border-t border-[#2c7865]/20 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <Link
            href="/register"
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#2c7865]/30 bg-[#fefded] text-[#2c7865] hover:bg-[#2c7865] hover:text-[#fefded] font-bold transition-all shadow-xs text-center"
          >
            <User className="h-4 w-4 shrink-0" />
            <span>{isBn ? 'নতুন অ্যাকাউন্ট খুলুন (রেজিস্ট্রেশন)' : 'Create New Account'}</span>
          </Link>
        </div>
      </Card>
    </div>
  )
}
