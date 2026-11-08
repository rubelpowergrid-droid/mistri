import { NextRequest, NextResponse } from 'next/server'
import { addApplicantToQueue } from '@/lib/mistri-store'
import { saveMistriToSupabase } from '@/lib/supabase-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      phone,
      password,
      dateOfBirth,
      gender,
      avatarPreview,
      nidNumber,
      nidFront,
      nidBack,
      district,
      upazila,
      area,
      streetAddress,
      serviceRadiusKm,
      selectedCategory,
      selectedSubcategories,
      experienceYears,
      professionalTitle,
      bio,
      chargeType,
      baseCharge,
    } = body

    if (!fullName || !phone || !nidNumber) {
      return NextResponse.json(
        { success: false, error: 'নাম, মোবাইল নম্বর এবং এনআইডি আবশ্যক' },
        { status: 400 }
      )
    }

    const newRecord = addApplicantToQueue({
      name: fullName,
      phone,
      password,
      nidNumber,
      dateOfBirth,
      gender,
      avatar: avatarPreview || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      nidFrontUrl: nidFront,
      nidBackUrl: nidBack,
      district: district || 'ঠাকুরগাঁও',
      upazila: upazila || 'ঠাকুরগাঁও সদর',
      area,
      streetAddress,
      serviceRadiusKm: Number(serviceRadiusKm) || 15,
      category: professionalTitle || selectedCategory || 'ইলেকট্রিক্যাল কাজ',
      categorySlug: selectedCategory || 'electrical-services',
      subcategories: selectedSubcategories || [],
      experienceYears: Number(experienceYears) || 5,
      bio,
      chargeType: chargeType || 'negotiable',
      baseCharge: Number(baseCharge) || 400,
    })

    // Also persist to Supabase PostgreSQL database
    let dbProfile: any = null
    try {
      dbProfile = await saveMistriToSupabase({
        fullName,
        phone,
        password,
        nidNumber,
        dateOfBirth,
        gender,
        district: district || 'ঠাকুরগাঁও',
        upazila: upazila || 'ঠাকুরগাঁও সদর',
        streetAddress,
        professionalTitle: professionalTitle || selectedCategory || 'দক্ষ ইলেকট্রিশিয়ান',
        bio,
        experienceYears: Number(experienceYears) || 5,
        baseCharge: Number(baseCharge) || 400,
        status: 'pending',
      })
      if (dbProfile?.id) {
        newRecord.id = dbProfile.id
      }
    } catch (dbErr) {
      console.error('Supabase persistence error during onboarding:', dbErr)
    }

    return NextResponse.json({
      success: true,
      message: 'মিস্ত্রী আবেদন সফলভাবে জমা হয়েছে এবং অ্যাডমিন অনুমোদনের জন্য অপেক্ষমাণ',
      applicant: newRecord,
    })
  } catch (err: any) {
    console.error('Onboarding API error:', err)
    return NextResponse.json(
      { success: false, error: 'সার্ভার ত্রুটি, পুনরায় চেষ্টা করুন' },
      { status: 500 }
    )
  }
}

