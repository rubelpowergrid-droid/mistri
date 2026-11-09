import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApplicantsStore, updateApplicantStatus } from '@/lib/mistri-store'
import { updateMistriStatusInSupabase } from '@/lib/supabase-service'
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
          .select('*, users(phone), districts(name_bn, name_en), upazilas(name_bn, name_en)')
          .eq('id', id)
          .maybeSingle()

        if (profile) {
          applicant = {
            id: profile.id,
            name: profile.full_name,
            fatherName: (profile.users as any)?.user_metadata?.father_name || '',
            phone: profile.users?.phone || '017XXXXXXXX',
            nidNumber: '1990521934000123',
            dateOfBirth: profile.date_of_birth || '১৯৯০-০৫-১৫',
            gender: profile.gender || 'পুরুষ',
            district: profile.districts?.name_bn || 'ঠাকুরগাঁও',
            upazila: profile.upazilas?.name_bn || 'ঠাকুরগাঁও সদর',
            area: 'ঠাকুরগাঁও সদর',
            streetAddress: profile.street_address || 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর',
            serviceRadiusKm: profile.max_service_distance_km || 15,
            category: profile.professional_title || 'ইলেকট্রিক্যাল কাজ',
            categorySlug: 'electrical-services',
            subcategories: ['বাসা-বাড়ির ওয়্যারিং', 'ফ্যান ও লাইটিং ফিটিং', 'সুইচ ও সকেট মেরামত'],
            experienceYears: profile.experience_years || 5,
            chargeType: profile.charge_type || 'আলোচনা সাপেক্ষে (Negotiable)',
            baseCharge: profile.base_charge || 400,
            bio: profile.bio || 'দক্ষ কারিগর। সততার সাথে কাজ করি।',
            avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
            nidFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
            nidBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
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
