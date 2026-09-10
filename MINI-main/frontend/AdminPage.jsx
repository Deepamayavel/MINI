import React, { useState } from 'react';
import './AdminPage.css';
import { adminLogin } from '../src/api.js';

const AdminPage = ({ onAdminLogin, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const auth = await adminLogin({ email, password, rememberMe: remember });
      if (onAdminLogin) {
        onAdminLogin(auth);
      }
    } catch (err) {
      setError(err.message || 'Invalid admin credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-shell">
      <div className="admin-login-container">
        {/* Glow backdrop decorative rings */}
        <div className="admin-glow-ring admin-glow-ring-1" aria-hidden="true" />
        <div className="admin-glow-ring admin-glow-ring-2" aria-hidden="true" />

        <div className="admin-login-card">
          {/* Card Header with Brand & Admin Badge */}
          <div className="admin-card-header">
            <div className="admin-brand-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V6L12 2Z" fill="url(#adminShieldGrad)" />
                <path d="M12 7V17M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="adminShieldGrad" x1="4" y1="2" x2="20" y2="23" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10b981" />
                    <stop offset="1" stopColor="#047857" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="admin-badge">ADMIN PORTAL</div>
            <h2>Admin Console</h2>
            <p className="admin-card-subtitle">Sign in to manage disease ontology & analytics</p>
          </div>

          {/* Form */}
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-field-group">
              <label className="admin-field-label" htmlFor="admin-email">Admin Email</label>
              <div className="admin-field-input-wrapper">
                <span className="admin-field-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 7.5C4 6.119 5.119 5 6.5 5H17.5C18.881 5 20 6.119 20 7.5V16.5C20 17.881 18.881 19 17.5 19H6.5C5.119 19 4 17.881 4 16.5V7.5Z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M4 8L10.8 12.2C11.5 12.7 12.5 12.7 13.2 12.2L20 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mediguide.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="admin-field-group">
              <label className="admin-field-label" htmlFor="admin-password">Password</label>
              <div className="admin-field-input-wrapper">
                <span className="admin-field-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M8 10V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M4 12C4 12 7 7 12 7C17 7 20 12 20 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M4 12C4 12 7 17 12 17C17 17 20 12 20 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M10.6 10.6C10.2 11 10 11.5 10 12C10 13.1 10.9 14 12 14C12.5 14 13 13.8 13.4 13.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M9 5.5C9.9 5.2 10.9 5 12 5C17 5 20 10 20 10C19.7 10.7 19.3 11.4 18.8 12.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="admin-options-row">
              <label className="admin-remember-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember session</span>
              </label>
              <span className="admin-default-hint" title="Default: admin@mediguide.com / Admin@1234">
                🔑 Admin Demo Credentials
              </span>
            </div>

            <button className="admin-login-submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="admin-btn-loader">Authenticating…</span>
              ) : (
                <>
                  <span>Sign in to Admin Console</span>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>

            {error && <div className="admin-error-box">⚠️ {error}</div>}
          </form>

          {/* Footer Security Note & Back Link */}
          <div className="admin-card-footer">
            <div className="admin-security-pill">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>Restricted Access · Encrypted Session</span>
            </div>
            <button type="button" className="admin-back-btn" onClick={onBackToLogin}>
              ← Back to Patient Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
