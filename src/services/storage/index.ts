import { storageProvider } from './provider';
import { localVehiclesRepository } from './localVehiclesRepository';
import { localMaintenanceTasksRepository } from './localMaintenanceTasksRepository';
import { localMaintenanceLogsRepository } from './localMaintenanceLogsRepository';
import { supabaseVehiclesRepository } from './supabaseVehiclesRepository';
import { supabaseMaintenanceTasksRepository } from './supabaseMaintenanceTasksRepository';
import { supabaseMaintenanceLogsRepository } from './supabaseMaintenanceLogsRepository';
import { isSupabaseConfigured, getSupabaseClient } from '../../lib/supabase';

export { storageProvider } from './provider';
export { DEFAULT_VEHICLE_ID, createDefaultVehicleProfile } from './localVehiclesRepository';

const shouldUseSupabase = async () => {
  if (storageProvider !== 'supabase' || !isSupabaseConfigured()) return false;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) return false;
    return Boolean(data.session?.user);
  } catch {
    return false;
  }
};

export const vehiclesRepository = {
  async list() {
    return (await shouldUseSupabase()) ? supabaseVehiclesRepository.list() : localVehiclesRepository.list();
  },
  async create(partial?: Parameters<typeof localVehiclesRepository.create>[0]) {
    return (await shouldUseSupabase()) ? supabaseVehiclesRepository.create(partial) : localVehiclesRepository.create(partial);
  },
  async update(vehicle: Parameters<typeof localVehiclesRepository.update>[0]) {
    return (await shouldUseSupabase()) ? supabaseVehiclesRepository.update(vehicle) : localVehiclesRepository.update(vehicle);
  },
  async remove(vehicleId: string) {
    return (await shouldUseSupabase()) ? supabaseVehiclesRepository.remove(vehicleId) : localVehiclesRepository.remove(vehicleId);
  }
};

export const maintenanceTasksRepository = {
  async list() {
    return (await shouldUseSupabase()) ? supabaseMaintenanceTasksRepository.list() : localMaintenanceTasksRepository.list();
  },
  async replace(tasks: Parameters<typeof localMaintenanceTasksRepository.replace>[0]) {
    return (await shouldUseSupabase()) ? supabaseMaintenanceTasksRepository.replace(tasks) : localMaintenanceTasksRepository.replace(tasks);
  },
  async save(task: Parameters<typeof localMaintenanceTasksRepository.save>[0]) {
    return (await shouldUseSupabase()) ? supabaseMaintenanceTasksRepository.save(task) : localMaintenanceTasksRepository.save(task);
  },
  async update(task: Parameters<typeof localMaintenanceTasksRepository.update>[0]) {
    return (await shouldUseSupabase()) ? supabaseMaintenanceTasksRepository.update(task) : localMaintenanceTasksRepository.update(task);
  },
  async archive(taskId: string) {
    return (await shouldUseSupabase()) ? supabaseMaintenanceTasksRepository.archive(taskId) : localMaintenanceTasksRepository.archive(taskId);
  },
  async restore(taskId: string) {
    return (await shouldUseSupabase()) ? supabaseMaintenanceTasksRepository.restore(taskId) : localMaintenanceTasksRepository.restore(taskId);
  },
  async remove(taskId: string) {
    return (await shouldUseSupabase()) ? supabaseMaintenanceTasksRepository.remove(taskId) : localMaintenanceTasksRepository.remove(taskId);
  },
  async reset() {
    return (await shouldUseSupabase()) ? supabaseMaintenanceTasksRepository.reset() : localMaintenanceTasksRepository.reset();
  }
};

export const maintenanceLogsRepository = {
  async list() {
    return (await shouldUseSupabase()) ? supabaseMaintenanceLogsRepository.list() : localMaintenanceLogsRepository.list();
  },
  async replace(items: Parameters<typeof localMaintenanceLogsRepository.replace>[0]) {
    return (await shouldUseSupabase()) ? supabaseMaintenanceLogsRepository.replace(items) : localMaintenanceLogsRepository.replace(items);
  },
  async add(log: Parameters<typeof localMaintenanceLogsRepository.add>[0]) {
    return (await shouldUseSupabase()) ? supabaseMaintenanceLogsRepository.add(log) : localMaintenanceLogsRepository.add(log);
  },
  async clear() {
    return (await shouldUseSupabase()) ? supabaseMaintenanceLogsRepository.clear() : localMaintenanceLogsRepository.clear();
  }
};
