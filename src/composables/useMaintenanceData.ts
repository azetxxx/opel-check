import { ref } from 'vue';
import type { MaintenanceTask, Frequency } from '../types/maintenance';

const STORAGE_KEY = 'maintenance-tasks';

// Initial test data
const initialTasks: MaintenanceTask[] = [
  {
    id: '1',
    description: 'Ölstand prüfen',
    category: 'Motor',
    frequency: 'weekly',
    lastCheck: null,
    nextCheck: null
  },
  {
    id: '2',
    description: 'Reifendruck kontrollieren',
    category: 'Reifen',
    frequency: 'monthly',
    lastCheck: null,
    nextCheck: null
  },
  {
    id: '3',
    description: 'Bremsflüssigkeit prüfen',
    category: 'Bremsen',
    frequency: 'quarterly',
    lastCheck: null,
    nextCheck: null
  },
  {
    id: '4',
    description: 'Scheibenwischer prüfen',
    category: 'Karosserie',
    frequency: 'monthly',
    lastCheck: null,
    nextCheck: null
  },
  {
    id: '5',
    description: 'Scheinwerfer kontrollieren',
    category: 'Beleuchtung',
    frequency: 'weekly',
    lastCheck: null,
    nextCheck: null
  }
];

export function useMaintenanceData() {
  const maintenanceTasks = ref<MaintenanceTask[]>([]);

  const loadTasks = () => {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    maintenanceTasks.value = savedTasks ? JSON.parse(savedTasks) : initialTasks;
  };

  const saveTasks = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(maintenanceTasks.value));
  };

  const updateTask = (updatedTask: MaintenanceTask) => {
    const index = maintenanceTasks.value.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      maintenanceTasks.value[index] = updatedTask;
      saveTasks();
    }
  };

  // Load tasks when composable is created
  loadTasks();

  return {
    maintenanceTasks,
    updateTask
  };
}
