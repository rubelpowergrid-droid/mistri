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
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-slate-200/80 bg-white/95 backdrop-blur-md sm:hidden">
      <div className="grid h-16 grid-cols-5 items-center px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

