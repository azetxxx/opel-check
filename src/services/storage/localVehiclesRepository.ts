import type { VehicleProfile } from '../../types/maintenance';
import { STORAGE_KEYS, STORAGE_VERSIONS } from '../../constants/storage';
import { migrateVehiclesStorage } from '../../utils/storageMigrations';
import { readRawStorage, writeStorageEnvelope } from '../../utils/storage';
import type { VehiclesRepository } from './types';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** Accept legacy rows that fail strict schema checks (e.g. missing updatedAt) so migration never sees an empty list. */
const isVehicleLike = (value: unknown): value is Partial<VehicleProfile> =>
  isObject(value) && typeof value.id === 'string';

export const DEFAULT_VEHICLE_ID = 'default-vehicle';

const nowIso = () => new Date().toISOString();

export const createDefaultVehicleProfile = (): VehicleProfile => {
  const now = nowIso();

  return {
    id: DEFAULT_VEHICLE_ID,
    name: 'Mein Fahrzeug',
    brand: 'Opel',
    notes: 'Standardfahrzeug für die lokale Nutzung',
    currentMileage: null,
    createdAt: now,
    updatedAt: now
  };
};

const normalizeVehicle = (vehicle: Partial<VehicleProfile>): VehicleProfile => {
  const fallback = createDefaultVehicleProfile();
  const createdAt = vehicle.createdAt ?? fallback.createdAt;

  return {
    id: vehicle.id ?? fallback.id,
    name: vehicle.name ?? fallback.name,
    plate: vehicle.plate,
    brand: vehicle.brand ?? fallback.brand,
    model: vehicle.model,
    year: vehicle.year,
    vin: vehicle.vin,
    notes: vehicle.notes ?? fallback.notes,
    currentMileage: vehicle.currentMileage ?? null,
    symbol: vehicle.symbol ?? 'car',
    createdAt,
    updatedAt: vehicle.updatedAt ?? createdAt
  };
};

const readVehicleState = () => {
  const migrated = migrateVehiclesStorage(readRawStorage(STORAGE_KEYS.vehicles));
  const parsedVehicles: unknown[] = migrated?.data ?? [];
  const vehicles = parsedVehicles.filter(isVehicleLike).map((v) => normalizeVehicle(v));
  return { parsedVehicles, vehicles };
};

const readVehicles = (): VehicleProfile[] => readVehicleState().vehicles;

const saveVehicles = (vehicles: VehicleProfile[]) => {
  writeStorageEnvelope(STORAGE_KEYS.vehicles, STORAGE_VERSIONS.vehicles, vehicles);
};

export const localVehiclesRepository: VehiclesRepository = {
  async list() {
    const { parsedVehicles, vehicles } = readVehicleState();

    // Do not overwrite storage with [] when raw still has rows (corrupt shape); avoids wiping before cloud migration.
    if (vehicles.length === 0 && parsedVehicles.length > 0) {
      return [];
    }

    saveVehicles(vehicles);
    return vehicles;
  },

  async create(partial) {
    const vehicles = readVehicles();
    const now = nowIso();
    const base = createDefaultVehicleProfile();
    const vehicle = normalizeVehicle({
      ...base,
      ...partial,
      id: partial?.id ?? crypto.randomUUID(),
      name: partial?.name ?? `Fahrzeug ${vehicles.length + 1}`,
      createdAt: now,
      updatedAt: now
    });

    const next = [...vehicles, vehicle];
    saveVehicles(next);
    return vehicle;
  },

  async update(updatedVehicle) {
    const vehicles = readVehicles();
    const index = vehicles.findIndex((vehicle) => vehicle.id === updatedVehicle.id);
    const nextVehicle = { ...updatedVehicle, updatedAt: nowIso() };

    if (index !== -1) {
      vehicles[index] = nextVehicle;
    } else if (vehicles.length === 0) {
      throw new Error('Kein Fahrzeug zum Aktualisieren vorhanden.');
    } else {
      vehicles.push(nextVehicle);
    }

    saveVehicles(vehicles);
    return nextVehicle;
  },

  async remove(vehicleId) {
    const vehicles = readVehicles();
    const nextVehicles = vehicles.filter((vehicle) => vehicle.id !== vehicleId);
    if (nextVehicles.length === vehicles.length) return false;

    saveVehicles(nextVehicles);
    return true;
  }
};
