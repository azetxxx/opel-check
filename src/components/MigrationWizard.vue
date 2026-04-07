<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getLocalDataPreview, migrateLocalToCloud } from '../services/storage/migrationService';
import type { MigrationPreview, MigrationResult } from '../services/storage/migrationService';

const emit = defineEmits<{
  (e: 'done', result: MigrationResult | null): void;
}>();

type WizardStep = 'preview' | 'migrating' | 'success' | 'error';

const step = ref<WizardStep>('preview');
const preview = ref<MigrationPreview | null>(null);
const result = ref<MigrationResult | null>(null);
const errorMessage = ref('');

onMounted(async () => {
  preview.value = await getLocalDataPreview();
});

const startMigration = async () => {
  step.value = 'migrating';
  try {
    result.value = await migrateLocalToCloud();
    step.value = 'success';
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unbekannter Fehler';
    step.value = 'error';
  }
};

const close = () => emit('done', result.value);
const skip = () => emit('done', null);
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
    <div class="w-full max-w-md rounded-[28px] border border-gray-100 bg-white p-5 shadow-2xl space-y-4">

      <!-- Preview step -->
      <template v-if="step === 'preview' && preview">
        <div>
          <h3 class="text-xl font-semibold text-gray-900">Lokale Daten übernehmen?</h3>
          <p class="mt-1 text-sm text-gray-600">
            Du hast Daten auf diesem Gerät, die noch nicht in deinem Cloud-Konto gespeichert sind.
          </p>
        </div>

        <div class="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 space-y-1">
          <p v-if="preview.vehicles.length" class="text-sm text-blue-800">
            <span class="font-medium">{{ preview.vehicles.length }}</span> Fahrzeug{{ preview.vehicles.length > 1 ? 'e' : '' }}
          </p>
          <p v-if="preview.tasks.length" class="text-sm text-blue-800">
            <span class="font-medium">{{ preview.tasks.length }}</span> Wartungsaufgabe{{ preview.tasks.length > 1 ? 'n' : '' }}
          </p>
          <p v-if="preview.logs.length" class="text-sm text-blue-800">
            <span class="font-medium">{{ preview.logs.length }}</span> Wartungsprotokoll{{ preview.logs.length > 1 ? 'e' : '' }}
          </p>
          <p v-if="preview.places.length" class="text-sm text-blue-800">
            <span class="font-medium">{{ preview.places.length }}</span> Navigations-Ziel{{ preview.places.length > 1 ? 'e' : '' }}
          </p>
          <p v-if="preview.playlists.length" class="text-sm text-blue-800">
            <span class="font-medium">{{ preview.playlists.length }}</span> Playlist{{ preview.playlists.length > 1 ? 's' : '' }}
          </p>
        </div>

        <div class="flex gap-3 pt-1">
          <button
            @click="skip"
            type="button"
            class="flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Überspringen
          </button>
          <button
            @click="startMigration"
            type="button"
            class="flex min-h-11 flex-1 items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Daten übernehmen
          </button>
        </div>
      </template>

      <!-- Migrating step -->
      <template v-if="step === 'migrating'">
        <div class="flex flex-col items-center gap-3 py-6">
          <svg class="h-8 w-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p class="text-sm font-medium text-gray-700">Daten werden migriert…</p>
        </div>
      </template>

      <!-- Success step -->
      <template v-if="step === 'success' && result">
        <div>
          <h3 class="text-xl font-semibold text-gray-900">Migration abgeschlossen</h3>
          <p class="mt-1 text-sm text-gray-600">Deine Daten sind jetzt in der Cloud gespeichert.</p>
        </div>

        <div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 space-y-1">
          <p v-if="result.vehiclesMigrated" class="text-sm text-emerald-800">
            ✓ {{ result.vehiclesMigrated }} Fahrzeug{{ result.vehiclesMigrated > 1 ? 'e' : '' }}
          </p>
          <p v-if="result.tasksMigrated" class="text-sm text-emerald-800">
            ✓ {{ result.tasksMigrated }} Aufgabe{{ result.tasksMigrated > 1 ? 'n' : '' }}
          </p>
          <p v-if="result.logsMigrated" class="text-sm text-emerald-800">
            ✓ {{ result.logsMigrated }} Protokoll{{ result.logsMigrated > 1 ? 'e' : '' }}
          </p>
          <p v-if="result.placesMigrated" class="text-sm text-emerald-800">
            ✓ {{ result.placesMigrated }} Ziel{{ result.placesMigrated > 1 ? 'e' : '' }}
          </p>
          <p v-if="result.playlistsMigrated" class="text-sm text-emerald-800">
            ✓ {{ result.playlistsMigrated }} Playlist{{ result.playlistsMigrated > 1 ? 's' : '' }}
          </p>
        </div>

        <button
          @click="close"
          type="button"
          class="flex min-h-12 w-full items-center justify-center rounded-[20px] bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          Fertig
        </button>
      </template>

      <!-- Error step -->
      <template v-if="step === 'error'">
        <div>
          <h3 class="text-xl font-semibold text-gray-900">Migration fehlgeschlagen</h3>
          <p class="mt-1 text-sm text-gray-600">Ein Fehler ist aufgetreten. Deine lokalen Daten sind unverändert.</p>
        </div>

        <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>

        <div class="flex gap-3 pt-1">
          <button
            @click="close"
            type="button"
            class="flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Schließen
          </button>
          <button
            @click="startMigration"
            type="button"
            class="flex min-h-11 flex-1 items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Erneut versuchen
          </button>
        </div>
      </template>

    </div>
  </div>
</template>
