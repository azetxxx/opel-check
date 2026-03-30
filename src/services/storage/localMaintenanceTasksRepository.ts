import { STORAGE_KEYS, STORAGE_VERSIONS } from '../../constants/storage';
import type { MaintenanceTask, TaskScheduleType } from '../../types/maintenance';
import { migrateTasksStorage } from '../../utils/storageMigrations';
import { readRawStorage, writeStorageEnvelope } from '../../utils/storage';
import { DEFAULT_VEHICLE_ID } from './localVehiclesRepository';
import type { MaintenanceTasksRepository } from './types';

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

const readTasks = (): MaintenanceTask[] => {
  const migrated = migrateTasksStorage(readRawStorage(STORAGE_KEYS.tasks));
  const parsedTasks: Partial<MaintenanceTask>[] = migrated?.data ?? initialTasks;
  return parsedTasks.map(normalizeTask);
};

const saveTasks = (tasks: MaintenanceTask[]) => {
  writeStorageEnvelope(STORAGE_KEYS.tasks, STORAGE_VERSIONS.tasks, tasks);
};

export const localMaintenanceTasksRepository: MaintenanceTasksRepository = {
  async list() {
    const tasks = readTasks();
    saveTasks(tasks);
    return tasks;
  },

  async replace(tasks) {
    const normalized = tasks.map(normalizeTask);
    saveTasks(normalized);
    return normalized;
  },

  async update(updatedTask) {
    const tasks = readTasks();
    const index = tasks.findIndex((task) => task.id === updatedTask.id);

    if (index !== -1) {
      tasks[index] = { ...updatedTask, updatedAt: nowIso() };
      saveTasks(tasks);
    }

    return tasks;
  },

  async save(task) {
    const tasks = readTasks();

    if (task.id) {
      const existingTask = tasks.find((item) => item.id === task.id);
      if (existingTask) {
        const updated = normalizeTask({ ...existingTask, ...task, id: existingTask.id, createdAt: existingTask.createdAt, updatedAt: nowIso() });
        const index = tasks.findIndex((item) => item.id === existingTask.id);
        tasks[index] = updated;
        saveTasks(tasks);
        return tasks;
      }
    }

    const newTask = normalizeTask({ ...task, id: crypto.randomUUID(), isCustom: true, isArchived: false, createdAt: nowIso(), updatedAt: nowIso() });
    tasks.unshift(newTask);
    saveTasks(tasks);
    return tasks;
  },

  async archive(taskId) {
    const tasks = readTasks();
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return tasks;

    const index = tasks.findIndex((item) => item.id === taskId);
    tasks[index] = { ...task, isArchived: true, updatedAt: nowIso() };
    saveTasks(tasks);
    return tasks;
  },

  async restore(taskId) {
    const tasks = readTasks();
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return tasks;

    const index = tasks.findIndex((item) => item.id === taskId);
    tasks[index] = { ...task, isArchived: false, updatedAt: nowIso() };
    saveTasks(tasks);
    return tasks;
  },

  async reset() {
    localStorage.removeItem(STORAGE_KEYS.tasks);
    const tasks = initialTasks.map(normalizeTask);
    saveTasks(tasks);
    return tasks;
  }
};
