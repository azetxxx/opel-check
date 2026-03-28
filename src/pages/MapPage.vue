<script setup lang="ts">
import { PencilSquareIcon, PlusIcon, StarIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useSavedPlaces } from '../composables/useSavedPlaces';
import { useAppPreferences } from '../composables/useAppPreferences';
import type { NavigationProvider, SavedPlace } from '../types/map';

const route = useRoute();
const { places, upsertPlace, removePlace } = useSavedPlaces();
const { preferences, updatePreferences } = useAppPreferences();

const editingId = ref<string | null>(null);
const isFormOpen = ref(false);
const topCreateButton = ref<HTMLElement | null>(null);
const showFloatingCreateButton = ref(false);
let createButtonObserver: IntersectionObserver | null = null;
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
  form.defaultProvider = preferences.value.preferredMapProvider;
  form.google = true;
  form.apple = true;
  form.waze = preferences.value.preferredMapProvider === 'waze';
};

const openCreateForm = () => {
  resetForm();
  isFormOpen.value = true;
};

const closeForm = () => {
  isFormOpen.value = false;
  resetForm();
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

  closeForm();
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
  isFormOpen.value = true;
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

const getPreferredPlaceProvider = (place: SavedPlace) => {
  return place.providers.includes(preferences.value.preferredMapProvider)
    ? preferences.value.preferredMapProvider
    : (place.defaultProvider ?? place.providers[0] ?? 'google');
};

const openDefaultProvider = (place: SavedPlace) => {
  openProvider(place, getPreferredPlaceProvider(place));
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

  if (action === 'create-task') {
    openCreateForm();
    return;
  }

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

onMounted(() => {
  if (!topCreateButton.value) return;

  createButtonObserver = new IntersectionObserver(
    ([entry]) => {
      showFloatingCreateButton.value = entry.intersectionRatio < 0.4;
    },
    {
      threshold: [0, 0.25, 0.4, 0.6, 1],
      rootMargin: '0px 0px -32px 0px'
    }
  );

  createButtonObserver.observe(topCreateButton.value);
});

onBeforeUnmount(() => {
  createButtonObserver?.disconnect();
});
</script>

<template>
  <section class="space-y-5 sm:space-y-6 pb-4">
    <section class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-gray-900">Ziele</h3>
        <div class="flex items-center gap-3">
          <p class="hidden text-sm text-gray-500 sm:block">{{ places.length }} Orte gespeichert</p>
          <button ref="topCreateButton" @click="openCreateForm" class="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100">
            <PlusIcon class="h-4 w-4" />
            Neu
          </button>
        </div>
      </div>

      <div v-if="sortedPlaces.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div v-for="place in sortedPlaces" :key="place.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <p class="text-2xl">{{ place.icon || '📍' }}</p>
                <span v-if="favoritePlaceId === place.id" class="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">Favorit</span>
              </div>
              <h4 class="mt-2 font-semibold text-gray-900">{{ place.label }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ place.address }}</p>
              <p v-if="place.notes" class="text-sm text-gray-500 mt-2">{{ place.notes }}</p>
              <p class="text-xs text-gray-500 mt-2">Standard: {{ providerLabels[getPreferredPlaceProvider(place)] }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="toggleFavorite(place)" class="p-2.5 rounded-lg border border-yellow-200 text-yellow-600 hover:bg-yellow-50">
                <StarIcon class="h-4 w-4" />
              </button>
              <button @click="editPlace(place)" class="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                <PencilSquareIcon class="h-4 w-4" />
              </button>
              <button @click="removePlace(place.id)" class="p-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
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
              class="min-h-11 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black"
            >
              {{ providerLabels[provider] }}
            </button>
          </div>
        </div>
      </div>

      <section v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center space-y-4">
        <p class="text-sm text-gray-500">Noch keine Ziele gespeichert.</p>
        <button @click="openCreateForm" class="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100">
          <PlusIcon class="h-4 w-4" />
          Neu
        </button>
      </section>
    </section>

    <button
      v-if="showFloatingCreateButton && !isFormOpen"
      @click="openCreateForm"
      class="fixed bottom-24 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-blue-700 sm:hidden"
    >
      <PlusIcon class="h-4 w-4" />
      Neu
    </button>

    <div v-if="isFormOpen" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-6 py-4 rounded-t-2xl">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ editingId ? 'Ort bearbeiten' : 'Ort hinzufügen' }}</h3>
            <p class="text-sm text-gray-500">Gespeicherte Ziele für schnelle Navigation</p>
          </div>
          <button @click="closeForm" class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div class="p-6 space-y-4">
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
        </div>

        <div class="sticky bottom-0 flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4 rounded-b-2xl">
          <button @click="closeForm" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Abbrechen</button>
          <button @click="submit" class="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white">
            {{ editingId ? 'Ort speichern' : 'Ort hinzufügen' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
