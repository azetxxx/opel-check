import { ref } from 'vue';
import type { MaintenanceLog } from '../types/maintenance';

const LOGS_STORAGE_KEY = 'maintenance-logs';

export function useMaintenanceLogs() {
  const logs = ref<MaintenanceLog[]>([]);
  const isLogModalOpen = ref(false);

  const addLog = (log: MaintenanceLog) => {
    logs.value.unshift(log); // Add to beginning of array
    saveLogs();
  };

  const saveLogs = () => {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs.value));
  };

  const loadLogs = () => {
    const savedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
    if (savedLogs) {
      logs.value = JSON.parse(savedLogs);
    }
  };

  const clearLogs = () => {
    if (confirm('Möchten Sie wirklich alle Protokolle löschen?')) {
      logs.value = [];
      saveLogs();
    }
  };

  const openLogModal = () => {
    isLogModalOpen.value = true;
  };

  const closeLogModal = () => {
    isLogModalOpen.value = false;
  };

  // Load logs when composable is created
  loadLogs();

  return {
    logs,
    isLogModalOpen,
    addLog,
    clearLogs,
    openLogModal,
    closeLogModal
  };
}
