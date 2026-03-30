import { computed, ref } from 'vue';
import type { VehicleProfile } from '../types/maintenance';
import { createDefaultVehicleProfile, DEFAULT_VEHICLE_ID, vehiclesRepository } from '../services/storage';

export { DEFAULT_VEHICLE_ID, createDefaultVehicleProfile } from '../services/storage';

const vehicles = ref<VehicleProfile[]>([]);
const activeVehicleId = ref(DEFAULT_VEHICLE_ID);
let initialized = false;

export function useVehicleProfile() {
  const loadVehicles = async () => {
    try {
      vehicles.value = await vehiclesRepository.list();

      if (!vehicles.value.some((vehicle) => vehicle.id === activeVehicleId.value)) {
        activeVehicleId.value = vehicles.value[0]?.id ?? DEFAULT_VEHICLE_ID;
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      vehicles.value = [createDefaultVehicleProfile()];
      activeVehicleId.value = DEFAULT_VEHICLE_ID;
    }
  };

  const replaceVehicles = (items: VehicleProfile[]) => {
    vehicles.value = items;
    if (!vehicles.value.some((vehicle) => vehicle.id === activeVehicleId.value)) {
      activeVehicleId.value = vehicles.value[0]?.id ?? DEFAULT_VEHICLE_ID;
    }
  };

  const updateVehicle = async (updatedVehicle: VehicleProfile) => {
    try {
      const nextVehicle = await vehiclesRepository.update(updatedVehicle);
      const index = vehicles.value.findIndex((vehicle) => vehicle.id === nextVehicle.id);

      if (index !== -1) {
        vehicles.value[index] = nextVehicle;
        return;
      }

      vehicles.value.push(nextVehicle);
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

  const setActiveVehicle = (vehicleId: string) => {
    if (vehicles.value.some((vehicle) => vehicle.id === vehicleId)) {
      activeVehicleId.value = vehicleId;
    }
  };

  const createVehicle = async (partial?: Partial<VehicleProfile>) => {
    try {
      const vehicle = await vehiclesRepository.create(partial);
      vehicles.value.push(vehicle);
      activeVehicleId.value = vehicle.id;
      return vehicle;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  };

  const deleteVehicle = async (vehicleId: string) => {
    try {
      const deleted = await vehiclesRepository.remove(vehicleId);
      if (!deleted) return false;

      const nextVehicles = vehicles.value.filter((vehicle) => vehicle.id !== vehicleId);
      vehicles.value = nextVehicles;

      if (activeVehicleId.value === vehicleId) {
        activeVehicleId.value = nextVehicles[0]?.id ?? DEFAULT_VEHICLE_ID;
      }

      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return false;
    }
  };

  const activeVehicle = computed(() => {
    return vehicles.value.find((vehicle) => vehicle.id === activeVehicleId.value)
      ?? vehicles.value[0]
      ?? createDefaultVehicleProfile();
  });

  if (!initialized) {
    void loadVehicles();
    initialized = true;
  }

  return {
    vehicles,
    activeVehicle,
    activeVehicleId,
    setActiveVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    replaceVehicles,
    reloadVehicles: loadVehicles
  };
}
