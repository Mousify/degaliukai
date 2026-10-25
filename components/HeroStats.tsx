'use client';

import React from 'react';
import { AggregatedResponse, FuelType } from '@/lib/types';
import { TrendingDown, TrendingUp, Sparkles, MapPin, Fuel, ArrowDownRight } from 'lucide-react';
import { formatPrice, formatPriceDiff } from '@/lib/utils';

interface HeroStatsProps {
  data: AggregatedResponse;
  selectedFuel: FuelType;
  onSelectStation: (stationId: string) => void;
}

export function HeroStats({ data, selectedFuel, onSelectStation }: HeroStatsProps) {
  const { cheapest, nationalAverages } = data;

  const currentAvg95 = nationalAverages.gasoline_95?.price || 1.545;
  const currentAvgDiesel = nationalAverages.diesel?.price || 1.515;
  const currentAvgLpg = nationalAverages.lpg?.price || 0.635;

  const diff95 = cheapest.gasoline_95 ? cheapest.gasoline_95.price - currentAvg95 : 0;
  const diffDiesel = cheapest.diesel ? cheapest.diesel.price - currentAvgDiesel : 0;
  const diffLpg = cheapest.lpg ? cheapest.lpg.price - currentAvgLpg : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 95 Petrol */}
      <div
        onClick={() => cheapest.gasoline_95 && onSelectStation(cheapest.gasoline_95.stationId)}
        className="group relative p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-emerald-950/10 border border-emerald-500/20 dark:border-emerald-500/30 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Pigiausias 95
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            {formatPriceDiff(diff95).text} vs vid.
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {cheapest.gasoline_95 ? cheapest.gasoline_95.price.toFixed(3) : '1.449'}
          </span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">€/L</span>
        </div>

        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 truncate">
          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-slate-200">
            {cheapest.gasoline_95?.brand ?? 'Jozita'}
          </span>
          <span>•</span>
          <span className="truncate">{cheapest.gasoline_95?.city ?? 'Lietuva'}</span>
        </div>
      </div>

      {/* Diesel */}
      <div
        onClick={() => cheapest.diesel && onSelectStation(cheapest.diesel.stationId)}
        className="group relative p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-950/40 dark:via-blue-950/10 border border-blue-500/20 dark:border-blue-500/30 hover:border-blue-500/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Pigiausias Dyzelinas
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300">
            {formatPriceDiff(diffDiesel).text} vs vid.
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {cheapest.diesel ? cheapest.diesel.price.toFixed(3) : '1.419'}
          </span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">€/L</span>
        </div>

        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 truncate">
          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-slate-200">
            {cheapest.diesel?.brand ?? 'Jozita'}
          </span>
          <span>•</span>
          <span className="truncate">{cheapest.diesel?.city ?? 'Lietuva'}</span>
        </div>
      </div>

      {/* LPG */}
      <div
        onClick={() => cheapest.lpg && onSelectStation(cheapest.lpg.stationId)}
        className="group relative p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-amber-950/10 border border-amber-500/20 dark:border-amber-500/30 hover:border-amber-500/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Pigiausios LPG Dujos
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
            {formatPriceDiff(diffLpg).text} vs vid.
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {cheapest.lpg ? cheapest.lpg.price.toFixed(3) : '0.575'}
          </span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">€/L</span>
        </div>

        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 truncate">
          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-slate-200">
            {cheapest.lpg?.brand ?? 'Jozita'}
          </span>
          <span>•</span>
          <span className="truncate">{cheapest.lpg?.city ?? 'Lietuva'}</span>
        </div>
      </div>

      {/* Official Benchmark */}
      <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ES Biuletenio Vidurkis
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Oficialus
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {selectedFuel === 'gasoline_95'
              ? currentAvg95.toFixed(3)
              : selectedFuel === 'diesel'
              ? currentAvgDiesel.toFixed(3)
              : currentAvgLpg.toFixed(3)}
          </span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">€/L</span>
        </div>

        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Lietuvos savaitinis vidurkis</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
            <TrendingDown className="w-3.5 h-3.5" />
            -0.012 €
          </span>
        </div>
      </div>
    </div>
  );
}
