import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { updateBookingInStore } from '@/lib/mistri-store'
import { updateBookingStatusInSupabase } from '@/lib/supabase-service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'scheduled', 'in_progress', 'completed', 'cancelled', 'disputed']),
  agreedPrice: z.number().optional(),
  reason: z.string().optional(),
  proposedDate: z.string().optional(),
  proposedTime: z.string().optional(),
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
        { status: 400, headers: NO_CACHE_HEADERS }
      )
    }

    const { status, agreedPrice, reason, proposedDate, proposedTime } = parsed.data

    // 1. Update in Supabase
    try {
      await updateBookingStatusInSupabase(id, status, {
        agreedPrice,
        reason,
        proposedDate,
        proposedTime,
      })
    } catch (e: any) {
      console.warn('Supabase status update warning:', e.message)
    }

    // 2. Update in-memory server store
    const updated = updateBookingInStore(id, {
      status,
      agreedPrice: agreedPrice !== undefined ? agreedPrice : undefined,
      cancellationReason: reason || null,
      proposedDate: proposedDate || null,
      proposedTime: proposedTime || null,
    })

    return NextResponse.json({
      success: true,
      bookingId: id,
      newStatus: status,
      agreedPrice: agreedPrice || null,
      reason: reason || null,
      proposedDate: proposedDate || null,
      proposedTime: proposedTime || null,
      booking: updated,
      message: `Booking transitioned to ${status}`,
    }, { headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to update booking status', message: err.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
