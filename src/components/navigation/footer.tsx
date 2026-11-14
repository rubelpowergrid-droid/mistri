'use client'

import React from 'react'
import Link from 'next/link'
import { Wrench, MapPin, Mail, Phone, ShieldCheck, Clock } from 'lucide-react'
import { useI18n } from '@/locales'

export function Footer() {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  return (
    <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full mt-6 sm:mt-8 mb-8 sm:mb-12">
      <div className="skeuo-surface-dark bg-gradient-to-b from-[#286f5c] via-[#1e5548] to-[#164237] text-[#fefded] p-6 sm:p-10 rounded-3xl border border-[#225f50] shadow-2xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10">
          {/* 1. Company Information */}
          <div className="space-y-3.5">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/mistri24.webp"
                alt="mistri24"
                className="h-10 w-10 rounded-xl object-contain shadow-md border border-[#378b75] bg-white"
              />
              <div className="flex flex-col">
                <span className="text-xl font-black text-[#fefded] tracking-tight leading-none">
                  mistri<span className="text-[#378b75]">24.</span>
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
                  {isBn ? 'কলেজপাড়া, ঠাকুরগাঁও সদর' : 'Collegepara, Thakurgaon Sadar'}
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
                    href="mailto:rubelinnovator@gmail.com"
                    className="font-medium text-[#fefded] hover:underline"
                  >
                    rubelinnovator@gmail.com
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

          {/* 4. Service Areas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#fefded] uppercase tracking-wider border-b border-[#2c7865] pb-1.5">
              {isBn ? 'সেবা অঞ্চল' : 'Service Areas'}
            </h4>
            <ul className="space-y-1.5 text-xs text-[#fefded]/80">
              <li>{isBn ? '• ঠাকুরগাঁও সদর, পীরগঞ্জ, রাণীশংকৈল' : '• Thakurgaon Sadar, Pirganj, Ranisankail'}</li>
              <li>{isBn ? '• পঞ্চগড় সদর, বোদা, তেঁতুলিয়া' : '• Panchagarh Sadar, Boda, Tetulia'}</li>
              <li>{isBn ? '• দিনাজপুর সদর, বীরগঞ্জ, কাহারোল' : '• Dinajpur Sadar, Birganj, Kaharole'}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Legal Strip */}
        <div className="pt-6 border-t border-[#2c7865] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#fefded]/70">
          <p>© ২০২৬ mistri24. সর্বস্বত্ব সংরক্ষিত।</p>
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
