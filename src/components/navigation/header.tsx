'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Globe, Bell, User, Wrench, LogOut, Shield } from 'lucide-react'
import { useI18n } from '@/locales'
import { NotificationDrawer } from '@/components/notifications/notification-drawer'
import { getStoredUser, clearStoredUser, AUTH_EVENT_NAME, UserSession } from '@/lib/auth-client'

export function Header() {
  const { lang, setLanguage, t } = useI18n()
  const isBn = lang === 'bn'
  const [selectedLocation, setSelectedLocation] = useState('ঠাকুরগাঁও সদর')
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState<number>(2) // initial demo indicator
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)

  // Sync auth state on mount and upon any login/logout event
  useEffect(() => {
    setCurrentUser(getStoredUser())

    const handleAuthChange = () => {
      setCurrentUser(getStoredUser())
    }

    window.addEventListener(AUTH_EVENT_NAME, handleAuthChange)
    window.addEventListener('storage', handleAuthChange)

    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

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
      <header className="sticky top-0 z-40 w-full border-b border-slate-300/80 bg-white/95 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-stone-800 via-neutral-900 to-black text-white shadow-md border-t border-white/25 border-b-black transition-transform group-hover:scale-105">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-black">
                  mistri<span className="text-stone-900 font-extrabold">.</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
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
              className="skeuo-pill flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 transition-all cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5 text-black" />
              <span className="truncate max-w-[120px] sm:max-w-none">{selectedLocation}</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="skeuo-btn-light flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-800 transition-all"
              title="ভাষা পরিবর্তন করুন / Change Language"
            >
              <Globe className="h-3.5 w-3.5 text-slate-700" />
              <span>{lang === 'bn' ? 'EN' : 'বাং'}</span>
            </button>

            {/* Notification Button */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="skeuo-btn-light relative p-2 text-slate-800 transition-all"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-black px-1 text-[10px] font-black text-white ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Auth / Profile Button with Quick Logout */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href={
                    currentUser.role === 'admin'
                      ? '/admin/dashboard'
                      : currentUser.role === 'mistri'
                      ? '/mistri/profile'
                      : '/profile'
                  }
                  className="skeuo-btn-dark flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white transition-all"
                >
                  {currentUser.role === 'admin' ? (
                    <Shield className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                  <span className="max-w-[110px] truncate">
                    {currentUser.role === 'admin'
                      ? 'অ্যাডমিন'
                      : currentUser.name || 'আমার প্রোফাইল'}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => {
                    clearStoredUser()
                    setCurrentUser(null)
                  }}
                  title={isBn ? 'লগআউট করুন' : 'Sign Out'}
                  className="skeuo-btn-light p-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer"
                  aria-label="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="skeuo-btn-dark flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white transition-all"
              >
                <User className="h-3.5 w-3.5" />
                <span>{t('auth.login')}</span>
              </Link>
            )}
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
