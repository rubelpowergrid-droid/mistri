import { NextRequest, NextResponse } from 'next/server'
import { OtpService } from '@/lib/sms/otp-service'
import { createAdminClient } from '@/lib/supabase/admin'
import { getApplicantsStore, getCustomersStore } from '@/lib/mistri-store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code } = body

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: 'মোবাইল নম্বর এবং ওটিপি কোড প্রয়োজন' },
        { status: 400 }
      )
    }

    const verification = OtpService.verifyOtp(phone, code)

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error || 'ভুল ওটিপি কোড' },
        { status: 400 }
      )
    }

    const cleanPhone = (phone || '').replace(/[^0-9]/g, '')
    const isAdmin =
      cleanPhone === '01700000000' ||
      cleanPhone === '01722092804' ||
      phone.toLowerCase().includes('admin')

    let role = 'customer'
    let name = 'সম্মানিত গ্রাহক'
    let status = 'approved'
    let userId = `user-${Date.now()}`

    if (isAdmin) {
      role = 'admin'
      name = 'Admin'
    } else {
      try {
        const supabase = createAdminClient() as any
        const { data: dbUser } = await supabase
          .from('users')
          .select('id, phone, email, role')
          .eq('phone', cleanPhone)
          .maybeSingle()

        if (dbUser?.id) {
          if (dbUser.role === 'mistri') {
            role = 'mistri'
            const { data: profile } = await supabase
              .from('mistri_profiles')
              .select('*')
              .eq('user_id', dbUser.id)
              .maybeSingle()

            let authUser: any = null
            try {
              const aRes = await supabase.auth.admin.getUserById(dbUser.id)
              authUser = aRes.data?.user
            } catch (e) {}

            name = profile?.full_name || authUser?.user_metadata?.full_name || 'মিস্ত্রী কারিগর'
            status = profile?.approval_status || 'approved'
            userId = profile?.id || dbUser.id
          } else {
            role = 'customer'
            const { data: customer } = await supabase
              .from('customer_profiles')
              .select('*')
              .eq('user_id', dbUser.id)
              .maybeSingle()

            if (customer?.full_name) {
              name = customer.full_name
            }
          }
        }
      } catch (dbErr) {
        console.warn('verify-otp Supabase lookup error:', dbErr)
      }

      // Check in-memory store if role is still customer
      if (role === 'customer') {
        const storeMistri = getApplicantsStore().find(
          (m) => m.phone.replace(/[^0-9]/g, '') === cleanPhone
        )
        if (storeMistri) {
          role = 'mistri'
          name = storeMistri.name
          status = storeMistri.status || 'pending'
          userId = storeMistri.id
        } else {
          const { INITIAL_APPROVED_MISTRIS } = await import('@/lib/mistri-store')
          const initialMistri = INITIAL_APPROVED_MISTRIS.find(
            (m) => m.phone.replace(/[^0-9]/g, '') === cleanPhone
          )
          if (initialMistri) {
            role = 'mistri'
            name = initialMistri.name_bn
            status = 'approved'
            userId = initialMistri.id
          } else {
            const storeCustomer = getCustomersStore().find(
              (c) => c.phone.replace(/[^0-9]/g, '') === cleanPhone
            )
            if (storeCustomer) {
              name = storeCustomer.name
              userId = storeCustomer.id
            }
          }
        }
      }
    }

    const redirectUrl =
      role === 'admin'
        ? '/admin/dashboard'
        : role === 'mistri'
        ? '/mistri/profile'
        : '/'

    return NextResponse.json({
      success: true,
      message: 'ওটিপি সফলভাবে যাচাই করা হয়েছে',
      redirectUrl,
      user: {
        id: userId,
        phone: cleanPhone,
        name,
        role,
        status,
        redirectUrl,
      },
    })
  } catch (error: any) {
    console.error('Error in verify-otp:', error)
    return NextResponse.json(
      { success: false, error: 'সার্ভার ত্রুটি, পুনরায় চেষ্টা করুন' },
      { status: 500 }
    )
  }
}
