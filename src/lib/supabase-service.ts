import { createAdminClient } from '@/lib/supabase/admin'

export async function saveMistriToSupabase(data: {
  fullName: string
  phone: string
  password?: string
  nidNumber?: string
  district?: string
  upazila?: string
  streetAddress?: string
  professionalTitle?: string
  bio?: string
  experienceYears?: number
  baseCharge?: number
  status?: 'pending' | 'approved'
}) {
  try {
    const supabase = createAdminClient() as any
    const cleanPhone = (data.phone || '').replace(/[^0-9]/g, '')
    const email = `mistri_${cleanPhone}@mistri.app`

    let userId: string | null = null

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle()

    if (existingUser?.id) {
      userId = existingUser.id
    } else {
      // Create auth user
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password: data.password || 'Mistri@2026',
        email_confirm: true,
        user_metadata: {
          phone: cleanPhone,
          full_name: data.fullName,
          role: 'mistri',
        },
      })

      if (authErr) {
        console.error('Supabase auth createUser error:', authErr.message)
        return null
      }

      if (authUser?.user?.id) {
        userId = authUser.user.id
        await supabase.from('users').insert({
          id: userId,
          phone: cleanPhone,
          email,
          role: 'mistri',
          preferred_language: 'bn',
        })
      }
    }

    if (!userId) return null

    // District & Upazila resolution
    const { data: dist } = await supabase
      .from('districts')
      .select('id')
      .ilike('name_bn', `%${data.district || 'ঠাকুরগাঁও'}%`)
      .limit(1)

    const districtId = dist?.[0]?.id || '11111111-1111-1111-1111-111111111101'

    const { data: upz } = await supabase
      .from('upazilas')
      .select('id')
      .ilike('name_bn', `%${data.upazila || 'সদর'}%`)
      .limit(1)

    const upazilaId = upz?.[0]?.id || 'e1db003d-c4f1-4462-bba1-4f6822c102bd'

    const { data: profile, error: pErr } = await supabase
      .from('mistri_profiles')
      .upsert(
        {
          user_id: userId,
          full_name: data.fullName,
          professional_title: data.professionalTitle || 'দক্ষ ইলেকট্রিশিয়ান',
          bio: data.bio || '',
          district_id: districtId,
          upazila_id: upazilaId,
          street_address: data.streetAddress || '',
          location_point: 'SRID=4326;POINT(88.4667 26.0333)',
          approval_status: data.status || 'pending',
          experience_years: Number(data.experienceYears) || 5,
          is_available: true,
          base_charge: Number(data.baseCharge) || 400,
        },
        { onConflict: 'user_id' }
      )
      .select()

    if (pErr) {
      console.error('Supabase mistri_profiles upsert error:', pErr.message)
    }

    return profile?.[0] || null
  } catch (err: any) {
    console.error('saveMistriToSupabase exception:', err.message)
    return null
  }
}

export async function updateMistriStatusInSupabase(phoneOrName: string, status: 'approved' | 'rejected') {
  try {
    const supabase = createAdminClient() as any
    const cleanPhone = phoneOrName.replace(/[^0-9]/g, '')

    if (cleanPhone) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('phone', cleanPhone)
        .maybeSingle()

      if (user?.id) {
        await supabase
          .from('mistri_profiles')
          .update({ approval_status: status })
          .eq('user_id', user.id)
        return
      }
    }

    // Fallback: update by full_name
    await supabase
      .from('mistri_profiles')
      .update({ approval_status: status })
      .ilike('full_name', `%${phoneOrName}%`)
  } catch (err: any) {
    console.error('updateMistriStatusInSupabase exception:', err.message)
  }
}

