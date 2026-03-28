<script setup lang="ts">
import type { NavigationProvider } from '../types/map';
import type { MusicProvider } from '../types/music';
import type { AppPreferences, StartupModule } from '../types/preferences';

defineProps<{
  preferences: AppPreferences;
}>();

const emit = defineEmits<{
  (e: 'update:preferredMapProvider', value: NavigationProvider): void;
  (e: 'update:preferredMusicProvider', value: MusicProvider | 'none'): void;
  (e: 'update:preferredStartupModule', value: StartupModule): void;
  (e: 'toggle-car-mode', key: keyof AppPreferences['carMode'], value: boolean): void;
}>();

const startupOptions: { value: StartupModule; label: string }[] = [
  { value: 'home', label: 'Start' },
  { value: 'map', label: 'Karte' },
  { value: 'maintenance', label: 'Wartung' },
  { value: 'music', label: 'Musik' },
  { value: 'settings', label: 'Einstellungen' }
];

const mapProviderOptions: { value: NavigationProvider; label: string }[] = [
  { value: 'google', label: 'Google Maps' },
  { value: 'apple', label: 'Apple Karten' },
  { value: 'waze', label: 'Waze' }
];

const musicProviderOptions: { value: MusicProvider | 'none'; label: string }[] = [
  { value: 'none', label: 'Kein Standard' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'youtube-music', label: 'YouTube Music' },
  { value: 'apple-music', label: 'Apple Music' },
  { value: 'soundcloud', label: 'SoundCloud' },
  { value: 'other', label: 'Andere' }
];

const carModeLabels: Record<keyof AppPreferences['carMode'], string> = {
  enabled: 'Car Mode aktivieren',
  autoOpenFavoritePlace: 'Favorit-Ziel bevorzugen',
  autoPlayFavoritePlaylist: 'Favorit-Playlist bevorzugen',
  simplifiedHome: 'Reduzierte Startansicht'
};
</script>

<template>
  <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 space-y-5">
    <div>
      <h3 class="text-lg font-semibold text-gray-900">App-Einstellungen</h3>
      <p class="text-sm text-gray-600 mt-1">Lege Standardverhalten für Navigation, Musik und Startfluss fest.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Bevorzugter Kartenanbieter</label>
        <select
          :value="preferences.preferredMapProvider"
          @change="emit('update:preferredMapProvider', ($event.target as HTMLSelectElement).value as NavigationProvider)"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          <option v-for="option in mapProviderOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Bevorzugter Musikanbieter</label>
        <select
          :value="preferences.preferredMusicProvider"
          @change="emit('update:preferredMusicProvider', ($event.target as HTMLSelectElement).value as MusicProvider | 'none')"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          <option v-for="option in musicProviderOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>

      <div class="md:col-span-2">
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
      <p class="text-sm font-medium text-gray-700 mb-2">Car Mode</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
        <label v-for="(label, key) in carModeLabels" :key="key" class="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <input
            type="checkbox"
            :checked="preferences.carMode[key]"
            @change="emit('toggle-car-mode', key, ($event.target as HTMLInputElement).checked)"
          >
          {{ label }}
        </label>
      </div>
    </div>
  </section>
</template>
