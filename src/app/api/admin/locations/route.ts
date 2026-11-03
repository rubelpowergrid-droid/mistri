import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createLocationSchema = z.object({
  type: z.enum(['district', 'upazila', 'area']),
  parent_id: z.string().optional(),
  name_bn: z.string().min(2),
  name_en: z.string().min(2),
})

export async function GET() {
  return NextResponse.json({
    success: true,
    districts: [
      {
        id: '1',
        name_bn: 'ঠাকুরগাঁও',
        name_en: 'Thakurgaon',
        upazilas: ['ঠাকুরগাঁও সদর', 'পীরগঞ্জ', 'রাণীশংকৈল', 'হরিপুর', 'বালিয়াডাঙ্গী'],
      },
      {
        id: '2',
        name_bn: 'পঞ্চগড়',
        name_en: 'Panchagarh',
        upazilas: ['পঞ্চগড় সদর', 'বোদা', 'দেবীগঞ্জ', 'আটোয়ারী', 'তেঁতুলিয়া'],
      },
      {
        id: '3',
        name_bn: 'দিনাজপুর',
        name_en: 'Dinajpur',
        upazilas: ['দিনাজপুর সদর', 'বীরগঞ্জ', 'কাহারোল', 'বোচাগঞ্জ', 'পার্বতীপুর'],
      },
    ],
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createLocationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid location payload', details: parsed.error.format() },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${parsed.data.type} created successfully`,
      data: {
        id: 'loc-' + Date.now(),
        ...parsed.data,
        is_active: true,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to create location', message: err.message },
      { status: 500 }
    )
  }
}
