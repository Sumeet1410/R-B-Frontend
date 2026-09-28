import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = '#0284c7', trend }) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        background: color
      }} />

      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#ffffff', marginTop: '6px', lineHeight: 1.1 }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {trend && <span style={{ color: trend.startsWith('+') ? '#34d399' : '#f43f5e', fontWeight: 600 }}>{trend}</span>}
            <span>{subtitle}</span>
          </div>
        )}
      </div>

      {Icon && (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: `rgba(${color.startsWith('#') ? '2, 132, 199' : '255, 255, 255'}, 0.1)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          flexShrink: 0
        }}>
          <Icon size={24} color={color} />
        </div>
      )}
    </div>
  );
};
