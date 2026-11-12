'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, ShieldCheck, Wrench, Users, 
  Layers, MapPin, Calendar, FileText, ArrowLeft,
  Menu, X, Bell, LogOut, ChevronRight, Trash2
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Badge } from '@/components/ui/badge'
import { getStoredUser, clearStoredUser } from '@/lib/auth-client'
import { toBanglaNumber } from '@/lib/utils'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { lang, setLanguage } = useI18n()
  const isBn = lang === 'bn'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false)

  // Auth Guard: Admin access only
  React.useEffect(() => {
    const user = getStoredUser()
    if (!user || user.role !== 'admin') {
      router.replace('/login?redirect=' + encodeURIComponent(pathname))
      return
    }
    setIsAuthorized(true)
  }, [pathname, router])

  // Sync pending count
  React.useEffect(() => {
    async function loadCount() {
      try {
        const res = await fetch('/api/admin/verification?status=all')
        const data = await res.json()
        if (data.success) {
          const count = typeof data.pendingCount === 'number' ? data.pendingCount : (typeof data.count === 'number' ? data.count : 0)
          setPendingCount(count)
        }
      } catch {}
    }
    loadCount()
  }, [pathname])

  const handleLogout = () => {
    clearStoredUser()
    window.location.href = '/login'
  }

  const navLinks = [
    { href: '/admin/dashboard', label: isBn ? 'ওভারভিউ ড্যাশবোর্ড' : 'Overview Dashboard', icon: LayoutDashboard },
    { 
      href: '/admin/verification', 
      label: isBn ? 'মিস্ত্রী ভেরিফিকেশন' : 'NID Verification', 
      icon: ShieldCheck, 
      badge: pendingCount > 0 ? (isBn ? toBanglaNumber(pendingCount) : String(pendingCount)) : undefined 
    },
    { href: '/admin/mistris', label: isBn ? 'সকল মিস্ত্রী' : 'All Mistris', icon: Wrench },
    { href: '/admin/mistris?tab=trash', label: isBn ? 'Trash ফোল্ডার' : 'Trash Folder', icon: Trash2 },
    { href: '/admin/customers', label: isBn ? 'কাস্টমার তালিকা' : 'Customers', icon: Users },
    { href: '/admin/categories', label: isBn ? 'ক্যাটাগরি ও সার্ভিস' : 'Categories & Services', icon: Layers },
    { href: '/admin/locations', label: isBn ? 'জেলা ও উপজেলা জিও' : 'Geo Locations', icon: MapPin },
    { href: '/admin/bookings', label: isBn ? 'বুকিং ও ডিসপিউট' : 'Bookings & Disputes', icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-[#fefded] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex h-14 items-center justify-between bg-[#14382f] text-[#fefded] px-4 border-b border-[#225f50]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2c7865] text-[#fefded] font-bold text-sm">
            M
          </div>
          <span className="font-bold text-sm tracking-tight">mistri24 Admin</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg text-[#fefded]/70 hover:text-white hover:bg-[#1e5548]"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#14382f] text-[#fefded] flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 border-r border-[#225f50]
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 space-y-6">
          {/* Brand header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#225f50]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2c7865] text-[#fefded] shadow-xs font-black">
                M
              </div>
              <div>
                <span className="font-black text-white text-base tracking-tight">
                  mistri<span className="text-[#38967f]">24.</span>
                </span>
                <span className="block text-[10px] text-[#38967f] font-semibold tracking-wider uppercase">
                  Admin Portal
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-[#fefded]/60 hover:text-white"
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
                      ? 'bg-[#2c7865] text-[#fefded] shadow-md font-bold'
                      : 'text-[#fefded]/70 hover:bg-[#1e5548] hover:text-[#fefded]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="warning" className="bg-[#fefded] text-[#2c7865] font-bold px-1.5 py-0.2 text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#225f50] space-y-3">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-[#fefded]/70 text-[11px]">{isBn ? 'সিস্টেম ভাষা:' : 'Language:'}</span>
            <button
              onClick={() => setLanguage(lang === 'bn' ? 'en' : 'bn')}
              className="text-xs font-bold text-[#38967f] hover:text-[#fefded]"
            >
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>

          <Link
            href="/"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-[#1e5548]/70 hover:bg-[#1e5548] text-xs font-semibold text-[#fefded]/80 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5 text-[#fefded]/60" />
              <span>{isBn ? 'পাবলিক সাইটে ফিরুন' : 'Back to Public App'}</span>
            </div>
            <ChevronRight className="h-3 w-3 text-[#fefded]/60" />
          </Link>

          {/* Admin Sign Out */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-xs font-semibold text-red-300 hover:text-white transition-colors cursor-pointer border border-red-800/40"
          >
            <div className="flex items-center gap-2">
              <LogOut className="h-3.5 w-3.5 text-red-400" />
              <span>{isBn ? 'অ্যাডমিন লগআউট' : 'Admin Logout'}</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-3.5rem)] md:min-h-screen">
        {/* Top Control Bar */}
        <div className="hidden md:flex h-16 items-center justify-between bg-[#fefded] border-b border-[#dcd6b8] px-6">
          <div className="flex items-center gap-2 text-xs text-[#2c7865]/70 font-medium">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#2c7865] font-bold capitalize">
              {pathname.split('/')[2] || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#2c7865] bg-[#f4f0d6] px-2.5 py-1 rounded-full border border-[#dcd6b8]">
              <span className="h-2 w-2 rounded-full bg-[#2c7865] animate-pulse"></span>
              {isBn ? 'সুপার অ্যাডমিন সেশন সক্রিয়' : 'Super Admin Active'}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full border border-red-200 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-red-600" />
              <span>{isBn ? 'লগআউট' : 'Logout'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 lg:p-8">
          {isAuthorized ? (
            children
          ) : (
            <div className="flex h-64 items-center justify-center text-sm font-semibold text-slate-500">
              {isBn ? 'অ্যাডমিন অ্যাক্সেস যাচাই করা হচ্ছে...' : 'Verifying admin authorization...'}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

