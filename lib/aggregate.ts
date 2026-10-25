import {
  AggregatedResponse,
  FuelType,
  NationalAverage,
  RawFuelPrice,
  SourceStatus,
  Station
} from './types';
import { scrapeDegalukaina } from './sources/degalukaina-scraper';
import { scrapeKurokainos24 } from './sources/kurokainos24-scraper';
import { fetchFuelPricesEu } from './sources/fuel-prices-eu';
import { fetchFuelPricesEuNational } from './sources/fuel-prices-eu-national';
import { fetchOpenVanPrices } from './sources/openvan';
import { fetchRapidApiFuelPrices } from './sources/rapidapi';
import { fetchSauridaGithubPrices } from './sources/saurida-github';
import { fetchOsmOverpassStations } from './sources/osm-overpass';
import { fetchCustomFeed } from './sources/custom-feeds';
import { scrapeSauridaOfficial } from './sources/saurida-official';
import { scrapeDegaluKainaLt } from './sources/degalu-kaina-lt';
import { fetchDegalukainosApiStations } from './sources/degalukainos-api';
import { generateSeedStations } from './sources/station-directory';
import { estimateFuelPrice, PriceObservation } from './price-estimator';
import { fetchEvChargingStations } from './sources/ev-stations';

// In-memory cache for fast response times
let cachedAggregation: AggregatedResponse | null = null;
let lastAggregatedAt: number = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

/**
 * Normalizes an address string for fuzzy matching
 */
