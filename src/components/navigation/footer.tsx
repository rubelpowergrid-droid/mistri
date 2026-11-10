'use client'

import React from 'react'
import Link from 'next/link'
import { Wrench, MapPin, Mail, Phone, ShieldCheck, Clock, FileText, Shield } from 'lucide-react'
import { useI18n } from '@/locales'

export function Footer() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  return (
    <footer className="w-full bg-[#1e5548] text-[#fefded] border-t-2 border-[#2c7865] mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10">
          {/* 1. Company Information */}
          <div className="space-y-3.5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2c7865] text-[#fefded] shadow-md border border-[#378b75]">
                <Wrench className="h-5 w-5 text-[#fefded]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-[#fefded] tracking-tight leading-none">
                  mistri<span className="text-[#378b75]">.</span>
                </span>
                <span className="text-[10px] text-[#fefded]/80 font-semibold tracking-wider">
                  {isBn ? 'সেবা মার্কেটপ্লেস' : 'Services Marketplace'}
                </span>
              </div>
            </Link>
            <p className="text-xs text-[#fefded]/80 leading-relaxed">
              {isBn
                ? 'আপনার এলাকার দক্ষ ও বিশ্বস্ত মিস্ত্রীদের সাথে সরাসরি যোগাযোগের প্ল্যাটফর্ম। সহজে খুঁজুন এবং এক ক্লিকে বুক করুন।'
                : 'Reliable neighborhood services marketplace connecting verified technicians with households.'}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#fefded]/80 pt-1">
              <ShieldCheck className="h-4 w-4 text-[#fefded] shrink-0" />
              <span>{isBn ? '১০০% এনআইডি ভেরিফাইড কারিগর' : '100% NID Verified Technicians'}</span>
            </div>
          </div>

          {/* 2. Contact Address */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#fefded] uppercase tracking-wider border-b border-[#2c7865] pb-1.5">
              {isBn ? 'যোগাযোগের ঠিকানা' : 'Contact Address'}
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-[#fefded]/85">
              <MapPin className="h-4 w-4 text-[#fefded] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-[#fefded]">
                  {isBn ? 'প্রধান কার্যালয়:' : 'Head Office:'}
                </p>
                <p className="text-[#fefded]/85 leading-relaxed">
                  {isBn ? 'হাজীপাড়া রোড, ঠাকুরগাঁও সদর' : 'Hajipara Road, Thakurgaon Sadar'}
                </p>
                <p className="text-[#fefded]/75 text-[11px]">
                  {isBn ? 'ঠাকুরগাঁও - ৫১০০, বাংলাদেশ' : 'Thakurgaon - 5100, Bangladesh'}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Direct Contact: Email & Mobile No */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#fefded] uppercase tracking-wider border-b border-[#2c7865] pb-1.5">
              {isBn ? 'সরাসরি যোগাযোগ' : 'Direct Contact'}
            </h4>
            <div className="space-y-3 text-xs">
              {/* Mobile No */}
              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-[#fefded] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] text-[#fefded]/70 uppercase font-semibold">
                    {isBn ? 'মোবাইল নম্বর' : 'Mobile Number'}
                  </span>
                  <a
                    href="tel:01722092804"
                    className="font-bold text-[#fefded] hover:underline tracking-wide"
                  >
                    +880 1722-092804
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-[#fefded] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] text-[#fefded]/70 uppercase font-semibold">
                    {isBn ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                  </span>
                  <a
                    href="mailto:support@mistri.app"
                    className="font-medium text-[#fefded] hover:underline"
                  >
                    support@mistri.app
                  </a>
                </div>
              </div>

              {/* Support Hours */}
              <div className="flex items-center gap-2 text-[11px] text-[#fefded]/75 pt-0.5">
                <Clock className="h-3.5 w-3.5 text-[#fefded] shrink-0" />
                <span>{isBn ? 'সকাল ৮:০০ – রাত ১০:০০ (প্রতিদিন)' : '8:00 AM – 10:00 PM (Daily)'}</span>
              </div>
            </div>
          </div>

          {/* 4. Quick Links / Areas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#fefded] uppercase tracking-wider border-b border-[#2c7865] pb-1.5">
              {isBn ? 'সেবা অঞ্চল ও লিংক' : 'Service Areas & Links'}
            </h4>
            <ul className="space-y-1.5 text-xs text-[#fefded]/80">
              <li>{isBn ? '• ঠাকুরগাঁও সদর, পীরগঞ্জ, রাণীশংকৈল' : '• Thakurgaon Sadar, Pirganj, Ranisankail'}</li>
              <li>{isBn ? '• পঞ্চগড় সদর, বোদা, তেঁতুলিয়া' : '• Panchagarh Sadar, Boda, Tetulia'}</li>
              <li>{isBn ? '• দিনাজপুর সদর, বীরগঞ্জ, কাহারোল' : '• Dinajpur Sadar, Birganj, Kaharole'}</li>
            </ul>
            <div className="pt-2">
              <Link
                href="/register?role=mistri"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#fefded] border border-[#fefded]/30 bg-[#2c7865] px-3.5 py-2 rounded-xl hover:bg-[#378b75] transition-all shadow-xs"
              >
                <Wrench className="h-3.5 w-3.5 text-[#fefded]" />
                <span>{isBn ? 'মিস্ত্রী হিসেবে নিবন্ধন করুন' : 'Register as Mistri'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal Strip */}
        <div className="mt-10 pt-6 border-t border-[#2c7865] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#fefded]/70">
          <p>© ২০২৬ mistri. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/privacy" className="hover:text-[#fefded] transition-colors">
              {isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#fefded] transition-colors">
              {isBn ? 'ব্যবহারের শর্তাবলী' : 'Terms of Service'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
