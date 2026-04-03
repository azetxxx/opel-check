import { getSupabaseClient } from '../../lib/supabase';
import type { VehicleInviteRow, VehicleMemberListItem, VehicleMemberRole, VehicleMemberRow } from '../../types/supabase';

const randomCode = (length = 8) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const array = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(array, (value) => alphabet[value % alphabet.length]).join('');
};

const normalizeInviteCode = (code: string) => code.trim().toUpperCase();

const requireAuthenticatedUser = async () => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error('Supabase authentication required.');

  return data.user;
};

export const createVehicleInvite = async (
  vehicleId: string,
  role: Exclude<VehicleMemberRole, 'owner'>,
  expiresAt?: string | null
): Promise<VehicleInviteRow> => {
  const supabase = getSupabaseClient();
  const user = await requireAuthenticatedUser();
  const code = randomCode();

  const { data, error } = await supabase
    .from('vehicle_invites')
    .insert({
      vehicle_id: vehicleId,
      code,
      role,
      created_by: user.id,
      expires_at: expiresAt ?? null
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as VehicleInviteRow;
};

export const listVehicleInvites = async (vehicleId: string): Promise<VehicleInviteRow[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('vehicle_invites')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .is('used_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as VehicleInviteRow[];
};

export const acceptVehicleInvite = async (inviteCode: string): Promise<VehicleMemberRow> => {
  const supabase = getSupabaseClient();
  const code = normalizeInviteCode(inviteCode);

  const { data, error } = await supabase.rpc('accept_vehicle_invite', {
    p_code: code
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new Error('Invite RPC returned no membership row.');
  }

  return row as VehicleMemberRow;
};

export const listVehicleMembers = async (vehicleId: string): Promise<VehicleMemberListItem[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('list_vehicle_members_with_profiles', {
    p_vehicle_id: vehicleId
  });

  if (error) throw error;

  return (data ?? []).map((member: unknown) => {
    const row = member as VehicleMemberListItem;
    return {
      ...row,
      label: row.email ?? row.display_name ?? row.user_id
    };
  });
};

export const updateVehicleMemberRole = async (memberId: string, role: VehicleMemberRole): Promise<VehicleMemberRow> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('update_vehicle_member_role', {
    p_member_id: memberId,
    p_role: role
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new Error('Role update returned no member row.');
  }

  return row as VehicleMemberRow;
};

export const removeVehicleMember = async (memberId: string): Promise<string> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('remove_vehicle_member', {
    p_member_id: memberId
  });

  if (error) throw error;
  return (Array.isArray(data) ? data[0] : data) as string;
};

export const revokeVehicleInvite = async (inviteId: string): Promise<string> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('revoke_vehicle_invite', {
    p_invite_id: inviteId
  });

  if (error) throw error;
  return (Array.isArray(data) ? data[0] : data) as string;
};
