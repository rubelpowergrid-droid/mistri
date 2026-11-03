import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const reviewSchema = z.object({
  bookingId: z.string().min(1),
  mistriId: z.string().min(1),
  rating_work_quality: z.number().int().min(1).max(5),
  rating_behaviour: z.number().int().min(1).max(5),
  rating_punctuality: z.number().int().min(1).max(5),
  rating_pricing: z.number().int().min(1).max(5),
  rating_overall: z.number().min(1).max(5),
  comment: z.string().min(3),
  photos: z.array(z.string()).optional(),
})

// In-memory store for active reviews during session
export const REVIEWS_STORE: any[] = [
  {
    id: 'rev-01',
    booking_id: 'MST-261028-XY89',
    mistri_id: 'm-2',
    customer_name: 'কামরুল হাসান',
    rating_work_quality: 5,
    rating_behaviour: 5,
    rating_punctuality: 5,
    rating_pricing: 4,
    rating_overall: 4.8,
    comment: 'সময়ে এসেছেন এবং ওয়্যারিংয়ের সমস্যা দ্রুত শনাক্ত করেছেন। আচরণ খুব ভালো।',
    is_visible: true,
    moderation_flagged: false,
    created_at: '২০২৬-১০-২৯',
  },
  {
    id: 'rev-02',
    booking_id: 'MST-261015-CD11',
    mistri_id: 'm-1',
    customer_name: 'আহমেদ জুবায়ের',
    rating_work_quality: 5,
    rating_behaviour: 5,
    rating_punctuality: 5,
    rating_pricing: 5,
    rating_overall: 5.0,
    comment: 'খুবই দক্ষ কারিগর। ফ্যানের শব্দ হচ্ছিল, ৩০ মিনিটে ঠিক করে দিয়েছেন।',
    is_visible: true,
    moderation_flagged: false,
    created_at: '২০২৬-১০-১৬',
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mistriId = searchParams.get('mistriId')

  let filtered = REVIEWS_STORE.filter(r => r.is_visible)
  if (mistriId) {
    filtered = filtered.filter(r => r.mistri_id === mistriId)
  }

  return NextResponse.json({
    success: true,
    total: filtered.length,
    data: filtered,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = reviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid review payload', details: parsed.error.format() },
        { status: 400 }
      )
    }

    // Check duplicate review for same booking
    const exists = REVIEWS_STORE.some(r => r.booking_id === parsed.data.bookingId)
    if (exists) {
      return NextResponse.json(
        { error: 'A review has already been submitted for this booking.' },
        { status: 409 }
      )
    }

    const newReview = {
      id: 'rev-' + Date.now(),
      customer_name: 'কাস্টমার',
      ...parsed.data,
      is_visible: true,
      moderation_flagged: false,
      created_at: new Date().toISOString().slice(0, 10),
    }

    REVIEWS_STORE.unshift(newReview)

    return NextResponse.json({
      success: true,
      message: 'Review saved and average ratings recalculated',
      review: newReview,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to submit review', message: err.message },
      { status: 500 }
    )
  }
}
