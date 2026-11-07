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
  AlertTriangle,
  ArrowDownCircle,
  Search
} from 'lucide-react';

const STATIC_CHECK_TIME = '2026-11-01T20:00:00.000Z';

const DEFAULT_SOURCE_STATUSES: SourceStatus[] = [
  {
    id: 'degalukaina-lt-crawler',
    name: 'Degalukaina.lt Live Scraper',
    description: 'Tiesioginis virš 730 Lietuvos degalinių kainų nuskaitymas realiu laiku iš visų puslapių',
    type: 'live_station',
    status: 'online',
    stationsCount: 748,
    lastChecked: STATIC_CHECK_TIME
  },
  {
    id: 'degalukainos-lt-api',
    name: 'DegalųKainos.lt Geografinis Registras',
    description: 'Nacionalinis 770 Lietuvos degalinių GPS vietovių ir tinklų registras',
    type: 'live_station',
    status: 'online',
    stationsCount: 770,
    lastChecked: STATIC_CHECK_TIME
  },
  {
    id: 'saurida-official',
    name: 'Saurida.lt Oficialus Kainynas',
    description: 'Tiesioginės kainos iš oficialaus Saurida tinklo puslapio',
    type: 'live_station',
    status: 'online',
    stationsCount: 34,
    lastChecked: STATIC_CHECK_TIME
  },
  {
    id: 'degalu-kaina-lt',
    name: 'Degalu-Kaina.lt Tinklų Kainos',
    description: 'Kasdien atnaujinamos Lietuvos degalinių kainos pagal LEA duomenis (oficialūs per tinklų puslapius)',
    type: 'live_station',
    status: 'online',
    stationsCount: 630,
    lastChecked: STATIC_CHECK_TIME
  },
  {
    id: 'kurokainos24-scraper',
    name: 'Kurokainos24.lt Stebėsena',
    description: 'Lietuvos miestų ir degalinių tinklų kainų indeksas',
    type: 'cross_check',
    status: 'online',
    stationsCount: 315,
    lastChecked: STATIC_CHECK_TIME
  },
  {
    id: 'osm-overpass',
    name: 'OpenStreetMap Overpass API',
    description: 'Atviras Lietuvos degalinių vietovių ir infrastruktūros registras',
    type: 'supplementary',
    status: 'online',
    stationsCount: 478,
    lastChecked: STATIC_CHECK_TIME
  },
  {
    id: 'fuel-prices-eu-national',
    name: 'ES Naftos Biuletenis (fuel-prices.eu)',
    description: 'Europos Komisijos oficialūs savaitiniai vidurkiai',
    type: 'national_average',
    status: 'online',
    stationsCount: 1,
    lastChecked: STATIC_CHECK_TIME
  },
  {
    id: 'fuel-prices-eu-live',
    name: 'fuel-prices.eu Live',
    description: 'Tiesioginis Lietuvos degalinių kainų kanalas',
    type: 'live_station',
    status: 'online',
    stationsCount: 120,
    lastChecked: STATIC_CHECK_TIME
  },
  {
    id: 'openvan-camp',
    name: 'OpenVan.camp',
    description: 'Atviras Europos degalų kainų API (CC BY 4.0)',
    type: 'national_average',
    status: 'online',
    stationsCount: 1,
    lastChecked: STATIC_CHECK_TIME
  },
  {
    id: 'ev-charging-lithuania',
    name: 'Lietuvos EV Krovimo Tinklai',
    description: 'Nacionalinis virš 1 650 elektromobilių stotelių registras',
    type: 'live_station',
    status: 'online',
    stationsCount: 1651,
    lastChecked: STATIC_CHECK_TIME
  }
];

