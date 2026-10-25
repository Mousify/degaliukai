'use client';

import React from 'react';
import { FuelType } from '@/lib/types';
import {
  Search,
  Navigation,
  MapPin,
  SlidersHorizontal,
  Map as MapIcon,
  LayoutGrid,
  List,
  Check,
  ChevronDown,
  Loader2
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
  availableBrands
}: FuelFilterBarProps) {
  const fuelTabs: { id: FuelType; label: string; short: string; badge: string }[] = [
    { id: 'gasoline_95', label: 'Benzinas 95', short: '95', badge: 'E5' },
    { id: 'diesel', label: 'Dyzelinas', short: 'D', badge: 'B7' },
    { id: 'lpg', label: 'LPG Dujos', short: 'LPG', badge: 'Autogas' },
    { id: 'gasoline_98', label: 'Benzinas 98', short: '98', badge: 'E5' },
    { id: 'diesel_plus', label: 'Dyzelinas +', short: 'D+', badge: 'Premium' }
  ];

  return (
    <div className="space-y-4">
      {/* 1. Fuel Type Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {fuelTabs.map((tab) => {
            const isSelected = selectedFuel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onFuelChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => onViewModeChange('cards')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Kortelių vaizdas"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden md:inline">Kortelės</span>
          </button>

          <button
            onClick={() => onViewModeChange('map')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'map'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Žemėlapio vaizdas"
          >
            <MapIcon className="w-4 h-4" />
            <span className="hidden md:inline">Žemėlapis</span>
          </button>

          <button
            onClick={() => onViewModeChange('table')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Lentelės vaizdas"
          >
            <List className="w-4 h-4" />
            <span className="hidden md:inline">Lentelė</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ieškoti pagal gatvę, miestą ar degalinę..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>

        {/* Near Me / Geolocation Button */}
        <div className="lg:col-span-3 flex items-center gap-2">
          <button
            onClick={onLocateUser}
            disabled={isLocating}
            className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-all shadow-sm ${
              userCoords
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
            ) : (
              <Navigation className={`w-4 h-4 ${userCoords ? 'text-emerald-500' : 'text-slate-400'}`} />
            )}
            <span className="truncate">
              {userCoords ? 'Šalia manęs (įjungta)' : 'Šalia manęs'}
            </span>
          </button>

          {/* Radius selector dropdown if user location is active */}
          {userCoords && (
            <select
              value={radiusKm || ''}
              onChange={(e) => onRadiusChange(e.target.value ? Number(e.target.value) : null)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              <option value="">Visi atstumai</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
            </select>
          )}
        </div>

        {/* Brand Dropdown */}
        <div className="lg:col-span-2">
          <select
            value={selectedBrand}
            onChange={(e) => onBrandChange(e.target.value)}
            className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
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
        <div className="lg:col-span-1.5">
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="all">Visi miestai</option>
            {availableCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="lg:col-span-1.5">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="price_asc">Pigiausi viršuje</option>
            <option value="price_desc">Brangiausi viršuje</option>
            {userCoords && <option value="distance">Pagal atstumą</option>}
            <option value="updated">Naujausi duomenys</option>
            <option value="brand">Pagal tinklą (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
