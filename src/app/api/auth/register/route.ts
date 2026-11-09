import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { saveMistriToSupabase } from '@/lib/supabase-service'
import { addApplicantToQueue, addCustomerToStore } from '@/lib/mistri-store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, fatherName, phone, password, role = 'mistri', district, upazila } = body
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

    if (role === 'mistri') {
      // 1. Add to in-memory applicant queue for instant admin verification review
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

      // 2. Persist to Supabase Database permanently
      let dbProfile: any = null
      try {
        dbProfile = await saveMistriToSupabase({
          fullName,
          fatherName: fatherName || '',
          phone: cleanPhone,
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
        redirectUrl: `/onboarding?phone=${cleanPhone}&name=${encodeURIComponent(fullName)}&fatherName=${encodeURIComponent(fatherName || '')}&district=${encodeURIComponent(district || 'Thakurgaon')}&upazila=${encodeURIComponent(upazila || 'Thakurgaon Sadar')}`,
        user: {
          id: mistriId,
          name: fullName,
          fatherName: fatherName || '',
          phone: cleanPhone,
          role: 'mistri',
          status: 'pending',
        },
      })
    }

    // Role is customer
    let customerId = `cust-${Date.now()}`
    try {
      const supabase = createAdminClient() as any
      const email = `customer_${cleanPhone}@mistri.app`

      const { data: authUser } = await supabase.auth.admin.createUser({
        email,
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
        email,
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
        name: fullName,
        phone: cleanPhone,
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
