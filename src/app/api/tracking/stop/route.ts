import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ACTIVE_LIVE_TRACKING_SESSIONS } from '../ping/route'

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

