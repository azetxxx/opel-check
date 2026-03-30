import type { MaintenanceTasksRepository } from './types';

const notImplemented = () => {
  throw new Error('Supabase maintenance tasks repository is not implemented yet.');
};

export const supabaseMaintenanceTasksRepository: MaintenanceTasksRepository = {
  list: notImplemented,
  replace: notImplemented,
  save: notImplemented,
  update: notImplemented,
  archive: notImplemented,
  restore: notImplemented,
  reset: notImplemented
};
