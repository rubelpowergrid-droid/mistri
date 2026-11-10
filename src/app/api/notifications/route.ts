import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getBookingsStore } from '@/lib/mistri-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

// Sample notifications for demonstration or unauthenticated sessions
const DEMO_NOTIFICATIONS = [
  {
    id: 'notif-1',
    user_id: 'guest',
    title: 'বুকিং গৃহীত হয়েছে!',
    body: 'মিস্ত্রি রফিকুল ইসলাম আপনার বুকিং গ্রহণ করেছেন এবং প্রস্তুত হচ্ছেন।',
    type: 'booking' as const,
    reference_id: 'bk-demo-1',
    is_read: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: 'guest',
    title: 'এনআইডি ও প্রোফাইল ভেরিফিকেশন সফল',
    body: 'অভিনন্দন! আপনার প্রোফাইল অ্যাডমিন কর্তৃক ভেরিফাইড হয়েছে। এখন আপনার নামে ভেরিফাইড ব্লু ব্যাজ দৃশ্যমান।',
    type: 'verification' as const,
    reference_id: null,
    is_read: true,
    created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    user_id: 'guest',
    title: 'নতুন সেবাকেন্দ্র চালু: ঠাকুরগাঁও সদর',
    body: 'ঠাকুরগাঁও সদর এলাকায় এখন ৬০+ ভেরিফাইড মিস্ত্রি তাৎক্ষণিক সেবায় প্রস্তুত।',
    type: 'system' as const,
    reference_id: null,
    is_read: true,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const phoneParam = searchParams.get('phone') || ''
  const cleanPhone = phoneParam.replace(/[^0-9]/g, '')

  try {
    const adminSupabase = createAdminClient() as any
    let userId: string | null = null

    // 1. Try to get user from cookie session
    try {
      const serverSupabase: any = await createClient()
      const { data: { user } } = await serverSupabase.auth.getUser()
      if (user?.id) userId = user.id
    } catch {}

    // 2. If no cookie user, resolve by cleanPhone
    if (!userId && cleanPhone) {
      const { data: u } = await adminSupabase
        .from('users')
        .select('id')
        .eq('phone', cleanPhone)
        .maybeSingle()
      if (u?.id) userId = u.id
    }

    let realNotifications: any[] = []

    if (userId) {
      const { data: notifs } = await adminSupabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30)
      if (notifs) realNotifications = notifs
    }

    // 3. Inject pending bookings notifications from in-memory store for this phone
    if (cleanPhone) {
      const memoryBookings = getBookingsStore()
      const mistriPending = memoryBookings.filter(
        (b) =>
          b.status === 'pending' &&
          (b.mistriPhone || '').replace(/[^0-9]/g, '') === cleanPhone
      )

      for (const pb of mistriPending) {
        const notifId = `notif-booking-${pb.id}`
        const exists = realNotifications.some((n) => n.reference_id === pb.id || n.id === notifId)
        if (!exists) {
          realNotifications.unshift({
            id: notifId,
            user_id: userId || 'mistri-session',
            title: '🔔 নতুন কাজের বুকিং অনুরোধ!',
            body: `গ্রাহক ${pb.customerPhone || 'গ্রাহক'} আপনার কাজের জন্য একটি নতুন বুকিং অনুরোধ পাঠিয়েছেন। কাজের ধরন: ${pb.serviceName || 'সাধারণ সেবা'}। ঠিকানা: ${pb.jobAddress || pb.location}`,
            type: 'booking' as const,
            reference_id: pb.id,
            is_read: false,
            created_at: pb.createdAt || new Date().toISOString(),
          })
        }
      }
    }

    const finalList = realNotifications.length > 0 ? realNotifications : DEMO_NOTIFICATIONS
    const unreadCount = finalList.filter((n: any) => !n.is_read).length

    return NextResponse.json({
      notifications: finalList,
      unreadCount,
    }, { headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    console.error('GET /api/notifications error:', err)
    return NextResponse.json({
      notifications: DEMO_NOTIFICATIONS,
      unreadCount: DEMO_NOTIFICATIONS.filter((n) => !n.is_read).length,
    }, { headers: NO_CACHE_HEADERS })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, markAll, phone } = body
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '')

    const adminSupabase = createAdminClient() as any
    let userId: string | null = null

    try {
      const serverSupabase: any = await createClient()
      const { data: { user } } = await serverSupabase.auth.getUser()
      if (user?.id) userId = user.id
    } catch {}

    if (!userId && cleanPhone) {
      const { data: u } = await adminSupabase
        .from('users')
        .select('id')
        .eq('phone', cleanPhone)
        .maybeSingle()
      if (u?.id) userId = u.id
    }

    if (userId) {
      if (markAll) {
        await adminSupabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userId)
          .eq('is_read', false)
      } else if (id && !id.startsWith('notif-booking-')) {
        await adminSupabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id)
          .eq('user_id', userId)
      }
    }

    return NextResponse.json({ success: true, message: 'Notification marked as read' }, { headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    console.error('Error updating notification:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}
