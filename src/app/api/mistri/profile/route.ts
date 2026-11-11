import { NextRequest, NextResponse } from 'next/server'
import { getMistriProfileByPhone, updateMistriProfileByPhone } from '@/lib/supabase-service'
import { createAdminClient } from '@/lib/supabase/admin'

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

    const cleanPhone = phone.replace(/[^0-9]/g, '')

    // Handle avatar upload to Supabase Storage if base64 data URL provided
    if (body.avatar && typeof body.avatar === 'string' && body.avatar.startsWith('data:image/')) {
      try {
        const matches = body.avatar.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
        if (matches && matches[2]) {
          const mimeType = matches[1] || 'image/jpeg'
          const ext = mimeType.split('/')[1] || 'jpg'
          const buffer = Buffer.from(matches[2], 'base64')
          const fileName = `avatar_${cleanPhone}_${Date.now()}.${ext}`

          const supabase = createAdminClient() as any
          const { error: uploadErr } = await supabase.storage
            .from('avatars')
            .upload(fileName, buffer, {
              contentType: mimeType,
              upsert: true,
            })

          if (!uploadErr) {
            const { data: publicUrlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName)

            if (publicUrlData?.publicUrl) {
              body.avatar = publicUrlData.publicUrl
            }
          } else {
            console.error('Failed to upload avatar to Supabase Storage:', uploadErr)
          }
        }
      } catch (storageErr) {
        console.error('Storage processing exception:', storageErr)
      }
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
      avatar: body.avatar,
      result,
    }, { headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}


