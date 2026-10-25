import { NationalAverage, SourceStatus } from '../types';
import { fetchWithRetry } from '../utils';

export interface OpenVanResult {
  averages?: Record<string, NationalAverage>;
  rawLtData?: any;
  status: SourceStatus;
}

export async function fetchOpenVanPrices(): Promise<OpenVanResult> {
  const startTime = Date.now();
  const url = 'https://openvan.camp/api/fuel/prices';

  const sourceStatus: SourceStatus = {
    id: 'openvan-camp',
    name: 'OpenVan.camp',
    description: 'Atviras Europos degalų kainų API (CC BY 4.0)',
    type: 'national_average',
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
      next: { revalidate: 3600 }
    });

    sourceStatus.latencyMs = Date.now() - startTime;

    if (!res.ok) {
      sourceStatus.status = 'degraded';
      sourceStatus.errorMessage = `HTTP ${res.status}`;
      return { status: sourceStatus };
    }

    const json = await res.json();
    const lt = json?.data?.LT;

    if (!lt || !lt.prices) {
      sourceStatus.status = 'degraded';
      sourceStatus.errorMessage = 'Nėra Lietuvos duomenų OpenVan atsakyme';
      return { status: sourceStatus };
    }

    sourceStatus.lastSuccess = new Date().toISOString();
    const asOf = lt.fetched_at || new Date().toISOString();

    const averages: Record<string, NationalAverage> = {};

    if (lt.prices.gasoline) {
      averages.gasoline_95 = {
        fuelType: 'gasoline_95',
        fuelName: 'Euro 95 Benzinas',
        price: parseFloat(lt.prices.gasoline),
        diffFromLastWeek: lt.price_changes?.gasoline ?? undefined,
        currency: lt.currency || 'EUR',
        asOf,
        source: 'OpenVan.camp (median)'
      };
    }

    if (lt.prices.diesel) {
      averages.diesel = {
        fuelType: 'diesel',
        fuelName: 'Dyzelinas',
        price: parseFloat(lt.prices.diesel),
        diffFromLastWeek: lt.price_changes?.diesel ?? undefined,
        currency: lt.currency || 'EUR',
        asOf,
        source: 'OpenVan.camp (median)'
      };
    }

    if (lt.prices.lpg) {
      averages.lpg = {
        fuelType: 'lpg',
        fuelName: 'Suskystintos Dujos (LPG)',
        price: parseFloat(lt.prices.lpg),
        diffFromLastWeek: lt.price_changes?.lpg ?? undefined,
        currency: lt.currency || 'EUR',
        asOf,
        source: 'OpenVan.camp (median)'
      };
    }

    return {
      averages,
      rawLtData: lt,
      status: sourceStatus
    };
  } catch (err: any) {
    sourceStatus.status = 'degraded';
    sourceStatus.latencyMs = Date.now() - startTime;
    sourceStatus.errorMessage = err.message || 'Nepavyko prisijungti prie OpenVan';
    return { status: sourceStatus };
  }
}
