import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword, setAdminPassword } from '@/lib/auth-credentials'

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword, confirmPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'বর্তমান পাসওয়ার্ড এবং নতুন পাসওয়ার্ড প্রদান করুন' },
        { status: 400 }
      )
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { success: false, error: 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে' },
        { status: 400 }
      )
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি' },
        { status: 400 }
      )
    }

    const isValid = verifyAdminPassword(currentPassword)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'বর্তমান এডমিন পাসওয়ার্ডটি সঠিক নয়! পুনরায় চেষ্টা করুন।' },
        { status: 401 }
      )
    }

    const updated = await setAdminPassword(newPassword)
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'পাসওয়ার্ড সংরক্ষণ করতে সমস্যা হয়েছে' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'এডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! পরবর্তী লগইনে এই নতুন পাসওয়ার্ডটি ব্যবহার করুন।',
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'এডমিন পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে' },
      { status: 500 }
    )
  }
}
