import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../config/api';
import { 
  Hammer, 
  PlusCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Building2,
  Send,
  Camera,
  AlertTriangle,
  History,
  UploadCloud,
  ImagePlus,
  X,
  ExternalLink
} from 'lucide-react';

export const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [assets, setAssets] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressPercent, setProgressPercent] = useState(50);
  const [progressDesc, setProgressDesc] = useState('');
  const [photoProofUrl, setPhotoProofUrl] = useState('');

  // Photo uploader state
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form
  const [createForm, setCreateForm] = useState({
    asset: '',
    title: '',
    description: '',
    taskType: 'repair',
    assignedTo: '',
    priority: 'high',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    estimatedBudget: 500000
  });

  const fetchTasks = async () => {
    try {
      const [tasksRes, assetsRes, orgsRes] = await Promise.allSettled([
        apiRequest('/tasks'),
        apiRequest('/assets?limit=50'),
        apiRequest('/users/roles/organizations')
      ]);

      if (tasksRes.status === 'fulfilled' && tasksRes.value?.tasks) {
        setTasks(tasksRes.value.tasks);
      } else {
        // Fallback demo tasks
        setTasks([
          {
            _id: 't1',
            title: 'Flyover Expansion Joint Repair & Resurfacing',
            description: 'Replace elastomeric expansion joints and apply tack coat with 40mm bitumen overlay.',
            taskType: 'repair',
            priority: 'high',
            status: 'in_progress',
            estimatedBudget: 850000,
            dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
            asset: { name: 'SP Ring Road Bopal Flyover Corridor', district: 'Ahmedabad' },
            assignedTo: { name: 'Gujarat Highway Builders Ltd.', organizationName: 'Gujarat Highway Builders' },
            progressUpdates: [
              {
                percentComplete: 20,
                description: 'Initial site preparation and safety barricades erected.',
                photos: [],
                updatedAt: new Date(Date.now() - 5 * 86400000).toISOString()
              },
              {
                percentComplete: 40,
                description: 'Demolition of broken concrete edges completed. Steel anchor bars inspected.',
                photos: ['https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=400'],
                updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
              }
            ]
          },
          {
            _id: 't2',
            title: 'Four-laning Earthwork & Sub-base Compaction',
            description: 'Grading of embankment and laying Granular Sub Base (GSB) for 8.4 km stretch.',
            taskType: 'construction',
            priority: 'urgent',
            status: 'in_progress',
            estimatedBudget: 15000000,
            dueDate: new Date(Date.now() + 60 * 86400000).toISOString(),
            asset: { name: 'Gandhinagar-Koba Aerodrome Link Highway', district: 'Gandhinagar' },
            assignedTo: { name: 'L&T Infrastructure Projects', organizationName: 'Larsen & Toubro Ltd.' },
            progressUpdates: [
              {
                percentComplete: 30,
                description: 'Initial grading and clearing of vegetation completed.',
                photos: [],
                updatedAt: new Date(Date.now() - 15 * 86400000).toISOString()
              },
              {
                percentComplete: 55,
                description: 'Sub-base compaction tested up to km 5.0 with density compliance.',
                photos: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400'],
                updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
              }
            ]
          }
        ]);
      }

      if (assetsRes.status === 'fulfilled' && assetsRes.value?.assets) {
        setAssets(assetsRes.value.assets);
        if (assetsRes.value.assets.length > 0 && !createForm.asset) {
          setCreateForm((prev) => ({ ...prev, asset: assetsRes.value.assets[0]._id }));
        }
      }

      if (orgsRes.status === 'fulfilled' && orgsRes.value?.organizations) {
        setOrgs(orgsRes.value.organizations);
        if (orgsRes.value.organizations.length > 0 && !createForm.assignedTo) {
          setCreateForm((prev) => ({ ...prev, assignedTo: orgsRes.value.organizations[0]._id }));
        }
      }
    } catch (err) {
      console.warn('Error fetching tasks:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(createForm)
      });

      if (res.success) {
        setShowCreateModal(false);
        fetchTasks();
      } else {
        const newTask = {
          _id: `task-${Date.now()}`,
          ...createForm,
          status: 'pending',
          asset: assets.find((a) => a._id === createForm.asset) || { name: 'Assigned Asset' },
          assignedTo: { name: 'Contractor Ltd.' },
          progressUpdates: []
        };
        setTasks([newTask, ...tasks]);
        setShowCreateModal(false);
      }
    } catch (err) {
      setShowCreateModal(false);
    }
  };

  const handleFiles = (incomingFiles) => {
    const validFiles = Array.from(incomingFiles).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    // Limit to max 5 files total
    const remainingSlots = Math.max(0, 5 - selectedFiles.length);
    const filesToAdd = validFiles.slice(0, remainingSlots);

    const newPreviews = filesToAdd.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2)
    }));

    setSelectedFiles((prev) => [...prev, ...filesToAdd]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index) => {
    setFilePreviews((prev) => {
      const target = prev[index];
      if (target && target.url) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((_, i) => i !== index);
    });
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetProgressForm = () => {
    filePreviews.forEach((p) => {
      if (p.url) URL.revokeObjectURL(p.url);
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    setPhotoProofUrl('');
    setProgressDesc('');
    setIsDragging(false);
    setIsSubmitting(false);
  };

  // Requirement 4: Contractor submits photo proofs and updates progress
  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    setIsSubmitting(true);

    try {
      let res;
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append('percentComplete', progressPercent);
        formData.append('description', progressDesc);
        selectedFiles.forEach((file) => {
          formData.append('photos', file);
        });
        if (photoProofUrl.trim()) {
          formData.append('photos', photoProofUrl.trim());
        }

        res = await apiRequest(`/tasks/${selectedTask._id}/progress`, {
          method: 'POST',
          body: formData
        });
      } else {
        const photosArray = photoProofUrl.trim() ? [photoProofUrl.trim()] : [];
        res = await apiRequest(`/tasks/${selectedTask._id}/progress`, {
          method: 'POST',
          body: JSON.stringify({
            percentComplete: progressPercent,
            description: progressDesc,
            photos: photosArray
          })
        });
      }

      setShowProgressModal(false);
      resetProgressForm();
      fetchTasks();
    } catch (err) {
      console.warn('API error submitting progress, falling back locally:', err);
      // Local fallback simulation with preview URLs
      const photosArray = [
        ...filePreviews.map((p) => p.url),
        ...(photoProofUrl.trim() ? [photoProofUrl.trim()] : [])
      ];

      setTasks(tasks.map((t) => {
        if (t._id === selectedTask._id) {
          return {
            ...t,
            progressUpdates: [
              ...(t.progressUpdates || []),
              {
                percentComplete: progressPercent,
                description: progressDesc,
                photos: photosArray,
                updatedAt: new Date().toISOString()
              }
            ]
          };
        }
        return t;
      }));
      setShowProgressModal(false);
      resetProgressForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Contract Works &amp; Maintenance Tasks</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Allocated repair tasks, contractor milestones, photo proofs, and verification inspections
          </p>
        </div>

        {(user?.role === 'super_admin' || user?.role === 'regional_officer') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.88rem' }}
          >
            <PlusCircle size={16} /> Assign New Work Task
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
        {tasks.map((task) => {
          const updates = task.progressUpdates || [];
          const latestProgress = updates.length > 0 
            ? updates[updates.length - 1].percentComplete 
            : 0;
          
          // Requirement 4: Previous status update to show on contractor task card
          const previousUpdate = updates.length > 1 ? updates[updates.length - 2] : null;
          const currentUpdate = updates.length > 0 ? updates[updates.length - 1] : null;

          const isAwaitingAcceptance = latestProgress === 100 && task.status !== 'completed';

          return (
            <div key={task._id} className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', padding: '2px 8px', borderRadius: '4px' }}>
                    {task.taskType}
                  </span>
                  <span className={`badge ${task.status === 'completed' ? 'badge-active' : isAwaitingAcceptance ? 'badge-planning' : 'badge-construction'}`}>
                    {task.status === 'completed' ? 'Completed' : isAwaitingAcceptance ? 'Inspection Triggered' : task.status?.replace('_', ' ')}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.08rem', color: '#fff', marginBottom: '8px', lineHeight: 1.3 }}>
                  {task.title}
                </h3>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  {task.description}
                </p>

                {/* Progress bar */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Current Completion:</span>
                    <strong style={{ color: latestProgress === 100 ? '#10b981' : '#38bdf8' }}>{latestProgress}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${latestProgress}%`, height: '100%', background: latestProgress === 100 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #0284c7, #38bdf8)', borderRadius: '99px' }} />
                  </div>
                </div>

                {/* Requirement 4: 100% Inspection Triggered Notice */}
                {isAwaitingAcceptance && (
                  <div style={{
                    marginBottom: '12px',
                    padding: '8px 12px',
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    color: '#fcd34d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Clock size={14} />
                    <span>100% Reported — Inspection triggered for Regional Officer acceptance</span>
                  </div>
                )}

                {/* Requirement 4: Previous Status Update Card Section */}
                {previousUpdate ? (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginBottom: '12px',
                    fontSize: '0.78rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                        <History size={12} color="#94a3b8" /> Previous Status Update:
                      </span>
                      <span style={{ color: '#fbbf24', fontWeight: 700 }}>{previousUpdate.percentComplete}%</span>
                    </div>
                    <div style={{ color: '#cbd5e1', lineHeight: 1.3 }}>
                      "{previousUpdate.description}"
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{new Date(previousUpdate.updatedAt).toLocaleDateString()}</span>
                      {previousUpdate.photos && previousUpdate.photos.length > 0 && (
                        <span style={{ color: '#38bdf8' }}>📷 {previousUpdate.photos.length} photo proof(s)</span>
                      )}
                    </div>
                    {previousUpdate.photos && previousUpdate.photos.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                        {previousUpdate.photos.map((photo, pIdx) => {
                          const fullUrl = photo.startsWith('http') || photo.startsWith('blob:') ? photo : `http://localhost:5000${photo}`;
                          return (
                            <a
                              key={pIdx}
                              href={fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Click to view photo proof"
                              style={{ display: 'inline-block', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}
                            >
                              <img src={fullUrl} alt={`Proof ${pIdx + 1}`} style={{ width: '42px', height: '42px', objectFit: 'cover', display: 'block' }} />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : currentUpdate ? (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    marginBottom: '12px',
                    fontSize: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                      <span>Latest Update: "{currentUpdate.description}"</span>
                      <strong style={{ color: '#38bdf8' }}>{currentUpdate.percentComplete}%</strong>
                    </div>
                    {currentUpdate.photos && currentUpdate.photos.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                        {currentUpdate.photos.map((photo, pIdx) => {
                          const fullUrl = photo.startsWith('http') || photo.startsWith('blob:') ? photo : `http://localhost:5000${photo}`;
                          return (
                            <a
                              key={pIdx}
                              href={fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Click to view photo proof"
                              style={{ display: 'inline-block', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.3)', flexShrink: 0 }}
                            >
                              <img src={fullUrl} alt={`Proof ${pIdx + 1}`} style={{ width: '44px', height: '44px', objectFit: 'cover', display: 'block' }} />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null}

                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Asset: <strong style={{ color: '#cbd5e1' }}>{task.asset?.name || 'Infrastructure Unit'}</strong></div>
                  <div>Contractor: <strong style={{ color: '#93c5fd' }}>{task.assignedTo?.organizationName || task.assignedTo?.name || 'Contractor'}</strong></div>
                  <div>Due Date: <strong style={{ color: '#fcd34d' }}>{new Date(task.dueDate).toLocaleDateString()}</strong></div>
                </div>
              </div>

              {/* Footer action */}
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Budget: ₹{((task.estimatedBudget || 0) / 100000).toFixed(1)} Lakh
                </span>

                {(user?.role === 'organization' || user?.role === 'super_admin' || user?.role === 'regional_officer') && task.status !== 'completed' && (
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setProgressPercent(latestProgress);
                      resetProgressForm();
                      setShowProgressModal(true);
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    <TrendingUp size={13} /> Update Progress &amp; Proofs
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Update Modal with Photo Proofs (Req 4) */}
      {showProgressModal && selectedTask && (
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
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '4px' }}>
              Submit Progress &amp; Photo Proofs
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {selectedTask.title}
            </p>

            <form onSubmit={handleProgressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Set Progress Completion Percentage:</span>
                  <strong style={{ color: progressPercent === 100 ? '#10b981' : '#38bdf8', fontSize: '0.95rem' }}>
                    {progressPercent}%
                  </strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressPercent}
                  onChange={(e) => setProgressPercent(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Requirement 4 Warning when setting to 100% */}
              {progressPercent === 100 && (
                <div style={{
                  background: 'rgba(2, 132, 199, 0.12)',
                  border: '1px solid rgba(2, 132, 199, 0.35)',
                  color: '#93c5fd',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  lineHeight: 1.4
                }}>
                  <div style={{ fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={13} color="#38bdf8" /> 100% Milestone Policy
                  </div>
                  Reporting 100% completion will automatically trigger an on-ground field inspection. The <strong>Regional Officer must accept the inspection</strong> to officially mark the task as complete. If not accepted, completion will decrease back to 90%.
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Milestone Work Description
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detail completed milestones, materials compacted, or work performed..."
                  value={progressDesc}
                  onChange={(e) => setProgressDesc(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Requirement 4: Option to submit photo proofs with interactive uploader */}
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImagePlus size={15} color="#38bdf8" /> Upload On-Site Photo Proofs ({selectedFiles.length}/5)
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Max 5 files (PNG, JPG, WEBP)</span>
                </label>

                {/* Drag & Drop File Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files) {
                      handleFiles(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: isDragging ? '2px dashed #38bdf8' : '1px dashed rgba(255, 255, 255, 0.22)',
                    background: isDragging ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    padding: '16px 14px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFiles(e.target.files);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(56, 189, 248, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8'
                  }}>
                    <UploadCloud size={20} />
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f8fafc' }}>
                    Click to select photos or drag &amp; drop here
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    High-resolution proof for IRC compliance audit (up to 10MB each)
                  </div>
                </div>

                {/* Thumbnails Gallery of Uploaded Photos */}
                {filePreviews.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: '8px', marginTop: '10px' }}>
                    {filePreviews.map((p, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          background: 'rgba(0, 0, 0, 0.5)',
                          aspectRatio: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <img
                          src={p.url}
                          alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(idx);
                          }}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.9)',
                            border: 'none',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                          }}
                          title="Remove photo"
                        >
                          <X size={12} />
                        </button>
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                          padding: '2px 4px',
                          fontSize: '0.62rem',
                          color: '#e2e8f0',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {p.size} MB
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Alternative Web Image URL */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ position: 'relative' }}>
                    <Camera size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                    <input
                      type="url"
                      placeholder="Or paste external photo proof URL..."
                      value={photoProofUrl}
                      onChange={(e) => setPhotoProofUrl(e.target.value)}
                      style={{ width: '100%', paddingLeft: '32px', fontSize: '0.78rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowProgressModal(false);
                    resetProgressForm();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} />
                  {isSubmitting ? 'Uploading & Updating...' : 'Submit Progress & Proofs'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
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
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '6px' }}>
              Assign Contract Task
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Commission repair, maintenance, or construction to an approved contractor organization.
            </p>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Target Asset
                </label>
                <select
                  required
                  value={createForm.asset}
                  onChange={(e) => setCreateForm({ ...createForm, asset: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {assets.map((a) => (
                    <option key={a._id} value={a._id}>{a.name} ({a.district})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Work Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Surface Bitumen Overlay Km 0 to 4"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Task Type
                  </label>
                  <select
                    value={createForm.taskType}
                    onChange={(e) => setCreateForm({ ...createForm, taskType: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="repair">Repair</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="construction">Construction</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Priority
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Assign to Contractor
                </label>
                <select
                  required
                  value={createForm.assignedTo}
                  onChange={(e) => setCreateForm({ ...createForm, assignedTo: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {orgs.length > 0 ? (
                    orgs.map((o) => (
                      <option key={o._id} value={o._id}>{o.organizationName || o.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="65f000000000000000000007">L&amp;T Infrastructure Projects</option>
                      <option value="65f000000000000000000008">Gujarat Highway Builders Ltd.</option>
                    </>
                  )}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.dueDate}
                    onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Estimated Budget (INR ₹)
                  </label>
                  <input
                    type="number"
                    value={createForm.estimatedBudget}
                    onChange={(e) => setCreateForm({ ...createForm, estimatedBudget: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Detailed Scope of Work
                </label>
                <textarea
                  rows="3"
                  placeholder="Specific technical guidelines and milestones..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
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
                  Allocate Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
