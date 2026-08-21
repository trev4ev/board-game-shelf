-- Keep the original collection creator as a member unless they leave
-- or the collection itself is deleted.

create or replace function private.is_collection_creator(cid uuid, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.collections c
    where c.id = cid
      and c.created_by = uid
  );
$$;

revoke all on function private.is_collection_creator(uuid, uuid) from public;
grant execute on function private.is_collection_creator(uuid, uuid) to authenticated;

create or replace function private.prevent_creator_removal()
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

  if old.user_id = (select auth.uid()) then
    return old;
  end if;

  if private.is_collection_creator(old.collection_id, old.user_id) then
    raise exception 'The collection creator cannot be removed'
      using errcode = 'P0002';
  end if;

  return old;
end;
$$;

drop trigger if exists collection_members_prevent_creator_removal on public.collection_members;
create trigger collection_members_prevent_creator_removal
  before delete on public.collection_members
  for each row
  execute function private.prevent_creator_removal();

drop policy if exists "Members can remove memberships" on public.collection_members;
create policy "Members can remove memberships"
  on public.collection_members
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    or (
      private.is_collection_member(collection_id)
      and not private.is_collection_creator(collection_id, user_id)
    )
  );
