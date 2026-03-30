import { ref } from 'vue';
import type { MaintenanceLog } from '../types/maintenance';
import { maintenanceLogsRepository } from '../services/storage';

const logs = ref<MaintenanceLog[]>([]);
const isLogModalOpen = ref(false);
const isLoading = ref(false);
let initialized = false;

export function useMaintenanceLogs() {
  const loadLogs = async () => {
    try {
      isLoading.value = true;
      logs.value = await maintenanceLogsRepository.list();
    } catch (error) {
      console.error('Error loading logs:', error);
      logs.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const replaceLogs = async (items: MaintenanceLog[]) => {
    try {
      logs.value = await maintenanceLogsRepository.replace(items);
    } catch (error) {
      console.error('Error replacing logs:', error);
    }
  };

  const addLog = async (log: MaintenanceLog) => {
    try {
      isLoading.value = true;
      logs.value = await maintenanceLogsRepository.add(log);
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
      logs.value = await maintenanceLogsRepository.clear();
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
    void loadLogs();
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
    closeLogModal,
    reloadLogs: loadLogs
  };
}
