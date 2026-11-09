'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Phone, Lock, Wrench, Shield, ArrowRight } from 'lucide-react'
import { useI18n } from '@/locales'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DEFAULT_DISTRICTS, DistrictOption, getUpazilasForDistrict } from '@/lib/locations'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') === 'mistri' ? 'mistri' : 'customer'
  const { lang, t } = useI18n()
  const isBn = lang === 'bn'

  const [role, setRole] = useState<'customer' | 'mistri'>(initialRole)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [districtsList, setDistrictsList] = useState<DistrictOption[]>(DEFAULT_DISTRICTS)
  const [district, setDistrict] = useState('Thakurgaon')
  const [upazila, setUpazila] = useState('Thakurgaon Sadar')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
    if (!fullName || !phone || !password) {
      setError(isBn ? 'সবগুলো প্রয়োজনীয় তথ্য পূরণ করুন' : 'Please fill all required fields')
      return
    }

    if (phone.length < 11) {
      setError(isBn ? 'সঠিক ১১-সংখ্যার মোবাইল নম্বর দিন' : 'Enter a valid 11-digit phone number')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      if (role === 'mistri') {
        router.push('/onboarding')
      } else {
        router.push('/verify-otp?phone=' + encodeURIComponent(phone))
      }
    }, 800)
  }

  return (
    <Card className="w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-lg border-slate-200">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          mistri<span className="text-blue-600">.</span> {t('auth.register')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {isBn ? 'নতুন অ্যাকাউন্ট খুলে সেবা গ্রহণ বা প্রদান শুরু করুন' : 'Create an account to book or provide skilled services'}
        </p>
      </div>

      {/* Role Toggle */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">
          {t('auth.select_account_type')}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
              role === 'customer'
                ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-600/20 shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <User className={`h-6 w-6 mb-1 ${role === 'customer' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="text-xs font-bold">{isBn ? 'গ্রাহক (Customer)' : 'Customer'}</span>
            <span className="text-[10px] text-slate-500 mt-0.5">{isBn ? 'সেবা নিতে চাই' : 'I need service'}</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('mistri')}
            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
              role === 'mistri'
                ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-600/20 shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Wrench className={`h-6 w-6 mb-1 ${role === 'mistri' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="text-xs font-bold">{isBn ? 'মিস্ত্রী (Mistri)' : 'Mistri Worker'}</span>
            <span className="text-[10px] text-slate-500 mt-0.5">{isBn ? 'কাজ করতে চাই' : 'I want to work'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <Input
          id="fullName"
          label={isBn ? 'আপনার পূর্ণ নাম' : 'Full Name'}
          placeholder={isBn ? 'যেমন: মোঃ রফিকুল ইসলাম' : 'e.g. John Doe'}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User className="h-4 w-4" />}
          required
        />

        <Input
          id="phone"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={11}
          label={isBn ? 'মোবাইল নম্বর (ইংরেজীতে)' : 'Mobile Number (English)'}
          placeholder="01XXXXXXXXX"
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
            <label className="text-xs font-semibold text-slate-700">
              {t('locations.select_district')}
            </label>
            <select
              value={district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              {districtsList.map((d) => (
                <option key={d.id} value={d.name_en}>
                  {isBn ? d.name_bn : d.name_en}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              {t('locations.select_upazila')}
            </label>
            <select
              value={upazila}
              onChange={(e) => setUpazila(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
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
          <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200/80 flex items-start gap-2">
            <Shield className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              {isBn
                ? 'মিস্ত্রী অ্যাকাউন্ট চালুর জন্য পরবর্তী ধাপে আপনার জাতীয় পরিচয়পত্র (NID) ও দক্ষতার তথ্য জমা দিতে হবে।'
                : 'To activate your Mistri account, you will provide your NID document and skill categories in the next step.'}
            </span>
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full py-3 text-sm font-semibold">
          <span>{role === 'mistri' ? (isBn ? 'পরবর্তী ধাপে যান' : 'Continue to Onboarding') : t('auth.register')}</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-500">
        <span>{isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}</span>
        <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4">
          {t('auth.login')}
        </Link>
      </div>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <Suspense fallback={<div className="text-center p-8 text-sm text-slate-500">লোড হচ্ছে...</div>}>
        <RegisterContent />
      </Suspense>
    </div>
  )
}
