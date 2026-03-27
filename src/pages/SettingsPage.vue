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
    <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
      <h2 class="text-xl font-semibold text-gray-900">Einstellungen</h2>
      <p class="text-sm text-gray-600">
        Fahrzeugprofil, Backup und spätere App-Einstellungen werden hier zentral verwaltet.
      </p>
    </section>

    <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
      <h3 class="text-lg font-semibold text-gray-900">Deep-Link / NFC vorbereiten</h3>
      <p class="text-sm text-gray-600">
        Diese URLs kannst du später in NFC-Tags, QR-Codes oder Shortcuts verwenden.
      </p>
      <div class="space-y-2 text-sm font-mono text-gray-700 bg-gray-50 rounded-xl p-4 overflow-auto">
        <div>/ ?module=map</div>
        <div>/ ?module=music</div>
        <div>/ ?module=maintenance&amp;action=create-task</div>
        <div>/map?action=navigate&amp;place=place-home</div>
        <div>/music?action=play&amp;shortcut=playlist-roadtrip</div>
      </div>
    </section>

    <VehicleProfileCard :vehicle="activeVehicle" @save="saveVehicleProfile" />
    <BackupPanel :is-importing="isImportingBackup" @export="exportBackup" @import-file="importBackup" />
  </section>
</template>
