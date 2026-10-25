'use client';

import React from 'react';
import { FuelType, Station } from '@/lib/types';
import {
  MapPin,
  Clock,
  Navigation,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Coffee,
  ShoppingBag,
  Car,
  Zap,
  Info
} from 'lucide-react';
import { formatPrice, formatPriceDiff, formatRelativeTimeLt, getBrandStyle } from '@/lib/utils';

interface StationListProps {
  stations: Station[];
  selectedFuel: FuelType;
  nationalAvgPrice: number;
  onSelectStation: (stationId: string) => void;
}

export function StationList({
  stations,
  selectedFuel,
  nationalAvgPrice,
  onSelectStation
}: StationListProps) {
  if (stations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Info className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Nerasta degalinių pagal pasirinktus filtrus
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          Bandykite pakeisti paieškos frazę, pasirinkti kitą tinklą ar išplėsti paieškos spindulį.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stations.map((station) => {
        const brandStyle = getBrandStyle(station.brand);
        const fuelEntry = station.prices[selectedFuel];
        const price = fuelEntry?.price;
        const diff = price ? price - nationalAvgPrice : undefined;
        const diffFormatted = formatPriceDiff(diff);
        const isCheapestInSelection = fuelEntry?.isLowest;

        return (
          <div
            key={station.id}
            onClick={() => onSelectStation(station.id)}
            className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
              isCheapestInSelection
                ? 'border-emerald-500/50 dark:border-emerald-500/60 ring-2 ring-emerald-500/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {/* Top Bar: Brand, Lowest Tag, Distance */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${brandStyle.bg} ${brandStyle.text} ${brandStyle.border}`}
                  >
                    {station.brand}
                  </span>

                  {isCheapestInSelection && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/20">
                      <Sparkles className="w-3 h-3" />
                      Geriausia kaina
                    </span>
                  )}
                </div>

                {station.distanceKm !== undefined && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    <Navigation className="w-3 h-3 text-emerald-500" />
                    {station.distanceKm} km
                  </span>
                )}
              </div>

              {/* Station Name & Address */}
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                {station.name}
              </h3>

              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{station.address}, {station.city}</span>
              </div>
            </div>

            {/* Price section */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Kaina už litrą
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                      {price ? price.toFixed(3) : '—'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">€/L</span>
                  </div>
                </div>

                {/* Diff vs National Average & Confidence */}
                <div className="flex flex-col items-end gap-1">
                  {fuelEntry?.confidenceScore !== undefined && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        fuelEntry.confidenceScore >= 80
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : fuelEntry.confidenceScore >= 50
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                      title={`Kainos patikimumas: ${fuelEntry.confidenceScore}% (${fuelEntry.calculationMethod})`}
                    >
                      {fuelEntry.confidenceScore}% tikėtina
                    </span>
                  )}
                  {diff !== undefined && (
                    <div
                      className={`text-right text-xs font-bold px-2 py-0.5 rounded-lg ${
                        diff < 0
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : diff > 0
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      <div>{diffFormatted.text}</div>
                      <div className="text-[10px] font-normal text-slate-400">vs vidurkis</div>
                    </div>
                  )}
                </div>
              </div>

              {/* All fuels mini bar */}
              <div className="flex items-center gap-2 mt-3 pt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {station.prices.gasoline_95 && selectedFuel !== 'gasoline_95' && (
                  <span>95: <strong className="text-slate-700 dark:text-slate-300 font-mono">{station.prices.gasoline_95.price.toFixed(3)}</strong></span>
                )}
                {station.prices.diesel && selectedFuel !== 'diesel' && (
                  <span>D: <strong className="text-slate-700 dark:text-slate-300 font-mono">{station.prices.diesel.price.toFixed(3)}</strong></span>
                )}
                {station.prices.lpg && selectedFuel !== 'lpg' && (
                  <span>LPG: <strong className="text-slate-700 dark:text-slate-300 font-mono">{station.prices.lpg.price.toFixed(3)}</strong></span>
                )}
              </div>

              {/* Bottom Freshness & Action */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {formatRelativeTimeLt(station.lastUpdated)}
                </span>

                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  Grafikas & info
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
