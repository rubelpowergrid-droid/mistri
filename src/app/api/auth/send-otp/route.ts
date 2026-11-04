import { NextRequest, NextResponse } from 'next/server'
import { OtpService } from '@/lib/sms/otp-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, channel = 'whatsapp' } = body

    if (!phone || phone.replace(/[^0-9]/g, '').length < 11) {
      return NextResponse.json(
        { success: false, error: 'সঠিক ১১-সংখ্যার মোবাইল নম্বর দিন' },
        { status: 400 }
      )
    }

    const result = await OtpService.sendOtp(phone, channel)

    return NextResponse.json({
      success: true,
      message: result.message,
      channel: result.channel,
      // For developer preview, return code if not in production
      previewCode: process.env.NODE_ENV !== 'production' ? result.code : undefined,
    })
  } catch (error: any) {
    console.error('Error in send-otp:', error)
    return NextResponse.json(
      { success: false, error: 'ওটিপি পাঠাতে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' },
      { status: 500 }
    )
  }
}
