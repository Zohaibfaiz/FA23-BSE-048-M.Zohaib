-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ROLES ENUM
create type user_role as enum ('super_admin', 'election_creator', 'voter');
create type election_status as enum ('draft', 'published', 'active', 'completed', 'cancelled');
create type request_status as enum ('pending', 'approved', 'rejected');

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text not null,
  email text unique not null,
  phone text,
  role user_role default 'voter' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ELECTION CREATOR REQUESTS
create table public.election_creator_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  organization text not null,
  purpose text not null,
  phone text not null,
  email text not null,
  status request_status default 'pending' not null,
  rejection_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ELECTIONS
create table public.elections (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null,
  registration_deadline timestamp with time zone not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  max_voters integer,
  status election_status default 'draft' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint dates_check check (start_date < end_date and registration_deadline <= start_date)
);

-- CANDIDATES
create table public.candidates (
  id uuid default uuid_generate_v4() primary key,
  election_id uuid references public.elections(id) on delete cascade not null,
  name text not null,
  manifesto text not null,
  photo_url text,
  vote_count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- VOTER REGISTRATIONS
create table public.voter_registrations (
  id uuid default uuid_generate_v4() primary key,
  election_id uuid references public.elections(id) on delete cascade not null,
  voter_id uuid references public.profiles(id) on delete cascade not null,
  secret_id_hash text not null, -- hashed secret id
  has_voted boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(election_id, voter_id)
);

-- VOTES
create table public.votes (
  id uuid default uuid_generate_v4() primary key,
  election_id uuid references public.elections(id) on delete cascade not null,
  candidate_id uuid references public.candidates(id) on delete cascade not null,
  -- We do not link back to voter_id to maintain anonymity
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AUDIT LOGS
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES
alter table public.profiles enable row level security;
alter table public.election_creator_requests enable row level security;
alter table public.elections enable row level security;
alter table public.candidates enable row level security;
alter table public.voter_registrations enable row level security;
alter table public.votes enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: Users can view their own profile. Admins can view all.
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'));
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Elections: Everyone can view active/completed. Creators can view their own. Admins can view all.
create policy "Public can view published elections" on public.elections for select using (status in ('published', 'active', 'completed'));
create policy "Creators can view own elections" on public.elections for select using (auth.uid() = creator_id);
create policy "Creators can insert own elections" on public.elections for insert with check (auth.uid() = creator_id);
create policy "Creators can update own elections" on public.elections for update using (auth.uid() = creator_id);
create policy "Admins can view all elections" on public.elections for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'));

-- Candidates: Everyone can view candidates for published elections. Creators can manage.
create policy "Public can view candidates" on public.candidates for select using (exists (select 1 from public.elections where id = election_id and status in ('published', 'active', 'completed')));
create policy "Creators can manage candidates" on public.candidates for all using (exists (select 1 from public.elections where id = election_id and creator_id = auth.uid()));

-- Votes: Creators and Admins can view vote counts (handled via candidates table). Votes are anonymous. Insert only.
create policy "Anyone can insert votes" on public.votes for insert with check (true);
create policy "Admins can view votes" on public.votes for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'));

-- Voter Registrations: Voters can see their own. Creators can see for their elections.
create policy "Voters can view own registrations" on public.voter_registrations for select using (auth.uid() = voter_id);
create policy "Voters can register" on public.voter_registrations for insert with check (auth.uid() = voter_id);
create policy "Voters can update own registration" on public.voter_registrations for update using (auth.uid() = voter_id);
create policy "Creators can view registrations for their elections" on public.voter_registrations for select using (exists (select 1 from public.elections where id = election_id and creator_id = auth.uid()));

-- Audit Logs: Admins can view all.
create policy "Admins can view audit logs" on public.audit_logs for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'));
create policy "System can insert audit logs" on public.audit_logs for insert with check (true);

-- TRIGGERS

-- Update candidate vote count
create or replace function increment_vote_count()
returns trigger as $$
begin
  update public.candidates
  set vote_count = vote_count + 1
  where id = new.candidate_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_vote_inserted
  after insert on public.votes
  for each row execute procedure increment_vote_count();

-- Auto create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, coalesce((new.raw_user_meta_data->>'role')::user_role, 'voter'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated At triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_profiles_modtime before update on profiles for each row execute procedure update_updated_at_column();
create trigger update_elections_modtime before update on elections for each row execute procedure update_updated_at_column();
create trigger update_candidates_modtime before update on candidates for each row execute procedure update_updated_at_column();

-- REALTIME
alter publication supabase_realtime add table elections;
alter publication supabase_realtime add table candidates;
alter publication supabase_realtime add table votes;
