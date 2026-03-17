import type { MaintenanceLog, MaintenanceTask, VehicleProfile } from '../types/maintenance';

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  vehicles: VehicleProfile[];
  tasks: MaintenanceTask[];
  logs: MaintenanceLog[];
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isString = (value: unknown): value is string => typeof value === 'string';
const isOptionalString = (value: unknown) => value === undefined || value === null || typeof value === 'string';
const isOptionalNumber = (value: unknown) => value === undefined || value === null || typeof value === 'number';

const frequencyValues = new Set(['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual']);
const isFrequency = (value: unknown): value is MaintenanceTask['frequency'] => isString(value) && frequencyValues.has(value);

const isVehicleProfile = (value: unknown): value is VehicleProfile => {
  if (!isObject(value)) return false;

  return isString(value.id)
    && isString(value.name)
    && isOptionalString(value.plate)
    && isOptionalString(value.brand)
    && isOptionalString(value.model)
    && (value.year === undefined || typeof value.year === 'number')
    && isOptionalString(value.vin)
    && isOptionalString(value.notes)
    && isOptionalNumber(value.currentMileage)
    && isString(value.createdAt)
    && isString(value.updatedAt);
};

const isMaintenanceTask = (value: unknown): value is MaintenanceTask => {
  if (!isObject(value)) return false;

  return isString(value.id)
    && isString(value.vehicleId)
    && isString(value.description)
    && isString(value.category)
    && isFrequency(value.frequency)
    && (value.lastCheck === null || isString(value.lastCheck))
    && (value.nextCheck === null || isString(value.nextCheck))
    && isOptionalString(value.notes)
    && isOptionalNumber(value.dueMileage)
    && isOptionalNumber(value.lastMileage)
    && typeof value.isCustom === 'boolean'
    && typeof value.isArchived === 'boolean'
    && isString(value.createdAt)
    && isString(value.updatedAt);
};

const isMaintenanceLog = (value: unknown): value is MaintenanceLog => {
  if (!isObject(value)) return false;

  return isString(value.id)
    && isString(value.vehicleId)
    && isString(value.taskId)
    && isString(value.taskDescription)
    && isString(value.category)
    && isFrequency(value.frequency)
    && isString(value.checkedAt)
    && isString(value.nextDueDate)
    && isOptionalString(value.notes)
    && isOptionalNumber(value.mileage)
    && isString(value.createdAt);
};

export const validateBackupPayload = (value: unknown): value is BackupPayload => {
  if (!isObject(value)) return false;

  return value.version === 1
    && isString(value.exportedAt)
    && Array.isArray(value.vehicles)
    && Array.isArray(value.tasks)
    && Array.isArray(value.logs)
    && value.vehicles.every(isVehicleProfile)
    && value.tasks.every(isMaintenanceTask)
    && value.logs.every(isMaintenanceLog);
};

export const createBackupPayload = (
  vehicles: VehicleProfile[],
  tasks: MaintenanceTask[],
  logs: MaintenanceLog[]
): BackupPayload => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  vehicles,
  tasks,
  logs
});

export const downloadBackup = (payload: BackupPayload) => {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const timestamp = payload.exportedAt.replace(/[:.]/g, '-');

  anchor.href = url;
  anchor.download = `omiigo-car-backup-${timestamp}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
