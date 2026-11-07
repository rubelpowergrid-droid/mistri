import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApplicantsStore, updateApplicantStatus } from '@/lib/mistri-store'

const verificationActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'request_correction']),
  internalNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const store = getApplicantsStore()
    const applicant = store.find((a) => a.id === id)

    if (!applicant) {
      return NextResponse.json({ success: false, error: 'Applicant not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, applicant })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

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
    const result = updateApplicantStatus(id, action)

    return NextResponse.json({
      success: true,
      mistriId: id,
      actionApplied: action,
      status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'under_review',
      message: action === 'approve' 
        ? 'Mistri account verified and approved successfully. Now live for public search.'
        : 'Mistri verification updated.',
      applicant: result.applicant,
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: err.message },
      { status: 500 }
    )
  }
}
