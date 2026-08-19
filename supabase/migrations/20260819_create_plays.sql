-- Play sessions: who played, winner order, optional scores
-- Run in Supabase Dashboard → SQL if this is not applied via the CLI

create table if not exists public.plays (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  played_on date not null,
  players jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint plays_players_is_array check (jsonb_typeof(players) = 'array')
);

create index if not exists plays_game_id_played_on_idx
  on public.plays (game_id, played_on desc);

alter table public.plays enable row level security;

drop policy if exists "Plays are publicly readable" on public.plays;
create policy "Plays are publicly readable"
  on public.plays
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated users can insert plays" on public.plays;
create policy "Authenticated users can insert plays"
  on public.plays
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update plays" on public.plays;
create policy "Authenticated users can update plays"
  on public.plays
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete plays" on public.plays;
create policy "Authenticated users can delete plays"
  on public.plays
  for delete
  to authenticated
  using (true);
