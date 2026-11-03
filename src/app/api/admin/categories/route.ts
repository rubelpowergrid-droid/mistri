import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createCategorySchema = z.object({
  name_bn: z.string().min(2),
  name_en: z.string().min(2),
  slug: z.string().min(2),
  icon_url: z.string().optional(),
  display_order: z.number().int().default(0),
})

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      { id: '1', name_bn: 'ইলেকট্রিক্যাল কাজ', name_en: 'Electrical Services', slug: 'electrical-services', is_active: true },
      { id: '2', name_bn: 'প্লাম্বিং সার্ভিস', name_en: 'Plumbing Services', slug: 'plumbing-services', is_active: true },
      { id: '3', name_bn: 'রং করার কাজ', name_en: 'Painting Services', slug: 'painting-services', is_active: true },
      { id: '4', name_bn: 'রাজমিস্ত্রীর কাজ', name_en: 'Masonry Services', slug: 'masonry-services', is_active: true },
      { id: '5', name_bn: 'ঘরের টিনের কাজ', name_en: 'Tin Roofing Services', slug: 'tin-roofing-services', is_active: true },
      { id: '6', name_bn: 'কাঠের কাজ', name_en: 'Carpentry Services', slug: 'carpentry-services', is_active: true },
    ],
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createCategorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid category payload', details: parsed.error.format() },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category: {
        id: 'cat-' + Date.now(),
        ...parsed.data,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to create category', message: err.message },
      { status: 500 }
    )
  }
}

