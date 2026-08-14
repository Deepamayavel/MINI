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
      setError(err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-shell">
      <div className="admin-grid">
        <div className="admin-hero">
          <div className="hero-pattern hero-pattern-top" />
          <div className="hero-pattern hero-pattern-bottom" />
          <div className="hero-content">
            <div className="brand-row">
              <div className="brand-icon" aria-hidden="true">
                <svg viewBox="0 0 64 64" fill="none">
                  <path
                    d="M32 10C24.268 10 18 16.268 18 24V28.5C18 33.747 22.253 38 27.5 38H36.5C41.747 38 46 33.747 46 28.5V24C46 16.268 39.732 10 32 10Z"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  <path d="M32 18V46" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M18 32H46" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="brand-wordmark">
                <span className="brand-medi">Medi</span>
                <span className="brand-guide">Guide</span>
              </div>
            </div>
            <p className="admin-subtitle">Administrator Access</p>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="2" />
              <path d="M16 11.5C18.4853 11.5 20.5 13.5147 20.5 16C20.5 18.4853 18.4853 20.5 16 20.5C13.5147 20.5 11.5 18.4853 11.5 16C11.5 13.5147 13.5147 11.5 16 11.5Z" fill="white" />
              <path d="M16 12.5V19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M12.5 16H19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2>Admin Login</h2>
          <p className="admin-caption">Secure access to the MediGuide Admin Panel</p>

          <form className="admin-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 7.5C4 6.11929 5.11929 5 6.5 5H17.5C18.8807 5 20 6.11929 20 7.5V16.5C20 17.8807 18.8807 19 17.5 19H6.5C5.11929 19 4 17.8807 4 16.5V7.5Z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M4 8L10.8 12.2C11.5 12.7 12.5 12.7 13.2 12.2L20 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter admin email"
                aria-label="Admin email"
              />
            </label>

            <label className="field">
              <span className="field-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="10" width="14" height="9" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8 10V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                aria-label="Admin password"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 12C4 12 7 7 12 7C17 7 20 12 20 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M4 12C4 12 7 17 12 17C17 17 20 12 20 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M10.6 10.6C10.2 11 10 11.5 10 12C10 13.1 10.9 14 12 14C12.5 14 13 13.8 13.4 13.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M9 5.5C9.9 5.2 10.9 5 12 5C17 5 20 10 20 10C19.7 10.7 19.3 11.4 18.8 12.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M6.2 6.2C4.7 7.4 3.4 9 2.4 10.3C2.2 10.6 2.2 11.1 2.4 11.4C3.4 12.8 5 14.7 7.1 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </label>

            <div className="action-row">
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button type="button" className="text-button">
                Forgot Password?
              </button>
            </div>

            <button className="admin-submit" type="submit" disabled={loading}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M11 10H13V16H11V10Z" fill="white" />
                <path d="M10 4H14V8H10V4Z" fill="white" />
                <path d="M12 1L5 5V10C5 14.4183 8.58172 18 13 18C17.4183 18 21 14.4183 21 10V5L14 1H12Z" stroke="white" strokeWidth="1.8" fill="none" />
              </svg>
              <span>{loading ? 'Logging in…' : 'Login to Admin Panel'}</span>
            </button>
            {error && <div className="auth-error">{error}</div>}
          </form>

          <div className="secure-area">
            <div className="secure-line" />
            <span>Secure Access</span>
            <div className="secure-line" />
          </div>
          <p className="secure-copy">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L4 6V11C4 15.4183 7.58172 19 12 19C16.4183 19 20 15.4183 20 11V6L12 2Z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M9 11.5C9 10.1193 10.1193 9 11.5 9C12.8807 9 14 10.1193 14 11.5C14 12.8807 12.8807 14 11.5 14C10.1193 14 9 12.8807 9 11.5Z" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            This is a restricted area. Unauthorized access is prohibited.
          </p>
          <button type="button" className="back-link" onClick={onBackToLogin}>
            Back to User Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
