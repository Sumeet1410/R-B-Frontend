import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../config/api';
import { 
  ClipboardCheck, 
  PlusCircle, 
  Star, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  Send,
  Wrench,
  FileCheck2,
  XCircle,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';

export const InspectionsPage = () => {
  const { user } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [assets, setAssets] = useState([]);
  const [engineers, setEngineers] = useState([]);
  
  // Submit Survey modal (Field Engineer ONLY)
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activePendingOrder, setActivePendingOrder] = useState(null);

  // Inspection Type filter state (grievance vs completion)
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'grievance', 'completion'

  // Order Inspection modal (Regional Officer)
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    asset: '',
    inspector: '',
    inspectionType: 'grievance',
    orderInstructions: ''
  });

  // Review Inspection modal (Regional Officer)
  const [selectedInsp, setSelectedInsp] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewNotes, setReviewNotes] = useState('');

  // Submit Inspection form (Field Engineer ONLY)
  const [form, setForm] = useState({
    asset: '',
    inspectionType: 'grievance',
    conditionRating: 4,
    conditionNotes: '',
    recommendation: 'minor_repair',
    findingsCategory: 'surface',
    findingsSeverity: 'medium',
    findingsDesc: '',
    photos: []
  });

  const fetchInspections = async () => {
    try {
      const [inspRes, assetsRes, engRes] = await Promise.allSettled([
        apiRequest('/inspections'),
        apiRequest('/assets?limit=50'),
        apiRequest('/users/roles/engineers')
      ]);

      if (inspRes.status === 'fulfilled' && inspRes.value?.inspections) {
        setInspections(inspRes.value.inspections);
      } else {
        // Fallback demo data
        setInspections([
          {
            _id: 'i-pending-1',
            status: 'pending',
            orderInstructions: 'Regional Officer ordered pavement inspection following heavy monsoon rainfall.',
            asset: { _id: 'a1', name: 'Sarkhej-Gandhinagar (SG) Highway Stretch 1', district: 'Ahmedabad' },
            orderedBy: { name: 'Anjali Desai (EE)' },
            createdAt: new Date().toISOString()
          },
          {
            _id: 'i1',
            conditionRating: 4,
            conditionNotes: 'Road surface is in good overall condition. Minor shoulder erosion detected near km 4.5.',
            recommendation: 'minor_repair',
            status: 'approved',
            asset: { name: 'Sarkhej-Gandhinagar (SG) Highway Stretch 1', district: 'Ahmedabad' },
            inspector: { name: 'Dhaval Patel (AE)' },
            inspectionDate: new Date('2026-03-10').toISOString()
          },
          {
            _id: 'i2',
            conditionRating: 2,
            conditionNotes: 'Expansion joints damaged causing vehicle jerks. Immediate asphalt patching needed.',
            recommendation: 'major_repair',
            status: 'submitted',
            asset: { name: 'SP Ring Road Bopal Flyover Corridor', district: 'Ahmedabad' },
            inspector: { name: 'Dhaval Patel (AE)' },
            inspectionDate: new Date('2026-03-18').toISOString(),
            linkedTask: { title: 'Flyover Expansion Joint Repair' }
          }
        ]);
      }

      if (assetsRes.status === 'fulfilled' && assetsRes.value?.assets) {
        setAssets(assetsRes.value.assets);
        if (assetsRes.value.assets.length > 0 && !form.asset) {
          setForm((prev) => ({ ...prev, asset: assetsRes.value.assets[0]._id }));
          setOrderForm((prev) => ({ ...prev, asset: assetsRes.value.assets[0]._id }));
        }
      }

      if (engRes.status === 'fulfilled' && engRes.value?.engineers) {
        setEngineers(engRes.value.engineers);
        if (engRes.value.engineers.length > 0 && !orderForm.inspector) {
          setOrderForm((prev) => ({ ...prev, inspector: engRes.value.engineers[0]._id }));
        }
      }
    } catch (err) {
      console.warn('Error fetching inspections:', err);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [user]);

  // Requirement 1: Super Admin should not see inspections
  if (user?.role === 'super_admin') {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '560px', margin: '0 auto', padding: '36px' }}>
          <ShieldAlert size={44} color="#8b5cf6" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
            Administrative Oversight Role
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            On-ground engineering surveys and inspection reviews are conducted between <strong>Field Engineers</strong> and <strong>Regional Officers</strong>.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '12px' }}>
            Super Administrators oversee statewide infrastructure assets and analytical reporting.
          </p>
        </div>
      </div>
    );
  }

  // Requirement 2 & 3: Regional Officer orders an inspection
  const handleOrderInspection = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/inspections/order', {
        method: 'POST',
        body: JSON.stringify(orderForm)
      });

      if (res.success) {
        setShowOrderModal(false);
        fetchInspections();
      } else {
        const newOrder = {
          _id: `ord-${Date.now()}`,
          status: 'pending',
          orderInstructions: orderForm.orderInstructions,
          asset: assets.find((a) => a._id === orderForm.asset) || { name: 'Asset under survey', district: 'Ahmedabad' },
          orderedBy: { name: user?.name || 'Regional Officer' },
          createdAt: new Date().toISOString()
        };
        setInspections([newOrder, ...inspections]);
        setShowOrderModal(false);
      }
    } catch (err) {
      setShowOrderModal(false);
    }
  };

  // Requirement 3: ONLY Field Engineer submits inspection
  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        inspectionId: activePendingOrder?._id,
        asset: activePendingOrder ? activePendingOrder.asset?._id || activePendingOrder.asset : form.asset,
        inspectionType: activePendingOrder?.inspectionType || form.inspectionType || 'grievance',
        conditionRating: Number(form.conditionRating),
        conditionNotes: form.conditionNotes,
        recommendation: form.recommendation,
        findings: form.findingsDesc ? [{
          category: form.findingsCategory,
          severity: form.findingsSeverity,
          description: form.findingsDesc
        }] : []
      };

      const res = await apiRequest('/inspections', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        setShowSubmitModal(false);
        setActivePendingOrder(null);
        fetchInspections();
      } else {
        const updated = activePendingOrder 
          ? inspections.map((i) => i._id === activePendingOrder._id ? {
              ...i,
              status: 'submitted',
              inspectionType: activePendingOrder.inspectionType || form.inspectionType || 'grievance',
              conditionRating: form.conditionRating,
              conditionNotes: form.conditionNotes,
              recommendation: form.recommendation,
              inspector: { name: user?.name || 'Field Engineer' },
              inspectionDate: new Date().toISOString()
            } : i)
          : [{
              _id: `insp-${Date.now()}`,
              ...payload,
              status: 'submitted',
              asset: assets.find((a) => a._id === form.asset) || { name: 'Inspected Asset' },
              inspector: { name: user?.name || 'Field Engineer' },
              inspectionDate: new Date().toISOString()
            }, ...inspections];

        setInspections(updated);
        setShowSubmitModal(false);
        setActivePendingOrder(null);
      }
    } catch (err) {
      setShowSubmitModal(false);
      setActivePendingOrder(null);
    }
  };

  // Requirement 4: Regional officer accepts or rejects inspection (reject decreases task to 90%)
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInsp) return;

    try {
      await apiRequest(`/inspections/${selectedInsp._id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status: reviewStatus, reviewNotes })
      });
      setShowReviewModal(false);
      fetchInspections();
    } catch (err) {
      setInspections(inspections.map((i) => (i._id === selectedInsp._id ? { ...i, status: reviewStatus } : i)));
      setShowReviewModal(false);
    }
  };

  const getIsCompletion = (item) => item.inspectionType === 'completion' || !!item.linkedTask;

  const filteredInspections = inspections.filter((i) => {
    if (typeFilter === 'all') return true;
    if (typeFilter === 'completion') return getIsCompletion(i);
    if (typeFilter === 'grievance') return !getIsCompletion(i);
    return true;
  });

  const pendingOrders = filteredInspections.filter((i) => i.status === 'pending');
  const completedInspections = filteredInspections.filter((i) => i.status !== 'pending');

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Field Engineering Inspections</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Two-Tier Inspections: <strong>1. Grievance Inspection</strong> (Citizen grievance investigation) &amp; <strong>2. Completion Inspection</strong> (Contractor completion acceptance)
          </p>
        </div>

        {/* Action Buttons Scoped Strictly by Role */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Requirement 2 & 3: Regional Officer can order inspection */}
          {user?.role === 'regional_officer' && (
            <button
              onClick={() => setShowOrderModal(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.88rem' }}
            >
              <PlusCircle size={16} /> Order Field Inspection
            </button>
          )}

          {/* Requirement 3: ONLY Field Engineer can submit an inspection */}
          {user?.role === 'field_engineer' && (
            <button
              onClick={() => {
                setActivePendingOrder(null);
                setShowSubmitModal(true);
              }}
              className="btn btn-primary"
              style={{ fontSize: '0.88rem' }}
            >
              <PlusCircle size={16} /> New Inspection Survey
            </button>
          )}
        </div>
      </div>

      {/* 2-Type Filter Switcher */}
      <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Inspection Category:</span>
          <button
            onClick={() => setTypeFilter('all')}
            className={typeFilter === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            All ({inspections.length})
          </button>
          <button
            onClick={() => setTypeFilter('grievance')}
            className={typeFilter === 'grievance' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <AlertTriangle size={13} color="#fbbf24" /> 1. Grievance Inspection ({inspections.filter(i => !getIsCompletion(i)).length})
          </button>
          <button
            onClick={() => setTypeFilter('completion')}
            className={typeFilter === 'completion' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <FileCheck2 size={13} color="#38bdf8" /> 2. Completion Inspection ({inspections.filter(i => getIsCompletion(i)).length})
          </button>
        </div>
      </div>

      {/* Pending Orders Section (Triggered by Officer or 100% Task Completion) */}
      {pendingOrders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Pending Inspection Orders ({pendingOrders.length})
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Waiting for Field Engineer to conduct survey &amp; fill findings
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {pendingOrders.map((ord) => {
              const isComp = getIsCompletion(ord);
              return (
                <div
                  key={ord._id}
                  className="glass-panel"
                  style={{
                    padding: '18px',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    background: 'rgba(245, 158, 11, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <span className="badge badge-planning">
                        <Clock size={12} /> Pending Survey
                      </span>
                      {isComp ? (
                        <span className="badge badge-construction" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileCheck2 size={11} /> 2. Completion Inspection
                        </span>
                      ) : (
                        <span className="badge badge-registered" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={11} /> 1. Grievance Inspection
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '6px' }}>
                      {ord.asset?.name || 'Target Asset'}
                    </h4>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      {ord.orderInstructions || 'Inspection ordered by Regional Officer.'}
                    </p>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Ordered by: <strong style={{ color: '#cbd5e1' }}>{ord.orderedBy?.name || 'Regional Officer'}</strong>
                    </div>
                  </div>

                  {/* Requirement 3: Field Engineer can complete & edit the pending inspection */}
                  {user?.role === 'field_engineer' && (
                    <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                      <button
                        onClick={() => {
                          setActivePendingOrder(ord);
                          setShowSubmitModal(true);
                        }}
                        className="btn btn-emerald"
                        style={{ width: '100%', fontSize: '0.82rem', padding: '8px' }}
                      >
                        <Wrench size={14} /> Conduct Survey &amp; Submit Findings
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submitted / Reviewed Inspections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Submitted &amp; Reviewed Reports ({completedInspections.length})
        </div>

        {completedInspections.map((insp) => {
          const isComp = getIsCompletion(insp);
          return (
            <div key={insp._id} className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    {/* Inspection Type Badge */}
                    {isComp ? (
                      <span className="badge badge-construction" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileCheck2 size={12} /> 2. Completion Inspection
                      </span>
                    ) : (
                      <span className="badge badge-registered" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={12} /> 1. Grievance Inspection
                      </span>
                    )}

                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={16} fill="#f59e0b" color="#f59e0b" /> {insp.conditionRating} / 5 Rating
                    </span>
                    <span className={`badge ${insp.status === 'approved' ? 'badge-active' : insp.status === 'rejected' ? 'badge-maintenance' : 'badge-construction'}`}>
                      {insp.status}
                    </span>
                    {insp.linkedTask && (
                      <span style={{ fontSize: '0.72rem', background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        Linked Task: {insp.linkedTask?.title || 'Contractor Work'}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>
                    {insp.asset?.name || 'Asset Survey'}
                  </h3>
                </div>

                {/* Regional Inspector acceptance actions */}
                {user?.role === 'regional_officer' && insp.status === 'submitted' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {isComp ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedInsp(insp);
                            setReviewStatus('approved');
                            setReviewNotes('Completion accepted & approved by Regional Inspector.');
                            setShowReviewModal(true);
                          }}
                          className="btn btn-emerald"
                          style={{ fontSize: '0.8rem', padding: '7px 14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)' }}
                        >
                          <CheckCircle2 size={14} /> Approve completion
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInsp(insp);
                            setReviewStatus('rejected');
                            setReviewNotes('Deficiencies found. Completion rejected, task progress reverted to 90%.');
                            setShowReviewModal(true);
                          }}
                          className="btn btn-danger"
                          style={{ fontSize: '0.8rem', padding: '7px 14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <XCircle size={14} /> Reject completion
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedInsp(insp);
                          setReviewStatus('approved');
                          setReviewNotes('Grievance inspection findings verified & approved.');
                          setShowReviewModal(true);
                        }}
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <ShieldCheck size={14} /> Review Grievance Inspection
                      </button>
                    )}
                  </div>
                )}
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                {insp.conditionNotes}
              </p>

              <div style={{
                display: 'flex',
                gap: '16px',
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-light)',
                flexWrap: 'wrap'
              }}>
                <span>Inspector: <strong style={{ color: '#93c5fd' }}>{insp.inspector?.name || 'Field Engineer'}</strong></span>
                <span>Recommendation: <strong style={{ color: '#cbd5e1', textTransform: 'capitalize' }}>{insp.recommendation?.replace('_', ' ')}</strong></span>
                <span>Survey Date: <strong style={{ color: '#cbd5e1' }}>{new Date(insp.inspectionDate).toLocaleDateString()}</strong></span>
                {insp.reviewedBy && (
                  <span>Reviewed By: <strong style={{ color: '#34d399' }}>{insp.reviewedBy.name}</strong> ({insp.status})</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Inspection Modal (Regional Officer) */}
      {showOrderModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '6px' }}>
              Order Field Inspection
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Dispatch an inspection order. The inspection will be placed in <strong>Pending</strong> state for a field engineer to survey and submit.
            </p>

            <form onSubmit={handleOrderInspection} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Inspection Category
                </label>
                <select
                  value={orderForm.inspectionType}
                  onChange={(e) => setOrderForm({ ...orderForm, inspectionType: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="grievance">1. Grievance Inspection (Citizen complaint investigation)</option>
                  <option value="completion">2. Completion Inspection (Contractor work completion)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Target Infrastructure Asset
                </label>
                <select
                  required
                  value={orderForm.asset}
                  onChange={(e) => setOrderForm({ ...orderForm, asset: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {assets.map((a) => (
                    <option key={a._id} value={a._id}>{a.name} ({a.district})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Assign Field Engineer (Optional)
                </label>
                <select
                  value={orderForm.inspector}
                  onChange={(e) => setOrderForm({ ...orderForm, inspector: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="">Any District Field Engineer</option>
                  {engineers.map((eng) => (
                    <option key={eng._id} value={eng._id}>{eng.name} ({eng.district || 'Engineer'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Inspection Instructions / Directives
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Conduct thorough condition survey of wear on bridge bearings and surface rutting."
                  value={orderForm.orderInstructions}
                  onChange={(e) => setOrderForm({ ...orderForm, orderInstructions: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Issue Inspection Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Inspection Modal (ONLY Field Engineer) */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '6px' }}>
              {activePendingOrder ? 'Fulfill Inspection Order' : 'Submit Field Inspection Report'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Log condition ratings, observations, and recommendations for Regional Officer review.
            </p>

            <form onSubmit={handleSubmitInspection} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {!activePendingOrder ? (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Inspection Category
                    </label>
                    <select
                      value={form.inspectionType}
                      onChange={(e) => setForm({ ...form, inspectionType: e.target.value })}
                      style={{ width: '100%' }}
                    >
                      <option value="grievance">1. Grievance Inspection (Citizen distress survey)</option>
                      <option value="completion">2. Completion Inspection (Contractor milestone verification)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Target Asset
                    </label>
                    <select
                      required
                      value={form.asset}
                      onChange={(e) => setForm({ ...form, asset: e.target.value })}
                      style={{ width: '100%' }}
                    >
                      {assets.map((a) => (
                        <option key={a._id} value={a._id}>{a.name} ({a.district})</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.85rem' }}>
                  Asset: <strong style={{ color: '#38bdf8' }}>{activePendingOrder.asset?.name}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Directives: {activePendingOrder.orderInstructions}
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Condition Rating (1 = Critical Failure, 5 = Excellent)
                </label>
                <select
                  value={form.conditionRating}
                  onChange={(e) => setForm({ ...form, conditionRating: Number(e.target.value) })}
                  style={{ width: '100%' }}
                >
                  <option value="5">5 - Excellent (No defects)</option>
                  <option value="4">4 - Good (Minor wear)</option>
                  <option value="3">3 - Fair (Noticeable distress)</option>
                  <option value="2">2 - Poor (Structural/surface breakdown)</option>
                  <option value="1">1 - Critical (Immediate hazard)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Engineering Recommendation
                </label>
                <select
                  value={form.recommendation}
                  onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="no_action">No Action Required</option>
                  <option value="minor_repair">Minor Maintenance &amp; Patching</option>
                  <option value="major_repair">Major Structural Rehabilitation</option>
                  <option value="reconstruction">Complete Reconstruction</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Specific Finding / Defect Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Detail crack widths, shoulder wear, or joint displacement..."
                  value={form.findingsDesc}
                  onChange={(e) => setForm({ ...form, findingsDesc: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Comprehensive Condition Notes
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Summarize total structural health..."
                  value={form.conditionNotes}
                  onChange={(e) => setForm({ ...form, conditionNotes: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-emerald"
                >
                  Submit Survey Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal (Regional Officer Acceptance Decision) */}
      {showReviewModal && selectedInsp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              {getIsCompletion(selectedInsp) ? (
                <FileCheck2 size={22} color="#38bdf8" />
              ) : (
                <AlertTriangle size={22} color="#fbbf24" />
              )}
              <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>
                {getIsCompletion(selectedInsp) ? 'Review Completion Inspection' : 'Review Grievance Inspection'}
              </h3>
            </div>

            {/* Requirement 4 Warning on Linked Task */}
            {getIsCompletion(selectedInsp) ? (
              <div style={{
                background: 'rgba(2, 132, 199, 0.12)',
                border: '1px solid rgba(2, 132, 199, 0.35)',
                color: '#38bdf8',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                margin: '10px 0 16px 0',
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 700, marginBottom: '2px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={14} color="#f59e0b" /> Completion Acceptance Decision Impact:
                </div>
                • <strong>Approve completion</strong>: Officially completes the task at 100% and approves deliverables.<br />
                • <strong>Reject completion</strong>: Decreases task completion back to <strong>90%</strong> and orders rework.
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '6px 0 16px 0' }}>
                Review survey findings and condition rating for citizen grievance investigation.
              </p>
            )}

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Regional Inspector Acceptance Decision
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewStatus('approved');
                      if (getIsCompletion(selectedInsp)) {
                        setReviewNotes('Quality verified and accepted. Task completed.');
                      }
                    }}
                    className={reviewStatus === 'approved' ? 'btn btn-emerald' : 'btn btn-secondary'}
                    style={{ padding: '10px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <CheckCircle2 size={16} /> {getIsCompletion(selectedInsp) ? 'Approve completion' : 'Approve Findings'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReviewStatus('rejected');
                      if (getIsCompletion(selectedInsp)) {
                        setReviewNotes('Defects detected. Completion rejected, progress reverted to 90%.');
                      }
                    }}
                    className={reviewStatus === 'rejected' ? 'btn btn-danger' : 'btn btn-secondary'}
                    style={{ padding: '10px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <XCircle size={16} /> {getIsCompletion(selectedInsp) ? 'Reject completion' : 'Reject Findings'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Regional Inspector Remarks
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder={getIsCompletion(selectedInsp) ? "Enter acceptance notes or defect feedback..." : "Enter grievance resolution notes..."}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={reviewStatus === 'approved' ? 'btn btn-emerald' : 'btn btn-danger'}
                  style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {getIsCompletion(selectedInsp) ? (
                    reviewStatus === 'approved' ? (
                      <><CheckCircle2 size={15} /> Confirm: Approve completion</>
                    ) : (
                      <><XCircle size={15} /> Confirm: Reject completion</>
                    )
                  ) : (
                    reviewStatus === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
