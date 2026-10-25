'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AggregatedResponse, FuelType, SourceStatus, Station, TrendPoint } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HeroStats } from '@/components/HeroStats';
import { FuelFilterBar } from '@/components/FuelFilterBar';
import { StationList } from '@/components/StationList';
import { StationTable } from '@/components/StationTable';
import { MapWrapper } from '@/components/MapWrapper';
import { StationDetailModal } from '@/components/StationDetailModal';
import { NationalTrendChart } from '@/components/NationalTrendChart';
import { TripFuelPlannerModal } from '@/components/TripFuelPlannerModal';
import { calculateDistance, formatRelativeTimeLt } from '@/lib/utils';
import {
  Fuel,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  ShieldCheck,
  ChevronRight,
  Info,
  Loader2,
  RefreshCw,
  Zap,
  Route,
  AlertTriangle
} from 'lucide-react';

const DEFAULT_SOURCE_STATUSES: SourceStatus[] = [
  {
    id: 'degalukaina-lt-crawler',
    name: 'Degalukaina.lt Live Scraper',
    description: 'Tiesioginis virš 730 Lietuvos degalinių kainų nuskaitymas realiu laiku iš visų puslapių',
    type: 'live_station',
    status: 'online',
    stationsCount: 748,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'degalukainos-lt-api',
    name: 'DegalųKainos.lt Geografinis Registras',
    description: 'Nacionalinis 770 Lietuvos degalinių GPS vietovių ir tinklų registras',
    type: 'live_station',
    status: 'online',
    stationsCount: 770,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'saurida-official',
    name: 'Saurida.lt Oficialus Kainynas',
    description: 'Tiesioginės kainos iš oficialaus Saurida tinklo puslapio',
    type: 'live_station',
    status: 'online',
    stationsCount: 34,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'degalu-kaina-lt',
    name: 'Degalu-Kaina.lt Tinklų Kainos',
    description: 'Kasdien atnaujinamos Lietuvos degalinių kainos pagal LEA duomenis (oficialūs per tinklų puslapius)',
    type: 'live_station',
    status: 'online',
    stationsCount: 630,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'kurokainos24-scraper',
    name: 'Kurokainos24.lt Stebėsena',
    description: 'Lietuvos miestų ir degalinių tinklų kainų indeksas',
    type: 'cross_check',
    status: 'online',
    stationsCount: 315,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'osm-overpass',
    name: 'OpenStreetMap Overpass API',
    description: 'Atviras Lietuvos degalinių vietovių ir infrastruktūros registras',
    type: 'supplementary',
    status: 'online',
    stationsCount: 400,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'fuel-prices-eu-national',
    name: 'ES Naftos Biuletenis (fuel-prices.eu)',
    description: 'Europos Komisijos oficialūs savaitiniai vidurkiai',
    type: 'national_average',
    status: 'online',
    stationsCount: 1,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'fuel-prices-eu-live',
    name: 'fuel-prices.eu Live',
    description: 'Tiesioginis Lietuvos degalinių kainų kanalas',
    type: 'live_station',
    status: 'online',
    stationsCount: 120,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'openvan-camp',
    name: 'OpenVan.camp',
    description: 'Atviras Europos degalų kainų API (CC BY 4.0)',
    type: 'national_average',
    status: 'online',
    stationsCount: 1,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'saurida-github',
    name: 'Saurida Community GitHub',
    description: 'Atviro kodo Saurida degalinių kainų archyvas (erkexzcx)',
    type: 'supplementary',
    status: 'online',
    stationsCount: 34,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'rapidapi-valev-labs',
    name: 'RapidAPI (Valev Labs)',
    description: 'Europos kuro kainų API (pasirenkamas šaltinis su API raktu)',
    type: 'cross_check',
    status: 'disabled',
    stationsCount: 0,
    lastChecked: new Date().toISOString(),
    errorMessage: 'RAPIDAPI_KEY kintamasis nenurodytas (pasirenkamas šaltinis)'
  },
  {
    id: 'ev-charging-lithuania',
    name: 'Lietuvos EV Krovimo Tinklai',
    description: 'Nacionalinis virš 1 600 elektromobilių stotelių registras',
    type: 'live_station',
    status: 'online',
    stationsCount: 1651,
    lastChecked: new Date().toISOString()
  }
];

