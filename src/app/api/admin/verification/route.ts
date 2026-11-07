import { NextRequest, NextResponse } from 'next/server'
import { getApplicantsStore } from '@/lib/mistri-store'

export async function GET(request: NextRequest) {
  try {
    const store = getApplicantsStore()
    return NextResponse.json({
      success: true,
      count: store.length,
      applicants: store,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
