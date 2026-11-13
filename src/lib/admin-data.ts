import { createAdminClient } from '@/lib/supabase/admin'
import { 
  INITIAL_CUSTOMERS, 
  INITIAL_BOOKINGS, 
  CustomerRecord, 
  BookingRecord,
  getApplicantsStore,
  INITIAL_APPROVED_MISTRIS,
  getTrashedMistriIds,
  getSuspendedMistriIds
} from '@/lib/mistri-store'
import { 
  getPersistentAccountState, 
  resolveCategoryFromTitle 
} from '@/lib/supabase-service'

export const DEMO_ADMIN_MISTRIS: any[] = []

export interface AdminCustomerItem {
  id: string
  name: string
  phone: string
  email?: string
  district: string
  upazila: string
  address: string
  totalBookings: number
  lastBookingDate: string
  createdAt?: string
  status: 'active' | 'inactive'
  avatar: string
}

export interface AdminBookingItem {
  id: string
  bookingNumber: string
  mistriName: string
  mistriTitle?: string
  mistriPhone?: string
  mistriEmail?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerAddress?: string
  jobAddress?: string
  serviceName: string
  location: string
  amount: number
  estimatedBudget?: number | null
  agreedPrice?: number | null
  status: string
  date: string
  createdAt?: string | null
  acceptedAt?: string | null
  startedAt?: string | null
  completedAt?: string | null
  updatedAt?: string | null
  cancellationReason?: string | null
}

/**
 * Single Source of Truth for Admin Customers List & Counts
 */
export async function getAdminCustomersData() {
  const supabase = createAdminClient() as any
  let dbUsers: any[] = []
  let dbBookings: any[] = []

  try {
    const [uRes, bRes] = await Promise.all([
      supabase.from('users').select('*, customer_profiles(*)').eq('role', 'customer'),
      supabase.from('bookings').select('id, customer_id, contact_phone, created_at, status'),
    ])
    if (uRes.data) dbUsers = uRes.data
    if (bRes.data) dbBookings = bRes.data
  } catch (err) {
    console.warn('Failed to query Supabase customers:', err)
  }

  // Calculate booking statistics per phone
  const bookingCountsByPhone: Record<string, number> = {}
  const lastBookingByPhone: Record<string, string> = {}
  let completedCount = 0

  for (const b of dbBookings) {
    const phone = (b.contact_phone || '').replace(/[^0-9]/g, '')
    if (phone) {
      bookingCountsByPhone[phone] = (bookingCountsByPhone[phone] || 0) + 1
      if (!lastBookingByPhone[phone] || new Date(b.created_at) > new Date(lastBookingByPhone[phone])) {
        lastBookingByPhone[phone] = b.created_at
      }
    }
    if (b.status === 'completed' || b.status === 'accepted') {
      completedCount++
    }
  }

  const list: AdminCustomerItem[] = []
  const seenPhones = new Set<string>()

  // 1. Process real database customers
  for (const u of dbUsers) {
    const phone = (u.phone || '').replace(/[^0-9]/g, '')
    if (!phone || seenPhones.has(phone)) continue
    seenPhones.add(phone)

    const cp = Array.isArray(u.customer_profiles) ? u.customer_profiles[0] : u.customer_profiles
    const demoMatch = INITIAL_CUSTOMERS.find(d => d.phone.replace(/[^0-9]/g, '') === phone)

    const name = (cp?.full_name && cp.full_name !== 'সম্মানিত গ্রাহক')
      ? cp.full_name
      : (demoMatch?.name || cp?.full_name || 'সম্মানিত গ্রাহক')

    const address = cp?.default_address || demoMatch?.address || 'ঠাকুরগাঁও'
    let district = demoMatch?.district || 'ঠাকুরগাঁও'
    if (address.includes('পঞ্চগড়') || address.includes('Panchagarh')) district = 'পঞ্চগড়'
    else if (address.includes('দিনাজপুর') || address.includes('Dinajpur')) district = 'দিনাজপুর'
    else if (address.includes('ঠাকুরগাঁও') || address.includes('Thakurgaon')) district = 'ঠাকুরগাঁও'

    let upazila = demoMatch?.upazila || 'ঠাকুরগাঁও সদর'
    if (address.includes('পীরগঞ্জ')) upazila = 'পীরগঞ্জ'
    else if (address.includes('রাণীশংকৈল')) upazila = 'রাণীশংকৈল'
    else if (address.includes('বালিয়াডাঙ্গী')) upazila = 'বালিয়াডাঙ্গী'
    else if (address.includes('হরিপুর')) upazila = 'হরিপুর'
    else if (address.includes('বোদা')) upazila = 'বোদা'

    const dbBookingCount = bookingCountsByPhone[phone] || 0
    const totalBookings = dbBookingCount > 0 ? dbBookingCount : (demoMatch?.totalBookings || 0)

    let lastBookingDate = 'আজকে'
    if (lastBookingByPhone[phone]) {
      try {
        const d = new Date(lastBookingByPhone[phone])
        lastBookingDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      } catch {
        lastBookingDate = 'আজকে'
      }
    } else if (demoMatch?.lastBookingDate) {
      lastBookingDate = demoMatch.lastBookingDate
    }

    list.push({
      id: u.id,
      name,
      phone: u.phone,
      email: u.email || '',
      district,
      upazila,
      address,
      totalBookings,
      lastBookingDate,
      createdAt: u.created_at || '',
      status: u.is_active !== false ? 'active' : 'inactive',
      avatar: u.avatar_url || demoMatch?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    })
  }

  // 2. Add seed demo customers whose phone was not registered
  for (const demo of INITIAL_CUSTOMERS) {
    const phone = demo.phone.replace(/[^0-9]/g, '')
    if (!seenPhones.has(phone)) {
      seenPhones.add(phone)
      list.push({
        id: demo.id,
        name: demo.name,
        phone: demo.phone,
        email: `customer_${phone}@mistri.app`,
        district: demo.district,
        upazila: demo.upazila,
        address: demo.address,
        totalBookings: demo.totalBookings,
        lastBookingDate: demo.lastBookingDate,
        createdAt: '',
        status: demo.status,
        avatar: demo.avatar,
      })
      completedCount += demo.totalBookings
    }
  }

  return {
    customers: list,
    totalCustomers: list.length,
    activeCustomers: list.filter(c => c.status === 'active').length,
    totalCompletedBookings: completedCount,
  }
}