export async function getApprovedMistrisFromSupabase() {
  try {
    const supabase = createAdminClient() as any
    const { data, error } = await supabase
      .from('mistri_profiles')
      .select('*, users(phone), districts(name_bn, name_en), upazilas(name_bn, name_en)')
      .eq('approval_status', 'approved')

    if (error || !data) return []

    return data.map((row: any) => ({
      id: row.id,
      name_bn: row.full_name,
      name_en: row.full_name,
      phone: row.users?.phone || '017XXXXXXXX',
      professional_title: row.professional_title || 'দক্ষ মিস্ত্রী',
      title: row.professional_title || 'দক্ষ মিস্ত্রী',
      category: 'ইলেকট্রিক্যাল কাজ',
      category_slug: 'electrical-services',
      category_name_bn: 'ইলেকট্রিক্যাল কাজ',
      category_name_en: 'Electrical Services',
      subcategories: ['বাসা-বাড়ির ওয়্যারিং', 'ফ্যান ও লাইটিং ফিটিং', 'সুইচ ও সকেট মেরামত'],
      district: row.districts?.name_en || 'Thakurgaon',
      district_bn: row.districts?.name_bn || 'ঠাকুরগাঁও',
      upazila: row.upazilas?.name_en || 'Thakurgaon Sadar',
      upazila_bn: row.upazilas?.name_bn || 'ঠাকুরগাঁও সদর',
      experience_years: row.experience_years || 5,
      experienceYears: row.experience_years || 5,
      average_rating: row.average_rating || 5.0,
      rating: row.average_rating || 5.0,
      reviewsCount: row.total_reviews || 1,
      total_reviews: row.total_reviews || 1,
      completedJobs: row.total_completed_jobs || 0,
      total_completed_jobs: row.total_completed_jobs || 0,
      base_charge: row.base_charge || 400,
      charge_type: row.charge_type || 'negotiable',
      is_available: true,
      available_today: true,
      available_tomorrow: true,
      is_verified: true,
      distance_km: 1.2,
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      bio: row.bio || 'দক্ষ ও ভেরিফাইড কারিগর। সততার সাথে কাজ সম্পন্ন করি।',
      portfolio: [],
      reviews: [],
      status: 'approved',
    }))
  } catch (err: any) {
    console.error('getApprovedMistrisFromSupabase error:', err.message)
    return []
  }
}

