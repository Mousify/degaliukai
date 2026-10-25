import { RawFuelPrice, SourceStatus } from '../types';
import { fetchWithRetry } from '../utils';

export interface DegaluKainaLtResult {
  prices: RawFuelPrice[];
  status: SourceStatus;
}

/**
 * Known major brand network slugs on degalu-kaina.lt.
 * Each page embeds a `const stations = { "type": "FeatureCollection", ... }` GeoJSON
 * with real coordinates and TODAY's prices. Page date is typically the same day.
 */
const BRAND_SLUGS = [
  'ab-orlen-baltics-retail',
  'alausa',
  'baltic-petroleum',
  'circle-k',
  'emsi',
  'eniris',
  'jozita',
  'madalva',
  'neste-lietuva',
  'saurida',
  'skulas',
  'stateta',
  'trevena',
  'uab-boost-petrol',
  'uab-viada-lt',
];

interface GeoJsonFeature {
  type: string;
  geometry: { type: string; coordinates: [number, number] };
  properties: {
    id: number;
    url: string;
    company: string;
    city: string;
    address: string;
    petrol: number | null;
    diesel: number | null;
    lpg: number | null;
  };
}

function normalizeBrand(raw: string): string {
  const b = (raw || '').trim();
  if (b.includes('Circle K')) return 'Circle K';
  if (b.includes('Neste')) return 'Neste';
  if (b.includes('Viada') || b.includes('VIADA')) return 'Viada';
  if (b.includes('Orlen') || b.includes('ORLEN')) return 'Orlen';
  if (b.includes('Baltic Petroleum')) return 'Baltic Petroleum';
  if (b.includes('Emsi')) return 'Emsi';
  if (b.includes('Saurida')) return 'Saurida';
  if (b.includes('Jozita')) return 'Jozita';
  if (b.includes('Alauša') || b.includes('Alausa')) return 'Alauša';
  if (b.includes('Stateta')) return 'Stateta';
  if (b.includes('Skulas')) return 'Skulas';
  if (b.includes('Trevena')) return 'Trevena';
  if (b.includes('Madalva')) return 'Madalva';
  if (b.includes('Eniris')) return 'Eniris';
  if (b.includes('Boost')) return 'Boost';
  return b;
}

/**
 * Parse the inline GeoJSON from a /degaliniu-tinklai/<slug> page.
 * The page embeds: const stations = { "type": "FeatureCollection", "features": [...] };
 */
function parseGeoJsonFromPage(html: string): GeoJsonFeature[] {
  const startIdx = html.indexOf('const stations = ');
  if (startIdx === -1) return [];

  // Find the end: look for "};\n" after the opening brace
  const jsonStart = startIdx + 17;
  let depth = 0;
  let i = jsonStart;
  for (; i < html.length; i++) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}') {
      depth--;
      if (depth === 0) { i++; break; }
    }
  }
  const jsonStr = html.substring(jsonStart, i);
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
      return parsed.features as GeoJsonFeature[];
    }
  } catch {
    // fallback: try simpler terminator approach
    try {
      const end2 = html.indexOf(';\n', jsonStart);
      if (end2 !== -1) {
        const parsed2 = JSON.parse(html.substring(jsonStart, end2));
        if (parsed2.type === 'FeatureCollection' && Array.isArray(parsed2.features)) {
          return parsed2.features as GeoJsonFeature[];
        }
      }
    } catch { /* ignore */ }
  }
  return [];
}

/**
 * Extract the "prices updated" date from the page (looks for a date pattern in text).
 * degalu-kaina.lt pages show dates like 2026-10-16 in their narrative text.
 */
function extractPageDate(html: string): string | null {
  // Match dates in the main narrative, e.g. "šiandien (2026-10-16):"
  const m = html.match(/\((\d{4}-\d{2}-\d{2})\)/);
  if (m) return m[1];
  // Fallback: find any ISO date near "kainos"
  const m2 = html.match(/(\d{4}-\d{2}-\d{2})/);
  if (m2) return m2[1];
  return null;
}

/**
 * Scrapes all major brand network pages from degalu-kaina.lt.
 * Each page embeds GeoJSON with per-station lat/lng and current prices.
 * This source provides FRESH data (updated daily from LEA/official data).
 */