/**
 * Single Source of Truth for Admin Mistris List & Counts
 */
export async function getAdminMistrisData() {
  const memoryTrashed = getTrashedMistriIds()
  const memorySuspended = getSuspendedMistriIds()

  const persistentState = await getPersistentAccountState()
  const trashedIds = new Set([...Array.from(memoryTrashed), ...persistentState.trashedMistriIds])
  const suspendedIds = new Set([...Array.from(memorySuspended), ...persistentState.suspendedMistriIds])
  const deletedIds = new Set(persistentState.deletedMistriIds)

  let supabaseMistris: any[] = []
  try {
    const supabase = createAdminClient() as any
    const { data } = await supabase
      .from('mistri_profiles')
      .select('*, users(phone, avatar_url), districts(name_bn, name_en), upazilas(name_bn, name_en)')

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
            avatar: row.users?.avatar_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
          }
        })
    }
  } catch (e) {
    console.error('Failed to get mistris from Supabase:', e)
  }

  const store = getApplicantsStore()
  const approvedApplicants = store.filter((a) => a.status === 'approved' && !deletedIds.has(a.id))
  const liveApproved = (global as any).__APPROVED_MISTRIS__ || INITIAL_APPROVED_MISTRIS

  const combined: any[] = []
  const seenPhones = new Set<string>()

  // 1. Supabase mistris
  for (const sm of supabaseMistris) {
    if (deletedIds.has(sm.id)) continue
    const cleanPhone = (sm.phone || '').replace(/[^0-9]/g, '')
    if (cleanPhone && !seenPhones.has(cleanPhone)) {
      seenPhones.add(cleanPhone)
      combined.push(sm)
    }
  }

  // 2. In-memory live approved
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

  // 3. Approved applicants from store
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

  // 4. Seed demo mistris
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

  return {
    mistris: combined,
    activeMistris: activeList,
    trashedMistris: trashList,
    suspendedMistris: suspendedList,
    totalCount: combined.length,
    activeCount: activeList.length,
    trashCount: trashList.length,
    suspendedCount: suspendedList.length,
  }
}

