import { RawFuelPrice, SourceStatus } from '../types';
import { fetchWithRetry } from '../utils';

export interface SauridaOfficialResult {
  prices: RawFuelPrice[];
  status: SourceStatus;
}

// Known coordinates for official Saurida locations
const SAURIDA_STATION_COORDS: Record<string, { lat: number; lng: number; address: string; city: string }> = {
  'kusliskiai': { lat: 54.4123, lng: 23.2104, address: 'Kušliškių k.', city: 'Kalvarija' },
  'lazdijai': { lat: 54.2341, lng: 23.5152, address: 'Vilniaus g. 27', city: 'Lazdijai' },
  'pageleziai': { lat: 55.1582, lng: 24.6214, address: 'Pageležių k.', city: 'Ukmergės r.' },
  'domeikava': { lat: 54.9682, lng: 23.9214, address: 'Vandžiogalos pl. 106', city: 'Domeikava' },
  'marijampole': { lat: 54.5689, lng: 23.3645, address: 'Kauno g. 118', city: 'Marijampolė' },
  'mauruciai': { lat: 54.7782, lng: 23.7712, address: 'Mauručių k.', city: 'Veiveriai' },
  'vilnius_staneviciaus': { lat: 54.7241, lng: 25.2539, address: 'S. Stanevičiaus g. 3A', city: 'Vilnius' },
  'vilnius_rygos': { lat: 54.7176, lng: 25.2215, address: 'Rygos g. 2B', city: 'Vilnius' },
  'silale': { lat: 55.4891, lng: 22.1954, address: 'Rytinio kelio g. 1', city: 'Šilalė' },
  'velziai': { lat: 55.7021, lng: 24.4251, address: 'Alantos g. 2', city: 'Velžys' },
  'visaginas': { lat: 55.5912, lng: 26.4389, address: 'Taikos pr. 80D', city: 'Visaginas' },
  'pasvenciai': { lat: 55.0812, lng: 22.7541, address: 'Pašvenčių k.', city: 'Jurbarkas' },
  'siauliai': { lat: 55.9333, lng: 23.3167, address: 'Pramonės g. 15', city: 'Šiauliai' },
  'panevezys': { lat: 55.7333, lng: 24.3500, address: 'Smėlynės g. 112', city: 'Panevėžys' }
};

function normalizeCityKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (c) => ({ 'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i', 'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z' }[c] || c))
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Scrapes live official station prices directly from https://www.saurida.lt/kuro-kainos-degalinese/
 */
export async function scrapeSauridaOfficial(): Promise<SauridaOfficialResult> {
  const startTime = Date.now();
  const url = 'https://www.saurida.lt/kuro-kainos-degalinese/';
  const nowIso = new Date().toISOString();

  const sourceStatus: SourceStatus = {
    id: 'saurida-official',
    name: 'Saurida.lt Oficialus Kainynas',
    description: 'Tiesioginės kainos iš oficialaus Saurida tinklo puslapio',
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
      next: { revalidate: 1800 }
    });

    sourceStatus.latencyMs = Date.now() - startTime;

    if (!res.ok) {
      sourceStatus.status = 'degraded';
      sourceStatus.errorMessage = `HTTP ${res.status}`;
      return { prices: [], status: sourceStatus };
    }

    const html = await res.text();
    sourceStatus.lastSuccess = nowIso;

    const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
    if (!tableMatch) {
      sourceStatus.status = 'degraded';
      sourceStatus.errorMessage = 'Lentelė nerasta';
      return { prices: [], status: sourceStatus };
    }

    const rows = tableMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    const normalized: RawFuelPrice[] = [];
    let count = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;
      const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
      if (cells.length < 4) continue;

      const stationName = cells[0]?.replace(/<[^>]+>/g, '').trim() || '';
      if (!stationName) continue;

      const dieselStr = cells[1]?.replace(/<[^>]+>/g, '').trim() || '';
      const b95Str = cells[2]?.replace(/<[^>]+>/g, '').trim() || '';
      const lpgStr = cells[3]?.replace(/<[^>]+>/g, '').trim() || '';
      const b98Str = cells[5]?.replace(/<[^>]+>/g, '').trim() || '';

      const diesel = parseFloat(dieselStr.replace(',', '.'));
      const b95 = parseFloat(b95Str.replace(',', '.'));
      const lpg = parseFloat(lpgStr.replace(',', '.'));
      const b98 = parseFloat(b98Str.replace(',', '.'));

      const key = normalizeCityKey(stationName);
      const meta = SAURIDA_STATION_COORDS[key] || {
        lat: 55.1694 + (Math.sin(i) * 0.4),
        lng: 23.8813 + (Math.cos(i) * 0.6),
        address: stationName,
        city: stationName.split(',')[0]?.trim() || 'Lietuva'
      };

      const stationId = `saurida-${key}`;
      count++;

      if (!isNaN(diesel) && diesel >= 1.40) {
        normalized.push({
          stationId,
          brand: 'Saurida',
          name: `Saurida ${stationName}`,
          address: meta.address,
          lat: meta.lat,
          lng: meta.lng,
          fuelType: 'diesel',
          pricePerLiter: diesel,
          currency: 'EUR',
          sourceName: 'Saurida.lt Oficialus',
          sourceUpdatedAt: nowIso,
          fetchedAt: nowIso
        });
      }

      if (!isNaN(b95) && b95 >= 1.40) {
        normalized.push({
          stationId,
          brand: 'Saurida',
          name: `Saurida ${stationName}`,
          address: meta.address,
          lat: meta.lat,
          lng: meta.lng,
          fuelType: 'gasoline_95',
          pricePerLiter: b95,
          currency: 'EUR',
          sourceName: 'Saurida.lt Oficialus',
          sourceUpdatedAt: nowIso,
          fetchedAt: nowIso
        });
      }

      if (!isNaN(lpg) && lpg >= 0.50) {
        normalized.push({
          stationId,
          brand: 'Saurida',
          name: `Saurida ${stationName}`,
          address: meta.address,
          lat: meta.lat,
          lng: meta.lng,
          fuelType: 'lpg',
          pricePerLiter: lpg,
          currency: 'EUR',
          sourceName: 'Saurida.lt Oficialus',
          sourceUpdatedAt: nowIso,
          fetchedAt: nowIso
        });
      }

      if (!isNaN(b98) && b98 >= 1.50) {
        normalized.push({
          stationId,
          brand: 'Saurida',
          name: `Saurida ${stationName}`,
          address: meta.address,
          lat: meta.lat,
          lng: meta.lng,
          fuelType: 'gasoline_98',
          pricePerLiter: b98,
          currency: 'EUR',
          sourceName: 'Saurida.lt Oficialus',
          sourceUpdatedAt: nowIso,
          fetchedAt: nowIso
        });
      }
    }

    sourceStatus.stationsCount = count;
    return { prices: normalized, status: sourceStatus };
  } catch (err: any) {
    sourceStatus.status = 'degraded';
    sourceStatus.latencyMs = Date.now() - startTime;
    sourceStatus.errorMessage = err.message || 'Klaida nuskaitant Saurida.lt';
    return { prices: [], status: sourceStatus };
  }
}
