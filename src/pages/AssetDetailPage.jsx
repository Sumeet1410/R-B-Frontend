import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../config/api';
import { TimelineView } from '../components/TimelineView';
import { 
  ArrowLeft, 
  MapPin, 
  Layers, 
  Calendar, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle, 
  ClipboardCheck, 
  FileText,
  Send,
  Wrench,
  Clock,
  ArrowRight
} from 'lucide-react';

const STAGES = ['planning', 'construction', 'active', 'maintenance', 'decommissioned'];

export const AssetDetailPage = ({ asset: initialAsset, onBack }) => {
  const { user } = useAuth();
  const [asset, setAsset] = useState(initialAsset);
  const [activeTab, setActiveTab] = useState('timeline');
  const [events, setEvents] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stage transition modal
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedNewStage, setSelectedNewStage] = useState('construction');
  const [stageNotes, setStageNotes] = useState('');

  const fetchAssetDetails = async () => {
    try {
      const [assetRes, timelineRes, inspRes, compRes] = await Promise.allSettled([
        apiRequest(`/assets/${asset._id}`),
        apiRequest(`/timeline/${asset._id}`),
        apiRequest(`/inspections?assetId=${asset._id}`),
        apiRequest(`/complaints?assetId=${asset._id}`)
      ]);

      if (assetRes.status === 'fulfilled' && assetRes.value?.asset) {
        setAsset(assetRes.value.asset);
      }
      if (timelineRes.status === 'fulfilled' && timelineRes.value?.events) {
        setEvents(timelineRes.value.events);
      }
      if (inspRes.status === 'fulfilled' && inspRes.value?.inspections) {
        setInspections(inspRes.value.inspections);
      }
      if (compRes.status === 'fulfilled' && compRes.value?.complaints) {
        setComplaints(compRes.value.complaints);
      }
    } catch (err) {
      console.warn('Error fetching asset sub-resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetDetails();
  }, [asset._id]);

  const handleStageChange = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest(`/assets/${asset._id}/stage`, {
        method: 'PUT',
        body: JSON.stringify({
          newStage: selectedNewStage,
          notes: stageNotes
        })
      });

      if (res.success) {
        setAsset(res.asset);
        setShowStageModal(false);
        fetchAssetDetails();
      } else {
        // Local demo update
        setAsset({ ...asset, currentStage: selectedNewStage });
        setShowStageModal(false);
      }
    } catch (err) {
      setAsset({ ...asset, currentStage: selectedNewStage });
      setShowStageModal(false);
    }
  };

  const getStageStepIndex = (current) => {
    return STAGES.indexOf(current);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          <ArrowLeft size={14} /> Back to Assets
        </button>
      </div>

      {/* Asset Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 132, 199, 0.12) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em' }}>
              {asset.assetId}
            </span>
            <span className={`badge badge-${asset.currentStage}`}>
              {asset.currentStage}
            </span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', padding: '2px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>
              {asset.type}
            </span>
          </div>

          <h2 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '6px' }}>
            {asset.name}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <MapPin size={15} color="#38bdf8" />
            <span>{asset.location}, {asset.district}</span>
            {asset.coordinates && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                ({asset.coordinates.lat.toFixed(4)}, {asset.coordinates.lng.toFixed(4)})
              </span>
            )}
          </div>
        </div>

        {/* Stage Change Action */}
        {(user?.role === 'super_admin' || user?.role === 'regional_officer') && (
          <button
            onClick={() => setShowStageModal(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.88rem' }}
          >
            <Layers size={16} /> Advance Lifecycle Stage
          </button>
        )}
      </div>

      {/* Stage Progression Stepper */}
      <div className="glass-panel" style={{ padding: '20px 28px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.06em' }}>
          Lifecycle Stage Progression
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {STAGES.map((stg, idx) => {
            const currentIdx = getStageStepIndex(asset.currentStage);
            const isPassed = idx <= currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div key={stg} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isCurrent ? '#0284c7' : isPassed ? '#10b981' : 'rgba(255,255,255,0.06)',
                  border: isCurrent ? '3px solid rgba(56, 189, 248, 0.6)' : isPassed ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isPassed ? '#fff' : 'var(--text-dim)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  boxShadow: isCurrent ? '0 0 15px rgba(2, 132, 199, 0.6)' : 'none'
                }}>
                  {idx + 1}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? '#38bdf8' : isPassed ? '#cbd5e1' : 'var(--text-dim)',
                  marginTop: '6px',
                  textTransform: 'capitalize'
                }}>
                  {stg}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Specifications & Overview Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px'
      }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Estimated Budget</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
            ₹{((asset.estimatedCost || 0) / 10000000).toFixed(2)} Cr
          </div>
        </div>

        {asset.type === 'road' ? (
          <>
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Road Stretch Length</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
                {asset.attributes?.length_km || 0} km
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Lanes &amp; Width</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#cbd5e1', marginTop: '4px' }}>
                {asset.attributes?.lanes || 4} Lanes ({asset.attributes?.width_m || 24}m)
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Pavement Surface</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fcd34d', marginTop: '4px', textTransform: 'capitalize' }}>
                {asset.attributes?.surfaceType || 'Asphalt'}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Built-up Area</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
                {asset.attributes?.area_sqm || 0} sq.m
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Floors &amp; Structure</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#cbd5e1', marginTop: '4px' }}>
                {asset.attributes?.floors || 1} Storeys
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Occupancy Class</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fcd34d', marginTop: '4px', textTransform: 'capitalize' }}>
                {asset.attributes?.buildingType || 'Public Office'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs Menu */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-light)',
        gap: '24px'
      }}>
        <button
          onClick={() => setActiveTab('timeline')}
          style={{
            padding: '12px 4px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'timeline' ? '2px solid #0284c7' : '2px solid transparent',
            color: activeTab === 'timeline' ? '#fff' : 'var(--text-dim)',
            fontWeight: 600,
            fontSize: '0.92rem',
            cursor: 'pointer'
          }}
        >
          Lifecycle Timeline ({events.length})
        </button>

        {user?.role !== 'super_admin' && (
          <>
            <button
              onClick={() => setActiveTab('inspections')}
              style={{
                padding: '12px 4px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'inspections' ? '2px solid #0284c7' : '2px solid transparent',
                color: activeTab === 'inspections' ? '#fff' : 'var(--text-dim)',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              Inspections ({inspections.length})
            </button>

            <button
              onClick={() => setActiveTab('complaints')}
              style={{
                padding: '12px 4px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'complaints' ? '2px solid #0284c7' : '2px solid transparent',
                color: activeTab === 'complaints' ? '#fff' : 'var(--text-dim)',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              Citizen Complaints ({complaints.length})
            </button>
          </>
        )}
      </div>

      {/* Tab Contents */}
      {activeTab === 'timeline' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '8px' }}>
            Chronological Audit History
          </h3>
          <TimelineView events={events} />
        </div>
      )}

      {activeTab === 'inspections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {inspections.length === 0 ? (
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>
              No inspection reports submitted for this asset yet.
            </div>
          ) : (
            inspections.map((insp) => (
              <div key={insp._id} className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>
                      Condition Rating: {insp.conditionRating}/5 ★
                    </span>
                    <span className="badge badge-active">{insp.status}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {new Date(insp.inspectionDate).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {insp.conditionNotes || 'Standard maintenance survey completed.'}
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                  Recommendation: <strong style={{ color: '#cbd5e1' }}>{insp.recommendation}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'complaints' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {complaints.length === 0 ? (
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>
              No citizen grievances registered against this asset.
            </div>
          ) : (
            complaints.map((c) => (
              <div key={c._id} className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
                    {c.title}
                  </span>
                  <span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {c.description}
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                  Location: <strong style={{ color: '#93c5fd' }}>{c.specificLocation}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Stage Change Modal */}
      {showStageModal && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '6px' }}>
              Transition Asset Lifecycle Stage
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Current Stage: <strong style={{ color: '#38bdf8', textTransform: 'capitalize' }}>{asset.currentStage}</strong>
            </p>

            <form onSubmit={handleStageChange} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Select Next Stage
                </label>
                <select
                  value={selectedNewStage}
                  onChange={(e) => setSelectedNewStage(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="planning">Planning</option>
                  <option value="construction">Construction</option>
                  <option value="active">Active (Operational)</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="decommissioned">Decommissioned</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Official Reason / Transition Notes
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Work completed by contractor; certified for public use..."
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowStageModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Confirm Stage Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
