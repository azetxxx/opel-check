import type { MaintenanceLogsRepository } from './types';

const notImplemented = () => {
  throw new Error('Supabase maintenance logs repository is not implemented yet.');
};

export const supabaseMaintenanceLogsRepository: MaintenanceLogsRepository = {
  list: notImplemented,
  replace: notImplemented,
  add: notImplemented,
  clear: notImplemented
};
