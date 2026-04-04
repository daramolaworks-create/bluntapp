-- Migration: Add "Real" reactions to public blunts
-- Run this in the Supabase SQL Editor

-- 1. Create the reactions table
CREATE TABLE IF NOT EXISTS public.reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blunt_id uuid REFERENCES public.blunts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at bigint DEFAULT (extract(epoch from now()) * 1000)::bigint,
  UNIQUE(blunt_id, user_id) -- One reaction per user per blunt
);

-- 2. Enable RLS
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- 3. Policies
CREATE POLICY "Anyone can view reactions" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react" ON public.reactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can unreact" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- 4. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
