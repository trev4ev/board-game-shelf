-- Friends can discover each other's accepted collection memberships.
-- Collections and games are already readable by URL; this only reveals
-- which accepted shelves a friend belongs to (not pending invites).

create or replace function private.are_accepted_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select a is not null
    and b is not null
    and a <> b
    and (a = auth.uid() or b = auth.uid())
    and exists (
      select 1
      from public.friendships f
      where f.status = 'accepted'
        and (
          (f.requester_id = a and f.addressee_id = b)
          or (f.requester_id = b and f.addressee_id = a)
        )
    );
$$;

revoke all on function private.are_accepted_friends(uuid, uuid) from public;
grant execute on function private.are_accepted_friends(uuid, uuid) to authenticated;

drop policy if exists "Friends can read accepted memberships" on public.collection_members;
create policy "Friends can read accepted memberships"
  on public.collection_members
  for select
  to authenticated
  using (
    status = 'accepted'
    and private.are_accepted_friends((select auth.uid()), user_id)
  );
