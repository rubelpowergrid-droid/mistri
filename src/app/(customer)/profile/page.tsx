'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  User, Phone, MapPin, Calendar, Heart, Shield, 
  Settings, LogOut, ChevronRight, Globe, Wrench, 
  CheckCircle2, HelpCircle, ArrowLeft, LogIn, Printer 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toBanglaNumber } from '@/lib/utils'
import { getStoredUser, clearStoredUser, UserSession } from '@/lib/auth-client'

export default function CustomerProfilePage() {
  const router = useRouter()
  const { lang, setLanguage } = useI18n()
  const isBn = lang === 'bn'

  const [session, setSession] = useState<UserSession | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const user = getStoredUser()
    setSession(user)
    setIsLoaded(true)

    if (user?.role === 'mistri') {
      router.replace('/mistri/profile')
    }
  }, [router])

  const handleLogout = () => {
    if (confirm(isBn ? 'আপনি কি অ্যাকাউন্ট থেকে লগআউট করতে চান?' : 'Do you want to log out?')) {
      clearStoredUser()
      setSession(null)
      router.push('/login')
    }
  }

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-xs font-bold text-slate-500">
        লোড হচ্ছে...
      </div>
    )
  }

  // If user is logged out, show honest clean state - NOT a fake profile!
  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 space-y-6">
        <Card className="p-8 text-center space-y-5 border-[#dcd6b8] shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-[#38967f] via-[#2c7865] to-[#1e5548] text-[#fefded] shadow-lg border-t border-[#fefded]/30">
            <User className="h-8 w-8 text-[#fefded]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-[#2c7865] tracking-tight">
              {isBn ? 'প্রোফাইলে প্রবেশ করুন' : 'Sign in to Profile'}
            </h1>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {isBn 
                ? 'আপনি বর্তমানে লগআউট অবস্থায় আছেন। আপনার বুকিং ইতিহাস, ফেভারিট মিস্ত্রী ও ব্যক্তিগত প্রোফাইল দেখতে অনুগ্রহ করে লগইন করুন।'
                : 'You are currently signed out. Please log in to view your bookings and personal profile.'}
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link href="/login" className="block w-full">
              <Button size="lg" className="w-full text-xs font-bold">
                <LogIn className="h-4 w-4 mr-2" />
                <span>{isBn ? 'লগইন করুন' : 'Log In'}</span>
              </Button>
            </Link>

            <Link href="/onboarding" className="block w-full">
              <Button variant="outline" size="md" className="w-full text-xs font-bold">
                <Wrench className="h-4 w-4 mr-2" />
                <span>{isBn ? 'নতুন মিস্ত্রী হিসেবে যুক্ত হন' : 'Join as a Mistri'}</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6 pb-24 sm:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => router.back()}
          className="skeuo-btn-light flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isBn ? 'পেছনে ফিরুন' : 'Back'}</span>
        </button>

        <h1 className="text-base font-black text-[#2c7865]">
          {isBn ? 'আমার গ্রাহক প্রোফাইল' : 'My Customer Profile'}
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="skeuo-btn-light flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#2c7865] cursor-pointer"
            title={isBn ? 'প্রোফাইল প্রিন্ট করুন' : 'Print Profile'}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>{isBn ? 'প্রিন্ট' : 'Print'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="skeuo-btn-light flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-700 hover:text-red-900 border-red-200 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{isBn ? 'লগআউট' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* Official Print Header */}
      <div className="hidden print:block border-b-2 border-stone-800 pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-black">mistri. গ্রাহক একাউন্ট বিবরণী</h1>
            <p className="text-xs text-stone-700">কাস্টমার রেজিস্টার্ড প্রোফাইল ও বুকিং পরিচিতি</p>
          </div>
          <div className="text-right text-[11px] font-mono text-stone-800">
            <p>তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
            <p>গ্রাহক মোবাইল: {session.phone}</p>
          </div>
        </div>
      </div>

      {/* Main Profile Card - #2c7865 & #fefded Skeuomorphic */}
      <div className="skeuo-surface-dark p-6 sm:p-7 relative overflow-hidden text-[#fefded]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-b from-[#38967f] via-[#2c7865] to-[#1e5548] border-2 border-[#fefded]/40 flex items-center justify-center text-[#fefded] shadow-xl">
              <User className="h-10 w-10 text-[#fefded]" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#2c7865] border border-[#fefded]/40 flex items-center justify-center text-[#fefded] shadow-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#fefded]" />
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-black tracking-tight text-[#fefded]">{session.name || 'সম্মানিত গ্রাহক'}</h2>
              <Badge variant="primary" className="text-[10px] w-fit mx-auto sm:mx-0 bg-[#1e5548] text-[#fefded] border-[#38967f]">
                🛡️ সক্রিয় গ্রাহক
              </Badge>
            </div>

            <p className="text-xs text-[#fefded]/90 font-mono flex items-center justify-center sm:justify-start gap-1.5 font-bold">
              <Phone className="h-3.5 w-3.5 text-[#fefded]/70" />
              <span>{session.phone}</span>
            </p>

            <p className="text-xs text-[#fefded]/80 flex items-center justify-center sm:justify-start gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#fefded]/70" />
              <span>ঠাকুরগাঁও, বাংলাদেশ</span>
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#38967f]/30 text-center">
          <div>
            <span className="text-lg font-black text-[#fefded] block">{toBanglaNumber(3)}</span>
            <span className="text-[11px] text-[#fefded]/70 font-bold">{isBn ? 'মোট বুকিং' : 'Bookings'}</span>
          </div>
          <div>
            <span className="text-lg font-black text-[#fefded] block">{toBanglaNumber(1)}</span>
            <span className="text-[11px] text-[#fefded]/70 font-bold">{isBn ? 'চলমান সেবা' : 'Active'}</span>
          </div>
          <div>
            <span className="text-lg font-black text-[#fefded] block">{toBanglaNumber(2)}</span>
            <span className="text-[11px] text-[#fefded]/70 font-bold">{isBn ? 'পছন্দের মিস্ত্রী' : 'Favorites'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Options Group 1: Bookings & Activity */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#2c7865] uppercase tracking-wider px-1">
          {isBn ? 'আমার কার্যক্রম' : 'My Activity'}
        </span>

        <Card className="divide-y divide-[#dcd6b8] p-0 overflow-hidden">
          <Link
            href="/bookings"
            className="flex items-center justify-between p-4 hover:bg-[#f4f0d6]/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-[#38967f] via-[#2c7865] to-[#1e5548] text-[#fefded] flex items-center justify-center shadow-xs">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-black block">{isBn ? 'আমার বুকিং ও সার্ভিস ট্র্যাক' : 'My Bookings'}</span>
                <span className="text-[11px] text-slate-500 font-medium">{isBn ? 'পূর্বের ও বর্তমান বুকিং বাতিল বা ট্র্যাক করুন' : 'Track or cancel your service orders'}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </Link>

          <Link
            href="/favorites"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-stone-800 to-black text-white flex items-center justify-center shadow-xs">
                <Heart className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-black block">{isBn ? 'সংরক্ষিত মিস্ত্রী তালিকা' : 'Saved Mistris'}</span>
                <span className="text-[11px] text-slate-500 font-medium">{isBn ? 'পছন্দ করা বিশ্বস্ত কারিগরদের তালিকা' : 'View your favorite professionals'}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </Link>
        </Card>
      </div>

      {/* Navigation Options Group 2: Work as Mistri & Admin */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
          {isBn ? 'পেশাদার ও অ্যাডমিন' : 'Professional & Admin'}
        </span>

        <Card className="divide-y divide-slate-200/80 p-0 overflow-hidden">
          <Link
            href="/onboarding"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-stone-800 to-black text-white flex items-center justify-center shadow-xs">
                <Wrench className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-black block">{isBn ? 'মিস্ত্রী হিসেবে যোগ দিন' : 'Register as a Mistri'}</span>
                <span className="text-[11px] text-slate-500 font-medium">{isBn ? 'কাজ পেতে এনআইডি দিয়ে আবেদন করুন' : 'Offer your services and get jobs'}</span>
              </div>
            </div>
            <Badge variant="primary" className="text-[10px]">
              {isBn ? 'আবেদন করুন' : 'Join'}
            </Badge>
          </Link>

          <Link
            href="/admin/dashboard"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-stone-800 to-black text-white flex items-center justify-center shadow-xs">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-black block">{isBn ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal'}</span>
                <span className="text-[11px] text-slate-500 font-medium">{isBn ? 'ভেরিফিকেশন ও সিস্টেম ওভারভিউ' : 'Verification & control center'}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </Link>
        </Card>
      </div>

      {/* Navigation Options Group 3: Settings & Logout */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
          {isBn ? 'সেটিংস ও সহায়তা' : 'Settings & Support'}
        </span>

        <Card className="divide-y divide-slate-200/80 p-0 overflow-hidden">
          <button
            onClick={() => setLanguage(lang === 'bn' ? 'en' : 'bn')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center font-bold">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-black block">{isBn ? 'অ্যাপের ভাষা (Language)' : 'App Language'}</span>
                <span className="text-[11px] text-slate-500 font-medium">{lang === 'bn' ? 'বাংলা (বর্তমান)' : 'English (Current)'}</span>
              </div>
            </div>
            <span className="skeuo-pill px-2.5 py-1 text-xs font-bold bg-white text-black">
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </span>
          </button>

          <a
            href="https://wa.me/8801722092804"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-black block">{isBn ? 'কাস্টমার সাপোর্ট ও হেল্পলাইন' : 'Help & Support'}</span>
                <span className="text-[11px] text-slate-500 font-medium">{isBn ? 'WhatsApp-এ সার্বক্ষণিক সহায়তা' : 'Instant WhatsApp support'}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50/60 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <LogOut className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-red-700 block">{isBn ? 'লগআউট করুন' : 'Log Out'}</span>
                <span className="text-[11px] text-slate-500 font-medium">{isBn ? 'অ্যাকাউন্ট থেকে সম্পূর্ণ প্রস্থান করুন' : 'Sign out of this session'}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-red-500" />
          </button>
        </Card>
      </div>
    </div>
  )
}
