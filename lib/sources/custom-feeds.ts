import { RawFuelPrice, SourceStatus } from '../types';
import { fetchWithRetry } from '../utils';

export interface CustomFeedResult {
  prices: RawFuelPrice[];
  status: SourceStatus;
}

/**
 * Ingests custom fuel feeds configured via FUEL_SOURCE_URL and FUEL_SOURCE_URL_2
 */
export async function fetchCustomFeed(
  envKey: 'FUEL_SOURCE_URL' | 'FUEL_SOURCE_URL_2',
  sourceName: string
): Promise<CustomFeedResult> {
  const url = process.env[envKey];
  const nowIso = new Date().toISOString();

  const sourceStatus: SourceStatus = {
    id: envKey.toLowerCase(),
    name: sourceName,
    description: `Konfigūruojamas išorinis srautas (${envKey})`,
    type: 'supplementary',
    status: url ? 'online' : 'disabled',
    stationsCount: 0,
    lastChecked: nowIso
  };

  if (!url) {
    return { prices: [], status: sourceStatus };
  }

  const startTime = Date.now();
  try {
    const res = await fetchWithRetry(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 1800 }
    });

    sourceStatus.latencyMs = Date.now() - startTime;

    if (!res.ok) {
      sourceStatus.status = 'degraded';
      sourceStatus.errorMessage = `HTTP ${res.status}`;
      return { prices: [], status: sourceStatus };
    }

    const data = await res.json();
    sourceStatus.lastSuccess = new Date().toISOString();

    const normalized: RawFuelPrice[] = [];
    const items = Array.isArray(data) ? data : data.stations || data.prices || [];

    for (const item of items) {
      const lat = parseFloat(item.lat || item.latitude);
      const lng = parseFloat(item.lng || item.lon || item.longitude);
      if (isNaN(lat) || isNaN(lng)) continue;

      const brand = item.brand || item.operator || 'Nepriklausoma';
      const name = item.name || `${brand} ${item.address || ''}`;
      const address = item.address || '';
      const stationId = item.id || `feed-${lat}-${lng}`;
      const updatedAt = item.updatedAt || item.updated || nowIso;

      if (item.gasoline_95 || item.price_95 || item.e95) {
        normalized.push({
          stationId,
          brand,
          name,
          address,
          lat,
          lng,
          fuelType: 'gasoline_95',
          pricePerLiter: parseFloat(item.gasoline_95 || item.price_95 || item.e95),
          currency: 'EUR',
          sourceName,
          sourceUpdatedAt: updatedAt,
          fetchedAt: nowIso
        });
      }

      if (item.diesel || item.price_diesel || item.b7) {
        normalized.push({
          stationId,
          brand,
          name,
          address,
          lat,
          lng,
          fuelType: 'diesel',
          pricePerLiter: parseFloat(item.diesel || item.price_diesel || item.b7),
          currency: 'EUR',
          sourceName,
          sourceUpdatedAt: updatedAt,
          fetchedAt: nowIso
        });
      }

      if (item.lpg || item.price_lpg || item.autogas) {
        normalized.push({
          stationId,
          brand,
          name,
          address,
          lat,
          lng,
          fuelType: 'lpg',
          pricePerLiter: parseFloat(item.lpg || item.price_lpg || item.autogas),
          currency: 'EUR',
          sourceName,
          sourceUpdatedAt: updatedAt,
          fetchedAt: nowIso
        });
      }
    }

    sourceStatus.stationsCount = items.length;
    return { prices: normalized, status: sourceStatus };
  } catch (err: any) {
    sourceStatus.status = 'degraded';
    sourceStatus.latencyMs = Date.now() - startTime;
    sourceStatus.errorMessage = err.message || 'Klaida nuskaitant pasirinktinį srautą';
    return { prices: [], status: sourceStatus };
  }
}
