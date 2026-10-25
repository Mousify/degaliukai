'use client';

import React, { useState, useMemo } from 'react';
import { Station, FuelType } from '@/lib/types';
import {
  X, Route, Compass, Navigation, Fuel, Sparkles, Trophy, ArrowRight,
  CheckCircle2, ExternalLink, MapPin, Calculator, AlertCircle, Zap
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface TripFuelPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: Station[];
  onSelectStation: (stationId: string) => void;
}

interface PredefinedRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  distanceKm: number;
  corridor: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

const PREDEFINED_ROUTES: PredefinedRoute[] = [
  {
    id: 'vilnius-klaipeda',
    name: 'Vilnius ➔ Klaipėda (A1 Magistralė)',
    from: 'Vilnius',
    to: 'Klaipėda',
    distanceKm: 310,
    corridor: { minLat: 54.6, maxLat: 55.8, minLng: 21.1, maxLng: 25.4 }
  },
  {
    id: 'kaunas-vilnius',
    name: 'Kaunas ➔ Vilnius (A1)',
    from: 'Kaunas',
    to: 'Vilnius',
    distanceKm: 102,
    corridor: { minLat: 54.6, maxLat: 54.95, minLng: 23.8, maxLng: 25.4 }
  },
  {
    id: 'vilnius-panevezys',
    name: 'Vilnius ➔ Panevėžys (A2 Magistralė)',
    from: 'Vilnius',
    to: 'Panevėžys',
    distanceKm: 135,
    corridor: { minLat: 54.6, maxLat: 55.8, minLng: 24.2, maxLng: 25.4 }
  },
  {
    id: 'kaunas-marijampole',
    name: 'Kaunas ➔ Marijampolė / Lenkija (Via Baltica A5)',
    from: 'Kaunas',
    to: 'Marijampolė',
    distanceKm: 65,
    corridor: { minLat: 54.3, maxLat: 54.95, minLng: 23.2, maxLng: 24.1 }
  },
  {
    id: 'klaipeda-palanga',
    name: 'Klaipėda ➔ Palanga / Šventoji (A13)',
    from: 'Klaipėda',
    to: 'Palanga',
    distanceKm: 35,
    corridor: { minLat: 55.6, maxLat: 56.1, minLng: 21.0, maxLng: 21.3 }
  }
];

export function TripFuelPlannerModal({
  isOpen,
  onClose,
  stations,
  onSelectStation
}: TripFuelPlannerModalProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('vilnius-klaipeda');
  const [fuelType, setFuelType] = useState<FuelType>('diesel');
  const [fuelLiters, setFuelLiters] = useState<number>(50);
  const [consumptionL100, setConsumptionL100] = useState<number>(6.5);

  const activeRoute = PREDEFINED_ROUTES.find(r => r.id === selectedRouteId) || PREDEFINED_ROUTES[0];

  // Filter stations along the highway corridor that have the selected fuel price
  const candidateStations = useMemo(() => {
    const c = activeRoute.corridor;
    return stations
      .filter(s => {
        const inCorridor = s.lat >= c.minLat && s.lat <= c.maxLat && s.lng >= c.minLng && s.lng <= c.maxLng;
        if (!inCorridor) return false;
        const price = s.prices[fuelType]?.price;
        return typeof price === 'number' && price > 0;
      })
      .sort((a, b) => {
        const pa = a.prices[fuelType]!.price;
        const pb = b.prices[fuelType]!.price;
        return pa - pb;
      });
  }, [activeRoute, stations, fuelType]);

  const bestStation = candidateStations[0];
  const worstStation = candidateStations[candidateStations.length - 1];

  const estimatedTripLiters = Number(((activeRoute.distanceKm / 100) * consumptionL100).toFixed(1));
  const fillLiters = Math.max(fuelLiters, estimatedTripLiters);

  const savingsEur = useMemo(() => {
    if (!bestStation || !worstStation) return 0;
    const diff = worstStation.prices[fuelType]!.price - bestStation.prices[fuelType]!.price;
    return Number((diff * fillLiters).toFixed(2));
  }, [bestStation, worstStation, fuelType, fillLiters]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Kuro Maršruto Planuotojas
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Smart Trip
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Raskite pigiausią degalinę savo kelionės kelyje ir sutaupykite
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Controls: Route & Fuel selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Pasirinkite maršrutą:
              </label>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PREDEFINED_ROUTES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (~{r.distanceKm} km)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Kuro tipas:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'diesel', label: 'Dyzelinas' },
                  { id: 'gasoline_95', label: '95 Benzinas' },
                  { id: 'lpg', label: 'LPG Dujos' },
                  { id: 'ev', label: 'Elektra EV' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFuelType(f.id as FuelType)}
                    className={`py-2 px-2 rounded-xl text-center text-xs font-bold transition-all ${
                      fuelType === f.id
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sliders: Liters & Consumption */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Planuojamas pilamas kiekis:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{fillLiters} L</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={fillLiters}
                onChange={(e) => setFuelLiters(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Vidutinės sąnaudos:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{consumptionL100} L / 100 km</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="14.0"
                step="0.5"
                value={consumptionL100}
                onChange={(e) => setConsumptionL100(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          {bestStation && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
                <Trophy className="w-48 h-48" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold mb-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Optimalus maršruto sustojimas rastas!</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black">{bestStation.name}</h3>
                    <p className="text-xs text-emerald-100/90 mt-0.5">
                      {bestStation.address}, {bestStation.city}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-2xl sm:text-3xl font-black font-mono">
                      {bestStation.prices[fuelType]?.price.toFixed(3)} €
                    </div>
                    <div className="text-[11px] text-emerald-200">
                      kaina už {fuelType === 'ev' ? 'kWh' : 'litrą'}
                    </div>
                  </div>
                </div>

                {savingsEur > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-emerald-100">
                      Sutaupote lyginant su brangiausia magistralės stotimi:
                    </span>
                    <span className="font-black text-amber-300 text-base">
                      +{savingsEur} €
                    </span>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onSelectStation(bestStation.id);
                    }}
                    className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm"
                  >
                    Peržiūrėti degalinę
                  </button>

                  <a
                    href={bestStation.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 text-white font-bold text-xs flex items-center gap-1.5 transition-colors border border-white/20"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Google Maps</span>
                  </a>

                  <a
                    href={bestStation.wazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Waze</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Ranked List of Stations along the route */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Degalinės maršrute ({candidateStations.length} rastos)
            </h4>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
              {candidateStations.map((s, idx) => {
                const price = s.prices[fuelType]?.price;
                const isWinner = idx === 0;

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      onClose();
                      onSelectStation(s.id);
                    }}
                    className={`p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                      isWinner ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center text-xs font-black ${isWinner ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: s.brandColor }}
                          />
                          <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                            {s.name}
                          </span>
                          {isWinner && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-white">
                              PIGIAUSIA
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 line-clamp-1">
                          {s.address}, {s.city}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono font-black text-sm ${isWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {price ? `${price.toFixed(3)} €` : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {candidateStations.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  Šiame maršrute su pasirinktu kuru degalinių nerasta.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
