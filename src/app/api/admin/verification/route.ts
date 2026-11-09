import { NextRequest, NextResponse } from 'next/server'
import { getApplicantsStore } from '@/lib/mistri-store'
import { getApplicantsFromSupabase } from '@/lib/supabase-service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status') || 'all'

    // 1. Fetch from Supabase
    let supabaseApplicants: any[] = []
    try {
      supabaseApplicants = await getApplicantsFromSupabase(statusParam)
    } catch (e) {
      console.warn('Supabase getApplicants error:', e)
    }

    // 2. Fetch from in-memory applicants store
    const store = getApplicantsStore()

    // 3. Merge and deduplicate by phone or id
    const combined: any[] = []
    const seenPhones = new Set<string>()

    // Priority 1: Supabase applicants
    for (const sa of supabaseApplicants) {
      const cleanPhone = (sa.phone || '').replace(/[^0-9]/g, '')
      if (cleanPhone) seenPhones.add(cleanPhone)
      combined.push(sa)
    }

    // Priority 2: Store applicants (only if not already in Supabase)
    for (const a of store) {
      const cleanPhone = (a.phone || '').replace(/[^0-9]/g, '')
      if (!cleanPhone || !seenPhones.has(cleanPhone)) {
        if (cleanPhone) seenPhones.add(cleanPhone)
        combined.push(a)
      }
    }

    // Filter by status if not 'all'
    const filtered = statusParam === 'all' 
      ? combined 
      : combined.filter(a => a.status === statusParam)

    const pendingTotal = combined.filter(a => a.status === 'pending').length
    const approvedTotal = combined.filter(a => a.status === 'approved').length

    return NextResponse.json({
      success: true,
      count: pendingTotal,
      pendingCount: pendingTotal,
      approvedCount: approvedTotal,
      totalCount: combined.length,
      applicants: filtered,
    }, { headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}
