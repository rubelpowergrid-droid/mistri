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

