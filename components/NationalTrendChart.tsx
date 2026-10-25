'use client';

import React, { useState } from 'react';
import { TrendPoint, NationalAverage } from '@/lib/types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { TrendingUp, Calendar, Info, ShieldCheck } from 'lucide-react';

interface NationalTrendChartProps {
  trends: TrendPoint[];
  nationalAverages: Record<string, NationalAverage>;
}

export function NationalTrendChart({ trends, nationalAverages }: NationalTrendChartProps) {
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | 'all'>('3m');
  const [activeFuel, setActiveFuel] = useState<'all' | '95' | 'diesel' | 'lpg'>('all');

  // Slice trends according to selected range
  const filteredTrends = React.useMemo(() => {
    if (trends.length === 0) return [];
    switch (timeRange) {
      case '1m':
        return trends.slice(-4);
      case '3m':
        return trends.slice(-12);
      case '6m':
        return trends.slice(-24);
      case 'all':
      default:
        return trends;
    }
  }, [trends, timeRange]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Nacionalinė Degalų Kainų Dinamika
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Europos Komisijos oficialus savaitinis naftos produktų biuletenis (Weekly Oil Bulletin)
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setTimeRange('1m')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === '1m'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            1 Mėn.
          </button>
          <button
            onClick={() => setTimeRange('3m')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === '3m'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            3 Mėn.
          </button>
          <button
            onClick={() => setTimeRange('6m')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === '6m'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            6 Mėn.
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Visi
          </button>
        </div>
      </div>

      {/* Recharts Line Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredTrends} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(val) => val.slice(5)}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
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
              formatter={(val: any, name: any) => [
                `${Number(val).toFixed(3)} €/L`,
                name === 'gasoline_95' ? 'Benzinas 95' : name === 'diesel' ? 'Dyzelinas' : 'LPG Dujos'
              ]}
              labelFormatter={(label) => `Savaitė: ${label}`}
            />
            <Legend
              formatter={(val) => (
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {val === 'gasoline_95'
                    ? 'Euro 95 Benzinas'
                    : val === 'diesel'
                    ? 'Dyzelinas'
                    : 'Suskystintos Dujos (LPG)'}
                </span>
              )}
            />
            {(activeFuel === 'all' || activeFuel === '95') && (
              <Line
                type="monotone"
                dataKey="gasoline_95"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 3, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
            )}
            {(activeFuel === 'all' || activeFuel === 'diesel') && (
              <Line
                type="monotone"
                dataKey="diesel"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 3, fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
              />
            )}
            {(activeFuel === 'all' || activeFuel === 'lpg') && (
              <Line
                type="monotone"
                dataKey="lpg"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#f59e0b' }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom context notice */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <Info className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          Šie duomenys atspindi oficialius Europos Komisijos fiksuojamus vidurkius, apimančius visus Lietuvos mažmeninės prekybos tinklus su įskaičiuotais PVM ir akcizų mokesčiais.
        </span>
      </div>
    </div>
  );
}
