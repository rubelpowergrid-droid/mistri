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