export async function scrapeDegaluKainaLt(): Promise<DegaluKainaLtResult> {
  const startTime = Date.now();
  const nowIso = new Date().toISOString();

  const sourceStatus: SourceStatus = {
    id: 'degalu-kaina-lt',
    name: 'Degalu-Kaina.lt Tinklų Kainos',
    description: 'Kasdien atnaujinaimos Lietuvos degalinių kainos pagal LEA duomenis (oficialūs per tinklų puslapius)',
    type: 'live_station',
    status: 'online',
    stationsCount: 0,
    lastChecked: nowIso
  };

  const normalized: RawFuelPrice[] = [];
  const seen = new Set<string>();
  let totalStations = 0;
  let anySuccess = false;

  // Fetch all brand pages in parallel (batched to be polite)
  const BATCH = 5;
  for (let b = 0; b < BRAND_SLUGS.length; b += BATCH) {
    const batch = BRAND_SLUGS.slice(b, b + BATCH);
    const results = await Promise.allSettled(
      batch.map(async (slug) => {
        const url = `https://degalu-kaina.lt/degaliniu-tinklai/${slug}`;
        const res = await fetchWithRetry(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'lt-LT,lt;q=0.9',
          },
          next: { revalidate: 3600 }
        });
        if (!res.ok) return { slug, features: [], pageDate: null };
        const html = await res.text();
        const features = parseGeoJsonFromPage(html);
        const pageDate = extractPageDate(html);
        return { slug, features, pageDate };
      })
    );

    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      const { features, pageDate } = result.value;
      if (!features || features.length === 0) continue;

      anySuccess = true;
      // Use the page's displayed date if available and recent, otherwise now
      const updatedDate = pageDate ? `${pageDate}T12:00:00Z` : nowIso;
      // Validate date is recent (within 30 days)
      const pageAgeMs = Date.now() - new Date(updatedDate).getTime();
      const effectiveUpdatedAt = pageAgeMs < 30 * 24 * 3600 * 1000 ? updatedDate : nowIso;

      for (const f of features) {
        const props = f.properties;
        const [lng, lat] = f.geometry.coordinates;
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) continue;

        const brand = normalizeBrand(props.company || '');
        const address = props.address || '';
        const city = props.city || '';
        const stationId = `dkl-${props.id}`;

        // Deduplicate by station id
        const key95 = `${stationId}-95`;
        const keyD = `${stationId}-d`;
        const keyLpg = `${stationId}-lpg`;

        if (props.petrol && props.petrol >= 1.45 && props.petrol <= 2.80 && !seen.has(key95)) {
          seen.add(key95);
          normalized.push({
            stationId,
            brand,
            name: `${brand} ${address}`,
            address,
            lat,
            lng,
            fuelType: 'gasoline_95',
            pricePerLiter: props.petrol,
            currency: 'EUR',
            sourceName: 'Degalu-kaina.lt',
            sourceUpdatedAt: effectiveUpdatedAt,
            fetchedAt: nowIso
          });
          totalStations++;
        }

        if (props.diesel && props.diesel >= 1.45 && props.diesel <= 2.80 && !seen.has(keyD)) {
          seen.add(keyD);
          normalized.push({
            stationId,
            brand,
            name: `${brand} ${address}`,
            address,
            lat,
            lng,
            fuelType: 'diesel',
            pricePerLiter: props.diesel,
            currency: 'EUR',
            sourceName: 'Degalu-kaina.lt',
            sourceUpdatedAt: effectiveUpdatedAt,
            fetchedAt: nowIso
          });
        }

        if (props.lpg && props.lpg >= 0.50 && props.lpg <= 1.40 && !seen.has(keyLpg)) {
          seen.add(keyLpg);
          normalized.push({
            stationId,
            brand,
            name: `${brand} ${address}`,
            address,
            lat,
            lng,
            fuelType: 'lpg',
            pricePerLiter: props.lpg,
            currency: 'EUR',
            sourceName: 'Degalu-kaina.lt',
            sourceUpdatedAt: effectiveUpdatedAt,
            fetchedAt: nowIso
          });
        }
      }
    }
  }

  sourceStatus.lastSuccess = anySuccess ? nowIso : undefined;
  sourceStatus.stationsCount = totalStations;
  sourceStatus.latencyMs = Date.now() - startTime;
  if (!anySuccess) {
    sourceStatus.status = 'degraded';
    sourceStatus.errorMessage = 'Nepavyko nuskaityti nei vieno tinklo puslapio';
  }

  return { prices: normalized, status: sourceStatus };
}
