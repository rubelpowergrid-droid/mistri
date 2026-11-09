import { NextRequest, NextResponse } from 'next/server'
import { getCategoriesStore, CategoryOption, SubcategoryOption } from '@/lib/categories'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient() as any
    const { data: dbCategories, error } = await supabase
      .from('categories')
      .select('id, name_bn, name_en, slug, icon, display_order, is_active, subcategories(id, category_id, name_bn, name_en, slug, is_active)')
      .order('display_order', { ascending: true })

    if (!error && dbCategories && dbCategories.length > 0) {
      return NextResponse.json({
        success: true,
        categories: dbCategories.map((c: any) => ({
          id: c.slug || c.id,
          name_bn: c.name_bn,
          name_en: c.name_en,
          slug: c.slug,
          icon: c.icon || 'Layers',
          display_order: c.display_order,
          is_active: c.is_active ?? true,
          subcategories: (c.subcategories || []).map((s: any) => ({
            id: s.slug || s.id,
            name_bn: s.name_bn,
            name_en: s.name_en,
            slug: s.slug,
            is_active: s.is_active ?? true,
          })),
        })),
      })
    }
  } catch (err) {
    console.warn('Supabase categories fetch warning, falling back to memory store:', err)
  }

  const store = getCategoriesStore()
  return NextResponse.json({
    success: true,
    categories: store,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, type, categoryId, subcategoryId, name_bn, name_en, slug } = body
    const store = getCategoriesStore()

    if (action === 'toggle_active') {
      if (type === 'category' && categoryId) {
        const cat = store.find((c) => c.id === categoryId || c.slug === categoryId)
        if (cat) cat.is_active = !cat.is_active
        return NextResponse.json({ success: true, categories: store })
      }
      if (type === 'subcategory' && categoryId && subcategoryId) {
        const cat = store.find((c) => c.id === categoryId || c.slug === categoryId)
        if (cat) {
          const sub = cat.subcategories.find((s) => s.id === subcategoryId || s.slug === subcategoryId)
          if (sub) sub.is_active = !sub.is_active
        }
        return NextResponse.json({ success: true, categories: store })
      }
    }

    if (type === 'category') {
      if (!name_bn || !name_en) {
        return NextResponse.json({ error: 'Name in Bengali and English is required' }, { status: 400 })
      }
      const catSlug = slug || name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const newCategory: CategoryOption = {
        id: catSlug,
        name_bn,
        name_en,
        slug: catSlug,
        icon: 'Layers',
        display_order: store.length + 1,
        is_active: true,
        subcategories: [],
      }
      store.push(newCategory)

      // Optionally insert in Supabase
      try {
        const supabase = createAdminClient() as any
        await supabase.from('categories').insert({
          name_bn,
          name_en,
          slug: catSlug,
          display_order: store.length,
          is_active: true,
        })
      } catch (err) {
        console.warn('Supabase category insert note:', err)
      }

      return NextResponse.json({ success: true, category: newCategory, categories: store })
    }

    if (type === 'subcategory') {
      if (!categoryId || !name_bn || !name_en) {
        return NextResponse.json({ error: 'Category ID and names are required' }, { status: 400 })
      }
      const targetCat = store.find((c) => c.id === categoryId || c.slug === categoryId)
      if (!targetCat) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }

      const subSlug = slug || name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const newSub: SubcategoryOption = {
        id: subSlug,
        name_bn,
        name_en,
        slug: subSlug,
        is_active: true,
      }
      targetCat.subcategories.push(newSub)

      // Optionally insert in Supabase
      try {
        const supabase = createAdminClient() as any
        const { data: dbCat } = await supabase.from('categories').select('id').eq('slug', targetCat.slug).maybeSingle()
        if (dbCat?.id) {
          await supabase.from('subcategories').insert({
            category_id: dbCat.id,
            name_bn,
            name_en,
            slug: subSlug,
            is_active: true,
          })
        }
      } catch (err) {
        console.warn('Supabase subcategory insert note:', err)
      }

      return NextResponse.json({ success: true, subcategory: newSub, categories: store })
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })
  } catch (err: any) {
    console.error('Category POST API error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const categoryId = searchParams.get('categoryId')
    const subcategoryId = searchParams.get('subcategoryId')
    const store = getCategoriesStore()

    if (type === 'category' && categoryId) {
      const idx = store.findIndex((c) => c.id === categoryId || c.slug === categoryId)
      if (idx !== -1) {
        store.splice(idx, 1)
      }
      return NextResponse.json({ success: true, categories: store })
    }

    if (type === 'subcategory' && categoryId && subcategoryId) {
      const cat = store.find((c) => c.id === categoryId || c.slug === categoryId)
      if (cat) {
        cat.subcategories = cat.subcategories.filter((s) => s.id !== subcategoryId && s.slug !== subcategoryId)
      }
      return NextResponse.json({ success: true, categories: store })
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
