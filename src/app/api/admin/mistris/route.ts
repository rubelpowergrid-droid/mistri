import { NextRequest, NextResponse } from 'next/server'
import { getApplicantsStore, INITIAL_APPROVED_MISTRIS } from '@/lib/mistri-store'
import { getApprovedMistrisFromSupabase } from '@/lib/supabase-service'

export const DEMO_ADMIN_MISTRIS = [
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
    // 1. Fetch approved from Supabase
    let supabaseMistris: any[] = []
    try {
      supabaseMistris = await getApprovedMistrisFromSupabase()
    } catch (e) {
      console.error('Failed to get mistris from Supabase:', e)
    }

    // 2. Fetch from applicants store
    const store = getApplicantsStore()
    const approvedApplicants = store.filter((a) => a.status === 'approved')

    // 3. Collect from global.__APPROVED_MISTRIS__
    const liveApproved = (global as any).__APPROVED_MISTRIS__ || INITIAL_APPROVED_MISTRIS

    // Combine list, prioritizing newly approved mistris at the top
    const combined: any[] = []
    const seenPhones = new Set<string>()

    // Priority 1: Supabase mistris
    for (const sm of supabaseMistris) {
      const cleanPhone = (sm.phone || '').replace(/[^0-9]/g, '')
      if (cleanPhone && !seenPhones.has(cleanPhone)) {
        seenPhones.add(cleanPhone)
        combined.push({
          id: sm.id,
          name: sm.name_bn,
          phone: sm.phone,
          title: sm.professional_title,
          category: sm.category_name_bn,
          district: sm.district_bn,
          upazila: sm.upazila_bn,
          experienceYears: sm.experience_years,
          rating: sm.average_rating || 5.0,
          reviewsCount: sm.total_reviews || 1,
          completedJobs: sm.total_completed_jobs || 0,
          status: 'approved',
          avatar: sm.avatar,
        })
      }
    }

    // Priority 2: In-memory live approved (e.g. Jewel Rana)
    for (const lm of liveApproved) {
      const cleanPhone = (lm.phone || '').replace(/[^0-9]/g, '')
      if (cleanPhone && !seenPhones.has(cleanPhone)) {
        seenPhones.add(cleanPhone)
        combined.push({
          id: lm.id,
          name: lm.name_bn,
          phone: lm.phone,
          title: lm.title || lm.professional_title,
          category: lm.category_name_bn || lm.category,
          district: lm.district_bn || lm.district,
          upazila: lm.upazila_bn || lm.upazila,
          experienceYears: lm.experience_years || lm.experienceYears || 5,
          rating: lm.average_rating || lm.rating || 5.0,
          reviewsCount: lm.total_reviews || lm.reviewsCount || 1,
          completedJobs: lm.total_completed_jobs || lm.completedJobs || 0,
          status: 'approved',
          avatar: lm.avatar,
        })
      }
    }

    // Priority 3: Approved applicants from store
    for (const app of approvedApplicants) {
      const cleanPhone = app.phone.replace(/[^0-9]/g, '')
      if (!seenPhones.has(cleanPhone)) {
        seenPhones.add(cleanPhone)
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
          status: 'approved',
          avatar: app.avatar,
        })
      }
    }

    // Priority 4: Seed demo mistris
    for (const dm of DEMO_ADMIN_MISTRIS) {
      const cleanPhone = dm.phone.replace(/[^0-9]/g, '')
      if (!seenPhones.has(cleanPhone)) {
        seenPhones.add(cleanPhone)
        combined.push(dm)
      }
    }

    return NextResponse.json({
      success: true,
      count: combined.length,
      mistris: combined,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