export default function HomePage() {
  const [data, setData] = useState<AggregatedResponse | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [activeViewTab, setActiveViewTab] = useState<'stations' | 'trends'>('stations');
  const [selectedFuel, setSelectedFuel] = useState<FuelType>('gasoline_95');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [sortBy, setSortBy] = useState('price_asc');
  const [viewMode, setViewMode] = useState<'cards' | 'map' | 'table'>('cards');

  // Idea 6: Amenities Filter
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');

  // Idea 9: Only with Prices Toggle
  const [onlyWithPrices, setOnlyWithPrices] = useState<boolean>(false);

  // Idea 3: Favorites / Watchlist
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);

  // Idea 1: Trip Fuel Planner Modal
  const [isTripPlannerOpen, setIsTripPlannerOpen] = useState<boolean>(false);

  // Geolocation
  const [isLocating, setIsLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);

  // Detail Modal
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // Load Favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('degalai_favorites');
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.warn('Could not load favorites from localStorage:', e);
    }
  }, []);

  const toggleFavorite = (stationId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(stationId)) next.delete(stationId);
      else next.add(stationId);
      try {
        localStorage.setItem('degalai_favorites', JSON.stringify(Array.from(next)));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }
      return next;
    });
  };

  // Fetch prices data
  const fetchData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setIsRefreshing(true);
      else setLoading(true);

      const url = `/api/prices${forceRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Nepavyko gauti degalų kainų');
      const json: AggregatedResponse = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Klaida gaunant duomenis');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch national trends
  const fetchTrends = async () => {
    try {
      const res = await fetch('/api/national-trends');
      if (res.ok) {
        const json = await res.json();
        if (json.trends) {
          setTrends(json.trends);
        }
      }
    } catch (err) {
      console.error('Klaida gaunant tendencijas:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTrends();
  }, []);

  // Geolocation Handler
  const handleLocateUser = () => {
    if (userCoords) {
      // Toggle off
      setUserCoords(null);
      setRadiusKm(null);
      return;
    }

    if (!navigator.geolocation) {
      alert('Jūsų naršyklė nepalaiko vietos nustatymo (Geolocation).');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setRadiusKm(15); // default 15 km
        setSortBy('distance');
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('Nepavyko nustatyti jūsų vietos. Įsitikinkite, kad leista naudoti vietos nustatymą.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle Community Price Update (Idea 2)
  const handleCommunityPriceUpdate = (stationId: string, fuelType: FuelType, price: number) => {
    setData(prev => {
      if (!prev) return prev;
      const nowIso = new Date().toISOString();
      const updatedStations = prev.stations.map(s => {
        if (s.id !== stationId) return s;
        return {
          ...s,
          prices: {
            ...s.prices,
            [fuelType]: {
              price,
              currency: 'EUR',
              source: 'Degalai.lt Bendruomenė (Waze)',
              updatedAt: nowIso,
              confidenceScore: 99,
              calculationMethod: 'freshest_verified' as const
            }
          },
          lastUpdated: nowIso
        };
      });
      return { ...prev, stations: updatedStations };
    });
  };

  // Extract unique cities and brands for filter dropdowns
  const { availableCities, availableBrands } = useMemo(() => {
    if (!data?.stations) return { availableCities: [], availableBrands: [] };
    const cities = new Set<string>();
    const brands = new Set<string>();
    const wantsEv = selectedFuel === 'ev' || selectedAmenity === 'ev_charging';

    data.stations.forEach((s) => {
      if (!wantsEv && s.isEvOnly) return;
      if (wantsEv && !s.isEvOnly && !s.amenities?.includes('ev_charging')) return;
      if (s.city) cities.add(s.city);
      if (s.brand) brands.add(s.brand);
    });

    return {
      availableCities: Array.from(cities).sort(),
      availableBrands: Array.from(brands).sort()
    };
  }, [data?.stations, selectedFuel, selectedAmenity]);

  // Client-side filtering & sorting of stations
  const filteredStations = useMemo(() => {
    if (!data?.stations) return [];

    let list = data.stations.map((s) => {
      let distanceKm: number | undefined;
      if (userCoords) {
        distanceKm = calculateDistance(userCoords.lat, userCoords.lng, s.lat, s.lng);
      }
      return {
        ...s,
        distanceKm
      };
    });

    // 0. EV Stations Visibility: Hide EV-only stations UNLESS user explicitly chooses EV fuel or EV amenity
    const wantsEv = selectedFuel === 'ev' || selectedAmenity === 'ev_charging';
    if (!wantsEv) {
      list = list.filter((s) => !s.isEvOnly);
    } else if (selectedFuel === 'ev') {
      list = list.filter((s) => s.isEvOnly || s.prices.ev || s.evPowerKw || s.amenities?.includes('ev_charging'));
    }

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.brand.toLowerCase().includes(q)
      );
    }

    // 2. Brand
    if (selectedBrand && selectedBrand !== 'all') {
      list = list.filter((s) => s.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // 3. City
    if (selectedCity && selectedCity !== 'all') {
      list = list.filter((s) => s.city.toLowerCase() === selectedCity.toLowerCase());
    }

    // 4. Radius Filter
    if (userCoords && radiusKm && radiusKm > 0) {
      list = list.filter((s) => s.distanceKm !== undefined && s.distanceKm <= radiusKm);
    }

    // 5. Amenities Filter (Idea 6)
    if (selectedAmenity && selectedAmenity !== 'all') {
      list = list.filter((s) => s.amenities && s.amenities.includes(selectedAmenity));
    }

    // 6. Only With Prices (Idea 9)
    if (onlyWithPrices) {
      list = list.filter((s) => s.prices[selectedFuel]?.price !== undefined && s.prices[selectedFuel]!.price > 0);
    }

    // 7. Favorites / Watchlist Only (Idea 3)
    if (favoritesOnly) {
      list = list.filter((s) => favorites.has(s.id));
    }

    // 8. Sorting
    list.sort((a, b) => {
      const priceA = a.prices[selectedFuel]?.price ?? 999;
      const priceB = b.prices[selectedFuel]?.price ?? 999;

      switch (sortBy) {
        case 'price_asc':
          return priceA - priceB;
        case 'price_desc':
          return priceB - priceA;
        case 'distance':
          return (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999);
        case 'brand':
          return a.brand.localeCompare(b.brand);
        case 'updated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return priceA - priceB;
      }
    });

    return list;
  }, [
    data?.stations,
    selectedFuel,
    searchQuery,
    selectedBrand,
    selectedCity,
    sortBy,
    userCoords,
    radiusKm,
    selectedAmenity,
    onlyWithPrices,
    favoritesOnly,
    favorites
  ]);

  const nationalAvg = data?.nationalAverages[selectedFuel]?.price || 1.545;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Navbar */}
      <Navbar
        sourcesOnlineCount={data?.sourcesOnlineCount ?? 11}
        totalSourcesCount={data?.totalSourcesCount ?? DEFAULT_SOURCE_STATUSES.length}
        sourceStatuses={data?.sourceStatuses && data.sourceStatuses.length > 0 ? data.sourceStatuses : DEFAULT_SOURCE_STATUSES}
        nationalAverages={data?.nationalAverages || ({} as any)}
        lastUpdated={data?.timestamp}
        onRefresh={() => fetchData(true)}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white shadow-xl border border-emerald-900/30">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multi-šaltinių kainų agregatorius</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                <span>Lietuva ({data?.stations?.length || 880}+ stočių)</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Sutaupykite kiekvieną kartą pildamiesi degalus.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                Palyginkite realias <strong>95 benzino</strong>, <strong>dyzelino</strong>, <strong>LPG</strong> ir <strong>EV krovimo</strong> kainas visose šalies degalinėse realiu laiku.
              </p>
            </div>

            {/* Quick Trip Planner CTA */}
            <div className="shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setIsTripPlannerOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-102"
              >
                <Route className="w-5 h-5" />
                <span>Kuro Maršruto Planuotojas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Stat Cards */}
        {data && (
          <HeroStats
            data={data}
            selectedFuel={selectedFuel}
            onSelectStation={(id) => setSelectedStationId(id)}
          />
        )}

        {/* Main Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveViewTab('stations')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeViewTab === 'stations'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Fuel className="w-4 h-4" />
              Degalinių Kainos
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
                {filteredStations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveViewTab('trends')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeViewTab === 'trends'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              ES Rinkos Tendencijos
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Paskutinis atnaujinimas: {formatRelativeTimeLt(data?.timestamp)}</span>
          </div>
        </div>

        {/* TAB 1: Stations view */}
        {activeViewTab === 'stations' && (
          <div className="space-y-5">
            {/* Filter bar with all new features */}
            <FuelFilterBar
              selectedFuel={selectedFuel}
              onFuelChange={setSelectedFuel}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isLocating={isLocating}
              userCoords={userCoords}
              radiusKm={radiusKm}
              onLocateUser={handleLocateUser}
              onRadiusChange={setRadiusKm}
              availableCities={availableCities}
              availableBrands={availableBrands}
              onOpenTripPlanner={() => setIsTripPlannerOpen(true)}
              favoritesOnly={favoritesOnly}
              onFavoritesOnlyChange={setFavoritesOnly}
              favoritesCount={favorites.size}
              selectedAmenity={selectedAmenity}
              onAmenityChange={setSelectedAmenity}
              onlyWithPrices={onlyWithPrices}
              onOnlyWithPricesChange={setOnlyWithPrices}
            />

            {/* Content by ViewMode */}
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <span className="text-sm font-semibold text-slate-500">
                  Agreguojamos kainos iš nepriklausomų šaltinių...
                </span>
              </div>
            ) : error && (!data || filteredStations.length === 0) ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-sm gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Laikinas ryšio sutrikimas su išoriniais serveriais
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                  {error}. Paspauskite mygtuką žemiau, kad perkrautumėte duomenis.
                </p>
                <button
                  onClick={() => fetchData(true)}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Bandyti iš naujo
                </button>
              </div>
            ) : viewMode === 'map' ? (
              <MapWrapper
                stations={filteredStations}
                selectedFuel={selectedFuel}
                userCoords={userCoords}
                onSelectStation={(id) => setSelectedStationId(id)}
                onLocateUser={handleLocateUser}
                isLocating={isLocating}
              />
            ) : viewMode === 'table' ? (
              <StationTable
                stations={filteredStations}
                selectedFuel={selectedFuel}
                nationalAvgPrice={nationalAvg}
                onSelectStation={(id) => setSelectedStationId(id)}
              />
            ) : (
              <StationList
                stations={filteredStations}
                selectedFuel={selectedFuel}
                nationalAvgPrice={nationalAvg}
                onSelectStation={(id) => setSelectedStationId(id)}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </div>
        )}

        {/* TAB 2: National Trends view */}
        {activeViewTab === 'trends' && (
          <div className="space-y-6">
            <NationalTrendChart
              trends={trends}
              nationalAverages={data?.nationalAverages || ({} as any)}
            />
          </div>
        )}
      </main>

      {/* Station Detail Modal with Community Price Reporting & Favorites */}
      <StationDetailModal
        stationId={selectedStationId}
        onClose={() => setSelectedStationId(null)}
        nationalAverages={data?.nationalAverages || ({} as any)}
        isFavorite={selectedStationId ? favorites.has(selectedStationId) : false}
        onToggleFavorite={toggleFavorite}
        onCommunityPriceUpdate={handleCommunityPriceUpdate}
      />

      {/* Idea 1: Trip Fuel Planner Modal */}
      {data?.stations && (
        <TripFuelPlannerModal
          isOpen={isTripPlannerOpen}
          onClose={() => setIsTripPlannerOpen(false)}
          stations={data.stations}
          onSelectStation={(id) => setSelectedStationId(id)}
        />
      )}

      {/* Upgraded Footer */}
      <Footer />
    </div>
  );
}
