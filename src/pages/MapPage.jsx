import React, { useState, useEffect } from 'react';
import { apiRequest } from '../config/api';
import { AssetMap } from '../components/AssetMap';
import { MapPin, Filter, Layers, ChevronRight } from 'lucide-react';

const DEFAULT_MAP_ASSETS = [
  {
    _id: 'a1',
    assetId: 'RD-AHM-0001',
    name: 'Sarkhej-Gandhinagar (SG) Highway Stretch 1',
    type: 'road',
    district: 'Ahmedabad',
    location: 'SG Highway, Thaltej to Pakwan Cross Road',
    coordinates: { lat: 23.0524, lng: 72.5186 },
    currentStage: 'active'
  },
  {
    _id: 'a2',
    assetId: 'RD-AHM-0002',
    name: 'SP Ring Road Bopal Flyover Corridor',
    type: 'road',
    district: 'Ahmedabad',
    location: 'SP Ring Road, South Bopal Junction',
    coordinates: { lat: 23.0338, lng: 72.4634 },
    currentStage: 'maintenance'
  },
  {
    _id: 'a3',
    assetId: 'BLD-AHM-0001',
    name: 'District Collectorate Complex Ahmedabad',
    type: 'building',
    district: 'Ahmedabad',
    location: 'Near Subhash Bridge, Ashram Road',
    coordinates: { lat: 23.0592, lng: 72.5794 },
    currentStage: 'active'
  },
  {
    _id: 'a4',
    assetId: 'BLD-GND-0001',
    name: 'New Sachivalaya Block 4 (P&D Wing)',
    type: 'building',
    district: 'Gandhinagar',
    location: 'Sector 10, Gandhinagar Capital Complex',
    coordinates: { lat: 23.2156, lng: 72.6369 },
    currentStage: 'active'
  },
  {
    _id: 'a5',
    assetId: 'RD-GND-0001',
    name: 'Gandhinagar-Koba Aerodrome Link Highway',
    type: 'road',
    district: 'Gandhinagar',
    location: 'Between CH-0 Circle and Koba Circle',
    coordinates: { lat: 23.1782, lng: 72.6288 },
    currentStage: 'construction'
  },
  {
    _id: 'a6',
    assetId: 'RD-RJK-0001',
    name: 'Kalawad Road Expressway Section 2',
    type: 'road',
    district: 'Rajkot',
    location: 'Kalawad Road, KKV Hall to Crystal Mall',
    coordinates: { lat: 22.2882, lng: 70.7712 },
    currentStage: 'active'
  },
  {
    _id: 'a7',
    assetId: 'BLD-RJK-0001',
    name: 'Civil Hospital Multi-Specialty Extension',
    type: 'building',
    district: 'Rajkot',
    location: 'Hospital Chowk, Rajkot',
    coordinates: { lat: 22.3072, lng: 70.8022 },
    currentStage: 'planning'
  }
];

export const MapPage = ({ onSelectAsset }) => {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [stageFilter, setStageFilter] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await apiRequest('/assets?limit=100');
        if (res.success && res.assets?.length > 0) {
          setAssets(res.assets);
        } else {
          setAssets(DEFAULT_MAP_ASSETS);
        }
      } catch (err) {
        setAssets(DEFAULT_MAP_ASSETS);
      }
    };

    fetchAssets();
  }, []);

  const filteredAssets = stageFilter
    ? assets.filter((a) => a.currentStage === stageFilter)
    : assets;

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 100px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Geospatial Infrastructure Map</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Gujarat physical infrastructure locations with live lifecycle status markers
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          >
            <option value="">All Lifecycle Stages</option>
            <option value="active">Active Only</option>
            <option value="maintenance">Under Maintenance</option>
            <option value="construction">Under Construction</option>
            <option value="planning">In Planning</option>
          </select>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <AssetMap
          assets={filteredAssets}
          onSelectAsset={(asset) => {
            setSelectedAsset(asset);
            if (onSelectAsset) onSelectAsset(asset);
          }}
          height="100%"
        />
      </div>
    </div>
  );
};
