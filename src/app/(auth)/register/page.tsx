'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Phone, Lock, Wrench, Shield, ArrowRight } from 'lucide-react'
import { useI18n } from '@/locales'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { DEFAULT_DISTRICTS, DistrictOption, getUpazilasForDistrict } from '@/lib/locations'

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
  const [password, setPassword] = useState('')
  const [districtsList, setDistrictsList] = useState<DistrictOption[]>(DEFAULT_DISTRICTS)
  const [district, setDistrict] = useState('Thakurgaon')
  const [upazila, setUpazila] = useState('Thakurgaon Sadar')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  React.useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'mistri') {
      router.replace('/onboarding')
    } else if (roleParam === 'customer') {
      setRole('customer')
    }
  }, [searchParams, router])

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

  const availableUpazilas = getUpazilasForDistrict(district, districtsList)

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist)
    const newUpList = getUpazilasForDistrict(newDist, districtsList)
    if (newUpList && newUpList.length > 0) {
      setUpazila(newUpList[0].name_en || newUpList[0].name_bn)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const cleanPhone = phone.replace(/[^0-9]/g, '')

    if (!fullName || !cleanPhone) {
      setError(isBn ? 'নাম ও মোবাইল নম্বর পূরণ করুন' : 'Provide full name and phone')
      return
    }

    if (cleanPhone.length < 11) {
      setError(isBn ? 'সঠিক ১১-সংখ্যার মোবাইল নম্বর দিন' : 'Enter a valid 11-digit phone number')
      return
    }

    if (!password || password.length < 4) {
      setError(isBn ? 'কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড দিন' : 'Password must be at least 4 characters')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          fatherName: fatherName.trim(),
          phone: cleanPhone,
          password,
          role,
          district,
          upazila,
        }),
      })

      const data = await res.json()
      setIsLoading(false)

      if (data.success) {
        if (typeof window !== 'undefined' && data.user) {
          localStorage.setItem('mistri_user', JSON.stringify(data.user))
          window.dispatchEvent(new Event('mistri_auth_changed'))
        }
        router.push(data.redirectUrl || (role === 'mistri' ? '/onboarding' : '/'))
      } else {
        setError(data.error || (isBn ? 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে' : 'Failed to register'))
      }
    } catch {
      setIsLoading(false)
      setError(isBn ? 'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি' : 'Server connection failed')
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

      {/* Role Toggle in Black & White Skeuomorphism */}
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
            onClick={() => router.push('/onboarding')}
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

      {/* Google Quick Sign-Up */}
      <div className="space-y-3">
        <GoogleSignInButton mode="signup" role={role} />
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-[#fdfbf7] px-3 text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0">
            {isBn ? 'অথবা তথ্য পূরণ করে' : 'Or with Form'}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-stone-100 p-3 text-xs font-medium text-red-600 border border-stone-300">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Full Name & Father Name */}
        <div className="space-y-4">
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
        </div>

        <Input
          id="phone"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={11}
          label={isBn ? 'মোবাইল নম্বর (ইংরেজীতে)' : 'Mobile Number (English)'}
          placeholder="017XXXXXXXX"
          value={phone}
          onChange={(e) => {
            const converted = e.target.value.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString())
            setPhone(converted.replace(/[^0-9]/g, '').slice(0, 11))
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
          <div className="rounded-2xl bg-stone-100 p-3.5 text-xs text-stone-800 border border-stone-300 flex items-start gap-2.5">
            <Shield className="h-4 w-4 shrink-0 mt-0.5 text-stone-900" />
            <span>
              {isBn
                ? 'মিস্ত্রী অ্যাকাউন্ট চালুর জন্য পরবর্তী ধাপে আপনার জাতীয় পরিচয়পত্র (NID) ও দক্ষতার তথ্য জমা দিতে হবে।'
                : 'To activate your Mistri account, you will provide your NID document and skill categories in the next step.'}
            </span>
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full skeuo-btn-dark py-3.5 text-sm font-bold cursor-pointer">
          <span>{role === 'mistri' ? (isBn ? 'পরবর্তী ধাপে যান' : 'Continue to Onboarding') : t('auth.register')}</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </form>

      <div className="pt-2 text-center text-xs text-stone-600">
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
