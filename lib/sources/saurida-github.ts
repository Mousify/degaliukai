import { RawFuelPrice, SourceStatus } from '../types';
import { fetchWithRetry } from '../utils';

export interface SauridaResult {
  prices: RawFuelPrice[];
  rawMap: Record<string, any>;
  status: SourceStatus;
}

// Known coordinates and addresses for Saurida stations
const SAURIDA_METADATA: Record<string, { name: string; address: string; city: string; lat: number; lng: number }> = {
  vilnius_staneviciaus_g_3a: {
    name: 'Saurida Stanevičiaus',
    address: 'S. Stanevičiaus g. 3A',
    city: 'Vilnius',
    lat: 54.7241,
    lng: 25.2539
  },
  vilnius_rygos_g_2b: {
    name: 'Saurida Rygos',
    address: 'Rygos g. 2B',
    city: 'Vilnius',
    lat: 54.7176,
    lng: 25.2215
  },
  marijampole: {
    name: 'Saurida Marijampolė',
    address: 'Kauno g. 118',
    city: 'Marijampolė',
    lat: 54.5689,
    lng: 23.3645
  },
  silale: {
    name: 'Saurida Šilalė',
    address: 'Rytinio kelio g. 1',
    city: 'Šilalė',
    lat: 55.4891,
    lng: 22.1954
  },
  domeikava: {
    name: 'Saurida Domeikava',
    address: 'Vandžiogalos pl. 106',
    city: 'Domeikava',
    lat: 54.9682,
    lng: 23.9214
  },
  velziai: {
    name: 'Saurida Velžys',
    address: 'Alantos g. 2',
    city: 'Velžys',
    lat: 55.7021,
    lng: 24.4251
  },
  visaginas: {
    name: 'Saurida Visaginas',
    address: 'Taikos pr. 80D',
    city: 'Visaginas',
    lat: 55.5912,
    lng: 26.4389
  },
  kusliskiai: {
    name: 'Saurida Kušliškiai',
    address: 'Kušliškių k.',
    city: 'Kalvarija',
    lat: 54.4123,
    lng: 23.2104
  },
  pasvenciai: {
    name: 'Saurida Pašvenčiai',
    address: 'Pašvenčių k.',
    city: 'Jurbarkas',
    lat: 55.0812,
    lng: 22.7541
  },
  mauruciai: {
    name: 'Saurida Mauručiai',
    address: 'Mauručių k.',
    city: 'Veiveriai',
    lat: 54.7782,
    lng: 23.7712
  }
};

export async function fetchSauridaGithubPrices(): Promise<SauridaResult> {
  const startTime = Date.now();
  const url = 'https://raw.githubusercontent.com/erkexzcx/saurida-fuel-prices/main/prices.json';

  const sourceStatus: SourceStatus = {
    id: 'saurida-github',
    name: 'Saurida Community GitHub',
    description: 'Atviro kodo Saurida degalinių kainų archyvas (erkexzcx)',
    type: 'supplementary',
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
      next: { revalidate: 1800 }
    });

    sourceStatus.latencyMs = Date.now() - startTime;

    if (!res.ok) {
      sourceStatus.status = 'degraded';
      sourceStatus.errorMessage = `HTTP ${res.status}`;
      return { prices: [], rawMap: {}, status: sourceStatus };
    }

    const json = await res.json();
    sourceStatus.lastSuccess = new Date().toISOString();

    const normalized: RawFuelPrice[] = [];
    const stationKeys = Object.keys(json);
    sourceStatus.stationsCount = stationKeys.length;

    // Detect if GitHub archive data is stale (e.g. from 2024/2025 where gasoline was 1.35)
    // In current 2026 Lithuania, diesel and 95 gasoline are ~1.80 - 2.25 EUR.
    // If prices in the repo are under 1.50 EUR, mark source as historical archive and skip injecting them as live
    let isArchiveStale = false;
    for (const key of stationKeys) {
      const p = json[key];
      if (p.benzinas_a95_e5 && p.benzinas_a95_e5 < 1.50) {
        isArchiveStale = true;
        break;
      }
    }

    if (isArchiveStale) {
      sourceStatus.status = 'degraded';
      sourceStatus.errorMessage = 'Archyviniai duomenys (kainos pasenusios, < 1.50 €/l, atmetama apsaugai nuo iškraipymo)';
      return { prices: [], rawMap: json, status: sourceStatus };
    }

    const nowIso = new Date().toISOString();
    for (const key of stationKeys) {
      const p = json[key];
      const meta = SAURIDA_METADATA[key] || {
        name: `Saurida ${key.replace(/_/g, ' ')}`,
        address: `${key.replace(/_/g, ' ')}`,
        city: 'Lietuva',
        lat: 55.1694 + (Math.random() - 0.5) * 1.5,
        lng: 23.8813 + (Math.random() - 0.5) * 2.0
      };

      const stationId = `saurida-${key}`;

      if (p.benzinas_a95_e5 && p.benzinas_a95_e5 >= 1.50) {
        normalized.push({
          stationId,
          brand: 'Saurida',
          name: meta.name,
          address: meta.address,
          lat: meta.lat,
          lng: meta.lng,
          fuelType: 'gasoline_95',
          pricePerLiter: p.benzinas_a95_e5,
          currency: 'EUR',
          sourceName: 'Saurida GitHub',
          sourceUpdatedAt: nowIso,
          fetchedAt: nowIso
        });
      }

      if (p.dyzelinas_b7 && p.dyzelinas_b7 >= 1.50) {
        normalized.push({
          stationId,
          brand: 'Saurida',
          name: meta.name,
          address: meta.address,
          lat: meta.lat,
          lng: meta.lng,
          fuelType: 'diesel',
          pricePerLiter: p.dyzelinas_b7,
          currency: 'EUR',
          sourceName: 'Saurida GitHub',
          sourceUpdatedAt: nowIso,
          fetchedAt: nowIso
        });
      }

      if (p.dujos_lpg && p.dujos_lpg >= 0.50) {
        normalized.push({
          stationId,
          brand: 'Saurida',
          name: meta.name,
          address: meta.address,
          lat: meta.lat,
          lng: meta.lng,
          fuelType: 'lpg',
          pricePerLiter: p.dujos_lpg,
          currency: 'EUR',
          sourceName: 'Saurida GitHub',
          sourceUpdatedAt: nowIso,
          fetchedAt: nowIso
        });
      }
    }

    return {
      prices: normalized,
      rawMap: json,
      status: sourceStatus
    };
  } catch (err: any) {
    sourceStatus.status = 'degraded';
    sourceStatus.latencyMs = Date.now() - startTime;
    sourceStatus.errorMessage = err.message || 'Nepavyko nuskaityti Saurida GitHub kainų';
    return { prices: [], rawMap: {}, status: sourceStatus };
  }
}
