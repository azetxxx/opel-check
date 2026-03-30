import type { MaintenanceLog } from '../../types/maintenance';
import type { MaintenanceLogRow } from '../../types/supabase';
import { getSupabaseClient } from '../../lib/supabase';
import type { MaintenanceLogsRepository } from './types';

const mapRowToLog = (row: MaintenanceLogRow): MaintenanceLog => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  taskId: row.task_id,
  taskDescription: row.task_description,
  category: row.category,
  frequency: row.frequency,
  checkedAt: row.checked_at,
  nextDueDate: row.next_due_date,
  notes: row.notes ?? undefined,
  mileage: row.mileage,
  createdAt: row.created_at
});

const requireUserId = async () => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error('Supabase authentication required.');

  return data.user.id;
};

const listLogs = async () => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('maintenance_logs')
    .select('*')
    .order('checked_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapRowToLog(row as MaintenanceLogRow));
};

export const supabaseMaintenanceLogsRepository: MaintenanceLogsRepository = {
  async list() {
    return listLogs();
  },

  async replace(items) {
    const supabase = getSupabaseClient();
    const userId = await requireUserId();

    const groupedByVehicle = new Map<string, MaintenanceLog[]>();
    items.forEach((log) => {
      const group = groupedByVehicle.get(log.vehicleId) ?? [];
      group.push(log);
      groupedByVehicle.set(log.vehicleId, group);
    });

    for (const [vehicleId, vehicleLogs] of groupedByVehicle.entries()) {
      const { error: deleteError } = await supabase
        .from('maintenance_logs')
        .delete()
        .eq('vehicle_id', vehicleId);

      if (deleteError) throw deleteError;

      if (vehicleLogs.length > 0) {
        const payload = vehicleLogs.map((log) => ({
          id: log.id,
          vehicle_id: log.vehicleId,
          task_id: log.taskId,
          task_description: log.taskDescription,
          category: log.category,
          frequency: log.frequency,
          checked_at: log.checkedAt,
          next_due_date: log.nextDueDate ?? null,
          notes: log.notes?.trim() || null,
          mileage: log.mileage ?? null,
          created_by: userId,
          created_at: log.createdAt
        }));

        const { error: insertError } = await supabase
          .from('maintenance_logs')
          .insert(payload);

        if (insertError) throw insertError;
      }
    }

    return listLogs();
  },

  async add(log) {
    const supabase = getSupabaseClient();
    const userId = await requireUserId();
    const { error } = await supabase
      .from('maintenance_logs')
      .insert({
        id: log.id,
        vehicle_id: log.vehicleId,
        task_id: log.taskId,
        task_description: log.taskDescription,
        category: log.category,
        frequency: log.frequency,
        checked_at: log.checkedAt,
        next_due_date: log.nextDueDate ?? null,
        notes: log.notes?.trim() || null,
        mileage: log.mileage ?? null,
        created_by: userId,
        created_at: log.createdAt
      });

    if (error) throw error;
    return listLogs();
  },

  async clear() {
    throw new Error('Clearing all logs is not available for Supabase-backed maintenance logs.');
  }
};
