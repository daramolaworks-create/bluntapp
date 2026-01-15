
-- 1. Create Profiles table (publicly queryable for login lookup)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  email text,
  full_name text,
  avatar text,
  created_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Policies
-- Allow anyone to read profiles (needed to look up email by username during login)
create policy "Public profiles are viewable by everyone" 
on public.profiles for select 
using (true);

-- Users can update their own profile
create policy "Users can update their own profile" 
on public.profiles for update 
using (auth.uid() = id);

-- 4. Trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email, full_name, avatar)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. Attach trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