/**
 * Single Source of Truth for Admin Bookings List & Counts
 */
export async function getAdminBookingsData() {
  const supabase = createAdminClient() as any
  let dbBookings: any[] = []

  try {
    const { data } = await supabase
      .from('bookings')
      .select('*, mistri_profiles(full_name, professional_title, users(phone, email)), customer_profiles(full_name, default_address, users(phone, email))')
      .order('created_at', { ascending: false })

    if (data && Array.isArray(data)) {
      dbBookings = data
    }
  } catch (err) {
    console.warn('Failed to query Supabase bookings:', err)
  }

  const list: AdminBookingItem[] = []
  const seenNumbers = new Set<string>()

  // 1. Process DB bookings
  for (const b of dbBookings) {
    const num = b.booking_number || b.id
    if (seenNumbers.has(num)) continue
    seenNumbers.add(num)

    const mistriName = b.mistri_profiles?.full_name || 'নির্ধারিত মিস্ত্রী'
    const mistriTitle = b.mistri_profiles?.professional_title || 'দক্ষ মিস্ত্রী'
    const mistriPhone = b.mistri_profiles?.users?.phone || ''
    const mistriEmail = b.mistri_profiles?.users?.email || ''

    const customerName = b.customer_profiles?.full_name || 'সম্মানিত গ্রাহক'
    const customerPhone = b.contact_phone || b.customer_profiles?.users?.phone || ''
    const customerEmail = b.customer_profiles?.users?.email || ''
    const customerAddress = b.customer_profiles?.default_address || ''
    const jobAddress = b.job_address || customerAddress || 'ঠাকুরগাঁও'

    let formattedDate = '২০২৬-১১-১১'
    if (b.created_at) {
      try {
        const d = new Date(b.created_at)
        formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      } catch {}
    }

    list.push({
      id: b.id,
      bookingNumber: num,
      mistriName,
      mistriTitle,
      mistriPhone,
      mistriEmail,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      jobAddress,
      serviceName: b.work_description || 'সেবা অনুরোধ',
      location: jobAddress,
      amount: b.agreed_price || b.estimated_budget || 400,
      estimatedBudget: b.estimated_budget || 400,
      agreedPrice: b.agreed_price || null,
      status: b.status,
      date: formattedDate,
      createdAt: b.created_at || null,
      acceptedAt: b.accepted_at || null,
      startedAt: b.started_at || null,
      completedAt: b.completed_at || null,
      updatedAt: b.updated_at || null,
      cancellationReason: b.cancellation_reason || null,
    })
  }

  // 2. Add seed demo bookings if not present
  for (const ib of INITIAL_BOOKINGS) {
    if (!seenNumbers.has(ib.bookingNumber)) {
      seenNumbers.add(ib.bookingNumber)
      list.push(ib)
    }
  }

  const completedList = list.filter(b => b.status === 'completed' || b.status === 'accepted')

  return {
    bookings: list,
    totalBookings: list.length,
    completedBookings: completedList.length,
  }
}

/**
 * Unified Admin Overview Stats (Dashboard)
 * Guaranteed to match 100% with Customers, Mistris, and Bookings views!
 */
