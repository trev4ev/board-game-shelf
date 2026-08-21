-- Accounts, collections, friends, and membership-scoped game writes
-- Project: https://supabase.com/dashboard/project/cfzssslioogdnjyuxpvu/sql/new

create extension if not exists "pgcrypto";

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users). Username is chosen in-app after signup.
-- Do not authorize from auth.users raw_user_meta_data / user_metadata.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  username_set_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (
    username is null or username ~ '^[A-Za-z0-9_]{3,20}$'
  )
);

create unique index if not exists profiles_username_lower_uidx
  on public.profiles (lower(username))
  where username is not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_new_user();

insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Collections + membership (pending invite or accepted co-owner)
-- ---------------------------------------------------------------------------

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint collections_name_not_blank check (char_length(trim(name)) > 0)
);

drop trigger if exists collections_set_updated_at on public.collections;
create trigger collections_set_updated_at
  before update on public.collections
  for each row
  execute function public.set_updated_at();

create table if not exists public.collection_members (
  collection_id uuid not null references public.collections (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null,
  invited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (collection_id, user_id),
  constraint collection_members_status_check check (status in ('pending', 'accepted'))
);

create index if not exists collection_members_user_id_idx
  on public.collection_members (user_id);

create index if not exists collection_members_collection_status_idx
  on public.collection_members (collection_id, status);

create or replace function private.is_collection_member(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.collection_members m
    where m.collection_id = cid
      and m.user_id = auth.uid()
      and m.status = 'accepted'
  );
$$;

revoke all on function private.is_collection_member(uuid) from public;
grant execute on function private.is_collection_member(uuid) to authenticated;

create or replace function private.add_collection_creator()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.collection_members (collection_id, user_id, status, invited_by)
  values (new.id, new.created_by, 'accepted', new.created_by)
  on conflict (collection_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists collections_add_creator on public.collections;
create trigger collections_add_creator
  after insert on public.collections
  for each row
  execute function private.add_collection_creator();

create or replace function private.mark_collection_deleting()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform set_config('app.deleting_collection', old.id::text, true);
  return old;
end;
$$;

drop trigger if exists collections_mark_deleting on public.collections;
create trigger collections_mark_deleting
  before delete on public.collections
  for each row
  execute function private.mark_collection_deleting();

create or replace function private.prevent_last_member_leave()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleting_collection text;
begin
  deleting_collection := current_setting('app.deleting_collection', true);
  if deleting_collection is not null and deleting_collection = old.collection_id::text then
    return old;
  end if;

  if old.status = 'accepted'
     and exists (select 1 from public.collections c where c.id = old.collection_id)
     and not exists (
       select 1
       from public.collection_members m
       where m.collection_id = old.collection_id
         and m.status = 'accepted'
         and m.user_id <> old.user_id
     )
  then
    raise exception 'Cannot leave as the last member; delete the collection instead'
      using errcode = 'P0001';
  end if;

  return old;
end;
$$;

drop trigger if exists collection_members_prevent_last_leave on public.collection_members;
create trigger collection_members_prevent_last_leave
  before delete on public.collection_members
  for each row
  execute function private.prevent_last_member_leave();

-- ---------------------------------------------------------------------------
-- Attach existing games to a collection owned by the earliest auth user
-- ---------------------------------------------------------------------------

alter table public.games
  add column if not exists collection_id uuid references public.collections (id) on delete cascade;

do $$
declare
  owner_id uuid;
  col_id uuid;
begin
  select id into owner_id from auth.users order by created_at asc limit 1;

  if owner_id is null then
    if exists (select 1 from public.games where collection_id is null) then
      raise exception 'Cannot migrate games: no auth users to own the collection';
    end if;
    return;
  end if;

  if exists (select 1 from public.games where collection_id is null)
     or not exists (select 1 from public.collections)
  then
    insert into public.collections (name, created_by)
    values ('Board Game Shelf', owner_id)
    returning id into col_id;

    insert into public.collection_members (collection_id, user_id, status, invited_by)
    select col_id, u.id, 'accepted', owner_id
    from auth.users u
    where u.id <> owner_id
    on conflict (collection_id, user_id) do nothing;

    update public.games
    set collection_id = col_id
    where collection_id is null;
  end if;
end;
$$;

alter table public.games
  alter column collection_id set not null;

create index if not exists games_collection_id_idx on public.games (collection_id);

alter table public.games drop constraint if exists games_bgg_id_key;
drop index if exists games_bgg_id_key;

create unique index if not exists games_collection_bgg_id_uidx
  on public.games (collection_id, bgg_id)
  where bgg_id is not null;

create or replace function private.is_game_member(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select private.is_collection_member(g.collection_id)
      from public.games g
      where g.id = gid
    ),
    false
  );
$$;

revoke all on function private.is_game_member(uuid) from public;
grant execute on function private.is_game_member(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Friendships
-- ---------------------------------------------------------------------------

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint friendships_status_check check (status in ('pending', 'accepted')),
  constraint friendships_not_self check (requester_id <> addressee_id)
);

create unique index if not exists friendships_pair_uidx
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

create index if not exists friendships_addressee_status_idx
  on public.friendships (addressee_id, status);

create index if not exists friendships_requester_status_idx
  on public.friendships (requester_id, status);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.collection_members enable row level security;
alter table public.friendships enable row level security;

drop policy if exists "Profiles are readable" on public.profiles;
create policy "Profiles are readable"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "Collections are publicly readable" on public.collections;
create policy "Collections are publicly readable"
  on public.collections
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated users can create collections" on public.collections;
create policy "Authenticated users can create collections"
  on public.collections
  for insert
  to authenticated
  with check (created_by = (select auth.uid()));

drop policy if exists "Members can update collections" on public.collections;
create policy "Members can update collections"
  on public.collections
  for update
  to authenticated
  using (private.is_collection_member(id))
  with check (private.is_collection_member(id));

drop policy if exists "Members can delete collections" on public.collections;
create policy "Members can delete collections"
  on public.collections
  for delete
  to authenticated
  using (private.is_collection_member(id));

drop policy if exists "Members and invitees can read memberships" on public.collection_members;
create policy "Members and invitees can read memberships"
  on public.collection_members
  for select
  to authenticated
  using (user_id = (select auth.uid()) or private.is_collection_member(collection_id));

drop policy if exists "Members can invite co-owners" on public.collection_members;
create policy "Members can invite co-owners"
  on public.collection_members
  for insert
  to authenticated
  with check (
    status = 'pending'
    and user_id <> (select auth.uid())
    and invited_by = (select auth.uid())
    and private.is_collection_member(collection_id)
  );

drop policy if exists "Invitees can accept membership" on public.collection_members;
create policy "Invitees can accept membership"
  on public.collection_members
  for update
  to authenticated
  using (user_id = (select auth.uid()) and status = 'pending')
  with check (user_id = (select auth.uid()) and status = 'accepted');

drop policy if exists "Members can remove memberships" on public.collection_members;
create policy "Members can remove memberships"
  on public.collection_members
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    or private.is_collection_member(collection_id)
  );

