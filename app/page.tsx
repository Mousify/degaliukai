'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AggregatedResponse, FuelType, Station, TrendPoint } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { HeroStats } from '@/components/HeroStats';
import { FuelFilterBar } from '@/components/FuelFilterBar';
import { StationList } from '@/components/StationList';
import { StationTable } from '@/components/StationTable';
import { MapWrapper } from '@/components/MapWrapper';
import { StationDetailModal } from '@/components/StationDetailModal';
import { NationalTrendChart } from '@/components/NationalTrendChart';
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
  Zap
} from 'lucide-react';

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

  // Geolocation
  const [isLocating, setIsLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);

  // Detail Modal
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

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

  // Extract unique cities and brands for filter dropdowns
  const { availableCities, availableBrands } = useMemo(() => {
    if (!data?.stations) return { availableCities: [], availableBrands: [] };
    const cities = new Set<string>();
    const brands = new Set<string>();

    data.stations.forEach((s) => {
      if (s.city) cities.add(s.city);
      if (s.brand) brands.add(s.brand);
    });

    return {
      availableCities: Array.from(cities).sort(),
      availableBrands: Array.from(brands).sort()
    };
  }, [data?.stations]);

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

    // 5. Sorting
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
    radiusKm
  ]);

  const nationalAvg = data?.nationalAverages[selectedFuel]?.price || 1.545;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Navbar */}
      <Navbar
        sourcesOnlineCount={data?.sourcesOnlineCount || 4}
        totalSourcesCount={data?.totalSourcesCount || 5}
        sourceStatuses={data?.sourceStatuses || []}
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

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-šaltinių kainų agregatorius</span>
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span>Lietuva</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Sutaupykite kiekvieną kartą pildamiesi degalus.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Palyginkite realias <strong>95 benzino</strong>, <strong>dyzelino</strong> ir <strong>LPG</strong> kainas visose šalies degalinėse. Tikrinkite duomenų šviežumą ir raskite pigiausią stotelę pakeliui.
            </p>
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

        {/* Main Navigation Tabs: Degalinių Kainos vs Nacionalinė Dinamika */}
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
            {/* Filter bar */}
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
            />

            {/* Content by ViewMode */}
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <span className="text-sm font-semibold text-slate-500">
                  Agreguojamos kainos iš nepriklausomų šaltinių...
                </span>
              </div>
            ) : viewMode === 'map' ? (
              <MapWrapper
                stations={filteredStations}
                selectedFuel={selectedFuel}
                userCoords={userCoords}
                onSelectStation={(id) => setSelectedStationId(id)}
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

      {/* Station Detail Modal */}
      <StationDetailModal
        stationId={selectedStationId}
        onClose={() => setSelectedStationId(null)}
        nationalAverages={data?.nationalAverages || ({} as any)}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-slate-900 dark:text-white">Degalai.lt</span>
            <span>—</span>
            <span>Atviras Lietuvos degalų kainų stebėjimo portalas</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span>Šaltiniai: fuel-prices.eu • European Commission Oil Bulletin • OpenVan.camp • Saurida Open Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
