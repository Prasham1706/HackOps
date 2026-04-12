const memoryCache = new Map();

const now = () => Date.now();

const buildEntry = (data, ttlMs) => ({
  data,
  expiresAt: now() + ttlMs,
});

const getStorageKey = (key) => `flowmind-cache:${key}`;

export const getCachedValue = (key) => {
  const memoryEntry = memoryCache.get(key);
  if (memoryEntry && memoryEntry.expiresAt > now()) {
    return memoryEntry.data;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(getStorageKey(key));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.expiresAt || parsed.expiresAt <= now()) {
      window.sessionStorage.removeItem(getStorageKey(key));
      return null;
    }

    memoryCache.set(key, parsed);
    return parsed.data;
  } catch (error) {
    console.warn('Failed to read cache entry', key, error);
    return null;
  }
};

export const setCachedValue = (key, data, ttlMs) => {
  const entry = buildEntry(data, ttlMs);
  memoryCache.set(key, entry);

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(getStorageKey(key), JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to store cache entry', key, error);
  }
};

export const invalidateCache = (...keys) => {
  keys.forEach((key) => {
    memoryCache.delete(key);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(getStorageKey(key));
    }
  });
};

export const readThroughCache = async (key, ttlMs, loader) => {
  const cached = getCachedValue(key);
  if (cached !== null) {
    return cached;
  }

  const data = await loader();
  setCachedValue(key, data, ttlMs);
  return data;
};
