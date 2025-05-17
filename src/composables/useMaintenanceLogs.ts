import { ref } from 'vue';
import { collection, addDoc, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { MaintenanceLog } from '../types/maintenance';
import { db } from '../firebase/config';

// Create refs outside the function to share state across components
const logs = ref<MaintenanceLog[]>([]);
const isLogModalOpen = ref(false);
const isLoading = ref(false);

export function useMaintenanceLogs() {
  const addLog = async (log: MaintenanceLog) => {
    try {
      isLoading.value = true;
      // Add to Firestore
      await addDoc(collection(db, 'maintenance-logs'), {
        ...log,
        createdAt: new Date().toISOString()
      });
      // Refresh logs
      await loadLogs();
    } catch (error) {
      console.error('Error adding log:', error);
      // Fallback to localStorage if offline
      const currentLogs = JSON.parse(localStorage.getItem('maintenance-logs') || '[]');
      currentLogs.unshift(log);
      localStorage.setItem('maintenance-logs', JSON.stringify(currentLogs));
      logs.value = currentLogs;
    } finally {
      isLoading.value = false;
    }
  };

  const loadLogs = async () => {
    try {
      isLoading.value = true;
      const q = query(collection(db, 'maintenance-logs'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const loadedLogs: MaintenanceLog[] = [];
      querySnapshot.forEach((doc) => {
        loadedLogs.push(doc.data() as MaintenanceLog);
      });
      logs.value = loadedLogs;
      // Update localStorage as backup
      localStorage.setItem('maintenance-logs', JSON.stringify(loadedLogs));
    } catch (error) {
      console.error('Error loading logs:', error);
      // Fallback to localStorage if offline
      const savedLogs = localStorage.getItem('maintenance-logs');
      if (savedLogs) {
        logs.value = JSON.parse(savedLogs);
      }
    } finally {
      isLoading.value = false;
    }
  };

  const clearLogs = async () => {
    if (confirm('Möchten Sie wirklich alle Protokolle löschen?')) {
      try {
        isLoading.value = true;
        const querySnapshot = await getDocs(collection(db, 'maintenance-logs'));
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        logs.value = [];
        localStorage.removeItem('maintenance-logs');
      } catch (error) {
        console.error('Error clearing logs:', error);
      } finally {
        isLoading.value = false;
      }
    }
  };

  const openLogModal = () => {
    isLogModalOpen.value = true;
  };

  const closeLogModal = () => {
    isLogModalOpen.value = false;
  };

  // Load logs when the composable is used
  loadLogs();

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
