export type VehicleMemberRole = 'owner' | 'driver' | 'viewer';

export interface ProfileRow {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleRow {
  id: string;
  name: string;
  plate: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  vin: string | null;
  notes: string | null;
  current_mileage: number | null;
  symbol: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleMemberRow {
  id: string;
  vehicle_id: string;
  user_id: string;
  role: VehicleMemberRole;
  created_by: string | null;
  created_at: string;
}

export interface VehicleInviteRow {
  id: string;
  vehicle_id: string;
  code: string;
  role: Exclude<VehicleMemberRole, 'owner'>;
  created_by: string;
  expires_at: string | null;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
}
