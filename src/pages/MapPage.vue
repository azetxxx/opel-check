<script setup lang="ts">
import { PencilSquareIcon, PlusIcon, StarIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline';
import { MapPinIcon } from '@heroicons/vue/24/outline';
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
const activeProviderMenuId = ref<string | null>(null);
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

const favoritePlaceIds = computed(() => preferences.value.favoritePlaceIds);
const pinnedStartPlaceId = computed(() => preferences.value.pinnedStartPlaceId);
const sortedPlaces = computed(() => {
  return [...places.value].sort((a, b) => {
    const aFavorite = favoritePlaceIds.value.includes(a.id);
    const bFavorite = favoritePlaceIds.value.includes(b.id);
    if (aFavorite && !bFavorite) return -1;
    if (!aFavorite && bFavorite) return 1;
    if (a.id === pinnedStartPlaceId.value) return -1;
    if (b.id === pinnedStartPlaceId.value) return 1;
    return a.label.localeCompare(b.label, 'de');
  });
});

const favoritePlaces = computed(() => sortedPlaces.value.filter((place) => favoritePlaceIds.value.includes(place.id)));
const otherPlaces = computed(() => sortedPlaces.value.filter((place) => !favoritePlaceIds.value.includes(place.id)));

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
  const isFavorite = favoritePlaceIds.value.includes(place.id);
  updatePreferences({
    favoritePlaceIds: isFavorite
      ? favoritePlaceIds.value.filter((id) => id !== place.id)
      : [...favoritePlaceIds.value, place.id],
    pinnedStartPlaceId: preferences.value.pinnedStartPlaceId === place.id && isFavorite
      ? null
      : preferences.value.pinnedStartPlaceId
  });
};

const togglePinnedStartPlace = (place: SavedPlace) => {
  const nextPinnedId = pinnedStartPlaceId.value === place.id ? null : place.id;
  const nextFavoriteIds = favoritePlaceIds.value.includes(place.id)
    ? favoritePlaceIds.value
    : [...favoritePlaceIds.value, place.id];

  updatePreferences({
    favoritePlaceIds: nextFavoriteIds,
    pinnedStartPlaceId: nextPinnedId
  });
};

