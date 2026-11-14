import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { addBookingToStore, getBookingsStore } from '@/lib/mistri-store'
import { saveBookingToSupabase, getBookingsFromSupabase } from '@/lib/supabase-service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

const createBookingSchema = z.object({
  mistriId: z.string().min(1),
  mistriName: z.string().optional(),
  mistriTitle: z.string().optional(),
  mistriPhone: z.string().optional().nullable(),
  mistriAvatar: z.string().optional().nullable(),
  customerName: z.string().optional(),
  subcategory: z.string().min(1),
  workDescription: z.string().min(1),
  jobAddress: z.string().min(1),
  latitude: z.number().optional().default(26.0336),
  longitude: z.number().optional().default(88.4617),
  contactPhone: z.string().min(10),
  preferredDate: z.string().optional().default(new Date().toISOString().slice(0, 10)),
  preferredTime: z.string().optional().default('সকাল ১০:০০ - ১২:০০'),
  estimatedBudget: z.number().nullable().optional(),
  workPhotos: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') || 'all'
  const mistriId = searchParams.get('mistriId') || ''
  const mistriPhone = searchParams.get('mistriPhone') || ''
  const customerPhone = searchParams.get('customerPhone') || ''
  const status = searchParams.get('status') || 'all'

  // 1. Fetch from Supabase
  let supabaseBookings: any[] = []
  try {
    supabaseBookings = await getBookingsFromSupabase({
      mistriId: mistriId || undefined,
      mistriPhone: mistriPhone || undefined,
      customerPhone: customerPhone || undefined,
      status: status !== 'all' ? status : undefined,
    })
  } catch (err) {
    console.error('Error fetching Supabase bookings:', err)
  }

  // 2. Fetch from In-Memory Server Store
  const memoryBookings = getBookingsStore()

  // 3. Merge & Deduplicate
  const combined = [...supabaseBookings, ...memoryBookings]
  const seen = new Set<string>()
  const allBookings: any[] = []

  for (const b of combined) {
    const key = b.id || b.bookingNumber
    if (key && !seen.has(key)) {
      seen.add(key)
      allBookings.push(b)
    }
  }

  // 4. Apply Filters
  const filtered = allBookings.filter((b) => {
    if (status && status !== 'all' && b.status !== status) {
      return false
    }

    if (role === 'mistri' || mistriId || mistriPhone) {
      const cleanMPhone = (mistriPhone || '').replace(/[^0-9]/g, '')
      const bMPhone = (b.mistriPhone || '').replace(/[^0-9]/g, '')
      
      const matchId = mistriId && (b.mistriId === mistriId || b.mistriId === `m-live-${mistriId}`)
      const matchPhone = cleanMPhone && bMPhone && (cleanMPhone.slice(-10) === bMPhone.slice(-10))

      if (mistriId && mistriPhone) {
        if (!matchId && !matchPhone) return false
      } else if (mistriId && !matchId) {
        return false
      } else if (mistriPhone && !matchPhone) {
        return false
      }
    }

    if (customerPhone) {
      const cleanCPhone = customerPhone.replace(/[^0-9]/g, '')
      const bCPhone = (b.customerPhone || '').replace(/[^0-9]/g, '')
      if (cleanCPhone && bCPhone && cleanCPhone.slice(-10) !== bCPhone.slice(-10)) {
        return false
      }
    }

    return true
  })

  return NextResponse.json({
    success: true,
    total: filtered.length,
    data: filtered,
  }, { headers: NO_CACHE_HEADERS })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createBookingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid booking payload', details: parsed.error.format() },
        { status: 400, headers: NO_CACHE_HEADERS }
      )
    }

    // 1. Save to Supabase (creates booking in DB + sends notification to mistri)
    let supaRes: any = null
    try {
      supaRes = await saveBookingToSupabase({
        mistriId: parsed.data.mistriId,
        mistriName: parsed.data.mistriName,
        mistriTitle: parsed.data.mistriTitle,
        mistriPhone: parsed.data.mistriPhone || '',
        contactPhone: parsed.data.contactPhone,
        customerName: parsed.data.customerName || 'সম্মানিত গ্রাহক',
        subcategory: parsed.data.subcategory,
        workDescription: parsed.data.workDescription,
        jobAddress: parsed.data.jobAddress,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        preferredDate: parsed.data.preferredDate,
        preferredTime: parsed.data.preferredTime,
        estimatedBudget: parsed.data.estimatedBudget,
        workPhotos: parsed.data.workPhotos,
      })
    } catch (e: any) {
      console.warn('saveBookingToSupabase failed:', e.message)
    }

    const resolvedMistriPhone = parsed.data.mistriPhone || supaRes?.mistriPhone || ''

    // 2. Save into central in-memory store
    const newBooking = addBookingToStore({
      id: supaRes?.booking?.id || `b-${Date.now()}`,
      bookingNumber: supaRes?.booking?.booking_number,
      mistriId: parsed.data.mistriId,
      mistriName: parsed.data.mistriName || 'নির্ধারিত মিস্ত্রী',
      mistriTitle: parsed.data.mistriTitle || supaRes?.mistriTitle || 'দক্ষ কারিগর',
      mistriPhone: resolvedMistriPhone,
      mistriAvatar: parsed.data.mistriAvatar || supaRes?.mistriAvatar || '',
      customerName: parsed.data.customerName || 'সম্মানিত গ্রাহক',
      customerPhone: parsed.data.contactPhone,
      serviceName: parsed.data.subcategory,
      description: parsed.data.workDescription,
      jobAddress: parsed.data.jobAddress,
      location: parsed.data.jobAddress,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      preferredDate: parsed.data.preferredDate,
      preferredTime: parsed.data.preferredTime,
      amount: parsed.data.estimatedBudget || 400,
      estimatedBudget: parsed.data.estimatedBudget || 400,
      status: 'pending',
      workPhotos: parsed.data.workPhotos || [],
    })

    // Also trigger push directly if mistriPhone or mistriId is present
    try {
      const { sendPushToUser } = await import('@/lib/web-push')
      sendPushToUser({
        userId: supaRes?.mistriUserId || null,
        phone: resolvedMistriPhone || parsed.data.mistriId,
        title: '🔔 নতুন কাজের বুকিং অনুরোধ এসেছে!',
        body: `${newBooking.customerName || 'গ্রাহক'} একটি কাজের অনুরোধ পাঠিয়েছেন (${newBooking.serviceName})`,
        url: newBooking.id ? `/bookings/${newBooking.id}` : '/requests',
        tag: `booking-${newBooking.id}`,
      }).catch(() => {})
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Booking request created successfully',
      booking: newBooking,
    }, { headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to create booking', message: err.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
