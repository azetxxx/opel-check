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

export interface VehicleMemberListItem extends VehicleMemberRow {
  label: string;
  email: string | null;
  display_name: string | null;
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

export interface MaintenanceTaskRow {
  id: string;
  vehicle_id: string;
  description: string;
  category: string;
  schedule_type: 'recurring' | 'scheduled';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual' | null;
  last_check: string | null;
  next_check: string | null;
  due_date: string | null;
  notes: string | null;
  due_mileage: number | null;
  last_mileage: number | null;
  is_custom: boolean;
  is_archived: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceLogRow {
  id: string;
  vehicle_id: string;
  task_id: string;
  task_description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual' | null;
  checked_at: string;
  next_due_date: string | null;
  notes: string | null;
  mileage: number | null;
  created_by: string | null;
  created_at: string;
}
