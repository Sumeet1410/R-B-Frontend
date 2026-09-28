import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export const AssetMap = ({ assets = [], onSelectAsset, height = '500px' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const getStageColor = (stage) => {
    switch (stage) {
      case 'active':
        return '#10b981'; // emerald
      case 'maintenance':
        return '#f43f5e'; // rose
      case 'construction':
        return '#f59e0b'; // amber
      case 'planning':
        return '#8b5cf6'; // purple
      case 'decommissioned':
      default:
        return '#64748b'; // slate
    }
  };

  // Initialize map once on mount
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default center on Gujarat (lat: 22.85, lng: 71.85)
    const map = L.map(mapRef.current, {
      center: [22.85, 71.85],
      zoom: 7,
      zoomControl: true
    });

    // High-performance, keyless, watermark-free basemaps
    const darkBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri, DeLorme, NAVTEQ',
      maxZoom: 16
    });

    const darkLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16
    });

    const darkGroup = L.layerGroup([darkBase, darkLabels]);

    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &mdash; DigitalGlobe, GeoEye',
      maxZoom: 18
    });

    const osmStreet = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    });

    // Add default dark canvas
    darkGroup.addTo(map);

    // Basemap switcher
    const baseMaps = {
      'Dark Canvas': darkGroup,
      'Satellite View': satellite,
      'Streets (OSM)': osmStreet
    };

    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers whenever assets change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    const bounds = [];

    assets.forEach((asset) => {
      if (asset.coordinates?.lat && asset.coordinates?.lng) {
        const color = getStageColor(asset.currentStage);

        // Custom circle marker
        const marker = L.circleMarker([asset.coordinates.lat, asset.coordinates.lng], {
          radius: 9,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.9
        });

        const popupContent = document.createElement('div');
        popupContent.style.fontFamily = 'Plus Jakarta Sans, sans-serif';
        popupContent.style.padding = '4px';
        popupContent.innerHTML = `
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #f8fafc;">${asset.name}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
            ID: <strong style="color: #38bdf8;">${asset.assetId}</strong> • ${asset.district}
          </div>
          <div style="display: flex; gap: 6px; margin-bottom: 10px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; background: ${color}25; color: ${color}; padding: 2px 8px; border-radius: 99px; border: 1px solid ${color}60;">
              ${asset.currentStage}
            </span>
            <span style="font-size: 10px; background: rgba(255,255,255,0.1); color: #cbd5e1; padding: 2px 8px; border-radius: 99px;">
              ${asset.type}
            </span>
          </div>
          <button id="btn-view-${asset._id}" style="width: 100%; padding: 6px; font-size: 11px; font-weight: 600; background: #0284c7; color: #fff; border: none; border-radius: 6px; cursor: pointer;">
            View Details
          </button>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-view-${asset._id}`);
          if (btn && onSelectAsset) {
            btn.onclick = () => onSelectAsset(asset);
          }
        });

        markersLayer.addLayer(marker);
        bounds.push([asset.coordinates.lat, asset.coordinates.lng]);
      }
    });

    if (bounds.length > 0 && map) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [assets, onSelectAsset]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Map Legend */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          padding: '10px 14px',
          zIndex: 1000,
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          fontSize: '0.75rem',
          background: 'rgba(15, 23, 42, 0.85)'
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6ee7b7' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Active
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fda4af' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} /> Maintenance
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fcd34d' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /> Construction
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#c4b5fd' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} /> Planning
        </span>
      </div>
    </div>
  );
};
