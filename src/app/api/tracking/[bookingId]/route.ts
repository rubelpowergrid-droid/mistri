import { NextRequest, NextResponse } from 'next/server'
import { ACTIVE_LIVE_TRACKING_SESSIONS } from '../ping/route'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params
  const session = ACTIVE_LIVE_TRACKING_SESSIONS[bookingId]

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

