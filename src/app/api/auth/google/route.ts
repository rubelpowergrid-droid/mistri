import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, avatar, role, phone } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'ইমেইল অ্যাড্রেস পাওয়া যায়নি।' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : ''
    const supabase = createAdminClient() as any

    // 1. Check if user already exists by email
    let { data: existingUser } = await supabase
      .from('users')
      .select('id, email, phone, role, avatar_url')
      .eq('email', cleanEmail)
      .maybeSingle()

    // 2. If not found by email, check if user exists by phone
    if (!existingUser && cleanPhone && cleanPhone.length >= 10) {
      const { data: userByPhone } = await supabase
        .from('users')
        .select('id, email, phone, role, avatar_url')
        .ilike('phone', `%${cleanPhone.slice(-10)}%`)
        .maybeSingle()

      if (userByPhone) {
        existingUser = userByPhone
        // Link email to this user
        await supabase
          .from('users')
          .update({ email: cleanEmail, updated_at: new Date().toISOString() })
          .eq('id', userByPhone.id)
      }
    }

    // 3. User Exists: Handle Login
    if (existingUser) {
      // Update avatar if provided and not yet set
      if (avatar && !existingUser.avatar_url) {
        await supabase
          .from('users')
          .update({ avatar_url: avatar })
          .eq('id', existingUser.id)
      }

      // Check role specific details
      if (existingUser.role === 'mistri') {
        const { data: mProf } = await supabase
          .from('mistri_profiles')
          .select('id, full_name, approval_status, professional_title')
          .eq('user_id', existingUser.id)
          .maybeSingle()

        const displayName = mProf?.full_name || name || 'মিস্ত্রী কারিগর'
        const redirectUrl = mProf?.approval_status === 'approved' 
          ? '/mistri/profile' 
          : mProf ? '/onboarding/status' : '/onboarding'

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
            status: mProf?.approval_status || 'approved',
          },
        })
      }

      if (existingUser.role === 'admin') {
        return NextResponse.json({
          success: true,
          isNew: false,
          role: 'admin',
          redirectUrl: '/admin/dashboard',
          user: {
            id: existingUser.id,
            name: name || 'Admin',
            email: cleanEmail,
            phone: existingUser.phone || '',
            role: 'admin',
            avatar: avatar || existingUser.avatar_url || '',
          },
        })
      }

      // Customer Role Login
      const { data: cProf } = await supabase
        .from('customer_profiles')
        .select('id, full_name, default_address')
        .eq('user_id', existingUser.id)
        .maybeSingle()

      return NextResponse.json({
        success: true,
        isNew: false,
        role: 'customer',
        redirectUrl: '/',
        user: {
          id: existingUser.id,
          name: cProf?.full_name || name || 'সম্মানিত গ্রাহক',
          email: cleanEmail,
          phone: existingUser.phone || '',
          role: 'customer',
          avatar: avatar || existingUser.avatar_url || '',
        },
      })
    }

    // 4. User does NOT exist: Handle Registration with Google
    const assignedRole = role === 'mistri' ? 'mistri' : 'customer'

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
          full_name: name,
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
        { success: false, error: 'ইউজার অথেনটিকেশন আইডি তৈরি করা যায়নি।' },
        { status: 500 }
      )
    }

    // Ensure phone is never null to satisfy NOT NULL & UNIQUE constraints
    const userPhone = (cleanPhone && cleanPhone.length >= 10)
      ? cleanPhone
      : `010${Math.floor(10000000 + Math.random() * 90000000)}`

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

    if (assignedRole === 'mistri') {
      return NextResponse.json({
        success: true,
        isNew: true,
        role: 'mistri',
        redirectUrl: '/onboarding',
        user: {
          id: newUser.id,
          userId: newUser.id,
          name: name || 'মিস্ত্রী কারিগর',
          email: cleanEmail,
          phone: userPhone.startsWith('010') ? '' : userPhone,
          role: 'mistri',
          avatar: avatar || '',
          status: 'pending',
        },
      })
    }

    // Customer profile creation
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

