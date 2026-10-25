'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AggregatedResponse, FuelType, Station, TrendPoint } from '@/lib/types';
import {
  BarChart3, TrendingUp, TrendingDown, Fuel, ArrowUpRight, ArrowDownRight,
  MapPin, Trophy, AlertTriangle, Loader2, Building2, PieChart, Activity
} from 'lucide-react';

interface BrandStats {
  brand: string;
  brandColor: string;
  stationCount: number;
  avg95: number | null;
  avgDiesel: number | null;
  avgLpg: number | null;
  cheapest95: number | null;
  cheapestDiesel: number | null;
}

interface CityStats {
  city: string;
  stationCount: number;
  avg95: number | null;
  avgDiesel: number | null;
}

export default function StatistikaPage() {
  const [data, setData] = useState<AggregatedResponse | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFuel, setSelectedFuel] = useState<FuelType>('gasoline_95');

  useEffect(() => {
    Promise.all([
      fetch('/api/prices').then(r => r.json()),
      fetch('/api/national-trends').then(r => r.json()).catch(() => [])
    ]).then(([priceData, trendData]) => {
      setData(priceData);
      setTrends(trendData);
      setLoading(false);
    });
  }, []);

  const brandStats = useMemo<BrandStats[]>(() => {
    if (!data?.stations) return [];
    const map = new Map<string, { stations: Station[]; color: string }>();
    for (const s of data.stations) {
      const existing = map.get(s.brand);
      if (existing) {
        existing.stations.push(s);
      } else {
        map.set(s.brand, { stations: [s], color: s.brandColor });
      }
    }
    return Array.from(map.entries())
      .map(([brand, { stations, color }]) => {
        const prices95 = stations.map(s => s.prices.gasoline_95?.price).filter(Boolean) as number[];
        const pricesD = stations.map(s => s.prices.diesel?.price).filter(Boolean) as number[];
        const pricesL = stations.map(s => s.prices.lpg?.price).filter(Boolean) as number[];
        return {
          brand,
          brandColor: color,
          stationCount: stations.length,
          avg95: prices95.length ? +(prices95.reduce((a, b) => a + b, 0) / prices95.length).toFixed(3) : null,
          avgDiesel: pricesD.length ? +(pricesD.reduce((a, b) => a + b, 0) / pricesD.length).toFixed(3) : null,
          avgLpg: pricesL.length ? +(pricesL.reduce((a, b) => a + b, 0) / pricesL.length).toFixed(3) : null,
          cheapest95: prices95.length ? Math.min(...prices95) : null,
          cheapestDiesel: pricesD.length ? Math.min(...pricesD) : null,
        };
      })
      .filter(b => b.stationCount >= 3)
      .sort((a, b) => b.stationCount - a.stationCount);
  }, [data]);

  const cityStats = useMemo<CityStats[]>(() => {
    if (!data?.stations) return [];
    const map = new Map<string, Station[]>();
    for (const s of data.stations) {
      const city = s.city || 'Kita';
      const existing = map.get(city);
      if (existing) existing.push(s);
      else map.set(city, [s]);
    }
    return Array.from(map.entries())
      .map(([city, stations]) => {
        const prices95 = stations.map(s => s.prices.gasoline_95?.price).filter(Boolean) as number[];
        const pricesD = stations.map(s => s.prices.diesel?.price).filter(Boolean) as number[];
        return {
          city,
          stationCount: stations.length,
          avg95: prices95.length ? +(prices95.reduce((a, b) => a + b, 0) / prices95.length).toFixed(3) : null,
          avgDiesel: pricesD.length ? +(pricesD.reduce((a, b) => a + b, 0) / pricesD.length).toFixed(3) : null,
        };
      })
      .filter(c => c.stationCount >= 3)
      .sort((a, b) => b.stationCount - a.stationCount);
  }, [data]);

  const fuelLabel = selectedFuel === 'gasoline_95' ? '95 Benzinas' : selectedFuel === 'diesel' ? 'Dyzelinas' : 'LPG Dujos';
  const totalStations = data?.stations?.length ?? 0;
  const stationsWithPrices = data?.stations?.filter(s => Object.keys(s.prices).length > 0).length ?? 0;
  const nationalAvg95 = data?.nationalAverages?.gasoline_95?.price;
  const nationalAvgD = data?.nationalAverages?.diesel?.price;
  const nationalAvgLpg = data?.nationalAverages?.lpg?.price;

  // Top 5 cheapest & most expensive for selected fuel
  const sortedByFuel = useMemo(() => {
    if (!data?.stations) return { cheapest: [], expensive: [] };
    const withPrice = data.stations
      .filter(s => s.prices[selectedFuel]?.price)
      .sort((a, b) => (a.prices[selectedFuel]!.price) - (b.prices[selectedFuel]!.price));
    return {
      cheapest: withPrice.slice(0, 5),
      expensive: withPrice.slice(-5).reverse(),
    };
  }, [data, selectedFuel]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="text-sm font-semibold text-slate-500">Kraunami statistikos duomenys...</span>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Degalų statistika
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Išsami kainų analizė pagal tinklus, miestus ir tendencijas
                </p>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Degalinės</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalStations}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{stationsWithPrices} su kainomis</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Vid. 95</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{nationalAvg95?.toFixed(3) ?? '—'} €</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Vid. Dyzelinas</div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">{nationalAvgD?.toFixed(3) ?? '—'} €</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Vid. LPG</div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">{nationalAvgLpg?.toFixed(3) ?? '—'} €</div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Brand Comparison Table */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kainos pagal tinklą</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tinklas</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Stočių</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Vid. 95</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Pig. 95</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Vid. Dyzelinas</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Vid. LPG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {brandStats.map((b) => (
                    <tr key={b.brand} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.brandColor }}></span>
                          <span className="font-semibold text-slate-900 dark:text-white">{b.brand}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{b.stationCount}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {b.avg95 !== null ? `${b.avg95.toFixed(3)} €` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {b.cheapest95 !== null ? `${b.cheapest95.toFixed(3)} €` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {b.avgDiesel !== null ? `${b.avgDiesel.toFixed(3)} €` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {b.avgLpg !== null ? `${b.avgLpg.toFixed(3)} €` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Top 5 cheapest & most expensive */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top 5 pigiausios & brangiausios</h2>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['gasoline_95', 'diesel', 'lpg'] as FuelType[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFuel(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      selectedFuel === f
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {f === 'gasoline_95' ? '95' : f === 'diesel' ? 'Dyzelinas' : 'LPG'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cheapest */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">5 pigiausios ({fuelLabel})</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedByFuel.cheapest.map((s, idx) => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-emerald-500 w-6">{idx + 1}</span>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{s.name}</div>
                          <div className="text-[11px] text-slate-500">{s.city}</div>
                        </div>
                      </div>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {s.prices[selectedFuel]!.price.toFixed(3)} €
                      </span>
                    </div>
                  ))}
                  {sortedByFuel.cheapest.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-slate-400">Nėra duomenų</div>
                  )}
                </div>
              </div>

              {/* Most expensive */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-bold text-rose-700 dark:text-rose-400">5 brangiausios ({fuelLabel})</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedByFuel.expensive.map((s, idx) => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-rose-500 w-6">{idx + 1}</span>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{s.name}</div>
                          <div className="text-[11px] text-slate-500">{s.city}</div>
                        </div>
                      </div>
                      <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                        {s.prices[selectedFuel]!.price.toFixed(3)} €
                      </span>
                    </div>
                  ))}
                  {sortedByFuel.expensive.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-slate-400">Nėra duomenų</div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* City comparison */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kainos pagal miestą / savivaldybę</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Miestas</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Degalinių</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Vid. 95 benzinas</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Vid. Dyzelinas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cityStats.slice(0, 20).map((c) => (
                    <tr key={c.city} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{c.city}</td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{c.stationCount}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {c.avg95 !== null ? `${c.avg95.toFixed(3)} €` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {c.avgDiesel !== null ? `${c.avgDiesel.toFixed(3)} €` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
