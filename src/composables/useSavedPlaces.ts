import { ref } from 'vue';
import { writeStorageEnvelope, readRawStorage } from '../utils/storage';
import { STORAGE_VERSIONS } from '../constants/storage';
import type { SavedPlace } from '../types/map';

const STORAGE_KEY = 'saved-places';
const STORAGE_VERSION = STORAGE_VERSIONS.vehicles;

const nowIso = () => new Date().toISOString();

const defaultPlaces: SavedPlace[] = [
  {
    id: 'place-home',
    label: 'Zuhause',
    address: 'München',
    icon: '🏠',
    notes: 'Beispieladresse',
    providers: ['google', 'apple', 'waze'],
    createdAt: nowIso(),
    updatedAt: nowIso()
  },
  {
    id: 'place-work',
    label: 'Arbeit',
    address: 'Berlin',
    icon: '💼',
    notes: 'Arbeitsweg',
    providers: ['google', 'apple'],
    defaultProvider: 'google',
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
];

const places = ref<SavedPlace[]>([]);
let initialized = false;

const normalizePlace = (place: Partial<SavedPlace>): SavedPlace => {
  const createdAt = place.createdAt ?? nowIso();

  return {
    id: place.id ?? crypto.randomUUID(),
    label: place.label ?? 'Neuer Ort',
    address: place.address ?? '',
    notes: place.notes ?? '',
    icon: place.icon ?? '📍',
    providers: place.providers?.length ? place.providers : ['google', 'apple'],
    createdAt,
    updatedAt: place.updatedAt ?? createdAt
  };
};

export function useSavedPlaces() {
  const savePlaces = () => {
    writeStorageEnvelope(STORAGE_KEY, STORAGE_VERSION, places.value);
  };

  const loadPlaces = () => {
    const raw = readRawStorage(STORAGE_KEY);

    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data)) {
      places.value = (raw as { data: Partial<SavedPlace>[] }).data.map(normalizePlace);
      savePlaces();
      return;
    }

    if (Array.isArray(raw)) {
      places.value = raw.map((item) => normalizePlace(item as Partial<SavedPlace>));
      savePlaces();
      return;
    }

    places.value = defaultPlaces.map(normalizePlace);
    savePlaces();
  };

  const upsertPlace = (place: Partial<SavedPlace> & Pick<SavedPlace, 'label' | 'address'>) => {
    if (place.id) {
      const index = places.value.findIndex((item) => item.id === place.id);
      if (index !== -1) {
        places.value[index] = normalizePlace({
          ...places.value[index],
          ...place,
          id: places.value[index].id,
          createdAt: places.value[index].createdAt,
          updatedAt: nowIso()
        });
        savePlaces();
        return;
      }
    }

    places.value.unshift(normalizePlace({
      ...place,
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      updatedAt: nowIso()
    }));
    savePlaces();
  };

  const removePlace = (placeId: string) => {
    places.value = places.value.filter((item) => item.id !== placeId);
    savePlaces();
  };

  if (!initialized) {
    loadPlaces();
    initialized = true;
  }

  return {
    places,
    upsertPlace,
    removePlace
  };
}
   places,
    upsertPlace,
    removePlace
  };
}
