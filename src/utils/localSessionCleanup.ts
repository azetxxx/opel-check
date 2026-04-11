import { STORAGE_KEYS } from '../constants/storage';

const MIGRATION_FLAG = 'local-to-cloud-migrated';
const PLACES_KEY = 'saved-places';
const PLAYLISTS_KEY = 'playlist-shortcuts';

/**
 * Removes local copies of app data that may mirror a previous cloud session.
 * Call after successful sign-out so the logged-out experience starts empty.
 * (Preferences such as map provider stay in `app-preferences`.)
 */
export const clearLocalAppCachesAfterSignOut = () => {
  localStorage.removeItem(STORAGE_KEYS.vehicles);
  localStorage.removeItem(STORAGE_KEYS.tasks);
  localStorage.removeItem(STORAGE_KEYS.logs);
  localStorage.removeItem(PLACES_KEY);
  localStorage.removeItem(PLAYLISTS_KEY);
  localStorage.removeItem(MIGRATION_FLAG);
};
