export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';
export type TaskGroupKey = Frequency | 'scheduled';
export type TaskScheduleType = 'recurring' | 'scheduled';
export type TaskStatus = 'pending' | 'dueSoon' | 'current' | 'overdue';

export interface VehicleProfile {
  id: string;
  name: string;
  plate?: string;
  brand?: string;
  model?: string;
  year?: number;
  vin?: string;
  notes?: string;
  currentMileage?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceTask {
  id: string;
  vehicleId: string;
  description: string;
  category: string;
  scheduleType: TaskScheduleType;
  frequency: Frequency | null;
  lastCheck: string | null;
  nextCheck: string | null;
  dueDate?: string | null;
  notes?: string;
  dueMileage?: number | null;
  lastMileage?: number | null;
  isCustom: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceCategory {
  title: string;
  frequency: Frequency;
  tasks: MaintenanceTask[];
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  taskId: string;
  taskDescription: string;
  category: string;
  frequency: Frequency | null;
  checkedAt: string;
  nextDueDate: string | null;
  notes?: string;
  mileage?: number | null;
  createdAt: string;
}

export const frequencyToDays: Record<Frequency, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  biannual: 180,
  annual: 365
};
