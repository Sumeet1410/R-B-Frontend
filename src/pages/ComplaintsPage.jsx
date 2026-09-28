import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../config/api';
import { 
  AlertTriangle, 
  PlusCircle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  MessageSquare, 
  ChevronRight,
  Filter,
  Check,
  Send,
  SearchCheck,
  ShieldAlert
} from 'lucide-react';

const CATEGORIES = [
  { id: 'pothole', label: 'Pothole & Surface Damage' },
  { id: 'road_damage', label: 'Structural Road Hazard' },
  { id: 'building_damage', label: 'Building Crack / Damage' },
  { id: 'waterlogging', label: 'Drainage & Waterlogging' },
  { id: 'safety_hazard', label: 'Safety / Guardrail Hazard' },
  { id: 'lighting', label: 'Streetlight / Electrical Failure' },
  { id: 'other', label: 'Other Infrastructure Issue' }
];

export const ComplaintsPage = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Investigation Trigger state (Req 2)
  const [showInvestigateModal, setShowInvestigateModal] = useState(false);
  const [investigateInstructions, setInvestigateInstructions] = useState('');

  // Triage state
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [triageStatus, setTriageStatus] = useState('work_started');
  const [triagePriority, setTriagePriority] = useState('high');
  const [triageRemark, setTriageRemark] = useState('');

  // File complaint form state
  const [fileForm, setFileForm] = useState({
    asset: '',
    title: '',
    description: '',
    category: 'pothole',
    specificLocation: ''
  });

  const fetchComplaints = async () => {
    try {
      const [compRes, assetsRes] = await Promise.allSettled([
        apiRequest('/complaints'),
        apiRequest('/assets?limit=50')
      ]);

      if (compRes.status === 'fulfilled' && compRes.value?.complaints) {
        setComplaints(compRes.value.complaints);
      } else {
        // Fallback demo data
        setComplaints([
          {
            _id: 'c1',
            title: 'Dangerous deep pothole near Thaltej Underpass exit',
            description: 'There is a severe pothole right where vehicles merge from the slip road onto SG Highway.',
            category: 'pothole',
            specificLocation: 'Northbound lane, 100m past Thaltej underpass exit',
            status: 'work_started',
            priority: 'high',
            asset: { name: 'Sarkhej-Gandhinagar (SG) Highway Stretch 1', district: 'Ahmedabad' },
            remarks: [
              { text: 'Investigation triggered by Regional Officer. Field engineer dispatched for survey.', at: new Date().toISOString() }
            ],
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: 'c2',
            title: 'Severe vibration on Bopal flyover ramp',
            description: 'The expansion joint on the south ramp has broken chunks of concrete exposed.',
            category: 'road_damage',
            specificLocation: 'Bopal flyover south ramp climb',
            status: 'work_started',
            priority: 'urgent',
            asset: { name: 'SP Ring Road Bopal Flyover Corridor', district: 'Ahmedabad' },
            remarks: [
              { text: 'Triage complete. Repair work awarded to contractor.', at: new Date().toISOString() }
            ],
            createdAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            _id: 'c3',
            title: 'Waterlogging during morning pipeline leakage',
            description: 'Municipal water line leakage has accumulated water, eroding the road edge.',
            category: 'waterlogging',
            specificLocation: 'Kalawad Road opposite KKV hall',
            status: 'registered',
            priority: 'medium',
            asset: { name: 'Kalawad Road Expressway Section 2', district: 'Rajkot' },
            remarks: [],
            createdAt: new Date().toISOString()
          }
        ]);
      }

      if (assetsRes.status === 'fulfilled' && assetsRes.value?.assets) {
        setAssets(assetsRes.value.assets);
        if (assetsRes.value.assets.length > 0 && !fileForm.asset) {
          setFileForm((prev) => ({ ...prev, asset: assetsRes.value.assets[0]._id }));
        }
      }
    } catch (err) {
      console.warn('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  // Requirement 1: Super Admin should not see complaints
  if (user?.role === 'super_admin') {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '560px', margin: '0 auto', padding: '36px' }}>
          <ShieldAlert size={44} color="#8b5cf6" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
            Administrative Oversight Role
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Per department governance rules, citizen grievance triage and resolution are delegated directly to district <strong>Regional Officers</strong> and on-ground <strong>Field Engineers</strong>.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '12px' }}>
            Super Administrators oversee statewide infrastructure assets and analytical reporting.
          </p>
        </div>
      </div>
    );
  }

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/complaints', {
        method: 'POST',
        body: JSON.stringify(fileForm)
      });

      if (res.success) {
        setShowFileModal(false);
        fetchComplaints();
      } else {
        const newComplaint = {
          _id: `c-local-${Date.now()}`,
          ...fileForm,
          status: 'registered',
          priority: 'medium',
          asset: assets.find((a) => a._id === fileForm.asset) || { name: 'Gujarat Road Stretch', district: 'Ahmedabad' },
          remarks: [],
          createdAt: new Date().toISOString()
        };
        setComplaints([newComplaint, ...complaints]);
        setShowFileModal(false);
      }
    } catch (err) {
      const newComplaint = {
        _id: `c-local-${Date.now()}`,
        ...fileForm,
        status: 'registered',
        priority: 'medium',
        asset: assets.find((a) => a._id === fileForm.asset) || { name: 'Gujarat Road Stretch', district: 'Ahmedabad' },
        remarks: [],
        createdAt: new Date().toISOString()
      };
      setComplaints([newComplaint, ...complaints]);
      setShowFileModal(false);
    }
  };

  // Requirement 2: Trigger investigation on customer complaint
  const handleTriggerInvestigation = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      const res = await apiRequest(`/complaints/${selectedComplaint._id}/investigate`, {
        method: 'POST',
        body: JSON.stringify({ orderInstructions: investigateInstructions })
      });

      if (res.success) {
        setShowInvestigateModal(false);
        fetchComplaints();
      } else {
        setComplaints(complaints.map((c) => {
          if (c._id === selectedComplaint._id) {
            return {
              ...c,
              status: 'work_started',
              linkedInspection: 'pending-order',
              remarks: [
                ...(c.remarks || []),
                { text: investigateInstructions || 'Investigation triggered by Regional Officer. Field engineer dispatched.', at: new Date().toISOString() }
              ]
            };
          }
          return c;
        }));
        setShowInvestigateModal(false);
      }
    } catch (err) {
      setComplaints(complaints.map((c) => {
        if (c._id === selectedComplaint._id) {
          return {
            ...c,
            status: 'work_started',
            linkedInspection: 'pending-order',
            remarks: [
              ...(c.remarks || []),
              { text: investigateInstructions || 'Investigation triggered by Regional Officer. Field engineer dispatched.', at: new Date().toISOString() }
            ]
          };
        }
        return c;
      }));
      setShowInvestigateModal(false);
    }
  };

  const handleTriageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      const res = await apiRequest(`/complaints/${selectedComplaint._id}/triage`, {
        method: 'PUT',
        body: JSON.stringify({
          status: triageStatus,
          priority: triagePriority,
          remarkText: triageRemark
        })
      });

      if (res.success) {
        setShowTriageModal(false);
        fetchComplaints();
      } else {
        setComplaints(complaints.map((c) => {
          if (c._id === selectedComplaint._id) {
            return {
              ...c,
              status: triageStatus,
              priority: triagePriority,
              remarks: [...(c.remarks || []), { text: triageRemark, at: new Date().toISOString() }]
            };
          }
          return c;
        }));
        setShowTriageModal(false);
      }
    } catch (err) {
      setShowTriageModal(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'registered':
        return <span className="badge badge-registered"><Clock size={12} /> Registered</span>;
      case 'work_started':
        return <span className="badge badge-work_started"><Wrench size={12} /> Work Started</span>;
      case 'resolved':
        return <span className="badge badge-resolved"><CheckCircle2 size={12} /> Resolved</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Citizen Grievance Redressal Portal</h2>
            <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '2px 8px', borderRadius: '99px', fontWeight: 600 }}>
              3-State Resolution Flow
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            File infrastructure reports, trigger investigations, and observe verified repairs.
          </p>
        </div>

        {user?.role === 'citizen' && (
          <button
            onClick={() => setShowFileModal(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.88rem' }}
          >
            <PlusCircle size={16} /> File New Complaint
          </button>
        )}
      </div>

      {/* Complaints Pipeline Stages Info */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24' }} />
          <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600 }}>1. Registered</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Citizen files report</span>
        </div>
        <div style={{ color: 'var(--text-dim)' }}>→</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }} />
          <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600 }}>2. Work Started</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Officer triggers investigation</span>
        </div>
        <div style={{ color: 'var(--text-dim)' }}>→</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }} />
          <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600 }}>3. Resolved</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Maintenance approved &amp; verified</span>
        </div>
      </div>

      {/* Citizen Grievance Overview & Tracking Stats */}
      {user?.role === 'citizen' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Total Lodged</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{complaints.length}</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <Wrench size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Work Started</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8' }}>
                {complaints.filter((c) => c.status === 'work_started').length}
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Resolved &amp; Verified</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399' }}>
                {complaints.filter((c) => c.status === 'resolved').length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '420px' }}>
          <input
            type="text"
            placeholder="Search by Ticket ID, Landmark, Title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '14px', fontSize: '0.86rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, marginRight: '4px' }}>Filter:</span>
          {['all', 'registered', 'work_started', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={statusFilter === st ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.78rem', padding: '6px 12px', textTransform: 'capitalize' }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {complaints
          .filter((c) => {
            const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q ||
              c.title?.toLowerCase().includes(q) ||
              c.description?.toLowerCase().includes(q) ||
              c.specificLocation?.toLowerCase().includes(q) ||
              c.asset?.name?.toLowerCase().includes(q) ||
              c._id?.toLowerCase().includes(q);
            return matchesStatus && matchesSearch;
          })
          .length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
            No complaints found matching current filters.
          </div>
        ) : (
          complaints
            .filter((c) => {
              const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
              const q = searchQuery.toLowerCase();
              const matchesSearch = !q ||
                c.title?.toLowerCase().includes(q) ||
                c.description?.toLowerCase().includes(q) ||
                c.specificLocation?.toLowerCase().includes(q) ||
                c.asset?.name?.toLowerCase().includes(q) ||
                c._id?.toLowerCase().includes(q);
              return matchesStatus && matchesSearch;
            })
            .map((c) => {
              const ticketCode = c._id?.length > 8 ? c._id.slice(-6).toUpperCase() : c._id;
              const stepIndex = c.status === 'registered' ? 1 : c.status === 'work_started' ? 2 : 3;

              return (
                <div
                  key={c._id}
                  className="glass-panel"
                  style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: 'rgba(2, 132, 199, 0.2)',
                          color: '#38bdf8',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid rgba(2, 132, 199, 0.35)'
                        }}>
                          TICKET #{ticketCode}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#cbd5e1',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {c.category?.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Priority: <strong style={{ color: c.priority === 'urgent' ? '#f43f5e' : '#fbbf24', textTransform: 'capitalize' }}>{c.priority || 'Medium'}</strong>
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>
                        {c.title}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {getStatusBadge(c.status)}

                      {/* Regional Officer Action: Trigger Investigation (Req 2) */}
                      {user?.role === 'regional_officer' && c.status === 'registered' && (
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setInvestigateInstructions(`Field survey ordered for citizen grievance: "${c.title}" at ${c.specificLocation}`);
                            setShowInvestigateModal(true);
                          }}
                          className="btn btn-primary"
                          style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                        >
                          <SearchCheck size={14} /> Trigger Investigation
                        </button>
                      )}

                      {/* Regional Officer Triage & Update */}
                      {user?.role === 'regional_officer' && (
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setTriageStatus(c.status === 'registered' ? 'work_started' : 'resolved');
                            setShowTriageModal(true);
                          }}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                        >
                          <Wrench size={13} /> Update Status / Remarks
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3-State Progress Pipeline Visual Bar for Citizen Tracking */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-light)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                      {/* Step 1: Registered */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1 }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#fbbf24',
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          ✓
                        </div>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>Registered</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Grievance Lodged</div>
                        </div>
                      </div>

                      <div style={{
                        flex: 1,
                        height: '2px',
                        background: stepIndex >= 2 ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                        margin: '0 12px'
                      }} />

                      {/* Step 2: Work Started */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1 }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: stepIndex >= 2 ? '#38bdf8' : '#334155',
                          color: stepIndex >= 2 ? '#0f172a' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          {stepIndex > 2 ? '✓' : '2'}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: stepIndex >= 2 ? '#38bdf8' : '#64748b' }}>Work Started</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Officer Investigation / Crew</div>
                        </div>
                      </div>

                      <div style={{
                        flex: 1,
                        height: '2px',
                        background: stepIndex === 3 ? '#34d399' : 'rgba(255, 255, 255, 0.1)',
                        margin: '0 12px'
                      }} />

                      {/* Step 3: Resolved */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1 }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: stepIndex === 3 ? '#34d399' : '#334155',
                          color: stepIndex === 3 ? '#0f172a' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          {stepIndex === 3 ? '✓' : '3'}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: stepIndex === 3 ? '#34d399' : '#64748b' }}>Resolved</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Repaired &amp; Verified</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {c.description}
                  </p>

                  {/* Asset and Location info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '0.8rem',
                    color: 'var(--text-dim)',
                    flexWrap: 'wrap',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '10px 14px',
                    borderRadius: '8px'
                  }}>
                    <span>Target Asset: <strong style={{ color: '#38bdf8' }}>{c.asset?.name || 'Road Asset'}</strong></span>
                    <span>Exact Landmark: <strong style={{ color: '#cbd5e1' }}>{c.specificLocation}</strong></span>
                    <span>Lodged On: <strong style={{ color: '#94a3b8' }}>{new Date(c.createdAt || Date.now()).toLocaleDateString()}</strong></span>
                    {c.linkedInspection && (
                      <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <SearchCheck size={13} /> Investigation Dispatched
                      </span>
                    )}
                  </div>

                  {/* Remarks Timeline */}
                  {c.remarks && c.remarks.length > 0 && (
                    <div style={{
                      marginTop: '4px',
                      padding: '12px 14px',
                      background: 'rgba(2, 132, 199, 0.08)',
                      borderLeft: '3px solid #0284c7',
                      borderRadius: '0 8px 8px 0'
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MessageSquare size={13} /> Official Department Updates &amp; Remarks:
                      </div>
                      {c.remarks.map((r, idx) => (
                        <div key={idx} style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                          "{r.text}" <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>({new Date(r.at).toLocaleDateString()})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>

      {/* Trigger Investigation Modal (Req 2) */}
      {showInvestigateModal && selectedComplaint && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <SearchCheck size={20} color="#0284c7" />
              <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>
                Trigger Investigation on Complaint
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Dispatches a field inspection order to verify the issue on-ground and moves complaint to <strong>"Work Started"</strong>.
            </p>

            <form onSubmit={handleTriggerInvestigation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Complaint Issue
                </label>
                <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0' }}>
                  <strong>{selectedComplaint.title}</strong> at {selectedComplaint.specificLocation}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Investigation Directives for Field Engineer
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Conduct immediate field inspection. Verify depth of pothole and pavement distress; report back with condition rating."
                  value={investigateInstructions}
                  onChange={(e) => setInvestigateInstructions(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowInvestigateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <SearchCheck size={14} /> Dispatch Investigation Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Complaint Modal (Citizen) */}
      {showFileModal && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '6px' }}>
              Report Infrastructure Grievance
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Submit an issue directly to the Gujarat Roads &amp; Buildings department for action.
            </p>

            <form onSubmit={handleFileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Select Infrastructure Asset
                </label>
                <select
                  required
                  value={fileForm.asset}
                  onChange={(e) => setFileForm({ ...fileForm, asset: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {assets.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Complaint Category
                </label>
                <select
                  value={fileForm.category}
                  onChange={(e) => setFileForm({ ...fileForm, category: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Complaint Title / Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken pavement causing traffic snarl near crossroad"
                  value={fileForm.title}
                  onChange={(e) => setFileForm({ ...fileForm, title: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Specific Location / Landmark
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near Pillar 45, opposite City Hospital"
                  value={fileForm.specificLocation}
                  onChange={(e) => setFileForm({ ...fileForm, specificLocation: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Detailed Description
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe the depth, danger, or hazard in detail..."
                  value={fileForm.description}
                  onChange={(e) => setFileForm({ ...fileForm, description: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowFileModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Register Grievance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Officer Triage Modal */}
      {showTriageModal && selectedComplaint && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '6px' }}>
              Triage Complaint #{selectedComplaint._id.substring(0, 8)}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Update resolution status, priority, or add official remarks.
            </p>

            <form onSubmit={handleTriageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Update State
                </label>
                <select
                  value={triageStatus}
                  onChange={(e) => setTriageStatus(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="registered">Registered (Pending Review)</option>
                  <option value="work_started">Work Started (Inspection / Contractor Dispatched)</option>
                  <option value="resolved">Resolved (Maintenance Verified)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Priority Level
                </label>
                <select
                  value={triagePriority}
                  onChange={(e) => setTriagePriority(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Officer Remarks (Visible to Citizen)
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Patch work assigned to highway maintenance crew; work in progress..."
                  value={triageRemark}
                  onChange={(e) => setTriageRemark(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowTriageModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-emerald"
                >
                  Save Triage Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
