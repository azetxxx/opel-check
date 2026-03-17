import type { Frequency, MaintenanceTask, TaskStatus } from '../types/maintenance';

export const toDateInputValue = (date: Date) => date.toISOString().split('T')[0];

export const getCurrentDate = (simulatedDate?: string | null, useSimulatedDate = false) => {
  if (useSimulatedDate && simulatedDate) {
    return new Date(simulatedDate);
  }

  return new Date();
};

export const getNextCheckDate = (frequency: Frequency, baseDate: Date) => {
  const nextCheck = new Date(baseDate);

  switch (frequency) {
    case 'daily':
      nextCheck.setDate(nextCheck.getDate() + 1);
      break;
    case 'weekly':
      nextCheck.setDate(nextCheck.getDate() + 7);
      break;
    case 'monthly':
      nextCheck.setMonth(nextCheck.getMonth() + 1);
      break;
    case 'quarterly':
      nextCheck.setMonth(nextCheck.getMonth() + 3);
      break;
    case 'biannual':
      nextCheck.setMonth(nextCheck.getMonth() + 6);
      break;
    case 'annual':
      nextCheck.setFullYear(nextCheck.getFullYear() + 1);
      break;
  }

  return nextCheck;
};

export const getTaskStatus = (task: MaintenanceTask, currentDate: Date): TaskStatus => {
  if (!task.lastCheck) return 'pending';
  if (task.nextCheck && new Date(task.nextCheck) < currentDate) return 'overdue';
  return 'current';
};

export const isOverdue = (task: MaintenanceTask, currentDate: Date) => {
  return getTaskStatus(task, currentDate) === 'overdue';
};

export const formatDisplayDate = (dateString: string | null, locale = 'de-DE') => {
  if (!dateString) return null;

  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
