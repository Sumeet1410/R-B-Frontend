import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, ShieldAlert, Briefcase, Wrench, User, ArrowRight, Lock, Mail, Phone, MapPin } from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
  const { login, registerCitizen, setDemoUser } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Citizen registration form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    district: 'Ahmedabad'
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (onLoginSuccess) onLoginSuccess(res.user);
    } else {
      setError(res.message || 'Invalid email or password');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await registerCitizen(regData);
    setLoading(false);

    if (res.success) {
      if (onLoginSuccess) onLoginSuccess(res.user);
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  const handleAutoFill = (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Brand Emblem */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 25px rgba(2, 132, 199, 0.45)',
            marginBottom: '14px'
          }}>
            <Building2 size={36} />
          </div>
          <h1 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '4px' }}>
            Roads &amp; Buildings Department
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Government of Gujarat Infrastructure Asset Portal
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => { setIsRegisterMode(false); setError(''); }}
              style={{
                flex: 1,
                padding: '10px',
                background: 'none',
                border: 'none',
                borderBottom: !isRegisterMode ? '2px solid #0284c7' : '2px solid transparent',
                color: !isRegisterMode ? '#fff' : 'var(--text-dim)',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegisterMode(true); setError(''); }}
              style={{
                flex: 1,
                padding: '10px',
                background: 'none',
                border: 'none',
                borderBottom: isRegisterMode ? '2px solid #0284c7' : '2px solid transparent',
                color: isRegisterMode ? '#fff' : 'var(--text-dim)',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              Citizen Registration
            </button>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {!isRegisterMode ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Official or Citizen Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type="email"
                    required
                    placeholder="name@domain.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '0.95rem' }}
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            /* Citizen Registration Form */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Solanki"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    District
                  </label>
                  <select
                    value={regData.district}
                    onChange={(e) => setRegData({ ...regData, district: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Gandhinagar">Gandhinagar</option>
                    <option value="Rajkot">Rajkot</option>
                    <option value="Surat">Surat</option>
                    <option value="Vadodara">Vadodara</option>
                    <option value="Bhavnagar">Bhavnagar</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-emerald"
                style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '0.95rem' }}
              >
                {loading ? 'Creating Account...' : 'Register Citizen Account'} <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Strict Authentication Credentials Quick-Fill Section */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textAlign: 'center', marginBottom: '10px', letterSpacing: '0.06em' }}>
              REGISTERED ACCOUNTS (CLICK TO AUTO-FILL &amp; SIGN IN)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => handleAutoFill('admin@rnb.gujarat.gov.in', 'Admin@123')}
                className="btn btn-secondary"
                style={{ fontSize: '0.76rem', padding: '8px 10px', justifyContent: 'flex-start' }}
              >
                <ShieldAlert size={14} color="#8b5cf6" /> Super Admin
              </button>

              <button
                type="button"
                onClick={() => handleAutoFill('officer.ahm@rnb.gujarat.gov.in', 'Officer@123')}
                className="btn btn-secondary"
                style={{ fontSize: '0.76rem', padding: '8px 10px', justifyContent: 'flex-start' }}
              >
                <Briefcase size={14} color="#10b981" /> Officer (Ahmedabad)
              </button>

              <button
                type="button"
                onClick={() => handleAutoFill('engineer.patel@rnb.gujarat.gov.in', 'Engineer@123')}
                className="btn btn-secondary"
                style={{ fontSize: '0.76rem', padding: '8px 10px', justifyContent: 'flex-start' }}
              >
                <Wrench size={14} color="#f59e0b" /> Field Engineer
              </button>

              <button
                type="button"
                onClick={() => handleAutoFill('contact@lntinfrastructure.com', 'Contractor@123')}
                className="btn btn-secondary"
                style={{ fontSize: '0.76rem', padding: '8px 10px', justifyContent: 'flex-start' }}
              >
                <Building2 size={14} color="#06b6d4" /> Contractor (L&amp;T)
              </button>

              <button
                type="button"
                onClick={() => handleAutoFill('rajesh.citizen@gmail.com', 'Citizen@123')}
                className="btn btn-secondary"
                style={{ fontSize: '0.76rem', padding: '8px 10px', justifyContent: 'flex-start', gridColumn: 'span 2' }}
              >
                <User size={14} color="#38bdf8" /> Citizen (Rajesh Solanki)
              </button>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              Password schema: <code style={{ color: '#38bdf8' }}>[Role]@123</code> (e.g. <strong style={{ color: '#fff' }}>Admin@123</strong>, <strong style={{ color: '#fff' }}>Officer@123</strong>, <strong style={{ color: '#fff' }}>Citizen@123</strong>)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
