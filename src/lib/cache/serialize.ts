/**
 * Serialização determinística para chaves de cache.
 */
export function stableSerialize(value: unknown): string {
  if (value === null || value === undefined) return 'null';

  const valueType = typeof value;

  if (valueType === 'number' || valueType === 'boolean') {
    return String(value);
  }

  if (valueType === 'string') {
    return JSON.stringify(value);
  }

  if (value instanceof Date) {
    return `"${value.toISOString()}"`;
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(',')}]`;
  }

  if (valueType === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, itemValue]) => itemValue !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

    return `{${entries
      .map(([key, itemValue]) => `"${key}":${stableSerialize(itemValue)}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}


