'use client';

import React, { useState } from 'react';
import { FuelType } from '@/lib/types';
import {
  Search,
  Navigation,
  SlidersHorizontal,
  Map as MapIcon,
  LayoutGrid,
  List,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Star,
  Zap,
  Coffee,
  Car,
  Clock,
  Droplets,
  Wind,
  Filter,
  X,
  RotateCcw
} from 'lucide-react';

interface FuelFilterBarProps {
  selectedFuel: FuelType;
  onFuelChange: (fuel: FuelType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: 'cards' | 'map' | 'table';
  onViewModeChange: (mode: 'cards' | 'map' | 'table') => void;

  // Geolocation
  isLocating: boolean;
  userCoords: { lat: number; lng: number } | null;
  radiusKm: number | null;
  onLocateUser: () => void;
  onRadiusChange: (radius: number | null) => void;
  availableCities: string[];
  availableBrands: string[];

  // Idea 3: Favorites / Watchlist filter
  favoritesOnly?: boolean;
  onFavoritesOnlyChange?: (favOnly: boolean) => void;
  favoritesCount?: number;

  // Idea 6: Amenities Filter
  selectedAmenity?: string;
  onAmenityChange?: (amenity: string) => void;

  // Idea 9: Only with Prices toggle
  onlyWithPrices?: boolean;
  onOnlyWithPricesChange?: (val: boolean) => void;
}

export function FuelFilterBar({
  selectedFuel,
  onFuelChange,
  searchQuery,
  onSearchChange,
  selectedBrand,
  onBrandChange,
  selectedCity,
  onCityChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  isLocating,
  userCoords,
  radiusKm,
  onLocateUser,
  onRadiusChange,
  availableCities,
  availableBrands,
  favoritesOnly = false,
  onFavoritesOnlyChange,
  favoritesCount = 0,
  selectedAmenity = 'all',
  onAmenityChange,
  onlyWithPrices = false,
  onOnlyWithPricesChange
}: FuelFilterBarProps) {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const fuelTabs: { id: FuelType; label: string; short: string; badge: string }[] = [
    { id: 'gasoline_95', label: 'Benzinas 95', short: '95', badge: 'E5' },
    { id: 'diesel', label: 'Dyzelinas', short: 'D', badge: 'B7' },
    { id: 'lpg', label: 'LPG Dujos', short: 'LPG', badge: 'Autogas' },
    { id: 'gasoline_98', label: 'Benzinas 98', short: '98', badge: 'E5' },
    { id: 'diesel_plus', label: 'Dyzelinas +', short: 'D+', badge: 'Premium' },
    { id: 'ev', label: 'Elektra (EV)', short: 'EV', badge: 'kW' }
  ];

  const amenityOptions = [
    { id: 'all', label: 'Visos paslaugos', icon: Filter },
    { id: 'car_wash', label: 'Plovykla', icon: Car },
    { id: 'coffee', label: 'Kava ir maistas', icon: Coffee },
    { id: 'tire_air', label: 'Padangų slėgis', icon: Wind },
    { id: 'adblue', label: 'AdBlue', icon: Droplets },
    { id: '24_hours', label: 'Dirba 24/7', icon: Clock },
    { id: 'ev_charging', label: 'EV krovimas', icon: Zap }
  ];

  // Count active secondary filters
  const activeFiltersCount =
    (selectedBrand !== 'all' ? 1 : 0) +
    (selectedCity !== 'all' ? 1 : 0) +
    (selectedAmenity !== 'all' ? 1 : 0) +
    (onlyWithPrices ? 1 : 0) +
    (favoritesOnly ? 1 : 0) +
    (radiusKm ? 1 : 0);

  const handleResetFilters = () => {
    onBrandChange('all');
    onCityChange('all');
    if (onAmenityChange) onAmenityChange('all');
    if (onOnlyWithPricesChange) onOnlyWithPricesChange(false);
    if (onFavoritesOnlyChange) onFavoritesOnlyChange(false);
    onRadiusChange(null);
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Main Search & Command Row */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-900/5 transition-all">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Prominent Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Ieškoti degalinės, tinklo (Circle K, Neste...) ar miesto (Vilnius, Kaunas)..."
              className="w-full pl-11 pr-10 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border-0 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Išvalyti paiešką"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Actions (Location, Filter Drawer Toggle, View Modes) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {/* Near Me / GPS Button */}
            <button
              onClick={onLocateUser}
              disabled={isLocating}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold border transition-all shrink-0 ${
                userCoords
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Rasti degalines šalia jūsų"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              ) : (
                <Navigation className={`w-4 h-4 ${userCoords ? 'text-emerald-500' : 'text-slate-400'}`} />
              )}
              <span className="whitespace-nowrap">{userCoords ? 'Šalia manęs' : 'Mano vieta'}</span>
              {userCoords && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            </button>

            {/* Filter Drawer Toggle with Active Count Badge */}
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold border transition-all shrink-0 ${
                isFilterDrawerOpen || activeFiltersCount > 0
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Papildomi filtrai (tinklai, miestai, patogumai)"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filtrai</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-emerald-700 text-xs font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              {isFilterDrawerOpen ? (
                <ChevronUp className="w-3.5 h-3.5 opacity-80" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              )}
            </button>

            {/* View Mode Switcher (Map default) */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 p-1 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0">
              <button
                onClick={() => onViewModeChange('map')}
                className={`p-2 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'map'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Interaktyvus žemėlapis"
              >
                <MapIcon className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">Žemėlapis</span>
              </button>

              <button
                onClick={() => onViewModeChange('cards')}
                className={`p-2 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Kortelių sąrašas"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Kortelės</span>
              </button>

              <button
                onClick={() => onViewModeChange('table')}
                className={`p-2 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Lentelės vaizdas"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Lentelė</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Fuel Type Selector (Clean, Airy Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {fuelTabs.map((tab) => {
          const isSelected = selectedFuel === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onFuelChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shadow-sm border ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md ${
                  isSelected
                    ? tab.id === 'ev'
                      ? 'bg-amber-400 text-slate-900 font-black'
                      : 'bg-emerald-500 text-white font-black'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Expandable Secondary Filters Drawer */}
      {isFilterDrawerOpen && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filtruoti degalinių rezultatus</h3>
              {activeFiltersCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  {activeFiltersCount} aktyvūs
                </span>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Išvalyti visus</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Brand Dropdown */}
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Degalinių tinklas:
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => onBrandChange(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Visi tinklai</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* City Dropdown */}
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Miestas / Rajonas:
              </label>
              <select
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Visi miestai</option>
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Radius (if GPS is active) */}
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Atstumo spindulys:
              </label>
              <select
                value={radiusKm || ''}
                onChange={(e) => onRadiusChange(e.target.value ? Number(e.target.value) : null)}
                disabled={!userCoords}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                <option value="">{userCoords ? 'Visi atstumai' : 'Pirma įjunkite vietos nustatymą'}</option>
                <option value="5">Iki 5 km</option>
                <option value="10">Iki 10 km</option>
                <option value="25">Iki 25 km</option>
                <option value="50">Iki 50 km</option>
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Rūšiuoti pagal:
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="price_asc">Pigiausi viršuje</option>
                <option value="price_desc">Brangiausi viršuje</option>
                {userCoords && <option value="distance">Pagal atstumą (artimiausi)</option>}
                <option value="updated">Naujausi duomenys</option>
                <option value="brand">Pagal tinklą (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Amenities & Toggles */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Amenities Pills */}
            {onAmenityChange && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-slate-400 text-[11px] mr-1">Paslaugos:</span>
                {amenityOptions.map((am) => {
                  const Icon = am.icon;
                  const isSelected = selectedAmenity === am.id;
                  return (
                    <button
                      key={am.id}
                      onClick={() => onAmenityChange(am.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{am.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick check toggles */}
            <div className="flex items-center gap-2 ml-auto">
              {onOnlyWithPricesChange && (
                <button
                  onClick={() => onOnlyWithPricesChange(!onlyWithPrices)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition-all ${
                    onlyWithPrices
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200'
                  }`}
                  title="Rodyti tik degalines, turinčias nurodytą kainą"
                >
                  <Check className={`w-3.5 h-3.5 ${onlyWithPrices ? 'opacity-100' : 'opacity-40'}`} />
                  <span>Tik su kaina</span>
                </button>
              )}

              {onFavoritesOnlyChange && (
                <button
                  onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition-all ${
                    favoritesOnly
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200'
                  }`}
                  title="Rodyti tik pažymėtas degalines"
                >
                  <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                  <span>Mėgstamos ({favoritesCount})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
