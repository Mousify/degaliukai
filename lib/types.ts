export type FuelType = 'gasoline_95' | 'diesel' | 'lpg' | 'gasoline_98' | 'diesel_plus';

export interface RawFuelPrice {
  stationId: string;
  brand: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  fuelType: FuelType;
  pricePerLiter: number;
  currency: string;
  sourceName: string;
  sourceUpdatedAt: string; // ISO string
  fetchedAt: string; // ISO string
}

export interface FuelPriceEntry {
  price: number;
  currency: string;
  source: string;
  updatedAt: string;
  isLowest?: boolean;
  confidenceScore?: number; // 0 to 100% confidence
  calculationMethod?: 'direct_official' | 'consensus_weighted' | 'freshest_verified' | 'baseline_fallback';
  sourceCount?: number;
  alternativePrices?: Array<{
    source: string;
    price: number;
    updatedAt: string;
    weight?: number;
  }>;
}

export interface StationAmenity {
  id: string;
  name: string;
  nameLt: string;
  icon: string;
}

export interface Station {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandColor: string;
  address: string;
  city: string;
  county: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  prices: Partial<Record<FuelType, FuelPriceEntry>>;
  amenities: string[];
  primarySource: string;
  sourcesReported: string[];
  lastUpdated: string;
  isStale: boolean; // >24h old
  googleMapsUrl: string;
  wazeUrl: string;
}

export interface SourceStatus {
  id: string;
  name: string;
  description: string;
  type: 'live_station' | 'national_average' | 'supplementary' | 'cross_check';
  status: 'online' | 'degraded' | 'offline' | 'disabled';
  stationsCount: number;
  lastChecked: string;
  lastSuccess?: string;
  latencyMs?: number;
  errorMessage?: string;
}

export interface NationalAverage {
  fuelType: FuelType;
  fuelName: string;
  price: number;
  previousWeekPrice?: number;
  diffFromLastWeek?: number;
  pctChange?: number;
  currency: string;
  asOf: string;
  source: string;
}

export interface TrendPoint {
  date: string;
  gasoline_95: number;
  diesel: number;
  lpg: number;
}

export interface AggregatedResponse {
  timestamp: string;
  totalStations: number;
  filteredStationsCount: number;
  sourcesOnlineCount: number;
  totalSourcesCount: number;
  sourceStatuses: SourceStatus[];
  nationalAverages: Record<FuelType, NationalAverage>;
  stations: Station[];
  cheapest: {
    gasoline_95?: { stationId: string; stationName: string; brand: string; city: string; price: number };
    diesel?: { stationId: string; stationName: string; brand: string; city: string; price: number };
    lpg?: { stationId: string; stationName: string; brand: string; city: string; price: number };
  };
}
