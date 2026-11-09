import { NextRequest, NextResponse } from 'next/server'
import { getAdminDashboardStats, getApplicantsStore } from '@/lib/mistri-store'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
}

export async function GET(request: NextRequest) {
  try {
    const baseStats = getAdminDashboardStats()
    let pendingCount = 0
    let approvedCount = baseStats.approvedMistris
    let customerCount = baseStats.totalCustomers
    let bookingsCount = baseStats.totalBookings

    try {
      const supabase = createAdminClient() as any
      const [pRes, aRes, cRes, bRes] = await Promise.all([
        supabase.from('mistri_profiles').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending'),
        supabase.from('mistri_profiles').select('*', { count: 'exact', head: true }).eq('approval_status', 'approved'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
      ])

      if (pRes.count !== null && pRes.count !== undefined) {
        pendingCount = pRes.count
      }
      if (aRes.count !== null && aRes.count !== undefined) {
        approvedCount = Math.max(5, aRes.count)
      }
      if (cRes.count !== null && cRes.count !== undefined) {
        customerCount = Math.max(5, cRes.count + 5)
      }
      if (bRes.count !== null && bRes.count !== undefined) {
        bookingsCount = Math.max(baseStats.totalBookings, bRes.count)
      }
    } catch (dbErr) {
      console.warn('Supabase stats query warning:', dbErr)
    }

    // Check store in case any memory applicants haven't synced
    const store = getApplicantsStore()
    const memoryPending = store.filter((a) => a.status === 'pending').length
    if (pendingCount === 0 && memoryPending > 0) {
      pendingCount = memoryPending
    }

    return NextResponse.json({
      success: true,
      stats: {
        ...baseStats,
        pendingVerifications: pendingCount,
        approvedMistris: approvedCount,
        totalCustomers: customerCount,
        totalBookings: bookingsCount,
      },
    }, { headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}
