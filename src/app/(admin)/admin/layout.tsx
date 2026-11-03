'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, ShieldCheck, Wrench, Users, 
  Layers, MapPin, Calendar, FileText, ArrowLeft,
  Menu, X, Bell, LogOut, ChevronRight
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Badge } from '@/components/ui/badge'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { lang, setLanguage } = useI18n()
  const isBn = lang === 'bn'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/admin/dashboard', label: isBn ? 'ওভারভিউ ড্যাশবোর্ড' : 'Overview Dashboard', icon: LayoutDashboard },
    { href: '/admin/verification', label: isBn ? 'মিস্ত্রী ভেরিফিকেশন' : 'NID Verification', icon: ShieldCheck, badge: '৩' },
    { href: '/admin/mistris', label: isBn ? 'সকল মিস্ত্রী' : 'All Mistris', icon: Wrench },
    { href: '/admin/customers', label: isBn ? 'কাস্টমার তালিকা' : 'Customers', icon: Users },
    { href: '/admin/categories', label: isBn ? 'ক্যাটাগরি ও সার্ভিস' : 'Categories & Services', icon: Layers },
    { href: '/admin/locations', label: isBn ? 'জেলা ও উপজেলা জিও' : 'Geo Locations', icon: MapPin },
    { href: '/admin/bookings', label: isBn ? 'বুকিং ও ডিসপিউট' : 'Bookings & Disputes', icon: Calendar },
    { href: '/admin/reports', label: isBn ? 'রিপোর্ট ও এনালাইটিক্স' : 'Reports & Analytics', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex h-14 items-center justify-between bg-slate-900 text-white px-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
            M
          </div>
          <span className="font-bold text-sm tracking-tight">mistri Admin</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 space-y-6">
          {/* Brand header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs font-black">
                M
              </div>
              <div>
                <span className="font-black text-white text-base tracking-tight">
                  mistri<span className="text-blue-500">.</span>
                </span>
                <span className="block text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
                  Admin Portal
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="warning" className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-slate-400 text-[11px]">{isBn ? 'সিস্টেম ভাষা:' : 'Language:'}</span>
            <button
              onClick={() => setLanguage(lang === 'bn' ? 'en' : 'bn')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>

          <Link
            href="/"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
              <span>{isBn ? 'পাবলিক সাইটে ফিরুন' : 'Back to Public App'}</span>
            </div>
            <ChevronRight className="h-3 w-3 text-slate-500" />
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-3.5rem)] md:min-h-screen">
        {/* Top Control Bar */}
        <div className="hidden md:flex h-16 items-center justify-between bg-white border-b border-slate-200/80 px-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Admin</span>
            <span>/</span>
            <span className="text-slate-900 font-bold capitalize">
              {pathname.split('/')[2] || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {isBn ? 'সুপার অ্যাডমিন সেশন সক্রিয়' : 'Super Admin Active'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
