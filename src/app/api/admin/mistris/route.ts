import { NextRequest, NextResponse } from 'next/server'
import { 
  getApplicantsStore, 
  INITIAL_APPROVED_MISTRIS, 
  getTrashedMistriIds, 
  getSuspendedMistriIds,
  moveMistriToTrash,
  restoreMistriFromTrash,
  setMistriSuspended,
  permanentDeleteMistriFromMemory
} from '@/lib/mistri-store'
import { 
  softDeleteMistriInSupabase, 
  restoreMistriInSupabase, 
  setMistriSuspendedInSupabase, 
  permanentDeleteMistriFromSupabase,
  getPersistentAccountState,
  resolveCategoryFromTitle 
} from '@/lib/supabase-service'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export const DEMO_ADMIN_MISTRIS = [
  {
    id: 'm-jewel-rana',
    name: 'মোঃ জুয়েল রানা',
    phone: '01722159830',
    title: 'সিনিয়র ইলেকট্রিশিয়ান ও টেকনিশিয়ান',
    category: 'ইলেকট্রিক্যাল কাজ',
    district: 'ঠাকুরগাঁও',
    upazila: 'ঠাকুরগাঁও সদর',
    experienceYears: 6,
    rating: 5.0,
    reviewsCount: 1,
    completedJobs: 14,
    status: 'approved',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'm-1',
    name: 'মোঃ রফিকুল ইসলাম',
    phone: '01712345678',
    title: 'সিনিয়র ইলেকট্রিশিয়ান',
    category: 'ইলেকট্রিক্যাল কাজ',
    district: 'ঠাকুরগাঁও',
    upazila: 'ঠাকুরগাঁও সদর',
    experienceYears: 8,
    rating: 4.9,
    reviewsCount: 38,
    completedJobs: 142,
    status: 'approved',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'm-2',
    name: 'আব্দুল করিম',
    phone: '01898765432',
    title: 'দক্ষ প্লাম্বিং কারিগর',
    category: 'প্লাম্বিং সার্ভিস',
    district: 'ঠাকুরগাঁও',
    upazila: 'পীরগঞ্জ',
    experienceYears: 6,
    rating: 4.8,
    reviewsCount: 29,
    completedJobs: 98,
    status: 'approved',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'm-3',
    name: 'তরিকুল হাসান',
    phone: '01911223344',
    title: 'রাজমিস্ত্রী ও টাইলস স্পেশালিস্ট',
    category: 'রাজমিস্ত্রীর কাজ',
    district: 'পঞ্চগড়',
    upazila: 'বোদা',
    experienceYears: 12,
    rating: 5.0,
    reviewsCount: 52,
    completedJobs: 210,
    status: 'approved',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'm-4',
    name: 'নুরুল হুদা',
    phone: '01755667788',
    title: 'কাঠের ফার্নিচার মিস্ত্রী',
    category: 'কাঠের কাজ',
    district: 'দিনাজপুর',
    upazila: 'দিনাজপুর সদর',
    experienceYears: 5,
    rating: 3.8,
    reviewsCount: 11,
    completedJobs: 34,
    status: 'suspended',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'm-5',
    name: 'মোস্তাফিজুর রহমান',
    phone: '01822334455',
    title: 'এসি ও রেফ্রিজারেশন টেকনিশিয়ান',
    category: 'ইলেকট্রিক্যাল কাজ',
    district: 'ঠাকুরগাঁও',
    upazila: 'ঠাকুরগাঁও সদর',
    experienceYears: 7,
    rating: 4.7,
    reviewsCount: 19,
    completedJobs: 65,
    status: 'pending',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  },
]

