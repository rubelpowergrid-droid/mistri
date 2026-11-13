import { NextRequest, NextResponse } from 'next/server'
import { EmailOtpService } from '@/lib/email-otp-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, phone } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Gmail বা ইমেইল ঠিকানা প্রদান করুন' },
        { status: 400 }
      )
    }

    const result = await EmailOtpService.sendOtp(email, phone)

    return NextResponse.json({
      success: true,
      message: result.message,
      code: result.code,
      previewCode: result.previewCode,
      rateLimited: result.rateLimited,
    })
  } catch (error: any) {
    console.error('Error in send-email-otp:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Gmail এ ওটিপি পাঠাতে সমস্যা হয়েছে।' },
      { status: 400 }
    )
  }
}

