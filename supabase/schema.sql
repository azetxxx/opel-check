-- Omiigo Car - Supabase starter schema
-- Run this in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plate text,
  brand text,
  model text,
  year int,
  vin text,
  notes text,
  current_mileage int,
  symbol text not null default 'car',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_members (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'driver', 'viewer')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (vehicle_id, user_id)
);

create table if not exists public.vehicle_invites (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  code text not null unique,
  role text not null check (role in ('driver', 'viewer')),
  created_by uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz,
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_vehicles_created_by on public.vehicles(created_by);
create index if not exists idx_vehicle_members_user_id on public.vehicle_members(user_id);
create index if not exists idx_vehicle_members_vehicle_id on public.vehicle_members(vehicle_id);
create index if not exists idx_vehicle_invites_vehicle_id on public.vehicle_invites(vehicle_id);
create index if not exists idx_vehicle_invites_code on public.vehicle_invites(code);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_vehicles_updated_at on public.vehicles;
create trigger set_vehicles_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_members enable row level security;
alter table public.vehicle_invites enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "vehicles_select_member"
on public.vehicles
for select
to authenticated
using (
  exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = vehicles.id
      and vm.user_id = auth.uid()
  )
);

create policy "vehicles_insert_own"
on public.vehicles
for insert
to authenticated
with check (created_by = auth.uid());

create policy "vehicles_update_owner"
on public.vehicles
for update
to authenticated
using (
  exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = vehicles.id
      and vm.user_id = auth.uid()
      and vm.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = vehicles.id
      and vm.user_id = auth.uid()
      and vm.role = 'owner'
  )
);

create policy "vehicles_delete_owner"
on public.vehicles
for delete
to authenticated
using (
  exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = vehicles.id
      and vm.user_id = auth.uid()
      and vm.role = 'owner'
  )
);

create policy "vehicle_members_select_visible"
on public.vehicle_members
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = vehicle_members.vehicle_id
      and vm.user_id = auth.uid()
  )
);

create policy "vehicle_members_insert_owner"
on public.vehicle_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = vehicle_members.vehicle_id
      and vm.user_id = auth.uid()
      and vm.role = 'owner'
  )
);

create policy "vehicle_members_update_owner"
on public.vehicle_members
for update
to authenticated
using (
  exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = vehicle_members.vehicle_id
      and vm.user_id = auth.uid()
      and vm.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = vehicle_members.vehicle_id
      and vm.user_id = auth.uid()
      and vm.role = 'owner'
  )
);

create policy "vehicle_members_delete_owner"
on public.vehicle_members
for delete
to authenticated
using (
  exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = vehicle_members.vehicle_id
      and vm.user_id = auth.uid()
      and vm.role = 'owner'
  )
);

create policy "vehicle_invites_select_owner"
on public.vehicle_invites
for select
to authenticated
using (
  exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = vehicle_invites.vehicle_id
      and vm.user_id = auth.uid()
      and vm.role = 'owner'
  )
);

create policy "vehicle_invites_insert_owner"
on public.vehicle_invites
for insert
to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = vehicle_invites.vehicle_id
      and vm.user_id = auth.uid()
      and vm.role = 'owner'
  )
);

create policy "vehicle_invites_update_owner"
on public.vehicle_invites
for update
to authenticated
using (
  exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = vehicle_invites.vehicle_id
      and vm.user_id = auth.uid()
      and vm.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = vehicle_invites.vehicle_id
      and vm.user_id = auth.uid()
      and vm.role = 'owner'
  )
);

create policy "vehicle_invites_delete_owner"
on public.vehicle_invites
for delete
to authenticated
using (
  exists (
    select 1
    from public.vehicle_members vm
    where vm.vehicle_id = vehicle_invites.vehicle_id
      and vm.user_id = auth.uid()
      and vm.role = 'owner'
  )
);

-- RPC: create vehicle + owner membership in one transaction-like function
create or replace function public.create_vehicle_with_owner(
  p_name text,
  p_plate text default null,
  p_brand text default null,
  p_model text default null,
  p_year int default null,
  p_vin text default null,
  p_notes text default null,
  p_current_mileage int default null,
  p_symbol text default 'car'
)
returns public.vehicles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_vehicle public.vehicles;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.vehicles (
    name,
    plate,
    brand,
    model,
    year,
    vin,
    notes,
    current_mileage,
    symbol,
    created_by
  )
  values (
    coalesce(nullif(trim(p_name), ''), 'Mein Fahrzeug'),
    nullif(trim(p_plate), ''),
    nullif(trim(p_brand), ''),
    nullif(trim(p_model), ''),
    p_year,
    nullif(trim(p_vin), ''),
    nullif(trim(p_notes), ''),
    p_current_mileage,
    coalesce(nullif(trim(p_symbol), ''), 'car'),
    v_user_id
  )
  returning * into v_vehicle;

  insert into public.vehicle_members (vehicle_id, user_id, role, created_by)
  values (v_vehicle.id, v_user_id, 'owner', v_user_id);

  return v_vehicle;
end;
$$;

grant execute on function public.create_vehicle_with_owner(text, text, text, text, int, text, text, int, text) to authenticated;

-- RPC: redeem invite code + membership in one controlled flow
create or replace function public.accept_vehicle_invite(
  p_code text
)
returns public.vehicle_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_invite public.vehicle_invites;
  v_member public.vehicle_members;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_invite
  from public.vehicle_invites
  where upper(code) = upper(trim(p_code))
    and used_at is null
  limit 1;

  if v_invite.id is null then
    raise exception 'Invite not found';
  end if;

  if v_invite.expires_at is not null and v_invite.expires_at < now() then
    raise exception 'Invite expired';
  end if;

  insert into public.vehicle_members (vehicle_id, user_id, role, created_by)
  values (v_invite.vehicle_id, v_user_id, v_invite.role, v_invite.created_by)
  on conflict (vehicle_id, user_id)
  do update set role = excluded.role
  returning * into v_member;

  update public.vehicle_invites
  set used_by = v_user_id,
      used_at = now()
  where id = v_invite.id;

  return v_member;
end;
$$;

grant execute on function public.accept_vehicle_invite(text) to authenticated;
