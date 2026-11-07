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
