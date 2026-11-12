import { NextRequest, NextResponse } from 'next/server'
import { ACTIVE_LIVE_TRACKING_SESSIONS } from '../ping/route'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params
  let session = ACTIVE_LIVE_TRACKING_SESSIONS[bookingId]

  // If not found in memory, try fetching from Supabase location_shares
  if (!session || !session.is_active) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingId)
    if (isUuid) {
      try {
        const supabase = createAdminClient() as any
        const { data: ls } = await supabase
          .from('location_shares')
          .select('*')
          .eq('booking_id', bookingId)
          .maybeSingle()

        if (ls && ls.is_active && ls.last_latitude && ls.last_longitude) {
          session = {
            bookingId,
            latitude: Number(ls.last_latitude),
            longitude: Number(ls.last_longitude),
            heading: Number(ls.last_heading || 0),
            speed: Number(ls.last_speed || 0),
            accuracy: null,
            is_active: ls.is_active,
            last_ping_at: ls.last_ping_at,
          }
          ACTIVE_LIVE_TRACKING_SESSIONS[bookingId] = session
        }
      } catch (err) {
        console.warn('Failed to query location_shares:', err)
      }
    }
  }

  if (!session || !session.is_active) {
    return NextResponse.json({
      success: true,
      is_active: false,
      message: 'No active live tracking session for this booking',
    })
  }

  return NextResponse.json({
    success: true,
    is_active: true,
    data: session,
  })
}
