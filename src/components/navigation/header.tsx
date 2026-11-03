'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Globe, Bell, User, Wrench } from 'lucide-react'
import { useI18n } from '@/locales'
import { NotificationDrawer } from '@/components/notifications/notification-drawer'

export function Header() {
  const { lang, setLanguage, t } = useI18n()
  const [selectedLocation, setSelectedLocation] = useState('ঠাকুরগাঁও সদর')
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState<number>(2) // initial demo indicator

  // Sync unread notifications count
  useEffect(() => {
    async function checkUnread() {
      try {
        const res = await fetch('/api/notifications')
        if (res.ok) {
          const data = await res.json()
          if (typeof data.unreadCount === 'number') {
            setUnreadCount(data.unreadCount)
          }
        }
      } catch (e) {
        // Fallback gracefully
      }
    }
    checkUnread()
  }, [])

  const toggleLanguage = () => {
    setLanguage(lang === 'bn' ? 'en' : 'bn')
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900">
                  mistri<span className="text-blue-600">.</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500">
                  {lang === 'bn' ? 'সেবা মার্কেটপ্লেস' : 'Services'}
                </span>
              </div>
            </Link>

            {/* Location Selector Pill */}
            <button
              onClick={() => {
                const nextLoc =
                  selectedLocation === 'ঠাকুরগাঁও সদর'
                    ? 'পঞ্চগড় সদর'
                    : selectedLocation === 'পঞ্চগড় সদর'
                    ? 'দিনাজপুর সদর'
                    : 'ঠাকুরগাঁও সদর'
                setSelectedLocation(nextLoc)
              }}
              className="flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              <span className="truncate max-w-[120px] sm:max-w-none">{selectedLocation}</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              title="ভাষা পরিবর্তন করুন / Change Language"
            >
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              <span>{lang === 'bn' ? 'EN' : 'বাং'}</span>
            </button>

            {/* Notification Button */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Auth Button */}
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              <span>{t('auth.login')}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Slide-out Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  )
}
