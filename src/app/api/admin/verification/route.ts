import { NextRequest, NextResponse } from 'next/server'
import { getApplicantsStore } from '@/lib/mistri-store'
import { getApplicantsFromSupabase } from '@/lib/supabase-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status') || 'pending'

    // 1. Fetch pending from Supabase
    let supabaseApplicants: any[] = []
    try {
      supabaseApplicants = await getApplicantsFromSupabase()
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

    // Priority 2: Store applicants
    for (const a of store) {
      const cleanPhone = (a.phone || '').replace(/[^0-9]/g, '')
      if (!cleanPhone || !seenPhones.has(cleanPhone)) {
        if (cleanPhone) seenPhones.add(cleanPhone)
        combined.push(a)
      }
    }

    // Filter by status (default 'pending' so approved/rejected disappear from verification)
    const filtered = statusParam === 'all' 
      ? combined 
      : combined.filter(a => a.status === statusParam)

    return NextResponse.json({
      success: true,
      count: filtered.length,
      applicants: filtered,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

