-- ====================================================================
-- MISTRI Database Migration: Initial Schema
-- Migration: 20261103000001_initial_schema.sql
-- ====================================================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Custom Types & Enums
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('customer', 'mistri', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE mistri_status_enum AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'suspended', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status_enum AS ENUM ('pending', 'accepted', 'rejected', 'scheduled', 'in_progress', 'completed', 'cancelled', 'disputed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admin_role_enum AS ENUM ('super_admin', 'verification_admin', 'booking_manager', 'support_admin', 'report_viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_status_enum AS ENUM ('open', 'under_investigation', 'resolved', 'dismissed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type_enum AS ENUM ('booking', 'verification', 'system', 'reminder', 'dispute');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Core Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NULL,
    role user_role_enum NOT NULL DEFAULT 'customer',
    preferred_language VARCHAR(5) NOT NULL DEFAULT 'bn',
    avatar_url TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 3. Geographic Hierarchy
CREATE TABLE IF NOT EXISTS public.districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_bn VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.upazilas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE RESTRICT,
    name_bn VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_upazilas_district_id ON public.upazilas(district_id);

CREATE TABLE IF NOT EXISTS public.areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upazila_id UUID NOT NULL REFERENCES public.upazilas(id) ON DELETE RESTRICT,
    name_bn VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_areas_upazila_id ON public.areas(upazila_id);

-- 4. Categories & Subcategories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_bn VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    icon_url TEXT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name_bn VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    icon_url TEXT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories(category_id);

-- 5. Customer Profiles
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    district_id UUID NULL REFERENCES public.districts(id) ON DELETE SET NULL,
    upazila_id UUID NULL REFERENCES public.upazilas(id) ON DELETE SET NULL,
    area_id UUID NULL REFERENCES public.areas(id) ON DELETE SET NULL,
    default_address TEXT NULL,
    default_location_point GEOGRAPHY(Point, 4326) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON public.customer_profiles(user_id);

-- 6. Mistri Profiles
CREATE TABLE IF NOT EXISTS public.mistri_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    professional_title VARCHAR(200) NOT NULL,
    bio TEXT NULL,
    date_of_birth DATE NULL,
    gender VARCHAR(20) NULL,
    district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE RESTRICT,
    upazila_id UUID NOT NULL REFERENCES public.upazilas(id) ON DELETE RESTRICT,
    area_id UUID NULL REFERENCES public.areas(id) ON DELETE SET NULL,
    street_address TEXT NULL,
    location_point GEOGRAPHY(Point, 4326) NOT NULL,
    max_service_distance_km INT NOT NULL DEFAULT 15,
    experience_years INT NOT NULL DEFAULT 1,
    approval_status mistri_status_enum NOT NULL DEFAULT 'pending',
    is_available BOOLEAN NOT NULL DEFAULT true,
    charge_type VARCHAR(50) NOT NULL DEFAULT 'negotiable',
    base_charge NUMERIC(10,2) NULL,
    average_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    total_reviews INT NOT NULL DEFAULT 0,
    total_completed_jobs INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS idx_mistri_profiles_status ON public.mistri_profiles(approval_status);

-- 7. Mistri Identity & Documents (Private)
CREATE TABLE IF NOT EXISTS public.mistri_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mistri_profile_id UUID NOT NULL UNIQUE REFERENCES public.mistri_profiles(id) ON DELETE CASCADE,
    nid_number VARCHAR(50) NOT NULL,
    nid_front_storage_path TEXT NOT NULL,
    nid_back_storage_path TEXT NOT NULL,
    verification_notes TEXT NULL,
    reviewed_by UUID NULL,
    reviewed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Mistri Services Mapping
CREATE TABLE IF NOT EXISTS public.mistri_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mistri_profile_id UUID NOT NULL REFERENCES public.mistri_profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    subcategory_id UUID NOT NULL REFERENCES public.subcategories(id) ON DELETE CASCADE,
    custom_charge NUMERIC(10,2) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(mistri_profile_id, subcategory_id)
);
CREATE INDEX IF NOT EXISTS idx_mistri_services_subcategory ON public.mistri_services(subcategory_id);

-- 9. Mistri Work Portfolio
CREATE TABLE IF NOT EXISTS public.mistri_portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mistri_profile_id UUID NOT NULL REFERENCES public.mistri_profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    title VARCHAR(150) NULL,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(30) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.customer_profiles(id) ON DELETE RESTRICT,
    mistri_id UUID NOT NULL REFERENCES public.mistri_profiles(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    subcategory_id UUID NOT NULL REFERENCES public.subcategories(id) ON DELETE RESTRICT,
    status booking_status_enum NOT NULL DEFAULT 'pending',
    work_description TEXT NOT NULL,
    job_address TEXT NOT NULL,
    job_location_point GEOGRAPHY(Point, 4326) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time VARCHAR(50) NOT NULL,
    estimated_budget NUMERIC(10,2) NULL,
    agreed_price NUMERIC(10,2) NULL,
    work_photos TEXT[] NULL,
    cancellation_reason TEXT NULL,
    cancelled_by UUID NULL,
    accepted_at TIMESTAMPTZ NULL,
    started_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_mistri_id ON public.bookings(mistri_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- 11. Booking Status Logs
CREATE TABLE IF NOT EXISTS public.booking_status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    previous_status booking_status_enum NULL,
    new_status booking_status_enum NOT NULL,
    changed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_status_logs_booking_id ON public.booking_status_logs(booking_id);

-- 12. Location Shares (Live Tracking)
CREATE TABLE IF NOT EXISTS public.location_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
    mistri_id UUID NOT NULL REFERENCES public.mistri_profiles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT false,
    last_latitude NUMERIC(10,7) NULL,
    last_longitude NUMERIC(10,7) NULL,
    last_heading NUMERIC(5,2) NULL,
    last_speed NUMERIC(5,2) NULL,
    last_ping_at TIMESTAMPTZ NULL,
    authorized_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    terminated_at TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS idx_location_shares_active ON public.location_shares(is_active) WHERE is_active = true;

-- 13. Reviews & Ratings
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.customer_profiles(id) ON DELETE RESTRICT,
    mistri_id UUID NOT NULL REFERENCES public.mistri_profiles(id) ON DELETE RESTRICT,
    rating_work_quality INT NOT NULL CHECK (rating_work_quality BETWEEN 1 AND 5),
    rating_behaviour INT NOT NULL CHECK (rating_behaviour BETWEEN 1 AND 5),
    rating_punctuality INT NOT NULL CHECK (rating_punctuality BETWEEN 1 AND 5),
    rating_pricing INT NOT NULL CHECK (rating_pricing BETWEEN 1 AND 5),
    rating_overall NUMERIC(3,2) NOT NULL CHECK (rating_overall BETWEEN 1.0 AND 5.0),
    comment TEXT NOT NULL,
    photos TEXT[] NULL,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    moderation_flagged BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_mistri_id ON public.reviews(mistri_id);

-- 14. Customer Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    mistri_id UUID NOT NULL REFERENCES public.mistri_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, mistri_id)
);

-- 15. Notifications & Devices
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    type notification_type_enum NOT NULL DEFAULT 'booking',
    reference_id UUID NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS public.device_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- 16. Complaints & Disputes
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    complainant_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    accused_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status complaint_status_enum NOT NULL DEFAULT 'open',
    resolution_notes TEXT NULL,
    resolved_by UUID NULL,
    resolved_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Admin System
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    role admin_role_enum NOT NULL DEFAULT 'support_admin',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE RESTRICT,
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(50) NOT NULL,
    target_id UUID NULL,
    details JSONB NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_activity_logs(created_at DESC);

-- ====================================================================
-- MISTRI Database Migration: PostGIS Spatial Indexes & Functions
-- Migration: 20261103000002_postgis_and_spatial_indexes.sql
-- ====================================================================

-- 1. Spatial GIST Indexes
CREATE INDEX IF NOT EXISTS idx_mistri_profiles_location_gist 
ON public.mistri_profiles USING GIST (location_point);

CREATE INDEX IF NOT EXISTS idx_bookings_job_location_gist 
ON public.bookings USING GIST (job_location_point);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_location_gist 
ON public.customer_profiles USING GIST (default_location_point);

-- 2. High-Performance Nearby Mistri Discovery Function
CREATE OR REPLACE FUNCTION public.search_nearby_mistris(
    customer_lat DOUBLE PRECISION,
    customer_lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 25.0,
    category_id_filter UUID DEFAULT NULL,
    subcategory_id_filter UUID DEFAULT NULL,
    min_rating NUMERIC DEFAULT 0.0,
    min_experience_years INT DEFAULT 0,
    result_limit INT DEFAULT 50,
    result_offset INT DEFAULT 0
)
RETURNS TABLE (
    mistri_id UUID,
    full_name VARCHAR(150),
    professional_title VARCHAR(200),
    avatar_url TEXT,
    district_id UUID,
    upazila_id UUID,
    experience_years INT,
    average_rating NUMERIC(3,2),
    total_reviews INT,
    total_completed_jobs INT,
    charge_type VARCHAR(50),
    base_charge NUMERIC(10,2),
    is_available BOOLEAN,
    distance_meters DOUBLE PRECISION,
    distance_km NUMERIC(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    customer_point GEOGRAPHY;
BEGIN
    customer_point := ST_SetSRID(ST_MakePoint(customer_lng, customer_lat), 4326)::geography;

    RETURN QUERY
    SELECT 
        m.id AS mistri_id,
        m.full_name,
        m.professional_title,
        u.avatar_url,
        m.district_id,
        m.upazila_id,
        m.experience_years,
        m.average_rating,
        m.total_reviews,
        m.total_completed_jobs,
        m.charge_type,
        m.base_charge,
        m.is_available,
        ST_Distance(m.location_point, customer_point) AS distance_meters,
        ROUND((ST_Distance(m.location_point, customer_point) / 1000.0)::numeric, 2) AS distance_km
    FROM public.mistri_profiles m
    INNER JOIN public.users u ON u.id = m.user_id
    WHERE m.approval_status = 'approved'
      AND m.deleted_at IS NULL
      AND u.is_active = true
      AND ST_DWithin(m.location_point, customer_point, (radius_km * 1000.0))
      AND m.average_rating >= min_rating
      AND m.experience_years >= min_experience_years
      AND (
          category_id_filter IS NULL 
          OR EXISTS (
              SELECT 1 FROM public.mistri_services ms 
              WHERE ms.mistri_profile_id = m.id AND ms.category_id = category_id_filter
          )
      )
      AND (
          subcategory_id_filter IS NULL 
          OR EXISTS (
              SELECT 1 FROM public.mistri_services ms 
              WHERE ms.mistri_profile_id = m.id AND ms.subcategory_id = subcategory_id_filter
          )
      )
    ORDER BY distance_meters ASC
    LIMIT result_limit OFFSET result_offset;
END;
$$;

-- ====================================================================
-- MISTRI Database Migration: Row Level Security (RLS) Policies
-- Migration: 20261103000003_rls_security_policies.sql
-- ====================================================================

-- 1. Helper Security Functions
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role_enum
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users au
        WHERE au.user_id = auth.uid() AND au.is_active = true
    );
$$;

-- 2. Enable RLS on All Tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upazilas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistri_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistri_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistri_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistri_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- 3. Public Taxonomy Policies (Districts, Upazilas, Areas, Categories, Subcategories)
CREATE POLICY "Public can view active districts" 
ON public.districts FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full access to districts" 
ON public.districts FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view active upazilas" 
ON public.upazilas FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full access to upazilas" 
ON public.upazilas FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view active areas" 
ON public.areas FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full access to areas" 
ON public.areas FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view active categories" 
ON public.categories FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full access to categories" 
ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view active subcategories" 
ON public.subcategories FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full access to subcategories" 
ON public.subcategories FOR ALL USING (public.is_admin());

-- 4. Users Table Policies
CREATE POLICY "Users can view own record" 
ON public.users FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own non-role record" 
ON public.users FOR UPDATE USING (id = auth.uid()) 
WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Admins have full access to users" 
ON public.users FOR ALL USING (public.is_admin());

-- 5. Customer Profiles Policies
CREATE POLICY "Customers can view and update own profile" 
ON public.customer_profiles FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Mistris can view counterpart customer in active booking"
ON public.customer_profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.bookings b
        INNER JOIN public.mistri_profiles mp ON mp.id = b.mistri_id
        WHERE b.customer_id = public.customer_profiles.id 
          AND mp.user_id = auth.uid()
          AND b.status IN ('accepted', 'scheduled', 'in_progress')
    )
);

CREATE POLICY "Admins have full access to customer profiles" 
ON public.customer_profiles FOR ALL USING (public.is_admin());

-- 6. Mistri Profiles Policies
CREATE POLICY "Public can view approved Mistri profiles" 
ON public.mistri_profiles FOR SELECT USING (
    approval_status = 'approved' AND deleted_at IS NULL
);

CREATE POLICY "Mistris can view and update own profile" 
ON public.mistri_profiles FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins have full access to mistri profiles" 
ON public.mistri_profiles FOR ALL USING (public.is_admin());

-- 7. Mistri Documents (NID) Security Policies (STRICT PRIVACY)
CREATE POLICY "Mistris can view and submit own documents" 
ON public.mistri_documents FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.mistri_profiles mp 
        WHERE mp.id = public.mistri_documents.mistri_profile_id 
          AND mp.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can view and review all mistri documents" 
ON public.mistri_documents FOR ALL USING (public.is_admin());

-- 8. Mistri Services & Portfolio
CREATE POLICY "Public can view mistri services" 
ON public.mistri_services FOR SELECT USING (true);

CREATE POLICY "Mistri can manage own services" 
ON public.mistri_services FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.mistri_profiles mp 
        WHERE mp.id = public.mistri_services.mistri_profile_id 
          AND mp.user_id = auth.uid()
    )
);

