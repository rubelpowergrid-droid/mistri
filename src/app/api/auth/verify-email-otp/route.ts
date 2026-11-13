import { NextRequest, NextResponse } from 'next/server'
import { EmailOtpService } from '@/lib/email-otp-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Gmail এবং ওটিপি কোড প্রদান করুন' },
        { status: 400 }
      )
    }

    const result = await EmailOtpService.verifyOtp(email, code)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'ভুল ওটিপি কোড' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Gmail সফলভাবে ভেরিফাই হয়েছে!',
    })
  } catch (error: any) {
    console.error('Error in verify-email-otp:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'যাচাইকরণে ত্রুটি হয়েছে' },
      { status: 500 }
    )
  }
}

