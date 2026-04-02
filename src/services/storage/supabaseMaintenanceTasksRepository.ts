import type { MaintenanceTask } from '../../types/maintenance';
import type { MaintenanceTaskRow } from '../../types/supabase';
import { getSupabaseClient } from '../../lib/supabase';
import type { MaintenanceTasksRepository } from './types';

const mapRowToTask = (row: MaintenanceTaskRow): MaintenanceTask => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  description: row.description,
  category: row.category,
  scheduleType: row.schedule_type,
  frequency: row.frequency,
  lastCheck: row.last_check,
  nextCheck: row.next_check,
  dueDate: row.due_date,
  notes: row.notes ?? undefined,
  dueMileage: row.due_mileage,
  lastMileage: row.last_mileage,
  isCustom: row.is_custom,
  isArchived: row.is_archived,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapTaskToInsert = (task: Partial<MaintenanceTask> & Pick<MaintenanceTask, 'vehicleId' | 'description' | 'category' | 'scheduleType'>, userId: string) => ({
  vehicle_id: task.vehicleId,
  description: task.description.trim(),
  category: task.category,
  schedule_type: task.scheduleType,
  frequency: task.scheduleType === 'recurring' ? (task.frequency ?? 'monthly') : null,
  last_check: task.lastCheck ?? null,
  next_check: task.scheduleType === 'recurring' ? (task.nextCheck ?? null) : null,
  due_date: task.scheduleType === 'scheduled' ? (task.dueDate ?? null) : null,
  notes: task.notes?.trim() || null,
  due_mileage: task.dueMileage ?? null,
  last_mileage: task.lastMileage ?? null,
  is_custom: task.isCustom ?? true,
  is_archived: task.isArchived ?? false,
  created_by: userId
});

const mapTaskToUpdate = (task: MaintenanceTask) => ({
  description: task.description.trim(),
  category: task.category,
  schedule_type: task.scheduleType,
  frequency: task.scheduleType === 'recurring' ? task.frequency : null,
  last_check: task.lastCheck ?? null,
  next_check: task.scheduleType === 'recurring' ? (task.nextCheck ?? null) : null,
  due_date: task.scheduleType === 'scheduled' ? (task.dueDate ?? null) : null,
  notes: task.notes?.trim() || null,
  due_mileage: task.dueMileage ?? null,
  last_mileage: task.lastMileage ?? null,
  is_custom: task.isCustom,
  is_archived: task.isArchived
});

const requireUserId = async () => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error('Supabase authentication required.');

  return data.user.id;
};

const listTasks = async () => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('maintenance_tasks')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapRowToTask(row as MaintenanceTaskRow));
};

export const supabaseMaintenanceTasksRepository: MaintenanceTasksRepository = {
  async list() {
    return listTasks();
  },

  async replace(tasks) {
    const supabase = getSupabaseClient();
    const userId = await requireUserId();

    const groupedByVehicle = new Map<string, MaintenanceTask[]>();
    tasks.forEach((task) => {
      const group = groupedByVehicle.get(task.vehicleId) ?? [];
      group.push(task);
      groupedByVehicle.set(task.vehicleId, group);
    });

    for (const [vehicleId, vehicleTasks] of groupedByVehicle.entries()) {
      const { error: deleteError } = await supabase
        .from('maintenance_tasks')
        .delete()
        .eq('vehicle_id', vehicleId);

      if (deleteError) throw deleteError;

      if (vehicleTasks.length > 0) {
        const payload = vehicleTasks.map((task) => ({
          id: task.id,
          ...mapTaskToInsert(task, userId),
          is_custom: task.isCustom,
          is_archived: task.isArchived,
          created_at: task.createdAt,
          updated_at: task.updatedAt
        }));

        const { error: insertError } = await supabase
          .from('maintenance_tasks')
          .insert(payload);

        if (insertError) throw insertError;
      }
    }

    return listTasks();
  },

  async save(task) {
    const supabase = getSupabaseClient();
    const userId = await requireUserId();

    if (task.id) {
      const existingTasks = await listTasks();
      const exists = existingTasks.some((item) => item.id === task.id);

      if (exists) {
        const { error } = await supabase
          .from('maintenance_tasks')
          .update(mapTaskToUpdate({
            id: task.id,
            vehicleId: task.vehicleId,
            description: task.description,
            category: task.category,
            scheduleType: task.scheduleType,
            frequency: task.scheduleType === 'recurring' ? (task.frequency ?? 'monthly') : null,
            lastCheck: task.lastCheck ?? null,
            nextCheck: task.scheduleType === 'recurring' ? (task.nextCheck ?? null) : null,
            dueDate: task.scheduleType === 'scheduled' ? (task.dueDate ?? null) : null,
            notes: task.notes,
            dueMileage: task.dueMileage ?? null,
            lastMileage: task.lastMileage ?? null,
            isCustom: task.isCustom ?? true,
            isArchived: task.isArchived ?? false,
            createdAt: task.createdAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }))
          .eq('id', task.id);

        if (error) throw error;
        return listTasks();
      }

      const { error } = await supabase
        .from('maintenance_tasks')
        .insert({
          id: task.id,
          ...mapTaskToInsert(task, userId)
        });

      if (error) throw error;
      return listTasks();
    }

    const payload = mapTaskToInsert(task, userId);
    const { error } = await supabase
      .from('maintenance_tasks')
      .insert(payload);

    if (error) throw error;
    return listTasks();
  },

  async update(task) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('maintenance_tasks')
      .update(mapTaskToUpdate(task))
      .eq('id', task.id);

    if (error) throw error;
    return listTasks();
  },

  async archive(taskId) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('maintenance_tasks')
      .update({ is_archived: true })
      .eq('id', taskId)
      .eq('is_custom', false);

    if (error) throw error;
    return listTasks();
  },

  async restore(taskId) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('maintenance_tasks')
      .update({ is_archived: false })
      .eq('id', taskId)
      .eq('is_custom', false);

    if (error) throw error;
    return listTasks();
  },

  async remove(taskId) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('maintenance_tasks')
      .delete()
      .eq('id', taskId)
      .eq('is_custom', true);

    if (error) throw error;
    return listTasks();
  },

  async reset() {
    throw new Error('Reset is not available for Supabase-backed maintenance tasks.');
  }
};
