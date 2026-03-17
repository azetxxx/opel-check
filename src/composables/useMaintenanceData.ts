import { ref } from 'vue';
import type { MaintenanceTask } from '../types/maintenance';
import { DEFAULT_VEHICLE_ID } from './useVehicleProfile';

const STORAGE_KEY = 'maintenance-tasks';

const nowIso = () => new Date().toISOString();

const createTask = (
  id: string,
  description: string,
  category: string,
  frequency: MaintenanceTask['frequency']
): MaintenanceTask => {
  const now = nowIso();

  return {
    id,
    vehicleId: DEFAULT_VEHICLE_ID,
    description,
    category,
    frequency,
    lastCheck: null,
    nextCheck: null,
    notes: '',
    dueMileage: null,
    lastMileage: null,
    createdAt: now,
    updatedAt: now
  };
};

const initialTasks: MaintenanceTask[] = [
  createTask('1', 'Ölstand prüfen (Motoröl)', 'Motor', 'weekly'),
  createTask('2', 'Scheibenwaschanlage prüfen und nachfüllen', 'Karosserie', 'weekly'),
  createTask('3', 'Lichtfunktionen prüfen (Abblend-, Fernlicht, Bremslicht, Blinker)', 'Beleuchtung', 'weekly'),
  createTask('4', 'Kühlflüssigkeit und Bremsflüssigkeit kontrollieren', 'Motor', 'monthly'),
  createTask('5', 'Batterie prüfen (besonders im Winter)', 'Elektrik', 'monthly'),
  createTask('6', 'Reifendruck kontrollieren und anpassen', 'Reifen', 'monthly'),
  createTask('7', 'Wischerblätter auf Schlierenbildung/Geräusche prüfen', 'Karosserie', 'quarterly'),
  createTask('8', 'Reifenwechsel (Sommer/Winter)', 'Reifen', 'quarterly'),
  createTask('9', 'TÜV/HU/AU Fälligkeit prüfen', 'Dokumente', 'quarterly'),
  createTask('10', 'Unterbodenwäsche durchführen', 'Karosserie', 'biannual'),
  createTask('11', 'Roststellen kontrollieren (Kanten/Radläufe)', 'Karosserie', 'biannual'),
  createTask('12', 'Inspektion nach Herstellervorgabe', 'Service', 'annual'),
  createTask('13', 'Klimaanlage prüfen und desinfizieren', 'Klimaanlage', 'annual'),
  createTask('14', 'Innenraumfilter (Pollenfilter) wechseln', 'Klimaanlage', 'annual'),
  createTask('15', 'Bremsen (Beläge und Scheiben) überprüfen', 'Bremsen', 'annual'),
  createTask('16', 'ADAC-Mitgliedschaft prüfen', 'Dokumente', 'annual')
];

const normalizeTask = (task: Partial<MaintenanceTask>): MaintenanceTask => {
  const now = nowIso();
  const createdAt = task.createdAt ?? task.lastCheck ?? now;

  return {
    id: task.id ?? crypto.randomUUID(),
    vehicleId: task.vehicleId ?? DEFAULT_VEHICLE_ID,
    description: task.description ?? 'Unbekannte Aufgabe',
    category: task.category ?? 'Allgemein',
    frequency: task.frequency ?? 'monthly',
    lastCheck: task.lastCheck ?? null,
    nextCheck: task.nextCheck ?? null,
    notes: task.notes ?? '',
    dueMileage: task.dueMileage ?? null,
    lastMileage: task.lastMileage ?? null,
    createdAt,
    updatedAt: task.updatedAt ?? createdAt
  };
};

export function useMaintenanceData() {
  const maintenanceTasks = ref<MaintenanceTask[]>([]);

  const loadTasks = () => {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      const parsedTasks: Partial<MaintenanceTask>[] = savedTasks ? JSON.parse(savedTasks) : initialTasks;
      maintenanceTasks.value = parsedTasks.map(normalizeTask);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(maintenanceTasks.value));
    } catch (error) {
      console.error('Error loading tasks:', error);
      maintenanceTasks.value = initialTasks.map(normalizeTask);
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
      maintenanceTasks.value[index] = {
        ...updatedTask,
        updatedAt: nowIso()
      };
      saveTasks();
    }
  };

  const resetTasks = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      maintenanceTasks.value = initialTasks.map(normalizeTask);
      saveTasks();
    } catch (error) {
      console.error('Error resetting tasks:', error);
      maintenanceTasks.value = initialTasks.map(normalizeTask);
    }
  };

  loadTasks();

  return {
    maintenanceTasks,
    updateTask,
    resetTasks
  };
}
