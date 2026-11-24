import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';

export default function LeafletCivicMap({ points = [], center = [12.9716, 77.5946], zoom = 12 }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep instance or destroy on unmount
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (points.length === 0) return;

    const bounds = [];

    points.forEach((p) => {
      if (!p.latitude || !p.longitude) return;

      bounds.push([p.latitude, p.longitude]);

      // Priority color mapping
      let markerColor = '#6366f1'; // Default indigo
      if (p.priority === 'CRITICAL') markerColor = '#e11d48'; // Rose
      else if (p.priority === 'HIGH') markerColor = '#ea580c'; // Orange
      else if (p.priority === 'MEDIUM') markerColor = '#d97706'; // Amber

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      const marker = L.marker([p.latitude, p.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: Inter, sans-serif; min-width: 180px; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px;">
              ${p.report_id}
            </span>
            <span style="font-size: 10px; font-weight: 700; color: ${markerColor};">
              ${p.priority}
            </span>
          </div>
          <p style="font-weight: 700; font-size: 13px; margin: 0 0 4px 0; color: #0f172a;">
            ${p.title}
          </p>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">
            ${p.category} • ${p.locality || p.address || 'Metro Area'}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 4px;">
            <span style="font-size: 10px; font-weight: 600; color: #475569;">
              Status: ${p.status}
            </span>
            <a href="/issues/${p.id}" style="font-size: 11px; font-weight: 700; color: #4f46e5; text-decoration: none;">
              View &rarr;
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersLayerRef.current.addLayer(marker);
    });

    if (bounds.length > 0 && mapInstanceRef.current) {
      try {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch (e) {}
    }
  }, [points]);

  return (
    <div className="w-full h-full min-h-[360px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative">
      <div ref={mapContainerRef} className="w-full h-full min-h-[360px] z-10" />
      {/* Legend overlay */}
      <div className="absolute bottom-3 right-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-md text-[11px] space-y-1">
        <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Priority</p>
        <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> <span>Critical</span></div>
        <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span> <span>High</span></div>
        <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> <span>Medium</span></div>
        <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> <span>Low</span></div>
      </div>
    </div>
  );
}

