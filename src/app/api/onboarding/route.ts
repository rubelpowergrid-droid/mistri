import { NextRequest, NextResponse } from 'next/server'
import { addApplicantToQueue } from '@/lib/mistri-store'
import { saveMistriToSupabase } from '@/lib/supabase-service'
import { createAdminClient } from '@/lib/supabase/admin'

async function uploadBase64ToStorage(
  supabase: any,
  bucket: string,
  base64Data: string | null | undefined,
  prefix: string,
  cleanPhone: string
): Promise<string | null> {
  if (!base64Data || typeof base64Data !== 'string') return null
  if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
    return base64Data
  }
  if (!base64Data.startsWith('data:image/')) {
    return null
  }
  try {
    const commaIndex = base64Data.indexOf(',')
    if (commaIndex === -1) return null
    const header = base64Data.substring(0, commaIndex)
    const rawBase64 = base64Data.substring(commaIndex + 1).replace(/\s/g, '')
    const mimeMatch = header.match(/data:([^;]+)/)
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg'
    const buffer = Buffer.from(rawBase64, 'base64')
    const fileName = `${prefix}_${cleanPhone}_${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      })

    if (!uploadErr) {
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)
      return publicUrlData?.publicUrl || null
    } else {
      console.error(`Storage upload error to ${bucket}:`, uploadErr)
    }
  } catch (err) {
    console.error(`Storage upload exception to ${bucket}:`, err)
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      fatherName,
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

    const cleanPhone = (phone || '').replace(/[^0-9]/g, '')
    const supabase = createAdminClient() as any

    // Upload files to Supabase Storage
    const uploadedAvatarUrl = await uploadBase64ToStorage(supabase, 'avatars', avatarPreview, 'avatar', cleanPhone)
    const uploadedNidFrontUrl = await uploadBase64ToStorage(supabase, 'nid-documents', nidFront, 'nid_front', cleanPhone)
    const uploadedNidBackUrl = await uploadBase64ToStorage(supabase, 'nid-documents', nidBack, 'nid_back', cleanPhone)

    const finalAvatar = uploadedAvatarUrl || ''
    const finalNidFront = uploadedNidFrontUrl || (nidFront && nidFront.startsWith('http') ? nidFront : '')
    const finalNidBack = uploadedNidBackUrl || (nidBack && nidBack.startsWith('http') ? nidBack : '')

    const newRecord = addApplicantToQueue({
      name: fullName,
      fatherName: fatherName || '',
      phone,
      password,
      nidNumber,
      dateOfBirth,
      gender,
      avatar: finalAvatar,
      nidFrontUrl: finalNidFront,
      nidBackUrl: finalNidBack,
      district: district || 'ঠাকুরগাঁও',
      upazila: upazila || 'ঠাকুরগাঁও সদর',
      area,
      streetAddress,
      serviceRadiusKm: Number(serviceRadiusKm) || 15,
      category: professionalTitle || selectedCategory || 'দক্ষ কারিগর',
      categorySlug: selectedCategory || '',
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
        fatherName,
        phone,
        password,
        nidNumber,
        dateOfBirth,
        gender,
        avatarUrl: finalAvatar || undefined,
        nidFrontUrl: finalNidFront || undefined,
        nidBackUrl: finalNidBack || undefined,
        district: district || 'ঠাকুরগাঁও',
        upazila: upazila || 'ঠাকুরগাঁও সদর',
        streetAddress,
        category: professionalTitle || selectedCategory || 'দক্ষ কারিগর',
        categorySlug: selectedCategory || '',
        subcategories: Array.isArray(selectedSubcategories) ? selectedSubcategories : [],
        professionalTitle: professionalTitle || selectedCategory || 'দক্ষ কারিগর',
        bio,
        experienceYears: Number(experienceYears) || 5,
        serviceRadiusKm: Number(serviceRadiusKm) || 15,
        chargeType: chargeType || 'negotiable',
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

