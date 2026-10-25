import { RawFuelPrice, SourceStatus, Station } from '../types';
import { fetchWithRetry } from '../utils';

export interface DegalukainosApiResult {
  stations: Station[];
  prices: RawFuelPrice[];
  status: SourceStatus;
}

const BRAND_COLORS: Record<string, string> = {
  'Circle K': '#E11414',
  'Neste': '#005EA5',
  'Neste Lietuva': '#005EA5',
  'Viada': '#E5A200',
  'Orlen': '#C8102E',
  'Baltic Petroleum': '#0284C7',
  'Emsi': '#8B5CF6',
  'Saurida': '#EA580C',
  'Jozita': '#059669',
  'Alauša': '#0D9488',
  'Stateta': '#2563EB',
  'Skulas': '#475569',
  'Trevena': '#0284C7',
  'Adukesta': '#059669'
};

function normalizeBrand(raw: string): string {
  const b = raw.trim();
  if (b.includes('Circle K')) return 'Circle K';
  if (b.includes('Neste')) return 'Neste';
  if (b.includes('Viada')) return 'Viada';
  if (b.includes('Orlen')) return 'Orlen';
  if (b.includes('Baltic Petroleum')) return 'Baltic Petroleum';
  if (b.includes('Emsi')) return 'Emsi';
  if (b.includes('Saurida')) return 'Saurida';
  if (b.includes('Jozita')) return 'Jozita';
  if (b.includes('Alauša')) return 'Alauša';
  if (b.includes('Stateta')) return 'Stateta';
  if (b.includes('Skulas')) return 'Skulas';
  return b;
}

/**
 * Fetches complete catalog of 770 Lithuanian fuel stations with GPS coordinates from degalukainos.lt API
 */
export async function fetchDegalukainosApiStations(): Promise<DegalukainosApiResult> {
  const startTime = Date.now();
  const url = 'https://www.degalukainos.lt/api/stations';
  const nowIso = new Date().toISOString();

  const sourceStatus: SourceStatus = {
    id: 'degalukainos-lt-api',
    name: 'DegalųKainos.lt Geografinis Registras',
    description: 'Nacionalinis 770 Lietuvos degalinių GPS vietovių ir tinklų registras',
    type: 'live_station',
    status: 'online',
    stationsCount: 0,
    lastChecked: nowIso
  };

  try {
    const res = await fetchWithRetry(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 3600 } // Cache 1 hour
    });

    sourceStatus.latencyMs = Date.now() - startTime;

    if (!res.ok) {
      sourceStatus.status = 'degraded';
      sourceStatus.errorMessage = `HTTP ${res.status}`;
      return { stations: [], prices: [], status: sourceStatus };
    }

    const json = await res.json();
    sourceStatus.lastSuccess = nowIso;

    const items = json.data || [];
    const stations: Station[] = [];
    const prices: RawFuelPrice[] = [];

    for (const item of items) {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);
      if (isNaN(lat) || isNaN(lng)) continue;

      const rawBrand = item.chain_name || 'Nepriklausoma';
      const brand = normalizeBrand(rawBrand);
      const address = item.address || item.municipality || 'Lietuva';
      const city = item.municipality ? item.municipality.replace(/\s*(sav\.?|r\.|m\.)/gi, '').trim() : 'Lietuva';
      const stationId = `dkapi-${item.station_id || `${lat.toFixed(4)}-${lng.toFixed(4)}`}`;

      const p95 = item.prices?.fuel_95 ? parseFloat(item.prices.fuel_95) : undefined;
      const pdiesel = item.prices?.diesel ? parseFloat(item.prices.diesel) : undefined;
      const plpg = item.prices?.lpg ? parseFloat(item.prices.lpg) : undefined;

      const stationPrices: Station['prices'] = {};

      if (p95 && p95 >= 1.40 && p95 <= 2.80) {
        stationPrices.gasoline_95 = {
          price: p95,
          currency: 'EUR',
          source: 'DegalųKainos.lt',
          updatedAt: item.last_updated ? `${item.last_updated}T12:00:00Z` : nowIso,
          alternativePrices: []
        };
        prices.push({
          stationId,
          brand,
          name: `${brand} ${address}`,
          address,
          lat,
          lng,
          fuelType: 'gasoline_95',
          pricePerLiter: p95,
          currency: 'EUR',
          sourceName: 'DegalųKainos.lt',
          sourceUpdatedAt: item.last_updated ? `${item.last_updated}T12:00:00Z` : nowIso,
          fetchedAt: nowIso
        });
      }

      if (pdiesel && pdiesel >= 1.40 && pdiesel <= 2.80) {
        stationPrices.diesel = {
          price: pdiesel,
          currency: 'EUR',
          source: 'DegalųKainos.lt',
          updatedAt: item.last_updated ? `${item.last_updated}T12:00:00Z` : nowIso,
          alternativePrices: []
        };
        prices.push({
          stationId,
          brand,
          name: `${brand} ${address}`,
          address,
          lat,
          lng,
          fuelType: 'diesel',
          pricePerLiter: pdiesel,
          currency: 'EUR',
          sourceName: 'DegalųKainos.lt',
          sourceUpdatedAt: item.last_updated ? `${item.last_updated}T12:00:00Z` : nowIso,
          fetchedAt: nowIso
        });
      }

      if (plpg && plpg >= 0.50 && plpg <= 1.40) {
        stationPrices.lpg = {
          price: plpg,
          currency: 'EUR',
          source: 'DegalųKainos.lt',
          updatedAt: item.last_updated ? `${item.last_updated}T12:00:00Z` : nowIso,
          alternativePrices: []
        };
        prices.push({
          stationId,
          brand,
          name: `${brand} ${address}`,
          address,
          lat,
          lng,
          fuelType: 'lpg',
          pricePerLiter: plpg,
          currency: 'EUR',
          sourceName: 'DegalųKainos.lt',
          sourceUpdatedAt: item.last_updated ? `${item.last_updated}T12:00:00Z` : nowIso,
          fetchedAt: nowIso
        });
      }

      const amenities: string[] = ['shop'];
      const brandColor = BRAND_COLORS[brand] || '#64748B';

      stations.push({
        id: stationId,
        slug: `${brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${stationId}`,
        name: `${brand} ${address}`,
        brand,
        brandColor,
        address,
        city,
        county: item.municipality || `${city} sav.`,
        lat,
        lng,
        prices: stationPrices,
        amenities,
        primarySource: 'DegalųKainos.lt',
        sourcesReported: ['DegalųKainos.lt'],
        lastUpdated: item.last_updated ? `${item.last_updated}T12:00:00Z` : nowIso,
        isStale: false,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        wazeUrl: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
      });
    }

    sourceStatus.stationsCount = stations.length;
    return { stations, prices, status: sourceStatus };
  } catch (err: any) {
    sourceStatus.status = 'degraded';
    sourceStatus.latencyMs = Date.now() - startTime;
    sourceStatus.errorMessage = err.message || 'Klaida nuskaitant degalukainos.lt API';
    return { stations: [], prices: [], status: sourceStatus };
  }
}
