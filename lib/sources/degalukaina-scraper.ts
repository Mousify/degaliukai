import { RawFuelPrice, SourceStatus } from '../types';
import { fetchWithRetry } from '../utils';

export interface DegalukainaScraperResult {
  prices: RawFuelPrice[];
  stations: Array<{
    id: string;
    name: string;
    brand: string;
    address: string;
    city: string;
    county: string;
    lat: number;
    lng: number;
    hours?: string;
    rating?: number;
    reviews?: number;
    updatedAt: string;
    prices: {
      diesel?: number;
      gasoline_95?: number;
      gasoline_98?: number;
      lpg?: number;
    };
  }>;
  status: SourceStatus;
}

/**
 * Normalizes brand name from station title
 */
function extractBrand(title: string): string {
  const t = title.trim();
  const lower = t.toLowerCase();
  if (lower.startsWith('circle k')) return 'Circle K';
  if (lower.startsWith('neste')) return 'Neste';
  if (lower.startsWith('viada')) return 'Viada';
  if (lower.startsWith('orlen')) return 'Orlen';
  if (lower.startsWith('baltic petroleum') || lower.startsWith('bp')) return 'Baltic Petroleum';
  if (lower.startsWith('emsi')) return 'Emsi';
  if (lower.startsWith('saurida')) return 'Saurida';
  if (lower.startsWith('jozita')) return 'Jozita';
  if (lower.startsWith('alauša') || lower.startsWith('alausa')) return 'Alauša';
  if (lower.startsWith('takuras')) return 'Takuras';
  if (lower.startsWith('skulas')) return 'Skulas';
  if (lower.startsWith('stateta')) return 'Stateta';
  if (lower.startsWith('trevena')) return 'Trevena';
  if (lower.startsWith('abromika')) return 'Abromika';
  return t.split(' ')[0] || 'Nepriklausoma';
}

/**
 * Normalizes city/municipality name
 */
function extractCity(address: string, place: string): { city: string; county: string } {
  const addrParts = address.split(',').map((s) => s.trim());
  let city = addrParts[0] || 'Lietuva';
  
  if (city.endsWith(' k.') || city.endsWith(' kaimas')) {
    city = place.replace(/\s*(sav\.?|r\.|m\.)/gi, '').trim() || city;
  }

  // Known major cities
  const lowerAddr = address.toLowerCase();
  if (lowerAddr.includes('vilnius') || lowerAddr.includes('vilniaus')) city = 'Vilnius';
  else if (lowerAddr.includes('kaunas') || lowerAddr.includes('kauno')) city = 'Kaunas';
  else if (lowerAddr.includes('klaipėda') || lowerAddr.includes('klaipėdos')) city = 'Klaipėda';
  else if (lowerAddr.includes('šiauliai') || lowerAddr.includes('šiaulių')) city = 'Šiauliai';
  else if (lowerAddr.includes('panevėžys') || lowerAddr.includes('panevėžio')) city = 'Panevėžys';
  else if (lowerAddr.includes('alytus') || lowerAddr.includes('alytaus')) city = 'Alytus';
  else if (lowerAddr.includes('marijampolė') || lowerAddr.includes('marijampolės')) city = 'Marijampolė';
  else if (lowerAddr.includes('mažeikiai') || lowerAddr.includes('mažeikių')) city = 'Mažeikiai';
  else if (lowerAddr.includes('utena') || lowerAddr.includes('utenos')) city = 'Utena';
  else if (lowerAddr.includes('kėdainiai') || lowerAddr.includes('kėdainių')) city = 'Kėdainiai';
  else if (lowerAddr.includes('telšiai') || lowerAddr.includes('telšių')) city = 'Telšiai';
  else if (lowerAddr.includes('tauragė') || lowerAddr.includes('tauragės')) city = 'Tauragė';

  const county = place ? `${place}` : `${city} sav.`;
  return { city, county };
}

/**
 * Parses all fuel table rows from a degalukaina.lt HTML page
 */
