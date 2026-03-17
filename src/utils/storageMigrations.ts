import { STORAGE_VERSIONS } from '../constants/storage';
import type { MaintenanceLog, MaintenanceTask, VehicleProfile } from '../types/maintenance';
import { isStorageEnvelope, type StorageEnvelope } from './storage';

const toEnvelope = <T>(version: number, data: T): StorageEnvelope<T> => ({
  version,
  savedAt: new Date().toISOString(),
  data
});

export const migrateTasksStorage = (raw: unknown): StorageEnvelope<Partial<MaintenanceTask>[]> | null => {
  if (!raw) return null;
  if (Array.isArray(raw)) return toEnvelope(STORAGE_VERSIONS.tasks, raw as Partial<MaintenanceTask>[]);
  if (isStorageEnvelope<Partial<MaintenanceTask>[]>(raw) && Array.isArray(raw.data)) {
    return { ...raw, version: STORAGE_VERSIONS.tasks };
  }
  return null;
};

export const migrateLogsStorage = (raw: unknown): StorageEnvelope<Partial<MaintenanceLog>[]> | null => {
  if (!raw) return null;
  if (Array.isArray(raw)) return toEnvelope(STORAGE_VERSIONS.logs, raw as Partial<MaintenanceLog>[]);
  if (isStorageEnvelope<Partial<MaintenanceLog>[]>(raw) && Array.isArray(raw.data)) {
    return { ...raw, version: STORAGE_VERSIONS.logs };
  }
  return null;
};

export const migrateVehiclesStorage = (raw: unknown): StorageEnvelope<Partial<VehicleProfile>[]> | null => {
  if (!raw) return null;
  if (Array.isArray(raw)) return toEnvelope(STORAGE_VERSIONS.vehicles, raw as Partial<VehicleProfile>[]);
  if (isStorageEnvelope<Partial<VehicleProfile>[]>(raw) && Array.isArray(raw.data)) {
    return { ...raw, version: STORAGE_VERSIONS.vehicles };
  }
  return null;
};
