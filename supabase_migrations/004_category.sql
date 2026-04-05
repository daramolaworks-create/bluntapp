-- Migration: Add category column to blunts for feed categorization
-- Run this in the Supabase SQL Editor

ALTER TABLE public.blunts ADD COLUMN IF NOT EXISTS category text;
