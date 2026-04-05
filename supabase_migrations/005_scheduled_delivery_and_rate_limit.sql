-- Migration: Scheduled blunt delivery infrastructure
-- Run this in the Supabase SQL Editor

-- 1. Add 'delivered' flag to blunts
ALTER TABLE public.blunts ADD COLUMN IF NOT EXISTS delivered boolean DEFAULT false;

-- Mark all existing non-scheduled blunts as already delivered
UPDATE public.blunts SET delivered = true WHERE scheduled_for <= (extract(epoch from now()) * 1000)::bigint;

-- 2. Server-side rate limiting function
-- Returns true if the user is within their daily limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_start bigint;
  today_count int;
  max_limit int := 10;
BEGIN
  today_start := (extract(epoch from date_trunc('day', now())) * 1000)::bigint;

  SELECT count(*) INTO today_count
  FROM public.blunts
  WHERE user_id = p_user_id AND created_at >= today_start;

  RETURN jsonb_build_object(
    'allowed', today_count < max_limit,
    'remaining', GREATEST(0, max_limit - today_count),
    'max', max_limit,
    'used', today_count
  );
END;
$$;

-- 3. Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.check_rate_limit(uuid) TO authenticated;

-- 4. Scheduled delivery function (called by pg_cron)
-- This function finds undelivered blunts whose scheduled time has passed
-- and calls the Edge Function to deliver them
-- NOTE: Requires pg_net extension enabled in Supabase Dashboard > Database > Extensions
CREATE OR REPLACE FUNCTION public.deliver_scheduled_blunts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r record;
  edge_url text;
  service_key text;
BEGIN
  edge_url := current_setting('app.settings.edge_function_url', true);
  service_key := current_setting('app.settings.service_role_key', true);

  IF edge_url IS NULL THEN
    RAISE NOTICE 'Edge function URL not configured. Skipping scheduled delivery.';
    RETURN;
  END IF;

  FOR r IN
    SELECT id, content, recipient_number, delivery_mode
    FROM public.blunts
    WHERE delivered = false
      AND scheduled_for <= (extract(epoch from now()) * 1000)::bigint
  LOOP
    -- Call Edge Function via pg_net
    PERFORM net.http_post(
      url := edge_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := jsonb_build_object(
        'blunt', jsonb_build_object(
          'id', r.id,
          'recipientNumber', r.recipient_number,
          'deliveryMode', r.delivery_mode
        )
      )
    );

    -- Mark as delivered
    UPDATE public.blunts SET delivered = true WHERE id = r.id;

    RAISE NOTICE 'Delivered scheduled blunt: %', r.id;
  END LOOP;
END;
$$;

-- 5. Schedule the cron job (runs every 5 minutes)
-- NOTE: pg_cron must be enabled in Supabase Dashboard > Database > Extensions
-- After enabling, run this:
-- SELECT cron.schedule('deliver-scheduled-blunts', '*/5 * * * *', $$SELECT deliver_scheduled_blunts()$$);
