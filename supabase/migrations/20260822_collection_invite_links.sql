-- Shareable invite links: anyone with the token can join after signing in.
-- Tokens live on a separate table so public collection reads cannot leak them.

create table if not exists public.collection_invite_links (
  collection_id uuid primary key references public.collections (id) on delete cascade,
  token text not null,
  created_at timestamptz not null default now(),
  constraint collection_invite_links_token_not_blank check (char_length(trim(token)) > 0)
);

create unique index if not exists collection_invite_links_token_uidx
  on public.collection_invite_links (token);

create or replace function private.new_invite_token()
returns text
language sql
volatile
set search_path = ''
as $$
  select gen_random_uuid()::text;
$$;

revoke all on function private.new_invite_token() from public;

create or replace function private.create_collection_invite_link()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.collection_invite_links (collection_id, token)
  values (new.id, private.new_invite_token())
  on conflict (collection_id) do nothing;
  return new;
end;
$$;

drop trigger if exists collections_add_invite_link on public.collections;
create trigger collections_add_invite_link
  after insert on public.collections
  for each row
  execute function private.create_collection_invite_link();

insert into public.collection_invite_links (collection_id, token)
select c.id, gen_random_uuid()::text
from public.collections c
on conflict (collection_id) do nothing;

alter table public.collection_invite_links enable row level security;
revoke all on table public.collection_invite_links from public, anon, authenticated;
grant select on table public.collection_invite_links to authenticated;

drop policy if exists "Members can read invite links" on public.collection_invite_links;
create policy "Members can read invite links"
  on public.collection_invite_links
  for select
  to authenticated
  using (private.is_collection_member(collection_id));

create or replace function public.lookup_collection_invite(invite_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'collectionId', c.id,
    'name', c.name
  )
  from public.collection_invite_links l
  join public.collections c on c.id = l.collection_id
  where l.token = invite_token
  limit 1;
$$;

revoke all on function public.lookup_collection_invite(text) from public;
grant execute on function public.lookup_collection_invite(text) to anon, authenticated;

create or replace function public.join_collection_by_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  cid uuid;
  uid uuid;
begin
  uid := auth.uid();
  if uid is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.username is not null
  ) then
    raise exception 'Choose a username first'
      using errcode = 'P0003';
  end if;

  select l.collection_id into cid
  from public.collection_invite_links l
  where l.token = invite_token;

  if cid is null then
    raise exception 'Invalid invite link'
      using errcode = 'P0004';
  end if;

  insert into public.collection_members (collection_id, user_id, status, invited_by)
  values (cid, uid, 'accepted', null)
  on conflict (collection_id, user_id) do update
    set status = 'accepted';

  return cid;
end;
$$;

revoke all on function public.join_collection_by_invite(text) from public;
grant execute on function public.join_collection_by_invite(text) to authenticated;

create or replace function public.regenerate_collection_invite(cid uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_token text;
begin
  if auth.uid() is null or not private.is_collection_member(cid) then
    raise exception 'Not a collection member'
      using errcode = '42501';
  end if;

  new_token := private.new_invite_token();

  insert into public.collection_invite_links (collection_id, token)
  values (cid, new_token)
  on conflict (collection_id) do update
    set token = excluded.token,
        created_at = now();

  return new_token;
end;
$$;

revoke all on function public.regenerate_collection_invite(uuid) from public;
grant execute on function public.regenerate_collection_invite(uuid) to authenticated;
