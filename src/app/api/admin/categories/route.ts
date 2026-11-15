import { NextRequest, NextResponse } from 'next/server'
import { getCategoriesStore, CategoryOption, SubcategoryOption, DEFAULT_CATEGORIES } from '@/lib/categories'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

async function getMergedCategories(supabase: any) {
  try {
    const { data: dbCategories, error } = await supabase
      .from('categories')
      .select('id, name_bn, name_en, slug, icon_url, display_order, is_active, subcategories(id, category_id, name_bn, name_en, slug, is_active)')
      .order('display_order', { ascending: true })

    if (!error && dbCategories && dbCategories.length > 0) {
      return dbCategories.map((c: any) => ({
        id: c.slug || c.id,
        db_id: c.id,
        name_bn: c.name_bn,
        name_en: c.name_en,
        slug: c.slug,
        icon: c.icon_url || 'Layers',
        display_order: c.display_order,
        is_active: c.is_active ?? true,
        subcategories: (c.subcategories || []).map((s: any) => ({
          id: s.slug || s.id,
          db_id: s.id,
          name_bn: s.name_bn,
          name_en: s.name_en,
          slug: s.slug,
          is_active: s.is_active ?? true,
        })),
      }))
    }
  } catch (err) {
    console.warn('getMergedCategories Supabase error:', err)
  }

  const store = getCategoriesStore()
  return store
}

