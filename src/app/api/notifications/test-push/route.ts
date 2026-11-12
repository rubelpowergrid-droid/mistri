import { NextRequest, NextResponse } from 'next/server'
import { sendPushToUser, sendWebPush, getSubscriptionsForUser } from '@/lib/web-push'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { phone, userId, delaySeconds = 0, title, message } = body

    const pushTitle = title || '🔔 টেস্ট নোটিফিকেশন (MISTRI)'
    const pushBody =
      message || 'স্ক্রিন অফ থাকলেও নোটিফিকেশন সফলভাবে কাজ করছে! আলহামদুলিল্লাহ।'

    const doSend = async () => {
      return await sendPushToUser({
        phone,
        userId,
        title: pushTitle,
        body: pushBody,
        url: '/mistri/profile',
      })
    }

    if (delaySeconds && delaySeconds > 0) {
      // Trigger in background after delay (allowing user to turn off screen)
      setTimeout(async () => {
        try {
          await doSend()
        } catch (e) {
          console.error('[WebPush] Delayed push test error:', e)
        }
      }, delaySeconds * 1000)

      return NextResponse.json({
        success: true,
        message: `${delaySeconds} সেকেন্ড পর নোটিফিকেশন পাঠানো হবে। এখনই ফোনের স্ক্রিন বন্ধ করুন!`,
        delayed: true,
      })
    }

    const result = await doSend()

    return NextResponse.json({
      success: true,
      message: 'টেস্ট নোটিফিকেশন পাঠানো হয়েছে',
      result,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to send test push', message: err.message },
      { status: 500 }
    )
  }
}

