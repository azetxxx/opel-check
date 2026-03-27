<script setup lang="ts">
import BackupPanel from '../components/BackupPanel.vue';
import VehicleProfileCard from '../components/VehicleProfileCard.vue';
import { useMaintenanceData } from '../composables/useMaintenanceData';
import { useMaintenanceLogs } from '../composables/useMaintenanceLogs';
import { useVehicleProfile } from '../composables/useVehicleProfile';
import type { VehicleProfile } from '../types/maintenance';
import { createBackupPayload, downloadBackup, validateBackupPayload } from '../utils/backup';
import { ref } from 'vue';

const { maintenanceTasks, replaceTasks } = useMaintenanceData();
const { logs, replaceLogs } = useMaintenanceLogs();
const { vehicles, activeVehicle, updateVehicle, replaceVehicles } = useVehicleProfile();

const isImportingBackup = ref(false);

const saveVehicleProfile = (vehicle: VehicleProfile) => {
  updateVehicle(vehicle);
};

const exportBackup = () => {
  downloadBackup(createBackupPayload(vehicles.value, maintenanceTasks.value, logs.value));
};

const importBackup = async (file: File) => {
  try {
    isImportingBackup.value = true;
    const parsed = JSON.parse(await file.text()) as unknown;

    if (!validateBackupPayload(parsed)) {
      alert('Ungültiges Backup-Format. Bitte eine gültige Omiigo-Car-JSON-Datei wählen.');
      return;
    }

    replaceVehicles(parsed.vehicles);
    replaceTasks(parsed.tasks);
    replaceLogs(parsed.logs);
    alert('Backup erfolgreich importiert.');
  } catch (error) {
    console.error('Error importing backup:', error);
    alert('Backup konnte nicht importiert werden. Bitte JSON-Datei prüfen.');
  } finally {
    isImportingBackup.value = false;
  }
};
</script>

<template>
  <section class="space-y-6">
    <VehicleProfileCard :vehicle="activeVehicle" @save="saveVehicleProfile" />
    <BackupPanel :is-importing="isImportingBackup" @export="exportBackup" @import-file="importBackup" />
  </section>
</template>
