'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, Search, Filter, Phone, MapPin, Calendar, 
  CheckCircle2, ArrowLeft, Star, ShoppingBag, RefreshCw 
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toBanglaNumber } from '@/lib/utils'

interface CustomerItem {
  id: string
  name: string
  phone: string
  district: string
  upazila: string
  address: string
  totalBookings: number
  lastBookingDate: string
  status: 'active' | 'inactive'
  avatar: string
}

export default function AdminCustomersPage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [searchQuery, setSearchQuery] = useState('')
  const [districtFilter, setDistrictFilter] = useState('all')
  const [customersList, setCustomersList] = useState<CustomerItem[]>([])
  const [activeCount, setActiveCount] = useState(0)
  const [totalCompletedBookings, setTotalCompletedBookings] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCustomers = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/customers', { cache: 'no-store' })
      const data = await res.json()
      if (data.success && Array.isArray(data.customers)) {
        setCustomersList(data.customers)
        setActiveCount(typeof data.activeCustomers === 'number' ? data.activeCustomers : data.customers.length)
        setTotalCompletedBookings(typeof data.totalCompletedBookings === 'number' ? data.totalCompletedBookings : 0)
      }
    } catch (err) {
      console.error('Failed to load admin customers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const filteredCustomers = customersList.filter((c) => {
    const matchesSearch = 
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.phone || '').includes(searchQuery)
    const matchesDistrict = districtFilter === 'all' || (c.district || '').includes(districtFilter)
    return matchesSearch && matchesDistrict
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isBn ? 'নিবন্ধিত কাস্টমার তালিকা' : 'Registered Customers'}
            </h1>
            <Badge variant="primary" className="px-2 py-0.5 text-xs font-bold">
              {toBanglaNumber(customersList.length)} জন কাস্টমার
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isBn 
              ? 'প্ল্যাটফর্মে সেবা গ্রহণকারী সম্মানিত গ্রাহকগণের প্রোফাইল ও বুকিং তথ্য।' 
              : 'View all registered customers and their service booking history.'}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchCustomers}
          disabled={isLoading}
          className="self-start sm:self-auto gap-1 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200 bg-white flex items-center gap-3 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">মোট কাস্টমার</span>
            <span className="text-xl font-black text-slate-900">
              {isLoading ? '...' : `${toBanglaNumber(customersList.length)} জন`}
            </span>
          </div>
        </Card>

        <Card className="p-4 border-slate-200 bg-white flex items-center gap-3 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">সক্রিয় অ্যাকাউন্ট</span>
            <span className="text-xl font-black text-slate-900">
              {isLoading ? '...' : `${toBanglaNumber(activeCount)} জন (১০০%)`}
            </span>
          </div>
        </Card>

        <Card className="p-4 border-slate-200 bg-white flex items-center gap-3 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">মোট সম্পন্ন বুকিং</span>
            <span className="text-xl font-black text-slate-900">
              {isLoading ? '...' : `${toBanglaNumber(totalCompletedBookings)} টি`}
            </span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <Input
            id="searchCustomers"
            placeholder={isBn ? 'নাম বা মোবাইল নম্বর দিয়ে খুঁজুন...' : 'Search by name or phone...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-500 shrink-0" />
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          >
            <option value="all">{isBn ? 'সকল জেলা' : 'All Districts'}</option>
            <option value="ঠাকুরগাঁও">{isBn ? 'ঠাকুরগাঁও' : 'Thakurgaon'}</option>
            <option value="পঞ্চগড়">{isBn ? 'পঞ্চগড়' : 'Panchagarh'}</option>
            <option value="দিনাজপুর">{isBn ? 'দিনাজপুর' : 'Dinajpur'}</option>
          </select>
        </div>
      </Card>

      {/* Customers Table */}
      <Card className="overflow-hidden border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">{isBn ? 'গ্রাহক' : 'Customer'}</th>
                <th className="py-3.5 px-4">{isBn ? 'ঠিকানা ও এলাকা' : 'Location & Address'}</th>
                <th className="py-3.5 px-4">{isBn ? 'মোট বুকিং' : 'Total Bookings'}</th>
                <th className="py-3.5 px-4">{isBn ? 'সর্বশেষ বুকিং' : 'Last Booking'}</th>
                <th className="py-3.5 px-4">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="py-3.5 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                      <span>{isBn ? 'কাস্টমার তালিকা লোড হচ্ছে...' : 'Loading customer list...'}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    {isBn ? 'কোনো কাস্টমার পাওয়া যায়নি' : 'No customers found'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{c.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono block">{c.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-800 text-xs font-semibold">
                          <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span>{c.district}, {c.upazila}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate max-w-xs">{c.address}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">
                        {toBanglaNumber(c.totalBookings)} টি বুকিং
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {c.lastBookingDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="success" className="text-[10px] py-0.5">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        <span>{isBn ? 'সক্রিয়' : 'Active'}</span>
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`https://wa.me/88${(c.phone || '').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold hover:underline bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                      >
                        <Phone className="h-3 w-3" />
                        <span>WhatsApp চ্যাট</span>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
