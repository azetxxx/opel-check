<script setup lang="ts">
import { PencilSquareIcon, PlusIcon, StarIcon, TrashIcon } from '@heroicons/vue/24/outline';
import { computed, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useSavedPlaces } from '../composables/useSavedPlaces';
import { useAppPreferences } from '../composables/useAppPreferences';
import type { NavigationProvider, SavedPlace } from '../types/map';

const route = useRoute();
const { places, upsertPlace, removePlace } = useSavedPlaces();
const { preferences, updatePreferences } = useAppPreferences();

const editingId = ref<string | null>(null);
const form = reactive({
  label: '',
  address: '',
  notes: '',
  icon: '📍',
  defaultProvider: 'google' as NavigationProvider,
  google: true,
  apple: true,
  waze: false
});

const providerLabels: Record<NavigationProvider, string> = {
  google: 'Google Maps',
  apple: 'Apple Karten',
  waze: 'Waze'
};

const resetForm = () => {
  editingId.value = null;
  form.label = '';
  form.address = '';
  form.notes = '';
  form.icon = '📍';
  form.defaultProvider = 'google';
  form.google = true;
  form.apple = true;
  form.waze = false;
};

const selectedProviders = computed<NavigationProvider[]>(() => {
  return [
    form.google ? 'google' : null,
    form.apple ? 'apple' : null,
    form.waze ? 'waze' : null
  ].filter(Boolean) as NavigationProvider[];
});

const effectiveDefaultProvider = computed<NavigationProvider>(() => {
  return selectedProviders.value.includes(form.defaultProvider)
    ? form.defaultProvider
    : (selectedProviders.value[0] ?? 'google');
});

const favoritePlaceId = computed(() => preferences.value.favoritePlaceId);
const sortedPlaces = computed(() => {
  return [...places.value].sort((a, b) => {
    if (a.id === favoritePlaceId.value) return -1;
    if (b.id === favoritePlaceId.value) return 1;
    return a.label.localeCompare(b.label, 'de');
  });
});

const submit = () => {
  if (!form.label.trim() || !form.address.trim()) return;

  upsertPlace({
    id: editingId.value ?? undefined,
    label: form.label.trim(),
    address: form.address.trim(),
    notes: form.notes.trim(),
    icon: form.icon.trim() || '📍',
    providers: selectedProviders.value.length > 0 ? selectedProviders.value : ['google', 'apple'],
    defaultProvider: effectiveDefaultProvider.value
  });

  resetForm();
};

const editPlace = (place: SavedPlace) => {
  editingId.value = place.id;
  form.label = place.label;
  form.address = place.address;
  form.notes = place.notes ?? '';
  form.icon = place.icon ?? '📍';
  form.defaultProvider = place.defaultProvider ?? 'google';
  form.google = place.providers.includes('google');
  form.apple = place.providers.includes('apple');
  form.waze = place.providers.includes('waze');
};

const openProvider = (place: SavedPlace, provider: NavigationProvider) => {
  const encoded = encodeURIComponent(place.address);

  const urls: Record<NavigationProvider, string> = {
    google: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    apple: `https://maps.apple.com/?q=${encoded}`,
    waze: `https://waze.com/ul?q=${encoded}&navigate=yes`
  };

  window.open(urls[provider], '_blank', 'noopener,noreferrer');
};

const openDefaultProvider = (place: SavedPlace) => {
  openProvider(place, place.defaultProvider ?? place.providers[0] ?? 'google');
};

const toggleFavorite = (place: SavedPlace) => {
  updatePreferences({
    favoritePlaceId: favoritePlaceId.value === place.id ? null : place.id
  });
};

const applyDeepLinkAction = () => {
  const action = typeof route.query.action === 'string' ? route.query.action : null;
  const placeId = typeof route.query.place === 'string' ? route.query.place : null;
  const provider = typeof route.query.provider === 'string' ? route.query.provider as NavigationProvider : null;

  if (action !== 'navigate' || !placeId) return;

  const place = places.value.find((item) => item.id === placeId);
  if (!place) return;

  openProvider(place, provider && place.providers.includes(provider) ? provider : (place.defaultProvider ?? place.providers[0] ?? 'google'));
};

watch(() => route.fullPath, applyDeepLinkAction, { immediate: true });
watch(selectedProviders, (providers) => {
  if (!providers.includes(form.defaultProvider)) {
    form.defaultProvider = providers[0] ?? 'google';
  }
});
</script>

<template>
  <section class="space-y-6">
    <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-gray-900">Ort speichern</h3>
        <button @click="resetForm" class="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
          <PlusIcon class="h-4 w-4" />
          Neu
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input v-model="form.label" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="z. B. Zuhause">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
          <input v-model="form.address" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="z. B. Musterstraße 1, München">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Icon / Emoji</label>
          <input v-model="form.icon" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="📍">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
          <input v-model="form.notes" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="optional">
        </div>
      </div>

      <div class="space-y-3">
        <div>
          <p class="text-sm font-medium text-gray-700 mb-2">Navigation</p>
          <div class="flex flex-wrap gap-4 text-sm text-gray-700">
            <label class="inline-flex items-center gap-2"><input v-model="form.google" type="checkbox"> Google Maps</label>
            <label class="inline-flex items-center gap-2"><input v-model="form.apple" type="checkbox"> Apple Karten</label>
            <label class="inline-flex items-center gap-2"><input v-model="form.waze" type="checkbox"> Waze</label>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Standardanbieter</label>
          <select v-model="form.defaultProvider" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
            <option v-for="provider in selectedProviders" :key="provider" :value="provider">{{ providerLabels[provider] }}</option>
          </select>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button @click="resetForm" class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">Zurücksetzen</button>
        <button @click="submit" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium">
          {{ editingId ? 'Ort speichern' : 'Ort hinzufügen' }}
        </button>
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-gray-900">Gespeicherte Ziele</h3>
        <p class="text-sm text-gray-500">{{ places.length }} Orte gespeichert</p>
      </div>

      <div v-if="sortedPlaces.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div v-for="place in sortedPlaces" :key="place.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <p class="text-2xl">{{ place.icon || '📍' }}</p>
                <span v-if="favoritePlaceId === place.id" class="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">Favorit</span>
              </div>
              <h4 class="mt-2 font-semibold text-gray-900">{{ place.label }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ place.address }}</p>
              <p v-if="place.notes" class="text-sm text-gray-500 mt-2">{{ place.notes }}</p>
              <p class="text-xs text-gray-500 mt-2">Standard: {{ providerLabels[place.defaultProvider] }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="toggleFavorite(place)" class="p-2 rounded-lg border border-yellow-200 text-yellow-600 hover:bg-yellow-50">
                <StarIcon class="h-4 w-4" />
              </button>
              <button @click="editPlace(place)" class="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                <PencilSquareIcon class="h-4 w-4" />
              </button>
              <button @click="removePlace(place.id)" class="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button @click="openDefaultProvider(place)" class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
              Standard öffnen
            </button>
            <button
              v-for="provider in place.providers"
              :key="provider"
              @click="openProvider(place, provider)"
              class="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black"
            >
              {{ providerLabels[provider] }}
            </button>
          </div>
        </div>
      </div>

      <section v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p class="text-sm text-gray-500">Noch keine Ziele gespeichert. Lege oben deinen ersten Ort an.</p>
      </section>
    </section>
  </section>
</template>
