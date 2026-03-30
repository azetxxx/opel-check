import type { StorageProvider } from './types';

const rawProvider = (import.meta.env.VITE_STORAGE_PROVIDER ?? 'local').toLowerCase();

export const storageProvider: StorageProvider = rawProvider === 'supabase' ? 'supabase' : 'local';
