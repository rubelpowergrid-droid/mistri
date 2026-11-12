import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { savePushSubscription, VAPID_PUBLIC_KEY } from '@/lib/web-push'

export const dynamic = 'force-dynamic'

const subscriptionSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
    expirationTime: z.number().nullable().optional(),
  }),
  phone: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
})

export async function GET() {
  return NextResponse.json({
    success: true,
    vapidPublicKey: VAPID_PUBLIC_KEY,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = subscriptionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid subscription payload', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { subscription, phone, userId, role } = parsed.data

    const saved = await savePushSubscription({
      subscription: subscription as any,
      phone,
      userId,
      role,
    })

    return NextResponse.json({
      success: true,
      message: 'Push subscription registered successfully',
      saved,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to register push subscription', message: err.message },
      { status: 500 }
    )
  }
}
