-- Member management RPCs for Omiigo Car
-- Run this in Supabase SQL Editor.

create or replace function public.list_vehicle_members_with_profiles(
  p_vehicle_id uuid
)
returns table (
  id uuid,
  vehicle_id uuid,
  user_id uuid,
  role text,
  created_by uuid,
  created_at timestamptz,
  email text,
  display_name text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = p_vehicle_id
      and vm.user_id = auth.uid()
  ) then
    raise exception 'Access denied';
  end if;

  return query
  select
    vm.id,
    vm.vehicle_id,
    vm.user_id,
    vm.role,
    vm.created_by,
    vm.created_at,
    p.email,
    p.display_name
  from public.vehicle_members vm
  left join public.profiles p on p.id = vm.user_id
  where vm.vehicle_id = p_vehicle_id
  order by vm.created_at asc;
end;
$$;

grant execute on function public.list_vehicle_members_with_profiles(uuid) to authenticated;

create or replace function public.update_vehicle_member_role(
  p_member_id uuid,
  p_role text
)
returns public.vehicle_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.vehicle_members;
  v_owner_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_role not in ('owner', 'driver', 'viewer') then
    raise exception 'Invalid role';
  end if;

  select * into v_member
  from public.vehicle_members
  where id = p_member_id;

  if v_member.id is null then
    raise exception 'Member not found';
  end if;

  if not exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = v_member.vehicle_id
      and vm.user_id = auth.uid()
      and vm.role = 'owner'
  ) then
    raise exception 'Access denied';
  end if;

  if v_member.role = 'owner' and p_role <> 'owner' then
    select count(*) into v_owner_count
    from public.vehicle_members vm
    where vm.vehicle_id = v_member.vehicle_id
      and vm.role = 'owner';

    if v_owner_count <= 1 then
      raise exception 'Last owner cannot be downgraded';
    end if;
  end if;

  update public.vehicle_members
  set role = p_role
  where id = p_member_id
  returning * into v_member;

  return v_member;
end;
$$;

grant execute on function public.update_vehicle_member_role(uuid, text) to authenticated;

create or replace function public.remove_vehicle_member(
  p_member_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.vehicle_members;
  v_owner_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_member
  from public.vehicle_members
  where id = p_member_id;

  if v_member.id is null then
    raise exception 'Member not found';
  end if;

  if not exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = v_member.vehicle_id
      and vm.user_id = auth.uid()
      and vm.role = 'owner'
  ) then
    raise exception 'Access denied';
  end if;

  if v_member.role = 'owner' then
    select count(*) into v_owner_count
    from public.vehicle_members vm
    where vm.vehicle_id = v_member.vehicle_id
      and vm.role = 'owner';

    if v_owner_count <= 1 then
      raise exception 'Last owner cannot be removed';
    end if;
  end if;

  delete from public.vehicle_members
  where id = p_member_id;

  return p_member_id;
end;
$$;

grant execute on function public.remove_vehicle_member(uuid) to authenticated;

create or replace function public.revoke_vehicle_invite(
  p_invite_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.vehicle_invites;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_invite
  from public.vehicle_invites
  where id = p_invite_id;

  if v_invite.id is null then
    raise exception 'Invite not found';
  end if;

  if not exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = v_invite.vehicle_id
      and vm.user_id = auth.uid()
      and vm.role = 'owner'
  ) then
    raise exception 'Access denied';
  end if;

  delete from public.vehicle_invites
  where id = p_invite_id;

  return p_invite_id;
end;
$$;

grant execute on function public.revoke_vehicle_invite(uuid) to authenticated;
