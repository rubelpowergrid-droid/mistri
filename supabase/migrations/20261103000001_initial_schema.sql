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

