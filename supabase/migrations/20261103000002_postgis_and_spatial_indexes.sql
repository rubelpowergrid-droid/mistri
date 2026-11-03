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

