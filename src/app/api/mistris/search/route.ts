import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

// Sample comprehensive seed data for live search and filtering
export const MISTRI_DIRECTORY: any[] = []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.toLowerCase() || ''
  const category = searchParams.get('category') || ''
  const subcategory = searchParams.get('subcat') || ''
  const district = searchParams.get('district') || ''
  const minRating = Number(searchParams.get('rating') || 0)
  const minExp = Number(searchParams.get('exp') || 0)
  const minJobs = Number(searchParams.get('jobs') || 0)
  const maxPrice = Number(searchParams.get('maxPrice') || 999999)
  const verifiedOnly = searchParams.get('verified') === 'true'
  const availableToday = searchParams.get('today') === 'true'
  const maxDistance = Number(searchParams.get('distance') || 999)
  const sortBy = searchParams.get('sort') || 'nearest'

  let supabaseMistris: any[] = []
  try {
    const { getApprovedMistrisFromSupabase } = await import('@/lib/supabase-service')
    supabaseMistris = await getApprovedMistrisFromSupabase()
  } catch (err) {
    console.error('Supabase fetch error in search:', err)
  }

  const { INITIAL_APPROVED_MISTRIS, getTrashedMistriIds, getSuspendedMistriIds } = await import('@/lib/mistri-store')
  const { getPersistentAccountState } = await import('@/lib/supabase-service')
  const persistentState = await getPersistentAccountState()

  const liveMemory = (global as any).__APPROVED_MISTRIS__ || INITIAL_APPROVED_MISTRIS
  const trashedSet = new Set([...Array.from(getTrashedMistriIds()), ...persistentState.trashedMistriIds])
  const suspendedSet = new Set([...Array.from(getSuspendedMistriIds()), ...persistentState.suspendedMistriIds])
  const deletedSet = new Set(persistentState.deletedMistriIds)

  const rawList = [...supabaseMistris, ...liveMemory, ...MISTRI_DIRECTORY]
  const seen = new Set<string>()
  const allMistris: any[] = []
  for (const m of rawList) {
    if (deletedSet.has(m.id)) continue // permanently deleted!
    const key = (m.phone || '').replace(/[^0-9]/g, '') || m.id
    if (!seen.has(key)) {
      seen.add(key)
      allMistris.push(m)
    }
  }
  let filtered = allMistris.filter((m) => {
    // Hide permanently deleted, trashed, or suspended accounts from public view!
    if (deletedSet.has(m.id)) return false
    if (trashedSet.has(m.id) || m.status === 'trash' || m.deleted_at) return false
    if (suspendedSet.has(m.id) || m.status === 'suspended') return false

    // Text search
    if (q) {
      const matchName = m.name_bn.toLowerCase().includes(q) || m.name_en.toLowerCase().includes(q)
      const matchTitle = m.professional_title.toLowerCase().includes(q)
      const matchCategory = m.category_name_bn.includes(q) || m.category_name_en.toLowerCase().includes(q)
      const matchSub = (m.subcategories || []).some((s: string) => s.toLowerCase().includes(q))
      if (!matchName && !matchTitle && !matchCategory && !matchSub) return false
    }

    // Category filter
    if (category && category !== 'all' && m.category_slug !== category) return false

    // Subcategory filter
    if (subcategory && !m.subcategories.includes(subcategory)) return false

    // District filter
    if (district && district !== 'all' && m.district.toLowerCase() !== district.toLowerCase() && m.district_bn !== district) return false

    // Numeric filters
    if (m.average_rating < minRating) return false
    if (m.experience_years < minExp) return false
    if (m.total_completed_jobs < minJobs) return false
    if (m.base_charge > maxPrice) return false
    if (m.distance_km > maxDistance) return false

    // Flag filters
    if (verifiedOnly && !m.is_verified) return false
    if (availableToday && !m.available_today) return false

    return true
  })

  // Sorting
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'highest_rated':
        return b.average_rating - a.average_rating
      case 'most_jobs':
        return b.total_completed_jobs - a.total_completed_jobs
      case 'most_experienced':
        return b.experience_years - a.experience_years
      case 'price_low':
        return a.base_charge - b.base_charge
      case 'price_high':
        return b.base_charge - a.base_charge
      case 'nearest':
      default:
        return a.distance_km - b.distance_km
    }
  })

  return NextResponse.json({
    success: true,
    total: filtered.length,
    data: filtered,
  }, { headers: NO_CACHE_HEADERS })
}

