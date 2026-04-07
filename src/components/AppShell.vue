<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { HomeIcon, MapIcon, WrenchScrewdriverIcon, MusicalNoteIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import PwaInstallBanner from './PwaInstallBanner.vue';
import MigrationWizard from './MigrationWizard.vue';
import { useAuth } from '../composables/useAuth';
import { storageProvider } from '../services/storage';
import { hasLocalData, wasMigrated, restoreUserDataFromCloud } from '../services/storage/migrationService';
import type { MigrationResult } from '../services/storage/migrationService';

const route = useRoute();
const { isAuthenticated, isConfigured } = useAuth();

const isCloudEnabled = computed(() => storageProvider === 'supabase' && isConfigured.value && isAuthenticated.value);
const showMigrationWizard = ref(false);

watch(isCloudEnabled, async (enabled) => {
  if (!enabled) return;

  if (!wasMigrated() && await hasLocalData()) {
    showMigrationWizard.value = true;
    return;
  }

  // On a new device with an existing account, restore places/playlists from cloud
  try { await restoreUserDataFromCloud(); } catch { /* user_data table may not exist yet */ }
});

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
      <RouterView />
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
