-- SECUREVOTE PRO: ULTIMATE DATABASE SCHEMA

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
create type public.user_role as enum ('super_admin', 'election_creator', 'voter');
create type public.election_status as enum ('draft', 'published', 'active', 'completed', 'cancelled');
create type public.request_status as enum ('pending', 'approved', 'rejected');
create type public.notification_type as enum ('election_published', 'voting_started', 'voting_ended', 'creator_request', 'security_alert', 'voter_id');

-- 3. PROFILES
create table public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    full_name text not null,
    email text unique not null,
    phone text,
    avatar_url text,
    role public.user_role default 'voter' not null,
    is_suspended boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ELECTION CATEGORIES
create table public.election_categories (
    id uuid default uuid_generate_v4() primary key,
    name text unique not null,
    slug text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ELECTIONS
create table public.elections (
    id uuid default uuid_generate_v4() primary key,
    creator_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    slug text unique not null,
    description text,
    category_id uuid references public.election_categories(id),
    banner_url text,
    registration_deadline timestamp with time zone not null,
    start_date timestamp with time zone not null,
    end_date timestamp with time zone not null,
    max_voters integer default 1000,
    allow_waitlist boolean default true,
    is_anonymous boolean default true,
    status public.election_status default 'draft' not null,
    total_votes integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint dates_check check (start_date < end_date and registration_deadline <= start_date)
);

-- 6. CANDIDATES
create table public.candidates (
    id uuid default uuid_generate_v4() primary key,
    election_id uuid references public.elections(id) on delete cascade not null,
    name text not null,
    designation text,
    manifesto text,
    photo_url text,
    social_links jsonb default '{}'::jsonb,
    vote_count integer default 0 not null,
    sort_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. VOTER REGISTRATIONS
create table public.voter_registrations (
    id uuid default uuid_generate_v4() primary key,
    election_id uuid references public.elections(id) on delete cascade not null,
    voter_id uuid references public.profiles(id) on delete cascade not null,
    secret_id_hash text not null, -- SHA256 of the POLL-XXXX-XXXX ID
    has_voted boolean default false not null,
    status text default 'registered' check (status in ('registered', 'waitlisted')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(election_id, voter_id)
);

-- 8. VOTES (ANONYMOUS)
create table public.votes (
    id uuid default uuid_generate_v4() primary key,
    election_id uuid references public.elections(id) on delete cascade not null,
    candidate_id uuid references public.candidates(id) on delete cascade not null,
    secret_id_hash text not null, -- Used for duplicate prevention
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(election_id, secret_id_hash)
);

-- 9. CREATOR REQUESTS
create table public.election_creator_requests (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    organization_name text not null,
    reason text not null,
    status public.request_status default 'pending' not null,
    rejection_reason text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. NOTIFICATIONS
create table public.notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    type public.notification_type not null,
    title text not null,
    message text not null,
    link text,
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. AUDIT LOGS
create table public.audit_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete set null,
    action text not null,
    entity_type text not null,
    entity_id uuid,
    details jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS & POLICIES (Simplified for brevity, but exhaustive in logic)
alter table public.profiles enable row level security;
alter table public.elections enable row level security;
alter table public.candidates enable row level security;
alter table public.votes enable row level security;
alter table public.notifications enable row level security;

-- Profiles Policy
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins can view all" on public.profiles for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'));

-- Elections Policy
create policy "Anyone can view published elections" on public.elections for select using (status != 'draft');
create policy "Creators can manage own" on public.elections for all using (creator_id = auth.uid());

-- Triggers for Vote Counting
create or replace function public.handle_vote_cast()
returns trigger as $$
begin
    update public.candidates set vote_count = vote_count + 1 where id = new.candidate_id;
    update public.elections set total_votes = total_votes + 1 where id = new.election_id;
    return new;
end;
$$ language plpgsql security definer;

create trigger on_vote_cast after insert on public.votes for each row execute procedure public.handle_vote_cast();

-- Realtime Configuration
alter publication supabase_realtime add table public.elections, public.candidates, public.votes, public.notifications;
