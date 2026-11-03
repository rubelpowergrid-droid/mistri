import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const verificationActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'request_correction']),
  internalNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = verificationActionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid verification payload', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { action, internalNotes, rejectionReason } = parsed.data

    // In production with connected Supabase instance:
    // Update mistri_profiles set approval_status = action === 'approve' ? 'approved' : 'rejected'
    // Insert into admin_activity_logs
    // Send in-app / push notification to worker

    return NextResponse.json({
      success: true,
      mistriId: id,
      actionApplied: action,
      status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'under_review',
      message: action === 'approve' 
        ? 'Mistri account verified and approved successfully.'
        : 'Mistri verification updated.',
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: err.message },
      { status: 500 }
    )
  }
}

