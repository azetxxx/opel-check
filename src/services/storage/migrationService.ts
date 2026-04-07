import { STORAGE_KEYS } from '../../constants/storage';
import type { MaintenanceLog, MaintenanceTask, VehicleProfile } from '../../types/maintenance';
import type { SavedPlace } from '../../types/map';
import type { PlaylistShortcut } from '../../types/music';
import { readRawStorage, writeStorageEnvelope } from '../../utils/storage';
import { localVehiclesRepository } from './localVehiclesRepository';
import { localMaintenanceTasksRepository } from './localMaintenanceTasksRepository';
import { localMaintenanceLogsRepository } from './localMaintenanceLogsRepository';
import { supabaseVehiclesRepository } from './supabaseVehiclesRepository';
import { supabaseMaintenanceTasksRepository } from './supabaseMaintenanceTasksRepository';
import { supabaseMaintenanceLogsRepository } from './supabaseMaintenanceLogsRepository';
import { supabaseUserDataRepository } from './supabaseUserDataRepository';

const MIGRATION_FLAG = 'local-to-cloud-migrated';
const PLACES_KEY = 'saved-places';
const PLAYLISTS_KEY = 'playlist-shortcuts';

export interface MigrationPreview {
  vehicles: VehicleProfile[];
  tasks: MaintenanceTask[];
  logs: MaintenanceLog[];
  places: SavedPlace[];
  playlists: PlaylistShortcut[];
}

export interface MigrationResult {
  vehiclesMigrated: number;
  tasksMigrated: number;
  logsMigrated: number;
  placesMigrated: number;
  playlistsMigrated: number;
}

const readLocalArray = <T>(key: string): T[] => {
  const raw = readRawStorage(key);
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as any).data)) {
    return (raw as any).data as T[];
  }
  if (Array.isArray(raw)) return raw as T[];
  return [];
};

export const hasLocalData = async (): Promise<boolean> => {
  const vehicles = await localVehiclesRepository.list();
  const tasks = await localMaintenanceTasksRepository.list();
  const places = readLocalArray<SavedPlace>(PLACES_KEY);
  const playlists = readLocalArray<PlaylistShortcut>(PLAYLISTS_KEY);
  return vehicles.length > 0 || tasks.length > 0 || places.length > 0 || playlists.length > 0;
};

export const wasMigrated = (): boolean => {
  return localStorage.getItem(MIGRATION_FLAG) === 'true';
};

export const getLocalDataPreview = async (): Promise<MigrationPreview> => {
  const [vehicles, tasks, logs] = await Promise.all([
    localVehiclesRepository.list(),
    localMaintenanceTasksRepository.list(),
    localMaintenanceLogsRepository.list()
  ]);
  const places = readLocalArray<SavedPlace>(PLACES_KEY);
  const playlists = readLocalArray<PlaylistShortcut>(PLAYLISTS_KEY);
  return { vehicles, tasks, logs, places, playlists };
};

export const migrateLocalToCloud = async (): Promise<MigrationResult> => {
  const { vehicles, tasks, logs, places, playlists } = await getLocalDataPreview();

  if (vehicles.length === 0 && tasks.length === 0 && places.length === 0 && playlists.length === 0) {
    throw new Error('Keine lokalen Daten zum Migrieren gefunden.');
  }

  // Vehicle ID mapping: local ID → Supabase ID
  const vehicleIdMap = new Map<string, string>();

  for (const vehicle of vehicles) {
    const created = await supabaseVehiclesRepository.create({
      name: vehicle.name,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin,
      notes: vehicle.notes,
      currentMileage: vehicle.currentMileage,
      symbol: vehicle.symbol
    });
    vehicleIdMap.set(vehicle.id, created.id);
  }

  // Remap vehicleId in tasks and insert
  const remappedTasks = tasks.map((task) => ({
    ...task,
    vehicleId: vehicleIdMap.get(task.vehicleId) ?? task.vehicleId
  }));

  if (remappedTasks.length > 0) {
    await supabaseMaintenanceTasksRepository.replace(remappedTasks);
  }

  // Remap vehicleId in logs and insert
  const remappedLogs = logs.map((log) => ({
    ...log,
    vehicleId: vehicleIdMap.get(log.vehicleId) ?? log.vehicleId
  }));

  if (remappedLogs.length > 0) {
    await supabaseMaintenanceLogsRepository.replace(remappedLogs);
  }

  // Upload places and playlists as user-level data
  if (places.length > 0) {
    await supabaseUserDataRepository.set(PLACES_KEY, places);
  }
  if (playlists.length > 0) {
    await supabaseUserDataRepository.set(PLAYLISTS_KEY, playlists);
  }

  // Clear local storage
  localStorage.removeItem(STORAGE_KEYS.vehicles);
  localStorage.removeItem(STORAGE_KEYS.tasks);
  localStorage.removeItem(STORAGE_KEYS.logs);
  localStorage.removeItem(PLACES_KEY);
  localStorage.removeItem(PLAYLISTS_KEY);
  localStorage.setItem(MIGRATION_FLAG, 'true');

  return {
    vehiclesMigrated: vehicles.length,
    tasksMigrated: remappedTasks.length,
    logsMigrated: remappedLogs.length,
    placesMigrated: places.length,
    playlistsMigrated: playlists.length
  };
};

/**
 * After sign-in on a new device, restore places and playlists from cloud
 * to localStorage so the existing composables pick them up.
 */
export const restoreUserDataFromCloud = async (): Promise<void> => {
  const localPlaces = readLocalArray<SavedPlace>(PLACES_KEY);
  const localPlaylists = readLocalArray<PlaylistShortcut>(PLAYLISTS_KEY);

  if (localPlaces.length === 0) {
    const cloudPlaces = await supabaseUserDataRepository.get<SavedPlace[]>(PLACES_KEY);
    if (cloudPlaces && cloudPlaces.length > 0) {
      writeStorageEnvelope(PLACES_KEY, 1, cloudPlaces);
    }
  }

  if (localPlaylists.length === 0) {
    const cloudPlaylists = await supabaseUserDataRepository.get<PlaylistShortcut[]>(PLAYLISTS_KEY);
    if (cloudPlaylists && cloudPlaylists.length > 0) {
      writeStorageEnvelope(PLAYLISTS_KEY, 1, cloudPlaylists);
    }
  }
};
