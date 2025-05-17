import { ref } from 'vue';
import type { MaintenanceTask } from '../types/maintenance';

const STORAGE_KEY = 'maintenance-tasks';

// Initial test data
const initialTasks: MaintenanceTask[] = [
  // Wöchentlich
  {
    id: '1',
    description: 'Ölstand prüfen (Motoröl)',
    category: 'Motor',
    frequency: 'weekly',
    lastCheck: null,
    nextCheck: null
  },
  {
    id: '2',
    description: 'Scheibenwaschanlage prüfen und nachfüllen',
    category: 'Karosserie',
    frequency: 'weekly',
    lastCheck: null,
    nextCheck: null
  },
  {
    id: '3',
    description: 'Lichtfunktionen prüfen (Abblend-, Fernlicht, Bremslicht, Blinker)',
    category: 'Beleuchtung',
    frequency: 'weekly',
    lastCheck: null,
    nextCheck: null
  },

  // Monatlich
  {
    id: '4',
    description: 'Kühlflüssigkeit und Bremsflüssigkeit kontrollieren',
    category: 'Motor',
    frequency: 'monthly',
    lastCheck: null,
    nextCheck: null
  },
  {
    id: '5',
    description: 'Batterie prüfen (besonders im Winter)',
    category: 'Elektrik',
    frequency: 'monthly',
    lastCheck: null,
    nextCheck: null
  },
  {
    id: '6',
    description: 'Reifendruck kontrollieren und anpassen',
    category: 'Reifen',
    frequency: 'monthly',
    lastCheck: null,
    nextCheck: null
  },

  // Vierteljährlich
  {
    id: '7',
    description: 'Wischerblätter auf Schlierenbildung/Geräusche prüfen',
    category: 'Karosserie',
    frequency: 'quarterly',
    lastCheck: null,
    nextCheck: null
  },
  {
    id: '8',
    description: 'Reifenwechsel (Sommer/Winter)',
    category: 'Reifen',
    frequency: 'quarterly',
    lastCheck: null,
    nextCheck: null
  },
  {
    id: '9',
    description: 'TÜV/HU/AU Fälligkeit prüfen',
    category: 'Dokumente',
    frequency: 'quarterly',
    lastCheck: null,
    nextCheck: null
  },

  // Halbjährlich
  {
    id: '10',
    description: 'Unterbodenwäsche durchführen',
    category: 'Karosserie',
    frequency: 'biannual',
    lastCheck: null,
    nextCheck: null
  },
  {
    id: '11',
    description: 'Roststellen kontrollieren (Kanten/Radläufe)',
    category: 'Karosserie',
    frequency: 'biannual',
    lastCheck: null,
    nextCheck: null
  },

  // Jährlich
  {
    id: '12',
    description: 'Inspektion nach Herstellervorgabe',
    category: 'Service',
    frequency: 'annual',
    lastCheck: null,
    nextCheck: null
  },
  {
    id: '13',
    description: 'Klimaanlage prüfen und desinfizieren',
    category: 'Klimaanlage',
    frequency: 'annual',
    lastCheck: null,
    nextCheck: null
  },
  {
    id: '14',
    description: 'Innenraumfilter (Pollenfilter) wechseln',
    category: 'Klimaanlage',
    frequency: 'annual',
    lastCheck: null,
    nextCheck: null
  },
  {
    id: '15',
    description: 'Bremsen (Beläge und Scheiben) überprüfen',
    category: 'Bremsen',
    frequency: 'annual',
    lastCheck: null,
    nextCheck: null
  },
  {
    id: '16',
    description: 'ADAC-Mitgliedschaft prüfen',
    category: 'Dokumente',
    frequency: 'annual',
    lastCheck: null,
    nextCheck: null
  }
];

export function useMaintenanceData() {
  const maintenanceTasks = ref<MaintenanceTask[]>([]);

  const loadTasks = () => {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      maintenanceTasks.value = savedTasks ? JSON.parse(savedTasks) : [...initialTasks];
    } catch (error) {
      console.error('Error loading tasks:', error);
      maintenanceTasks.value = [...initialTasks];
    }
  };

  const saveTasks = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(maintenanceTasks.value));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const updateTask = (updatedTask: MaintenanceTask) => {
    const index = maintenanceTasks.value.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      maintenanceTasks.value[index] = updatedTask;
      saveTasks();
    }
  };

  const resetTasks = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      maintenanceTasks.value = [...initialTasks];
      saveTasks();
    } catch (error) {
      console.error('Error resetting tasks:', error);
      maintenanceTasks.value = [...initialTasks];
    }
  };

  // Load tasks when composable is created
  loadTasks();

  return {
    maintenanceTasks,
    updateTask,
    resetTasks
  };
}
