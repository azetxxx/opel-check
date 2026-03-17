import { ref } from 'vue';
import { STORAGE_KEYS, STORAGE_VERSIONS } from '../constants/storage';
import type { MaintenanceTask, TaskScheduleType } from '../types/maintenance';
import { migrateTasksStorage } from '../utils/storageMigrations';
import { readRawStorage, writeStorageEnvelope } from '../utils/storage';
import { DEFAULT_VEHICLE_ID } from './useVehicleProfile';

const nowIso = () => new Date().toISOString();

const createBaseTask = (
  id: string,
  description: string,
  category: string,
  frequency: NonNullable<MaintenanceTask['frequency']>
): MaintenanceTask => {
  const now = nowIso();

  return {
    id,
    vehicleId: DEFAULT_VEHICLE_ID,
    description,
    category,
    scheduleType: 'recurring',
    frequency,
    lastCheck: null,
    nextCheck: null,
    dueDate: null,
    notes: '',
    dueMileage: null,
    lastMileage: null,
    isCustom: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now
  };
};

const initialTasks: MaintenanceTask[] = [
  createBaseTask('1', 'Ölstand prüfen (Motoröl)', 'Motor', 'weekly'),
  createBaseTask('2', 'Scheibenwaschanlage prüfen und nachfüllen', 'Karosserie', 'weekly'),
  createBaseTask('3', 'Lichtfunktionen prüfen (Abblend-, Fernlicht, Bremslicht, Blinker)', 'Beleuchtung', 'weekly'),
  createBaseTask('4', 'Kühlflüssigkeit und Bremsflüssigkeit kontrollieren', 'Motor', 'monthly'),
  createBaseTask('5', 'Batterie prüfen (besonders im Winter)', 'Elektrik', 'monthly'),
  createBaseTask('6', 'Reifendruck kontrollieren und anpassen', 'Reifen', 'monthly'),
  createBaseTask('7', 'Wischerblätter auf Schlierenbildung/Geräusche prüfen', 'Karosserie', 'quarterly'),
  createBaseTask('8', 'Reifenwechsel (Sommer/Winter)', 'Reifen', 'quarterly'),
  createBaseTask('9', 'TÜV/HU/AU Fälligkeit prüfen', 'Dokumente', 'quarterly'),
  createBaseTask('10', 'Unterbodenwäsche durchführen', 'Karosserie', 'biannual'),
  createBaseTask('11', 'Roststellen kontrollieren (Kanten/Radläufe)', 'Karosserie', 'biannual'),
  createBaseTask('12', 'Inspektion nach Herstellervorgabe', 'Service', 'annual'),
  createBaseTask('13', 'Klimaanlage prüfen und desinfizieren', 'Klimaanlage', 'annual'),
  createBaseTask('14', 'Innenraumfilter (Pollenfilter) wechseln', 'Klimaanlage', 'annual'),
  createBaseTask('15', 'Bremsen (Beläge und Scheiben) überprüfen', 'Bremsen', 'annual'),
  createBaseTask('16', 'ADAC-Mitgliedschaft prüfen', 'Dokumente', 'annual')
];

const getScheduleType = (task: Partial<MaintenanceTask>): TaskScheduleType => {
  if (task.scheduleType) return task.scheduleType;
  return task.dueDate ? 'scheduled' : 'recurring';
};

const normalizeTask = (task: Partial<MaintenanceTask>): MaintenanceTask => {
  const now = nowIso();
  const createdAt = task.createdAt ?? task.lastCheck ?? now;
  const scheduleType = getScheduleType(task);

  return {
    id: task.id ?? crypto.randomUUID(),
    vehicleId: task.vehicleId ?? DEFAULT_VEHICLE_ID,
    description: task.description ?? 'Unbekannte Aufgabe',
    category: task.category ?? 'Allgemein',
    scheduleType,
    frequency: scheduleType === 'recurring' ? (task.frequency ?? 'monthly') : null,
    lastCheck: task.lastCheck ?? null,
    nextCheck: scheduleType === 'recurring' ? (task.nextCheck ?? null) : null,
    dueDate: scheduleType === 'scheduled' ? (task.dueDate ?? null) : null,
    notes: task.notes ?? '',
    dueMileage: task.dueMileage ?? null,
    lastMileage: task.lastMileage ?? null,
    isCustom: task.isCustom ?? false,
    isArchived: task.isArchived ?? false,
    createdAt,
    updatedAt: task.updatedAt ?? createdAt
  };
};

export function useMaintenanceData() {
  const maintenanceTasks = ref<MaintenanceTask[]>([]);

  const saveTasks = () => {
    try {
      writeStorageEnvelope(STORAGE_KEYS.tasks, STORAGE_VERSIONS.tasks, maintenanceTasks.value);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const loadTasks = () => {
    try {
      const migrated = migrateTasksStorage(readRawStorage(STORAGE_KEYS.tasks));
      const parsedTasks: Partial<MaintenanceTask>[] = migrated?.data ?? initialTasks;
      maintenanceTasks.value = parsedTasks.map(normalizeTask);
      saveTasks();
    } catch (error) {
      console.error('Error loading tasks:', error);
      maintenanceTasks.value = initialTasks.map(normalizeTask);
      saveTasks();
    }
  };

  const updateTask = (updatedTask: MaintenanceTask) => {
    const index = maintenanceTasks.value.findIndex((task) => task.id === updatedTask.id);
    if (index !== -1) {
      maintenanceTasks.value[index] = { ...updatedTask, updatedAt: nowIso() };
      saveTasks();
    }
  };

  const replaceTasks = (tasks: MaintenanceTask[]) => {
    maintenanceTasks.value = tasks.map(normalizeTask);
    saveTasks();
  };

  const saveTask = (task: Partial<MaintenanceTask> & Pick<MaintenanceTask, 'vehicleId' | 'description' | 'category' | 'scheduleType'>) => {
    if (task.id) {
      const existingTask = maintenanceTasks.value.find((item) => item.id === task.id);
      if (existingTask) {
        updateTask(normalizeTask({ ...existingTask, ...task, id: existingTask.id, createdAt: existingTask.createdAt, updatedAt: nowIso() }));
        return;
      }
    }

    const newTask = normalizeTask({ ...task, id: crypto.randomUUID(), isCustom: true, isArchived: false, createdAt: nowIso(), updatedAt: nowIso() });
    maintenanceTasks.value.unshift(newTask);
    saveTasks();
  };

  const archiveTask = (taskId: string) => {
    const task = maintenanceTasks.value.find((item) => item.id === taskId);
    if (!task || !task.isCustom) return;
    updateTask({ ...task, isArchived: true });
  };

  const resetTasks = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.tasks);
      maintenanceTasks.value = initialTasks.map(normalizeTask);
      saveTasks();
    } catch (error) {
      console.error('Error resetting tasks:', error);
      maintenanceTasks.value = initialTasks.map(normalizeTask);
      saveTasks();
    }
  };

  loadTasks();

  return {
    maintenanceTasks,
    updateTask,
    saveTask,
    archiveTask,
    replaceTasks,
    resetTasks
  };
}
