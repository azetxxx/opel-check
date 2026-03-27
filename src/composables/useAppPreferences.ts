import { computed, ref } from 'vue';
import type { AppPreferences } from '../types/preferences';
import { readRawStorage, writeStorageEnvelope } from '../utils/storage';

const STORAGE_KEY = 'app-preferences';
const STORAGE_VERSION = 1;

const defaultPreferences = (): AppPreferences => ({
  favoritePlaceId: null,
  favoritePlaylistId: null,
  preferredStartupModule: 'home',
  homeWidgets: {
    stats: true,
    nextTask: true,
    recentCompletions: true,
    quickPlaces: true,
    quickPlaylists: true,
    modules: true
  }
});

const preferences = ref<AppPreferences>(defaultPreferences());
let initialized = false;

const normalizePreferences = (value: Partial<AppPreferences> | null | undefined): AppPreferences => {
  const fallback = defaultPreferences();

  return {
    favoritePlaceId: value?.favoritePlaceId ?? fallback.favoritePlaceId,
    favoritePlaylistId: value?.favoritePlaylistId ?? fallback.favoritePlaylistId,
    preferredStartupModule: value?.preferredStartupModule ?? fallback.preferredStartupModule,
    homeWidgets: {
      stats: value?.homeWidgets?.stats ?? fallback.homeWidgets.stats,
      nextTask: value?.homeWidgets?.nextTask ?? fallback.homeWidgets.nextTask,
      recentCompletions: value?.homeWidgets?.recentCompletions ?? fallback.homeWidgets.recentCompletions,
      quickPlaces: value?.homeWidgets?.quickPlaces ?? fallback.homeWidgets.quickPlaces,
      quickPlaylists: value?.homeWidgets?.quickPlaylists ?? fallback.homeWidgets.quickPlaylists,
      modules: value?.homeWidgets?.modules ?? fallback.homeWidgets.modules
    }
  };
};

export function useAppPreferences() {
  const savePreferences = () => {
    writeStorageEnvelope(STORAGE_KEY, STORAGE_VERSION, preferences.value);
  };

  const loadPreferences = () => {
    const raw = readRawStorage(STORAGE_KEY);

    if (raw && typeof raw === 'object' && 'data' in raw) {
      preferences.value = normalizePreferences((raw as { data: Partial<AppPreferences> }).data);
      savePreferences();
      return;
    }

    preferences.value = defaultPreferences();
    savePreferences();
  };

  const updatePreferences = (patch: Partial<AppPreferences>) => {
    preferences.value = normalizePreferences({
      ...preferences.value,
      ...patch,
      homeWidgets: {
        ...preferences.value.homeWidgets,
        ...patch.homeWidgets
      }
    });
    savePreferences();
  };

  if (!initialized) {
    loadPreferences();
    initialized = true;
  }

  return {
    preferences: computed(() => preferences.value),
    updatePreferences
  };
}
