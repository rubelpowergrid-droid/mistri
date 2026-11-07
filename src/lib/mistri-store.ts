// Central Mistri Verification, Customers, Bookings and Directory Store

export interface ApplicantRecord {
  id: string
  name: string
  phone: string
  password?: string
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

export interface CustomerRecord {
  id: string
  name: string
  phone: string
  district: string
  upazila: string
  address: string
  totalBookings: number
  lastBookingDate: string
  status: 'active' | 'inactive'
  avatar: string
}

export interface BookingRecord {
  id: string
  bookingNumber: string
  mistriName: string
  customerName: string
  customerPhone: string
  serviceName: string
  location: string
  amount: number
  status: 'completed' | 'in_progress' | 'pending'
  date: string
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
  {
    id: 'app-jewel-rana',
    name: 'মোঃ জুয়েল রানা',
    phone: '01722159830',
    nidNumber: '1990521934000123',
    dateOfBirth: '১৯৯০-০৫-১৫',
    gender: 'পুরুষ',
    category: 'ইলেকট্রিক্যাল কাজ',
    categorySlug: 'electrical-services',
    subcategories: ['বাসা-বাড়ির ওয়্যারিং', 'ফ্যান ও লাইটিং ফিটিং', 'সুইচ ও সকেট মেরামত', 'সার্কিট ব্রেকার ও ডিবি বোর্ড'],
    experienceYears: 6,
    district: 'ঠাকুরগাঁও',
    upazila: 'ঠাকুরগাঁও সদর',
    area: 'হাজীপাড়া',
    streetAddress: 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
    serviceRadiusKm: 15,
    chargeType: 'আলোচনা সাপেক্ষে (Negotiable)',
    baseCharge: 400,
    bio: 'আমি বিগত ৬ বছর ধরে ঠাকুরগাঁও সদর ও আশপাশের এলাকায় সব ধরনের বৈদ্যুতিক ওয়্যারিং, ফ্যান ফিটিংস ও মেরামতের কাজ সুনামের সাথে করে আসছি।',
    submittedAt: '২০২৬-১১-০৭, রাত ৮:০০',
    status: 'approved',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    nidFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    nidBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
  },
]

export const INITIAL_APPROVED_MISTRIS = [
  {
    id: 'm-jewel-rana',
    name_bn: 'মোঃ জুয়েল রানা',
    name_en: 'Md. Jewel Rana',
    phone: '01722159830',
    professional_title: 'সিনিয়র ইলেকট্রিশিয়ান ও ওয়্যারিং টেকনিশিয়ান',
    title: 'সিনিয়র ইলেকট্রিশিয়ান ও ওয়্যারিং টেকনিশিয়ান',
    category: 'ইলেকট্রিক্যাল কাজ',
    category_slug: 'electrical-services',
    category_name_bn: 'ইলেকট্রিক্যাল কাজ',
    category_name_en: 'Electrical Services',
    subcategories: ['বাসা-বাড়ির ওয়্যারিং', 'ফ্যান ও লাইটিং ফিটিং', 'সুইচ ও সকেট মেরামত', 'সার্কিট ব্রেকার ও ডিবি বোর্ড'],
    district: 'Thakurgaon',
    district_bn: 'ঠাকুরগাঁও',
    upazila: 'Thakurgaon Sadar',
    upazila_bn: 'ঠাকুরগাঁও সদর',
    experience_years: 6,
    experienceYears: 6,
    average_rating: 5.0,
    rating: 5.0,
    reviewsCount: 1,
    total_reviews: 1,
    completedJobs: 14,
    total_completed_jobs: 14,
    base_charge: 400,
    charge_type: 'negotiable',
    is_available: true,
    available_today: true,
    available_tomorrow: true,
    is_verified: true,
    distance_km: 1.2,
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    bio: 'আমি বিগত ৬ বছর ধরে ঠাকুরগাঁও সদর ও আশপাশের এলাকায় সব ধরনের বৈদ্যুতিক ওয়্যারিং, ফ্যান ফিটিংস ও মেরামতের কাজ সুনামের সাথে করে আসছি।',
    portfolio: [
      { id: 'p-jr-1', title: 'বাসা-বাড়ির ডিবি বোর্ড ওয়্যারিং', image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80' }
    ],
    reviews: [
      { id: 'r-jr-1', customer_name: 'মোঃ মাসুদ রানা', rating_overall: 5, date: 'আজকে', comment: 'অত্যন্ত দক্ষ এবং দায়িত্বশীল কারিগর। সময়মতো কাজ শেষ করেছেন।' }
    ],
    status: 'approved',
  }
]

export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-01',
    name: 'মোঃ মাসুদ রানা',
    phone: '01722092804',
    district: 'ঠাকুরগাঁও',
    upazila: 'ঠাকুরগাঁও সদর',
    address: 'পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
    totalBookings: 4,
    lastBookingDate: '২০২৬-১১-০৭',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'cust-02',
    name: 'আহমেদ জুবায়ের',
    phone: '01711223344',
    district: 'ঠাকুরগাঁও',
    upazila: 'পীরগঞ্জ',
    address: 'পীরগঞ্জ বাজার রোড',
    totalBookings: 2,
    lastBookingDate: '২০২৬-১১-০৪',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'cust-03',
    name: 'ফারহানা চৌধুরী',
    phone: '01899887766',
    district: 'পঞ্চগড়',
    upazila: 'পঞ্চগড় সদর',
    address: 'কলেজ রোড, পঞ্চগড়',
    totalBookings: 3,
    lastBookingDate: '২০২৬-১০-২৮',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'cust-04',
    name: 'কামরুল হাসান',
    phone: '01922334455',
    district: 'দিনাজপুর',
    upazila: 'দিনাজপুর সদর',
    address: 'বালুবাড়ী, দিনাজপুর সদর',
    totalBookings: 5,
    lastBookingDate: '২০২৬-১১-০১',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'cust-05',
    name: 'তানভীর আহমেদ',
    phone: '01733445566',
    district: 'ঠাকুরগাঁও',
    upazila: 'রাণীশংকৈল',
    address: 'রাণীশংকৈল বাসস্ট্যান্ড',
    totalBookings: 1,
    lastBookingDate: '২০২৬-১০-১৫',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
]

export const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: 'b-01',
    bookingNumber: 'MST-261107-ABOD',
    mistriName: 'মোঃ রফিকুল ইসলাম',
    customerName: 'মোঃ মাসুদ রানা',
    customerPhone: '01722092804',
    serviceName: 'বাসা-বাড়ির ওয়্যারিং ও ডিবি মেরামত',
    location: 'পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
    amount: 500,
    status: 'completed',
    date: '২০২৬-১১-০৭',
  },
  {
    id: 'b-02',
    bookingNumber: 'MST-261104-KP12',
    mistriName: 'আব্দুল করিম',
    customerName: 'আহমেদ জুবায়ের',
    customerPhone: '01711223344',
    serviceName: 'পানির মোটর ও পাম্প মেরামত',
    location: 'পীরগঞ্জ বাজার রোড, ঠাকুরগাঁও',
    amount: 350,
    status: 'in_progress',
    date: '২০২৬-১১-০৪',
  },
  {
    id: 'b-03',
    bookingNumber: 'MST-261028-XY89',
    mistriName: 'তরিকুল হাসান',
    customerName: 'ফারহানা চৌধুরী',
    customerPhone: '01899887766',
    serviceName: 'টাইলস ও ফ্লোর ফিটিংস',
    location: 'কলেজ রোড, পঞ্চগড়',
    amount: 1200,
    status: 'completed',
    date: '২০২৬-১০-২৮',
  },
]