function parseStationsFromPageHtml(
  html: string,
  nowIso: string,
  stationsMap: Map<string, DegalukainaScraperResult['stations'][0]>,
  pricesList: RawFuelPrice[]
) {
  const rowRegex = /<tr([^>]*)>([\s\S]*?)<\/tr>/gi;
  let match: RegExpExecArray | null;

  while ((match = rowRegex.exec(html)) !== null) {
    const trAttrs = match[1];
    const trContent = match[2];

    if (trAttrs.includes('date-row')) continue;

    const latMatch = trAttrs.match(/data-lat="([^"]+)"/);
    const lonMatch = trAttrs.match(/data-lon="([^"]+)"/);
    if (!latMatch || !lonMatch) continue;

    const lat = parseFloat(latMatch[1]);
    const lng = parseFloat(lonMatch[1]);
    if (isNaN(lat) || isNaN(lng)) continue;

    const stationId = `dk-${lat.toFixed(4)}-${lng.toFixed(4)}`;
    if (stationsMap.has(stationId)) continue; // Avoid duplicate rows across pages

    const updatedMatch = trAttrs.match(/data-updated="([^"]+)"/);
    const hoursMatch = trAttrs.match(/data-hours="([^"]+)"/);
    const ratingMatch = trAttrs.match(/data-rating="([^"]+)"/);
    const reviewsMatch = trAttrs.match(/data-reviews="([^"]+)"/);

    const nameMatch = trContent.match(/class="stationName"[^>]*>([^<]+)<\/a>/i);
    const rawName = nameMatch ? nameMatch[1].trim() : 'Degalinė';

    const placeMatch = trContent.match(/data-place="([^"]+)"/i);
    const place = placeMatch ? placeMatch[1].trim() : '';

    const addrMatch = trContent.match(/class="js-addr[^"]*"[^>]*>\s*<span>([^<]+)<\/span>/i);
    const address = addrMatch ? addrMatch[1].trim() : '';

    // Prices extraction
    const dieselMatch = trContent.match(/class="fuel\s+diesel"[^>]*>([0-9\.]+)<\/span>/i);
    const b95Match = trContent.match(/class="fuel\s+b95"[^>]*>([0-9\.]+)<\/span>/i);
    const b98Match = trContent.match(/class="fuel\s+b98"[^>]*>([0-9\.]+)<\/span>/i);
    const lpgMatch = trContent.match(/class="fuel\s+lpg"[^>]*>([0-9\.]+)<\/span>/i);

    const diesel = dieselMatch ? parseFloat(dieselMatch[1]) : undefined;
    const b95 = b95Match ? parseFloat(b95Match[1]) : undefined;
    const b98 = b98Match ? parseFloat(b98Match[1]) : undefined;
    const lpg = lpgMatch ? parseFloat(lpgMatch[1]) : undefined;

    // Price sanity filter: In Lithuania, diesel and 95 are typically 1.40 - 2.80 EUR.
    const validDiesel = diesel && diesel >= 1.40 && diesel <= 2.80 ? diesel : undefined;
    const validB95 = b95 && b95 >= 1.40 && b95 <= 2.80 ? b95 : undefined;
    const validB98 = b98 && b98 >= 1.50 && b98 <= 2.95 ? b98 : undefined;
    const validLpg = lpg && lpg >= 0.50 && lpg <= 1.40 ? lpg : undefined;

    const brand = extractBrand(rawName);
    const { city, county } = extractCity(address, place);
    const updatedAtStr = updatedMatch ? `${updatedMatch[1]}T12:00:00.000Z` : nowIso;

    const stationData = {
      id: stationId,
      name: rawName,
      brand,
      address: address || place,
      city,
      county,
      lat,
      lng,
      hours: hoursMatch ? hoursMatch[1] : undefined,
      rating: ratingMatch ? parseFloat(ratingMatch[1]) : undefined,
      reviews: reviewsMatch ? parseInt(reviewsMatch[1], 10) : undefined,
      updatedAt: updatedAtStr,
      prices: {
        diesel: validDiesel,
        gasoline_95: validB95,
        gasoline_98: validB98,
        lpg: validLpg
      }
    };

    stationsMap.set(stationId, stationData);

    if (validDiesel) {
      pricesList.push({
        stationId,
        brand,
        name: rawName,
        address,
        lat,
        lng,
        fuelType: 'diesel',
        pricePerLiter: validDiesel,
        currency: 'EUR',
        sourceName: 'Degalukaina.lt',
        sourceUpdatedAt: updatedAtStr,
        fetchedAt: nowIso
      });
    }

    if (validB95) {
      pricesList.push({
        stationId,
        brand,
        name: rawName,
        address,
        lat,
        lng,
        fuelType: 'gasoline_95',
        pricePerLiter: validB95,
        currency: 'EUR',
        sourceName: 'Degalukaina.lt',
        sourceUpdatedAt: updatedAtStr,
        fetchedAt: nowIso
      });
    }

    if (validB98) {
      pricesList.push({
        stationId,
        brand,
        name: rawName,
        address,
        lat,
        lng,
        fuelType: 'gasoline_98',
        pricePerLiter: validB98,
        currency: 'EUR',
        sourceName: 'Degalukaina.lt',
        sourceUpdatedAt: updatedAtStr,
        fetchedAt: nowIso
      });
    }

    if (validLpg) {
      pricesList.push({
        stationId,
        brand,
        name: rawName,
        address,
        lat,
        lng,
        fuelType: 'lpg',
        pricePerLiter: validLpg,
        currency: 'EUR',
        sourceName: 'Degalukaina.lt',
        sourceUpdatedAt: updatedAtStr,
        fetchedAt: nowIso
      });
    }
  }
}

