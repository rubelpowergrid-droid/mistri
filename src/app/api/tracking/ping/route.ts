import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

const pingSchema = z.object({
  bookingId: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  heading: z.number().optional().nullable(),
  speed: z.number().optional().nullable(),
  accuracy: z.number().optional().nullable(),
})

// Ephemeral active location store in globalThis for persistence across serverless hot instances
declare global {
  // eslint-disable-next-line no-var
  var __MISTRI_LIVE_SESSIONS__: Record<string, any> | undefined
}

if (!globalThis.__MISTRI_LIVE_SESSIONS__) {
  globalThis.__MISTRI_LIVE_SESSIONS__ = {}
}

export const ACTIVE_LIVE_TRACKING_SESSIONS = globalThis.__MISTRI_LIVE_SESSIONS__

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

    const { bookingId, latitude, longitude, heading, speed, accuracy } = parsed.data

    const sessionData = {
      bookingId,
      latitude,
      longitude,
      heading: heading || 0,
      speed: speed || 0,
      accuracy: accuracy || null,
      is_active: true,
      last_ping_at: new Date().toISOString(),
    }

    ACTIVE_LIVE_TRACKING_SESSIONS[bookingId] = sessionData

    // Also persist to Supabase location_shares if bookingId is a valid UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingId)
    if (isUuid) {
      try {
        const supabase = createAdminClient() as any
        await supabase
          .from('location_shares')
          .update({
            is_active: true,
            last_latitude: latitude,
            last_longitude: longitude,
            last_speed: speed || 0,
            last_heading: heading || 0,
            last_ping_at: new Date().toISOString(),
          })
          .eq('booking_id', bookingId)
      } catch (dbErr) {
        console.warn('Supabase location_shares ping update warning:', dbErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Location ping received',
      session: sessionData,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to record GPS ping', message: err.message },
      { status: 500 }
    )
  }
}
