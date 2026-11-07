import { NextRequest, NextResponse } from 'next/server'

// Sample comprehensive seed data for live search and filtering
export const MISTRI_DIRECTORY = [
  {
    id: 'm-1',
    name_bn: 'মোঃ রফিকুল ইসলাম',
    name_en: 'Md. Rafiqul Islam',
    professional_title: 'সিনিয়র ইলেকট্রিশিয়ান ও ওয়্যারিং এক্সপার্ট',
    category_slug: 'electrical-services',
    category_name_bn: 'ইলেকট্রিক্যাল কাজ',
    category_name_en: 'Electrical Services',
    subcategories: ['বাসা-বাড়ির ওয়্যারিং', 'ফ্যান ও লাইটিং ফিটিং', 'সুইচ ও সকেট মেরামত', 'সার্কিট ব্রেকার ও ডিবি বোর্ড'],
    district: 'Thakurgaon',
    district_bn: 'ঠাকুরগাঁও',
    upazila: 'Thakurgaon Sadar',
    upazila_bn: 'ঠাকুরগাঁও সদর',
    experience_years: 8,
    average_rating: 4.9,
    total_reviews: 38,
    total_completed_jobs: 142,
    base_charge: 400,
    charge_type: 'negotiable',
    is_available: true,
    available_today: true,
    available_tomorrow: true,
    is_verified: true,
    distance_km: 1.4,
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    bio: 'আমি বিগত ৮ বছর ধরে ঠাকুরগাঁও সদর ও আশপাশের এলাকায় সব ধরনের বৈদ্যুতিক ওয়্যারিং, ফ্যান ফিটিংস ও ফল্ট মেরামতের কাজ সুনামের সাথে করে আসছি।',
    portfolio: [
      { id: 'p-1', title: 'বাসা-বাড়ির ডিবি বোর্ড ওয়্যারিং', image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80' },
      { id: 'p-2', title: 'ফলস সিলিং স্পটলাইট ফিটিং', image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80' },
    ],
    reviews: [
      { id: 'r-1', customer_name: 'আহমেদ জুবায়ের', rating_overall: 5, date: '৩ দিন আগে', comment: 'খুবই দক্ষ কারিগর। ফ্যানের শব্দ হচ্ছিল, ৩০ মিনিটে ঠিক করে দিয়েছেন। আচরণও খুব ভালো।' },
      { id: 'r-2', customer_name: 'কামরুল হাসান', rating_overall: 4.8, date: '১ সপ্তাহ আগে', comment: 'সময়ে এসেছেন এবং ওয়্যারিংয়ের সমস্যা দ্রুত শনাক্ত করেছেন। সন্তুষ্ট।' },
    ],
  },
  {
    id: 'm-2',
    name_bn: 'আব্দুল করিম',
    name_en: 'Abdul Karim',
    professional_title: 'দক্ষ প্লাম্বিং ও পাইপলাইফ টেকনিশিয়ান',
    category_slug: 'plumbing-services',
    category_name_bn: 'প্লাম্বিং সার্ভিস',
    category_name_en: 'Plumbing Services',
    subcategories: ['পাইপ ফিটিং ও মেরামত', 'পানির মোটর ও পাম্প মেরামত', 'স্যানিটারি ও বাথরুম ফিটিংস', 'পানির ট্যাংক পরিষ্কার'],
    district: 'Thakurgaon',
    district_bn: 'ঠাকুরগাঁও',
    upazila: 'Pirganj',
    upazila_bn: 'পীরগঞ্জ',
    experience_years: 6,
    average_rating: 4.8,
    total_reviews: 29,
    total_completed_jobs: 98,
    base_charge: 350,
    charge_type: 'negotiable',
    is_available: true,
    available_today: true,
    available_tomorrow: true,
    is_verified: true,
    distance_km: 2.1,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bio: 'পানির মোটর মেরামত, পাইপলাইন লিকেজ সমাধান এবং আধুনিক বাথরুম ফিটিংসের কাজ অত্যন্ত বিশ্বস্ততার সাথে করে থাকি।',
    portfolio: [
      { id: 'p-3', title: 'পানির মোটর ইনস্টলেশন', image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80' },
    ],
    reviews: [
      { id: 'r-3', customer_name: 'মোঃ সাদিকুর রহমান', rating_overall: 5, date: '৫ দিন আগে', comment: 'পানির ট্যাংক পরিষ্কার ও নতুন পাইপলাইন ফিটিং খুব পরিচ্ছন্নভাবে করেছেন।' },
    ],
  },
  {
    id: 'm-3',
    name_bn: 'তরিকুল হাসান',
    name_en: 'Tariqul Hasan',
    professional_title: 'রাজমিস্ত্রী ও টাইলস স্পেশালিস্ট',
    category_slug: 'masonry-services',
    category_name_bn: 'রাজমিস্ত্রীর কাজ',
    category_name_en: 'Masonry Services',
    subcategories: ['ইট গাঁথুনি ও প্লাস্টার', 'টাইলস ও মার্বেল ফিটিংস', 'ছাদ ঢালাই ও কংক্রিট কাজ'],
    district: 'Panchagarh',
    district_bn: 'পঞ্চগড়',
    upazila: 'Boda',
    upazila_bn: 'বোদা',
    experience_years: 12,
    average_rating: 5.0,
    total_reviews: 52,
    total_completed_jobs: 210,
    base_charge: 700,
    charge_type: 'negotiable',
    is_available: true,
    available_today: false,
    available_tomorrow: true,
    is_verified: true,
    distance_km: 3.5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    bio: 'টাইলস ও মার্বেল ফিটিংসের সূক্ষ্ম কাজ এবং বাড়ি নির্মাণের অভিজ্ঞ রাজমিস্ত্রী। কাজের মানের বিষয়ে কোনো আপস নেই।',
    portfolio: [
      { id: 'p-4', title: 'ফ্লোর টাইলস ফিটিং', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80' },
    ],
    reviews: [
      { id: 'r-4', customer_name: 'বাপ্পী ইসলাম', rating_overall: 5, date: '২ সপ্তাহ আগে', comment: 'পুরো ড্রয়িং রুমের টাইলস কাজ খুব নিখুঁতভাবে করে দিয়েছেন। ধন্যবাদ তরিকুল ভাইকে।' },
    ],
  },
  {
    id: 'm-4',
    name_bn: 'সুমন বর্মণ',
    name_en: 'Sumon Barman',
    professional_title: 'মাস্টার পেইন্টার ও ডেকোরেশন কারিগর',
    category_slug: 'painting-services',
    category_name_bn: 'রং করার কাজ',
    category_name_en: 'Painting Services',
    subcategories: ['ঘরের ভেতরের দেয়াল রং', 'বাইরের দেয়াল ও ওয়েদারকোট', 'কাঠের বার্নিশ ও পলিশ', 'পুটিং ও প্রাইমার কাজ'],
    district: 'Dinajpur',
    district_bn: 'দিনাজপুর',
    upazila: 'Dinajpur Sadar',
    upazila_bn: 'দিনাজপুর সদর',
    experience_years: 9,
    average_rating: 4.7,
    total_reviews: 44,
    total_completed_jobs: 130,
    base_charge: 500,
    charge_type: 'negotiable',
    is_available: true,
    available_today: true,
    available_tomorrow: true,
    is_verified: true,
    distance_km: 4.2,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'আধুনিক কালার কম্বিনেশন, ওয়েদারকোট ও আসবাবপত্রের বার্নিশ কাজে বিশেষ দক্ষ। আপনার বাড়িকে আকর্ষণীয় রূপ দিতে প্রস্তুত।',
    portfolio: [
      { id: 'p-5', title: 'ইন্টেরিয়র ওয়াল পেইন্টিং', image_url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&auto=format&fit=crop&q=80' },
    ],
    reviews: [
      { id: 'r-5', customer_name: 'মাহমুদ করিম', rating_overall: 4.5, date: '৩ দিন আগে', comment: 'সময়ে কাজ শেষ করেছেন। রঙের ফিনিশিং খুবই চমৎকার।' },
    ],
  },
  {
    id: 'm-5',
    name_bn: 'আনোয়ার হোসেন',
    name_en: 'Anwar Hossain',
    professional_title: 'কাঠের কাজ ও মডার্ন ফার্নিচার মিস্ত্রী',
    category_slug: 'carpentry-services',
    category_name_bn: 'কাঠের কাজ',
    category_name_en: 'Carpentry Services',
    subcategories: ['দরজা-জানালার ফ্রেম', 'ফার্নিচার মেরামত ও অ্যাসেম্বলি', 'মডুলার ক্যাবিনেট'],
    district: 'Thakurgaon',
    district_bn: 'ঠাকুরগাঁও',
    upazila: 'Ranisankail',
    upazila_bn: 'রাণীশংকৈল',
    experience_years: 11,
    average_rating: 4.9,
    total_reviews: 63,
    total_completed_jobs: 175,
    base_charge: 600,
    charge_type: 'negotiable',
    is_available: true,
    available_today: true,
    available_tomorrow: true,
    is_verified: true,
    distance_km: 5.8,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    bio: 'সেগুন, মেহগনিসহ যেকোনো কাঠের টেকসই দরজা, জানালা ও কাস্টম আলমারি তৈরিতে দীর্ঘদিনের অভিজ্ঞতা।',
    portfolio: [
      { id: 'p-6', title: 'কাস্টম কাঠের দরজা তৈরি', image_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop&q=80' },
    ],
    reviews: [
      { id: 'r-6', customer_name: 'জাহিদুল ইসলাম', rating_overall: 5, date: '১ মাস আগে', comment: 'খুবই বিশ্বস্ত কারিগর। কাঠের কোয়ালিটি ও নকশা দুটোই দারুণ হয়েছে।' },
    ],
  },
  {
    id: 'm-6',
    name_bn: 'শাহজাহান আলী',
    name_en: 'Shahjahan Ali',
    professional_title: 'টিনের ঘর ও মেটাল ট্রাস টেকনিশিয়ান',
    category_slug: 'tin-roofing-services',
    category_name_bn: 'ঘরের টিনের কাজ',
    category_name_en: 'Tin Roofing Services',
    subcategories: ['টিনশেড নির্মাণ', 'টিনের চাল মেরামত ও লিকেজ বন্ধ', 'স্টিল ট্রাস কাজ'],
    district: 'Panchagarh',
    district_bn: 'পঞ্চগড়',
    upazila: 'Panchagarh Sadar',
    upazila_bn: 'পঞ্চগড় সদর',
    experience_years: 7,
    average_rating: 4.6,
    total_reviews: 21,
    total_completed_jobs: 76,
    base_charge: 450,
    charge_type: 'negotiable',
    is_available: true,
    available_today: true,
    available_tomorrow: false,
    is_verified: true,
    distance_km: 6.5,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    bio: 'উত্তরবঙ্গের আবহাওয়া উপযোগী মজবুত টিনের চাল তৈরি এবং বর্ষাকালে পানি চুইয়ে পড়ার সমস্যার নির্ভরযোগ্য সমাধান।',
    portfolio: [],
    reviews: [
      { id: 'r-7', customer_name: 'আতাউর রহমান', rating_overall: 4.8, date: '২ সপ্তাহ আগে', comment: 'বৃষ্টির দিনে টিনের চাল দিয়ে পানি পড়ছিল, উনি এসে রাবারের নাট-বল্টু ও সিলিকন দিয়ে ঠিক করে দিয়েছেন।' },
    ],
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.toLowerCase() || ''
  const category = searchParams.get('category') || ''
  const subcategory = searchParams.get('subcat') || ''
  const district = searchParams.get('district') || ''
  const minRating = Number(searchParams.get('rating') || 0)
  const minExp = Number(searchParams.get('exp') || 0)
  const minJobs = Number(searchParams.get('jobs') || 0)
  const maxPrice = Number(searchParams.get('maxPrice') || 999999)
  const verifiedOnly = searchParams.get('verified') === 'true'
  const availableToday = searchParams.get('today') === 'true'
  const maxDistance = Number(searchParams.get('distance') || 999)
  const sortBy = searchParams.get('sort') || 'nearest'

  let supabaseMistris: any[] = []
  try {
    const { getApprovedMistrisFromSupabase } = await import('@/lib/supabase-service')
    supabaseMistris = await getApprovedMistrisFromSupabase()
  } catch (err) {
    console.error('Supabase fetch error in search:', err)
  }

  const { INITIAL_APPROVED_MISTRIS } = await import('@/lib/mistri-store')
  const liveMemory = (global as any).__APPROVED_MISTRIS__ || INITIAL_APPROVED_MISTRIS

  const rawList = [...supabaseMistris, ...liveMemory, ...MISTRI_DIRECTORY]
  const seen = new Set<string>()
  const allMistris: any[] = []
  for (const m of rawList) {
    const key = (m.phone || '').replace(/[^0-9]/g, '') || m.id
    if (!seen.has(key)) {
      seen.add(key)
      allMistris.push(m)
    }
  }
  let filtered = allMistris.filter((m) => {
    // Text search
    if (q) {
      const matchName = m.name_bn.toLowerCase().includes(q) || m.name_en.toLowerCase().includes(q)
      const matchTitle = m.professional_title.toLowerCase().includes(q)
      const matchCategory = m.category_name_bn.includes(q) || m.category_name_en.toLowerCase().includes(q)
      const matchSub = (m.subcategories || []).some((s: string) => s.toLowerCase().includes(q))
      if (!matchName && !matchTitle && !matchCategory && !matchSub) return false
    }

    // Category filter
    if (category && category !== 'all' && m.category_slug !== category) return false

    // Subcategory filter
    if (subcategory && !m.subcategories.includes(subcategory)) return false

    // District filter
    if (district && district !== 'all' && m.district.toLowerCase() !== district.toLowerCase() && m.district_bn !== district) return false

    // Numeric filters
    if (m.average_rating < minRating) return false
    if (m.experience_years < minExp) return false
    if (m.total_completed_jobs < minJobs) return false
    if (m.base_charge > maxPrice) return false
    if (m.distance_km > maxDistance) return false

    // Flag filters
    if (verifiedOnly && !m.is_verified) return false
    if (availableToday && !m.available_today) return false

    return true
  })

  // Sorting
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'highest_rated':
        return b.average_rating - a.average_rating
      case 'most_jobs':
        return b.total_completed_jobs - a.total_completed_jobs
      case 'most_experienced':
        return b.experience_years - a.experience_years
      case 'price_low':
        return a.base_charge - b.base_charge
      case 'price_high':
        return b.base_charge - a.base_charge
      case 'nearest':
      default:
        return a.distance_km - b.distance_km
    }
  })

  return NextResponse.json({
    success: true,
    total: filtered.length,
    data: filtered,
  })
}