export async function scrapeDegalukaina(): Promise<DegalukainaScraperResult> {
  const startTime = Date.now();
  const baseUrl = 'https://degalukaina.lt';

  const sourceStatus: SourceStatus = {
    id: 'degalukaina-lt-crawler',
    name: 'Degalukaina.lt Live Scraper',
    description: 'Tiesioginis virš 730 Lietuvos degalinių kainų nuskaitymas realiu laiku iš visų puslapių',
    type: 'live_station',
    status: 'online',
    stationsCount: 0,
    lastChecked: new Date().toISOString()
  };

  const reqHeaders = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  };

  try {
    // 1. Fetch Page 1
    const res1 = await fetchWithRetry(baseUrl, {
      headers: reqHeaders,
      next: { revalidate: 900 } // Cache for 15 mins
    });

    if (!res1.ok) {
      sourceStatus.status = 'degraded';
      sourceStatus.errorMessage = `HTTP ${res1.status}: ${res1.statusText}`;
      sourceStatus.latencyMs = Date.now() - startTime;
      return { prices: [], stations: [], status: sourceStatus };
    }

    const html1 = await res1.text();
    sourceStatus.lastSuccess = new Date().toISOString();

    const normalizedPrices: RawFuelPrice[] = [];
    const stationsMap = new Map<string, DegalukainaScraperResult['stations'][0]>();
    const nowIso = new Date().toISOString();

    // Parse Page 1
    parseStationsFromPageHtml(html1, nowIso, stationsMap, normalizedPrices);

    // Detect total pages (from pagination links, e.g., ?page=19)
    const pageMatches = [...html1.matchAll(/[?&]page=(\d+)/g)].map((m) => parseInt(m[1], 10));
    const maxPages = pageMatches.length > 0 ? Math.max(...pageMatches) : 19;

    // 2. Fetch remaining pages (2..maxPages) with controlled concurrency
    const remainingPages = Array.from({ length: maxPages - 1 }, (_, i) => i + 2);
    const concurrency = 6;

    for (let i = 0; i < remainingPages.length; i += concurrency) {
      const pageBatch = remainingPages.slice(i, i + concurrency);
      await Promise.all(
        pageBatch.map(async (pageNum) => {
          try {
            const pageUrl = `${baseUrl}/?page=${pageNum}`;
            const res = await fetchWithRetry(pageUrl, {
              headers: reqHeaders,
              next: { revalidate: 900 }
            });
            if (res.ok) {
              const pageHtml = await res.text();
              parseStationsFromPageHtml(pageHtml, nowIso, stationsMap, normalizedPrices);
            }
          } catch (pageErr) {
            console.warn(`[Degalukaina Scraper] Warning on page ${pageNum}:`, pageErr);
          }
        })
      );
    }

    const stationsList = Array.from(stationsMap.values());
    sourceStatus.latencyMs = Date.now() - startTime;
    sourceStatus.stationsCount = stationsList.length;

    return {
      prices: normalizedPrices,
      stations: stationsList,
      status: sourceStatus
    };
  } catch (err: any) {
    sourceStatus.status = 'degraded';
    sourceStatus.latencyMs = Date.now() - startTime;
    sourceStatus.errorMessage = err.message || 'Klaida nuskaitant Degalukaina.lt';
    return { prices: [], stations: [], status: sourceStatus };
  }
}