const toggleProviderMenu = (placeId: string) => {
  activeProviderMenuId.value = activeProviderMenuId.value === placeId ? null : placeId;
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
  <section class="space-y-4 pb-6 sm:space-y-5">
    <section class="-mx-4 -mt-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-4 pb-6 pt-5 text-white shadow-lg sm:mx-0 sm:mt-0 sm:rounded-[28px] sm:px-5 sm:pt-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">Ziele</h2>
          <p class="mt-2 text-sm text-white/85">Schnellzugriff auf deine Orte</p>
        </div>
        <button
          ref="topCreateButton"
          @click="openCreateForm"
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-white hover:bg-white/25"
        >
          <PlusIcon class="h-5 w-5" />
        </button>
      </div>
    </section>

    <section v-if="favoritePlaces.length > 0" class="space-y-3">
      <div class="flex items-center gap-2 text-gray-900">
        <StarIcon class="h-5 w-5 text-amber-500" />
        <h3 class="text-lg font-semibold text-gray-900">Favoriten</h3>
      </div>

      <div class="space-y-3">
        <div v-for="place in favoritePlaces" :key="place.id" class="rounded-[28px] bg-gradient-to-r from-yellow-400 to-orange-500 p-5 text-white shadow-lg">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white">
                <MapPinIcon class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-2xl font-semibold">{{ place.label }}</h3>
                <p class="mt-1 text-sm text-yellow-50/90">{{ place.address }}</p>
                <p v-if="pinnedStartPlaceId === place.id" class="mt-2 text-xs font-medium text-yellow-50/95">Auf Startseite angeheftet</p>
              </div>
            </div>
            <button @click="toggleProviderMenu(place.id)" class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white hover:bg-white/25">
              <EllipsisVerticalIcon class="h-5 w-5" />
            </button>
          </div>

          <div class="mt-4 flex items-center gap-2">
            <button @click="openDefaultProvider(place)" class="flex-1 min-h-11 rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50">
              In der Karten-App öffnen
            </button>
          </div>

          <div v-if="activeProviderMenuId === place.id" class="mt-3 flex flex-col sm:flex-row gap-2">
            <button @click="toggleFavorite(place); activeProviderMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-yellow-200 bg-white text-yellow-700 hover:bg-yellow-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <StarIcon class="h-4 w-4" />
              Aus Favoriten entfernen
            </button>
            <button @click="togglePinnedStartPlace(place); activeProviderMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <MapPinIcon class="h-4 w-4" />
              {{ pinnedStartPlaceId === place.id ? 'Von Startseite lösen' : 'Auf Startseite anheften' }}
            </button>
            <button @click="editPlace(place); activeProviderMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <PencilSquareIcon class="h-4 w-4" />
              Bearbeiten
            </button>
            <button @click="removePlace(place.id); activeProviderMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <TrashIcon class="h-4 w-4" />
              Löschen
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-gray-900">Alle Ziele</h3>
        <p class="text-sm text-gray-500">{{ otherPlaces.length }} Orte</p>
      </div>

      <div v-if="otherPlaces.length > 0" class="space-y-3">
        <div v-for="place in otherPlaces" :key="place.id" class="rounded-2xl border-l-4 border-cyan-400 bg-gray-50 px-4 py-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="mt-1 flex h-11 w-11 items-center justify-center rounded-[20px] bg-white text-cyan-600 text-xl shadow-sm">
                <span>{{ place.icon || '📍' }}</span>
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ place.label }}</p>
                <p class="mt-1 text-sm text-gray-600">{{ place.address }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button @click="toggleProviderMenu(place.id)" class="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 bg-white">
                <EllipsisVerticalIcon class="h-5 w-5" />
              </button>
            </div>
          </div>

          <div class="mt-4 flex items-center gap-2">
            <button @click="openDefaultProvider(place)" class="flex-1 min-h-11 rounded-[20px] bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-100">
              In der Karten-App öffnen
            </button>
          </div>

          <div v-if="activeProviderMenuId === place.id" class="mt-3 flex flex-col sm:flex-row gap-2">
            <button @click="toggleFavorite(place); activeProviderMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-yellow-200 bg-white text-yellow-700 hover:bg-yellow-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <StarIcon class="h-4 w-4" />
              Zu Favoriten hinzufügen
            </button>
            <button @click="togglePinnedStartPlace(place); activeProviderMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <MapPinIcon class="h-4 w-4" />
              Auf Startseite anheften
            </button>
            <button @click="editPlace(place); activeProviderMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <PencilSquareIcon class="h-4 w-4" />
              Bearbeiten
            </button>
            <button
              v-for="provider in place.providers.filter((provider) => provider !== getPreferredPlaceProvider(place))"
              :key="provider"
              @click="openProvider(place, provider); activeProviderMenuId = null"
              class="min-h-11 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center"
            >
              {{ providerLabels[provider] }}
            </button>
            <button @click="removePlace(place.id); activeProviderMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <TrashIcon class="h-4 w-4" />
              Löschen
            </button>
          </div>
        </div>
      </div>

      <section v-else-if="places.length === 0" class="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center space-y-4">
        <p class="text-sm text-gray-500">Noch keine Ziele gespeichert.</p>
        <button @click="openCreateForm" class="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600">
          <PlusIcon class="h-4 w-4" />
          Neu
        </button>
      </section>

      <section v-else class="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
        <p class="text-sm text-gray-500">Weitere Ziele erscheinen hier unterhalb des Favoriten.</p>
      </section>
    </section>

    <button
      v-if="showFloatingCreateButton && !isFormOpen"
      @click="openCreateForm"
      class="fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-lg hover:bg-cyan-600 sm:hidden"
    >
      <PlusIcon class="h-5 w-5" />
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
          <button @click="submit" class="rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2 text-sm font-medium text-white">
            {{ editingId ? 'Ort speichern' : 'Ort hinzufügen' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
