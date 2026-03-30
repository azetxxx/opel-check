import { storageProvider } from './provider';
import { localVehiclesRepository } from './localVehiclesRepository';
import { localMaintenanceTasksRepository } from './localMaintenanceTasksRepository';
import { localMaintenanceLogsRepository } from './localMaintenanceLogsRepository';
import { supabaseVehiclesRepository } from './supabaseVehiclesRepository';
import { supabaseMaintenanceTasksRepository } from './supabaseMaintenanceTasksRepository';
import { supabaseMaintenanceLogsRepository } from './supabaseMaintenanceLogsRepository';

export { storageProvider } from './provider';
export { DEFAULT_VEHICLE_ID, createDefaultVehicleProfile } from './localVehiclesRepository';

export const vehiclesRepository = storageProvider === 'supabase'
  ? supabaseVehiclesRepository
  : localVehiclesRepository;

export const maintenanceTasksRepository = storageProvider === 'supabase'
  ? supabaseMaintenanceTasksRepository
  : localMaintenanceTasksRepository;

export const maintenanceLogsRepository = storageProvider === 'supabase'
  ? supabaseMaintenanceLogsRepository
  : localMaintenanceLogsRepository;
