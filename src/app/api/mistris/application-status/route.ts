import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getApplicantsStore } from '@/lib/mistri-store'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || ''
    const phone = (searchParams.get('phone') || '').replace(/[^0-9]/g, '')
    const email = (searchParams.get('email') || '').trim().toLowerCase()

    const supabase = createAdminClient() as any
    let targetUserId = userId

    // If userId not provided, find by phone or email
    if (!targetUserId && phone) {
      const { data: u } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .maybeSingle()
      if (u?.id) targetUserId = u.id
    }

    if (!targetUserId && email) {
      const { data: u } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle()
      if (u?.id) targetUserId = u.id
    }

    // 1. Check in Supabase mistri_profiles
    if (targetUserId) {
      const { data: mProf } = await supabase
        .from('mistri_profiles')
        .select('id, full_name, approval_status, professional_title, created_at')
        .eq('user_id', targetUserId)
        .maybeSingle()

      if (mProf) {
        return NextResponse.json({
          success: true,
          hasApplication: true,
          status: mProf.approval_status || 'pending',
          profile: mProf,
        })
      }
    }

    // 2. Fallback: Check in-memory applicant queue by phone
    if (phone) {
      const queue = getApplicantsStore()
      const app = queue.find((a: any) => a.phone === phone)
      if (app) {
        return NextResponse.json({
          success: true,
          hasApplication: true,
          status: app.status || 'pending',
          profile: {
            id: app.id,
            full_name: app.name,
            approval_status: app.status || 'pending',
            professional_title: app.category,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      hasApplication: false,
      status: null,
    })
  } catch (err: any) {
    console.error('Error in application-status API:', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
