import { NextRequest, NextResponse } from 'next/server'
import { getAdminDashboardStats } from '@/lib/mistri-store'

export async function GET(request: NextRequest) {
  try {
    const stats = getAdminDashboardStats()
    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