// Global store for persistent memory during server lifetime
declare global {
  var __MISTRI_APPLICANTS__: ApplicantRecord[] | undefined
  var __APPROVED_MISTRIS__: any[] | undefined
  var __CUSTOMERS_STORE__: CustomerRecord[] | undefined
  var __BOOKINGS_STORE__: BookingRecord[] | undefined
}

export function getApplicantsStore(): ApplicantRecord[] {
  if (!global.__MISTRI_APPLICANTS__) {
    global.__MISTRI_APPLICANTS__ = [...PENDING_APPLICANTS]
  }
  return global.__MISTRI_APPLICANTS__
}

export function getCustomersStore(): CustomerRecord[] {
  if (!global.__CUSTOMERS_STORE__) {
    global.__CUSTOMERS_STORE__ = [...INITIAL_CUSTOMERS]
  }
  return global.__CUSTOMERS_STORE__
}

export function getBookingsStore(): BookingRecord[] {
  if (!global.__BOOKINGS_STORE__) {
    global.__BOOKINGS_STORE__ = [...INITIAL_BOOKINGS]
  }
  return global.__BOOKINGS_STORE__
}

export function addBookingToStore(booking: {
  mistriName?: string
  customerName?: string
  customerPhone?: string
  serviceName?: string
  location?: string
  amount?: number
}): BookingRecord {
  const store = getBookingsStore()
  const newBooking: BookingRecord = {
    id: `b-${Date.now()}`,
    bookingNumber: 'MST-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    mistriName: booking.mistriName || 'দক্ষ কারিগর',
    customerName: booking.customerName || 'সম্মানিত গ্রাহক',
    customerPhone: booking.customerPhone || '017XXXXXXXX',
    serviceName: booking.serviceName || 'সাধারণ সেবা',
    location: booking.location || 'ঠাকুরগাঁও সদর',
    amount: booking.amount || 400,
    status: 'completed',
    date: new Date().toISOString().slice(0, 10),
  }
  store.unshift(newBooking)
  return newBooking
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
    // Keep in store so it remains accessible in the 'Approved' list

    // Add to approved live search directory
    if (!global.__APPROVED_MISTRIS__) {
      global.__APPROVED_MISTRIS__ = [...INITIAL_APPROVED_MISTRIS]
    }
    const liveMistri = {
      id: applicant.id.startsWith('m-') ? applicant.id : `m-live-${applicant.id}`,
      name_bn: applicant.name,
      name_en: applicant.name,
      phone: applicant.phone,
      title: applicant.category,
      professional_title: applicant.category,
      category: applicant.category,
      category_slug: applicant.categorySlug || 'electrical-services',
      category_name_bn: applicant.category,
      category_name_en: 'Professional Services',
      subcategories: applicant.subcategories || [],
      district: applicant.district === 'ঠাকুরগাঁও' ? 'Thakurgaon' : applicant.district === 'পঞ্চগড়' ? 'Panchagarh' : 'Dinajpur',
      district_bn: applicant.district,
      upazila: applicant.upazila,
      upazila_bn: applicant.upazila,
      experience_years: applicant.experienceYears || 5,
      experienceYears: applicant.experienceYears || 5,
      average_rating: 5.0,
      rating: 5.0,
      reviewsCount: 1,
      total_reviews: 1,
      completedJobs: 0,
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
      status: 'approved',
    }

    const existIdx = global.__APPROVED_MISTRIS__.findIndex(
      (m: any) => m.phone === applicant.phone || m.id === liveMistri.id
    )
    if (existIdx >= 0) {
      global.__APPROVED_MISTRIS__[existIdx] = liveMistri
    } else {
      global.__APPROVED_MISTRIS__.unshift(liveMistri)
    }

    return { success: true, applicant }
  } else if (action === 'reject') {
    applicant.status = 'rejected'
    return { success: true, applicant }
  } else {
    applicant.status = 'under_review'
    return { success: true, applicant }
  }
}

