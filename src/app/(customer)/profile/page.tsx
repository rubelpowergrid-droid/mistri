'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  User, Phone, MapPin, Calendar, Heart, Shield, 
  Settings, LogOut, ChevronRight, Globe, Wrench, 
  CheckCircle2, HelpCircle, Bell, ArrowLeft, Camera 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toBanglaNumber } from '@/lib/utils'

export default function CustomerProfilePage() {
  const router = useRouter()
  const { lang, setLanguage } = useI18n()
  const isBn = lang === 'bn'

  const [user, setUser] = useState({
    name: 'সম্মানিত গ্রাহক',
    phone: '01722092804',
    district: 'ঠাকুরগাঁও',
    upazila: 'ঠাকুরগাঁও সদর',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    totalBookings: 3,
    activeBookings: 1,
    favoritesCount: 2,
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mistri_user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (parsed.role === 'mistri') {
            router.replace('/mistri/profile')
            return
          }
          if (parsed.name) {
            setUser(prev => ({ 
              ...prev, 
              name: parsed.name, 
              phone: parsed.phone || prev.phone 
            }))
          }
        } catch {}
      }
    }
  }, [router])

  const handleLogout = () => {
    if (confirm(isBn ? 'আপনি কি অ্যাকাউন্ট থেকে লগআউট করতে চান?' : 'Do you want to log out?')) {
      router.push('/login')
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6 pb-24 sm:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isBn ? 'পেছনে ফিরুন' : 'Back'}</span>
        </button>

        <h1 className="text-base font-black text-slate-900">
          {isBn ? 'আমার প্রোফাইল' : 'My Profile'}
        </h1>

        <div className="w-10"></div>
      </div>

      {/* Main Profile Card */}
      <Card className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden border-slate-700">
        <div className="absolute top-0 right-0 w-44 h-44 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-blue-500/50 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-white">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-lg font-black tracking-tight">{user.name}</h2>
              <Badge variant="primary" className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-[10px] w-fit mx-auto sm:mx-0">
                🛡️ ভেরিফাইড গ্রাহক
              </Badge>
            </div>

            <p className="text-xs text-slate-300 font-mono flex items-center justify-center sm:justify-start gap-1">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span>{user.phone}</span>
            </p>

            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{user.district}, {user.upazila}</span>
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-700/60 text-center">
          <div>
            <span className="text-lg font-black text-white block">{toBanglaNumber(user.totalBookings)}</span>
            <span className="text-[11px] text-slate-400">{isBn ? 'মোট বুকিং' : 'Bookings'}</span>
          </div>
          <div>
            <span className="text-lg font-black text-emerald-400 block">{toBanglaNumber(user.activeBookings)}</span>
            <span className="text-[11px] text-slate-400">{isBn ? 'চলমান সেবা' : 'Active'}</span>
          </div>
          <div>
            <span className="text-lg font-black text-amber-400 block">{toBanglaNumber(user.favoritesCount)}</span>
            <span className="text-[11px] text-slate-400">{isBn ? 'পছন্দের মিস্ত্রী' : 'Favorites'}</span>
          </div>
        </div>
      </Card>

      {/* Navigation Options Group 1: Bookings & Activity */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          {isBn ? 'আমার কার্যক্রম' : 'My Activity'}
        </span>

        <Card className="divide-y divide-slate-100 overflow-hidden border-slate-200">
          <Link
            href="/bookings"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{isBn ? 'আমার বুকিং ও ট্র্যাকিং' : 'My Bookings'}</span>
                <span className="text-[11px] text-slate-500">{isBn ? 'পূর্বের ও বর্তমান বুকিং ট্র্যাক করুন' : 'Track your service orders'}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>

          <Link
            href="/favorites"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{isBn ? 'সংরক্ষিত মিস্ত্রী তালিকা' : 'Saved Mistris'}</span>
                <span className="text-[11px] text-slate-500">{isBn ? 'পছন্দ করা মিস্ত্রীদের তালিকা' : 'View your favorite professionals'}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
        </Card>
      </div>

      {/* Navigation Options Group 2: Work as Mistri & Admin */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          {isBn ? 'পেশাদার ও অ্যাডমিন' : 'Professional & Admin'}
        </span>

        <Card className="divide-y divide-slate-100 overflow-hidden border-slate-200">
          <Link
            href="/onboarding"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{isBn ? 'মিস্ত্রী হিসেবে যোগ দিন' : 'Register as a Mistri'}</span>
                <span className="text-[11px] text-slate-500">{isBn ? 'কাজ পেতে এনআইডি দিয়ে আবেদন করুন' : 'Offer your services and get jobs'}</span>
              </div>
            </div>
            <Badge variant="warning" className="text-[10px] py-0.5 font-bold">
              {isBn ? 'আবেদন করুন' : 'Join'}
            </Badge>
          </Link>

          <Link
            href="/admin/dashboard"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{isBn ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal'}</span>
                <span className="text-[11px] text-slate-500">{isBn ? 'ভেরিফিকেশন, ক্যাটাগরি ও কন্ট্রোল ড্যাশবোর্ড' : 'Verification & control center'}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
        </Card>
      </div>

      {/* Navigation Options Group 3: Settings & Logout */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          {isBn ? 'সেটিংস ও সহায়তা' : 'Settings & Support'}
        </span>

        <Card className="divide-y divide-slate-100 overflow-hidden border-slate-200">
          <button
            onClick={() => setLanguage(lang === 'bn' ? 'en' : 'bn')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{isBn ? 'অ্যাপের ভাষা (Language)' : 'App Language'}</span>
                <span className="text-[11px] text-slate-500">{lang === 'bn' ? 'বাংলা (বর্তমান)' : 'English (Current)'}</span>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
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
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{isBn ? 'কাস্টমার সাপোর্ট ও হেল্পলাইন' : 'Help & Support'}</span>
                <span className="text-[11px] text-slate-500">{isBn ? 'WhatsApp-এ সার্বক্ষণিক সহায়তা' : 'Instant WhatsApp support'}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50/50 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-red-600 block">{isBn ? 'লগআউট করুন' : 'Log Out'}</span>
                <span className="text-[11px] text-slate-400">{isBn ? 'অ্যাকাউন্ট থেকে প্রস্থান করুন' : 'Sign out of this session'}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-red-400" />
          </button>
        </Card>
      </div>
    </div>
  )
}

