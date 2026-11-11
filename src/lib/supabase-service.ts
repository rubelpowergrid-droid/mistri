import { createAdminClient } from '@/lib/supabase/admin'

export function resolveCategoryFromTitle(title: string = '') {
  const t = title.toLowerCase()

  // 1. থাই গ্লাস ও অ্যালুমিনিয়াম
  if (
    t.includes('থাই') || 
    t.includes('গ্লাস') || 
    t.includes('কাঁচ') || 
    t.includes('অ্যালুমিনিয়াম') || 
    t.includes('এলুমিনিয়াম') || 
    t.includes('স্লাইডিং') || 
    t.includes('thai') || 
    t.includes('glass') || 
    t.includes('aluminum') || 
    t.includes('aluminium')
  ) {
    return {
      category_slug: 'thai-glass-aluminium',
      category_name_bn: 'থাই গ্লাস ও অ্যালুমিনিয়াম',
      category_name_en: 'Thai Glass & Aluminium',
      subcategories: [
        'থাই গ্লাস ফিটিংস', 
        'অ্যালুমিনিয়াম স্লাইডিং জানালা', 
        'গ্লাস ডোর ও পার্টিশন', 
        'সিলিং ও অ্যালুমিনিয়াম ফ্রেম', 
        'সাধারণ থাই কাজ'
      ],
    }
  }

  // 2. টিনের কাজ
  if (t.includes('টিন') || t.includes('চাল') || t.includes('টিনশেড') || t.includes('ট্রাস') || t.includes('tin') || t.includes('roof')) {
    return {
      category_slug: 'tin-roofing-services',
      category_name_bn: 'ঘরের টিনের কাজ',
      category_name_en: 'Tin Roofing Services',
      subcategories: ['টিনশেড নির্মাণ', 'টিনের চাল মেরামত ও লিকেজ বন্ধ', 'স্টিল ট্রাস কাজ', 'সাধারণ টিনের কাজ'],
    }
  }

  // 3. কাঠের কাজ ও ফার্নিচার
  if (t.includes('কাঠ') || t.includes('ফার্নিচার') || t.includes('ছুতোর') || t.includes('wood') || t.includes('carpenter') || t.includes('furniture')) {
    return {
      category_slug: 'carpentry-services',
      category_name_bn: 'কাঠের কাজ',
      category_name_en: 'Carpentry Services',
      subcategories: ['দরজা-জানালার ফ্রেম', 'ফার্নিচার মেরামত ও অ্যাসেম্বলি', 'মডুলার ক্যাবিনেট', 'কাঠের পলিশ ও বার্নিশ'],
    }
  }

  // 4. প্লাম্বিং সার্ভিস
  if (t.includes('প্লাম্ব') || t.includes('পাইপ') || t.includes('মোটর') || t.includes('পাম্প') || t.includes('স্যানিটারি') || t.includes('বাথরুম') || t.includes('ট্যাপ') || t.includes('plumb') || t.includes('pipe')) {
    return {
      category_slug: 'plumbing-services',
      category_name_bn: 'প্লাম্বিং সার্ভিস',
      category_name_en: 'Plumbing Services',
      subcategories: ['পাইপ ফিটিং ও মেরামত', 'পানির মোটর ও পাম্প মেরামত', 'স্যানিটারি ও বাথরুম ফিটিংস', 'পানির ট্যাংক পরিষ্কার'],
    }
  }

  // 5. রং করার কাজ
  if (t.includes('রং') || t.includes('পেইন্ট') || t.includes('বার্নিশ') || t.includes('পলিশ') || t.includes('paint') || t.includes('color')) {
    return {
      category_slug: 'painting-services',
      category_name_bn: 'রং করার কাজ',
      category_name_en: 'Painting Services',
      subcategories: ['ঘরের ভেতরের দেয়াল রং', 'বাইরের দেয়াল ও ওয়েদারকোট', 'কাঠের বার্নিশ ও পলিশ', 'পুটিং ও প্রাইমার কাজ'],
    }
  }

  // 6. রাজমিস্ত্রীর কাজ
  if (t.includes('রাজ') || t.includes('টাইলস') || t.includes('মার্বেল') || t.includes('ঢালাই') || t.includes('গাঁথুনি') || t.includes('প্লাস্টার') || t.includes('ইট') || t.includes('mason') || t.includes('tile')) {
    return {
      category_slug: 'masonry-services',
      category_name_bn: 'রাজমিস্ত্রীর কাজ',
      category_name_en: 'Masonry Services',
      subcategories: ['ইট গাঁথুনি ও প্লাস্টার', 'টাইলস ও মার্বেল ফিটিংস', 'ছাদ ঢালাই ও কংক্রিট কাজ', 'বাউন্ডারি ওয়াল নির্মাণ'],
    }
  }

  // 7. এঙ্গেল মিস্ত্রী ও গ্রিল / এসএস
  if (t.includes('গ্রিল') || t.includes('ওয়েল্ডিং') || t.includes('এসএস') || t.includes('এঙ্গেল') || t.includes('মেটাল') || t.includes('লোহা') || t.includes('গেট') || t.includes('grill') || t.includes('metal')) {
    return {
      category_slug: 'metal-fabrication',
      category_name_bn: 'এঙ্গেল মিস্ত্রী ও গ্রিল',
      category_name_en: 'Metal Fabrication & Grill',
      subcategories: ['জানালা ও বারান্দার গ্রিল', 'এসএস গেট ও সিঁড়ির রেলিং', 'মেটাল ওয়েল্ডিং ও কাটিং', 'লোহার এঙ্গেল ও ফ্রেম'],
    }
  }

  // 8. ঘরের সিলিং কাজ
  if (t.includes('সিলিং') || t.includes('জিপসাম') || t.includes('পিভিসি সিলিং') || t.includes('ceiling')) {
    return {
      category_slug: 'ceiling-services',
      category_name_bn: 'ঘরের সিলিং কাজ',
      category_name_en: 'Ceiling Services',
      subcategories: ['জিপসাম বোর্ড সিলিং', 'পিভিসি সিলিং ফিটিংস', 'ফলস সিলিং ও ডেকোরেশন', 'সিলিং মেরামত'],
    }
  }

  // 9. এসি ও রেফ্রিজারেশন
  if (t.includes('এসি') || t.includes('ফ্রিজ') || t.includes('রেফ্রিজারেটর') || t.includes('রেফ্রিজারেশন') || t.includes('ac') || t.includes('fridge')) {
    return {
      category_slug: 'ac-repair-services',
      category_name_bn: 'এসি ও রেফ্রিজারেশন',
      category_name_en: 'AC & Refrigeration Services',
      subcategories: ['এসি গ্যাস চার্জ ও ক্লিনিং', 'এসি ইনস্টলেশন ও মেরামত', 'ফ্রিজ গ্যাস ও কম্প্রেসার মেরামত', 'ডিপ ফ্রিজ সার্ভিসিং'],
    }
  }

  // 10. দৈনিক লেবার
  if (t.includes('লেবার') || t.includes('মজুর') || t.includes('শ্রমিক') || t.includes('মাটি কাটা') || t.includes('labour') || t.includes('labor')) {
    return {
      category_slug: 'daily-labour',
      category_name_bn: 'দৈনিক লেবার',
      category_name_en: 'Daily Labour Services',
      subcategories: ['মাটি কাটা ও লোডিং', 'বাসা বদল ও মালামাল স্থানান্তর', 'কনস্ট্রাকশন দৈনিক শ্রমিক', 'সাধারণ সাহায্যকারী'],
    }
  }

  // 11. ইলেকট্রিক্যাল কাজ (Default for electrician/wiring or general)
  return {
    category_slug: 'electrical-services',
    category_name_bn: 'ইলেকট্রিক্যাল কাজ',
    category_name_en: 'Electrical Services',
    subcategories: ['বাসা-বাড়ির ওয়্যারিং', 'ফ্যান ও লাইটিং ফিটিং', 'সুইচ ও সকেট মেরামত', 'সার্কিট ব্রেকার ও ডিবি বোর্ড'],
  }
}

