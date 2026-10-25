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
  Loader2,
  Star,
  Edit3,
  ThumbsUp,
  AlertCircle,
  Sparkles
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
  isFavorite?: boolean;
  onToggleFavorite?: (stationId: string) => void;
  onCommunityPriceUpdate?: (stationId: string, fuelType: FuelType, price: number) => void;
}

export function StationDetailModal({
  stationId,
  onClose,
  nationalAverages,
  isFavorite = false,
  onToggleFavorite,
  onCommunityPriceUpdate
}: StationDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [stationData, setStationData] = useState<{
    station: Station;
    history: any[];
    nearby: Station[];
  } | null>(null);
  const [selectedChartFuel, setSelectedChartFuel] = useState<FuelType>('gasoline_95');
  const [copied, setCopied] = useState(false);

  // Community Price Reporting State (Idea 2)
  const [isReporting, setIsReporting] = useState(false);
  const [reportFuel, setReportFuel] = useState<FuelType>('diesel');
  const [reportPrice, setReportPrice] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState(false);

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

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(reportPrice.replace(',', '.'));
    if (!isNaN(p) && p > 0.2 && p < 3.5 && station) {
      // 1. Update station state in place
      const nowIso = new Date().toISOString();
      const updatedStation = { ...station };
      updatedStation.prices[reportFuel] = {
        price: p,
        currency: 'EUR',
        source: 'Degalai.lt Bendruomenė (Waze)',
        updatedAt: nowIso,
        confidenceScore: 99,
        calculationMethod: 'freshest_verified'
      };
      updatedStation.lastUpdated = nowIso;
      setStationData(prev => prev ? { ...prev, station: updatedStation } : null);

      // 2. Persist in localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('degalai_community_reports') || '[]');
        stored.push({
          stationId: station.id,
          fuelType: reportFuel,
          price: p,
          timestamp: nowIso
        });
        localStorage.setItem('degalai_community_reports', JSON.stringify(stored));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      if (onCommunityPriceUpdate) {
        onCommunityPriceUpdate(station.id, reportFuel, p);
      }

      setReportSuccess(true);
      setTimeout(() => {
        setIsReporting(false);
        setReportSuccess(false);
        setReportPrice('');
      }, 2500);
    }
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
            <span className="text-sm font-semibold text-slate-500">Kraunami stoties duomenys...</span>
          </div>
        ) : station ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
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
                  {/* Star / Favorite button (Idea 3) */}
                  {onToggleFavorite && (
                    <button
                      onClick={() => onToggleFavorite(station.id)}
                      className={`p-2 rounded-xl transition-all ${
                        isFavorite
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={isFavorite ? 'Pašalinti iš mėgstamiausių' : 'Pridėti prie mėgstamiausių'}
                    >
                      <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
                    </button>
                  )}

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

              {/* Navigation buttons (Idea 9: Google, Waze, Apple Maps) */}
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

                <a
                  href={station.appleMapsUrl || `https://maps.apple.com/?q=${encodeURIComponent(station.name + ' ' + station.address)}&ll=${station.lat},${station.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Apple Maps
                </a>

                {/* Report Price Button (Idea 2) */}
                <button
                  onClick={() => setIsReporting(!isReporting)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors ml-auto"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Pranešti naują kainą</span>
                </button>
              </div>

              {/* Inline Community Price Reporting Form (Idea 2) */}
              {isReporting && (
                <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-md animate-in fade-in duration-150">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      Bendruomeninis kainos atnaujinimas
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      +10 Karmos taškų
                    </span>
                  </div>

                  {reportSuccess ? (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-bold">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Ačiū! Kaina atnaujinta ir išsaugota bendruomenės registre.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleReportSubmit} className="flex flex-wrap items-center gap-2 text-xs">
                      <select
                        value={reportFuel}
                        onChange={(e) => setReportFuel(e.target.value as FuelType)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                      >
                        <option value="diesel">Dyzelinas</option>
                        <option value="gasoline_95">95 Benzinas</option>
                        <option value="lpg">LPG Dujos</option>
                        <option value="gasoline_98">98 Benzinas</option>
                        <option value="diesel_plus">Dyzelinas +</option>
                        <option value="ev">Elektra EV</option>
                      </select>

                      <input
                        type="text"
                        placeholder="pvz. 1.529"
                        value={reportPrice}
                        onChange={(e) => setReportPrice(e.target.value)}
                        className="p-2 w-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-center"
                        required
                      />
                      <span className="font-bold text-slate-500">€</span>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition-colors"
                      >
                        Patvirtinti
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsReporting(false)}
                        className="px-3 py-2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        Atšaukti
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Current Prices Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Degalų Kainos Šiandien
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {(['gasoline_95', 'diesel', 'lpg', 'gasoline_98', 'diesel_plus', 'ev'] as FuelType[]).map((ft) => {
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
                          {ft === 'gasoline_95' ? '95 Benzinas' : ft === 'diesel' ? 'Dyzelinas' : ft === 'lpg' ? 'LPG Dujos' : ft === 'gasoline_98' ? '98 Benzinas' : ft === 'diesel_plus' ? 'Dyzelinas +' : 'Elektra (kW)'}
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
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {priceEntry.confidenceScore}% patikimumas
                            </span>
                          </div>
                        )}

                        {diff !== undefined && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-bold">
                            {diff < 0 ? (
                              <span className="text-emerald-500 flex items-center">
                                <TrendingDown className="w-3 h-3 mr-0.5" />
                                {formatPriceDiff(diff).text} vs vid.
                              </span>
                            ) : diff > 0 ? (
                              <span className="text-rose-500 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-0.5" />
                                +{formatPriceDiff(diff).text} vs vid.
                              </span>
                            ) : (
                              <span className="text-slate-400">Atitinka vidurkį</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 30-Day Trend Chart */}
              {history.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        30 dienų kainų dinamika
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Istoriniai kainų svyravimai šioje degalinėje
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700/60 p-1 rounded-xl self-start sm:self-auto">
                      {(['gasoline_95', 'diesel', 'lpg'] as FuelType[]).map((f) => (
                        <button
                          key={f}
                          onClick={() => setSelectedChartFuel(f)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                            selectedChartFuel === f
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {f === 'gasoline_95' ? '95' : f === 'diesel' ? 'Dyzelinas' : 'LPG'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          tickFormatter={(val) => val.slice(5)}
                        />
                        <YAxis
                          domain={['auto', 'auto']}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          tickFormatter={(val) => `${val.toFixed(2)} €`}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs border border-slate-700 shadow-xl">
                                  <div className="text-slate-400 font-medium mb-1">{d.date}</div>
                                  <div className="font-mono font-bold text-emerald-400">
                                    {d[selectedChartFuel]?.toFixed(3)} €
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey={selectedChartFuel}
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorPrice)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Source Attribution & Data Transparency */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Pirminis šaltinis: {station.primarySource}</span>
                  </div>
                  <span className="text-slate-400">Tikrinta: {formatRelativeTimeLt(station.lastUpdated)}</span>
                </div>

                <div className="text-[11px] text-slate-500">
                  Užfiksuota iš šaltinių: {station.sourcesReported.join(', ')}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Uždaryti
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
