import React from 'react';
import { 
  GitCommit, 
  Layers, 
  ClipboardCheck, 
  Hammer, 
  AlertTriangle, 
  FileText, 
  Clock, 
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const TimelineView = ({ events = [] }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'stage_change':
        return <Layers size={16} color="#38bdf8" />;
      case 'inspection':
        return <ClipboardCheck size={16} color="#10b981" />;
      case 'task_assigned':
      case 'task_completed':
        return <Hammer size={16} color="#f59e0b" />;
      case 'complaint_filed':
      case 'complaint_resolved':
        return <AlertTriangle size={16} color="#f43f5e" />;
      case 'document_uploaded':
        return <FileText size={16} color="#8b5cf6" />;
      default:
        return <GitCommit size={16} color="#94a3b8" />;
    }
  };

  if (!events || events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
        <Clock size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
        <div>No timeline events logged for this asset yet.</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '28px', marginTop: '16px' }}>
      {/* Vertical Spine Line */}
      <div style={{
        position: 'absolute',
        top: '12px',
        bottom: '12px',
        left: '11px',
        width: '2px',
        background: 'linear-gradient(to bottom, rgba(2, 132, 199, 0.6), rgba(255, 255, 255, 0.05))'
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {events.map((event, index) => {
          const dateStr = new Date(event.createdAt || Date.now()).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div key={event._id || index} style={{ position: 'relative' }} className="animate-fade">
              {/* Event Circle Node */}
              <div style={{
                position: 'absolute',
                left: '-28px',
                top: '2px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#0f172a',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
              }}>
                {getEventIcon(event.eventType)}
              </div>

              {/* Event Box */}
              <div className="glass-panel" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#cbd5e1',
                      marginRight: '8px'
                    }}>
                      {event.eventType?.replace('_', ' ')}
                    </span>
                    <strong style={{ fontSize: '0.96rem', color: '#f8fafc' }}>
                      {event.title}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    <Calendar size={13} />
                    <span>{dateStr}</span>
                  </div>
                </div>

                {event.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
                    {event.description}
                  </p>
                )}

                {/* Performed by footer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                  <span>Actor: <strong style={{ color: '#93c5fd' }}>{event.performedBy?.name || 'System / Officer'}</strong></span>
                  {event.performedByRole && (
                    <span style={{ textTransform: 'capitalize' }}>
                      ({event.performedByRole.replace('_', ' ')})
                    </span>
                  )}
                </div>

                {/* Attachments */}
                {event.attachments && event.attachments.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {event.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(2, 132, 199, 0.15)',
                          color: '#38bdf8',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid rgba(2, 132, 199, 0.3)'
                        }}
                      >
                        📎 {att.name || 'Attachment'}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