export async function getAdminOverviewStats() {
  const [customersData, mistrisData, bookingsData] = await Promise.all([
    getAdminCustomersData(),
    getAdminMistrisData(),
    getAdminBookingsData(),
  ])

  // Pending NID Verifications
  let pendingVerifications = 0
  try {
    const supabase = createAdminClient() as any
    const { count } = await supabase
      .from('mistri_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('approval_status', 'pending')

    if (typeof count === 'number') {
      pendingVerifications = count
    }
  } catch {}

  const applicantsStore = getApplicantsStore()
  const memoryPending = applicantsStore.filter(a => a.status === 'pending').length
  if (pendingVerifications === 0 && memoryPending > 0) {
    pendingVerifications = memoryPending
  }

  // Calculate dynamic district distribution from all active users (customers + mistris)
  const allUsersGeo = [
    ...customersData.customers.map(c => c.district),
    ...mistrisData.activeMistris.map(m => m.district),
  ]

  let thakurgaonCount = 0
  let panchagarhCount = 0
  let dinajpurCount = 0

  for (const d of allUsersGeo) {
    if (d.includes('ঠাকুরগাঁও')) thakurgaonCount++
    else if (d.includes('পঞ্চগড়')) panchagarhCount++
    else if (d.includes('দিনাজপুর')) dinajpurCount++
    else thakurgaonCount++
  }

  const totalGeo = (thakurgaonCount + panchagarhCount + dinajpurCount) || 1

  const districtDistribution = [
    {
      name_bn: 'ঠাকুরগাঁও জেলা',
      name_en: 'Thakurgaon District',
      percentage: Math.round((thakurgaonCount / totalGeo) * 100),
      count: thakurgaonCount,
      color: 'bg-blue-600',
    },
    {
      name_bn: 'পঞ্চগড় জেলা',
      name_en: 'Panchagarh District',
      percentage: Math.round((panchagarhCount / totalGeo) * 100),
      count: panchagarhCount,
      color: 'bg-emerald-600',
    },
    {
      name_bn: 'দিনাজপুর জেলা',
      name_en: 'Dinajpur District',
      percentage: Math.round((dinajpurCount / totalGeo) * 100),
      count: dinajpurCount,
      color: 'bg-amber-500',
    },
  ]

  // Calculate dynamic category booking shares
  const catCounts: Record<string, number> = {}
  for (const b of bookingsData.bookings) {
    const s = b.serviceName || ''
    if (s.includes('ইলেকট্রিক') || s.includes('ওয়্যারিং') || s.includes('ডিবি')) {
      catCounts['ইলেকট্রিক্যাল সার্ভিস'] = (catCounts['ইলেকট্রিক্যাল সার্ভিস'] || 0) + 1
    } else if (s.includes('প্লাম্বিং') || s.includes('মোটর') || s.includes('পাম্প') || s.includes('পাইপ')) {
      catCounts['প্লাম্বিং সার্ভিস'] = (catCounts['প্লাম্বিং সার্ভিস'] || 0) + 1
    } else if (s.includes('রং') || s.includes('পেইন্ট')) {
      catCounts['রং করার কাজ'] = (catCounts['রং করার কাজ'] || 0) + 1
    } else if (s.includes('টাইলস') || s.includes('রাজমিস্ত্রী') || s.includes('ফ্লোর')) {
      catCounts['রাজমিস্ত্রীর কাজ'] = (catCounts['রাজমিস্ত্রীর কাজ'] || 0) + 1
    } else {
      catCounts['ইলেকট্রিক্যাল সার্ভিস'] = (catCounts['ইলেকট্রিক্যাল সার্ভিস'] || 0) + 1
    }
  }

  const totalCatBookings = bookingsData.totalBookings || 1
  const categoryBookingShares = [
    {
      name_bn: 'ইলেকট্রিক্যাল সার্ভিস',
      name_en: 'Electrical Services',
      count: catCounts['ইলেকট্রিক্যাল সার্ভিস'] || 2,
      share: `${Math.round(((catCounts['ইলেকট্রিক্যাল সার্ভিস'] || 2) / totalCatBookings) * 100)}%`,
    },
    {
      name_bn: 'প্লাম্বিং সার্ভিস',
      name_en: 'Plumbing Services',
      count: catCounts['প্লাম্বিং সার্ভিস'] || 1,
      share: `${Math.round(((catCounts['প্লাম্বিং সার্ভিস'] || 1) / totalCatBookings) * 100)}%`,
    },
    {
      name_bn: 'রং করার কাজ',
      name_en: 'Painting Services',
      count: catCounts['রং করার কাজ'] || 1,
      share: `${Math.round(((catCounts['রং করার কাজ'] || 1) / totalCatBookings) * 100)}%`,
    },
    {
      name_bn: 'রাজমিস্ত্রীর কাজ',
      name_en: 'Masonry Services',
      count: catCounts['রাজমিস্ত্রীর কাজ'] || 1,
      share: `${Math.round(((catCounts['রাজমিস্ত্রীর কাজ'] || 1) / totalCatBookings) * 100)}%`,
    },
  ]

  return {
    totalCustomers: customersData.totalCustomers,
    approvedMistris: mistrisData.activeCount,
    pendingVerifications,
    totalBookings: bookingsData.totalBookings,
    completedBookings: bookingsData.completedBookings,
    districtDistribution,
    categoryBookingShares,
  }
}