CREATE POLICY "Public can view mistri portfolio" 
ON public.mistri_portfolio FOR SELECT USING (true);

CREATE POLICY "Mistri can manage own portfolio" 
ON public.mistri_portfolio FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.mistri_profiles mp 
        WHERE mp.id = public.mistri_portfolio.mistri_profile_id 
          AND mp.user_id = auth.uid()
    )
);

-- 9. Bookings Policies
CREATE POLICY "Customers can manage own bookings" 
ON public.bookings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.customer_profiles cp 
        WHERE cp.id = public.bookings.customer_id 
          AND cp.user_id = auth.uid()
    )
);

CREATE POLICY "Mistris can view and update assigned bookings" 
ON public.bookings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.mistri_profiles mp 
        WHERE mp.id = public.bookings.mistri_id 
          AND mp.user_id = auth.uid()
    )
);

CREATE POLICY "Admins have full access to bookings" 
ON public.bookings FOR ALL USING (public.is_admin());

-- 10. Reviews Policies
CREATE POLICY "Public can view visible reviews" 
ON public.reviews FOR SELECT USING (is_visible = true OR public.is_admin());

CREATE POLICY "Customer can submit review for own completed booking" 
ON public.reviews FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.bookings b
        INNER JOIN public.customer_profiles cp ON cp.id = b.customer_id
        WHERE b.id = public.reviews.booking_id
          AND cp.user_id = auth.uid()
          AND b.status = 'completed'
    )
);

