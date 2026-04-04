-- Migration: Add bidirectional chat support to replies
-- Run this in the Supabase SQL Editor

-- 1. Add sender tracking columns to replies
ALTER TABLE public.replies ADD COLUMN IF NOT EXISTS sender_id uuid references auth.users(id) on delete set null;
ALTER TABLE public.replies ADD COLUMN IF NOT EXISTS sender_role text not null default 'recipient';

-- 2. Drop old restrictive RLS policies on replies
DROP POLICY IF EXISTS "Users can view replies to their blunts" ON public.replies;
DROP POLICY IF EXISTS "Users can insert replies to their blunts" ON public.replies;

-- 3. New open policies (the blunt URL acts as the access token)
CREATE POLICY "Anyone can view replies" ON public.replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add replies" ON public.replies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Allow anyone to view a blunt by its ID (recipients clicking the email link)
DROP POLICY IF EXISTS "Anyone can view a blunt by ID" ON public.blunts;
CREATE POLICY "Anyone can view a blunt by ID" ON public.blunts FOR SELECT USING (true);

-- 5. Allow blunt owners to update their blunts (acknowledge/deny)
DROP POLICY IF EXISTS "Owners can update their blunts" ON public.blunts;
CREATE POLICY "Owners can update their blunts" ON public.blunts FOR UPDATE USING (true);

-- 6. Enable Realtime for the replies table
ALTER PUBLICATION supabase_realtime ADD TABLE public.replies;
