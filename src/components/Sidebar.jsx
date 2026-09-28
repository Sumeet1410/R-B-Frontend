import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  MapPin,
  ClipboardCheck,
  Hammer,
  AlertTriangle,
  BarChart3,
  Users,
  PlusCircle,
  FileText
} from 'lucide-react';

export const Sidebar = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();
  const role = user?.role || 'citizen';

  const getNavItems = () => {
    switch (role) {
      case 'super_admin':
        return [
          { id: 'dashboard', label: 'State Overview', icon: LayoutDashboard },
          { id: 'assets', label: 'All Infrastructure Assets', icon: Layers },
          { id: 'map', label: 'State Map View', icon: MapPin },
          { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
          { id: 'users', label: 'User Directory', icon: Users }
        ];

      case 'regional_officer':
        return [
          { id: 'dashboard', label: `${user.district || 'District'} Dashboard`, icon: LayoutDashboard },
          { id: 'assets', label: 'District Assets', icon: Layers },
          { id: 'map', label: 'District Map', icon: MapPin },
          { id: 'inspections', label: 'Inspection Orders & Approvals', icon: ClipboardCheck },
          { id: 'tasks', label: 'Works Management', icon: Hammer },
          { id: 'complaints', label: 'Grievance Triage & Investigation', icon: AlertTriangle }
        ];

      case 'field_engineer':
        return [
          { id: 'assets', label: 'Assigned Assets', icon: Layers },
          { id: 'inspections', label: 'My Inspections', icon: ClipboardCheck },
          { id: 'map', label: 'Assets Map', icon: MapPin }
        ];

      case 'organization':
        return [
          { id: 'tasks', label: 'Assigned Works & Tasks', icon: Hammer },
          { id: 'assets', label: 'Contracted Assets', icon: Layers },
          { id: 'map', label: 'Worksite Map', icon: MapPin }
        ];

      case 'citizen':
      default:
        return [
          { id: 'complaints', label: 'File & Track Grievance', icon: AlertTriangle }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside style={{
      width: '260px',
      background: 'rgba(10, 15, 29, 0.95)',
      borderRight: '1px solid var(--border-card)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 'calc(100vh - 68px)'
    }}>
      <div>
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-dim)',
          marginBottom: '16px',
          paddingLeft: '12px'
        }}>
          Navigation
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: active ? '600' : '500',
                  color: active ? '#ffffff' : 'var(--text-muted)',
                  background: active ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(2, 132, 199, 0.1) 100%)' : 'transparent',
                  border: active ? '1px solid rgba(2, 132, 199, 0.4)' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={18} color={active ? '#38bdf8' : '#94a3b8'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div style={{
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        marginTop: '20px'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>
          Gujarat R&amp;B Portal v2.0
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          MERN Asset Tracking &amp; Citizen Redressal Architecture
        </div>
      </div>
    </aside>
  );
};
