import { ref } from 'vue';
import type { MaintenanceLog } from '../types/maintenance';

const STORAGE_KEY = 'maintenance-logs';

// Shared state across components
const logs = ref<MaintenanceLog[]>([]);
const isLogModalOpen = ref(false);
const isLoading = ref(false);
let initialized = false;

const sortLogsByDateDesc = (items: MaintenanceLog[]) => {
  return [...items].sort(
    (a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
  );
};

export function useMaintenanceLogs() {
  const loadLogs = () => {
    try {
      isLoading.value = true;
      const savedLogs = localStorage.getItem(STORAGE_KEY);
      const parsedLogs: MaintenanceLog[] = savedLogs ? JSON.parse(savedLogs) : [];
      logs.value = sortLogsByDateDesc(parsedLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
      logs.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const saveLogs = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.value));
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  };

  const addLog = async (log: MaintenanceLog) => {
    try {
      isLoading.value = true;
      logs.value = sortLogsByDateDesc([log, ...logs.value]);
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
      localStorage.removeItem(STORAGE_KEY);
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
    openLogModal,
    closeLogModal
  };
}
