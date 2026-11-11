import { NextRequest, NextResponse } from 'next/server'
import { MISTRI_DIRECTORY } from '@/app/api/mistris/search/route'
import { resolveCategoryFromTitle } from '@/lib/supabase-service'

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
  const { id } = await params

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400, headers: NO_CACHE_HEADERS })
  }

  // If mistri is permanently deleted or in Trash, do not allow public profile viewing!
  const { getTrashedMistriIds } = await import('@/lib/mistri-store')
  const { getPersistentAccountState } = await import('@/lib/supabase-service')
  const persistentState = await getPersistentAccountState()

  if (
    persistentState.deletedMistriIds.includes(id) ||
    persistentState.trashedMistriIds.includes(id) ||
    getTrashedMistriIds().has(id)
  ) {
    return NextResponse.json({ success: false, error: 'কারিগর পাওয়া যায়নি' }, { status: 404, headers: NO_CACHE_HEADERS })
  }

  // 1. Check hardcoded MISTRI_DIRECTORY first (m-1, m-2, etc.)
  const demoMistri = MISTRI_DIRECTORY.find((m) => m.id === id)
  if (demoMistri) {
    return NextResponse.json({ success: true, data: demoMistri }, { headers: NO_CACHE_HEADERS })
  }

  // 2. Check in-memory approved mistris
  const { INITIAL_APPROVED_MISTRIS, getApplicantsStore } = await import('@/lib/mistri-store')
  const liveMemory = (global as any).__APPROVED_MISTRIS__ || INITIAL_APPROVED_MISTRIS
  const memoryMistri = liveMemory.find((m: any) => m.id === id || (m.phone && m.phone.replace(/[^0-9]/g, '') === id.replace(/[^0-9]/g, '')))
  if (memoryMistri) {
    return NextResponse.json({ success: true, data: memoryMistri }, { headers: NO_CACHE_HEADERS })
  }

  // 3. Check applicant store
  const applicants = getApplicantsStore()
  const applicant = applicants.find((a: any) => a.id === id || `m-live-${a.id}` === id || (a.phone && a.phone.replace(/[^0-9]/g, '') === id.replace(/[^0-9]/g, '')))
  if (applicant) {
    const catInfo = resolveCategoryFromTitle(applicant.category || '')
    const applicantData = {
      id: applicant.id,
      name_bn: applicant.name,
      name_en: applicant.name,
      phone: applicant.phone,
      professional_title: applicant.category,
      category_slug: catInfo.category_slug,
      category_name_bn: catInfo.category_name_bn,
      category_name_en: catInfo.category_name_en,
      subcategories: applicant.subcategories?.length ? applicant.subcategories : catInfo.subcategories,
      district: applicant.district || 'Thakurgaon',
      district_bn: applicant.district || 'ঠাকুরগাঁও',
      upazila: applicant.upazila || 'Thakurgaon Sadar',
      upazila_bn: applicant.upazila || 'ঠাকুরগাঁও সদর',
      experience_years: applicant.experienceYears || 5,
      average_rating: 5.0,
      total_reviews: 1,
      total_completed_jobs: 0,
      base_charge: applicant.baseCharge || 400,
      charge_type: 'negotiable',
      is_available: true,
      available_today: true,
      available_tomorrow: true,
      is_verified: applicant.status === 'approved',
      distance_km: 1.2,
      avatar: applicant.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
      bio: applicant.bio || 'দক্ষ ও ভেরিফাইড কারিগর। সততার সাথে কাজ সম্পন্ন করি।',
      portfolio: [],
      reviews: [],
      status: applicant.status,
    }
    return NextResponse.json({ success: true, data: applicantData }, { headers: NO_CACHE_HEADERS })
  }

  // 4. Look up Supabase mistri_profiles
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient() as any

    const cleanId = id.replace(/^m-live-/, '')
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)

    let profile: any = null

    if (isUuid) {
      // First try by mistri_profiles.id
      const { data: p1 } = await supabase
        .from('mistri_profiles')
        .select('*, users(phone), districts(name_bn, name_en), upazilas(name_bn, name_en)')
        .eq('id', cleanId)
        .maybeSingle()
      
      profile = p1

      // Second try by user_id
      if (!profile) {
        const { data: p2 } = await supabase
          .from('mistri_profiles')
          .select('*, users(phone), districts(name_bn, name_en), upazilas(name_bn, name_en)')
          .eq('user_id', cleanId)
          .maybeSingle()
        profile = p2
      }
    }

    // Third try by phone number if id contains digits
    if (!profile) {
      const cleanPhone = id.replace(/[^0-9]/g, '')
      if (cleanPhone.length >= 10) {
        const { data: user } = await supabase
          .from('users')
          .select('id, phone')
          .eq('phone', cleanPhone)
          .maybeSingle()

        if (user?.id) {
          const { data: p3 } = await supabase
            .from('mistri_profiles')
            .select('*, users(phone), districts(name_bn, name_en), upazilas(name_bn, name_en)')
            .eq('user_id', user.id)
            .maybeSingle()
          profile = p3
        }
      }
    }

    if (profile) {
      const catInfo = resolveCategoryFromTitle((profile.professional_title || '') + ' ' + (profile.bio || ''))

      const mistriData = {
        id: profile.id,
        name_bn: profile.full_name,
        name_en: profile.full_name,
        phone: profile.users?.phone || '',
        professional_title: profile.professional_title || 'দক্ষ কারিগর',
        category_slug: catInfo.category_slug,
        category_name_bn: catInfo.category_name_bn,
        category_name_en: catInfo.category_name_en,
        subcategories: catInfo.subcategories,
        district: profile.districts?.name_en || 'Thakurgaon',
        district_bn: profile.districts?.name_bn || 'ঠাকুরগাঁও',
        upazila: profile.upazilas?.name_en || 'Thakurgaon Sadar',
        upazila_bn: profile.upazilas?.name_bn || 'ঠাকুরগাঁও সদর',
        experience_years: profile.experience_years || 5,
        average_rating: Number(profile.average_rating) || 5.0,
        total_reviews: profile.total_reviews || 1,
        total_completed_jobs: profile.total_completed_jobs || 0,
        base_charge: Number(profile.base_charge) || 400,
        charge_type: profile.charge_type || 'negotiable',
        is_available: profile.is_available ?? true,
        available_today: true,
        available_tomorrow: true,
        is_verified: profile.approval_status === 'approved',
        distance_km: 1.2,
        avatar: profile.users?.avatar_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
        bio: profile.bio || 'দক্ষ ও ভেরিফাইড কারিগর। সততার সাথে কাজ সম্পন্ন করি।',
        portfolio: [],
        reviews: [],
        status: profile.approval_status,
      }
      return NextResponse.json({ success: true, data: mistriData }, { headers: NO_CACHE_HEADERS })
    }
  } catch (err: any) {
    console.error('Supabase mistri lookup error:', err.message)
  }

  // 5. Fallback: not found
  return NextResponse.json(
    { success: false, error: 'Mistri not found' },
    { status: 404, headers: NO_CACHE_HEADERS }
  )
}
