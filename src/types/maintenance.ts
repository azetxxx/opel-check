export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';

export interface MaintenanceTask {
  id: string;
  description: string;
  lastChecked: string | null;
  nextDueDate: string | null;
  frequency: Frequency;
}

export interface MaintenanceCategory {
  title: string;
  frequency: Frequency;
  tasks: MaintenanceTask[];
}

export interface MaintenanceLog {
  taskId: string;
  taskDescription: string;
  category: string;
  frequency: Frequency;
  checkedAt: string;
  nextDueDate: string;
}

export const frequencyToDays: Record<Frequency, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  biannual: 180,
  annual: 365
};
