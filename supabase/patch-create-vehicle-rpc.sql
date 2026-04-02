-- Fix RPC return shape for create_vehicle_with_owner
-- Run this in Supabase SQL Editor.

drop function if exists public.create_vehicle_with_owner(text, text, text, text, int, text, text, int, text);

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
returns table (
  id uuid,
  name text,
  plate text,
  brand text,
  model text,
  year int,
  vin text,
  notes text,
  current_mileage int,
  symbol text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
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

  return query
  select
    v_vehicle.id,
    v_vehicle.name,
    v_vehicle.plate,
    v_vehicle.brand,
    v_vehicle.model,
    v_vehicle.year,
    v_vehicle.vin,
    v_vehicle.notes,
    v_vehicle.current_mileage,
    v_vehicle.symbol,
    v_vehicle.created_by,
    v_vehicle.created_at,
    v_vehicle.updated_at;
end;
$$;

grant execute on function public.create_vehicle_with_owner(text, text, text, text, int, text, text, int, text) to authenticated;
