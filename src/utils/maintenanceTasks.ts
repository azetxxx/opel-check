import { FREQUENCY_ORDER } from '../constants/maintenance';
import type { MaintenanceTask, TaskGroupKey, TaskStatus } from '../types/maintenance';
import { getTaskStatus } from './maintenanceDates';

export type GroupStatus = TaskStatus;

export interface EnrichedMaintenanceTask extends MaintenanceTask {
  status: TaskStatus;
}

export const createEmptyTaskGroups = (): Record<TaskGroupKey, EnrichedMaintenanceTask[]> => ({
  scheduled: [],
  daily: [],
  weekly: [],
  monthly: [],
  quarterly: [],
  biannual: [],
  annual: []
});

export const enrichTasks = (tasks: MaintenanceTask[], currentDate: Date): EnrichedMaintenanceTask[] => {
  return tasks.map((task) => ({
    ...task,
    status: getTaskStatus(task, currentDate)
  }));
};

const statusPriority: Record<TaskStatus, number> = {
  overdue: 0,
  dueNow: 1,
  dueSoon: 2,
  pending: 3,
  planned: 4,
  done: 5
};

const getSortDate = (task: EnrichedMaintenanceTask) => {
  return task.scheduleType === 'scheduled' ? task.dueDate ?? null : task.nextCheck ?? null;
};

export const sortTasksByUrgency = (tasks: EnrichedMaintenanceTask[]) => {
  return [...tasks].sort((a, b) => {
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;

    const aDate = getSortDate(a);
    const bDate = getSortDate(b);

    if (aDate && bDate) return new Date(aDate).getTime() - new Date(bDate).getTime();
    if (aDate && !bDate) return -1;
    if (!aDate && bDate) return 1;

    return Number(a.id) - Number(b.id);
  });
};

export const groupTasksByFrequency = (tasks: EnrichedMaintenanceTask[]) => {
  const groups = createEmptyTaskGroups();

  sortTasksByUrgency(tasks).forEach((task) => {
    const groupKey: TaskGroupKey = task.scheduleType === 'scheduled' ? 'scheduled' : (task.frequency ?? 'monthly');
    groups[groupKey].push(task);
  });

  return groups;
};

export const getGroupStatus = (tasks: EnrichedMaintenanceTask[]): GroupStatus => {
  if (tasks.some((task) => task.status === 'overdue')) return 'overdue';
  if (tasks.some((task) => task.status === 'dueNow')) return 'dueNow';
  if (tasks.some((task) => task.status === 'dueSoon')) return 'dueSoon';
  if (tasks.some((task) => task.status === 'pending')) return 'pending';
  if (tasks.some((task) => task.status === 'planned')) return 'planned';
  return 'done';
};

export const buildDefaultCollapsedGroups = (): Record<TaskGroupKey, boolean> => ({
  scheduled: false,
  daily: false,
  weekly: false,
  monthly: false,
  quarterly: false,
  biannual: false,
  annual: false
});

export const getAutoCollapsedGroups = (
  groups: Record<TaskGroupKey, EnrichedMaintenanceTask[]>
): Record<TaskGroupKey, boolean> => {
  const collapsed = buildDefaultCollapsedGroups();

  FREQUENCY_ORDER.forEach((frequency) => {
    if (groups[frequency].length > 0) {
      collapsed[frequency] = getGroupStatus(groups[frequency]) === 'done';
    }
  });

  return collapsed;
};
