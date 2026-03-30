import { ref } from 'vue';
import type { MaintenanceTask } from '../types/maintenance';
import { maintenanceTasksRepository } from '../services/storage';

const maintenanceTasks = ref<MaintenanceTask[]>([]);
let initialized = false;

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

  return {
    maintenanceTasks,
    updateTask,
    saveTask,
    archiveTask,
    restoreTask,
    replaceTasks,
    resetTasks,
    reloadTasks: loadTasks
  };
}
