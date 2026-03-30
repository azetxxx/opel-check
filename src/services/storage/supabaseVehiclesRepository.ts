import type { VehiclesRepository } from './types';

const notImplemented = () => {
  throw new Error('Supabase vehicles repository is not implemented yet.');
};

export const supabaseVehiclesRepository: VehiclesRepository = {
  list: notImplemented,
  create: notImplemented,
  update: notImplemented,
  remove: notImplemented
};
