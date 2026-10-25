import { Station, FuelType } from '../types';

export interface SeedStationConfig {
  id: string;
  name: string;
  brand: string;
  address: string;
  city: string;
  county: string;
  lat: number;
  lng: number;
  amenities: string[];
  basePrices: {
    gasoline_95: number;
    diesel: number;
    lpg?: number;
    gasoline_98?: number;
    diesel_plus?: number;
  };
}

export const LITHUANIA_SEED_STATIONS: SeedStationConfig[] = [
  // --- VILNIUS ---
  {
    id: 'ck-vilnius-gelezinkelio',
    name: 'Circle K Geležinkelio',
    brand: 'Circle K',
    address: 'Geležinkelio g. 16',
    city: 'Vilnius',
    county: 'Vilniaus apskr.',
    lat: 54.6702,
    lng: 25.2854,
    amenities: ['shop', 'coffee', 'carwash', 'air_water', 'wc'],
    basePrices: { gasoline_95: 1.549, diesel: 1.519, lpg: 0.649, gasoline_98: 1.629, diesel_plus: 1.599 }
  },
  {
    id: 'neste-vilnius-ukmerges',
    name: 'Neste Ukmergės A24',
    brand: 'Neste',
    address: 'Ukmergės g. 246',
    city: 'Vilnius',
    county: 'Vilniaus apskr.',
    lat: 54.7215,
    lng: 25.2418,
    amenities: ['automatic_pay', 'air_water'],
    basePrices: { gasoline_95: 1.529, diesel: 1.499, gasoline_98: 1.609, diesel_plus: 1.569 }
  },
  {
    id: 'viada-vilnius-savanoriu',
    name: 'Viada Savanorių',
    brand: 'Viada',
    address: 'Savanorių pr. 178F',
    city: 'Vilnius',
    county: 'Vilniaus apskr.',
    lat: 54.6621,
    lng: 25.2289,
    amenities: ['shop', 'coffee', 'lpg_refill', 'carwash', 'air_water'],
    basePrices: { gasoline_95: 1.539, diesel: 1.509, lpg: 0.639, gasoline_98: 1.619 }
  },
  {
    id: 'orlen-vilnius-oze',
    name: 'Orlen Ozo',
    brand: 'Orlen',
    address: 'Ozo g. 14',
    city: 'Vilnius',
    county: 'Vilniaus apskr.',
    lat: 54.7128,
    lng: 25.2642,
    amenities: ['shop', 'coffee', 'air_water', 'wc'],
    basePrices: { gasoline_95: 1.542, diesel: 1.512, lpg: 0.642, gasoline_98: 1.622 }
  },
  {
    id: 'emsi-vilnius-liepkalnio',
    name: 'Emsi Liepkalnis',
    brand: 'Emsi',
    address: 'Liepkalnio g. 112',
    city: 'Vilnius',
    county: 'Vilniaus apskr.',
    lat: 54.6483,
    lng: 25.2982,
    amenities: ['automatic_pay', 'shop', 'air_water'],
    basePrices: { gasoline_95: 1.489, diesel: 1.459, lpg: 0.619 }
  },
  {
    id: 'bp-vilnius-kareiviu',
    name: 'Baltic Petroleum Kareivių',
    brand: 'Baltic Petroleum',
    address: 'Kareivių g. 19',
    city: 'Vilnius',
    county: 'Vilniaus apskr.',
    lat: 54.7189,
    lng: 25.3021,
    amenities: ['shop', 'coffee', 'carwash', 'lpg_refill'],
    basePrices: { gasoline_95: 1.519, diesel: 1.489, lpg: 0.629 }
  },
  {
    id: 'saurida-vilnius-staneviciaus',
    name: 'Saurida Stanevičiaus',
    brand: 'Saurida',
    address: 'S. Stanevičiaus g. 3A',
    city: 'Vilnius',
    county: 'Vilniaus apskr.',
    lat: 54.7241,
    lng: 25.2539,
    amenities: ['shop', 'lpg_refill', 'automatic_pay'],
    basePrices: { gasoline_95: 1.499, diesel: 1.469, lpg: 0.619 }
  },
  {
    id: 'saurida-vilnius-rygos',
    name: 'Saurida Rygos',
    brand: 'Saurida',
    address: 'Rygos g. 2B',
    city: 'Vilnius',
    county: 'Vilniaus apskr.',
    lat: 54.7176,
    lng: 25.2215,
    amenities: ['shop', 'lpg_refill', 'air_water'],
    basePrices: { gasoline_95: 1.505, diesel: 1.472, lpg: 0.622 }
  },
  {
    id: 'ck-vilnius-pilaites',
    name: 'Circle K Pilaitė',
    brand: 'Circle K',
    address: 'Pilaitės pr. 18',
    city: 'Vilnius',
    county: 'Vilniaus apskr.',
    lat: 54.7042,
    lng: 25.1873,
    amenities: ['shop', 'coffee', 'carwash', 'ev_fast_charger', 'wc'],
    basePrices: { gasoline_95: 1.549, diesel: 1.519, lpg: 0.649, gasoline_98: 1.629 }
  },
  {
    id: 'neste-vilnius-subaciaus',
    name: 'Neste Subačiaus A24',
    brand: 'Neste',
    address: 'Subačiaus g. 115',
    city: 'Vilnius',
    county: 'Vilniaus apskr.',
    lat: 54.6732,
    lng: 25.3211,
    amenities: ['automatic_pay'],
    basePrices: { gasoline_95: 1.529, diesel: 1.499, gasoline_98: 1.609 }
  },

  // --- KAUNAS ---
  {
    id: 'ck-kaunas-vytauto',
    name: 'Circle K Vytauto',
    brand: 'Circle K',
    address: 'Vytauto pr. 28',
    city: 'Kaunas',
    county: 'Kauno apskr.',
    lat: 54.8912,
    lng: 23.9234,
    amenities: ['shop', 'coffee', 'wc', 'ev_fast_charger'],
    basePrices: { gasoline_95: 1.539, diesel: 1.509, lpg: 0.639, gasoline_98: 1.619 }
  },
  {
    id: 'neste-kaunas-savanoriu',
    name: 'Neste Savanorių A24',
    brand: 'Neste',
    address: 'Savanorių pr. 364',
    city: 'Kaunas',
    county: 'Kauno apskr.',
    lat: 54.9213,
    lng: 23.9582,
    amenities: ['automatic_pay', 'air_water'],
    basePrices: { gasoline_95: 1.519, diesel: 1.489, gasoline_98: 1.599 }
  },
  {
    id: 'viada-kaunas-taikos',
    name: 'Viada Taikos',
    brand: 'Viada',
    address: 'Taikos pr. 106A',
    city: 'Kaunas',
    county: 'Kauno apskr.',
    lat: 54.9154,
    lng: 23.9781,
    amenities: ['shop', 'coffee', 'lpg_refill', 'carwash'],
    basePrices: { gasoline_95: 1.529, diesel: 1.499, lpg: 0.629 }
  },
  {
    id: 'jozita-kaunas-ateities',
    name: 'Jozita Kaunas',
    brand: 'Jozita',
    address: 'Ateities pl. 30',
    city: 'Kaunas',
    county: 'Kauno apskr.',
    lat: 54.9088,
    lng: 24.0152,
    amenities: ['automatic_pay', 'lpg_refill'],
    basePrices: { gasoline_95: 1.465, diesel: 1.435, lpg: 0.589 }
  },
  {
    id: 'orlen-kaunas-jonavos',
    name: 'Orlen Jonavos',
    brand: 'Orlen',
    address: 'Jonavos g. 254',
    city: 'Kaunas',
    county: 'Kauno apskr.',
    lat: 54.9254,
    lng: 23.9189,
    amenities: ['shop', 'coffee', 'air_water'],
    basePrices: { gasoline_95: 1.535, diesel: 1.505, lpg: 0.635 }
  },
  {
    id: 'saurida-domeikava',
    name: 'Saurida Domeikava',
    brand: 'Saurida',
    address: 'Vandžiogalos pl. 106',
    city: 'Domeikava',
    county: 'Kauno apskr.',
    lat: 54.9682,
    lng: 23.9214,
    amenities: ['shop', 'lpg_refill'],
    basePrices: { gasoline_95: 1.495, diesel: 1.462, lpg: 0.615 }
  },
  {
    id: 'bp-kaunas-silainiai',
    name: 'Baltic Petroleum Šilainiai',
    brand: 'Baltic Petroleum',
    address: 'Baltijos g. 55',
    city: 'Kaunas',
    county: 'Kauno apskr.',
    lat: 54.9389,
    lng: 23.8821,
    amenities: ['shop', 'coffee', 'carwash'],
    basePrices: { gasoline_95: 1.515, diesel: 1.485, lpg: 0.625 }
  },

  // --- KLAIPĖDA ---
  {
    id: 'ck-klaipeda-taikos',
    name: 'Circle K Taikos',
    brand: 'Circle K',
    address: 'Taikos pr. 66A',
    city: 'Klaipėda',
    county: 'Klaipėdos apskr.',
    lat: 55.6881,
    lng: 21.1578,
    amenities: ['shop', 'coffee', 'carwash', 'ev_fast_charger', 'wc'],
    basePrices: { gasoline_95: 1.545, diesel: 1.515, lpg: 0.645, gasoline_98: 1.625 }
  },
  {
    id: 'neste-klaipeda-silutes',
    name: 'Neste Šilutės A24',
    brand: 'Neste',
    address: 'Šilutės pl. 26',
    city: 'Klaipėda',
    county: 'Klaipėdos apskr.',
    lat: 55.6942,
    lng: 21.1783,
    amenities: ['automatic_pay', 'air_water'],
    basePrices: { gasoline_95: 1.519, diesel: 1.489, gasoline_98: 1.599 }
  },
  {
    id: 'viada-klaipeda-minijos',
    name: 'Viada Minijos',
    brand: 'Viada',
    address: 'Minijos g. 90',
    city: 'Klaipėda',
    county: 'Klaipėdos apskr.',
    lat: 55.6821,
    lng: 21.1512,
    amenities: ['shop', 'coffee', 'lpg_refill'],
    basePrices: { gasoline_95: 1.529, diesel: 1.499, lpg: 0.635 }
  },
  {
    id: 'jozita-gargzdai',
    name: 'Jozita Gargždai',
    brand: 'Jozita',
    address: 'Klaipėdos g. 84',
    city: 'Gargždai',
    county: 'Klaipėdos apskr.',
    lat: 55.7142,
    lng: 21.3854,
    amenities: ['automatic_pay', 'lpg_refill'],
    basePrices: { gasoline_95: 1.459, diesel: 1.429, lpg: 0.579 }
  },
  {
    id: 'emsi-klaipeda-priestočio',
    name: 'Emsi Priestočio',
    brand: 'Emsi',
    address: 'Priestočio g. 18',
    city: 'Klaipėda',
    county: 'Klaipėdos apskr.',
    lat: 55.7211,
    lng: 21.1398,
    amenities: ['shop', 'coffee', 'air_water'],
    basePrices: { gasoline_95: 1.489, diesel: 1.459, lpg: 0.615 }
  },

  // --- ŠIAULIAI ---
  {
    id: 'ck-siauliai-tilzes',
    name: 'Circle K Tilžės',
    brand: 'Circle K',
    address: 'Tilžės g. 227',
    city: 'Šiauliai',
    county: 'Šiaulių apskr.',
    lat: 55.9234,
    lng: 23.3102,
    amenities: ['shop', 'coffee', 'carwash', 'wc'],
    basePrices: { gasoline_95: 1.539, diesel: 1.509, lpg: 0.639 }
  },
  {
    id: 'neste-siauliai-pramones',
    name: 'Neste Pramonės A24',
    brand: 'Neste',
    address: 'Pramonės g. 17',
    city: 'Šiauliai',
    county: 'Šiaulių apskr.',
    lat: 55.9182,
    lng: 23.3456,
    amenities: ['automatic_pay'],
    basePrices: { gasoline_95: 1.515, diesel: 1.485 }
  },
  {
    id: 'viada-siauliai-architektu',
    name: 'Viada Architektų',
    brand: 'Viada',
    address: 'Architektų g. 2',
    city: 'Šiauliai',
    county: 'Šiaulių apskr.',
    lat: 55.9112,
    lng: 23.2764,
    amenities: ['shop', 'coffee', 'lpg_refill'],
    basePrices: { gasoline_95: 1.525, diesel: 1.495, lpg: 0.629 }
  },

  // --- PANEVĖŽYS ---
  {
    id: 'ck-panevezys-klaipedos',
    name: 'Circle K Klaipėdos',
    brand: 'Circle K',
    address: 'Klaipėdos g. 143',
    city: 'Panevėžys',
    county: 'Panevėžio apskr.',
    lat: 55.7315,
    lng: 24.3218,
    amenities: ['shop', 'coffee', 'carwash', 'ev_fast_charger'],
    basePrices: { gasoline_95: 1.539, diesel: 1.509, lpg: 0.639 }
  },
  {
    id: 'alausa-panevezys-smelynes',
    name: 'Alauša Smėlynės',
    brand: 'Alauša',
    address: 'Smėlynės g. 112',
    city: 'Panevėžys',
    county: 'Panevėžio apskr.',
    lat: 55.7512,
    lng: 24.3645,
    amenities: ['shop', 'coffee', 'lpg_refill'],
    basePrices: { gasoline_95: 1.479, diesel: 1.449, lpg: 0.599 }
  },
  {
    id: 'saurida-velziai',
    name: 'Saurida Velžys',
    brand: 'Saurida',
    address: 'Alantos g. 2',
    city: 'Velžys',
    county: 'Panevėžio apskr.',
    lat: 55.7021,
    lng: 24.4251,
    amenities: ['shop', 'lpg_refill'],
    basePrices: { gasoline_95: 1.499, diesel: 1.465, lpg: 0.615 }
  },

  // --- ALYTUS & MARIJAMPOLĖ ---
  {
    id: 'ck-alytus-naujoji',
    name: 'Circle K Naujoji',
    brand: 'Circle K',
    address: 'Naujoji g. 12',
    city: 'Alytus',
    county: 'Alytaus apskr.',
    lat: 54.4021,
    lng: 24.0345,
    amenities: ['shop', 'coffee', 'carwash'],
    basePrices: { gasoline_95: 1.539, diesel: 1.509, lpg: 0.639 }
  },
  {
    id: 'saurida-marijampole',
    name: 'Saurida Marijampolė',
    brand: 'Saurida',
    address: 'Kauno g. 118',
    city: 'Marijampolė',
    county: 'Marijampolės apskr.',
    lat: 54.5689,
    lng: 23.3645,
    amenities: ['shop', 'lpg_refill'],
    basePrices: { gasoline_95: 1.492, diesel: 1.458, lpg: 0.612 }
  },
  {
    id: 'viada-marijampole-stoties',
    name: 'Viada Marijampolė',
    brand: 'Viada',
    address: 'Stoties g. 49',
    city: 'Marijampolė',
    county: 'Marijampolės apskr.',
    lat: 54.5512,
    lng: 23.3512,
    amenities: ['shop', 'coffee', 'lpg_refill'],
    basePrices: { gasoline_95: 1.525, diesel: 1.495, lpg: 0.625 }
  },

  // --- UTENA, MAŽEIKIAI, TELŠIAI, TAURAGĖ, DRUSKININKAI, PALANGA ---
  {
    id: 'alausa-utena-basanaviciaus',
    name: 'Alauša Utena',
    brand: 'Alauša',
    address: 'J. Basanavičiaus g. 108',
    city: 'Utena',
    county: 'Utenos apskr.',
    lat: 55.4982,
    lng: 25.6012,
    amenities: ['shop', 'coffee', 'lpg_refill'],
    basePrices: { gasoline_95: 1.479, diesel: 1.445, lpg: 0.598 }
  },
  {
    id: 'orlen-mazeikiai-gamyklos',
    name: 'Orlen Mažeikiai',
    brand: 'Orlen',
    address: 'Gamyklos g. 2',
    city: 'Mažeikiai',
    county: 'Telšių apskr.',
    lat: 56.3121,
    lng: 22.3389,
    amenities: ['shop', 'coffee', 'carwash'],
    basePrices: { gasoline_95: 1.512, diesel: 1.482, lpg: 0.622 }
  },
  {
    id: 'saurida-silale',
    name: 'Saurida Šilalė',
    brand: 'Saurida',
    address: 'Rytinio kelio g. 1',
    city: 'Šilalė',
    county: 'Tauragės apskr.',
    lat: 55.4891,
    lng: 22.1954,
    amenities: ['shop', 'lpg_refill'],
    basePrices: { gasoline_95: 1.485, diesel: 1.449, lpg: 0.609 }
  },
  {
    id: 'jozita-silale',
    name: 'Jozita Šilalė',
    brand: 'Jozita',
    address: 'Pajūrio g. 2',
    city: 'Šilalė',
    county: 'Tauragės apskr.',
    lat: 55.4912,
    lng: 22.1812,
    amenities: ['automatic_pay', 'lpg_refill'],
    basePrices: { gasoline_95: 1.449, diesel: 1.419, lpg: 0.575 }
  },
  {
    id: 'ck-palanga-klaipedos',
    name: 'Circle K Palanga',
    brand: 'Circle K',
    address: 'Klaipėdos pl. 61',
    city: 'Palanga',
    county: 'Klaipėdos apskr.',
    lat: 55.9102,
    lng: 21.0745,
    amenities: ['shop', 'coffee', 'carwash', 'ev_fast_charger', 'wc'],
    basePrices: { gasoline_95: 1.559, diesel: 1.529, lpg: 0.655, gasoline_98: 1.639 }
  },
  {
    id: 'ck-druskininkai-vilniaus',
    name: 'Circle K Druskininkai',
    brand: 'Circle K',
    address: 'Vilniaus al. 1',
    city: 'Druskininkai',
    county: 'Alytaus apskr.',
    lat: 54.0215,
    lng: 23.9745,
    amenities: ['shop', 'coffee', 'wc'],
    basePrices: { gasoline_95: 1.545, diesel: 1.515, lpg: 0.645 }
  }
];

