import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEFAULT_CATEGORIES } from '@/lib/categories'
import { getApprovedMistrisFromSupabase, getPersistentAccountState } from '@/lib/supabase-service'
import { INITIAL_APPROVED_MISTRIS, getTrashedMistriIds, getSuspendedMistriIds } from '@/lib/mistri-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET() {
  try {
    const supabase = createAdminClient() as any

    // 1. Fetch categories & subcategories from Supabase
    let categoriesList: any[] = []
    try {
      const { data: dbCategories, error } = await supabase
        .from('categories')
        .select('id, name_bn, name_en, slug, icon_url, display_order, is_active, subcategories(id, category_id, name_bn, name_en, slug, is_active)')
        .order('display_order', { ascending: true })

      if (!error && dbCategories && dbCategories.length > 0) {
        categoriesList = dbCategories.map((c: any) => ({
          id: c.slug || c.id,
          name_bn: c.name_bn,
          name_en: c.name_en,
          slug: c.slug,
          icon: c.icon_url || 'Layers',
          display_order: c.display_order,
          is_active: c.is_active ?? true,
          subcategories: (c.subcategories || []).map((s: any) => ({
            id: s.slug || s.id,
            name_bn: s.name_bn,
            name_en: s.name_en,
            slug: s.slug,
            is_active: s.is_active ?? true,
          })),
        }))
      }
    } catch (dbErr) {
      console.warn('Categories DB fetch error:', dbErr)
    }

    if (categoriesList.length === 0) {
      categoriesList = DEFAULT_CATEGORIES.map(c => ({
        ...c,
        is_active: c.is_active ?? true,
      }))
    }

    // 2. Fetch live approved mistris to compute REAL active counts
    let approvedMistris: any[] = []
    try {
      approvedMistris = await getApprovedMistrisFromSupabase()
    } catch {}

    const persistentState = await getPersistentAccountState()
    const trashedSet = new Set([...Array.from(getTrashedMistriIds()), ...persistentState.trashedMistriIds])
    const suspendedSet = new Set([...Array.from(getSuspendedMistriIds()), ...persistentState.suspendedMistriIds])
    const deletedSet = new Set(persistentState.deletedMistriIds)

    const liveMemory = (global as any).__APPROVED_MISTRIS__ || INITIAL_APPROVED_MISTRIS
    const rawMistris = [...approvedMistris, ...liveMemory]
    const seen = new Set<string>()
    const activeMistris: any[] = []

    for (const m of rawMistris) {
      if (deletedSet.has(m.id)) continue
      if (trashedSet.has(m.id) || m.status === 'trash' || m.deleted_at) continue
      if (suspendedSet.has(m.id) || m.status === 'suspended') continue
      const key = (m.phone || '').replace(/[^0-9]/g, '') || m.id
      if (!seen.has(key)) {
        seen.add(key)
        activeMistris.push(m)
      }
    }

    // 3. Map mistri count per category
    const categoriesWithCount = categoriesList.map((cat) => {
      const activeCount = activeMistris.filter((m) => {
        if (m.category_slug && m.category_slug === cat.slug) return true
        if (m.category && (m.category === cat.name_bn || m.category === cat.name_en)) return true
        return false
      }).length

      return {
        ...cat,
        mistriCount: activeCount,
        subcategories: (cat.subcategories || []).map((s: any) => typeof s === 'string' ? s : s.name_bn),
      }
    })

    return NextResponse.json({
      success: true,
      categories: categoriesWithCount,
    }, { headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
