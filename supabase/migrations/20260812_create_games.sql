-- Board Game Shelf: games table + RLS
-- Run in Supabase Dashboard → SQL → New query
-- Project: https://supabase.com/dashboard/project/cfzssslioogdnjyuxpvu/sql/new

create extension if not exists "pgcrypto";

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  bgg_id integer unique,
  name text not null,
  year_published integer,
  description text,
  min_players integer,
  max_players integer,
  min_play_time integer,
  max_play_time integer,
  play_time integer,
  min_age integer,
  categories text[] not null default '{}',
  mechanics text[] not null default '{}',
  bgg_rating double precision,
  weight double precision,
  thumbnail_url text,
  image_url text,
  last_played date,
  play_count integer not null default 0,
  is_favorite boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint games_name_not_blank check (char_length(trim(name)) > 0)
);

create index if not exists games_name_idx on public.games (name);
create index if not exists games_is_favorite_idx on public.games (is_favorite);

create or replace function public.set_games_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at
  before update on public.games
  for each row
  execute function public.set_games_updated_at();

alter table public.games enable row level security;

-- Guests and owners can read the collection
drop policy if exists "Games are publicly readable" on public.games;
create policy "Games are publicly readable"
  on public.games
  for select
  to anon, authenticated
  using (true);

-- Only signed-in owners can write
drop policy if exists "Authenticated users can insert games" on public.games;
create policy "Authenticated users can insert games"
  on public.games
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update games" on public.games;
create policy "Authenticated users can update games"
  on public.games
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete games" on public.games;
create policy "Authenticated users can delete games"
  on public.games
  for delete
  to authenticated
  using (true);
