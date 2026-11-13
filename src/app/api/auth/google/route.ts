import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, avatar, phone } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'ইমেইল অ্যাড্রেস পাওয়া যায়নি।' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : ''
    const supabase = createAdminClient() as any

    // 1. Check if user already exists by this exact Gmail
    let { data: existingUser } = await supabase
      .from('users')
      .select('id, email, phone, role, avatar_url')
      .eq('email', cleanEmail)
      .maybeSingle()

    // 2. If not found by email, check if user exists by phone (if provided)
    if (!existingUser && cleanPhone && cleanPhone.length >= 10) {
      const { data: userByPhone } = await supabase
        .from('users')
        .select('id, email, phone, role, avatar_url')
        .ilike('phone', `%${cleanPhone.slice(-10)}%`)
        .maybeSingle()

      if (userByPhone) {
        existingUser = userByPhone
        // Link email to this user so they can sign in with Gmail in the future
        await supabase
          .from('users')
          .update({ email: cleanEmail, updated_at: new Date().toISOString() })
          .eq('id', userByPhone.id)
      }
    }

    // 3. User Exists: Handle Returning Sign-In
    if (existingUser) {
      // Update avatar if not yet set
      if (avatar && !existingUser.avatar_url) {
        await supabase
          .from('users')
          .update({ avatar_url: avatar })
          .eq('id', existingUser.id)
      }

      // A) Mistri Role: Once a Mistri, always a Mistri (never treated as customer)
      if (existingUser.role === 'mistri') {
        const { data: mProf } = await supabase
          .from('mistri_profiles')
          .select('id, full_name, approval_status, professional_title')
          .eq('user_id', existingUser.id)
          .maybeSingle()

        const displayName = mProf?.full_name || name || 'মিস্ত্রী কারিগর'
        const isApproved = mProf?.approval_status === 'approved'
        const redirectUrl = isApproved ? '/mistri/profile' : '/onboarding/status'

        return NextResponse.json({
          success: true,
          isNew: false,
          role: 'mistri',
          redirectUrl,
          user: {
            id: mProf?.id || existingUser.id,
            userId: existingUser.id,
            name: displayName,
            email: cleanEmail,
            phone: existingUser.phone || '',
            role: 'mistri',
            avatar: avatar || existingUser.avatar_url || '',
            status: mProf?.approval_status || 'pending',
          },
        })
      }

      // B) Admin Role
      if (existingUser.role === 'admin') {
        return NextResponse.json({
          success: true,
          isNew: false,
          role: 'admin',
          redirectUrl: '/admin/dashboard',
          user: {
            id: existingUser.id,
            userId: existingUser.id,
            name: name || 'Admin',
            email: cleanEmail,
            phone: existingUser.phone || '',
            role: 'admin',
            avatar: avatar || existingUser.avatar_url || '',
          },
        })
      }

      // C) Customer Role: Check if this customer has a pending mistri application
      const { data: cProf } = await supabase
        .from('customer_profiles')
        .select('id, full_name, default_address')
        .eq('user_id', existingUser.id)
        .maybeSingle()

      // Also check if customer applied to be a mistri
      const { data: mApp } = await supabase
        .from('mistri_profiles')
        .select('id, approval_status')
        .eq('user_id', existingUser.id)
        .maybeSingle()

      return NextResponse.json({
        success: true,
        isNew: false,
        role: 'customer',
        redirectUrl: '/',
        user: {
          id: existingUser.id,
          userId: existingUser.id,
          name: cProf?.full_name || name || 'সম্মানিত গ্রাহক',
          email: cleanEmail,
          phone: existingUser.phone?.startsWith('010') ? '' : (existingUser.phone || ''),
          role: 'customer',
          avatar: avatar || existingUser.avatar_url || '',
          mistriApplicationStatus: mApp?.approval_status || null,
        },
      })
    }

    // 4. User does NOT exist: Handle New Registration
    // STRICT RULE: All new Gmail signups are designated as 'customer'
    const assignedRole = 'customer'

    // Resolve or create auth user id directly from auth.users (foreign key requirement)
    let userId: string | null = null

    try {
      const { data: userList } = await supabase.auth.admin.listUsers()
      const existingAuth = userList?.users?.find((u: any) => u.email?.toLowerCase() === cleanEmail)
      if (existingAuth?.id) {
        userId = existingAuth.id
      }
    } catch {}

    if (!userId) {
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        email_confirm: true,
        user_metadata: {
          full_name: name || 'সম্মানিত গ্রাহক',
          role: assignedRole,
          avatar_url: avatar,
        },
      })
      if (authUser?.user?.id) {
        userId = authUser.user.id
      } else if (authErr) {
        try {
          const { data: userList2 } = await supabase.auth.admin.listUsers()
          const matched = userList2?.users?.find((u: any) => u.email?.toLowerCase() === cleanEmail)
          if (matched?.id) {
            userId = matched.id
          }
        } catch {}
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ইউজার অ্যাকাউন্ট তৈরি করা যায়নি।' },
        { status: 500 }
      )
    }

    // Generate unique phone placeholder if phone is not provided
    const userPhone = (cleanPhone && cleanPhone.length >= 10)
      ? cleanPhone
      : `010${Math.floor(10000000 + Math.random() * 90000000)}`

    // Check if real phone is already used by someone else
    if (cleanPhone && cleanPhone.length >= 10) {
      const { data: dupPhone } = await supabase
        .from('users')
        .select('id, email')
        .eq('phone', cleanPhone)
        .neq('id', userId)
        .maybeSingle()

      if (dupPhone) {
        return NextResponse.json(
          { success: false, error: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে অন্য একটি অ্যাকাউন্ট রয়েছে।' },
          { status: 400 }
        )
      }
    }

    const { data: newUser, error: createErr } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: cleanEmail,
        phone: userPhone,
        role: assignedRole,
        avatar_url: avatar || null,
        preferred_language: 'bn',
      }, { onConflict: 'id' })
      .select('id, email, role, phone')
      .single()

    if (createErr || !newUser) {
      console.error('Failed to create user with Google auth:', createErr)
      return NextResponse.json(
        { success: false, error: 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে: ' + (createErr?.message || '') },
        { status: 500 }
      )
    }

    // Create customer profile
    await supabase.from('customer_profiles').upsert({
      user_id: newUser.id,
      full_name: name || 'সম্মানিত গ্রাহক',
    }, { onConflict: 'user_id' })

    return NextResponse.json({
      success: true,
      isNew: true,
      role: 'customer',
      redirectUrl: '/',
      user: {
        id: newUser.id,
        userId: newUser.id,
        name: name || 'সম্মানিত গ্রাহক',
        email: cleanEmail,
        phone: userPhone.startsWith('010') ? '' : userPhone,
        role: 'customer',
        avatar: avatar || '',
      },
    })
  } catch (err: any) {
    console.error('API Google Auth Error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'সার্ভার এরর হয়েছে।' },
      { status: 500 }
    )
  }
}
