'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { FuelType, Station } from '@/lib/types';
import { formatPrice, getBrandStyle } from '@/lib/utils';

interface LeafletMapProps {
  stations: Station[];
  selectedFuel: FuelType;
  userCoords: { lat: number; lng: number } | null;
  onSelectStation: (stationId: string) => void;
}

export default function LeafletMap({
  stations,
  selectedFuel,
  userCoords,
  onSelectStation
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map
    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = userCoords
        ? [userCoords.lat, userCoords.lng]
        : [55.1694, 23.8813]; // Lithuania center

      const initialZoom = userCoords ? 11 : 7.5;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true,
        attributionControl: false
      });

      // 100% Free OpenStreetMap official tiles (No API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Attribution control in bottom right
      L.control.attribution({ position: 'bottomright' }).addTo(map);

      const clusterGroup = (L as any).markerClusterGroup({
        maxClusterRadius: 45,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        chunkedLoading: true
      });
      clusterGroup.addTo(map);
      clusterLayerRef.current = clusterGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const clusterGroup = clusterLayerRef.current;
    if (!map || !clusterGroup) return;

    clusterGroup.clearLayers();

    // Determine price tiers (min, max) for color coding
    const validPrices = stations
      .map((s) => s.prices[selectedFuel]?.price)
      .filter((p): p is number => p !== undefined && p > 0);

    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 1.80;
    const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 2.25;
    const priceRange = maxPrice - minPrice || 0.1;

    // Add user marker if available
    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #3b82f6;
            border: 3px solid #ffffff;
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .bindTooltip('Jūsų vieta', { permanent: false, direction: 'top' })
        .addTo(map);
    }

    // Add gas station markers
    stations.forEach((station) => {
      const priceEntry = station.prices[selectedFuel];
      const price = priceEntry?.price;
      const brandStyle = getBrandStyle(station.brand);

      // Color coding: green (cheapest) -> amber -> red (expensive)
      let markerColor = '#10b981'; // emerald
      if (price) {
        const ratio = (price - minPrice) / priceRange;
        if (ratio < 0.3) {
          markerColor = '#10b981'; // Green
        } else if (ratio < 0.65) {
          markerColor = '#f59e0b'; // Amber
        } else {
          markerColor = '#ef4444'; // Red
        }
      }

      const priceText = price ? price.toFixed(2) : '—';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            padding: 3px 8px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            color: #ffffff;
            border: 2px solid #ffffff;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            white-space: nowrap;
          ">
            ${priceText} €
          </div>
        `,
        iconSize: [52, 26],
        iconAnchor: [26, 13]
      });

      const marker = L.marker([station.lat, station.lng], { icon: customIcon });

      // Rich popup content
      const popupHtml = `
        <div style="font-family: inherit; min-width: 190px; padding: 4px;">
          <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 2px;">
            ${station.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            ${station.address}, ${station.city}
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
              <span>95 Benzinas:</span>
              <strong>${station.prices.gasoline_95?.price?.toFixed(3) ?? '—'} €</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
              <span>Dyzelinas:</span>
              <strong>${station.prices.diesel?.price?.toFixed(3) ?? '—'} €</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span>LPG Dujos:</span>
              <strong>${station.prices.lpg?.price?.toFixed(3) ?? '—'} €</strong>
            </div>
          </div>
          <button id="btn-popup-${station.id}" style="
            width: 100%;
            background-color: #059669;
            color: #ffffff;
            font-weight: 700;
            font-size: 11px;
            padding: 6px 10px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
          ">
            Plačiau ir Grafikas →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-${station.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectStation(station.id);
          };
        }
      });

      marker.addTo(clusterGroup);
    });

    // Invalidate size to ensure proper tile rendering when view switches
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

  }, [stations, selectedFuel, userCoords, onSelectStation]);

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Free Map Indicator Badge */}
      <div className="absolute top-4 right-4 z-[500] px-3.5 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>100% Nemokamas OpenStreetMap • Be API raktų</span>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[500] p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg text-xs font-semibold space-y-1.5">
        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Kainų lygiai</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-700 dark:text-slate-300">Pigiausia zona</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-700 dark:text-slate-300">Vidutinė kaina</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-slate-700 dark:text-slate-300">Brangesnė zona</span>
        </div>
      </div>
    </div>
  );
}
