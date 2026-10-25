'use client';

import React from 'react';
import { SourceStatus } from '@/lib/types';
import { CheckCircle2, AlertTriangle, XCircle, Clock, Zap, ShieldCheck, X } from 'lucide-react';
import { formatRelativeTimeLt } from '@/lib/utils';

interface SourceStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  statuses: SourceStatus[];
  sourcesOnlineCount: number;
  totalSourcesCount: number;
}

export function SourceStatusModal({
  isOpen,
  onClose,
  statuses,
  sourcesOnlineCount,
  totalSourcesCount
}: SourceStatusModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Duomenų Šaltinių Būsena
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Agreguojame 5 nepriklausomus šaltinius realiu laiku
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Veikia {sourcesOnlineCount} iš {totalSourcesCount} duomenų šaltinių
              </span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
              Agregacija Aktyvi
            </span>
          </div>

          <div className="space-y-3">
            {statuses.map((s) => {
              const isOnline = s.status === 'online';
              const isDegraded = s.status === 'degraded';
              const isDisabled = s.status === 'disabled';

              return (
                <div
                  key={s.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isOnline && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        {isDegraded && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                        {isDisabled && <XCircle className="w-5 h-5 text-slate-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                            {s.name}
                          </h3>
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                              isOnline
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : isDegraded
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isOnline ? 'Prisijungta' : isDegraded ? 'Sulėtėjęs / Atsarginis' : 'Neaktyvuotas'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {s.description}
                        </p>
                      </div>
                    </div>

                    {s.latencyMs !== undefined && (
                      <div className="flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {s.latencyMs} ms
                      </div>
                    )}
                  </div>

                  {s.errorMessage && (
                    <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                      ℹ️ {s.errorMessage}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Tikrinta: {formatRelativeTimeLt(s.lastChecked)}
                    </span>
                    {s.stationsCount > 0 && (
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {s.stationsCount} degalinės
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-xs text-slate-600 dark:text-slate-300">
            <strong>Pastaba:</strong> Jei kuris nors išorinis šaltinis patiria trikdžius ar taiko ribojimus, sistema automatiškai pereina prie kryžminio sutikrinimo su Europos Komisijos naftos biuleteniu ir vietinėmis duomenų bazėmis. Nė viena užklausa nenutrūksta.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 rounded-xl transition-colors"
          >
            Uždaryti
          </button>
        </div>
      </div>
    </div>
  );
}
