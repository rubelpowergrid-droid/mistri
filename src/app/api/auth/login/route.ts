import { NextRequest, NextResponse } from 'next/server'
import { getApplicantsStore } from '@/lib/mistri-store'
import { MISTRI_DIRECTORY } from '@/app/api/mistris/search/route'

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '')

    if (!cleanPhone || !password) {
      return NextResponse.json(
        { success: false, error: 'মোবাইল নম্বর ও পাসওয়ার্ড প্রদান করুন' },
        { status: 400 }
      )
    }

    // 1. Admin login check
    const isAdmin =
      cleanPhone === '01700000000' ||
      cleanPhone === '01722092804' ||
      phone.toLowerCase().includes('admin')

    if (isAdmin) {
      if (password === 'admin1234' || password === 'Mistri@2026') {
        return NextResponse.json({
          success: true,
          role: 'admin',
          redirectUrl: '/admin/dashboard',
          user: { phone: cleanPhone, name: 'Admin', role: 'admin' },
        })
      } else {
        return NextResponse.json(
          { success: false, error: 'ভুল এডমিন পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন' },
          { status: 401 }
        )
      }
    }

    // 2. Check Mistri applicants store (both pending and approved)
    const store = getApplicantsStore()
    const mistri = store.find((m) => m.phone.replace(/[^0-9]/g, '') === cleanPhone)

    if (mistri) {
      // If a password was saved during onboarding, verify it; otherwise fallback to default
      if (mistri.password && mistri.password !== password) {
        return NextResponse.json(
          { success: false, error: 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন' },
          { status: 401 }
        )
      }

      if (mistri.status === 'approved') {
        return NextResponse.json({
          success: true,
          role: 'mistri',
          status: 'approved',
          redirectUrl: '/mistri/profile',
          user: {
            id: mistri.id,
            name: mistri.name,
            phone: cleanPhone,
            role: 'mistri',
            status: 'approved',
          },
        })
      } else {
        return NextResponse.json({
          success: true,
          role: 'mistri',
          status: 'pending',
          redirectUrl: '/mistri/profile',
          message: 'আপনার আবেদনটি পর্যালোচনার জন্য জমা রয়েছে। আপনার প্রোফাইলটি নিচে দেখে নিন।',
          user: {
            id: mistri.id,
            name: mistri.name,
            phone: cleanPhone,
            role: 'mistri',
            status: 'pending',
          },
        })
      }
    }

    // 3. Check MISTRI_DIRECTORY default demo workers
    const defaultMistri = MISTRI_DIRECTORY.find(
      (m) => m.id.replace(/[^0-9]/g, '') === cleanPhone
    )
    if (defaultMistri) {
      return NextResponse.json({
        success: true,
        role: 'mistri',
        status: 'approved',
        redirectUrl: '/mistri/profile',
        user: {
          id: defaultMistri.id,
          name: defaultMistri.name_bn,
          phone: cleanPhone,
          role: 'mistri',
        },
      })
    }

    // 4. Default customer / general user login
    if (password.length >= 4) {
      return NextResponse.json({
        success: true,
        role: 'customer',
        redirectUrl: '/',
        user: { phone: cleanPhone, role: 'customer' },
      })
    }

    return NextResponse.json(
      { success: false, error: 'কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড দিন' },
      { status: 400 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}

