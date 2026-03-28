<script setup lang="ts">
import type { NavigationProvider } from '../types/map';
import type { MusicProvider } from '../types/music';

defineProps<{
  preferredMapProvider: NavigationProvider;
  preferredMusicProvider: MusicProvider | 'none';
}>();

const emit = defineEmits<{
  (e: 'update:preferredMapProvider', value: NavigationProvider): void;
  (e: 'update:preferredMusicProvider', value: MusicProvider | 'none'): void;
}>();

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
</script>

<template>
  <section class="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">Bevorzugter Kartenanbieter</label>
        <select
          :value="preferredMapProvider"
          @change="emit('update:preferredMapProvider', ($event.target as HTMLSelectElement).value as NavigationProvider)"
          class="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm"
        >
          <option v-for="option in mapProviderOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">Bevorzugter Musikanbieter</label>
        <select
          :value="preferredMusicProvider"
          @change="emit('update:preferredMusicProvider', ($event.target as HTMLSelectElement).value as MusicProvider | 'none')"
          class="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm"
        >
          <option v-for="option in musicProviderOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>
    </div>
  </section>
</template>
