'use client'

import React, { useState } from 'react'
import { 
  KeyRound, ShieldCheck, Lock, CheckCircle2, 
  AlertCircle, Eye, EyeOff, RefreshCw, UserCheck, Smartphone
} from 'lucide-react'
import { useI18n } from '@/locales'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getStoredUser } from '@/lib/auth-client'

export default function AdminSettingsPage() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const user = getStoredUser()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!currentPassword) {
      setErrorMessage(isBn ? 'বর্তমান এডমিন পাসওয়ার্ড প্রদান করুন' : 'Please enter current admin password')
      return
    }

    if (!newPassword || newPassword.length < 4) {
      setErrorMessage(isBn ? 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে' : 'New password must be at least 4 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(isBn ? 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি' : 'New passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })

      const data = await res.json()
      setIsLoading(false)

      if (data.success) {
        setSuccessMessage(data.message || (isBn ? 'এডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' : 'Admin password updated successfully!'))
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setErrorMessage(data.error || (isBn ? 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে' : 'Failed to change password'))
      }
    } catch {
      setIsLoading(false)
      setErrorMessage(isBn ? 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি' : 'Failed to connect to server')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <KeyRound className="h-6 w-6 text-[#2c7865]" />
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {isBn ? 'এডমিন সেটিংস ও পাসওয়ার্ড পরিবর্তন' : 'Admin Settings & Security'}
          </h1>
        </div>
        <p className="text-xs text-stone-600 mt-1">
          {isBn 
            ? 'সিস্টেম এডমিন অ্যাকাউন্টের নিরাপত্তা ও লগইন পাসওয়ার্ড ব্যবস্থাপনা করুন' 
            : 'Manage system administrator credentials and security preferences'}
        </p>
      </div>

      {/* Success / Error Banners */}
      {successMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl bg-red-50 border border-red-300 p-4 text-xs font-bold text-red-700 flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Password Change Card */}
        <Card className="p-6 md:col-span-2 space-y-5 bg-white border border-stone-200 rounded-3xl shadow-xs">
          <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#2c7865] text-white">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-stone-900">
                  {isBn ? 'এডমিন পাসওয়ার্ড পরিবর্তন' : 'Change Admin Password'}
                </h2>
                <p className="text-[11px] text-stone-500">
                  {isBn ? 'পরবর্তী লগইনে এই নতুন পাসওয়ার্ড দিয়ে এডমিন প্যানেলে প্রবেশ করবেন' : 'Use this new password for subsequent admin sign-ins'}
                </p>
              </div>
            </div>
            <Badge variant="primary" className="text-[10px] bg-[#2c7865]/10 text-[#2c7865] border-[#2c7865]/30">
              {isBn ? 'সুপার এডমিন' : 'Super Admin'}
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                {isBn ? 'বর্তমান পাসওয়ার্ড:' : 'Current Password:'}
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={isBn ? 'বর্তমান এডমিন পাসওয়ার্ড দিন (যেমন: admin1234)' : 'Enter current password'}
                  required
                  className="pr-10 text-xs rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-stone-500">
                {isBn ? 'পূর্বে পরিবর্তন না করে থাকলে ডিফল্ট পাসওয়ার্ড ব্যবহার করুন' : 'Use default password if not changed previously'}
              </p>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                {isBn ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৪ অক্ষর):' : 'New Password (min 4 chars):'}
              </label>
              <div className="relative">
                <Input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isBn ? 'নতুন নিরাপদ পাসওয়ার্ড লিখুন' : 'Enter new secure password'}
                  required
                  className="pr-10 text-xs rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                {isBn ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন:' : 'Confirm New Password:'}
              </label>
              <Input
                type={showNewPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isBn ? 'পুনরায় নতুন পাসওয়ার্ড লিখুন' : 'Re-enter new password'}
                required
                className="text-xs rounded-xl"
              />
            </div>

            <div className="pt-2 flex items-center justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="skeuo-btn-dark text-xs font-bold px-5 py-2.5 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>{isBn ? 'আপডেট হচ্ছে...' : 'Updating...'}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isBn ? 'এডমিন পাসওয়ার্ড সংরক্ষণ করুন' : 'Save Admin Password'}</span>
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Security Overview & Tips Card */}
        <div className="space-y-4">
          <Card className="p-5 bg-white border border-stone-200 rounded-3xl shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
              <UserCheck className="h-4 w-4 text-[#2c7865]" />
              <span>{isBn ? 'এডমিন সেশন তথ্য' : 'Admin Session Info'}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] text-stone-500 font-semibold block">এডমিন রোল:</span>
                <span className="font-bold text-stone-900 block">সিস্টেম সুপার অ্যাডমিন</span>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] text-stone-500 font-semibold block">লগইন ফোন / আইডি:</span>
                <span className="font-mono font-bold text-stone-900 block">
                  {user?.phone || '01744602996'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-[10px] text-emerald-800 font-semibold block">সিস্টেম স্ট্যাটাস:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>সক্রিয় ও সুরক্ষিত</span>
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-[#fefded] border border-[#2c7865]/30 rounded-3xl shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-[#2c7865] font-bold text-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>{isBn ? 'নিরাপত্তা নির্দেশনা' : 'Security Best Practices'}</span>
            </div>
            <ul className="text-[11px] text-stone-600 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>এডমিন পাসওয়ার্ড কমপক্ষে ৬-৮ অক্ষরের রাখুন।</li>
              <li>পাসওয়ার্ডে বর্ণ ও সংখ্যার মিশ্রণ ব্যবহার করুন।</li>
              <li>পাসওয়ার্ড পরিবর্তন করার পর ব্রাউজারে লগইন সেশন সচল থাকবে।</li>
              <li>পাসওয়ার্ড ভুলে গেলে অনুমোদিত নম্বর দিয়ে রিসেট করা যাবে।</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