export async function getMistriProfileByPhone(phone: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  try {
    const supabase = createAdminClient() as any

    // 1. First check Supabase
    const { data: user } = await supabase
      .from('users')
      .select('id, phone, email')
      .eq('phone', cleanPhone)
      .maybeSingle()

    if (user?.id) {
      const { data: profile } = await supabase
        .from('mistri_profiles')
        .select('*, districts(name_bn, name_en), upazilas(name_bn, name_en)')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profile) {
        return {
          id: profile.id,
          fullName: profile.full_name,
          phone: user.phone,
          professionalTitle: profile.professional_title,
          bio: profile.bio || '',
          dateOfBirth: profile.date_of_birth || '১৯৯০-০৫-১৫',
          gender: profile.gender || 'পুরুষ (Male)',
          fatherName: 'মোঃ আব্দুল জব্বার',
          nidNumber: '1990521934000123',
          district: profile.districts?.name_bn || 'ঠাকুরগাঁও',
          upazila: profile.upazilas?.name_bn || 'ঠাকুরগাঁও সদর',
          streetAddress: profile.street_address || 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
          serviceRadiusKm: profile.max_service_distance_km || 15,
          experienceYears: profile.experience_years || 5,
          approvalStatus: profile.approval_status || 'approved',
          isAvailable: profile.is_available ?? true,
          chargeType: profile.charge_type || 'negotiable',
          baseCharge: Number(profile.base_charge) || 400,
          category: 'ইলেকট্রিক্যাল কাজ',
          categorySlug: 'electrical-services',
          subcategories: ['বাসা-বাড়ির ওয়্যারিং', 'ফ্যান ও লাইটিং ফিটিং', 'সুইচ ও সকেট মেরামত', 'সার্কিট ব্রেকার ও ডিবি বোর্ড'],
          avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
          nidFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
          nidBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
          rating: Number(profile.average_rating) || 5.0,
          reviewsCount: profile.total_reviews || 1,
          completedJobs: profile.total_completed_jobs || 14,
        }
      }
    }
  } catch (err: any) {
    console.error('getMistriProfileByPhone Supabase error:', err.message)
  }

  // 2. Fallback to in-memory store
  const { getApplicantsStore, INITIAL_APPROVED_MISTRIS } = await import('@/lib/mistri-store')
  const store = getApplicantsStore()
  const foundApp = store.find((a) => a.phone.replace(/[^0-9]/g, '') === cleanPhone)

  if (foundApp) {
    return {
      id: foundApp.id,
      fullName: foundApp.name,
      phone: foundApp.phone,
      professionalTitle: foundApp.category,
      bio: foundApp.bio || 'দক্ষ ও ভেরিফাইড কারিগর। সততার সাথে কাজ সম্পন্ন করি।',
      dateOfBirth: foundApp.dateOfBirth || '১৯৯০-০৫-১৫',
      gender: foundApp.gender || 'পুরুষ (Male)',
      fatherName: 'মোঃ আব্দুল জব্বার',
      nidNumber: foundApp.nidNumber || '1990521934000123',
      district: foundApp.district || 'ঠাকুরগাঁও',
      upazila: foundApp.upazila || 'ঠাকুরগাঁও সদর',
      streetAddress: foundApp.streetAddress || 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
      serviceRadiusKm: foundApp.serviceRadiusKm || 15,
      experienceYears: foundApp.experienceYears || 5,
      approvalStatus: foundApp.status || 'pending',
      isAvailable: true,
      chargeType: foundApp.chargeType || 'negotiable',
      baseCharge: foundApp.baseCharge || 400,
      category: foundApp.category,
      categorySlug: foundApp.categorySlug || 'electrical-services',
      subcategories: foundApp.subcategories || ['বাসা-বাড়ির ওয়্যারিং', 'ফ্যান ও লাইটিং ফিটিং', 'সুইচ ও সকেট মেরামত'],
      avatar: foundApp.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
      nidFrontUrl: foundApp.nidFrontUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
      nidBackUrl: foundApp.nidBackUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewsCount: 1,
      completedJobs: foundApp.status === 'approved' ? 14 : 0,
    }
  }

  // 3. Check INITIAL_APPROVED_MISTRIS (like Jewel Rana)
  const initialFound = INITIAL_APPROVED_MISTRIS.find(m => m.phone.replace(/[^0-9]/g, '') === cleanPhone)
  if (initialFound) {
    return {
      id: initialFound.id,
      fullName: initialFound.name_bn,
      phone: initialFound.phone,
      professionalTitle: initialFound.professional_title,
      bio: initialFound.bio,
      dateOfBirth: '১৯৯০-০৫-১৫',
      gender: 'পুরুষ (Male)',
      fatherName: 'মোঃ আব্দুল জব্বার',
      nidNumber: '1990521934000123',
      district: initialFound.district_bn,
      upazila: initialFound.upazila_bn,
      streetAddress: 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
      serviceRadiusKm: 15,
      experienceYears: initialFound.experience_years,
      approvalStatus: 'approved',
      isAvailable: initialFound.is_available,
      chargeType: initialFound.charge_type,
      baseCharge: initialFound.base_charge,
      category: initialFound.category_name_bn,
      categorySlug: initialFound.category_slug,
      subcategories: initialFound.subcategories,
      avatar: initialFound.avatar,
      nidFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
      nidBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
      rating: initialFound.average_rating,
      reviewsCount: initialFound.total_reviews,
      completedJobs: initialFound.total_completed_jobs,
    }
  }

  return null
}

