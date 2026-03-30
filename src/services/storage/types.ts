import type { MaintenanceLog, MaintenanceTask, VehicleProfile } from '../../types/maintenance';

export type StorageProvider = 'local' | 'supabase';

export interface VehiclesRepository {
  list(): Promise<VehicleProfile[]>;
  create(partial?: Partial<VehicleProfile>): Promise<VehicleProfile>;
  update(vehicle: VehicleProfile): Promise<VehicleProfile>;
  remove(vehicleId: string): Promise<boolean>;
}

export interface MaintenanceTasksRepository {
  list(): Promise<MaintenanceTask[]>;
  replace(tasks: MaintenanceTask[]): Promise<MaintenanceTask[]>;
  save(task: Partial<MaintenanceTask> & Pick<MaintenanceTask, 'vehicleId' | 'description' | 'category' | 'scheduleType'>): Promise<MaintenanceTask[]>;
  update(task: MaintenanceTask): Promise<MaintenanceTask[]>;
  archive(taskId: string): Promise<MaintenanceTask[]>;
  restore(taskId: string): Promise<MaintenanceTask[]>;
  reset(): Promise<MaintenanceTask[]>;
}

export interface MaintenanceLogsRepository {
  list(): Promise<MaintenanceLog[]>;
  replace(items: MaintenanceLog[]): Promise<MaintenanceLog[]>;
  add(log: MaintenanceLog): Promise<MaintenanceLog[]>;
  clear(): Promise<MaintenanceLog[]>;
}