export async function GET(request: NextRequest) {
  try {
    const memoryTrashed = getTrashedMistriIds()
    const memorySuspended = getSuspendedMistriIds()

    // 0. Persistent state from Supabase PostgreSQL
    const persistentState = await getPersistentAccountState()
    const trashedIds = new Set([...Array.from(memoryTrashed), ...persistentState.trashedMistriIds])
    const suspendedIds = new Set([...Array.from(memorySuspended), ...persistentState.suspendedMistriIds])
    const deletedIds = new Set(persistentState.deletedMistriIds)

    // 1. Fetch from Supabase (all, including trashed and suspended)
    let supabaseMistris: any[] = []
    try {
      const supabase = createAdminClient() as any
      const { data } = await supabase
        .from('mistri_profiles')
        .select('*, users(phone), districts(name_bn, name_en), upazilas(name_bn, name_en)')
      
      if (data && Array.isArray(data)) {
        supabaseMistris = data
          .filter((row: any) => !deletedIds.has(row.id))
          .map((row: any) => {
            const catInfo = resolveCategoryFromTitle(row.professional_title || '')
            let computedStatus: 'approved' | 'suspended' | 'trash' = 'approved'
            if (row.deleted_at || trashedIds.has(row.id)) {
              computedStatus = 'trash'
            } else if (row.approval_status === 'suspended' || suspendedIds.has(row.id)) {
              computedStatus = 'suspended'
            }

            return {
              id: row.id,
              name: row.full_name,
              phone: row.users?.phone || '017XXXXXXXX',
              title: row.professional_title || 'দক্ষ মিস্ত্রী',
              category: catInfo.category_name_bn,
              district: row.districts?.name_bn || 'ঠাকুরগাঁও',
              upazila: row.upazilas?.name_bn || 'ঠাকুরগাঁও সদর',
              experienceYears: row.experience_years || 5,
              rating: row.average_rating || 5.0,
              reviewsCount: row.total_reviews || 1,
              completedJobs: row.total_completed_jobs || 0,
              status: computedStatus,
              avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
            }
          })
      }
    } catch (e) {
      console.error('Failed to get mistris from Supabase:', e)
    }

    // 2. Fetch from applicants store
    const store = getApplicantsStore()
    const approvedApplicants = store.filter((a) => a.status === 'approved' && !deletedIds.has(a.id))

    // 3. Collect from global.__APPROVED_MISTRIS__
    const liveApproved = (global as any).__APPROVED_MISTRIS__ || INITIAL_APPROVED_MISTRIS

    const combined: any[] = []
    const seenPhones = new Set<string>()

    // Priority 1: Supabase mistris
    for (const sm of supabaseMistris) {
      if (deletedIds.has(sm.id)) continue
      const cleanPhone = (sm.phone || '').replace(/[^0-9]/g, '')
      if (cleanPhone && !seenPhones.has(cleanPhone)) {
        seenPhones.add(cleanPhone)
        combined.push(sm)
      }
    }

    // Priority 2: In-memory live approved (e.g. Jewel Rana)
    for (const lm of liveApproved) {
      if (deletedIds.has(lm.id)) continue
      const cleanPhone = (lm.phone || '').replace(/[^0-9]/g, '')
      if (cleanPhone && !seenPhones.has(cleanPhone)) {
        seenPhones.add(cleanPhone)
        let computedStatus: 'approved' | 'suspended' | 'trash' = 'approved'
        if (trashedIds.has(lm.id)) {
          computedStatus = 'trash'
        } else if (suspendedIds.has(lm.id) || lm.status === 'suspended') {
          computedStatus = 'suspended'
        }

        combined.push({
          id: lm.id,
          name: lm.name_bn || lm.name,
          phone: lm.phone,
          title: lm.title || lm.professional_title,
          category: lm.category_name_bn || lm.category,
          district: lm.district_bn || lm.district,
          upazila: lm.upazila_bn || lm.upazila,
          experienceYears: lm.experience_years || lm.experienceYears || 5,
          rating: lm.average_rating || lm.rating || 5.0,
          reviewsCount: lm.total_reviews || lm.reviewsCount || 1,
          completedJobs: lm.total_completed_jobs || lm.completedJobs || 0,
          status: computedStatus,
          avatar: lm.avatar,
        })
      }
    }

    // Priority 3: Approved applicants from store
    for (const app of approvedApplicants) {
      if (deletedIds.has(app.id)) continue
      const cleanPhone = app.phone.replace(/[^0-9]/g, '')
      if (!seenPhones.has(cleanPhone)) {
        seenPhones.add(cleanPhone)
        let computedStatus: 'approved' | 'suspended' | 'trash' = 'approved'
        if (trashedIds.has(app.id)) {
          computedStatus = 'trash'
        } else if (suspendedIds.has(app.id)) {
          computedStatus = 'suspended'
        }

        combined.push({
          id: app.id,
          name: app.name,
          phone: app.phone,
          title: app.category,
          category: app.category,
          district: app.district,
          upazila: app.upazila,
          experienceYears: app.experienceYears,
          rating: 5.0,
          reviewsCount: 1,
          completedJobs: 0,
          status: computedStatus,
          avatar: app.avatar,
        })
      }
    }

    // Priority 4: Seed demo mistris (filter out permanently deleted ones!)
    for (const dm of DEMO_ADMIN_MISTRIS) {
      if (deletedIds.has(dm.id)) continue
      const cleanPhone = dm.phone.replace(/[^0-9]/g, '')
      if (!seenPhones.has(cleanPhone)) {
        seenPhones.add(cleanPhone)
        let computedStatus = dm.status as 'approved' | 'suspended' | 'trash'
        if (trashedIds.has(dm.id)) {
          computedStatus = 'trash'
        } else if (suspendedIds.has(dm.id)) {
          computedStatus = 'suspended'
        }

        combined.push({
          ...dm,
          status: computedStatus,
        })
      }
    }

    const trashList = combined.filter((m) => m.status === 'trash')
    const activeList = combined.filter((m) => m.status !== 'trash')
    const suspendedList = combined.filter((m) => m.status === 'suspended')

    return NextResponse.json({
      success: true,
      count: combined.length,
      activeCount: activeList.length,
      trashCount: trashList.length,
      suspendedCount: suspendedList.length,
      mistris: combined,
    }, { headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action } = body

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'ID and action required' }, { status: 400, headers: NO_CACHE_HEADERS })
    }

    if (action === 'trash') {
      moveMistriToTrash(id)
      await softDeleteMistriInSupabase(id)
      return NextResponse.json({
        success: true,
        message: 'অ্যাকাউন্টটি Trash ফোল্ডারে পাঠানো হয়েছে এবং পাবলিক ভিউ থেকে সরানো হয়েছে।',
      }, { headers: NO_CACHE_HEADERS })
    }

    if (action === 'restore') {
      restoreMistriFromTrash(id)
      await restoreMistriInSupabase(id)
      return NextResponse.json({
        success: true,
        message: 'অ্যাকাউন্টটি Trash ফোল্ডার থেকে সফলভাবে পুনরুদ্ধার করা হয়েছে।',
      }, { headers: NO_CACHE_HEADERS })
    }

    if (action === 'suspend') {
      setMistriSuspended(id, true)
      await setMistriSuspendedInSupabase(id, true)
      return NextResponse.json({
        success: true,
        message: 'অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে।',
      }, { headers: NO_CACHE_HEADERS })
    }

    if (action === 'reactivate') {
      setMistriSuspended(id, false)
      await setMistriSuspendedInSupabase(id, false)
      return NextResponse.json({
        success: true,
        message: 'অ্যাকাউন্টের স্থগিতাদেশ সফলভাবে প্রত্যাহার করা হয়েছে।',
      }, { headers: NO_CACHE_HEADERS })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400, headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let targetId = searchParams.get('id')
    if (!targetId) {
      const body = await request.json().catch(() => ({}))
      targetId = body.id
    }

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400, headers: NO_CACHE_HEADERS })
    }

    permanentDeleteMistriFromMemory(targetId)
    await permanentDeleteMistriFromSupabase(targetId)

    return NextResponse.json({
      success: true,
      message: 'অ্যাকাউন্টটি Trash থেকে স্থায়ীভাবে সম্পূর্ণ মুছে ফেলা হয়েছে।',
    }, { headers: NO_CACHE_HEADERS })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}
