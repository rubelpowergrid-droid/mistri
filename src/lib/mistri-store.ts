// Central Mistri Verification and Directory Store

export interface ApplicantRecord {
  id: string
  name: string
  phone: string
  nidNumber: string
  dateOfBirth?: string
  gender?: string
  category: string
  categorySlug: string
  subcategories: string[]
  experienceYears: number
  district: string
  upazila: string
  area?: string
  streetAddress?: string
  serviceRadiusKm?: number
  chargeType?: string
  baseCharge?: number
  bio?: string
  submittedAt: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  avatar: string
  nidFrontUrl?: string
  nidBackUrl?: string
}

// Initial pending applicants
export const PENDING_APPLICANTS: ApplicantRecord[] = [
  {
    id: 'app-01',
    name: 'মোঃ রফিকুল ইসলাম',
    phone: '01712345678',
    nidNumber: '1990521934000123',
    dateOfBirth: '১৯৯০-০৫-১৫',
    gender: 'পুরুষ',
    category: 'ইলেকট্রিক্যাল কাজ',
    categorySlug: 'electrical-services',
    subcategories: ['বাসা-বাড়ির ওয়্যারিং', 'ফ্যান ও লাইটিং ফিটিং', 'সুইচ ও সকেট মেরামত'],
    experienceYears: 6,
    district: 'ঠাকুরগাঁও',
    upazila: 'ঠাকুরগাঁও সদর',
    area: 'বাসস্ট্যান্ড এলাকা',
    streetAddress: 'রোড নং ৩, পূর্ব হাজীপাড়া, ঠাকুরগাঁও',
    serviceRadiusKm: 15,
    chargeType: 'আলোচনা সাপেক্ষে (Negotiable)',
    baseCharge: 400,
    bio: 'আমি বিগত ৬ বছর ধরে ঠাকুরগাঁও সদর ও আশপাশের এলাকায় সব ধরনের বৈদ্যুতিক ওয়্যারিং, ফ্যান ফিটিংস ও মেরামতের কাজ সুনামের সাথে করে আসছি।',
    submittedAt: '২০২৬-১১-০২, বিকাল ৪:৩০',
    status: 'pending',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    nidFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    nidBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'app-02',
    name: 'মোঃ জাহিদুল ইসলাম',
    phone: '01898765432',
    nidNumber: '1988271928000456',
    dateOfBirth: '১৯৮৮-০৭-২০',
    gender: 'পুরুষ',
    category: 'প্লাম্বিং সার্ভিস',
    categorySlug: 'plumbing-services',
    subcategories: ['পাইপ ফিটিং', 'পানির মোটর মেরামত', 'স্যানিটারি ফিটিংস'],
    experienceYears: 8,
    district: 'পঞ্চগড়',
    upazila: 'বোদা',
    area: 'বোদা বাজার',
    streetAddress: 'মেইন রোড, বোদা, পঞ্চগড়',
    serviceRadiusKm: 20,
    chargeType: 'নির্ধারিত (Fixed)',
    baseCharge: 350,
    bio: 'প্লাম্বিং লিকেজ মেরামত এবং মোটর ফিটিংসের কাজ অত্যন্ত দক্ষতার সাথে করি।',
    submittedAt: '২০২৬-১১-০২, দুপুর ১:১৫',
    status: 'pending',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    nidFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    nidBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'app-03',
    name: 'সোহেল রানা',
    phone: '01911223344',
    nidNumber: '1995271928000789',
    dateOfBirth: '১৯৯৫-০৩-১০',
    gender: 'পুরুষ',
    category: 'রং করার কাজ',
    categorySlug: 'painting-services',
    subcategories: ['দেয়াল রং', 'বার্নিশ ও পলিশ', 'পুটিং কাজ'],
    experienceYears: 4,
    district: 'দিনাজপুর',
    upazila: 'বীরগঞ্জ',
    area: 'বীরগঞ্জ বাসস্ট্যান্ড',
    streetAddress: 'থানা রোড, বীরগঞ্জ, দিনাজপুর',
    serviceRadiusKm: 12,
    chargeType: 'আলোচনা সাপেক্ষে (Negotiable)',
    baseCharge: 500,
    bio: 'ওয়াল পেইন্টিং ও কাঠের বার্নিশের কাজে ৪ বছরের বাস্তব অভিজ্ঞতা।',
    submittedAt: '২০২৬-১১-০১, সকাল ১০:২০',
    status: 'pending',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    nidFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    nidBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
  },
]

// Global store for persistent memory during server lifetime
declare global {
  var __MISTRI_APPLICANTS__: ApplicantRecord[] | undefined
  var __APPROVED_MISTRIS__: any[] | undefined
}

export function getApplicantsStore(): ApplicantRecord[] {
  if (!global.__MISTRI_APPLICANTS__) {
    global.__MISTRI_APPLICANTS__ = [...PENDING_APPLICANTS]
  }
  return global.__MISTRI_APPLICANTS__
}

export function addApplicantToQueue(applicant: Omit<ApplicantRecord, 'id' | 'status' | 'submittedAt'>): ApplicantRecord {
  const store = getApplicantsStore()
  const newId = `app-${Date.now()}`
  const now = new Date()
  const formattedDate = now.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) + ', ' + now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })

  const newRecord: ApplicantRecord = {
    ...applicant,
    id: newId,
    status: 'pending',
    submittedAt: formattedDate,
  }

  store.unshift(newRecord)
  return newRecord
}

export function updateApplicantStatus(
  id: string,
  action: 'approve' | 'reject' | 'request_correction'
): { success: boolean; applicant?: ApplicantRecord } {
  const store = getApplicantsStore()
  const index = store.findIndex((a) => a.id === id)
  if (index === -1) {
    return { success: false }
  }

  const applicant = store[index]

  if (action === 'approve') {
    applicant.status = 'approved'
    // Remove from pending queue
    store.splice(index, 1)

    // Add to approved live search directory
    if (!global.__APPROVED_MISTRIS__) {
      global.__APPROVED_MISTRIS__ = []
    }
    const liveMistri = {
      id: `m-live-${applicant.id}`,
      name_bn: applicant.name,
      name_en: applicant.name,
      professional_title: applicant.category,
      category_slug: applicant.categorySlug || 'electrical-services',
      category_name_bn: applicant.category,
      category_name_en: 'Professional Services',
      subcategories: applicant.subcategories || [],
      district: applicant.district === 'ঠাকুরগাঁও' ? 'Thakurgaon' : applicant.district === 'পঞ্চগড়' ? 'Panchagarh' : 'Dinajpur',
      district_bn: applicant.district,
      upazila: applicant.upazila,
      upazila_bn: applicant.upazila,
      experience_years: applicant.experienceYears || 5,
      average_rating: 5.0,
      total_reviews: 1,
      total_completed_jobs: 0,
      base_charge: applicant.baseCharge || 400,
      charge_type: 'negotiable',
      is_available: true,
      available_today: true,
      available_tomorrow: true,
      is_verified: true,
      distance_km: 1.2,
      avatar: applicant.avatar,
      bio: applicant.bio || 'দক্ষ ও ভেরিফাইড কারিগর। সততার সাথে কাজ সম্পন্ন করি।',
      portfolio: [],
      reviews: [],
    }
    global.__APPROVED_MISTRIS__.unshift(liveMistri)
    return { success: true, applicant }
  } else if (action === 'reject') {
    applicant.status = 'rejected'
    // Remove from pending queue
    store.splice(index, 1)
    return { success: true, applicant }
  } else {
    applicant.status = 'under_review'
    return { success: true, applicant }
  }
}
