import type { Frequency, MaintenanceLog, MaintenanceTask, TaskScheduleType, VehicleProfile } from '../types/maintenance';

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isString = (value: unknown): value is string => typeof value === 'string';
const isOptionalString = (value: unknown) => value === undefined || value === null || typeof value === 'string';
const isOptionalNumber = (value: unknown) => value === undefined || value === null || typeof value === 'number';
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

const frequencyValues = new Set<Frequency>(['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual']);
const scheduleTypeValues = new Set<TaskScheduleType>(['recurring', 'scheduled']);

export const isFrequency = (value: unknown): value is Frequency => isString(value) && frequencyValues.has(value as Frequency);
export const isScheduleType = (value: unknown): value is TaskScheduleType => isString(value) && scheduleTypeValues.has(value as TaskScheduleType);

export const isVehicleProfile = (value: unknown): value is VehicleProfile => {
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

export const isMaintenanceTask = (value: unknown): value is MaintenanceTask => {
  if (!isObject(value)) return false;

  const validRecurring = value.scheduleType === 'recurring' && (value.frequency === null || isFrequency(value.frequency));
  const validScheduled = value.scheduleType === 'scheduled' && value.frequency === null;

  return isString(value.id)
    && isString(value.vehicleId)
    && isString(value.description)
    && isString(value.category)
    && isScheduleType(value.scheduleType)
    && (validRecurring || validScheduled)
    && (value.lastCheck === null || isString(value.lastCheck))
    && (value.nextCheck === null || isString(value.nextCheck))
    && isOptionalString(value.dueDate)
    && isOptionalString(value.notes)
    && isOptionalNumber(value.dueMileage)
    && isOptionalNumber(value.lastMileage)
    && isBoolean(value.isCustom)
    && isBoolean(value.isArchived)
    && isString(value.createdAt)
    && isString(value.updatedAt);
};

export const isMaintenanceLog = (value: unknown): value is MaintenanceLog => {
  if (!isObject(value)) return false;

  return isString(value.id)
    && isString(value.vehicleId)
    && isString(value.taskId)
    && isString(value.taskDescription)
    && isString(value.category)
    && (value.frequency === null || isFrequency(value.frequency))
    && isString(value.checkedAt)
    && (value.nextDueDate === null || isString(value.nextDueDate))
    && isOptionalString(value.notes)
    && isOptionalNumber(value.mileage)
    && isString(value.createdAt);
};