CREATE POLICY "Admins have full access to reviews" 
ON public.reviews FOR ALL USING (public.is_admin());

-- 11. Location Shares (Live Tracking Security)
CREATE POLICY "Participants can view active location share" 
ON public.location_shares FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.customer_profiles cp 
        WHERE cp.id = public.location_shares.customer_id AND cp.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.mistri_profiles mp 
        WHERE mp.id = public.location_shares.mistri_id AND mp.user_id = auth.uid()
    )
    OR public.is_admin()
);

CREATE POLICY "Mistri can update active location coordinates" 
ON public.location_shares FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.mistri_profiles mp 
        WHERE mp.id = public.location_shares.mistri_id AND mp.user_id = auth.uid()
    )
);

-- 12. Favorites & Notifications
CREATE POLICY "Customers can manage own favorites" 
ON public.favorites FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.customer_profiles cp 
        WHERE cp.id = public.favorites.customer_id AND cp.user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage own notifications" 
ON public.notifications FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own device tokens" 
ON public.device_tokens FOR ALL USING (user_id = auth.uid());

-- 13. Admin Activity Logs
CREATE POLICY "Admins can view and insert activity logs" 
ON public.admin_activity_logs FOR ALL USING (public.is_admin());

-- ====================================================================
-- MISTRI Database Migration: Triggers, Functions & Automation
-- Migration: 20261103000004_triggers_and_functions.sql
-- ====================================================================