export function getAdminDashboardStats() {
  const applicants = getApplicantsStore()
  const pendingApplicants = applicants.filter(a => a.status === 'pending')
  const approvedApplicants = applicants.filter(a => a.status === 'approved')
  const approvedMistrisCount = 5 + approvedApplicants.length
  const customers = getCustomersStore()
  const bookings = getBookingsStore()

  const thakurgaonCount = customers.filter(c => c.district.includes('ঠাকুরগাঁও')).length + 3
  const panchagarhCount = customers.filter(c => c.district.includes('পঞ্চগড়')).length + 1
  const dinajpurCount = customers.filter(c => c.district.includes('দিনাজপুর')).length + 1
  const totalGeo = thakurgaonCount + panchagarhCount + dinajpurCount || 1

  const districtDistribution = [
    { 
      name_bn: 'ঠাকুরগাঁও জেলা', 
      name_en: 'Thakurgaon District', 
      percentage: Math.round((thakurgaonCount / totalGeo) * 100), 
      count: thakurgaonCount, 
      color: 'bg-blue-600' 
    },
    { 
      name_bn: 'পঞ্চগড় জেলা', 
      name_en: 'Panchagarh District', 
      percentage: Math.round((panchagarhCount / totalGeo) * 100), 
      count: panchagarhCount, 
      color: 'bg-emerald-600' 
    },
    { 
      name_bn: 'দিনাজপুর জেলা', 
      name_en: 'Dinajpur District', 
      percentage: Math.round((dinajpurCount / totalGeo) * 100), 
      count: dinajpurCount, 
      color: 'bg-amber-500' 
    },
  ]

  const categoryBookingShares = [
    { name_bn: 'ইলেকট্রিক্যাল সার্ভিস', name_en: 'Electrical Services', count: 2, share: '৪০%' },
    { name_bn: 'প্লাম্বিং সার্ভিস', name_en: 'Plumbing Services', count: 1, share: '৩০%' },
    { name_bn: 'রং করার কাজ', name_en: 'Painting Services', count: 1, share: '১৫%' },
    { name_bn: 'রাজমিস্ত্রীর কাজ', name_en: 'Masonry Services', count: 1, share: '১৫%' },
  ]

  return {
    totalCustomers: customers.length,
    approvedMistris: approvedMistrisCount,
    pendingVerifications: pendingApplicants.length,
    totalBookings: bookings.length,
    districtDistribution,
    categoryBookingShares,
  }
}
