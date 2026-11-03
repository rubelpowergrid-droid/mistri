import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: true, message: 'Token recorded in anonymous preview' })
    }

    const body = await request.json()
    const { token, platform = 'web' } = body

    if (!token) {
      return NextResponse.json({ error: 'Device token is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('device_tokens')
      .upsert(
        {
          user_id: user.id,
          token,
          platform,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, token' }
      )

    if (error) {
      console.error('Error saving device token:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Device token registered successfully' })
  } catch (err: any) {
    console.error('Unexpected error in POST /api/notifications/device-token:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
