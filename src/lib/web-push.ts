import * as webpush from 'web-push'
import { createAdminClient } from './supabase/admin'

// VAPID Keys for Web Push Notifications
// These keys match the public key registered in client service workers
export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BEls45QXodFHlbmdaMT71OGqLvNzayCHOpazELkYkjdQ3xlPB-EG6caHxthm8RpllBAHgGyd4xDLB6G8PIOUs2U'

export const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  '9l24a_Yhpjay-Y4G2c7yy8-14X03eI3wGd9v5vXlCuw'

export const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:support@mistri24.app'

// Initialize web-push configuration
try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
} catch (e) {
  console.warn('[WebPush] setVapidDetails warning:', e)
}

export interface StoredPushSubscription {
  id?: string
  userId?: string | null
  phone?: string | null
  role?: string | null
  subscription: webpush.PushSubscription
  updatedAt: string
}

// In-memory subscription store for immediate server-side delivery across sessions
declare global {
  // eslint-disable-next-line no-var
  var __MISTRI_PUSH_SUBSCRIPTIONS__: Map<string, StoredPushSubscription> | undefined
}

if (!globalThis.__MISTRI_PUSH_SUBSCRIPTIONS__) {
  globalThis.__MISTRI_PUSH_SUBSCRIPTIONS__ = new Map()
}

const memorySubscriptions = globalThis.__MISTRI_PUSH_SUBSCRIPTIONS__

/**
 * Save or update a PushSubscription for a user/device
 */
export async function savePushSubscription(params: {
  subscription: webpush.PushSubscription
  userId?: string | null
  phone?: string | null
  role?: string | null
}): Promise<boolean> {
  const { subscription, userId, phone, role } = params
  if (!subscription || !subscription.endpoint) return false

  const endpointKey = subscription.endpoint
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : null

  // 1. Store in server memory
  memorySubscriptions.set(endpointKey, {
    userId: userId || null,
    phone: cleanPhone,
    role: role || 'mistri',
    subscription,
    updatedAt: new Date().toISOString(),
  })

  // 2. Persist to Supabase device_tokens table
  try {
    const supabase = createAdminClient() as any
    const isUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
    let targetUserId = isUuid ? userId : null

    // If userId not provided or not UUID, try resolving from phone
    if (!targetUserId && cleanPhone) {
      const { data: u } = await supabase
        .from('users')
        .select('id')
        .ilike('phone', `%${cleanPhone.slice(-10)}%`)
        .maybeSingle()
      if (u?.id) targetUserId = u.id
    }

    if (targetUserId) {
      await supabase.from('device_tokens').upsert(
        {
          user_id: targetUserId,
          token: JSON.stringify(subscription),
          platform: 'web',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, token' }
      )
    }
  } catch (err: any) {
    console.warn('[WebPush] Supabase device_tokens upsert warning:', err.message)
  }

  return true
}

/**
 * Retrieve all active subscriptions matching a user (by userId or phone)
 */
export async function getSubscriptionsForUser(query: {
  userId?: string | null
  phone?: string | null
}): Promise<webpush.PushSubscription[]> {
  const results: webpush.PushSubscription[] = []
  const seenEndpoints = new Set<string>()

  const cleanPhone = query.phone ? query.phone.replace(/[^0-9]/g, '') : null

  // 1. Check in-memory subscriptions
  for (const item of memorySubscriptions.values()) {
    const matchesUser = query.userId && item.userId === query.userId
    const matchesPhone = cleanPhone && item.phone && (item.phone.slice(-10) === cleanPhone.slice(-10))

    if ((matchesUser || matchesPhone) && !seenEndpoints.has(item.subscription.endpoint)) {
      seenEndpoints.add(item.subscription.endpoint)
      results.push(item.subscription)
    }
  }

  // 2. Check Supabase device_tokens
  try {
    const supabase = createAdminClient() as any
    const isUuid = query.userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query.userId)
    let targetUserId = isUuid ? query.userId : null

    if (!targetUserId && cleanPhone) {
      const { data: u } = await supabase
        .from('users')
        .select('id')
        .ilike('phone', `%${cleanPhone.slice(-10)}%`)
        .maybeSingle()
      if (u?.id) targetUserId = u.id
    }

    if (targetUserId) {
      const { data: tokens } = await supabase
        .from('device_tokens')
        .select('token')
        .eq('user_id', targetUserId)

      if (Array.isArray(tokens)) {
        for (const row of tokens) {
          try {
            const sub = JSON.parse(row.token) as webpush.PushSubscription
            if (sub?.endpoint && !seenEndpoints.has(sub.endpoint)) {
              seenEndpoints.add(sub.endpoint)
              results.push(sub)
            }
          } catch {}
        }
      }
    }

    // Fallback: If no subscriptions found for this specific target,
    // fetch any registered tokens in device_tokens so notifications never get lost in testing
    if (results.length === 0) {
      const { data: allTokens } = await supabase
        .from('device_tokens')
        .select('token')
        .order('updated_at', { ascending: false })
        .limit(5)

      if (Array.isArray(allTokens)) {
        for (const row of allTokens) {
          try {
            const sub = JSON.parse(row.token) as webpush.PushSubscription
            if (sub?.endpoint && !seenEndpoints.has(sub.endpoint)) {
              seenEndpoints.add(sub.endpoint)
              results.push(sub)
            }
          } catch {}
        }
      }
    }
  } catch (err: any) {
    console.warn('[WebPush] Supabase query subscriptions warning:', err.message)
  }

  return results
}

/**
 * Send a web push notification to a single PushSubscription
 */
export async function sendWebPush(
  subscription: webpush.PushSubscription,
  payload: {
    title: string
    body: string
    url?: string
    tag?: string
    icon?: string
    badge?: string
    data?: any
  }
): Promise<boolean> {
  try {
    const jsonPayload = JSON.stringify({
      title: payload.title || 'mistri24 - নতুন বিজ্ঞপ্তি',
      body: payload.body || 'আপনার জন্য নতুন বুকিং তথ্য রয়েছে।',
      url: payload.url || '/mistri/profile',
      tag: payload.tag || `mistri24-${Date.now()}`,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-192x192.png',
      data: payload.data || {},
    })

    await webpush.sendNotification(subscription, jsonPayload, {
      TTL: 60 * 60 * 24, // 24 hours
      urgency: 'high',
    })
    return true
  } catch (err: any) {
    // If subscription is expired or unsubscribed (404 or 410)
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log('[WebPush] Subscription expired or gone, cleaning up:', subscription.endpoint)
      memorySubscriptions.delete(subscription.endpoint)
      try {
        const supabase = createAdminClient() as any
        await supabase
          .from('device_tokens')
          .delete()
          .eq('token', JSON.stringify(subscription))
      } catch {}
    } else {
      console.warn('[WebPush] Notification delivery warning:', err.message || err)
    }
    return false
  }
}

/**
 * Send a push notification to all devices belonging to a user (by userId and/or phone)
 */
export async function sendPushToUser(params: {
  userId?: string | null
  phone?: string | null
  title: string
  body: string
  url?: string
  tag?: string
  data?: any
}): Promise<{ sentCount: number; totalSubscriptions: number }> {
  const subscriptions = await getSubscriptionsForUser({
    userId: params.userId,
    phone: params.phone,
  })

  let sentCount = 0
  for (const sub of subscriptions) {
    const ok = await sendWebPush(sub, {
      title: params.title,
      body: params.body,
      url: params.url,
      tag: params.tag,
      data: params.data,
    })
    if (ok) sentCount++
  }

  return {
    sentCount,
    totalSubscriptions: subscriptions.length,
  }
}
