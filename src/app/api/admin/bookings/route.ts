import { NextRequest, NextResponse } from 'next/server'
import { getAdminBookingsData } from '@/lib/admin-data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
}

export async function GET(request: NextRequest) {
  try {
    const data = await getAdminBookingsData()
    return NextResponse.json(
      {
        success: true,
        bookings: data.bookings,
        totalBookings: data.totalBookings,
        completedBookings: data.completedBookings,
      },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'বুকিং ডাটা লোড করতে সমস্যা হয়েছে' },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}

