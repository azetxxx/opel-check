export interface StorageEnvelope<T> {
  version: number;
  savedAt: string;
  data: T;
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const safeParseJson = (raw: string | null): unknown => {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse JSON from storage:', error);
    return null;
  }
};

export const isStorageEnvelope = <T>(value: unknown): value is StorageEnvelope<T> => {
  return isObject(value)
    && typeof value.version === 'number'
    && typeof value.savedAt === 'string'
    && 'data' in value;
};

export const createStorageEnvelope = <T>(version: number, data: T): StorageEnvelope<T> => ({
  version,
  savedAt: new Date().toISOString(),
  data
});

export const readRawStorage = (key: string) => safeParseJson(localStorage.getItem(key));

export const writeStorageEnvelope = <T>(key: string, version: number, data: T) => {
  localStorage.setItem(key, JSON.stringify(createStorageEnvelope(version, data)));
};