-- 1. Automatic Booking Number Generator
CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
        NEW.booking_number := 'MST-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 5));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_booking_number ON public.bookings;
CREATE TRIGGER trigger_generate_booking_number
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.generate_booking_number();

-- 2. Automatic Booking Status Change Logging
CREATE OR REPLACE FUNCTION public.log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.booking_status_logs (
            booking_id,
            previous_status,
            new_status,
            changed_by,
            notes
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            COALESCE(auth.uid(), (SELECT user_id FROM public.customer_profiles WHERE id = NEW.customer_id)),
            'Status transitioned to ' || NEW.status::TEXT
        );

        -- If completed or cancelled, automatically terminate any active location share session
        IF NEW.status IN ('completed', 'cancelled', 'rejected') THEN
            UPDATE public.location_shares
            SET is_active = false, terminated_at = NOW()
            WHERE booking_id = NEW.id AND is_active = true;
        END IF;

        -- If completed, increment Mistri total completed jobs counter
        IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
            UPDATE public.mistri_profiles
            SET total_completed_jobs = total_completed_jobs + 1
            WHERE id = NEW.mistri_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_booking_status ON public.bookings;
CREATE TRIGGER trigger_log_booking_status
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.log_booking_status_change();

-- 3. Automatic Review & Rating Recalculation
CREATE OR REPLACE FUNCTION public.recalculate_mistri_ratings()
RETURNS TRIGGER AS $$
DECLARE
    target_mistri_id UUID;
    v_avg NUMERIC(3,2);
    v_count INT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_mistri_id := OLD.mistri_id;
    ELSE
        target_mistri_id := NEW.mistri_id;
    END IF;

    SELECT 
        COALESCE(ROUND(AVG(rating_overall)::numeric, 2), 0.00),
        COUNT(id)
    INTO v_avg, v_count
    FROM public.reviews
    WHERE mistri_id = target_mistri_id AND is_visible = true;

    UPDATE public.mistri_profiles
    SET average_rating = v_avg,
        total_reviews = v_count
    WHERE id = target_mistri_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_recalculate_ratings ON public.reviews;
