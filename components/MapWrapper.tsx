'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { FuelType, Station } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const DynamicLeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      <span className="text-xs font-semibold text-slate-500">Kraunamas interaktyvus Lietuvos žemėlapis...</span>
    </div>
  )
});

interface MapWrapperProps {
  stations: Station[];
  selectedFuel: FuelType;
  userCoords: { lat: number; lng: number } | null;
  onSelectStation: (stationId: string) => void;
}

export function MapWrapper(props: MapWrapperProps) {
  return <DynamicLeafletMap {...props} />;
}
