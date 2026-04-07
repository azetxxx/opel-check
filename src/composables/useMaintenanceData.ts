import { ref, watch } from 'vue';
import { BUILT_IN_MAINTENANCE_TASKS } from '../constants/builtInMaintenanceTasks';
import type { MaintenanceTask } from '../types/maintenance';
import { maintenanceTasksRepository } from '../services/storage';

const TASK_CACHE = 'overdue-check-data';
const TASK_CACHE_KEY = '/task-snapshot.json';

const mirrorTasksToCache = async (tasks: MaintenanceTask[]) => {
  try {
    const snapshot = tasks.map((t) => ({
      description: t.description,
      scheduleType: t.scheduleType,
      nextCheck: t.nextCheck,
      dueDate: t.dueDate,
      isArchived: t.isArchived,
      vehicleId: t.vehicleId
    }));
    const cache = await caches.open(TASK_CACHE);
    await cache.put(
      TASK_CACHE_KEY,
      new Response(JSON.stringify({ tasks: snapshot, updatedAt: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
  } catch {
    // Cache API unavailable (e.g. private browsing) — silently skip
  }
};

const maintenanceTasks = ref<MaintenanceTask[]>([]);
let initialized = false;
let mirrorSetup = false;

const ensureBuiltInTasksForVehicle = async (vehicleId: string, options?: { includeArchived?: boolean }) => {
  const currentTasks = maintenanceTasks.value.filter((task) => task.vehicleId === vehicleId);
  const includeArchived = options?.includeArchived ?? true;

  for (const definition of BUILT_IN_MAINTENANCE_TASKS) {
    const exists = currentTasks.some((task) => {
      if (task.isCustom) return false;
      if (task.description !== definition.description) return false;
      if (!includeArchived && task.isArchived) return false;
      return true;
    });

    if (!exists) {
      maintenanceTasks.value = await maintenanceTasksRepository.save({
        vehicleId,
        description: definition.description,
        category: definition.category,
        scheduleType: 'recurring',
        frequency: definition.frequency,
        isCustom: false,
        isArchived: false,
        notes: ''
      });
    }
  }
};

export function useMaintenanceData() {
  const loadTasks = async () => {
    try {
      maintenanceTasks.value = await maintenanceTasksRepository.list();
    } catch (error) {
      console.error('Error loading tasks:', error);
      maintenanceTasks.value = [];
    }
  };

  const updateTask = async (updatedTask: MaintenanceTask) => {
    try {
      maintenanceTasks.value = await maintenanceTasksRepository.update(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const replaceTasks = async (tasks: MaintenanceTask[]) => {
    try {
      maintenanceTasks.value = await maintenanceTasksRepository.replace(tasks);
    } catch (error) {
      console.error('Error replacing tasks:', error);
    }
  };

  const saveTask = async (task: Partial<MaintenanceTask> & Pick<MaintenanceTask, 'vehicleId' | 'description' | 'category' | 'scheduleType'>) => {
    try {
      maintenanceTasks.value = await maintenanceTasksRepository.save(task);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const archiveTask = async (taskId: string) => {
    try {
      maintenanceTasks.value = await maintenanceTasksRepository.archive(taskId);
    } catch (error) {
      console.error('Error archiving task:', error);
    }
  };

  const restoreTask = async (taskId: string) => {
    try {
      maintenanceTasks.value = await maintenanceTasksRepository.restore(taskId);
    } catch (error) {
      console.error('Error restoring task:', error);
    }
  };

  const removeTask = async (taskId: string) => {
    try {
      maintenanceTasks.value = await maintenanceTasksRepository.remove(taskId);
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  const resetTasks = async () => {
    try {
      maintenanceTasks.value = await maintenanceTasksRepository.reset();
    } catch (error) {
      console.error('Error resetting tasks:', error);
    }
  };

  if (!initialized) {
    void loadTasks();
    initialized = true;
  }

  if (!mirrorSetup) {
    watch(maintenanceTasks, (tasks) => void mirrorTasksToCache(tasks), { deep: true });
    mirrorSetup = true;
  }

  return {
    maintenanceTasks,
    updateTask,
    saveTask,
    archiveTask,
    restoreTask,
    removeTask,
    replaceTasks,
    resetTasks,
    reloadTasks: loadTasks,
    ensureBuiltInTasksForVehicle
  };
}
