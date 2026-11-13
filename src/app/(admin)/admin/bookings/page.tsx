'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Search, Filter, Clock, CheckCircle2, AlertCircle, Eye, MapPin, RefreshCw, FileText } from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toBanglaNumber, formatBDT } from '@/lib/utils'
import { AdminBookingSummaryModal } from '@/components/admin/admin-booking-summary-modal'
import { BookingTimelineData } from '@/components/bookings/booking-history-timeline'

interface BookingItem extends BookingTimelineData {
  id: string
  bookingNumber: string
  mistriName: string
  customerName: string
  customerPhone: string
  serviceName: string
  location: string
  amount: number
  status: string
  date: string
}

export default function AdminBookingsPage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/bookings', { cache: 'no-store' })
      const data = await res.json()
      if (data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings)
      }
    } catch (err) {
      console.error('Failed to load admin bookings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      (b.bookingNumber || '').toLowerCase().includes(q) ||
      (b.mistriName || '').toLowerCase().includes(q) ||
      (b.customerName || '').toLowerCase().includes(q) ||
      (b.customerPhone || '').includes(searchQuery) ||
      (b.serviceName || '').toLowerCase().includes(q)

    let matchesStatus = true
    if (statusFilter === 'completed') {
      matchesStatus = b.status === 'completed' || b.status === 'accepted'
    } else if (statusFilter === 'in_progress') {
      matchesStatus = b.status === 'in_progress' || b.status === 'pending'
    } else if (statusFilter === 'rejected') {
      matchesStatus = b.status === 'rejected' || b.status === 'cancelled'
    }

    return matchesSearch && matchesStatus
  })

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

        <Button
          variant="outline"
          size="sm"
          onClick={fetchBookings}
          disabled={isLoading}
          className="self-start sm:self-auto gap-1 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <Input
            id="searchBookings"
            placeholder={isBn ? 'বুকিং নম্বর, গ্রাহক বা মিস্ত্রির নাম...' : 'Search by booking #, user...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          >
            <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
            <option value="completed">{isBn ? 'সম্পন্ন / অনুমোদিত' : 'Completed'}</option>
            <option value="in_progress">{isBn ? 'চলমান / অপেক্ষমাণ' : 'In Progress'}</option>
            <option value="rejected">{isBn ? 'বাতিল' : 'Rejected'}</option>
          </select>
        </div>
      </Card>

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
                <th className="py-3.5 px-4 text-center">অ্যাকশন ও সামারি</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                      <span>{isBn ? 'বুকিং ডাটা লোড হচ্ছে...' : 'Loading bookings...'}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {isBn ? 'কোনো বুকিং পাওয়া যায়নি' : 'No bookings found'}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr 
                    key={b.id} 
                    onClick={() => setSelectedBooking(b)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
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
                      <Badge 
                        variant={b.status === 'completed' || b.status === 'accepted' ? 'success' : b.status === 'rejected' ? 'danger' : 'primary'} 
                        className="text-[10px]"
                      >
                        {b.status === 'completed' 
                          ? '✓ সম্পন্ন' 
                          : b.status === 'accepted' 
                          ? 'অনুমোদিত' 
                          : b.status === 'rejected' 
                          ? '✕ বাতিল' 
                          : b.status === 'in_progress'
                          ? 'চলমান'
                          : 'অপেক্ষমাণ'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedBooking(b)
                        }}
                        className="text-[11px] font-bold h-7 px-2.5 bg-white group-hover:bg-[#2c7865] group-hover:text-white transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        <span>সামারি ও টাইমলাইন</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Admin Booking Summary & Full Timeline Modal */}
      <AdminBookingSummaryModal
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  )
}
