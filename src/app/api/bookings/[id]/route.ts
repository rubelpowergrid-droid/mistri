import { NextRequest, NextResponse } from 'next/server'
import { getBookingByIdFromSupabase } from '@/lib/supabase-service'
import { getBookingsStore } from '@/lib/mistri-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = decodeURIComponent(rawId || '')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'বুকিং আইডি প্রদান করুন' },
        { status: 400, headers: NO_CACHE_HEADERS }
      )
    }

    // 1. Try Supabase
    let booking: any = await getBookingByIdFromSupabase(id)

    // 2. Fallback to in-memory store
    if (!booking) {
      const memoryStore = getBookingsStore()
      const found = memoryStore.find((b) => b.id === id || b.bookingNumber === id)
      if (found) {
        booking = {
          id: found.id,
          bookingNumber: found.bookingNumber,
          mistriId: found.mistriId,
          mistriName: found.mistriName,
          mistriTitle: found.mistriTitle || 'দক্ষ কারিগর',
          mistriPhone: found.mistriPhone || '',
          mistriAvatar: found.mistriAvatar || '',
          customerName: found.customerName || 'সম্মানিত গ্রাহক',
          customerPhone: found.customerPhone || '',
          customerAddress: found.jobAddress || found.location || '',
          jobAddress: found.jobAddress || found.location || '',
          serviceName: found.serviceName || found.category || 'সাধারণ সেবা',
          category: found.category || 'সাধারণ সেবা',
          description: found.description || '',
          amount: Number(found.amount || found.estimatedBudget || 400),
          estimatedBudget: Number(found.estimatedBudget || found.amount || 400),
          agreedPrice: found.agreedPrice || null,
          preferredDate: found.preferredDate || found.date || '',
          preferredTime: found.preferredTime || '',
          proposedDate: (found as any).proposedDate || null,
          proposedTime: (found as any).proposedTime || null,
          status: found.status,
          date: found.date || found.preferredDate || '',
          workPhotos: found.workPhotos || [],
          cancellationReason: found.cancellationReason || null,
          latitude: found.latitude || 26.0336,
          longitude: found.longitude || 88.4617,
          createdAt: found.createdAt || new Date().toISOString(),
          acceptedAt: (found as any).acceptedAt || null,
          journeyStartedAt: (found as any).journeyStartedAt || null,
          startedAt: (found as any).startedAt || null,
          completedAt: (found as any).completedAt || null,
          updatedAt: (found as any).updatedAt || null,
        }
      }
    }

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'বুকিং পাওয়া যায়নি' },
        { status: 404, headers: NO_CACHE_HEADERS }
      )
    }

    return NextResponse.json(
      { success: true, data: booking },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (err: any) {
    console.error('GET /api/bookings/[id] error:', err.message)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}

