-- ==============================================================================
-- SAFRO TRAVEL APP - SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Copy and run this script in your Supabase Dashboard -> SQL Editor
-- URL: https://cquygstwcugjxhjkdnio.supabase.co
-- ==============================================================================

-- 1. PROFILES TABLE (Linked directly to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  avatar_url text default 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  location text default 'New Delhi, India',
  phone text default '+91 98765 43210',
  joined_date text default 'March 2026',
  preferences jsonb default '{"travelStyle": "Balanced", "interests": ["Nature", "Adventure", "Food"], "preferredTransport": "Car"}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security on profiles
alter table public.profiles enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

-- RLS Policies for profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- 2. AUTOMATIC PROFILE CREATION TRIGGER
-- Automatically creates a public.profiles row whenever a user signs up via Email or Google OAuth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 3. TRIPS TABLE (User's AI & Custom Itineraries)
create table if not exists public.trips (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  title text not null,
  destination text not null,
  state_or_country text,
  description text,
  image_url text,
  start_date text,
  end_date text,
  duration_days integer default 3,
  travelers integer default 1,
  travel_style text default 'Balanced',
  transportation text default 'Car',
  interests text[] default '{}',
  budget numeric default 20000,
  estimated_cost numeric default 18000,
  actual_spent numeric default 0,
  applied_offer_id text,
  applied_offer_discount numeric default 0,
  credits_used numeric default 0,
  status text default 'planned',
  is_paid boolean default false,
  itinerary jsonb default '[]'::jsonb,
  live_status jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.trips enable row level security;

drop policy if exists "Users can view own trips" on public.trips;
drop policy if exists "Users can insert own trips" on public.trips;
drop policy if exists "Users can update own trips" on public.trips;
drop policy if exists "Users can delete own trips" on public.trips;

create policy "Users can view own trips" on public.trips
  for select using (auth.uid() = user_id);

create policy "Users can insert own trips" on public.trips
  for insert with check (auth.uid() = user_id);

create policy "Users can update own trips" on public.trips
  for update using (auth.uid() = user_id);

create policy "Users can delete own trips" on public.trips
  for delete using (auth.uid() = user_id);


-- 4. EXPENSES TABLE (Real-time Budget & Expense Tracker)
create table if not exists public.expenses (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  trip_id text references public.trips(id) on delete set null,
  category text not null,
  amount numeric not null,
  merchant text not null,
  date text not null,
  time text,
  receipt_url text,
  notes text,
  is_verified boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.expenses enable row level security;

drop policy if exists "Users can view own expenses" on public.expenses;
drop policy if exists "Users can insert own expenses" on public.expenses;
drop policy if exists "Users can update own expenses" on public.expenses;
drop policy if exists "Users can delete own expenses" on public.expenses;

create policy "Users can view own expenses" on public.expenses
  for select using (auth.uid() = user_id);

create policy "Users can insert own expenses" on public.expenses
  for insert with check (auth.uid() = user_id);

create policy "Users can update own expenses" on public.expenses
  for update using (auth.uid() = user_id);

create policy "Users can delete own expenses" on public.expenses
  for delete using (auth.uid() = user_id);


-- 5. SAFRO CREDITS TABLE (Wallet & Reward Points)
create table if not exists public.credits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  balance numeric default 2200,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.credit_transactions (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  type text not null check (type in ('earned', 'redeemed', 'expired')),
  amount numeric not null,
  description text not null,
  date text not null,
  trip_id text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.credits enable row level security;
alter table public.credit_transactions enable row level security;

drop policy if exists "Users can view own credits" on public.credits;
drop policy if exists "Users can view own credit transactions" on public.credit_transactions;
drop policy if exists "Users can insert credit transactions" on public.credit_transactions;

create policy "Users can view own credits" on public.credits
  for select using (auth.uid() = user_id);

create policy "Users can view own credit transactions" on public.credit_transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert credit transactions" on public.credit_transactions
  for insert with check (auth.uid() = user_id);


-- 6. PUSH NOTIFICATIONS & DEVICE TOKENS (FCM & Multi-Device Support)
create table if not exists public.device_push_tokens (
  device_id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  token text not null,
  platform text not null check (platform in ('android', 'ios', 'web', 'desktop')),
  device_name text,
  last_active timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.device_push_tokens enable row level security;

drop policy if exists "Users can view own device tokens" on public.device_push_tokens;
drop policy if exists "Users can insert own device tokens" on public.device_push_tokens;
drop policy if exists "Users can update own device tokens" on public.device_push_tokens;
drop policy if exists "Users can delete own device tokens" on public.device_push_tokens;

create policy "Users can view own device tokens" on public.device_push_tokens
  for select using (auth.uid() = user_id);

create policy "Users can insert own device tokens" on public.device_push_tokens
  for insert with check (auth.uid() = user_id);

create policy "Users can update own device tokens" on public.device_push_tokens
  for update using (auth.uid() = user_id);

create policy "Users can delete own device tokens" on public.device_push_tokens
  for delete using (auth.uid() = user_id);


-- 7. NOTIFICATIONS HISTORY & SERVER-GENERATED ALERTS
create table if not exists public.notifications (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  title text not null,
  message text not null,
  category text not null check (category in ('navigation', 'safety', 'general', 'updates', 'credit', 'offer')),
  priority text default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  link text,
  image text,
  is_read boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

drop policy if exists "Users can view own notifications" on public.notifications;
drop policy if exists "Users can insert own notifications" on public.notifications;
drop policy if exists "Users can update own notifications" on public.notifications;
drop policy if exists "Users can delete own notifications" on public.notifications;

create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can insert own notifications" on public.notifications
  for insert with check (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

create policy "Users can delete own notifications" on public.notifications
  for delete using (auth.uid() = user_id);


-- 8. SAFRO ADMIN PANEL & ROLE-BASED ACCESS CONTROL (RBAC)
-- Secure Administrative Registry & Invites
create table if not exists public.admin_users (
  id text primary key,
  email text unique not null,
  name text not null,
  phone text,
  role text not null check (role in ('super_admin', 'admin', 'moderator', 'support')),
  avatar_url text default 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  status text not null default 'active' check (status in ('active', 'suspended')),
  last_login timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.admin_invites (
  code text primary key,
  role text not null check (role in ('admin', 'moderator', 'support')),
  max_uses integer default 1,
  used_count integer default 0,
  active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.admin_sessions (
  id text primary key,
  admin_id text references public.admin_users(id) on delete cascade not null,
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.admin_users enable row level security;
alter table public.admin_invites enable row level security;
alter table public.admin_sessions enable row level security;

-- Admin tables are restricted to authenticated service_role and verified super_admin users
drop policy if exists "Admins can view admin accounts" on public.admin_users;
create policy "Admins can view admin accounts" on public.admin_users
  for select using (auth.jwt() ->> 'role' in ('super_admin', 'admin', 'service_role'));

drop policy if exists "Only super_admins can modify admin accounts" on public.admin_users;
create policy "Only super_admins can modify admin accounts" on public.admin_users
  for all using (auth.jwt() ->> 'role' in ('super_admin', 'service_role'));

