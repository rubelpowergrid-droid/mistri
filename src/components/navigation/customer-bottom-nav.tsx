'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Calendar, Heart, User } from 'lucide-react'
import { useI18n } from '@/locales'
import { cn } from '@/lib/utils'

export function CustomerBottomNav() {
  const pathname = usePathname()
  const { t } = useI18n()

  const navItems = [
    { label: t('nav.home'), href: '/', icon: Home },
    { label: t('nav.search'), href: '/search', icon: Search },
    { label: t('nav.bookings'), href: '/bookings', icon: Calendar },
    { label: t('nav.favorites'), href: '/favorites', icon: Heart },
    { label: t('nav.profile'), href: '/profile', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-slate-300 bg-white/95 backdrop-blur-md shadow-[0_-4px_15px_rgba(0,0,0,0.06)] sm:hidden">
      <div className="grid h-16 grid-cols-5 items-center px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all py-1',
                isActive
                  ? 'text-black'
                  : 'text-slate-500 hover:text-black'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-xl transition-all',
                  isActive && 'bg-gradient-to-b from-stone-800 to-black text-white shadow-md'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-600')} />
              </div>
              <span className={cn(isActive && 'font-black')}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
