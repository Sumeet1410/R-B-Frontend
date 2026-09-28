import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../config/api';
import { StatCard } from '../components/StatCard';
import { AssetMap } from '../components/AssetMap';
import { TimelineView } from '../components/TimelineView';
import { 
  Building2, 
  Layers, 
  AlertTriangle, 
  Hammer, 
  MapPin, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  Clock,
  ClipboardCheck
} from 'lucide-react';

export const DashboardPage = ({ onNavigate, onSelectAsset }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [assets, setAssets] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback demo data if backend DB is not yet populated
  const defaultAssets = [
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
    }
  ];

  const defaultEvents = [
    {
      _id: 'e1',
      title: 'Complaint Registered: Pothole Hazard',
      description: 'Citizen filed urgent pothole complaint near Thaltej underpass exit.',
      eventType: 'complaint_filed',
      performedBy: { name: 'Rajesh Solanki' },
      performedByRole: 'citizen',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      _id: 'e2',
      title: 'Expansion Joint Repair Task Assigned',
      description: 'Assigned to Gujarat Highway Builders Ltd. with budget ₹8.5 Lakh.',
      eventType: 'task_assigned',
      performedBy: { name: 'Anjali Desai (EE)' },
      performedByRole: 'regional_officer',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      _id: 'e3',
      title: 'Inspection Completed (Rating: 4/5)',
      description: 'Field inspection completed for SG Highway Stretch 1 with minor shoulder recommendations.',
      eventType: 'inspection',
      performedBy: { name: 'Dhaval Patel (AE)' },
      performedByRole: 'field_engineer',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, assetsRes, eventsRes] = await Promise.allSettled([
          apiRequest('/reports/summary'),
          apiRequest('/assets?limit=20'),
          apiRequest('/timeline?limit=6')
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value?.summary) {
          setStats(statsRes.value.summary);
        } else {
          // Demo fallback
          setStats({
            totalAssets: 7,
            roadAssets: 4,
            buildingAssets: 3,
            complaints: { total: 3, pending: 1, resolved: 0 },
            activeTasks: 2,
            pendingInspections: 1
          });
        }

        if (assetsRes.status === 'fulfilled' && assetsRes.value?.assets?.length > 0) {
          setAssets(assetsRes.value.assets);
        } else {
          setAssets(defaultAssets);
        }

        if (eventsRes.status === 'fulfilled' && eventsRes.value?.events?.length > 0) {
          setRecentEvents(eventsRes.value.events);
        } else {
          setRecentEvents(defaultEvents);
        }
      } catch (err) {
        setAssets(defaultAssets);
        setRecentEvents(defaultEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              R&amp;B Executive Overview
            </span>
            {user?.district && (
              <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                District: {user.district}
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#fff', marginTop: '4px' }}>
            Welcome back, {user?.name || 'Officer'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Gujarat physical infrastructure lifecycle dashboard &amp; citizen grievance tracking system.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {user?.role === 'super_admin' ? (
            <>
              <button
                onClick={() => onNavigate('assets')}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <PlusCircle size={16} /> Register New Asset
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                View Analytics &amp; Reports <ArrowRight size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('complaints')}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                <AlertTriangle size={16} color="#fbbf24" /> Triage Complaints
              </button>
              <button
                onClick={() => onNavigate('inspections')}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <ClipboardCheck size={16} /> Order Inspection
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px'
      }}>
        <StatCard
          title={user?.role === 'super_admin' ? "Statewide Infrastructure Assets" : `${user?.district || 'District'} Assets`}
          value={stats?.totalAssets ?? 7}
          subtitle={`${stats?.roadAssets ?? 4} Roads • ${stats?.buildingAssets ?? 3} Buildings`}
          icon={Layers}
          color="#0284c7"
        />
        <StatCard
          title="Active & Operational"
          value={stats?.stages?.active ?? 4}
          subtitle="Monitored in real-time"
          icon={TrendingUp}
          color="#10b981"
        />
        {user?.role === 'super_admin' ? (
          <>
            <StatCard
              title="Road Infrastructure"
              value={stats?.roadAssets ?? 4}
              subtitle="Highways, bridges & corridors"
              icon={Layers}
              color="#f59e0b"
            />
            <StatCard
              title="Government Buildings"
              value={stats?.buildingAssets ?? 3}
              subtitle="Offices, complexes & healthcare"
              icon={Building2}
              color="#8b5cf6"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Citizen Grievances"
              value={stats?.complaints?.total ?? 3}
              subtitle={`${stats?.complaints?.pending ?? 1} Awaiting Triage / Investigation`}
              icon={AlertTriangle}
              color="#f59e0b"
            />
            <StatCard
              title="Works & Maintenance"
              value={stats?.activeTasks ?? 2}
              subtitle="Assigned to Contractors"
              icon={Hammer}
              color="#8b5cf6"
            />
          </>
        )}
      </div>

      {/* Map & Timeline Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '24px'
      }}>
        {/* Map View Panel */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>Geographic Infrastructure Map</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Point locations color-coded by lifecycle stage
              </p>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
            >
              Full Screen Map <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ flex: 1, minHeight: '380px' }}>
            <AssetMap assets={assets} onSelectAsset={onSelectAsset} height="380px" />
          </div>
        </div>

        {/* Recent Audit Timeline Feed */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>Recent Lifecycle Events</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Immutable audit trail across Gujarat assets
              </p>
            </div>
            <Clock size={18} color="var(--text-dim)" />
          </div>

          <div style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '6px' }}>
            <TimelineView events={recentEvents} />
          </div>
        </div>
      </div>
    </div>
  );
};
