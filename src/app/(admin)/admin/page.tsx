'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Phone, Lock, ArrowRight, AlertCircle, Loader2, KeyRound } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getStoredUser, setStoredUser } from '@/lib/auth-client'

export default function AdminIndexPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // 1. If already authenticated as admin, jump straight to dashboard
  useEffect(() => {
    const user = getStoredUser()
    if (user && user.role === 'admin') {
      router.replace('/admin/dashboard')
    } else {
      setIsCheckingSession(false)
    }
  }, [router])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const cleanPhone = phone.replace(/[^0-9]/g, '')

    if (!cleanPhone || cleanPhone.length < 11) {
      setError('সঠিক ১১-সংখ্যার অ্যাডমিন মোবাইল নম্বর দিন')
      return
    }

    if (!password) {
      setError('অ্যাডমিন পাসওয়ার্ড লিখুন')
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
        if (data.role === 'admin' || data.user.role === 'admin') {
          setStoredUser(data.user)
          router.replace('/admin/dashboard')
        } else {
          setError('এই অ্যাকাউন্টটিতে অ্যাডমিন অনুমতি নেই। সঠিক অ্যাডমিন আইডি ব্যবহার করুন।')
        }
      } else {
        setError(data.error || 'ভুল মোবাইল নম্বর বা পাসওয়ার্ড! পুনরায় চেষ্টা করুন।')
      }
    } catch {
      setIsLoading(false)
      setError('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। পুনরায় চেষ্টা করুন।')
    }
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-stone-500 text-xs">
          <Loader2 className="h-6 w-6 animate-spin text-[#2c7865]" />
          <span>অ্যাডমিন সেশন যাচাই করা হচ্ছে...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white border-2 border-stone-300 rounded-3xl shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#14382f] text-white shadow-lg">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            mistri24 অ্যাডমিন পোর্টালে প্রবেশ
          </h1>
          <p className="text-xs text-stone-500">
            মোবাইল নম্বর ও সিকিউর পাসওয়ার্ড দিয়ে অ্যাডমিনে লগইন করুন
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800">
              অ্যাডমিন মোবাইল নম্বর (লগইন আইডি)
            </label>
            <Input
              id="adminPhone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={11}
              placeholder="017XXXXXXXX"
              value={phone}
              onChange={(e) => {
                const converted = e.target.value.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString())
                setPhone(converted.replace(/[^0-9]/g, '').slice(0, 11))
              }}
              leftIcon={<Phone className="h-4 w-4 text-stone-400" />}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800">
              অ্যাডমিন পাসওয়ার্ড
            </label>
            <Input
              id="adminPassword"
              type="password"
              placeholder="পাসওয়ার্ড লিখুন"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4 text-stone-400" />}
              required
            />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full bg-[#14382f] hover:bg-[#1e5548] text-white py-3.5 text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <KeyRound className="h-4 w-4 text-amber-300" />
            <span>অ্যাডমিন প্যানেলে প্রবেশ করুন</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="pt-3 border-t border-stone-200 text-center text-[11px] text-stone-500 flex items-center justify-between">
          <Link href="/" className="hover:underline font-semibold">
            ← মূল সাইটে ফিরুন
          </Link>
          <span className="font-mono text-stone-400">mistri24 Admin v2.0</span>
        </div>
      </Card>
    </div>
  )
}
