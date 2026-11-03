'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  X,
  Bell,
  CheckCircle,
  Clock,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCheck,
  Smartphone,
  ExternalLink
} from 'lucide-react'
import { useI18n } from '@/locales'

export interface NotificationItem {
  id: string
  title: string
  body: string
  type: 'booking' | 'verification' | 'system' | 'reminder' | 'dispute'
  reference_id?: string | null
  is_read: boolean
  created_at: string
}

interface NotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
  onUnreadCountChange?: (count: number) => void
}

export function NotificationDrawer({ isOpen, onClose, onUnreadCountChange }: NotificationDrawerProps) {
  const { lang, t } = useI18n()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'booking' | 'verification' | 'system'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied'>('default')

  // Load notifications from API
  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (data.notifications) {
        setNotifications(data.notifications)
        onUnreadCountChange?.(data.unreadCount ?? 0)
      }
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  // Check Web Push Permission status
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushStatus(Notification.permission)
    }
  }, [])

  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission()
        setPushStatus(permission)
        if (permission === 'granted') {
          // Send simulated web token to backend
          await fetch('/api/notifications/device-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: `web-client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              platform: 'web',
            }),
          })
        }
      } catch (err) {
        console.error('Error requesting push permission:', err)
      }
    }
  }

  const markAsRead = async (id?: string, markAll = false) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, markAll }),
      })

      setNotifications((prev) =>
        prev.map((n) => {
          if (markAll || n.id === id) {
            return { ...n, is_read: true }
          }
          return n
        })
      )

      const remainingUnread = markAll ? 0 : notifications.filter((n) => n.id !== id && !n.is_read).length
      onUnreadCountChange?.(remainingUnread)
    } catch (err) {
      console.error('Failed to mark notification read:', err)
    }
  }

  if (!isOpen) return null

  const filtered = notifications.filter((item) => {
    if (activeTab === 'all') return true
    return item.type === activeTab
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  // Relative time helper in Bengali
  const formatTimeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return lang === 'bn' ? 'এইমাত্র' : 'just now'
    if (diff < 3600) {
      const mins = Math.floor(diff / 60)
      return lang === 'bn' ? `${mins} মিনিট আগে` : `${mins}m ago`
    }
    if (diff < 86400) {
      const hours = Math.floor(diff / 3600)
      return lang === 'bn' ? `${hours} ঘণ্টা আগে` : `${hours}h ago`
    }
    const days = Math.floor(diff / 86400)
    return lang === 'bn' ? `${days} দিন আগে` : `${days}d ago`
  }

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'booking':
        return <Wrench className="h-5 w-5 text-blue-600" />
      case 'verification':
        return <ShieldCheck className="h-5 w-5 text-emerald-600" />
      case 'dispute':
        return <AlertTriangle className="h-5 w-5 text-rose-600" />
      case 'system':
      default:
        return <Info className="h-5 w-5 text-amber-600" />
    }
  }

  const getTargetLink = (item: NotificationItem) => {
    if (item.type === 'booking') {
      return item.reference_id ? `/bookings/${item.reference_id}` : '/bookings'
    }
    if (item.type === 'verification') {
      return '/onboarding/status'
    }
    return '#'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform ease-out duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {lang === 'bn' ? 'বিজ্ঞপ্তি কেন্দ্র' : 'Notifications'}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {lang === 'bn' ? 'সকল আপডেট এবং বুকিং তথ্য' : 'Updates & alerts'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAsRead(undefined, true)}
                  title={lang === 'bn' ? 'সবগুলো পঠিত চিহ্নিত করুন' : 'Mark all read'}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{lang === 'bn' ? 'সব পঠিত' : 'Read all'}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Push Notification Banner */}
          {pushStatus !== 'granted' && (
            <div className="mx-4 mt-3 p-3 rounded-xl border border-blue-100 bg-blue-50/60 flex items-start gap-3">
              <Smartphone className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-900">
                  {lang === 'bn' ? 'তাৎক্ষণিক নোটিফিকেশন সক্রিয় করুন' : 'Enable Live Push Notifications'}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {lang === 'bn'
                    ? 'মিস্ত্রির সাড়া এবং বুকিং পরিবর্তন সাথে সাথে জানতে পুশ নোটিফিকেশন চালু রাখুন।'
                    : 'Get real-time booking alerts and live updates.'}
                </p>
                <button
                  onClick={requestPushPermission}
                  className="mt-2 text-xs font-bold text-blue-700 bg-white hover:bg-blue-100/80 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {lang === 'bn' ? 'অনুমতি দিন' : 'Enable now'}
                </button>
              </div>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-slate-100 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {lang === 'bn' ? 'সকল' : 'All'} ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeTab === 'booking'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {lang === 'bn' ? 'বুকিং' : 'Bookings'}
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeTab === 'verification'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {lang === 'bn' ? 'ভেরিফিকেশন' : 'Verification'}
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeTab === 'system'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {lang === 'bn' ? 'সিস্টেম' : 'System'}
            </button>
          </div>

          {/* Notification List Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <div className="h-7 w-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs">{lang === 'bn' ? 'বিজ্ঞপ্তি লোড হচ্ছে...' : 'Loading notifications...'}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Bell className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  {lang === 'bn' ? 'কোনো বিজ্ঞপ্তি পাওয়া যায়নি' : 'No notifications'}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  {lang === 'bn'
                    ? 'আপনার নতুন কোনো বুকিং বা সিস্টেমে বার্তা নেই।'
                    : 'You are all caught up with your updates.'}
                </p>
              </div>
            ) : (
              filtered.map((item) => {
                const linkHref = getTargetLink(item)
                return (
                  <div
                    key={item.id}
                    className={`relative rounded-xl border p-3.5 transition-all ${
                      item.is_read
                        ? 'bg-white border-slate-100 hover:border-slate-200'
                        : 'bg-blue-50/40 border-blue-100 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-xs shrink-0">
                        {getIcon(item.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {item.title}
                          </h4>
                          {!item.is_read && (
                            <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1 ring-2 ring-blue-100"></span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-3">
                          {item.body}
                        </p>

                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(item.created_at)}
                          </span>

                          <div className="flex items-center gap-2">
                            {linkHref !== '#' && (
                              <Link
                                href={linkHref}
                                onClick={onClose}
                                className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                              >
                                <span>{lang === 'bn' ? 'বিস্তারিত' : 'View'}</span>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}

                            {!item.is_read && (
                              <button
                                onClick={() => markAsRead(item.id)}
                                className="text-slate-500 hover:text-slate-800 flex items-center gap-0.5 font-medium ml-2"
                                title="পঠিত হিসেবে চিহ্নিত করুন"
                              >
                                <CheckCircle className="h-3 w-3" />
                                <span>{lang === 'bn' ? 'পঠিত' : 'Read'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>MISTRI Realtime Alert Engine</span>
            <button
              onClick={() => fetchNotifications()}
              className="text-blue-600 font-semibold hover:underline"
            >
              {lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
