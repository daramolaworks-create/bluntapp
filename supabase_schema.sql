
-- 1. Create the Blunts table
create table public.blunts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  content text not null,
  is_anonymous boolean default false,
  allow_reply boolean default true,
  created_at bigint, -- Keeping as number (timestamp in ms) to match frontend types, or use timestamptz and cast
  acknowledged boolean default false,
  denied boolean default false,
  recipient_name text,
  recipient_number text,
  delivery_mode text,
  scheduled_for bigint,
  attachment text, -- Warning: Storing Base64 in DB is not scalable but works for MVP
  attachment_type text,
  attachment_name text,
  post_to_feed boolean default false
);

-- 2. Create the Replies table
create table public.replies (
  id uuid primary key default gen_random_uuid(),
  blunt_id uuid references public.blunts(id) on delete cascade,
  content text not null,
  created_at bigint
);

-- 3. Enable RLS
alter table public.blunts enable row level security;
alter table public.replies enable row level security;

-- 4. Policies

-- Users can insert their own blunts
create policy "Users can insert their own blunts" 
on public.blunts for insert 
with check (auth.uid() = user_id);

-- Users can view their own blunts
create policy "Users can view their own blunts" 
on public.blunts for select 
using (auth.uid() = user_id);

-- Public blunts (Moments of Truth) are visible to everyone
create policy "Public blunts are visible to everyone" 
on public.blunts for select 
using (post_to_feed = true);

-- Replies policies
create policy "Users can view replies to their blunts" 
on public.replies for select 
using (
  exists (select 1 from public.blunts where blunts.id = replies.blunt_id and blunts.user_id = auth.uid())
);

create policy "Users can insert replies to their blunts" 
on public.replies for insert 
with check (
  exists (select 1 from public.blunts where blunts.id = blunt_id and blunts.user_id = auth.uid())
);