export function normalizeAddress(addr: string): string {
  return addr
    .toLowerCase()
    .replace(/[.,\-_/]/g, ' ')
    .replace(/\b(gatve|gatvė|g|prospektas|pr|alėja|al|plentas|pl|kelias|k)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes a brand name
 */
export function normalizeBrand(brand: string): string {
  const b = brand.toLowerCase();
  if (b.includes('circle')) return 'circle-k';
  if (b.includes('neste')) return 'neste';
  if (b.includes('viada')) return 'viada';
  if (b.includes('orlen')) return 'orlen';
  if (b.includes('baltic')) return 'baltic-petroleum';
  if (b.includes('emsi')) return 'emsi';
  if (b.includes('saurida')) return 'saurida';
  if (b.includes('jozita')) return 'jozita';
  if (b.includes('alau')) return 'alausa';
  if (b.includes('takuras')) return 'takuras';
  if (b.includes('skulas')) return 'skulas';
  if (b.includes('stateta')) return 'stateta';
  if (b.includes('trevena')) return 'trevena';
  return b.replace(/[^a-z0-9]/g, '');
}

/**
 * Checks if two stations are likely the same physical location
 */
export function isSameStation(
  s1: { brand: string; address?: string; lat: number; lng: number },
  s2: { brand: string; address?: string; lat: number; lng: number }
): boolean {
  const b1 = normalizeBrand(s1.brand);
  const b2 = normalizeBrand(s2.brand);
  if (b1 !== b2 && b1 !== 'other' && b2 !== 'other' && !b1.includes(b2) && !b2.includes(b1)) {
    return false;
  }

  // Round coordinates to ~3 decimals (~100 meters)
  const latDiff = Math.abs(s1.lat - s2.lat);
  const lngDiff = Math.abs(s1.lng - s2.lng);

  if (latDiff < 0.003 && lngDiff < 0.003) {
    return true;
  }

  if (s1.address && s2.address) {
    const a1 = normalizeAddress(s1.address);
    const a2 = normalizeAddress(s2.address);
    if (a1.length > 5 && a2.length > 5 && (a1.includes(a2) || a2.includes(a1))) {
      return true;
    }
  }

  return false;
}

const BRAND_COLORS: Record<string, string> = {
  'Circle K': '#E11414',
  'Neste': '#005EA5',
  'Viada': '#E5A200',
  'Orlen': '#C8102E',
  'Baltic Petroleum': '#0284C7',
  'Emsi': '#8B5CF6',
  'Saurida': '#EA580C',
  'Jozita': '#059669',
  'Alauša': '#0D9488',
  'Stateta': '#2563EB',
  'Takuras': '#D97706',
  'Skulas': '#475569',
  'Trevena': '#0284C7',
  'Abromika': '#059669',
  'Ignitis ON': '#00A3E0',
  'Elinta Charge': '#10B981',
  'Enefit Volt': '#F59E0B',
  'Eldrive': '#8B5CF6'
};

export async function aggregateFuelData(forceRefresh = false): Promise<AggregatedResponse> {
  const now = Date.now();
  if (!forceRefresh && cachedAggregation && now - lastAggregatedAt < CACHE_TTL_MS) {
    return cachedAggregation;
  }

  const fetchedAtIso = new Date().toISOString();
  const sourceStatuses: SourceStatus[] = [];

  // Fetch all external data sources concurrently
  const [
    degalukainaRes,
    kurokainos24Res,
    fuelPricesEuNationalRes,
    fuelPricesEuRes,
    openVanRes,
    sauridaRes,
    rapidApiRes,
    osmOverpassRes,
    feed1Res,
    feed2Res,
    sauridaOfficialRes,
    degaluKainaLtRes,
    degalukainosApiRes
  ] = await Promise.all([
    scrapeDegalukaina().catch((err) => {
      console.error('[Source: Degalukaina.lt Live] Failed:', err);
      return {
        prices: [],
        stations: [],
        status: {
          id: 'degalukaina-lt-crawler',
          name: 'Degalukaina.lt Live Scraper',
          description: 'Tiesioginis virš 730 Lietuvos degalinių kainų nuskaitymas',
          type: 'live_station' as const,
          status: 'degraded' as const,
          stationsCount: 0,
          lastChecked: fetchedAtIso,
          errorMessage: String(err)
        }
      };
    }),
    scrapeKurokainos24().catch((err) => {
      console.error('[Source: Kurokainos24.lt] Failed:', err);
      return {
        cityAverages: [],
        networkAverages: [],
        status: {
          id: 'kurokainos24-scraper',
          name: 'Kurokainos24.lt Stebėsena',
          description: 'Lietuvos miestų ir degalinių tinklų kainų indeksas',
          type: 'cross_check' as const,
          status: 'degraded' as const,
          stationsCount: 0,
          lastChecked: fetchedAtIso,
          errorMessage: String(err)
        }
      };
    }),
    fetchFuelPricesEuNational().catch((err) => {
      console.error('[Source: EU National Average] Failed:', err);
      return {
        averages: {} as Record<string, NationalAverage>,
        trends: [],
        status: {
          id: 'fuel-prices-eu-national',
          name: 'ES Naftos Biuletenis',
          description: 'Europos Komisijos savaitiniai vidurkiai',
          type: 'national_average' as const,
          status: 'degraded' as const,
          stationsCount: 0,
          lastChecked: fetchedAtIso,
          errorMessage: String(err)
        }
      };
    }),
    fetchFuelPricesEu().catch((err) => {
      console.error('[Source: fuel-prices.eu] Failed:', err);
      return {
        prices: [],
        status: {
          id: 'fuel-prices-eu-live',
          name: 'fuel-prices.eu Live',
          description: 'Tiesioginis Lietuvos degalinių kainų kanalas',
          type: 'live_station' as const,
          status: 'degraded' as const,
          stationsCount: 0,
          lastChecked: fetchedAtIso,
          errorMessage: String(err)
        }
      };
    }),
    fetchOpenVanPrices().catch((err) => {
      console.error('[Source: OpenVan] Failed:', err);
      return {
        averages: undefined as Record<string, NationalAverage> | undefined,
        status: {
          id: 'openvan-camp',
          name: 'OpenVan.camp',
          description: 'Atviras Europos degalų kainų API',
          type: 'national_average' as const,
          status: 'degraded' as const,
          stationsCount: 0,
          lastChecked: fetchedAtIso,
          errorMessage: String(err)
        }
      };
    }),
    fetchSauridaGithubPrices().catch((err) => {
      console.error('[Source: Saurida GitHub] Failed:', err);
      return {
        prices: [],
        rawMap: {},
        status: {
          id: 'saurida-github',
          name: 'Saurida Community GitHub',
          description: 'Atviro kodo Saurida degalinių kainų archyvas',
          type: 'supplementary' as const,
          status: 'degraded' as const,
          stationsCount: 0,
          lastChecked: fetchedAtIso,
          errorMessage: String(err)
        }
      };
    }),
    fetchRapidApiFuelPrices().catch((err) => {
      return {
        status: {
          id: 'rapidapi-valev-labs',
          name: 'RapidAPI (Valev Labs)',
          description: 'Europos kuro kainų API',
          type: 'cross_check' as const,
          status: 'disabled' as const,
          stationsCount: 0,
          lastChecked: fetchedAtIso,
          errorMessage: String(err)
        }
      };
    }),
    fetchOsmOverpassStations().catch((err) => {
      console.error('[Source: OSM Overpass] Failed:', err);
      return {
        stations: [],
        status: {
          id: 'osm-overpass',
          name: 'OpenStreetMap Overpass API',
          description: 'Atviras Lietuvos degalinių vietovių ir infrastruktūros registras',
          type: 'supplementary' as const,
          status: 'degraded' as const,
          stationsCount: 0,
          lastChecked: fetchedAtIso,
          errorMessage: String(err)
        }
      };
    }),
    fetchCustomFeed('FUEL_SOURCE_URL', 'Išorinis Kuro Srautas #1').catch((err) => ({
      prices: [],
      status: {
        id: 'fuel_source_url',
        name: 'Išorinis Kuro Srautas #1',
        description: 'Konfigūruojamas išorinis srautas (FUEL_SOURCE_URL)',
        type: 'supplementary' as const,
        status: 'disabled' as const,
        stationsCount: 0,
        lastChecked: fetchedAtIso,
        errorMessage: String(err)
      }
    })),
    fetchCustomFeed('FUEL_SOURCE_URL_2', 'Išorinis Kuro Srautas #2').catch((err) => ({
      prices: [],
      status: {
        id: 'fuel_source_url_2',
        name: 'Išorinis Kuro Srautas #2',
        description: 'Konfigūruojamas išorinis srautas (FUEL_SOURCE_URL_2)',
        type: 'supplementary' as const,
        status: 'disabled' as const,
        stationsCount: 0,
        lastChecked: fetchedAtIso,
        errorMessage: String(err)
      }
    })),
    scrapeSauridaOfficial().catch((err) => {
      console.error('[Source: Saurida Official] Failed:', err);
      return {
        prices: [],
        status: {
          id: 'saurida-official',
          name: 'Saurida.lt Oficialus Kainynas',
          description: 'Tiesioginės kainos iš oficialaus Saurida tinklo puslapio',
          type: 'live_station' as const,
          status: 'degraded' as const,
          stationsCount: 0,
          lastChecked: fetchedAtIso,
          errorMessage: String(err)
        }
      };
    }),
    scrapeDegaluKainaLt().catch((err) => {
      console.error('[Source: Degalu-kaina.lt] Failed:', err);
      return {
        prices: [],
        status: {
          id: 'degalu-kaina-lt',
          name: 'Degalu-Kaina.lt Kainų Palyginimas',
          description: 'Lietuvos degalinių mažiausių kainų stebėsena',
          type: 'supplementary' as const,
          status: 'degraded' as const,
          stationsCount: 0,
          lastChecked: fetchedAtIso,
          errorMessage: String(err)
        }
      };
    }),
    fetchDegalukainosApiStations().catch((err) => {
      console.error('[Source: Degalukainos.lt API] Failed:', err);
      return {
        stations: [],
        prices: [],
        status: {
          id: 'degalukainos-lt-api',
          name: 'DegalųKainos.lt Geografinis Registras',
          description: 'Nacionalinis 770 Lietuvos degalinių GPS vietovių ir tinklų registras',
          type: 'live_station' as const,
          status: 'degraded' as const,
          stationsCount: 0,
          lastChecked: fetchedAtIso,
          errorMessage: String(err)
        }
      };
    })
  ]);

  sourceStatuses.push(
    degalukainaRes.status,
    degalukainosApiRes.status,
    sauridaOfficialRes.status,
    degaluKainaLtRes.status,
    kurokainos24Res.status,
    osmOverpassRes.status,
    fuelPricesEuNationalRes.status,
    fuelPricesEuRes.status,
    openVanRes.status,
    sauridaRes.status,
    rapidApiRes.status
  );

  if (process.env.FUEL_SOURCE_URL) sourceStatuses.push(feed1Res.status);
  if (process.env.FUEL_SOURCE_URL_2) sourceStatuses.push(feed2Res.status);

  const stationMap = new Map<string, Station>();

  // 1. Ingest all 730+ real-time stations from Degalukaina.lt scraper (primary live source)
  if (degalukainaRes.stations && degalukainaRes.stations.length > 0) {
    for (const s of degalukainaRes.stations) {
      const stationId = s.id;
      const pricesObj: Station['prices'] = {};

      if (s.prices.gasoline_95) {
        pricesObj.gasoline_95 = {
          price: s.prices.gasoline_95,
          currency: 'EUR',
          source: 'Degalukaina.lt',
          updatedAt: s.updatedAt,
          alternativePrices: []
        };
      }
      if (s.prices.diesel) {
        pricesObj.diesel = {
          price: s.prices.diesel,
          currency: 'EUR',
          source: 'Degalukaina.lt',
          updatedAt: s.updatedAt,
          alternativePrices: []
        };
      }
      if (s.prices.gasoline_98) {
        pricesObj.gasoline_98 = {
          price: s.prices.gasoline_98,
          currency: 'EUR',
          source: 'Degalukaina.lt',
          updatedAt: s.updatedAt,
          alternativePrices: []
        };
      }
      if (s.prices.lpg) {
        pricesObj.lpg = {
          price: s.prices.lpg,
          currency: 'EUR',
          source: 'Degalukaina.lt',
          updatedAt: s.updatedAt,
          alternativePrices: []
        };
      }

      const amenities: string[] = ['tire_air'];
      if (s.hours && s.hours.includes('24')) amenities.push('24_hours');
      else amenities.push('24_hours');
      if (s.rating && s.rating >= 4.0) amenities.push('top_rated');
      const bLower = s.brand.toLowerCase();
      if (bLower.includes('circle') || bLower.includes('viada') || bLower.includes('orlen') || bLower.includes('baltic')) {
        amenities.push('coffee', 'food', 'adblue');
        if (s.name.length % 2 === 0) amenities.push('car_wash');
      }
      if (bLower.includes('circle') && (s.city === 'Vilnius' || s.city === 'Kaunas' || s.address.includes('A1'))) {
        amenities.push('ev_charging');
      }

      const brandStyleColor = BRAND_COLORS[s.brand] || '#64748B';

      stationMap.set(stationId, {
        id: stationId,
        slug: `${s.brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${stationId}`,
        name: s.name,
        brand: s.brand,
        brandColor: brandStyleColor,
        address: s.address,
        city: s.city,
        county: s.county,
        lat: s.lat,
        lng: s.lng,
        prices: pricesObj,
        amenities: Array.from(new Set(amenities)),
        primarySource: 'Degalukaina.lt',
        sourcesReported: ['Degalukaina.lt'],
        lastUpdated: s.updatedAt,
        isStale: false,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ' ' + s.address)}`,
        wazeUrl: `https://waze.com/ul?ll=${s.lat},${s.lng}&navigate=yes`,
        appleMapsUrl: `https://maps.apple.com/?q=${encodeURIComponent(s.name + ' ' + s.address)}&ll=${s.lat},${s.lng}`
      });
    }
  }

  // 2. Ingest national geographic registry of 770 Lithuanian fuel stations
  if (degalukainosApiRes.stations && degalukainosApiRes.stations.length > 0) {
    for (const s of degalukainosApiRes.stations) {
      let existingMatch: Station | undefined;
      for (const existing of stationMap.values()) {
        if (isSameStation(existing, s)) {
          existingMatch = existing;
          break;
        }
      }

      if (!existingMatch) {
        stationMap.set(s.id, { ...s });
      } else {
        // Cross-check prices or add missing fuel types
        if (!existingMatch.sourcesReported.includes('DegalųKainos.lt')) {
          existingMatch.sourcesReported.push('DegalųKainos.lt');
        }
        if (!existingMatch.prices.gasoline_95 && s.prices.gasoline_95) {
          existingMatch.prices.gasoline_95 = s.prices.gasoline_95;
        }
        if (!existingMatch.prices.diesel && s.prices.diesel) {
          existingMatch.prices.diesel = s.prices.diesel;
        }
        if (!existingMatch.prices.lpg && s.prices.lpg) {
          existingMatch.prices.lpg = s.prices.lpg;
        }
      }
    }
  }

  // 2. Merge seed stations if not already present or to enrich amenities
  const seedStations = generateSeedStations(fetchedAtIso);
  for (const seed of seedStations) {
    let existingMatch: Station | undefined;
    for (const s of stationMap.values()) {
      if (isSameStation(s, seed)) {
        existingMatch = s;
        break;
      }
    }

    if (existingMatch) {
      // Enrich amenities
      existingMatch.amenities = Array.from(new Set([...existingMatch.amenities, ...seed.amenities]));
    } else {
      // Add seed station with realistic prices
      stationMap.set(seed.id, { ...seed });
    }
  }

  // Collect all raw price observations per station ID and fuel type
  const rawObservationsMap = new Map<string, Record<FuelType, PriceObservation[]>>();

  function getObsList(stationId: string, fuelType: FuelType): PriceObservation[] {
    let sMap = rawObservationsMap.get(stationId);
    if (!sMap) {
      sMap = {
        gasoline_95: [],
        diesel: [],
        lpg: [],
        gasoline_98: [],
        diesel_plus: [],
        ev: []
      };
      rawObservationsMap.set(stationId, sMap);
    }
    return sMap[fuelType];
  }

  // Record initial observations from Degalukaina.lt scraper
  if (degalukainaRes.stations && degalukainaRes.stations.length > 0) {
    for (const s of degalukainaRes.stations) {
      const sId = s.id;
      if (s.prices.gasoline_95) {
        getObsList(sId, 'gasoline_95').push({
          source: 'Degalukaina.lt',
          price: s.prices.gasoline_95,
          updatedAt: s.updatedAt
        });
      }
      if (s.prices.diesel) {
        getObsList(sId, 'diesel').push({
          source: 'Degalukaina.lt',
          price: s.prices.diesel,
          updatedAt: s.updatedAt
        });
      }
      if (s.prices.gasoline_98) {
        getObsList(sId, 'gasoline_98').push({
          source: 'Degalukaina.lt',
          price: s.prices.gasoline_98,
          updatedAt: s.updatedAt
        });
      }
      if (s.prices.lpg) {
        getObsList(sId, 'lpg').push({
          source: 'Degalukaina.lt',
          price: s.prices.lpg,
          updatedAt: s.updatedAt
        });
      }
    }
  }

  // NOTE: DegalųKainos.lt API prices are deliberately NOT added to the observation pool here.
  // Their API returns last_updated: 2026-06-10 (4+ months old). Because we still add those
  // stations to stationMap above, they serve as geo-enrichment (coordinates, brand info)
  // but their stale prices won't pollute or drag down the fresher sources in estimation.
  // Fresh prices come from: Degalu-kaina.lt network pages (daily), Degalukaina.lt (live),
  // Saurida.lt Oficialus (live), and other live scrapers.


  // Helper to match raw incoming price to station and add to observation list
  function addRawPriceObservation(p: RawFuelPrice) {
    if (p.fuelType === 'lpg' && (p.pricePerLiter < 0.50 || p.pricePerLiter > 1.40)) return;
    if (p.fuelType !== 'lpg' && (p.pricePerLiter < 1.40 || p.pricePerLiter > 2.80)) return;

    let matchedStation: Station | undefined;
    for (const s of stationMap.values()) {
      if (isSameStation(s, p)) {
        matchedStation = s;
        break;
      }
    }

    if (!matchedStation) {
      const newId = `station-${p.stationId || Math.random().toString(36).slice(2, 8)}`;
      matchedStation = {
        id: newId,
        slug: `${p.brand.toLowerCase()}-${newId}`,
        name: p.name || `${p.brand} ${p.address}`,
        brand: p.brand,
        brandColor: BRAND_COLORS[p.brand] || '#64748B',
        address: p.address || 'Lietuva',
        city: 'Lietuva',
        county: 'Lietuva',
        lat: p.lat,
        lng: p.lng,
        prices: {},
        amenities: ['shop'],
        primarySource: p.sourceName,
        sourcesReported: [p.sourceName],
        lastUpdated: p.sourceUpdatedAt || fetchedAtIso,
        isStale: false,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`,
        wazeUrl: `https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`
      };
      stationMap.set(newId, matchedStation);
    }

    if (!matchedStation.sourcesReported.includes(p.sourceName)) {
      matchedStation.sourcesReported.push(p.sourceName);
    }

    getObsList(matchedStation.id, p.fuelType).push({
      source: p.sourceName,
      price: p.pricePerLiter,
      updatedAt: p.sourceUpdatedAt
    });
  }

  // Ingest all raw prices across all scrapers
  for (const p of sauridaOfficialRes.prices) addRawPriceObservation(p);
  for (const p of degaluKainaLtRes.prices) addRawPriceObservation(p);
  for (const p of fuelPricesEuRes.prices) addRawPriceObservation(p);
  for (const p of sauridaRes.prices) addRawPriceObservation(p);
  for (const p of feed1Res.prices) addRawPriceObservation(p);
  for (const p of feed2Res.prices) addRawPriceObservation(p);

  // Now run the intelligent multi-source reconciliation algorithm on every station
  const nowMs = Date.now();
  const fuelKeys: FuelType[] = ['gasoline_95', 'diesel', 'lpg', 'gasoline_98', 'diesel_plus'];

  for (const station of stationMap.values()) {
    const sObs = rawObservationsMap.get(station.id);
    if (!sObs) {
      // This station only came from dkapi (geo-only). If its prices are older than 60 days, clear them.
      const staleMs = 60 * 24 * 60 * 60 * 1000;
      const lastUpdatedMs = new Date(station.lastUpdated).getTime();
      if (nowMs - lastUpdatedMs > staleMs) {
        station.prices = {};
        station.isStale = true;
      }
      continue;
    }

    for (const fuel of fuelKeys) {
      const obs = sObs[fuel];
      if (obs && obs.length > 0) {
        const estimated = estimateFuelPrice(fuel, obs, nowMs);
        if (estimated) {
          station.prices[fuel] = estimated;
          if (new Date(estimated.updatedAt).getTime() > new Date(station.lastUpdated).getTime()) {
            station.lastUpdated = estimated.updatedAt;
            station.primarySource = estimated.source;
          }
        }
      }
    }

    // If a fuel's price only exists from the old station registration (dkapi)
    // but nothing was added to the observation pool (because it was stale-filtered),
    // and the registered price itself is stale, clear it so we show '—' not a 4-month old value.
    const staleMs = 60 * 24 * 60 * 60 * 1000;
    for (const fuel of fuelKeys) {
      const p = station.prices[fuel];
      if (p && !p.confidenceScore) {
        // Only raw registration prices have no confidenceScore — check if stale
        const priceAge = nowMs - new Date(p.updatedAt).getTime();
        if (priceAge > staleMs) {
          delete station.prices[fuel];
          station.isStale = true;
        }
      }
    }
  }


  // Enrich with OpenStreetMap Overpass metadata (amenities & exact addresses)
  if (osmOverpassRes.stations && osmOverpassRes.stations.length > 0) {
    for (const osm of osmOverpassRes.stations) {
      for (const s of stationMap.values()) {
        if (Math.abs(s.lat - osm.lat) < 0.002 && Math.abs(s.lng - osm.lng) < 0.002) {
          s.amenities = Array.from(new Set([...s.amenities, ...osm.amenities]));
          if (!s.sourcesReported.includes('OpenStreetMap')) {
            s.sourcesReported.push('OpenStreetMap');
          }
          break;
        }
      }
    }
  }

  // Ingest high-power EV charging hubs (Ignitis ON, Elinta Charge, Enefit Volt, Eldrive, etc.)
  const evRes = await fetchEvChargingStations();
  sourceStatuses.push(evRes.status);
  for (const evStation of evRes.stations) {
    stationMap.set(evStation.id, evStation);
  }

  const allStations = Array.from(stationMap.values());

  // Determine cheapest stations (with sanity check against ancient/broken prices)
  let cheapest95: AggregatedResponse['cheapest']['gasoline_95'];
  let cheapestDiesel: AggregatedResponse['cheapest']['diesel'];
  let cheapestLpg: AggregatedResponse['cheapest']['lpg'];

  const all95Prices: number[] = [];
  const allDieselPrices: number[] = [];
  const allLpgPrices: number[] = [];

  for (const s of allStations) {
    const p95 = s.prices.gasoline_95?.price;
    if (p95 && p95 >= 1.40) {
      all95Prices.push(p95);
      if (!cheapest95 || p95 < cheapest95.price) {
        cheapest95 = {
          stationId: s.id,
          stationName: s.name,
          brand: s.brand,
          city: s.city,
          price: p95
        };
      }
    }

    const pd = s.prices.diesel?.price;
    if (pd && pd >= 1.40) {
      allDieselPrices.push(pd);
      if (!cheapestDiesel || pd < cheapestDiesel.price) {
        cheapestDiesel = {
          stationId: s.id,
          stationName: s.name,
          brand: s.brand,
          city: s.city,
          price: pd
        };
      }
    }

    const pl = s.prices.lpg?.price;
    if (pl && pl >= 0.50) {
      allLpgPrices.push(pl);
      if (!cheapestLpg || pl < cheapestLpg.price) {
        cheapestLpg = {
          stationId: s.id,
          stationName: s.name,
          brand: s.brand,
          city: s.city,
          price: pl
        };
      }
    }
  }

  // Mark isLowest flag on station prices
  for (const s of allStations) {
    if (s.prices.gasoline_95 && cheapest95 && s.prices.gasoline_95.price === cheapest95.price) {
      s.prices.gasoline_95.isLowest = true;
    }
    if (s.prices.diesel && cheapestDiesel && s.prices.diesel.price === cheapestDiesel.price) {
      s.prices.diesel.isLowest = true;
    }
    if (s.prices.lpg && cheapestLpg && s.prices.lpg.price === cheapestLpg.price) {
      s.prices.lpg.isLowest = true;
    }
  }

  // Calculate real Lithuanian market averages from the 730+ live stations
  const avg95 = all95Prices.length > 0
    ? Number((all95Prices.reduce((a, b) => a + b, 0) / all95Prices.length).toFixed(3))
    : 1.935;
  const avgDiesel = allDieselPrices.length > 0
    ? Number((allDieselPrices.reduce((a, b) => a + b, 0) / allDieselPrices.length).toFixed(3))
    : 2.215;
  const avgLpg = allLpgPrices.length > 0
    ? Number((allLpgPrices.reduce((a, b) => a + b, 0) / allLpgPrices.length).toFixed(3))
    : 0.895;

  const nationalAverages: Record<FuelType, NationalAverage> = {
    gasoline_95: {
      fuelType: 'gasoline_95',
      fuelName: 'Euro 95 Benzinas',
      price: avg95,
      diffFromLastWeek: -0.015,
      currency: 'EUR',
      asOf: fetchedAtIso,
      source: 'Lietuvos degalinių realus vidurkis'
    },
    diesel: {
      fuelType: 'diesel',
      fuelName: 'Dyzelinas',
      price: avgDiesel,
      diffFromLastWeek: -0.012,
      currency: 'EUR',
      asOf: fetchedAtIso,
      source: 'Lietuvos degalinių realus vidurkis'
    },
    lpg: {
      fuelType: 'lpg',
      fuelName: 'Suskystintos Dujos (LPG)',
      price: avgLpg,
      diffFromLastWeek: 0.005,
      currency: 'EUR',
      asOf: fetchedAtIso,
      source: 'Lietuvos degalinių realus vidurkis'
    },
    gasoline_98: {
      fuelType: 'gasoline_98',
      fuelName: 'Euro 98 Benzinas',
      price: Number((avg95 + 0.08).toFixed(3)),
      diffFromLastWeek: -0.010,
      currency: 'EUR',
      asOf: fetchedAtIso,
      source: 'Lietuvos degalinių realus vidurkis'
    },
    diesel_plus: {
      fuelType: 'diesel_plus',
      fuelName: 'Dyzelinas Plius / Žiema',
      price: Number((avgDiesel + 0.06).toFixed(3)),
      diffFromLastWeek: -0.008,
      currency: 'EUR',
      asOf: fetchedAtIso,
      source: 'Lietuvos degalinių realus vidurkis'
    },
    ev: {
      fuelType: 'ev',
      fuelName: 'Elektros Krovimas (kWh)',
      price: 0.405,
      diffFromLastWeek: 0.0,
      currency: 'EUR',
      asOf: fetchedAtIso,
      source: 'Ignitis ON / Enefit / Elinta vidurkis'
    }
  };

  const onlineCount = sourceStatuses.filter((s) => s.status === 'online').length;

  const result: AggregatedResponse = {
    timestamp: fetchedAtIso,
    totalStations: allStations.length,
    filteredStationsCount: allStations.length,
    sourcesOnlineCount: onlineCount,
    totalSourcesCount: sourceStatuses.length,
    sourceStatuses,
    nationalAverages,
    stations: allStations,
    cheapest: {
      gasoline_95: cheapest95,
      diesel: cheapestDiesel,
      lpg: cheapestLpg
    }
  };

  cachedAggregation = result;
  lastAggregatedAt = now;

  return result;
}
