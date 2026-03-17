import { ref } from 'vue';
import { STORAGE_KEYS, STORAGE_VERSIONS } from '../constants/storage';
import type { MaintenanceLog } from '../types/maintenance';
import { DEFAULT_VEHICLE_ID } from './useVehicleProfile';
import { migrateLogsStorage } from '../utils/storageMigrations';
import { readRawStorage, writeStorageEnvelope } from '../utils/storage';

const logs = ref<MaintenanceLog[]>([]);
const isLogModalOpen = ref(false);
const isLoading = ref(false);
let initialized = false;

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

export function useMaintenanceLogs() {
  const saveLogs = () => {
    try {
      writeStorageEnvelope(STORAGE_KEYS.logs, STORAGE_VERSIONS.logs, logs.value);
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  };

  const loadLogs = () => {
    try {
      isLoading.value = true;
      const migrated = migrateLogsStorage(readRawStorage(STORAGE_KEYS.logs));
      const parsedLogs: Partial<MaintenanceLog>[] = migrated?.data ?? [];
      logs.value = sortLogsByDateDesc(parsedLogs.map(normalizeLog));
      saveLogs();
    } catch (error) {
      console.error('Error loading logs:', error);
      logs.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const replaceLogs = (items: MaintenanceLog[]) => {
    logs.value = sortLogsByDateDesc(items.map(normalizeLog));
    saveLogs();
  };

  const addLog = async (log: MaintenanceLog) => {
    try {
      isLoading.value = true;
      logs.value = sortLogsByDateDesc([normalizeLog(log), ...logs.value]);
      saveLogs();
    } catch (error) {
      console.error('Error adding log:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const clearLogs = async () => {
    if (!confirm('Möchten Sie wirklich alle Protokolle löschen?')) return;

    try {
      isLoading.value = true;
      logs.value = [];
      localStorage.removeItem(STORAGE_KEYS.logs);
    } catch (error) {
      console.error('Error clearing logs:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const openLogModal = () => {
    isLogModalOpen.value = true;
  };

  const closeLogModal = () => {
    isLogModalOpen.value = false;
  };

  if (!initialized) {
    loadLogs();
    initialized = true;
  }

  return {
    logs,
    isLogModalOpen,
    isLoading,
    addLog,
    clearLogs,
    replaceLogs,
    openLogModal,
    closeLogModal
  };
}