export default function HomePage() {
  const [data, setData] = useState<AggregatedResponse | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [selectedFuel, setSelectedFuel] = useState<FuelType>('gasoline_95');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [sortBy, setSortBy] = useState('price_asc');
  
  // Default to 'map' view as requested
  const [viewMode, setViewMode] = useState<'cards' | 'map' | 'table'>('map');

  // Amenities Filter
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');

  // Only with Prices Toggle
  const [onlyWithPrices, setOnlyWithPrices] = useState<boolean>(false);

  // Favorites / Watchlist
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);

  // Trip Fuel Planner Modal
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
    setFavorites((prev) => {
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

    // Auto-refresh sources every 30 minutes
    const interval = setInterval(() => {
      fetchData(true);
      fetchTrends();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
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
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setRadiusKm(15); // Default 15km
        setSortBy('distance');
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        alert('Nepavyko gauti jūsų GPS vietos. Patikrinkite naršyklės leidimus.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // User-submitted price reporter (Waze-style reporting)
  const handleReportPrice = (stationId: string, fuelType: FuelType, price: number) => {
    const nowIso = new Date().toISOString();
    setData((prev) => {
      if (!prev) return prev;
      const updatedStations = prev.stations.map((s) => {
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

    // 5. Amenities Filter
    if (selectedAmenity && selectedAmenity !== 'all') {
      list = list.filter((s) => s.amenities && s.amenities.includes(selectedAmenity));
    }

    // 6. Only With Prices
    if (onlyWithPrices) {
      list = list.filter((s) => s.prices[selectedFuel]?.price !== undefined && s.prices[selectedFuel]!.price > 0);
    }

    // 7. Favorites / Watchlist Only
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
        sourcesOnlineCount={data?.sourcesOnlineCount ?? 10}
        totalSourcesCount={data?.totalSourcesCount ?? DEFAULT_SOURCE_STATUSES.length}
        sourceStatuses={
          data?.sourceStatuses && data.sourceStatuses.length > 0
            ? data.sourceStatuses
            : DEFAULT_SOURCE_STATUSES
        }
        nationalAverages={data?.nationalAverages || ({} as any)}
        lastUpdated={data?.timestamp}
        onRefresh={() => fetchData(true)}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        {/* ======================================================== */}
        {/* HERO FOCUS: SEARCH BAR & INTERACTIVE MAP                */}
        {/* ======================================================== */}
        <section className="space-y-4">
          {/* Header Title with Breathing Room */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Lietuvos degalinių stebėjimas realiu laiku ({data?.stations?.length || 2400}+ stočių)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Degalinių Žemėlapis ir Greita Paieška
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Raskite pigiausią kurą arba artimiausią degalinę pagal pavadinimą, gatvę, miestą ar tinklą.
              </p>
            </div>

            {/* Quick Trip Planner CTA */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsTripPlannerOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-102"
              >
                <Route className="w-4 h-4" />
                <span>Kuro Maršruto Planuotojas</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Fast Controls */}
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
            favoritesOnly={favoritesOnly}
            onFavoritesOnlyChange={setFavoritesOnly}
            favoritesCount={favorites.size}
            selectedAmenity={selectedAmenity}
            onAmenityChange={setSelectedAmenity}
            onlyWithPrices={onlyWithPrices}
            onOnlyWithPricesChange={setOnlyWithPrices}
          />

          {/* Interactive Map (Primary Central Element) or List/Table by ViewMode */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <span className="text-sm font-semibold text-slate-500">
                Agreguojamos kainos iš 10 nepriklausomų šaltinių...
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
            <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xl bg-slate-900">
              <MapWrapper
                stations={filteredStations}
                selectedFuel={selectedFuel}
                userCoords={userCoords}
                onSelectStation={(id) => setSelectedStationId(id)}
                onLocateUser={handleLocateUser}
                isLocating={isLocating}
              />
            </div>
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
              onToggleFavorite={toggleFavorite}
              favorites={favorites}
            />
          )}
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: RASTOS DEGALINĖS (CARD LIST BELOW MAP)       */}
        {/* ======================================================== */}
        {viewMode === 'map' && !loading && filteredStations.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Rastų degalinių sąrašas</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    {filteredStations.length} degalinės
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Palyginkite kainas kortelėse arba paleiskite navigaciją į degalinę (Google Maps, Waze, Apple Maps).
                </p>
              </div>

              {/* Quick count & sorting info */}
              <div className="text-xs text-slate-400">
                <span>Rūšiuojama: </span>
                <strong className="text-slate-700 dark:text-slate-300">
                  {sortBy === 'price_asc'
                    ? 'Pigiausi viršuje'
                    : sortBy === 'distance'
                    ? 'Artimiausi viršuje'
                    : sortBy === 'updated'
                    ? 'Naujausi duomenys'
                    : 'Pagal tinklą'}
                </strong>
              </div>
            </div>

            <StationList
              stations={filteredStations}
              selectedFuel={selectedFuel}
              nationalAvgPrice={nationalAvg}
              onSelectStation={(id) => setSelectedStationId(id)}
              onToggleFavorite={toggleFavorite}
              favorites={favorites}
            />
          </section>
        )}

        {/* ======================================================== */}
        {/* SECTION 3: ŠIANDIENOS KAINŲ LYDERIAI IR VIDURKIAI        */}
        {/* (Moved down to a dedicated airy section to avoid noise)  */}
        {/* ======================================================== */}
        {data && (
          <section className="pt-8 border-t border-slate-200 dark:border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Nacionalinė suvestinė
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Šiandienos Kainų Rekordai Lietuvoje
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Pigiausios šiuo metu užfiksuotos kuro kainos degalinėse ir oficialus Europos Komisijos naftos biuletenio vidurkis.
                </p>
              </div>

              <div className="text-xs text-slate-400 shrink-0">
                <span>Atnaujinta: {formatRelativeTimeLt(data.timestamp)}</span>
              </div>
            </div>

            {/* The 4 Stat Cards */}
            <HeroStats
              data={data}
              selectedFuel={selectedFuel}
              onSelectStation={(id) => setSelectedStationId(id)}
            />
          </section>
        )}

        {/* ======================================================== */}
        {/* SECTION 4: TENDENCIJOS & KELIONIŲ MARŠRUTAI             */}
        {/* ======================================================== */}
        <section className="pt-8 border-t border-slate-200 dark:border-slate-800/80 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* 30-Day Trends Chart */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      30 Dienų Nacionalinė Kainų Dinamika
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Vidutinių benzino, dyzelino ir LPG kainų kaita Lietuvos degalinėse
                    </p>
                  </div>
                </div>
                <NationalTrendChart trends={trends} nationalAverages={data?.nationalAverages || ({} as any)} />
              </div>
            </div>

            {/* Trip Fuel Planner Feature Callout */}
            <div className="lg:col-span-4 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-emerald-800/40 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <Route className="w-3.5 h-3.5 text-emerald-400" />
                  Kelionių optimizavimas
                </div>

                <h3 className="text-xl font-black text-white leading-tight">
                  Planuojate tolimą kelionę Lietuvoje?
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Įveskite maršrutą (pvz., Vilnius – Klaipėda) ir sistema suras pigiausias degalines jūsų kelio koridoriuje. Taip sutaupysite iki <strong>15–20 €</strong> vienam bakui.
                </p>
              </div>

              <div className="relative z-10 pt-6">
                <button
                  onClick={() => setIsTripPlannerOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <Route className="w-4 h-4" />
                  <span>Atidaryti Maršruto Planuotoją</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Station Detail Modal */}
      {selectedStationId && (
        <StationDetailModal
          stationId={selectedStationId}
          onClose={() => setSelectedStationId(null)}
          nationalAverages={data?.nationalAverages || ({} as any)}
          onCommunityPriceUpdate={handleReportPrice}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.has(selectedStationId)}
        />
      )}

      {/* Trip Fuel Planner Modal */}
      <TripFuelPlannerModal
        isOpen={isTripPlannerOpen}
        onClose={() => setIsTripPlannerOpen(false)}
        stations={data?.stations || []}
        onSelectStation={(id) => {
          setIsTripPlannerOpen(false);
          setSelectedStationId(id);
        }}
      />

      <Footer />
    </div>
  );
}
