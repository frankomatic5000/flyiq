create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  home_airport text,
  cabin text not null default 'economy',
  max_stops integer not null default 1,
  preferred_airlines text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.travel_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  origin text not null,
  destination text not null,
  depart_date date,
  return_date date,
  intent jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  route text not null,
  origin text not null,
  destination text not null,
  price numeric(10,2) not null,
  currency text not null default 'USD',
  observed_at timestamptz not null default now(),
  source text not null default 'amadeus'
);

create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  route text not null,
  origin text not null,
  destination text not null,
  target_price numeric(10,2) not null,
  is_active boolean not null default true,
  last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  route text not null,
  origin text not null,
  destination text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.airport_cache (
  iata_code text primary key,
  name text not null,
  city text not null,
  country text not null,
  latitude numeric(9,6),
  longitude numeric(9,6),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;
alter table public.travel_searches enable row level security;
alter table public.price_history enable row level security;
alter table public.price_alerts enable row level security;
alter table public.saved_routes enable row level security;
alter table public.airport_cache enable row level security;

create policy "Users manage own preferences" on public.user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own searches" on public.travel_searches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own alerts" on public.price_alerts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own saved routes" on public.saved_routes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Authenticated users read price history" on public.price_history
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users read airport cache" on public.airport_cache
  for select using (auth.role() = 'authenticated');
