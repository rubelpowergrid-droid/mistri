import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const pingSchema = z.object({
  bookingId: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  heading: z.number().optional(),
  speed: z.number().optional(),
})

// In-memory ephemeral active location store for live session
export const ACTIVE_LIVE_TRACKING_SESSIONS: Record<string, any> = {}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = pingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid location payload', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { bookingId, latitude, longitude, heading, speed } = parsed.data

    ACTIVE_LIVE_TRACKING_SESSIONS[bookingId] = {
      bookingId,
      latitude,
      longitude,
      heading: heading || 0,
      speed: speed || 0,
      is_active: true,
      last_ping_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: 'Location ping received',
      session: ACTIVE_LIVE_TRACKING_SESSIONS[bookingId],
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to record GPS ping', message: err.message },
      { status: 500 }
    )
  }
}
