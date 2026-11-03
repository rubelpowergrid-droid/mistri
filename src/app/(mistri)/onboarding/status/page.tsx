'use client'

import React from 'react'
import Link from 'next/link'
import { Clock, ShieldCheck, CheckCircle2, ArrowRight, Phone, MessageSquare } from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function MistriStatusPage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-lg border-slate-200 text-center">
        {/* Status Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
          <Clock className="h-8 w-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <Badge variant="warning" className="px-3 py-1 text-xs">
            {isBn ? '⏳ আবেদন পর্যালোচনাধীন (Under Review)' : '⏳ Application Under Review'}
          </Badge>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isBn ? 'আপনার আবেদনটি পর্যালোচনার জন্য জমা হয়েছে' : 'Your Application is Being Reviewed'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {isBn 
              ? 'অ্যাডমিন টিম আপনার জাতীয় পরিচয়পত্র (NID) ও প্রদত্ত তথ্য যাচাই করছে। যাচাই সম্পন্ন হলে আপনার প্রোফাইল কাস্টমারদের নিকট দৃশ্যমান হবে।'
              : 'Our admin team is verifying your submitted NID and credentials. You will be activated upon approval.'}
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-left space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{isBn ? 'আবেদন জমা সম্পন্ন' : 'Application Submitted'}</p>
              <p className="text-[11px] text-slate-500">{isBn ? 'প্রয়োজনীয় সকল তথ্য ও NID আপলোড হয়েছে' : 'All details and documents received'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{isBn ? 'অ্যাডমিন এনআইডি যাচাইকরণ' : 'Admin Document Review'}</p>
              <p className="text-[11px] text-amber-700 font-medium">{isBn ? 'বর্তমানে প্রক্রিয়াধীন রয়েছে (সর্বোচ্চ ২৪ ঘণ্টা)' : 'In progress (Up to 24 hours)'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 opacity-50">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-700 text-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{isBn ? 'প্রোফাইল লাইভ ও কাজ শুরু' : 'Profile Live & Accepting Bookings'}</p>
              <p className="text-[11px] text-slate-500">{isBn ? 'অনুমোদনের পর কাস্টমার বুকিং সক্রিয় হবে' : 'Active once verified'}</p>
            </div>
          </div>
        </div>

        {/* Support hotline */}
        <div className="rounded-xl bg-blue-50/70 p-3 text-xs text-blue-800 flex items-center justify-between border border-blue-100">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="font-semibold">{isBn ? 'সাহায্যের জন্য হেল্পলাইন:' : 'Support Helpline:'}</span>
          </div>
          <span className="font-bold text-blue-700">০১৭০০-০০০০০০</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full text-xs">
              {isBn ? 'হোমপেজে ফিরুন' : 'Back to Home'}
            </Button>
          </Link>
          <Link href="/admin/verification" className="flex-1">
            <Button className="w-full text-xs bg-slate-900 hover:bg-slate-800">
              <span>{isBn ? 'অ্যাডমিন ডেস্কে দেখুন' : 'View in Admin Queue'}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

