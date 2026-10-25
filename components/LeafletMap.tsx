'use client';

import React, { useEffect, useRef } from 'react';
import { FuelType, Station } from '@/lib/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { getBrandStyle } from '@/lib/utils';
import { Navigation, Loader2 } from 'lucide-react';

interface LeafletMapProps {
  stations: Station[];
  selectedFuel: FuelType;
  userCoords: { lat: number; lng: number } | null;
  onSelectStation: (stationId: string) => void;
  onLocateUser?: () => void;
  isLocating?: boolean;
}

export function LeafletMap({
  stations,
  selectedFuel,
  userCoords,
  onSelectStation,
  onLocateUser,
  isLocating = false
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // 1. Initialize Leaflet Map (Run once)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: Lithuania center (near Kėdainiai)
      const map = L.map(mapContainerRef.current, {
        center: [55.1694, 23.8813],
        zoom: 7,
        zoomControl: true
      });

      // Official OpenStreetMap free tiles (no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Create marker cluster group
      const clusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 45,
        spiderfyOnMaxZoom: true,
        disableClusteringAtZoom: 15,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          let cSize = 'small';
          let pxSize = 34;

          if (count > 20) {
            cSize = 'large';
            pxSize = 44;
          } else if (count > 8) {
            cSize = 'medium';
            pxSize = 38;
          }

          return L.divIcon({
            html: `<div style="
              width: ${pxSize}px;
              height: ${pxSize}px;
              border-radius: 9999px;
              background: linear-gradient(135deg, #10b981, #0d9488);
              color: white;
              font-weight: 800;
              font-size: ${count > 99 ? '11px' : '13px'};
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
              border: 2px solid white;
            ">${count}</div>`,
            className: `custom-cluster-icon custom-cluster-${cSize}`,
            iconSize: L.point(pxSize, pxSize)
          });
        }
      });

      map.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Update User Location Pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCoords) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
      } else {
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div style="position: relative; width: 24px; height: 24px;">
              <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: #3b82f6; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: absolute; inset: 2px; border-radius: 9999px; background-color: #2563eb; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([userCoords.lat, userCoords.lng], {
          icon: userIcon,
          zIndexOffset: 1000
        }).addTo(map);

        marker.bindPopup('<b>Jūsų dabartinė vieta</b>');
        userMarkerRef.current = marker;
      }

      // Smooth pan to user location
      map.setView([userCoords.lat, userCoords.lng], 12);
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userCoords]);

  // 3. Render Stations Markers with Dynamic Pricing
  useEffect(() => {
    const map = mapInstanceRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !clusterGroup) return;

    clusterGroup.clearLayers();

    // Calculate price extremes for gradient
    const validPrices = stations
      .map((s) => s.prices[selectedFuel]?.price)
      .filter((p): p is number => typeof p === 'number' && p > 0);

    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 1.5;
    const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 1.8;
    const priceRange = maxPrice - minPrice || 1;

    stations.forEach((station) => {
      const priceEntry = station.prices[selectedFuel];
      const price = priceEntry?.price;

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

      let priceText = '—';
      if (selectedFuel === 'ev') {
        if (price) priceText = `${price.toFixed(2)}€`;
        else if (station.evPowerKw) priceText = `${station.evPowerKw}kW`;
      } else {
        priceText = price ? `${price.toFixed(2)} €` : '—';
      }

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
            ${priceText}
          </div>
        `,
        iconSize: [52, 26],
        iconAnchor: [26, 13]
      });

      const marker = L.marker([station.lat, station.lng], { icon: customIcon });

      // Rich popup content with Navigation buttons (Idea 9)
      const popupHtml = `
        <div style="font-family: inherit; min-width: 200px; padding: 4px;">
          <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 2px;">
            ${station.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            ${station.address}, ${station.city}
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; margin-bottom: 8px;">
            ${
              selectedFuel === 'ev' || station.prices.ev
                ? `<div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                    <span>⚡ EV Krovimas:</span>
                    <strong>${station.prices.ev?.price ? station.prices.ev.price.toFixed(3) + ' €/kWh' : 'Prieinama'}</strong>
                  </div>
                  ${station.evPowerKw ? `<div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span>Galia:</span>
                    <strong>${station.evPowerKw} kW HPC</strong>
                  </div>` : ''}`
                : `<div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
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
                  </div>`
            }
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
            margin-bottom: 6px;
          ">
            Plačiau ir Grafikas →
          </button>

          <div style="display: flex; gap: 4px;">
            <a href="${station.googleMapsUrl}" target="_blank" style="flex: 1; text-align: center; background: #0f172a; color: #fff; font-size: 10px; padding: 4px; border-radius: 4px; text-decoration: none; font-weight: bold;">Maps</a>
            <a href="${station.wazeUrl}" target="_blank" style="flex: 1; text-align: center; background: #0284c7; color: #fff; font-size: 10px; padding: 4px; border-radius: 4px; text-decoration: none; font-weight: bold;">Waze</a>
            <a href="${station.appleMapsUrl || `https://maps.apple.com/?q=${encodeURIComponent(station.name + ' ' + station.address)}&ll=${station.lat},${station.lng}`}" target="_blank" style="flex: 1; text-align: center; background: #334155; color: #fff; font-size: 10px; padding: 4px; border-radius: 4px; text-decoration: none; font-weight: bold;">Apple</a>
          </div>
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

      {/* Floating GPS Button in Map Corner (Idea 9) */}
      {onLocateUser && (
        <button
          onClick={onLocateUser}
          disabled={isLocating}
          className="absolute top-4 right-4 z-[400] p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-bold"
          title="Centruoti į mano vietą"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          ) : (
            <Navigation className="w-4 h-4 text-emerald-500" />
          )}
          <span className="hidden sm:inline">Mano vieta</span>
        </button>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[400] p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg text-xs font-semibold space-y-1.5">
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
