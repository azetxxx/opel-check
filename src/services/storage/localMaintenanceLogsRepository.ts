import { STORAGE_KEYS, STORAGE_VERSIONS } from '../../constants/storage';
import type { MaintenanceLog } from '../../types/maintenance';
import { migrateLogsStorage } from '../../utils/storageMigrations';
import { readRawStorage, writeStorageEnvelope } from '../../utils/storage';
import { DEFAULT_VEHICLE_ID } from './localVehiclesRepository';
import type { MaintenanceLogsRepository } from './types';

const nowIso = () => new Date().toISOString();

const normalizeLog = (log: Partial<MaintenanceLog>): MaintenanceLog => ({
  id: log.id ?? crypto.randomUUID(),
  vehicleId: log.vehicleId ?? DEFAULT_VEHICLE_ID,
  taskId: log.taskId ?? 'unknown-task',
  taskDescription: log.taskDescription ?? 'Unbekannte Wartung',
  category: log.category ?? 'Allgemein',
  frequency: log.frequency ?? null,
  checkedAt: log.checkedAt ?? nowIso(),
  nextDueDate: log.nextDueDate ?? null,
  notes: log.notes ?? '',
  mileage: log.mileage ?? null,
  createdAt: log.createdAt ?? log.checkedAt ?? nowIso()
});

const sortLogsByDateDesc = (items: MaintenanceLog[]) => {
  return [...items].sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
};

const readLogs = (): MaintenanceLog[] => {
  const migrated = migrateLogsStorage(readRawStorage(STORAGE_KEYS.logs));
  const parsedLogs: Partial<MaintenanceLog>[] = migrated?.data ?? [];
  return sortLogsByDateDesc(parsedLogs.map(normalizeLog));
};

const saveLogs = (logs: MaintenanceLog[]) => {
  writeStorageEnvelope(STORAGE_KEYS.logs, STORAGE_VERSIONS.logs, logs);
};

export const localMaintenanceLogsRepository: MaintenanceLogsRepository = {
  async list() {
    const logs = readLogs();
    saveLogs(logs);
    return logs;
  },

  async replace(items) {
    const logs = sortLogsByDateDesc(items.map(normalizeLog));
    saveLogs(logs);
    return logs;
  },

  async add(log) {
    const logs = readLogs();
    const next = sortLogsByDateDesc([normalizeLog(log), ...logs]);
    saveLogs(next);
    return next;
  },

  async clear() {
    localStorage.removeItem(STORAGE_KEYS.logs);
    return [];
  }
};
