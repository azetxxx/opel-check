import { computed, ref } from 'vue';
import type { VehicleProfile } from '../types/maintenance';

const STORAGE_KEY = 'maintenance-vehicles';
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

const vehicles = ref<VehicleProfile[]>([]);
const activeVehicleId = ref(DEFAULT_VEHICLE_ID);
let initialized = false;

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
    createdAt,
    updatedAt: vehicle.updatedAt ?? createdAt
  };
};

export function useVehicleProfile() {
  const loadVehicles = () => {
    try {
      const savedVehicles = localStorage.getItem(STORAGE_KEY);
      const parsedVehicles: Partial<VehicleProfile>[] = savedVehicles ? JSON.parse(savedVehicles) : [];

      vehicles.value = parsedVehicles.length > 0
        ? parsedVehicles.map(normalizeVehicle)
        : [createDefaultVehicleProfile()];

      if (!vehicles.value.some((vehicle) => vehicle.id === activeVehicleId.value)) {
        activeVehicleId.value = vehicles.value[0]?.id ?? DEFAULT_VEHICLE_ID;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles.value));
    } catch (error) {
      console.error('Error loading vehicles:', error);
      vehicles.value = [createDefaultVehicleProfile()];
      activeVehicleId.value = DEFAULT_VEHICLE_ID;
    }
  };

  const saveVehicles = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles.value));
    } catch (error) {
      console.error('Error saving vehicles:', error);
    }
  };

  const updateVehicle = (updatedVehicle: VehicleProfile) => {
    const index = vehicles.value.findIndex((vehicle) => vehicle.id === updatedVehicle.id);
    if (index !== -1) {
      vehicles.value[index] = {
        ...updatedVehicle,
        updatedAt: nowIso()
      };
      saveVehicles();
      return;
    }

    vehicles.value.push({
      ...updatedVehicle,
      updatedAt: nowIso()
    });
    saveVehicles();
  };

  const activeVehicle = computed(() => {
    return vehicles.value.find((vehicle) => vehicle.id === activeVehicleId.value)
      ?? vehicles.value[0]
      ?? createDefaultVehicleProfile();
  });

  if (!initialized) {
    loadVehicles();
    initialized = true;
  }

  return {
    vehicles,
    activeVehicle,
    activeVehicleId,
    updateVehicle
  };
}
