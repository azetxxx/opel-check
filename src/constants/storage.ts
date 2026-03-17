export const STORAGE_KEYS = {
  tasks: 'maintenance-tasks',
  logs: 'maintenance-logs',
  vehicles: 'maintenance-vehicles'
} as const;

export const STORAGE_VERSIONS = {
  tasks: 1,
  logs: 1,
  vehicles: 1
} as const;
