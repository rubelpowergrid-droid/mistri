import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'scheduled', 'in_progress', 'completed', 'cancelled', 'disputed']),
  agreedPrice: z.number().optional(),
  reason: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = updateStatusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid status payload', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { status, agreedPrice, reason } = parsed.data

    // In production:
    // Update bookings table
    // Insert into booking_status_logs
    // Recalculate Mistri completed jobs if status === 'completed'
    // Teardown location_shares if status in ('completed', 'cancelled', 'rejected')

    return NextResponse.json({
      success: true,
      bookingId: id,
      newStatus: status,
      agreedPrice: agreedPrice || null,
      reason: reason || null,
      timestamp: new Date().toISOString(),
      message: `Booking transitioned to ${status}`,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to update booking status', message: err.message },
      { status: 500 }
    )
  }
}

