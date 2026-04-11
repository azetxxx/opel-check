<script setup lang="ts">
import { ref, watch } from 'vue';
import { HomeIcon, MapIcon, WrenchScrewdriverIcon, MusicalNoteIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import PwaInstallBanner from './PwaInstallBanner.vue';
import MigrationWizard from './MigrationWizard.vue';
import { useAuth } from '../composables/useAuth';
import { hasLocalData, wasMigrated, restoreUserDataFromCloud } from '../services/storage/migrationService';
import type { MigrationResult } from '../services/storage/migrationService';

const route = useRoute();
const { isAuthenticated, isConfigured, isLoading } = useAuth();

const showMigrationWizard = ref(false);

/**
 * Defer RouterView until cloud sidecar restore has run when needed.
 * Otherwise useSavedPlaces / usePlaylistShortcuts load empty storage first and
 * savePlaces() overwrites localStorage before restoreUserDataFromCloud() finishes
 * (or leaves in-memory refs empty after restore wrote storage).
 */
const mainContentReady = ref(!isConfigured.value);

watch([isConfigured, isAuthenticated, isLoading], async () => {
  if (!isConfigured.value) {
    showMigrationWizard.value = false;
    mainContentReady.value = true;
    return;
  }

  if (isLoading.value) {
    mainContentReady.value = false;
    return;
  }

  if (!isAuthenticated.value) {
    showMigrationWizard.value = false;
    mainContentReady.value = true;
    return;
  }

  mainContentReady.value = false;
  try {
    if (!wasMigrated() && (await hasLocalData())) {
      showMigrationWizard.value = true;
    } else {
      showMigrationWizard.value = false;
      await restoreUserDataFromCloud();
    }
  } catch {
    /* user_data table may not exist yet */
  } finally {
    mainContentReady.value = true;
  }
}, { immediate: true });

const handleMigrationDone = (_result: MigrationResult | null) => {
  showMigrationWizard.value = false;
  // Reload the current page so composables pick up the new data source
  window.location.reload();
};

const navItems = [
  { name: 'Start', to: '/', icon: HomeIcon },
  { name: 'Ziele', to: '/map', icon: MapIcon },
  { name: 'Wartung', to: '/maintenance', icon: WrenchScrewdriverIcon },
  { name: 'Musik', to: '/music', icon: MusicalNoteIcon },
  { name: 'Einstellungen', to: '/settings', icon: Cog6ToothIcon }
];
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
    <main class="max-w-7xl mx-auto px-4 py-4 pb-24 space-y-4 sm:py-6">
      <PwaInstallBanner />
      <div v-if="!mainContentReady && isConfigured" class="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
        Laden…
      </div>
      <template v-else>
        <RouterView />
      </template>
    </main>

    <MigrationWizard v-if="showMigrationWizard" @done="handleMigrationDone" />

    <nav class="fixed bottom-0 inset-x-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div class="max-w-7xl mx-auto grid grid-cols-5">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center justify-center gap-1 py-3 text-[11px] sm:text-xs font-medium transition-colors min-h-[68px]"
          :class="route.path === item.to ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
        >
          <component :is="item.icon" class="h-5 w-5" />
          <span>{{ item.name }}</span>
        </RouterLink>
      </div>
    </nav>
  </div>
</template>
