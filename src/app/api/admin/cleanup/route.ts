import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { clearMemoryStores } from '@/lib/mistri-store'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { target = 'all' } = body

    const supabase = createAdminClient() as any
    const summary: Record<string, any> = {}

    // 1. Clear Bookings & Notifications
    if (target === 'bookings' || target === 'all') {
      try {
        await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        clearMemoryStores({ bookings: true })
        summary.bookings = 'সকল বুকিং ও নোটিফিকেশন সফলভাবে মুছে ফেলা হয়েছে'
      } catch (err: any) {
        summary.bookingsError = err.message
      }
    }

    // 2. Clear Test Customers
    if (target === 'customers' || target === 'all') {
      try {
        await supabase.from('customer_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('users').delete().eq('role', 'customer')
        clearMemoryStores({ customers: true })
        summary.customers = 'সকল টেস্ট গ্রাহক সফলভাবে মুছে ফেলা হয়েছে'
      } catch (err: any) {
        summary.customersError = err.message
      }
    }

    // 3. Clear Test Mistris (except Admin)
    if (target === 'mistris' || target === 'all') {
      try {
        const adminPhones = ['01700000000', '01722092804']
        // Only delete non-admin mistris
        await supabase.from('verification_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('mistri_profiles').delete().not('phone', 'in', `(${adminPhones.join(',')})`)
        await supabase.from('users').delete().eq('role', 'mistri').not('phone', 'in', `(${adminPhones.join(',')})`)
        clearMemoryStores({ applicants: true })
        summary.mistris = 'সকল টেস্ট মিস্ত্রী সফলভাবে মুছে ফেলা হয়েছে (এডমিন সংরক্ষিত)'
      } catch (err: any) {
        summary.mistrisError = err.message
      }
    }

    return NextResponse.json({
      success: true,
      message: 'ডেটাবেজ ও মেমোরি থেকে ডেমো/টেস্ট ডাটা সফলভাবে মুছে ফেলা হয়েছে',
      summary,
    })
  } catch (error: any) {
    console.error('Admin cleanup error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'ডাটা মুছতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}

