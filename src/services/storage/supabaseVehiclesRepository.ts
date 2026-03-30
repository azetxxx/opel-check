import type { VehicleProfile } from '../../types/maintenance';
import type { VehicleRow } from '../../types/supabase';
import { getSupabaseClient } from '../../lib/supabase';
import type { VehiclesRepository } from './types';

const mapVehicleRowToProfile = (row: VehicleRow): VehicleProfile => ({
  id: row.id,
  name: row.name,
  plate: row.plate ?? undefined,
  brand: row.brand ?? undefined,
  model: row.model ?? undefined,
  year: row.year ?? undefined,
  vin: row.vin ?? undefined,
  notes: row.notes ?? undefined,
  currentMileage: row.current_mileage,
  symbol: (row.symbol as VehicleProfile['symbol']) ?? 'car',
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapVehicleProfileToInsert = (vehicle: Partial<VehicleProfile>, userId: string) => ({
  name: vehicle.name?.trim() || 'Mein Fahrzeug',
  plate: vehicle.plate?.trim() || null,
  brand: vehicle.brand?.trim() || null,
  model: vehicle.model?.trim() || null,
  year: vehicle.year ?? null,
  vin: vehicle.vin?.trim() || null,
  notes: vehicle.notes?.trim() || null,
  current_mileage: vehicle.currentMileage ?? null,
  symbol: vehicle.symbol ?? 'car',
  created_by: userId
});

const mapVehicleProfileToUpdate = (vehicle: VehicleProfile) => ({
  name: vehicle.name.trim() || 'Mein Fahrzeug',
  plate: vehicle.plate?.trim() || null,
  brand: vehicle.brand?.trim() || null,
  model: vehicle.model?.trim() || null,
  year: vehicle.year ?? null,
  vin: vehicle.vin?.trim() || null,
  notes: vehicle.notes?.trim() || null,
  current_mileage: vehicle.currentMileage ?? null,
  symbol: vehicle.symbol ?? 'car'
});

const requireUserId = async () => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error('Supabase authentication required.');

  return data.user.id;
};

export const supabaseVehiclesRepository: VehiclesRepository = {
  async list() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []).map((row) => mapVehicleRowToProfile(row as VehicleRow));
  },

  async create(partial) {
    const supabase = getSupabaseClient();
    const userId = await requireUserId();

    const { data: insertedVehicle, error: insertVehicleError } = await supabase
      .from('vehicles')
      .insert(mapVehicleProfileToInsert(partial ?? {}, userId))
      .select('*')
      .single();

    if (insertVehicleError) throw insertVehicleError;

    const { error: insertMemberError } = await supabase
      .from('vehicle_members')
      .insert({
        vehicle_id: insertedVehicle.id,
        user_id: userId,
        role: 'owner',
        created_by: userId
      });

    if (insertMemberError) throw insertMemberError;

    return mapVehicleRowToProfile(insertedVehicle as VehicleRow);
  },

  async update(vehicle) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('vehicles')
      .update(mapVehicleProfileToUpdate(vehicle))
      .eq('id', vehicle.id)
      .select('*')
      .single();

    if (error) throw error;
    return mapVehicleRowToProfile(data as VehicleRow);
  },

  async remove(vehicleId) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId);

    if (error) throw error;
    return true;
  }
};
