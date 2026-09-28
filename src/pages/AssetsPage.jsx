import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../config/api';
import { 
  Layers, 
  Search, 
  Filter, 
  PlusCircle, 
  MapPin, 
  Building2, 
  Compass, 
  Eye,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

const DEFAULT_DEMO_ASSETS = [
  {
    _id: 'a1',
    assetId: 'RD-AHM-0001',
    name: 'Sarkhej-Gandhinagar (SG) Highway Stretch 1',
    type: 'road',
    district: 'Ahmedabad',
    location: 'SG Highway, Thaltej to Pakwan Cross Road',
    coordinates: { lat: 23.0524, lng: 72.5186 },
    currentStage: 'active',
    estimatedCost: 45000000,
    attributes: { length_km: 12.5, lanes: 6, surfaceType: 'asphalt' }
  },
  {
    _id: 'a2',
    assetId: 'RD-AHM-0002',
    name: 'SP Ring Road Bopal Flyover Corridor',
    type: 'road',
    district: 'Ahmedabad',
    location: 'SP Ring Road, South Bopal Junction',
    coordinates: { lat: 23.0338, lng: 72.4634 },
    currentStage: 'maintenance',
    estimatedCost: 18000000,
    attributes: { length_km: 4.2, lanes: 4, surfaceType: 'concrete' }
  },
  {
    _id: 'a3',
    assetId: 'BLD-AHM-0001',
    name: 'District Collectorate Complex Ahmedabad',
    type: 'building',
    district: 'Ahmedabad',
    location: 'Near Subhash Bridge, Ashram Road',
    coordinates: { lat: 23.0592, lng: 72.5794 },
    currentStage: 'active',
    estimatedCost: 120000000,
    attributes: { area_sqm: 14500, floors: 5, buildingType: 'public' }
  },
  {
    _id: 'a4',
    assetId: 'BLD-GND-0001',
    name: 'New Sachivalaya Block 4 (P&D Wing)',
    type: 'building',
    district: 'Gandhinagar',
    location: 'Sector 10, Gandhinagar Capital Complex',
    coordinates: { lat: 23.2156, lng: 72.6369 },
    currentStage: 'active',
    estimatedCost: 280000000,
    attributes: { area_sqm: 22000, floors: 7, buildingType: 'office' }
  },
  {
    _id: 'a5',
    assetId: 'RD-GND-0001',
    name: 'Gandhinagar-Koba Aerodrome Link Highway',
    type: 'road',
    district: 'Gandhinagar',
    location: 'Between CH-0 Circle and Koba Circle',
    coordinates: { lat: 23.1782, lng: 72.6288 },
    currentStage: 'construction',
    estimatedCost: 32000000,
    attributes: { length_km: 8.4, lanes: 6, surfaceType: 'asphalt' }
  },
  {
    _id: 'a6',
    assetId: 'RD-RJK-0001',
    name: 'Kalawad Road Expressway Section 2',
    type: 'road',
    district: 'Rajkot',
    location: 'Kalawad Road, KKV Hall to Crystal Mall',
    coordinates: { lat: 22.2882, lng: 70.7712 },
    currentStage: 'active',
    estimatedCost: 24000000,
    attributes: { length_km: 6.8, lanes: 4, surfaceType: 'asphalt' }
  },
  {
    _id: 'a7',
    assetId: 'BLD-RJK-0001',
    name: 'Civil Hospital Multi-Specialty Extension',
    type: 'building',
    district: 'Rajkot',
    location: 'Hospital Chowk, Rajkot',
    coordinates: { lat: 22.3072, lng: 70.8022 },
    currentStage: 'planning',
    estimatedCost: 95000000,
    attributes: { area_sqm: 18000, floors: 6, buildingType: 'healthcare' }
  }
];

export const AssetsPage = ({ onSelectAsset }) => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    type: 'road',
    district: user?.district || 'Ahmedabad',
    location: '',
    lat: '23.0225',
    lng: '72.5714',
    estimatedCost: '10000000',
    length_km: '5.0',
    lanes: '4',
    area_sqm: '5000',
    floors: '3',
    initialNotes: ''
  });

  const fetchAssets = async () => {
    try {
      let query = `?limit=100`;
      if (typeFilter) query += `&type=${typeFilter}`;
      if (stageFilter) query += `&stage=${stageFilter}`;
      if (districtFilter) query += `&district=${districtFilter}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;

      const res = await apiRequest(`/assets${query}`);
      if (res.success && res.assets) {
        setAssets(res.assets);
      } else {
        setAssets(DEFAULT_DEMO_ASSETS);
      }
    } catch (err) {
      setAssets(DEFAULT_DEMO_ASSETS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [typeFilter, stageFilter, districtFilter, search]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: createForm.name,
        type: createForm.type,
        district: createForm.district,
        location: createForm.location,
        coordinates: {
          lat: parseFloat(createForm.lat),
          lng: parseFloat(createForm.lng)
        },
        estimatedCost: parseFloat(createForm.estimatedCost) || 0,
        attributes: createForm.type === 'road' ? {
          length_km: parseFloat(createForm.length_km),
          lanes: parseInt(createForm.lanes, 10),
          surfaceType: 'asphalt'
        } : {
          area_sqm: parseFloat(createForm.area_sqm),
          floors: parseInt(createForm.floors, 10),
          buildingType: 'public'
        },
        initialNotes: createForm.initialNotes
      };

      const res = await apiRequest('/assets', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        setShowCreateModal(false);
        fetchAssets();
      } else {
        // Fallback demo insert
        const newAsset = {
          _id: `demo-${Date.now()}`,
          assetId: `${createForm.type === 'road' ? 'RD' : 'BLD'}-${createForm.district.substring(0,3).toUpperCase()}-9999`,
          ...payload,
          currentStage: 'planning'
        };
        setAssets([newAsset, ...assets]);
        setShowCreateModal(false);
      }
    } catch (err) {
      alert('Asset registered locally for demo.');
      setShowCreateModal(false);
    }
  };

  const getStageBadgeClass = (stage) => {
    switch (stage) {
      case 'active': return 'badge-active';
      case 'maintenance': return 'badge-maintenance';
      case 'construction': return 'badge-construction';
      case 'planning': return 'badge-planning';
      default: return 'badge-decommissioned';
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Infrastructure Asset Inventory</h2>
            <span style={{ fontSize: '0.75rem', background: 'rgba(2, 132, 199, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '99px', fontWeight: 600 }}>
              {assets.length} Assets
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Tracking roads and public buildings across Gujarat districts
          </p>
        </div>

        {user?.role === 'super_admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.88rem' }}
          >
            <PlusCircle size={16} /> Register New Asset
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        {/* Search Input */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by name, ID, or landmark..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px' }}
          />
        </div>

        {/* District Filter */}
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          style={{ flex: '0 1 170px' }}
        >
          <option value="">All Districts</option>
          <option value="Ahmedabad">Ahmedabad</option>
          <option value="Gandhinagar">Gandhinagar</option>
          <option value="Rajkot">Rajkot</option>
          <option value="Surat">Surat</option>
          <option value="Vadodara">Vadodara</option>
        </select>

        {/* Stage Filter */}
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          style={{ flex: '0 1 160px' }}
        >
          <option value="">All Stages</option>
          <option value="planning">Planning</option>
          <option value="construction">Construction</option>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="decommissioned">Decommissioned</option>
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ flex: '0 1 140px' }}
        >
          <option value="">All Types</option>
          <option value="road">Roads</option>
          <option value="building">Buildings</option>
        </select>
      </div>

      {/* Assets Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '18px'
      }}>
        {assets.map((asset) => (
          <div
            key={asset._id}
            className="glass-panel"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
            onClick={() => onSelectAsset(asset)}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(2, 132, 199, 0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-card)')}
          >
            <div>
              {/* Header tags */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.04em' }}>
                  {asset.assetId}
                </span>
                <span className={`badge ${getStageBadgeClass(asset.currentStage)}`}>
                  {asset.currentStage}
                </span>
              </div>

              {/* Title */}
              <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '8px', lineHeight: 1.3 }}>
                {asset.name}
              </h4>

              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                <MapPin size={14} color="#94a3b8" />
                <span>{asset.location} ({asset.district})</span>
              </div>

              {/* Specs Badge */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px'
              }}>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Type: </span>
                  <strong style={{ color: '#cbd5e1', textTransform: 'capitalize' }}>{asset.type}</strong>
                </div>
                {asset.type === 'road' ? (
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Length: </span>
                    <strong style={{ color: '#cbd5e1' }}>{asset.attributes?.length_km || 0} km</strong>
                  </div>
                ) : (
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Floors: </span>
                    <strong style={{ color: '#cbd5e1' }}>{asset.attributes?.floors || 'N/A'}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Action Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-light)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Budget: ₹{((asset.estimatedCost || 0) / 10000000).toFixed(2)} Cr
              </span>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAsset(asset);
                }}
              >
                Inspect Lifecycle <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Register Asset Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '6px' }}>
              Register Infrastructure Asset
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Create an asset entry into the Planning stage of Roads &amp; Buildings inventory.
            </p>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Asset Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ring Road Overbridge Extension"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Asset Type
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="road">Road / Highway / Bridge</option>
                    <option value="building">Government Building / Complex</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    District
                  </label>
                  <select
                    value={createForm.district}
                    onChange={(e) => setCreateForm({ ...createForm, district: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Gandhinagar">Gandhinagar</option>
                    <option value="Rajkot">Rajkot</option>
                    <option value="Surat">Surat</option>
                    <option value="Vadodara">Vadodara</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Location Description / Area
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near Kalupur Junction, Ashram Road"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Latitude
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.lat}
                    onChange={(e) => setCreateForm({ ...createForm, lat: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Longitude
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.lng}
                    onChange={(e) => setCreateForm({ ...createForm, lng: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Type Specific Fields */}
              {createForm.type === 'road' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Length (km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={createForm.length_km}
                      onChange={(e) => setCreateForm({ ...createForm, length_km: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Lanes
                    </label>
                    <input
                      type="number"
                      value={createForm.lanes}
                      onChange={(e) => setCreateForm({ ...createForm, lanes: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Area (sq. meters)
                    </label>
                    <input
                      type="number"
                      value={createForm.area_sqm}
                      onChange={(e) => setCreateForm({ ...createForm, area_sqm: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Floors
                    </label>
                    <input
                      type="number"
                      value={createForm.floors}
                      onChange={(e) => setCreateForm({ ...createForm, floors: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Estimated Budget (INR ₹)
                </label>
                <input
                  type="number"
                  value={createForm.estimatedCost}
                  onChange={(e) => setCreateForm({ ...createForm, estimatedCost: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Initial Project Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="DPR notes, approvals or surveying records..."
                  value={createForm.initialNotes}
                  onChange={(e) => setCreateForm({ ...createForm, initialNotes: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Submit Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