CREATE TRIGGER trigger_recalculate_ratings
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_mistri_ratings();

-- ====================================================================
-- MISTRI Database Seed Data
-- Initial Locations (Thakurgaon, Panchagarh, Dinajpur) & 12 Categories
-- ====================================================================

-- 1. Districts
INSERT INTO public.districts (id, name_bn, name_en, is_active) VALUES
('11111111-1111-1111-1111-111111111101', 'ঠাকুরগাঁও', 'Thakurgaon', true),
('11111111-1111-1111-1111-111111111102', 'পঞ্চগড়', 'Panchagarh', true),
('11111111-1111-1111-1111-111111111103', 'দিনাজপুর', 'Dinajpur', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Upazilas for Thakurgaon
INSERT INTO public.upazilas (district_id, name_bn, name_en) VALUES
('11111111-1111-1111-1111-111111111101', 'ঠাকুরগাঁও সদর', 'Thakurgaon Sadar'),
('11111111-1111-1111-1111-111111111101', 'পীরগঞ্জ', 'Pirganj'),
('11111111-1111-1111-1111-111111111101', 'রাণীশংকৈল', 'Ranisankail'),
('11111111-1111-1111-1111-111111111101', 'হরিপুর', 'Haripur'),
('11111111-1111-1111-1111-111111111101', 'বালিয়াডাঙ্গী', 'Baliadangi');

-- 3. Upazilas for Panchagarh
INSERT INTO public.upazilas (district_id, name_bn, name_en) VALUES
('11111111-1111-1111-1111-111111111102', 'পঞ্চগড় সদর', 'Panchagarh Sadar'),
('11111111-1111-1111-1111-111111111102', 'বোদা', 'Boda'),
('11111111-1111-1111-1111-111111111102', 'দেবীগঞ্জ', 'Debiganj'),
('11111111-1111-1111-1111-111111111102', 'আটোয়ারী', 'Atwari'),
('11111111-1111-1111-1111-111111111102', 'তেঁতুলিয়া', 'Tetulia');

-- 4. Upazilas for Dinajpur
INSERT INTO public.upazilas (district_id, name_bn, name_en) VALUES
('11111111-1111-1111-1111-111111111103', 'দিনাজপুর সদর', 'Dinajpur Sadar'),
('11111111-1111-1111-1111-111111111103', 'বীরগঞ্জ', 'Birganj'),
('11111111-1111-1111-1111-111111111103', 'কাহারোল', 'Kaharole'),
('11111111-1111-1111-1111-111111111103', 'বোচাগঞ্জ', 'Bochaganj'),
('11111111-1111-1111-1111-111111111103', 'বিরল', 'Birol'),
('11111111-1111-1111-1111-111111111103', 'চিরিরবন্দর', 'Chirirbandar'),
('11111111-1111-1111-1111-111111111103', 'পার্বতীপুর', 'Parbatipur'),
('11111111-1111-1111-1111-111111111103', 'ফুলবাড়ী', 'Fulbari'),
('11111111-1111-1111-1111-111111111103', 'নবাবগঞ্জ', 'Nawabganj'),
('11111111-1111-1111-1111-111111111103', 'বিরামপুর', 'Birampur'),
('11111111-1111-1111-1111-111111111103', 'হাকিমপুর', 'Hakimpur'),
('11111111-1111-1111-1111-111111111103', 'ঘোড়াঘাট', 'Ghoraghat'),
('11111111-1111-1111-1111-111111111103', 'খানসামা', 'Khansama');

-- 5. 12 Service Categories
INSERT INTO public.categories (id, name_bn, name_en, slug, display_order, icon_url) VALUES
('22222222-2222-2222-2222-222222222201', 'ইলেকট্রিক্যাল কাজ', 'Electrical Services', 'electrical-services', 1, 'Zap'),
('22222222-2222-2222-2222-222222222202', 'প্লাম্বিং সার্ভিস', 'Plumbing Services', 'plumbing-services', 2, 'Wrench'),
('22222222-2222-2222-2222-222222222203', 'রং করার কাজ', 'Painting Services', 'painting-services', 3, 'Paintbrush'),
('22222222-2222-2222-2222-222222222204', 'রাজমিস্ত্রীর কাজ', 'Masonry Services', 'masonry-services', 4, 'Hammer'),
('22222222-2222-2222-2222-222222222205', 'ঘরের টিনের কাজ', 'Tin Roofing Services', 'tin-roofing-services', 5, 'Home'),
('22222222-2222-2222-2222-222222222206', 'কাঠের কাজ', 'Carpentry Services', 'carpentry-services', 6, 'Axe'),
('22222222-2222-2222-2222-222222222207', 'ফার্নিচারের কাজ', 'Furniture Services', 'furniture-services', 7, 'Armchair'),
('22222222-2222-2222-2222-222222222208', 'এঙ্গেল মিস্ত্রী ও গ্রিল', 'Angle Iron & Metal Fabrication', 'metal-fabrication', 8, 'ShieldAlert'),
('22222222-2222-2222-2222-222222222209', 'থাই গ্লাস ও অ্যালুমিনিয়াম', 'Thai Glass & Aluminium Services', 'thai-glass-aluminium', 9, 'Layers'),
('22222222-2222-2222-2222-222222222210', 'ঘরের সিলিং কাজ', 'Ceiling Services', 'ceiling-services', 10, 'Maximize'),
('22222222-2222-2222-2222-222222222211', 'দৈনিক লেবার', 'Daily Labour Services', 'daily-labour', 11, 'Users'),
('22222222-2222-2222-2222-222222222212', 'অন্যান্য সেবা', 'Other Services', 'other-services', 12, 'MoreHorizontal')
ON CONFLICT (id) DO NOTHING;

-- 6. Subcategories
-- Electrical Subcategories
INSERT INTO public.subcategories (category_id, name_bn, name_en, slug, display_order) VALUES
('22222222-2222-2222-2222-222222222201', 'বাসা-বাড়ির ওয়্যারিং', 'House Wiring', 'house-wiring', 1),
('22222222-2222-2222-2222-222222222201', 'সুইচ ও সকেট মেরামত', 'Switch & Socket Repair', 'switch-socket-repair', 2),
('22222222-2222-2222-2222-222222222201', 'সিলিং ফ্যান ও লাইটিং ফিটিং', 'Fan & Lighting Fitting', 'fan-lighting-fitting', 3),
('22222222-2222-2222-2222-222222222201', 'সার্কিট ব্রেকার ও ডিবি বোর্ড', 'Distribution Board & Breaker', 'db-breaker', 4),
('22222222-2222-2222-2222-222222222201', 'আইপিএস ও জেনারেটর সংযোগ', 'IPS & Generator Setup', 'ips-generator', 5);

-- Plumbing Subcategories
INSERT INTO public.subcategories (category_id, name_bn, name_en, slug, display_order) VALUES
('22222222-2222-2222-2222-222222222202', 'পাইপ ফিটিং ও মেরামত', 'Pipe Fitting & Repair', 'pipe-fitting', 1),
('22222222-2222-2222-2222-222222222202', 'পানির মোটর ও পাম্প মেরামত', 'Water Pump Repair', 'water-pump-repair', 2),
('22222222-2222-2222-2222-222222222202', 'স্যানিটারি ও বাথরুম ফিটিংস', 'Sanitary & Bathroom Fitting', 'sanitary-fitting', 3),
('22222222-2222-2222-2222-222222222202', 'পানির ট্যাংক পরিষ্কার', 'Water Tank Cleaning', 'tank-cleaning', 4),
('22222222-2222-2222-2222-222222222202', 'পাইপলাইন লিকেজ সমাধান', 'Leakage Detection & Fix', 'leak-fix', 5);

-- Painting Subcategories
INSERT INTO public.subcategories (category_id, name_bn, name_en, slug, display_order) VALUES
('22222222-2222-2222-2222-222222222203', 'ঘরের ভেতরের দেয়াল রং', 'Interior Wall Painting', 'interior-paint', 1),
('22222222-2222-2222-2222-222222222203', 'বাইরের দেয়াল ও ওয়েদারকোট', 'Exterior Weathercoat', 'exterior-paint', 2),
('22222222-2222-2222-2222-222222222203', 'পুটিং ও প্রাইমার কাজ', 'Putty & Primer Work', 'putty-primer', 3),
('22222222-2222-2222-2222-222222222203', 'কাঠের বার্নিশ ও পলিশ', 'Wood Varnish & Polish', 'wood-varnish', 4);

-- Masonry Subcategories
INSERT INTO public.subcategories (category_id, name_bn, name_en, slug, display_order) VALUES
('22222222-2222-2222-2222-222222222204', 'ইট গাঁথুনি ও প্লাস্টার', 'Brick Laying & Plastering', 'brick-laying-plaster', 1),
('22222222-2222-2222-2222-222222222204', 'টাইলস ও মার্বেল ফিটিংস', 'Tiles & Marble Fitting', 'tiles-fitting', 2),
('22222222-2222-2222-2222-222222222204', 'ছাদ ঢালাই ও কংক্রিট কাজ', 'Roof Casting & Concrete', 'roof-casting', 3),
('22222222-2222-2222-2222-222222222204', 'বাউন্ডারি ওয়াল নির্মাণ', 'Boundary Wall Construction', 'boundary-wall', 4);

