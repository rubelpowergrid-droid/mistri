import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Sample notifications for demonstration or unauthenticated sessions
const DEMO_NOTIFICATIONS = [
  {
    id: 'notif-1',
    user_id: 'guest',
    title: 'বুকিং গৃহীত হয়েছে!',
    body: 'মিস্ত্রি রফিকুল ইসলাম আপনার বুকিং #BK-20261103-01 গ্রহণ করেছেন এবং প্রস্তুত হচ্ছেন।',
    type: 'booking' as const,
    reference_id: 'bk-demo-1',
    is_read: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'guest',
    title: 'মিস্ত্রি গন্তব্যের উদ্দেশ্যে রওনা হয়েছেন',
    body: 'মিস্ত্রি এখন আপনার ঠিকানার পথে। ম্যাপে লাইভ অবস্থান ট্র্যাক করতে পারেন।',
    type: 'booking' as const,
    reference_id: 'bk-demo-1',
    is_read: false,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
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
    title: 'নতুন সেবাকেন্দ্র চালু: ঠাকুরগাঁও রোড',
    body: 'ঠাকুরগাঁও সদর ও ঠাকুরগাঁও রোড এলাকায় এখন ৬০+ ভেরিফাইড মিস্ত্রি তাৎক্ষণিক সেবায় প্রস্তুত।',
    type: 'system' as const,
    reference_id: null,
    is_read: true,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Return demo data if running in preview/unauthenticated mode
      return NextResponse.json({
        notifications: DEMO_NOTIFICATIONS,
        unreadCount: DEMO_NOTIFICATIONS.filter(n => !n.is_read).length,
      })
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) {
      console.error('Error fetching notifications from Supabase:', error)
      return NextResponse.json({
        notifications: DEMO_NOTIFICATIONS,
        unreadCount: DEMO_NOTIFICATIONS.filter(n => !n.is_read).length,
      })
    }

    const list = notifications || []
    return NextResponse.json({
      notifications: list,
      unreadCount: list.filter((n: any) => !n.is_read).length,
    })
  } catch (err: any) {
    console.error('Unexpected error in GET /api/notifications:', err)
    return NextResponse.json({
      notifications: DEMO_NOTIFICATIONS,
      unreadCount: DEMO_NOTIFICATIONS.filter(n => !n.is_read).length,
    })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const body = await request.json()
    const { id, markAll } = body

    if (!user) {
      return NextResponse.json({ success: true, message: 'Updated (demo session)' })
    }

    if (markAll) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json({ success: true, message: 'All marked as read' })
    }

    if (id) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json({ success: true, message: 'Notification marked as read' })
    }

    return NextResponse.json({ error: 'Missing id or markAll flag' }, { status: 400 })
  } catch (err: any) {
    console.error('Error updating notification:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
