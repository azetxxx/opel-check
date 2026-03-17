import type { Frequency, MaintenanceTask, TaskStatus } from '../types/maintenance';

const DUE_SOON_DAYS = 7;

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

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getReferenceDate = (task: MaintenanceTask) => {
  if (task.scheduleType === 'scheduled') return task.dueDate ?? null;
  return task.nextCheck ?? null;
};

export const getTaskStatus = (task: MaintenanceTask, currentDate: Date): TaskStatus => {
  const referenceDate = getReferenceDate(task);

  if (!referenceDate) {
    return task.lastCheck ? 'current' : 'pending';
  }

  const current = startOfDay(currentDate).getTime();
  const target = startOfDay(new Date(referenceDate)).getTime();
  const diffDays = Math.ceil((target - current) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= DUE_SOON_DAYS) return 'dueSoon';
  return 'current';
};

export const formatDisplayDate = (dateString: string | null, locale = 'de-DE') => {
  if (!dateString) return null;

  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
