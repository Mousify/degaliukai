'use client';

import React, { useEffect, useState } from 'react';
import { FuelType, NationalAverage, Station } from '@/lib/types';
import {
  X,
  MapPin,
  Clock,
  Navigation,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Share2,
  Check,
  Coffee,
  ShoppingBag,
  Car,
  Zap,
  Droplets,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { formatPrice, formatPriceDiff, formatRelativeTimeLt, getBrandStyle } from '@/lib/utils';

interface StationDetailModalProps {
  stationId: string | null;
  onClose: () => void;
  nationalAverages: Record<FuelType, NationalAverage>;
}

export function StationDetailModal({
  stationId,
  onClose,
  nationalAverages
}: StationDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [stationData, setStationData] = useState<{
    station: Station;
    history: any[];
    nearby: Station[];
  } | null>(null);
  const [selectedChartFuel, setSelectedChartFuel] = useState<FuelType>('gasoline_95');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!stationId) return;

    let isMounted = true;
    setLoading(true);

    fetch(`/api/stations/${stationId}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setStationData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [stationId]);

  if (!stationId) return null;

  const station = stationData?.station;
  const history = stationData?.history || [];
  const brandStyle = station ? getBrandStyle(station.brand) : null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="text-sm font-semibold text-slate-500">Kraunami degalinės duomenys...</span>
          </div>
        ) : !station ? (
          <div className="p-12 text-center">
            <p className="text-sm text-slate-500">Degalinės duomenų nepavyko rasti.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              Uždaryti
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${brandStyle?.bg} ${brandStyle?.text} ${brandStyle?.border}`}
                    >
                      {station.brand}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Atnaujinta: {formatRelativeTimeLt(station.lastUpdated)}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {station.name}
                  </h2>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{station.address}, {station.city} ({station.county})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Kopijuoti nuorodą"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex flex-wrap items-center gap-2.5 mt-4">
                <a
                  href={station.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                  Google Maps
                </a>

                <a
                  href={station.wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Waze
                </a>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Current Prices Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Degalų Kainos Šiandien
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {(['gasoline_95', 'diesel', 'lpg', 'gasoline_98', 'diesel_plus'] as FuelType[]).map((ft) => {
                    const priceEntry = station.prices[ft];
                    const nationalAvg = nationalAverages[ft]?.price;
                    const diff = priceEntry && nationalAvg ? priceEntry.price - nationalAvg : undefined;

                    return (
                      <div
                        key={ft}
                        className={`p-3.5 rounded-2xl border ${
                          priceEntry
                            ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
                            : 'bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                          {ft === 'gasoline_95' ? '95 Benzinas' : ft === 'diesel' ? 'Dyzelinas' : ft === 'lpg' ? 'LPG Dujos' : ft === 'gasoline_98' ? '98 Benzinas' : 'Dyzelinas +'}
                        </div>

                        <div className="text-xl font-black font-mono mt-1 text-slate-900 dark:text-white">
                          {priceEntry ? `${priceEntry.price.toFixed(3)} €` : '—'}
                        </div>

                        {priceEntry?.confidenceScore !== undefined && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                priceEntry.confidenceScore >= 80
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : priceEntry.confidenceScore >= 50
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              }`}
                              title={`Patikimumo įvertis: ${priceEntry.confidenceScore}% (${priceEntry.calculationMethod})`}
                            >
                              {priceEntry.confidenceScore}% patikimumas
                            </span>
                          </div>
                        )}

                        {diff !== undefined && (
                          <div
                            className={`text-[10px] font-bold mt-1 ${
                              diff < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                            }`}
                          >
                            {formatPriceDiff(diff).text} vs vid.
                          </div>
                        )}

                        {priceEntry?.alternativePrices && priceEntry.alternativePrices.length > 0 && (
                          <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/50 text-[10px] text-slate-400">
                            <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Šaltiniai ({priceEntry.sourceCount}):</span>
                            {priceEntry.alternativePrices.map((alt, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[9px] text-slate-500">
                                <span className="truncate max-w-[90px]">{alt.source}</span>
                                <span className="font-mono">{alt.price.toFixed(3)} €</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 30-Day Interactive Price History Chart */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    30 Dienų Kainų Dinamika
                  </h3>

                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setSelectedChartFuel('gasoline_95')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        selectedChartFuel === 'gasoline_95'
                          ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      95
                    </button>
                    <button
                      onClick={() => setSelectedChartFuel('diesel')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        selectedChartFuel === 'diesel'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      Dyzelinas
                    </button>
                    <button
                      onClick={() => setSelectedChartFuel('lpg')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        selectedChartFuel === 'lpg'
                          ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      LPG
                    </button>
                  </div>
                </div>

                <div className="h-56 w-full p-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="detailPriceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickFormatter={(val) => val.slice(5)}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickFormatter={(val) => `${val.toFixed(2)} €`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                        formatter={(val: any) => [`${Number(val).toFixed(3)} €/L`, 'Kaina']}
                        labelFormatter={(label) => `Data: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey={selectedChartFuel}
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#detailPriceGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Source Attribution & Cross-Checks */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Pirminis šaltinis: <strong>{station.primarySource}</strong>
                  </span>
                  <span className="text-slate-400">
                    Tikrinta: {formatRelativeTimeLt(station.lastUpdated)}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Užfiksuota iš šaltinių: {station.sourcesReported.join(', ')}.
                </p>

                {/* Alternative prices if multiple sources reported differing values */}
                {Object.entries(station.prices).some(
                  ([_, p]) => p?.alternativePrices && p.alternativePrices.length > 0
                ) && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Kiti užfiksuoti pranešimai (kryžminė patikra):
                    </span>
                    <div className="mt-1 space-y-1">
                      {Object.entries(station.prices).map(([fuelKey, p]) =>
                        p?.alternativePrices?.map((alt, idx) => (
                          <div key={idx} className="flex justify-between text-slate-500">
                            <span>{alt.source} ({fuelKey}):</span>
                            <span className="font-mono font-bold">{alt.price.toFixed(3)} €</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Uždaryti
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
