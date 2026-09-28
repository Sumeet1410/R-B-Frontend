import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  UserCircle, 
  LogOut, 
  ShieldAlert, 
  Briefcase, 
  Wrench, 
  User 
} from 'lucide-react';

export const Navbar = ({ currentTab, onSelectTab }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return <span className="badge badge-planning"><ShieldAlert size={12} /> Super Admin</span>;
      case 'regional_officer':
        return <span className="badge badge-active"><Briefcase size={12} /> Regional Officer</span>;
      case 'field_engineer':
        return <span className="badge badge-construction"><Wrench size={12} /> Field Engineer</span>;
      case 'organization':
        return <span className="badge badge-work_started"><Building2 size={12} /> Contractor</span>;
      case 'citizen':
        return <span className="badge badge-resolved"><User size={12} /> Citizen</span>;
      default:
        return <span className="badge badge-decommissioned">{role}</span>;
    }
  };

  return (
    <header style={{
      height: '68px',
      background: 'rgba(11, 17, 32, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Emblem */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 0 15px rgba(2, 132, 199, 0.4)'
        }}>
          <Building2 size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: '700', letterSpacing: '-0.02em', color: '#fff' }}>
              R&amp;B Gujarat
            </span>
            <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: '#cbd5e1' }}>
              INVENTORY &amp; GRIEVANCE
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Roads &amp; Buildings Department, Government of Gujarat
          </div>
        </div>
      </div>

      {/* Right User Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

        {/* User Info */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#f8fafc' }}>
                {user.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginTop: '2px' }}>
                {getRoleBadge(user.role)}
                {user.district && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    • {user.district}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ padding: '8px', borderRadius: '8px' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onSelectTab('login')}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            <UserCircle size={16} /> Login
          </button>
        )}
      </div>
    </header>
  );
};
