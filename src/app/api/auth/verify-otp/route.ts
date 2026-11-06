import { NextRequest, NextResponse } from 'next/server'
import { OtpService } from '@/lib/sms/otp-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code } = body

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: 'মোবাইল নম্বর এবং ওটিপি কোড প্রয়োজন' },
        { status: 400 }
      )
    }

    const verification = OtpService.verifyOtp(phone, code)

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error || 'ভুল ওটিপি কোড' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'ওটিপি সফলভাবে যাচাই করা হয়েছে',
      user: {
        phone,
        role: phone.includes('admin') || phone === '01700000000' ? 'admin' : phone.endsWith('99') ? 'mistri' : 'customer',
      },
    })
  } catch (error: any) {
    console.error('Error in verify-otp:', error)
    return NextResponse.json(
      { success: false, error: 'সার্ভার ত্রুটি, পুনরায় চেষ্টা করুন' },
      { status: 500 }
    )
  }
}

