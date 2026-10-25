import { SourceStatus } from '../types';
import { fetchWithRetry } from '../utils';

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

/**
 * Fetches Lithuanian fuel stations from OpenStreetMap Overpass API
 * Bounding box for Lithuania: 53.8° to 56.5° N, 20.9° to 26.9° E
 */
export async function fetchOsmOverpassStations(): Promise<OsmOverpassResult> {
  const startTime = Date.now();
  const nowIso = new Date().toISOString();

  const sourceStatus: SourceStatus = {
    id: 'osm-overpass',
    name: 'OpenStreetMap Overpass API',
    description: 'Atviras Lietuvos degalinių vietovių ir infrastruktūros registras',
    type: 'supplementary',
    status: 'online',
    stationsCount: 0,
    lastChecked: nowIso
  };

  // Overpass QL query: gas stations in Lithuania
  const query = `[out:json][timeout:15];node["amenity"="fuel"](53.8,20.9,56.5,26.9);out 400;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
    const res = await fetchWithRetry(url, {
      headers: {
        'User-Agent': 'DegalaiApp/1.0 (+https://degalai.lt)'
      },
      next: { revalidate: 86400 } // Cache 24 hours
    });

    sourceStatus.latencyMs = Date.now() - startTime;

    if (!res.ok) {
      sourceStatus.status = 'degraded';
      sourceStatus.errorMessage = `HTTP ${res.status}`;
      return { stations: [], status: sourceStatus };
    }

    const json = await res.json();
    sourceStatus.lastSuccess = new Date().toISOString();

    const stations: OsmOverpassStation[] = [];
    const elements = json.elements || [];

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

    sourceStatus.stationsCount = stations.length;
    return { stations, status: sourceStatus };
  } catch (err: any) {
    sourceStatus.status = 'degraded';
    sourceStatus.latencyMs = Date.now() - startTime;
    sourceStatus.errorMessage = err.message || 'Nepavyko nuskaityti Overpass API';
    return { stations: [], status: sourceStatus };
  }
}
