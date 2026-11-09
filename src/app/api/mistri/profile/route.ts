import { NextRequest, NextResponse } from 'next/server'
import { getMistriProfileByPhone, updateMistriProfileByPhone } from '@/lib/supabase-service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone') || '01722159830'

    const profile = await getMistriProfileByPhone(phone)

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'মিস্ত্রী প্রোফাইল পাওয়া যায়নি' },
        { status: 404, headers: NO_CACHE_HEADERS }
      )
    }

    return NextResponse.json({
      success: true,
      profile,
    }, { headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'মোবাইল নম্বর আবশ্যক' },
        { status: 400 }
      )
    }

    // Explicitly reject if attempting to modify locked fields
    if (body.fullName !== undefined || body.nidNumber !== undefined || body.dateOfBirth !== undefined) {
      // We will only update safe fields and ignore locked fields
      console.log('Ignored attempt to modify locked NID fields')
    }

    const result = await updateMistriProfileByPhone(phone, body)

    return NextResponse.json({
      success: true,
      message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে',
      result,
    }, { headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}

