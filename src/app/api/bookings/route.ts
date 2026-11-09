import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { addBookingToStore } from '@/lib/mistri-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
}

const createBookingSchema = z.object({
  mistriId: z.string().min(1),
  subcategory: z.string().min(1),
  workDescription: z.string().min(5),
  jobAddress: z.string().min(5),
  latitude: z.number(),
  longitude: z.number(),
  contactPhone: z.string().min(11),
  preferredDate: z.string(),
  preferredTime: z.string(),
  estimatedBudget: z.number().nullable().optional(),
  workPhotos: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') || 'customer'
  const status = searchParams.get('status') || 'all'

  // Mock list of active bookings
    return NextResponse.json({
      success: true,
      data: [
      {
        id: 'b-1',
        booking_number: 'MST-261103-AB12',
        customer_name: 'আহমেদ জুবায়ের',
        mistri_name: 'মোঃ রফিকুল ইসলাম',
        status: 'accepted',
        agreed_price: 400,
        preferred_date: '2026-11-03',
        job_address: 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
      },
      {
        id: 'b-2',
        booking_number: 'MST-261028-XY89',
        customer_name: 'কামরুল হাসান',
        mistri_name: 'আব্দুল করিম',
        status: 'completed',
        agreed_price: 500,
        preferred_date: '2026-10-28',
        job_address: 'সদর হাসপাতাল রোড, ঠাকুরগাঁও',
      },
    ],
  }, { headers: NO_CACHE_HEADERS })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createBookingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid booking payload', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const bookingNumber = 'MST-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()

    const newBooking = {
      id: 'b-' + Date.now(),
      booking_number: bookingNumber,
      status: 'pending',
      ...parsed.data,
      created_at: new Date().toISOString(),
    }

    addBookingToStore({
      mistriName: 'নির্ধারিত মিস্ত্রী',
      customerName: 'সম্মানিত গ্রাহক',
      customerPhone: parsed.data.contactPhone,
      serviceName: parsed.data.subcategory,
      location: parsed.data.jobAddress,
      amount: parsed.data.estimatedBudget || 400,
    })

    return NextResponse.json({
      success: true,
      message: 'Booking request created successfully',
      booking: newBooking,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to create booking', message: err.message },
      { status: 500 }
    )
  }
}