export async function GET() {
  const supabase = createAdminClient() as any
  const categories = await getMergedCategories(supabase)
  return NextResponse.json({
    success: true,
    categories,
  }, { headers: NO_CACHE_HEADERS })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient() as any
    const body = await request.json()
    const { action, type, categoryId, subcategoryId, name_bn, name_en, slug, icon } = body
    const store = getCategoriesStore()

    // ── Toggle Active / Inactive ─────────────────────────────────────────────
    if (action === 'toggle_active') {
      if (type === 'category' && categoryId) {
        // Find existing state
        const { data: existing } = await supabase
          .from('categories')
          .select('id, is_active')
          .or(`slug.eq.${categoryId},id.eq.${categoryId}`)
          .maybeSingle()

        if (existing) {
          await supabase
            .from('categories')
            .update({ is_active: !existing.is_active })
            .eq('id', existing.id)
        }

        const cat = store.find((c) => c.id === categoryId || c.slug === categoryId)
        if (cat) cat.is_active = !cat.is_active

        const updatedCategories = await getMergedCategories(supabase)
        return NextResponse.json({ success: true, categories: updatedCategories }, { headers: NO_CACHE_HEADERS })
      }

      if (type === 'subcategory' && categoryId && subcategoryId) {
        const { data: existingSub } = await supabase
          .from('subcategories')
          .select('id, is_active')
          .or(`slug.eq.${subcategoryId},id.eq.${subcategoryId}`)
          .maybeSingle()

        if (existingSub) {
          await supabase
            .from('subcategories')
            .update({ is_active: !existingSub.is_active })
            .eq('id', existingSub.id)
        }

        const cat = store.find((c) => c.id === categoryId || c.slug === categoryId)
        if (cat) {
          const sub = cat.subcategories.find((s) => s.id === subcategoryId || s.slug === subcategoryId)
          if (sub) sub.is_active = !sub.is_active
        }

        const updatedCategories = await getMergedCategories(supabase)
        return NextResponse.json({ success: true, categories: updatedCategories }, { headers: NO_CACHE_HEADERS })
      }
    }

    // ── Add New Category ─────────────────────────────────────────────────────
    if (type === 'category') {
      if (!name_bn || !name_en) {
        return NextResponse.json({ error: 'Name in Bengali and English is required' }, { status: 400 })
      }

      const rawSlug = slug || name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const selectedIcon = icon || 'Layers'

      // Check if slug exists in DB to prevent duplicate conflict
      let finalSlug = rawSlug
      const { data: existingSlug } = await supabase.from('categories').select('id').eq('slug', rawSlug).maybeSingle()
      if (existingSlug) {
        finalSlug = `${rawSlug}-${Date.now().toString().slice(-4)}`
      }

      // 1. Insert into Supabase
      const { data: dbInserted, error: insertErr } = await supabase
        .from('categories')
        .insert({
          name_bn,
          name_en,
          slug: finalSlug,
          icon_url: selectedIcon,
          display_order: store.length + 1,
          is_active: true,
        })
        .select()
        .single()

      if (insertErr) {
        console.error('Supabase category insert error:', insertErr)
      }

      // 2. Also keep in-memory store in sync
      const newCategory: CategoryOption = {
        id: finalSlug,
        name_bn,
        name_en,
        slug: finalSlug,
        icon: selectedIcon,
        display_order: store.length + 1,
        is_active: true,
        subcategories: [],
      }
      store.push(newCategory)

      const updatedCategories = await getMergedCategories(supabase)
      return NextResponse.json({
        success: true,
        category: dbInserted || newCategory,
        categories: updatedCategories,
      }, { headers: NO_CACHE_HEADERS })
    }

    // ── Add New Subcategory ──────────────────────────────────────────────────
    if (type === 'subcategory') {
      if (!categoryId || !name_bn || !name_en) {
        return NextResponse.json({ error: 'Category ID and names are required' }, { status: 400 })
      }

      const rawSubSlug = slug || name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      let finalSubSlug = rawSubSlug

      // Check if subcategory slug exists in DB
      const { data: existingSubSlug } = await supabase.from('subcategories').select('id').eq('slug', rawSubSlug).maybeSingle()
      if (existingSubSlug) {
        finalSubSlug = `${rawSubSlug}-${Date.now().toString().slice(-4)}`
      }

      // Find category in DB by slug or UUID
      const { data: dbCat } = await supabase
        .from('categories')
        .select('id')
        .or(`slug.eq.${categoryId},id.eq.${categoryId}`)
        .maybeSingle()

      if (dbCat?.id) {
        const { error: subErr } = await supabase.from('subcategories').insert({
          category_id: dbCat.id,
          name_bn,
          name_en,
          slug: finalSubSlug,
          is_active: true,
        })
        if (subErr) {
          console.error('Supabase subcategory insert error:', subErr)
        }
      }

      // Also update in-memory
      const targetCat = store.find((c) => c.id === categoryId || c.slug === categoryId)
      if (targetCat) {
        targetCat.subcategories.push({
          id: finalSubSlug,
          name_bn,
          name_en,
          slug: finalSubSlug,
          is_active: true,
        })
      }

      const updatedCategories = await getMergedCategories(supabase)
      return NextResponse.json({ success: true, categories: updatedCategories }, { headers: NO_CACHE_HEADERS })
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })
  } catch (err: any) {
    console.error('Category POST API error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createAdminClient() as any
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const categoryId = searchParams.get('categoryId')
    const subcategoryId = searchParams.get('subcategoryId')
    const store = getCategoriesStore()

    if (type === 'category' && categoryId) {
      await supabase
        .from('categories')
        .delete()
        .or(`slug.eq.${categoryId},id.eq.${categoryId}`)

      const idx = store.findIndex((c) => c.id === categoryId || c.slug === categoryId)
      if (idx !== -1) {
        store.splice(idx, 1)
      }

      const updatedCategories = await getMergedCategories(supabase)
      return NextResponse.json({ success: true, categories: updatedCategories }, { headers: NO_CACHE_HEADERS })
    }

    if (type === 'subcategory' && categoryId && subcategoryId) {
      await supabase
        .from('subcategories')
        .delete()
        .or(`slug.eq.${subcategoryId},id.eq.${subcategoryId}`)

      const cat = store.find((c) => c.id === categoryId || c.slug === categoryId)
      if (cat) {
        cat.subcategories = cat.subcategories.filter((s) => s.id !== subcategoryId && s.slug !== subcategoryId)
      }

      const updatedCategories = await getMergedCategories(supabase)
      return NextResponse.json({ success: true, categories: updatedCategories }, { headers: NO_CACHE_HEADERS })
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
