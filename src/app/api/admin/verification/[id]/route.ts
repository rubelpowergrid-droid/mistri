import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApplicantsStore, updateApplicantStatus } from '@/lib/mistri-store'
import { updateMistriStatusInSupabase, resolveCategoryFromTitle } from '@/lib/supabase-service'
import { createAdminClient } from '@/lib/supabase/admin'

const verificationActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'request_correction']),
  internalNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const store = getApplicantsStore()
    let applicant = store.find((a) => a.id === id)

    if (!applicant) {
      // Query from Supabase
      try {
        const supabase = createAdminClient() as any
        const { data: profile } = await supabase
          .from('mistri_profiles')
          .select('*, users(phone, avatar_url), districts(name_bn, name_en), upazilas(name_bn, name_en), mistri_documents(nid_number, nid_front_storage_path, nid_back_storage_path)')
          .eq('id', id)
          .maybeSingle()

        if (profile) {
          let authMeta: any = null
          if (profile.user_id) {
            try {
              const authUserRes = await supabase.auth.admin.getUserById(profile.user_id)
              authMeta = authUserRes?.data?.user?.user_metadata
            } catch (e) {}
          }

          const doc = Array.isArray(profile.mistri_documents) ? profile.mistri_documents[0] : profile.mistri_documents

          const catInfo = resolveCategoryFromTitle(profile.professional_title || '', authMeta?.category_slug)
          const resolvedCategory = authMeta?.category_slug ? catInfo.category_name_bn : (authMeta?.category || catInfo.category_name_bn || profile.professional_title || 'দক্ষ কারিগর')

          applicant = {
            id: profile.id,
            name: profile.full_name || authMeta?.full_name || '',
            fatherName: authMeta?.father_name || '',
            phone: profile.users?.phone || authMeta?.phone || '',
            nidNumber: doc?.nid_number || authMeta?.nid_number || '',
            dateOfBirth: profile.date_of_birth || authMeta?.date_of_birth || '',
            gender: profile.gender || authMeta?.gender || 'পুরুষ (Male)',
            district: profile.districts?.name_bn || authMeta?.district || 'ঠাকুরগাঁও',
            upazila: profile.upazilas?.name_bn || authMeta?.upazila || 'ঠাকুরগাঁও সদর',
            area: authMeta?.area || '',
            streetAddress: profile.street_address || authMeta?.street_address || '',
            serviceRadiusKm: profile.max_service_distance_km || authMeta?.service_radius_km || 15,
            category: resolvedCategory,
            categorySlug: catInfo.category_slug,
            subcategories: Array.isArray(authMeta?.subcategories) && authMeta.subcategories.length > 0 ? authMeta.subcategories : catInfo.subcategories,
            experienceYears: profile.experience_years || authMeta?.experience_years || 5,
            chargeType: profile.charge_type || authMeta?.charge_type || 'আলোচনা সাপেক্ষে (Negotiable)',
            baseCharge: profile.base_charge || authMeta?.base_charge || 400,
            bio: profile.bio || authMeta?.bio || '',
            avatar: profile.users?.avatar_url || authMeta?.avatar_url || '',
            nidFrontUrl: doc?.nid_front_storage_path || authMeta?.nid_front_url || '',
            nidBackUrl: doc?.nid_back_storage_path || authMeta?.nid_back_url || '',
            submittedAt: new Date(profile.created_at || Date.now()).toLocaleDateString('bn-BD', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            status: profile.approval_status || 'pending',
          }
        }
      } catch (err) {
        console.warn('Supabase applicant lookup warning:', err)
      }
    }

    if (!applicant) {
      return NextResponse.json({ success: false, error: 'Applicant not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, applicant })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = verificationActionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid verification payload', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { action, internalNotes, rejectionReason } = parsed.data
    const result = updateApplicantStatus(id, action)

    // Also persist status update to Supabase
    try {
      const identifier = result?.applicant?.phone || id
      await updateMistriStatusInSupabase(identifier, action === 'approve' ? 'approved' : 'rejected')
    } catch (dbErr) {
      console.warn('Supabase status update error:', dbErr)
    }

    return NextResponse.json({
      success: true,
      mistriId: id,
      actionApplied: action,
      status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'under_review',
      message: action === 'approve' 
        ? 'Mistri account verified and approved successfully. Now live for public search.'
        : 'Mistri verification updated.',
      applicant: result.applicant,
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: err.message },
      { status: 500 }
    )
  }
}