export async function saveMistriToSupabase(data: {
  fullName: string
  fatherName?: string
  phone: string
  password?: string
  nidNumber?: string
  dateOfBirth?: string
  gender?: string
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

    // Check if user already exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle()

    if (existingUser?.id) {
      userId = existingUser.id
      // Ensure user role is mistri
      await supabase.from('users').update({ role: 'mistri' }).eq('id', userId)
      if (data.password) {
        try {
          await supabase.auth.admin.updateUserById(userId, {
            password: data.password,
            email_confirm: true,
            user_metadata: {
              phone: cleanPhone,
              full_name: data.fullName,
              father_name: data.fatherName || '',
              role: 'mistri',
              plain_pass: data.password,
            },
          })
        } catch (pwErr) {
          console.warn('Update password warning:', pwErr)
        }
      }
    } else {
      // Create auth user
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password: data.password || 'Mistri@2026',
        email_confirm: true,
        user_metadata: {
          phone: cleanPhone,
          full_name: data.fullName,
          father_name: data.fatherName || '',
          role: 'mistri',
          plain_pass: data.password || 'Mistri@2026',
        },
      })

      if (authErr) {
        console.warn('Supabase auth createUser warning:', authErr.message)
        // If user already exists in auth or table, resolve user ID
        const { data: userList } = await supabase.auth.admin.listUsers()
        const existingAuth = userList?.users?.find(
          (u: any) => u.email === email || (u.user_metadata?.phone && u.user_metadata.phone === cleanPhone)
        )
        if (existingAuth?.id) {
          userId = existingAuth.id
          if (data.password) {
            try {
              await supabase.auth.admin.updateUserById(userId, {
                password: data.password,
                email_confirm: true,
                user_metadata: {
                  phone: cleanPhone,
                  full_name: data.fullName,
                  father_name: data.fatherName || '',
                  role: 'mistri',
                },
              })
            } catch (pwe) {
              console.warn('Auth user password update error:', pwe)
            }
          }
          await supabase.from('users').upsert({
            id: userId,
            phone: cleanPhone,
            email,
            role: 'mistri',
            preferred_language: 'bn',
          }, { onConflict: 'id' })
        } else {
          const { data: u } = await supabase.from('users').select('id').eq('phone', cleanPhone).maybeSingle()
          if (u?.id) {
            userId = u.id
          }
        }
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
          date_of_birth: data.dateOfBirth || null,
          gender: data.gender || null,
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

export async function updateMistriStatusInSupabase(idOrPhoneOrName: string, status: 'approved' | 'rejected') {
  try {
    const supabase = createAdminClient() as any

    // 1. If UUID id passed
    if (idOrPhoneOrName.includes('-') && idOrPhoneOrName.length > 20) {
      await supabase
        .from('mistri_profiles')
        .update({ approval_status: status })
        .eq('id', idOrPhoneOrName)
      return
    }

    const cleanPhone = idOrPhoneOrName.replace(/[^0-9]/g, '')

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
      .ilike('full_name', `%${idOrPhoneOrName}%`)
  } catch (err: any) {
    console.error('updateMistriStatusInSupabase exception:', err.message)
  }
}

export async function getApplicantsFromSupabase(statusParam = 'all') {
  try {
    const supabase = createAdminClient() as any
    let query = supabase
      .from('mistri_profiles')
      .select('*, users(phone), districts(name_bn, name_en), upazilas(name_bn, name_en)')
      .order('created_at', { ascending: false })

    if (statusParam && statusParam !== 'all') {
      query = query.eq('approval_status', statusParam)
    }

    const { data, error } = await query

    if (error || !data) return []

    return data.map((row: any) => {
      const catInfo = resolveCategoryFromTitle(row.professional_title || '')
      return {
        id: row.id,
        name: row.full_name,
        phone: row.users?.phone || '017XXXXXXXX',
        category: row.professional_title || catInfo.category_name_bn,
        categorySlug: catInfo.category_slug,
        subcategories: catInfo.subcategories,
        experienceYears: row.experience_years || 5,
        district: row.districts?.name_bn || 'ঠাকুরগাঁও',
        upazila: row.upazilas?.name_bn || 'ঠাকুরগাঁও সদর',
        streetAddress: row.street_address || '',
        serviceRadiusKm: 15,
        chargeType: 'আলোচনা সাপেক্ষে (Negotiable)',
        baseCharge: row.base_charge || 400,
        bio: row.bio || 'দক্ষ কারিগর। সততার সাথে কাজ করি।',
        submittedAt: new Date(row.created_at || Date.now()).toLocaleDateString('bn-BD', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        status: (row.approval_status || 'pending') as 'pending' | 'approved' | 'rejected',
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
        nidNumber: '1990521934000123',
      }
    })
  } catch (err: any) {
    console.error('getApplicantsFromSupabase exception:', err.message)
    return []
  }
}

export async function getApprovedMistrisFromSupabase() {
  try {
    const supabase = createAdminClient() as any
    const { data, error } = await supabase
      .from('mistri_profiles')
      .select('*, users(phone, avatar_url), districts(name_bn, name_en), upazilas(name_bn, name_en)')
      .eq('approval_status', 'approved')

    if (error || !data) return []

    return data.map((row: any) => {
      const catInfo = resolveCategoryFromTitle(row.professional_title || '')
      return {
        id: row.id,
        name_bn: row.full_name,
        name_en: row.full_name,
        phone: row.users?.phone || '017XXXXXXXX',
        professional_title: row.professional_title || 'দক্ষ মিস্ত্রী',
        title: row.professional_title || 'দক্ষ মিস্ত্রী',
        category: catInfo.category_name_bn,
        category_slug: catInfo.category_slug,
        category_name_bn: catInfo.category_name_bn,
        category_name_en: catInfo.category_name_en,
        subcategories: catInfo.subcategories,
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
        avatar: row.users?.avatar_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
        bio: row.bio || 'দক্ষ ও ভেরিফাইড কারিগর। সততার সাথে কাজ সম্পন্ন করি।',
        portfolio: [],
        reviews: [],
        status: 'approved',
      }
    })
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
      .select('id, phone, email, avatar_url')
      .eq('phone', cleanPhone)
      .maybeSingle()

    if (user?.id) {
      let authUserMeta: any = null
      try {
        const authRes = await supabase.auth.admin.getUserById(user.id)
        authUserMeta = authRes.data?.user?.user_metadata
      } catch (e) {}

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
          fatherName: authUserMeta?.father_name || (profile as any)?.father_name || '',
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
          avatar: user.avatar_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
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
      fatherName: foundApp.fatherName || '',
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
      fatherName: (initialFound as any).fatherName || '',
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
      if (Object.keys(safeUpdates).length > 0) {
        await supabase
          .from('mistri_profiles')
          .update(safeUpdates)
          .eq('user_id', user.id)
      }

      // Update avatar_url on the users table (authoritative storage for avatars)
      if (updates.avatar !== undefined) {
        await supabase
          .from('users')
          .update({ avatar_url: updates.avatar })
          .eq('id', user.id)
      }
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

  // Also update in INITIAL_APPROVED_MISTRIS if present
  const { INITIAL_APPROVED_MISTRIS } = await import('@/lib/mistri-store')
  const initial = INITIAL_APPROVED_MISTRIS.find(m => (m.phone || '').replace(/[^0-9]/g, '') === cleanPhone)
  if (initial && updates.avatar !== undefined) {
    initial.avatar = updates.avatar
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

export async function saveBookingToSupabase(data: {
  mistriId: string
  mistriName?: string
  contactPhone: string
  customerName?: string
  subcategory: string
  workDescription: string
  jobAddress: string
  latitude?: number
  longitude?: number
  preferredDate: string
  preferredTime: string
  estimatedBudget?: number | null
  workPhotos?: string[]
}) {
  try {
    const supabase = createAdminClient() as any
    const cleanCustomerPhone = (data.contactPhone || '').replace(/[^0-9]/g, '')
    
    // 1. Resolve or create customer user and customer_profile
    let customerUserId: string | null = null
    let customerProfileId: string | null = null

    if (cleanCustomerPhone) {
      const { data: custUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', cleanCustomerPhone)
        .maybeSingle()

      if (custUser?.id) {
        customerUserId = custUser.id
      } else {
        const { data: newU } = await supabase
          .from('users')
          .insert({
            phone: cleanCustomerPhone,
            role: 'customer',
            preferred_language: 'bn',
          })
          .select('id')
          .maybeSingle()
        customerUserId = newU?.id || null
      }

      if (customerUserId) {
        const { data: custProf } = await supabase
          .from('customer_profiles')
          .upsert(
            {
              user_id: customerUserId,
              full_name: data.customerName || 'সম্মানিত গ্রাহক',
              default_address: data.jobAddress,
            },
            { onConflict: 'user_id' }
          )
          .select('id')
          .maybeSingle()
        customerProfileId = custProf?.id || null
      }
    }

    // 2. Resolve mistri profile and user_id
    let mistriProfileId: string | null = null
    let mistriUserId: string | null = null
    let mistriPhone: string | null = null

    const cleanMistriId = (data.mistriId || '').replace(/^m-live-/, '')
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanMistriId)
    if (isUuid) {
      const { data: mProf } = await supabase
        .from('mistri_profiles')
        .select('id, user_id, users(phone)')
        .eq('id', cleanMistriId)
        .maybeSingle()

      if (mProf?.id) {
        mistriProfileId = mProf.id
        mistriUserId = mProf.user_id
        mistriPhone = mProf.users?.phone || null
      }
    }

    // If not found by UUID, try to find mistri profile by phone or name
    if (!mistriProfileId) {
      const { data: mProf2 } = await supabase
        .from('mistri_profiles')
        .select('id, user_id, users(phone)')
        .ilike('full_name', `%${data.mistriName || ''}%`)
        .limit(1)
        .maybeSingle()

      if (mProf2?.id) {
        mistriProfileId = mProf2.id
        mistriUserId = mProf2.user_id
        mistriPhone = mProf2.users?.phone || null
      }
    }

    // 3. Resolve category and subcategory IDs
    const { data: cats } = await supabase.from('categories').select('id, slug')
    const { data: subcats } = await supabase.from('subcategories').select('id, category_id, name_bn')

    const matchedSubcat = subcats?.find((s: any) => s.name_bn === data.subcategory || data.subcategory.includes(s.name_bn))
    const categoryId = matchedSubcat?.category_id || cats?.[0]?.id || '22222222-2222-2222-2222-222222222201'
    const subcategoryId = matchedSubcat?.id || subcats?.[0]?.id || '71255d8d-18c2-4e23-a338-bef170c89105'

    let insertedBooking: any = null

    // 4. If both customerProfileId and mistriProfileId exist, insert into public.bookings
    if (customerProfileId && mistriProfileId) {
      const bookingNumber = 'MST-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
      const lat = data.latitude || 26.0336
      const lng = data.longitude || 88.4617

      const { data: bRow, error: bErr } = await supabase
        .from('bookings')
        .insert({
          booking_number: bookingNumber,
          customer_id: customerProfileId,
          mistri_id: mistriProfileId,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          status: 'pending',
          work_description: data.workDescription,
          job_address: data.jobAddress,
          job_location_point: `SRID=4326;POINT(${lng} ${lat})`,
          contact_phone: cleanCustomerPhone,
          preferred_date: data.preferredDate,
          preferred_time: data.preferredTime,
          estimated_budget: data.estimatedBudget || 400,
          work_photos: data.workPhotos || [],
        })
        .select()
        .maybeSingle()

      if (!bErr && bRow) {
        insertedBooking = bRow
      } else if (bErr) {
        console.warn('Supabase booking insert warning:', bErr.message)
      }
    }

    // 5. Create notification for the mistri in Supabase!
    if (mistriUserId) {
      try {
        await supabase.from('notifications').insert({
          user_id: mistriUserId,
          title: '🔔 নতুন কাজের বুকিং অনুরোধ!',
          body: `গ্রাহক ${data.customerName || data.contactPhone} আপনার জন্য একটি নতুন কাজের অনুরোধ পাঠিয়েছেন। কাজের ধরন: ${data.subcategory}`,
          type: 'booking',
          reference_id: insertedBooking?.id || null,
          is_read: false,
        })
      } catch (nErr: any) {
        console.warn('Notification insert error:', nErr.message)
      }
    }

    return {
      success: true,
      booking: insertedBooking,
      mistriPhone,
      mistriUserId,
    }
  } catch (err: any) {
    console.error('saveBookingToSupabase exception:', err.message)
    return { success: false, error: err.message }
  }
}

export async function updateBookingStatusInSupabase(
  id: string,
  status: string,
  options: {
    agreedPrice?: number
    reason?: string
    proposedDate?: string
    proposedTime?: string
  } = {}
) {
  try {
    const supabase = createAdminClient() as any
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (options.agreedPrice !== undefined) updatePayload.agreed_price = options.agreedPrice
    if (options.reason !== undefined) updatePayload.cancellation_reason = options.reason
    if (options.proposedDate) updatePayload.preferred_date = options.proposedDate
    if (options.proposedTime) updatePayload.preferred_time = options.proposedTime
    if (status === 'accepted') updatePayload.accepted_at = new Date().toISOString()
    if (status === 'completed') updatePayload.completed_at = new Date().toISOString()

    if (isUuid) {
      const { data: updated, error } = await supabase
        .from('bookings')
        .update(updatePayload)
        .eq('id', id)
        .select('*, customer_profiles(user_id, full_name), mistri_profiles(full_name)')
        .maybeSingle()

      if (!error && updated) {
        const custUserId = updated.customer_profiles?.user_id
        if (custUserId) {
          let notifTitle = 'বুকিং আপডেট'
          let notifBody = ''
          if (status === 'accepted') {
            if (options.proposedTime) {
              notifTitle = 'মিস্ত্রী নতুন সময় প্রস্তাব সহ বুকিং গ্রহণ করেছেন!'
              notifBody = `মিস্ত্রী আপনার কাজের অনুরোধ গ্রহণ করেছেন এবং নতুন সময় দিয়েছেন: ${options.proposedTime} (${options.proposedDate || 'আজ'})`
            } else {
              notifTitle = 'মিস্ত্রী আপনার বুকিং গ্রহণ করেছেন!'
              notifBody = 'মিস্ত্রী আপনার বুকিং সরাসরি গ্রহণ করেছেন এবং সুবিধাজনক সময়ে কাজ শুরু করবেন।'
            }
          } else if (status === 'rejected') {
            notifTitle = 'মিস্ত্রী বর্তমানে ব্যস্ত আছেন'
            notifBody = `মিস্ত্রী বর্তমানে অন্য কাজে ব্যস্ত থাকায় অনুরোধটি গ্রহণ করতে পারেননি। কারণ: ${options.reason || 'সময়ের অমিল'}`
          }

          if (notifBody) {
            await supabase.from('notifications').insert({
              user_id: custUserId,
              title: notifTitle,
              body: notifBody,
              type: 'booking',
              reference_id: updated.id,
              is_read: false,
            })
          }
        }
      }
    }
  } catch (err: any) {
    console.error('updateBookingStatusInSupabase exception:', err.message)
  }
}

export async function getBookingsFromSupabase(filter: {
  mistriId?: string
  mistriPhone?: string
  customerPhone?: string
  status?: string
} = {}) {
  try {
    const supabase = createAdminClient() as any
    let query = supabase
      .from('bookings')
      .select('*, mistri_profiles(id, full_name, users(phone)), customer_profiles(full_name, users(phone)), categories(name_bn), subcategories(name_bn)')
      .order('created_at', { ascending: false })

    if (filter.status && filter.status !== 'all') {
      query = query.eq('status', filter.status)
    }

    const { data, error } = await query
    if (error || !data) return []

    return data
      .filter((row: any) => {
        if (filter.mistriPhone) {
          const mPhone = (row.mistri_profiles?.users?.phone || '').replace(/[^0-9]/g, '')
          const cleanFilterPhone = filter.mistriPhone.replace(/[^0-9]/g, '')
          if (mPhone !== cleanFilterPhone) return false
        }
        if (filter.mistriId) {
          if (row.mistri_id !== filter.mistriId && row.mistri_profiles?.id !== filter.mistriId) {
            return false
          }
        }
        if (filter.customerPhone) {
          const cPhone = (row.contact_phone || row.customer_profiles?.users?.phone || '').replace(/[^0-9]/g, '')
          const cleanCustPhone = filter.customerPhone.replace(/[^0-9]/g, '')
          if (cPhone !== cleanCustPhone) return false
        }
        return true
      })
      .map((row: any) => ({
        id: row.id,
        bookingNumber: row.booking_number,
        mistriId: row.mistri_id,
        mistriName: row.mistri_profiles?.full_name || 'নির্ধারিত মিস্ত্রী',
        mistriPhone: row.mistri_profiles?.users?.phone || '',
        customerName: row.customer_profiles?.full_name || 'সম্মানিত গ্রাহক',
        customerPhone: row.contact_phone || '',
        serviceName: row.subcategories?.name_bn || row.categories?.name_bn || 'সাধারণ সেবা',
        category: row.categories?.name_bn || 'ইলেকট্রিক্যাল কাজ',
        description: row.work_description || '',
        jobAddress: row.job_address || '',
        location: row.job_address || '',
        amount: Number(row.estimated_budget) || 400,
        estimatedBudget: Number(row.estimated_budget) || 400,
        agreedPrice: row.agreed_price ? Number(row.agreed_price) : null,
        preferredDate: row.preferred_date || '',
        preferredTime: row.preferred_time || '',
        status: row.status,
        date: row.preferred_date || new Date(row.created_at).toISOString().slice(0, 10),
        workPhotos: row.work_photos || [],
        cancellationReason: row.cancellation_reason || null,
        createdAt: row.created_at,
      }))
  } catch (err: any) {
    console.error('getBookingsFromSupabase error:', err.message)
    return []
  }
}

export interface PersistentAccountState {
  trashedMistriIds: string[]
  deletedMistriIds: string[]
  suspendedMistriIds: string[]
  updatedAt?: string
}

const SYSTEM_STATE_USER_ID = '1c847986-9051-490d-b225-d73a545bfdc9'
const SYSTEM_STATE_EMAIL = 'system_admin_state@mistri.internal'

export async function getPersistentAccountState(): Promise<PersistentAccountState> {
  const defaultState: PersistentAccountState = {
    trashedMistriIds: [],
    deletedMistriIds: [],
    suspendedMistriIds: [],
  }

  try {
    const supabase = createAdminClient() as any
    const { data, error } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('email', SYSTEM_STATE_EMAIL)
      .maybeSingle()

    if (!error && data?.avatar_url) {
      try {
        const parsed = JSON.parse(data.avatar_url)
        return {
          trashedMistriIds: Array.isArray(parsed.trashedMistriIds) ? parsed.trashedMistriIds : [],
          deletedMistriIds: Array.isArray(parsed.deletedMistriIds) ? parsed.deletedMistriIds : [],
          suspendedMistriIds: Array.isArray(parsed.suspendedMistriIds) ? parsed.suspendedMistriIds : [],
          updatedAt: parsed.updatedAt,
        }
      } catch (parseErr) {
        console.warn('Failed to parse persistent account state json:', parseErr)
      }
    }
  } catch (err: any) {
    console.error('getPersistentAccountState error:', err.message)
  }

  return defaultState
}

export async function savePersistentAccountState(state: PersistentAccountState): Promise<boolean> {
  try {
    const supabase = createAdminClient() as any
    const payload = JSON.stringify({
      trashedMistriIds: Array.from(new Set(state.trashedMistriIds || [])),
      deletedMistriIds: Array.from(new Set(state.deletedMistriIds || [])),
      suspendedMistriIds: Array.from(new Set(state.suspendedMistriIds || [])),
      updatedAt: new Date().toISOString(),
    })

    const { error } = await supabase.from('users').upsert({
      id: SYSTEM_STATE_USER_ID,
      email: SYSTEM_STATE_EMAIL,
      phone: '00000000000',
      role: 'admin',
      preferred_language: 'bn',
      avatar_url: payload,
      is_active: false,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error('savePersistentAccountState error:', error.message)
      return false
    }
    return true
  } catch (err: any) {
    console.error('savePersistentAccountState exception:', err.message)
    return false
  }
}

export async function softDeleteMistriInSupabase(id: string) {
  try {
    const supabase = createAdminClient() as any
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (isUuid) {
      await supabase
        .from('mistri_profiles')
        .update({
          deleted_at: new Date().toISOString(),
          approval_status: 'suspended',
          is_available: false,
        })
        .eq('id', id)
    }

    // Persist in Supabase PostgreSQL state so demo and real accounts persist across cold starts and refreshes!
    const state = await getPersistentAccountState()
    const trashed = new Set(state.trashedMistriIds)
    trashed.add(id)
    const suspended = new Set(state.suspendedMistriIds)
    suspended.delete(id)
    const deleted = new Set(state.deletedMistriIds)
    deleted.delete(id)

    await savePersistentAccountState({
      trashedMistriIds: Array.from(trashed),
      deletedMistriIds: Array.from(deleted),
      suspendedMistriIds: Array.from(suspended),
    })

    return true
  } catch (err: any) {
    console.error('softDeleteMistriInSupabase error:', err.message)
    return false
  }
}

export async function restoreMistriInSupabase(id: string) {
  try {
    const supabase = createAdminClient() as any
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (isUuid) {
      await supabase
        .from('mistri_profiles')
        .update({
          deleted_at: null,
          approval_status: 'approved',
          is_available: true,
        })
        .eq('id', id)
    }

    const state = await getPersistentAccountState()
    const trashed = new Set(state.trashedMistriIds)
    trashed.delete(id)
    const deleted = new Set(state.deletedMistriIds)
    deleted.delete(id)

    await savePersistentAccountState({
      trashedMistriIds: Array.from(trashed),
      deletedMistriIds: Array.from(deleted),
      suspendedMistriIds: state.suspendedMistriIds,
    })

    return true
  } catch (err: any) {
    console.error('restoreMistriInSupabase error:', err.message)
    return false
  }
}

export async function setMistriSuspendedInSupabase(id: string, suspended: boolean) {
  try {
    const supabase = createAdminClient() as any
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (isUuid) {
      await supabase
        .from('mistri_profiles')
        .update({
          approval_status: suspended ? 'suspended' : 'approved',
          is_available: !suspended,
        })
        .eq('id', id)
    }

    const state = await getPersistentAccountState()
    const suspendedSet = new Set(state.suspendedMistriIds)
    if (suspended) {
      suspendedSet.add(id)
    } else {
      suspendedSet.delete(id)
    }

    await savePersistentAccountState({
      trashedMistriIds: state.trashedMistriIds,
      deletedMistriIds: state.deletedMistriIds,
      suspendedMistriIds: Array.from(suspendedSet),
    })

    return true
  } catch (err: any) {
    console.error('setMistriSuspendedInSupabase error:', err.message)
    return false
  }
}

export async function permanentDeleteMistriFromSupabase(id: string) {
  try {
    const supabase = createAdminClient() as any
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (isUuid) {
      const { data: profile } = await supabase
        .from('mistri_profiles')
        .select('user_id')
        .eq('id', id)
        .maybeSingle()

      await supabase.from('mistri_profiles').delete().eq('id', id)
      if (profile?.user_id) {
        await supabase.from('users').delete().eq('id', profile.user_id)
        try {
          await supabase.auth.admin.deleteUser(profile.user_id)
        } catch {}
      }
    }

    // Crucial: Add ID to permanent deleted blacklist in Supabase PostgreSQL
    // so that neither demo mistris nor deleted real mistris ever reappear!
    const state = await getPersistentAccountState()
    const deleted = new Set(state.deletedMistriIds)
    deleted.add(id)
    const trashed = new Set(state.trashedMistriIds)
    trashed.delete(id)
    const suspended = new Set(state.suspendedMistriIds)
    suspended.delete(id)

    await savePersistentAccountState({
      trashedMistriIds: Array.from(trashed),
      deletedMistriIds: Array.from(deleted),
      suspendedMistriIds: Array.from(suspended),
    })

    return true
  } catch (err: any) {
    console.error('permanentDeleteMistriFromSupabase error:', err.message)
    return false
  }
}
