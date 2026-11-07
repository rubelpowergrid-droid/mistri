'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Calendar, Search, Filter, Clock, CheckCircle2, AlertCircle, Eye, MapPin } from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toBanglaNumber, formatBDT } from '@/lib/utils'

export default function AdminBookingsPage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [searchQuery, setSearchQuery] = useState('')

  const bookings = [
    {
      id: 'b-01',
      bookingNumber: 'MST-261107-ABOD',
      mistriName: 'মোঃ রফিকুল ইসলাম',
      customerName: 'মোঃ মাসুদ রানা',
      customerPhone: '01722092804',
      serviceName: 'বাসা-বাড়ির ওয়্যারিং ও ডিবি মেরামত',
      location: 'পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
      amount: 500,
      status: 'completed',
      date: '২০২৬-১১-০৭',
    },
    {
      id: 'b-02',
      bookingNumber: 'MST-261104-KP12',
      mistriName: 'আব্দুল করিম',
      customerName: 'আহমেদ জুবায়ের',
      customerPhone: '01711223344',
      serviceName: 'পানির মোটর ও পাম্প মেরামত',
      location: 'পীরগঞ্জ বাজার রোড, ঠাকুরগাঁও',
      amount: 350,
      status: 'in_progress',
      date: '২০২৬-১১-০৪',
    },
    {
      id: 'b-03',
      bookingNumber: 'MST-261028-XY89',
      mistriName: 'তরিকুল হাসান',
      customerName: 'ফারহানা চৌধুরী',
      customerPhone: '01899887766',
      serviceName: 'টাইলস ও ফ্লোর ফিটিংস',
      location: 'কলেজ রোড, পঞ্চগড়',
      amount: 1200,
      status: 'completed',
      date: '২০২৬-১০-২৮',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isBn ? 'সকল বুকিং ও ডিসপিউট ট্র্যাকিং' : 'Bookings & Dispute Tracking'}
            </h1>
            <Badge variant="primary" className="px-2 py-0.5 text-xs font-bold">
              {toBanglaNumber(bookings.length)} টি বুকিং
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isBn ? 'কাস্টমার ও মিস্ত্রির মধ্যকার সকল সেবা অনুরোধের রিয়েল-টাইম অবস্থা।' : 'Live status of all service bookings.'}
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">বুকিং নম্বর</th>
                <th className="py-3.5 px-4">মিস্ত্রী</th>
                <th className="py-3.5 px-4">গ্রাহক</th>
                <th className="py-3.5 px-4">সেবা ও ঠিকানা</th>
                <th className="py-3.5 px-4">মূল্য</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{b.bookingNumber}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{b.mistriName}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold block">{b.customerName}</span>
                    <span className="font-mono text-[11px] text-slate-500">{b.customerPhone}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="block font-medium">{b.serviceName}</span>
                    <span className="text-[11px] text-slate-400">{b.location}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{formatBDT(b.amount)}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={b.status === 'completed' ? 'success' : 'primary'} className="text-[10px]">
                      {b.status === 'completed' ? '✓ সম্পন্ন' : 'সক্রিয়'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
