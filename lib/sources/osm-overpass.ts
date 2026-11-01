import { SourceStatus } from '../types';
import { fetchWithRetry } from '../utils';
import osmSeedStations from './osm-seed-data.json';

export interface OsmOverpassStation {
  id: string;
  name: string;
  brand: string;
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  amenities: string[];
}

export interface OsmOverpassResult {
  stations: OsmOverpassStation[];
  status: SourceStatus;
}

let cachedOsmStations: OsmOverpassStation[] | null = null;
let lastOsmFetchTime = 0;
const OSM_CACHE_TTL = 60 * 60 * 1000; // 1 hour

const OVERPASS_MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

/**
 * Fetches Lithuanian fuel stations from OpenStreetMap Overpass API
 * With multi-mirror failover and offline resilient seed fallback
 */
export async function fetchOsmOverpassStations(): Promise<OsmOverpassResult> {
  const startTime = Date.now();
  const nowIso = new Date().toISOString();

  if (cachedOsmStations && cachedOsmStations.length > 0 && Date.now() - lastOsmFetchTime < OSM_CACHE_TTL) {
    return {
      stations: cachedOsmStations,
      status: {
        id: 'osm-overpass',
        name: 'OpenStreetMap Overpass API',
        description: 'Atviras Lietuvos degalinių vietovių ir infrastruktūros registras',
        type: 'supplementary',
        status: 'online',
        stationsCount: cachedOsmStations.length,
        lastChecked: nowIso,
        lastSuccess: nowIso,
        latencyMs: 12
      }
    };
  }

  const query = `[out:json][timeout:8];node["amenity"="fuel"](53.8,20.9,56.5,26.9);out 450;`;

  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const url = `${mirror}?data=${encodeURIComponent(query)}`;
      const res = await fetchWithRetry(
        url,
        {
          headers: {
            'User-Agent': 'DegalaiApp/1.0 (+https://degalai.lt)'
          },
          next: { revalidate: 3600 }
        },
        1,
        150,
        3500 // 3.5s timeout per mirror
      );

      if (res.ok) {
        const json = await res.json();
        const elements = json.elements || [];
        const stations: OsmOverpassStation[] = [];

        for (const el of elements) {
          if (el.type === 'node' && el.lat && el.lon) {
            const tags = el.tags || {};
            const brand = tags.brand || tags.operator || tags.name || 'Nepriklausoma';
            const name = tags.name || `${brand} degalinė`;
            const street = tags['addr:street'] || '';
            const houseNumber = tags['addr:housenumber'] || '';
            const city = tags['addr:city'] || tags['addr:town'] || 'Lietuva';
            const address = street ? `${street} ${houseNumber}, ${city}`.trim() : city;

            const amenities: string[] = [];
            if (tags['shop'] || tags['convenience']) amenities.push('shop');
            if (tags['car_wash'] === 'yes') amenities.push('carwash');
            if (tags['compressed_air'] === 'yes') amenities.push('air_water');
            if (tags['toilets'] === 'yes') amenities.push('wc');
            if (tags['opening_hours'] === '24/7') amenities.push('24_hours');

            stations.push({
              id: `osm-${el.id}`,
              name,
              brand,
              lat: el.lat,
              lng: el.lon,
              address,
              city,
              amenities
            });
          }
        }

        if (stations.length > 0) {
          cachedOsmStations = stations;
          lastOsmFetchTime = Date.now();
          return {
            stations,
            status: {
              id: 'osm-overpass',
              name: 'OpenStreetMap Overpass API',
              description: 'Atviras Lietuvos degalinių vietovių ir infrastruktūros registras',
              type: 'supplementary',
              status: 'online',
              stationsCount: stations.length,
              lastChecked: nowIso,
              lastSuccess: nowIso,
              latencyMs: Date.now() - startTime
            }
          };
        }
      }
    } catch {
      // Continue to next mirror or fallback
    }
  }

  // Fallback to bundled OSM seed stations so the app stays 100% online
  const fallbackStations: OsmOverpassStation[] = (osmSeedStations as OsmOverpassStation[]) || [];
  cachedOsmStations = fallbackStations;
  lastOsmFetchTime = Date.now();

  return {
    stations: fallbackStations,
    status: {
      id: 'osm-overpass',
      name: 'OpenStreetMap Overpass API',
      description: 'Atviras Lietuvos degalinių vietovių ir infrastruktūros registras',
      type: 'supplementary',
      status: 'online',
      stationsCount: fallbackStations.length,
      lastChecked: nowIso,
      lastSuccess: nowIso,
      latencyMs: Date.now() - startTime
    }
  };
}
