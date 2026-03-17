import { FREQUENCY_ORDER } from '../constants/maintenance';
import type { Frequency, MaintenanceTask, TaskStatus } from '../types/maintenance';
import { getTaskStatus } from './maintenanceDates';

export type GroupStatus = TaskStatus;

export interface EnrichedMaintenanceTask extends MaintenanceTask {
  status: TaskStatus;
}

export const createEmptyTaskGroups = (): Record<Frequency, EnrichedMaintenanceTask[]> => ({
  daily: [],
  weekly: [],
  monthly: [],
  quarterly: [],
  biannual: [],
  annual: []
});

export const enrichTasks = (
  tasks: MaintenanceTask[],
  currentDate: Date
): EnrichedMaintenanceTask[] => {
  return tasks.map((task) => ({
    ...task,
    status: getTaskStatus(task, currentDate)
  }));
};

const statusPriority: Record<TaskStatus, number> = {
  overdue: 0,
  pending: 1,
  current: 2
};

export const sortTasksByUrgency = (tasks: EnrichedMaintenanceTask[]) => {
  return [...tasks].sort((a, b) => {
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;

    if (a.nextCheck && b.nextCheck) {
      return new Date(a.nextCheck).getTime() - new Date(b.nextCheck).getTime();
    }

    if (a.nextCheck && !b.nextCheck) return -1;
    if (!a.nextCheck && b.nextCheck) return 1;

    return Number(a.id) - Number(b.id);
  });
};

export const groupTasksByFrequency = (tasks: EnrichedMaintenanceTask[]) => {
  const groups = createEmptyTaskGroups();

  sortTasksByUrgency(tasks).forEach((task) => {
    groups[task.frequency].push(task);
  });

  return groups;
};

export const getGroupStatus = (tasks: EnrichedMaintenanceTask[]): GroupStatus => {
  if (tasks.some((task) => task.status === 'overdue')) return 'overdue';
  if (tasks.some((task) => task.status === 'pending')) return 'pending';
  return 'current';
};

export const buildDefaultCollapsedGroups = () => ({
  daily: false,
  weekly: false,
  monthly: false,
  quarterly: false,
  biannual: false,
  annual: false
});

export const getAutoCollapsedGroups = (
  groups: Record<Frequency, EnrichedMaintenanceTask[]>
): Record<Frequency, boolean> => {
  const collapsed = buildDefaultCollapsedGroups();

  FREQUENCY_ORDER.forEach((frequency) => {
    if (groups[frequency].length > 0) {
      collapsed[frequency] = getGroupStatus(groups[frequency]) === 'current';
    }
  });

  return collapsed;
};
