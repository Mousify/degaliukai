'use client';

import React from 'react';
import { FuelType, Station } from '@/lib/types';
import { MapPin, Navigation, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import { formatPriceDiff, formatRelativeTimeLt, getBrandStyle } from '@/lib/utils';

interface StationTableProps {
  stations: Station[];
  selectedFuel: FuelType;
  nationalAvgPrice: number;
  onSelectStation: (stationId: string) => void;
}

export function StationTable({
  stations,
  selectedFuel,
  nationalAvgPrice,
  onSelectStation
}: StationTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="py-3.5 px-4">Tinklas</th>
            <th className="py-3.5 px-4">Degalinė & Miestas</th>
            <th className="py-3.5 px-4 text-right">Pasirinkta kaina</th>
            <th className="py-3.5 px-4 text-right hidden sm:table-cell">Skirtumas vs vid.</th>
            <th className="py-3.5 px-4 text-right hidden md:table-cell">Atstumas</th>
            <th className="py-3.5 px-4 hidden lg:table-cell">Atnaujinta</th>
            <th className="py-3.5 px-4 text-center">Veiksmas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {stations.map((s) => {
            const brandStyle = getBrandStyle(s.brand);
            const priceEntry = s.prices[selectedFuel];
            const price = priceEntry?.price;
            const diff = price ? price - nationalAvgPrice : undefined;
            const diffFormatted = formatPriceDiff(diff);

            return (
              <tr
                key={s.id}
                onClick={() => onSelectStation(s.id)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                {/* Brand */}
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg border ${brandStyle.bg} ${brandStyle.text} ${brandStyle.border}`}
                  >
                    {s.brand}
                  </span>
                </td>

                {/* Name & City */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {s.name}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{s.address}, {s.city}</span>
                  </div>
                </td>

                {/* Price */}
                <td className="py-3.5 px-4 text-right">
                  <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                    {price ? `${price.toFixed(3)} €` : '—'}
                  </span>
                </td>

                {/* Diff */}
                <td className="py-3.5 px-4 text-right hidden sm:table-cell">
                  {diff !== undefined ? (
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                        diff < 0
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                          : diff > 0
                          ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                          : 'text-slate-400'
                      }`}
                    >
                      {diffFormatted.text}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>

                {/* Distance */}
                <td className="py-3.5 px-4 text-right hidden md:table-cell font-mono text-xs">
                  {s.distanceKm !== undefined ? (
                    <span className="flex items-center justify-end gap-1 text-slate-600 dark:text-slate-300">
                      <Navigation className="w-3 h-3 text-emerald-500" />
                      {s.distanceKm} km
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                {/* Last updated */}
                <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTimeLt(s.lastUpdated)}
                  </span>
                </td>

                {/* Action button */}
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStation(s.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Peržiūrėti degalinės grafiką"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
