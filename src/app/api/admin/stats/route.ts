import { NextRequest, NextResponse } from 'next/server'
import { getAdminOverviewStats } from '@/lib/admin-data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
}

export async function GET(request: NextRequest) {
  try {
    const stats = await getAdminOverviewStats()

    return NextResponse.json(
      {
        success: true,
        stats,
      },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'পরিসংখ্যান লোড করতে সমস্যা হয়েছে' },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