export async function updateMistriProfileByPhone(phone: string, updates: any) {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  // STRICTLY FILTER OUT ANY LOCKED FIELDS!
  const safeUpdates: any = {}
  if (updates.professionalTitle !== undefined) safeUpdates.professional_title = updates.professionalTitle
  if (updates.bio !== undefined) safeUpdates.bio = updates.bio
  if (updates.streetAddress !== undefined) safeUpdates.street_address = updates.streetAddress
  if (updates.serviceRadiusKm !== undefined) safeUpdates.max_service_distance_km = Number(updates.serviceRadiusKm)
  if (updates.experienceYears !== undefined) safeUpdates.experience_years = Number(updates.experienceYears)
  if (typeof updates.isAvailable === 'boolean') safeUpdates.is_available = updates.isAvailable
  if (updates.chargeType !== undefined) safeUpdates.charge_type = updates.chargeType
  if (updates.baseCharge !== undefined) safeUpdates.base_charge = Number(updates.baseCharge)

  try {
    const supabase = createAdminClient() as any
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle()

    if (user?.id) {
      await supabase
        .from('mistri_profiles')
        .update(safeUpdates)
        .eq('user_id', user.id)
    }
  } catch (err: any) {
    console.error('updateMistriProfileByPhone Supabase error:', err.message)
  }

  // Update in memory store as well
  const { getApplicantsStore } = await import('@/lib/mistri-store')
  const store = getApplicantsStore()
  const applicant = store.find(a => a.phone.replace(/[^0-9]/g, '') === cleanPhone)
  if (applicant) {
    if (updates.bio !== undefined) applicant.bio = updates.bio
    if (updates.professionalTitle !== undefined) applicant.category = updates.professionalTitle
    if (updates.subcategories !== undefined) applicant.subcategories = updates.subcategories
    if (updates.experienceYears !== undefined) applicant.experienceYears = Number(updates.experienceYears)
    if (updates.streetAddress !== undefined) applicant.streetAddress = updates.streetAddress
    if (updates.district !== undefined) applicant.district = updates.district
    if (updates.upazila !== undefined) applicant.upazila = updates.upazila
    if (updates.serviceRadiusKm !== undefined) applicant.serviceRadiusKm = Number(updates.serviceRadiusKm)
    if (updates.chargeType !== undefined) applicant.chargeType = updates.chargeType
    if (updates.baseCharge !== undefined) applicant.baseCharge = Number(updates.baseCharge)
    if (updates.avatar !== undefined) applicant.avatar = updates.avatar
  }

  // Also update in global.__APPROVED_MISTRIS__ if present
  if ((global as any).__APPROVED_MISTRIS__) {
    const live = (global as any).__APPROVED_MISTRIS__.find((m: any) => (m.phone || '').replace(/[^0-9]/g, '') === cleanPhone)
    if (live) {
      if (updates.bio !== undefined) live.bio = updates.bio
      if (updates.professionalTitle !== undefined) live.professional_title = updates.professionalTitle
      if (updates.subcategories !== undefined) live.subcategories = updates.subcategories
      if (updates.isAvailable !== undefined) live.is_available = updates.isAvailable
      if (updates.chargeType !== undefined) live.charge_type = updates.chargeType
      if (updates.baseCharge !== undefined) live.base_charge = Number(updates.baseCharge)
      if (updates.avatar !== undefined) live.avatar = updates.avatar
    }
  }

  return { success: true }
}

export async function changeMistriPhoneInDatabase(oldPhone: string, newPhone: string) {
  const cleanOld = oldPhone.replace(/[^0-9]/g, '')
  const cleanNew = newPhone.replace(/[^0-9]/g, '')

  try {
    const supabase = createAdminClient() as any
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanOld)
      .maybeSingle()

    if (user?.id) {
      await supabase
        .from('users')
        .update({ phone: cleanNew, email: `mistri_${cleanNew}@mistri.app` })
        .eq('id', user.id)
    }
  } catch (err: any) {
    console.error('changeMistriPhoneInDatabase Supabase error:', err.message)
  }

  // Update in memory store
  const { getApplicantsStore } = await import('@/lib/mistri-store')
  const store = getApplicantsStore()
  const applicant = store.find(a => a.phone.replace(/[^0-9]/g, '') === cleanOld)
  if (applicant) {
    applicant.phone = cleanNew
  }

  if ((global as any).__APPROVED_MISTRIS__) {
    const live = (global as any).__APPROVED_MISTRIS__.find((m: any) => (m.phone || '').replace(/[^0-9]/g, '') === cleanOld)
    if (live) {
      live.phone = cleanNew
    }
  }

  return { success: true, newPhone: cleanNew }
}
