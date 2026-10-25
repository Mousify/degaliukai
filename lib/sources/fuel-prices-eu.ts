import { RawFuelPrice, SourceStatus } from '../types';
import { fetchWithRetry } from '../utils';

export interface FuelPricesEuResult {
  prices: RawFuelPrice[];
  status: SourceStatus;
  bulletinSummary?: {
    date: string;
    gasoline95: number;
    diesel: number;
  };
}

export async function fetchFuelPricesEu(): Promise<FuelPricesEuResult> {
  const startTime = Date.now();
  const url = 'https://www.fuel-prices.eu/live/lithuania/?format=json';

  const sourceStatus: SourceStatus = {
    id: 'fuel-prices-eu-live',
    name: 'fuel-prices.eu Live',
    description: 'Tiesioginis Lietuvos degalinių kainų kanalas',
    type: 'live_station',
    status: 'online',
    stationsCount: 0,
    lastChecked: new Date().toISOString()
  };

  try {
    const res = await fetchWithRetry(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; DegalaiBot/1.0; +https://degalai.lt)'
      },
      next: { revalidate: 1800 } // Next.js cache 30 mins
    });

    sourceStatus.latencyMs = Date.now() - startTime;

    if (!res.ok) {
      sourceStatus.status = 'degraded';
      sourceStatus.errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      return { prices: [], status: sourceStatus };
    }

    const data = await res.json();
    sourceStatus.lastSuccess = new Date().toISOString();

    const normalized: RawFuelPrice[] = [];
    const nowIso = new Date().toISOString();

    // Check if station items exist in the response
    const stationItems = data.stations || data.data?.stations || data.fp?.stations || [];
    
    if (Array.isArray(stationItems) && stationItems.length > 0) {
      for (const s of stationItems) {
        const brand = s.brand || s.operator || 'Nepriklausoma';
        const name = s.name || `${brand} ${s.city || ''}`;
        const address = s.address || s.street || '';
        const lat = parseFloat(s.lat || s.latitude);
        const lng = parseFloat(s.lng || s.lon || s.longitude);
        const stationId = s.id || s.slug || `fp-${lat}-${lng}`;
        const updatedAt = s.updated_at || s.updated || nowIso;

        if (s.prices) {
          if (s.prices.gasoline_95 || s.prices.e95 || s.prices.ron95) {
            normalized.push({
              stationId,
              brand,
              name,
              address,
              lat,
              lng,
              fuelType: 'gasoline_95',
              pricePerLiter: parseFloat(s.prices.gasoline_95 || s.prices.e95 || s.prices.ron95),
              currency: 'EUR',
              sourceName: 'fuel-prices.eu',
              sourceUpdatedAt: updatedAt,
              fetchedAt: nowIso
            });
          }
          if (s.prices.diesel || s.prices.b7) {
            normalized.push({
              stationId,
              brand,
              name,
              address,
              lat,
              lng,
              fuelType: 'diesel',
              pricePerLiter: parseFloat(s.prices.diesel || s.prices.b7),
              currency: 'EUR',
              sourceName: 'fuel-prices.eu',
              sourceUpdatedAt: updatedAt,
              fetchedAt: nowIso
            });
          }
          if (s.prices.lpg || s.prices.autogas) {
            normalized.push({
              stationId,
              brand,
              name,
              address,
              lat,
              lng,
              fuelType: 'lpg',
              pricePerLiter: parseFloat(s.prices.lpg || s.prices.autogas),
              currency: 'EUR',
              sourceName: 'fuel-prices.eu',
              sourceUpdatedAt: updatedAt,
              fetchedAt: nowIso
            });
          }
        }
      }
    }

    sourceStatus.stationsCount = new Set(normalized.map(p => p.stationId)).size;

    // Extract weekly bulletin data if included in response
    let bulletinSummary: FuelPricesEuResult['bulletinSummary'];
    if (data.fp?.prices && Array.isArray(data.fp.prices)) {
      const p95 = data.fp.prices.find((p: any) => p.fuel?.includes('95') || p.octane === 95)?.value;
      const pd = data.fp.prices.find((p: any) => p.fuel?.toLowerCase().includes('diesel'))?.value;
      if (p95 && pd) {
        bulletinSummary = {
          date: data.fp.updated || nowIso,
          gasoline95: parseFloat(p95),
          diesel: parseFloat(pd)
        };
      }
    }

    return {
      prices: normalized,
      status: sourceStatus,
      bulletinSummary
    };
  } catch (err: any) {
    sourceStatus.status = 'degraded';
    sourceStatus.latencyMs = Date.now() - startTime;
    sourceStatus.errorMessage = err.message || 'Nepavyko pasiekti fuel-prices.eu';
    return {
      prices: [],
      status: sourceStatus
    };
  }
}
