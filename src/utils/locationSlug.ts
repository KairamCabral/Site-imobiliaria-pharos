export function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function createCitySlug(cityName: string): string {
  return normalizeSlug(cityName);
}

export function createBairroSlug(bairroName: string, cityName?: string): string {
  const bairroSlug = normalizeSlug(bairroName);
  if (!cityName) {
    return bairroSlug;
  }
  const citySlug = createCitySlug(cityName);
  return `${bairroSlug}-${citySlug}`;
}

export function parseBairroSlug(slug: string, knownCitySlugs: string[] = []) {
  for (const citySlug of knownCitySlugs) {
    const suffix = `-${citySlug}`;
    if (slug.endsWith(suffix)) {
      const bairroSlug = slug.slice(0, -suffix.length);
      return { bairroSlug: bairroSlug || slug, cidadeSlug: citySlug };
    }
  }
  return { bairroSlug: slug, cidadeSlug: null };
}
