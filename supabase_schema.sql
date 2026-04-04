-- 0. Clean prior state (Drop tables to allow clean re-initialization for MVP)
drop table if exists public.replies cascade;
drop table if exists public.blunts cascade;

-- 1. Create the Blunts table
create table public.blunts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
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

-- Guests can insert blunts anonymously (user_id is null)
create policy "Guests can insert blunts"
on public.blunts for insert
with check (user_id is null);

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

-- 5. Storage Bucket Configuration
insert into storage.buckets (id, name, public) values ('blunt-attachments', 'blunt-attachments', true) on conflict (id) do nothing;
create policy "Attachments are publicly accessible" on storage.objects for select using (bucket_id = 'blunt-attachments');
create policy "Anyone can upload attachments" on storage.objects for insert with check (bucket_id = 'blunt-attachments');

-- 6. Cron Scheduling (Requires pg_cron extension enabled)
-- This executes every minute and queries for scheduled blunts that are due, triggering the Edge Function.
-- Note: Replace 'http://localhost:8000' with your production Edge Function URL when deploying.
create extension if not exists pg_cron;
select cron.schedule(
  'process-scheduled-blunts',
  '* * * * *',
  $$
  do language plpgsql $block$
  declare
    b record;
  begin
    for b in select id from public.blunts where scheduled_for is not null and scheduled_for <= extract(epoch from now()) * 1000 and acknowledged = false
    loop
      -- Inside pg_cron we can call the http extension. This assumes pg_net is available or you could hit an endpoint using https
      -- For production, it's often easier to make the Edge Function scan the DB instead of having the DB invoke the Edge Function.
      -- To keep it simple, we just mark it triggered or invoke an HTTP post. 
      -- (Example omitted for brevity, usually done via `net.http_post`)
    end loop;
  end;
  $block$;
  $$
);
