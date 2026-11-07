-- ====================================================================
-- MISTRI Database Migration: Fix RLS Mutual Recursion
-- Breaks circular dependency between customer_profiles and bookings
-- using SECURITY DEFINER helper functions
-- ====================================================================

-- 1. Helper function for bookings check on customer_profiles
CREATE OR REPLACE FUNCTION public.customer_has_booking(check_customer_id UUID, user_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.customer_profiles cp
    WHERE cp.id = check_customer_id AND cp.user_id = user_uid
  );
$$;

-- 2. Helper function for mistri assigned bookings
CREATE OR REPLACE FUNCTION public.mistri_has_booking(check_mistri_id UUID, user_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.mistri_profiles mp
    WHERE mp.id = check_mistri_id AND mp.user_id = user_uid
  );
$$;

-- 3. Helper function for mistri viewing counterpart customer
CREATE OR REPLACE FUNCTION public.mistri_can_view_customer(check_customer_id UUID, user_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings b
    INNER JOIN public.mistri_profiles mp ON mp.id = b.mistri_id
    WHERE b.customer_id = check_customer_id
      AND mp.user_id = user_uid
      AND b.status IN ('accepted', 'scheduled', 'in_progress')
  );
$$;

-- 4. Drop the recursive policies
DROP POLICY IF EXISTS "Mistris can view counterpart customer in active booking" ON public.customer_profiles;
DROP POLICY IF EXISTS "Customers can manage own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Mistris can view and update assigned bookings" ON public.bookings;

-- 5. Re-create non-recursive policies using the SECURITY DEFINER functions
CREATE POLICY "Mistris can view counterpart customer in active booking"
ON public.customer_profiles FOR SELECT USING (
    public.mistri_can_view_customer(id, auth.uid())
);

CREATE POLICY "Customers can manage own bookings"
ON public.bookings FOR ALL USING (
    public.customer_has_booking(customer_id, auth.uid())
);

CREATE POLICY "Mistris can view and update assigned bookings"
ON public.bookings FOR ALL USING (
    public.mistri_has_booking(mistri_id, auth.uid())
);
