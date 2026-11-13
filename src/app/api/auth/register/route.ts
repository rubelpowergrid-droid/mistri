import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { saveMistriToSupabase } from '@/lib/supabase-service'
import { addApplicantToQueue, addCustomerToStore } from '@/lib/mistri-store'
import { EmailOtpService } from '@/lib/email-otp-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, fatherName, phone, password, role = 'customer', district, upazila, email } = body
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '')

    if (!fullName || !cleanPhone || cleanPhone.length < 11) {
      return NextResponse.json(
        { success: false, error: 'সঠিক নাম এবং ১১ সংখ্যার মোবাইল নম্বর দিন' },
        { status: 400 }
      )
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { success: false, error: 'কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড দিন' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient() as any

    // 1. Strict Duplicate Check: Mobile Number can ONLY be used once
    const { data: existingPhoneUser } = await supabase
      .from('users')
      .select('id, phone, role')
      .eq('phone', cleanPhone)
      .maybeSingle()

    if (existingPhoneUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। একই মোবাইল নম্বর দিয়ে একাধিক একাউন্ট খোলা যাবে না। দয়া করে লগইন করুন।' 
        },
        { status: 409 }
      )
    }

    // 2. Strict Duplicate Check: Email can ONLY be used once (if provided)
    if (email) {
      const cleanEmail = email.trim().toLowerCase()
      const { data: existingEmailUser } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', cleanEmail)
        .maybeSingle()

      if (existingEmailUser) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। একই ইমেইল দিয়ে একাধিক একাউন্ট খোলা যাবে না। দয়া করে লগইন করুন।' 
          },
          { status: 409 }
        )
      }

      // 2.1 Verify OTP if provided
      if (body.otpCode) {
        const otpCheck = await EmailOtpService.verifyOtp(cleanEmail, body.otpCode)
        if (!otpCheck.success) {
          return NextResponse.json(
            { success: false, error: otpCheck.error || 'ভুল Gmail ওটিপি কোড!' },
            { status: 400 }
          )
        }
      }
    }

    // 3. Handle Mistri Registration (Strict Role Exclusion: Mistri !== Customer)
    if (role === 'mistri') {
      const applicantRecord = addApplicantToQueue({
        name: fullName,
        fatherName: fatherName || '',
        phone: cleanPhone,
        password,
        nidNumber: '',
        district: district || 'ঠাকুরগাঁও',
        upazila: upazila || 'ঠাকুরগাঁও সদর',
        category: 'দক্ষ কারিগর',
        categorySlug: 'electrical-services',
        subcategories: [],
        experienceYears: 5,
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      })

      let dbProfile: any = null
      const cleanEmail = email ? email.trim().toLowerCase() : undefined
      try {
        dbProfile = await saveMistriToSupabase({
          fullName,
          fatherName: fatherName || '',
          phone: cleanPhone,
          email: cleanEmail,
          password,
          district: district || 'ঠাকুরগাঁও',
          upazila: upazila || 'ঠাকুরগাঁও সদর',
          status: 'pending',
        })
      } catch (dbErr) {
        console.warn('Supabase save error during mistri register:', dbErr)
      }

      const mistriId = dbProfile?.id || applicantRecord.id

      return NextResponse.json({
        success: true,
        role: 'mistri',
        status: 'pending',
        redirectUrl: `/onboarding?phone=${cleanPhone}&name=${encodeURIComponent(fullName)}&fatherName=${encodeURIComponent(fatherName || '')}&email=${encodeURIComponent(cleanEmail || '')}&district=${encodeURIComponent(district || 'Thakurgaon')}&upazila=${encodeURIComponent(upazila || 'Thakurgaon Sadar')}`,
        user: {
          id: mistriId,
          userId: mistriId,
          name: fullName,
          fatherName: fatherName || '',
          phone: cleanPhone,
          email: cleanEmail,
          role: 'mistri',
          status: 'pending',
        },
      })
    }

    // 4. Handle Customer Registration (Default)
    const userEmail = email ? email.trim().toLowerCase() : `customer_${cleanPhone}@mistri.app`
    let customerId = `cust-${Date.now()}`

    try {
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email: userEmail,
        password,
        email_confirm: true,
        user_metadata: {
          phone: cleanPhone,
          full_name: fullName,
          role: 'customer',
          plain_pass: password,
        },
      })

      const userId = authUser?.user?.id || `cust-u-${Date.now()}`
      customerId = userId

      await supabase.from('users').upsert({
        id: userId,
        phone: cleanPhone,
        email: userEmail,
        role: 'customer',
        preferred_language: 'bn',
      }, { onConflict: 'phone' })

      await supabase.from('customer_profiles').upsert({
        user_id: userId,
        full_name: fullName,
        default_address: `${upazila || 'ঠাকুরগাঁও সদর'}, ${district || 'ঠাকুরগাঁও'}`,
      }, { onConflict: 'user_id' })
    } catch (cErr) {
      console.warn('Supabase customer register error:', cErr)
    }

    addCustomerToStore({
      name: fullName,
      phone: cleanPhone,
      district: district || 'ঠাকুরগাঁও',
      upazila: upazila || 'ঠাকুরগাঁও সদর',
    })

    return NextResponse.json({
      success: true,
      role: 'customer',
      redirectUrl: '/',
      user: {
        id: customerId,
        userId: customerId,
        name: fullName,
        phone: cleanPhone,
        email: userEmail,
        role: 'customer',
      },
    })
  } catch (err: any) {
    console.error('Register API error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'সার্ভার ত্রুটি, পুনরায় চেষ্টা করুন' },
      { status: 500 }
    )
  }
}
