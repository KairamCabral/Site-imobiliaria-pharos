type MemoryEntry<T> = {
  value: T;
  expiresAt: number;
};

const store = new Map<string, MemoryEntry<unknown>>();

export function memoryGet<T>(key: string): MemoryEntry<T> | null {
  const entry = store.get(key) as MemoryEntry<T> | undefined;
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }

  return entry;
}

export function memorySet<T>(key: string, value: T, ttlMs: number): MemoryEntry<T> {
  const expiresAt = Date.now() + ttlMs;
  const entry: MemoryEntry<T> = { value, expiresAt };
  store.set(key, entry);
  return entry;
}

export function memoryDelete(key: string) {
  store.delete(key);
}

export function memoryDeleteByPrefix(prefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

export function memoryStats() {
  return {
    size: store.size,
  };
}


