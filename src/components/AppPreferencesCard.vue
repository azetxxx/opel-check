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
  { value: 'map', label: 'Ziele' },
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
  <section class="overflow-hidden rounded-[28px] border border-purple-200 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-5 text-white shadow-lg sm:p-6 space-y-5">
    <div class="flex items-start gap-3">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white shadow-sm">
        <span class="text-lg">🌙</span>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-white">Fahrmodus</h3>
        <p class="mt-1 text-sm text-white/80">Auto-Start und reduzierte Ansicht für unterwegs.</p>
      </div>
    </div>

    <div class="space-y-3">
      <label v-for="(label, key) in carModeLabels" :key="key" class="flex items-center justify-between gap-3 rounded-[20px] bg-white/12 px-4 py-4 text-sm">
        <div>
          <p class="font-medium text-white">{{ label }}</p>
        </div>
        <span class="relative inline-flex items-center">
          <input
            type="checkbox"
            :checked="preferences.carMode[key]"
            @change="emit('toggle-car-mode', key, ($event.target as HTMLInputElement).checked)"
            class="peer sr-only"
          >
          <span class="h-7 w-12 rounded-full bg-white/30 transition-colors peer-checked:bg-white/80"></span>
          <span class="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5"></span>
        </span>
      </label>
    </div>

    <div class="grid grid-cols-1 gap-4 border-t border-white/10 pt-4 text-slate-900 md:grid-cols-2">
      <div>
        <label class="mb-1 block text-sm font-medium text-white/85">Bevorzugter Kartenanbieter</label>
        <select
          :value="preferences.preferredMapProvider"
          @change="emit('update:preferredMapProvider', ($event.target as HTMLSelectElement).value as NavigationProvider)"
          class="w-full rounded-2xl border border-white/15 bg-white px-3 py-2 text-sm"
        >
          <option v-for="option in mapProviderOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-white/85">Bevorzugter Musikanbieter</label>
        <select
          :value="preferences.preferredMusicProvider"
          @change="emit('update:preferredMusicProvider', ($event.target as HTMLSelectElement).value as MusicProvider | 'none')"
          class="w-full rounded-2xl border border-white/15 bg-white px-3 py-2 text-sm"
        >
          <option v-for="option in musicProviderOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>

      <div class="md:col-span-2">
        <label class="mb-1 block text-sm font-medium text-white/85">Bevorzugtes Startmodul</label>
        <select
          :value="preferences.preferredStartupModule"
          @change="emit('update:preferredStartupModule', ($event.target as HTMLSelectElement).value as StartupModule)"
          class="w-full rounded-2xl border border-white/15 bg-white px-3 py-2 text-sm"
        >
          <option v-for="option in startupOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>
    </div>
  </section>
</template>
