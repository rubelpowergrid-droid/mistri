import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ACTIVE_LIVE_TRACKING_SESSIONS } from '../ping/route'
import { createAdminClient } from '@/lib/supabase/admin'

const stopSchema = z.object({
  bookingId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = stopSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      )
    }

    const { bookingId } = parsed.data
    if (ACTIVE_LIVE_TRACKING_SESSIONS[bookingId]) {
      ACTIVE_LIVE_TRACKING_SESSIONS[bookingId].is_active = false
      ACTIVE_LIVE_TRACKING_SESSIONS[bookingId].terminated_at = new Date().toISOString()
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingId)
    if (isUuid) {
      try {
        const supabase = createAdminClient() as any
        await supabase
          .from('location_shares')
          .update({
            is_active: false,
            terminated_at: new Date().toISOString(),
          })
          .eq('booking_id', bookingId)
      } catch (dbErr) {
        console.warn('Supabase location_shares stop update warning:', dbErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tracking session terminated and ephemeral data cleared',
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to terminate session', message: err.message },
      { status: 500 }
    )
  }
}