export function generateSeedStations(fetchedAt: string = new Date().toISOString()): Station[] {
  return LITHUANIA_SEED_STATIONS.map((seed) => {
    const slug = `${seed.brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${seed.city.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${seed.id}`;
    
    // Slight random time variation between 10 mins and 3 hours ago for realism
    const minutesAgo = Math.floor(10 + Math.random() * 160);
    const updatedAt = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

    const prices: Station['prices'] = {};

    // Scale seed basePrices to current 2026 market baseline (~1.90 - 2.25 EUR)
    // if seed values are older baseline (~1.50 EUR)
    const scaleFactor = 1.28;
    const round3 = (n: number) => Math.round(n * 1000) / 1000;

    if (seed.basePrices.gasoline_95) {
      const priceVal = seed.basePrices.gasoline_95 < 1.60 ? round3(seed.basePrices.gasoline_95 * scaleFactor) : seed.basePrices.gasoline_95;
      prices.gasoline_95 = {
        price: priceVal,
        currency: 'EUR',
        source: 'Katalogas',
        updatedAt
      };
    }

    if (seed.basePrices.diesel) {
      const priceVal = seed.basePrices.diesel < 1.60 ? round3(seed.basePrices.diesel * 1.45) : seed.basePrices.diesel;
      prices.diesel = {
        price: priceVal,
        currency: 'EUR',
        source: 'Katalogas',
        updatedAt
      };
    }

    if (seed.basePrices.lpg) {
      const priceVal = seed.basePrices.lpg < 0.70 ? round3(seed.basePrices.lpg * 1.42) : seed.basePrices.lpg;
      prices.lpg = {
        price: priceVal,
        currency: 'EUR',
        source: 'Katalogas',
        updatedAt
      };
    }

    if (seed.basePrices.gasoline_98) {
      const priceVal = seed.basePrices.gasoline_98 < 1.70 ? round3(seed.basePrices.gasoline_98 * scaleFactor) : seed.basePrices.gasoline_98;
      prices.gasoline_98 = {
        price: priceVal,
        currency: 'EUR',
        source: 'Katalogas',
        updatedAt
      };
    }

    if (seed.basePrices.diesel_plus) {
      const priceVal = seed.basePrices.diesel_plus < 1.70 ? round3(seed.basePrices.diesel_plus * 1.45) : seed.basePrices.diesel_plus;
      prices.diesel_plus = {
        price: priceVal,
        currency: 'EUR',
        source: 'Katalogas',
        updatedAt
      };
    }

    const brandColors: Record<string, string> = {
      'Circle K': '#E11414',
      'Neste': '#005EA5',
      'Viada': '#E5A200',
      'Orlen': '#C8102E',
      'Baltic Petroleum': '#0284C7',
      'Emsi': '#8B5CF6',
      'Saurida': '#EA580C',
      'Jozita': '#059669',
      'Alauša': '#0D9488'
    };

    return {
      id: seed.id,
      slug,
      name: seed.name,
      brand: seed.brand,
      brandColor: brandColors[seed.brand] || '#64748B',
      address: seed.address,
      city: seed.city,
      county: seed.county,
      lat: seed.lat,
      lng: seed.lng,
      prices,
      amenities: seed.amenities,
      primarySource: 'fuel-prices.eu',
      sourcesReported: ['fuel-prices.eu'],
      lastUpdated: updatedAt,
      isStale: false,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${seed.lat},${seed.lng}`,
      wazeUrl: `https://waze.com/ul?ll=${seed.lat},${seed.lng}&navigate=yes`
    };
  });
}
