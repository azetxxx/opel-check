<script setup lang="ts">
import type { AppPreferences, StartupModule } from '../types/preferences';

defineProps<{
  preferences: AppPreferences;
}>();

const emit = defineEmits<{
  (e: 'update:preferredStartupModule', value: StartupModule): void;
  (e: 'toggle-widget', key: keyof AppPreferences['homeWidgets'], value: boolean): void;
}>();

const startupOptions: { value: StartupModule; label: string }[] = [
  { value: 'home', label: 'Start' },
  { value: 'map', label: 'Ziele' },
  { value: 'maintenance', label: 'Wartung' },
  { value: 'music', label: 'Musik' },
  { value: 'settings', label: 'Einstellungen' }
];

const widgetLabels: Record<keyof AppPreferences['homeWidgets'], string> = {
  stats: 'Status-Kacheln',
  nextTask: 'Nächste Aufgabe',
  recentCompletions: 'Zuletzt erledigt',
  quickPlaces: 'Schnellziele',
  quickPlaylists: 'Musik-Shortcuts',
  modules: 'Modul-Kacheln'
};
</script>

<template>
  <section class="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6 space-y-5">
    <div class="flex items-center gap-3">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-900 shadow-sm">
        <span class="text-lg">🏠</span>
      </div>
      <p class="text-sm text-gray-600">Favoriten und sichtbare Widgets für die Startseite.</p>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Bevorzugtes Startmodul</label>
        <select
          :value="preferences.preferredStartupModule"
          @change="emit('update:preferredStartupModule', ($event.target as HTMLSelectElement).value as StartupModule)"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          <option v-for="option in startupOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>
    </div>

    <div>
      <p class="text-sm font-medium text-gray-700 mb-2">Widgets auf der Startseite</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
        <label v-for="(label, key) in widgetLabels" :key="key" class="flex items-center justify-between gap-3 rounded-[20px] bg-gray-50 px-4 py-3">
          <span>{{ label }}</span>
          <span class="relative inline-flex items-center">
            <input
              type="checkbox"
              :checked="preferences.homeWidgets[key]"
              @change="emit('toggle-widget', key, ($event.target as HTMLInputElement).checked)"
              class="peer sr-only"
            >
            <span class="h-7 w-12 rounded-full bg-gray-300 transition-colors peer-checked:bg-slate-900"></span>
            <span class="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5"></span>
          </span>
        </label>
      </div>
    </div>
  </section>
</template>