drop policy if exists "Participants can read friendships" on public.friendships;
create policy "Participants can read friendships"
  on public.friendships
  for select
  to authenticated
  using (
    requester_id = (select auth.uid())
    or addressee_id = (select auth.uid())
  );

drop policy if exists "Users can send friend requests" on public.friendships;
create policy "Users can send friend requests"
  on public.friendships
  for insert
  to authenticated
  with check (
    requester_id = (select auth.uid())
    and status = 'pending'
  );

drop policy if exists "Addressee can accept friend requests" on public.friendships;
create policy "Addressee can accept friend requests"
  on public.friendships
  for update
  to authenticated
  using (addressee_id = (select auth.uid()) and status = 'pending')
  with check (addressee_id = (select auth.uid()) and status = 'accepted');

drop policy if exists "Participants can delete friendships" on public.friendships;
create policy "Participants can delete friendships"
  on public.friendships
  for delete
  to authenticated
  using (
    requester_id = (select auth.uid())
    or addressee_id = (select auth.uid())
  );

-- Replace open write policies on games / plays with membership checks
drop policy if exists "Games are publicly readable" on public.games;
create policy "Games are publicly readable"
  on public.games
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated users can insert games" on public.games;
create policy "Members can insert games"
  on public.games
  for insert
  to authenticated
  with check (private.is_collection_member(collection_id));

drop policy if exists "Authenticated users can update games" on public.games;
create policy "Members can update games"
  on public.games
  for update
  to authenticated
  using (private.is_collection_member(collection_id))
  with check (private.is_collection_member(collection_id));

drop policy if exists "Authenticated users can delete games" on public.games;
create policy "Members can delete games"
  on public.games
  for delete
  to authenticated
  using (private.is_collection_member(collection_id));

drop policy if exists "Plays are publicly readable" on public.plays;
create policy "Plays are publicly readable"
  on public.plays
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated users can insert plays" on public.plays;
create policy "Members can insert plays"
  on public.plays
  for insert
  to authenticated
  with check (private.is_game_member(game_id));

drop policy if exists "Authenticated users can update plays" on public.plays;
create policy "Members can update plays"
  on public.plays
  for update
  to authenticated
  using (private.is_game_member(game_id))
  with check (private.is_game_member(game_id));

drop policy if exists "Authenticated users can delete plays" on public.plays;
create policy "Members can delete plays"
  on public.plays
  for delete
  to authenticated
  using (private.is_game_member(game_id));
