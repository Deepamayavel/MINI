import React, { useState } from 'react';
import './LoginPage.css';
import { login } from '../src/api.js';

const LoginPage = ({ onLogin, onRegisterClick, onAdminLoginClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const auth = await login({ email, password });
      if (onLogin) {
        onLogin(auth);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-grid">
        <section className="login-branding">
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

          <div className="illustration-card" aria-hidden="true">
            <div className="heart-background" />
            <div className="illustration-glow" />
            <div className="illustration-plus">+</div>
            <svg className="ecg" viewBox="0 0 240 120" fill="none">
              <path d="M12 58H46L62 36L80 82L104 28L126 84L146 56L232 56" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="shield-icon">
              <svg viewBox="0 0 88 88" fill="none">
                <path d="M44 10L64 18V38C64 50 56 61 44 70C32 61 24 50 24 38V18L44 10Z" fill="url(#shieldGradient)" stroke="currentColor" strokeWidth="2.4" />
                <path d="M33 42L41 50L55 36" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="shieldGradient" x1="24" y1="10" x2="64" y2="70" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2ab25f" />
                    <stop offset="100%" stopColor="#0b6b3a" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="stethoscope-icon">
              <svg viewBox="0 0 160 140" fill="none">
                <path d="M56 56V44C56 35 62.8 28 71 28C79.2 28 86 35 86 44V56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M86 46C86 37 92.8 30 101 30C109.2 30 116 37 116 46V54" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M46 66C46 81 34.8 94 20 94" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M46 66C46 56 54 48 64 48H78" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M84 58H118" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M108 50L118 60L108 70" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="leaf leaf-left" />
            <div className="leaf leaf-right" />
          </div>

          <div className="tagline">
            <p>Smart symptoms analysis.</p>
            <p>Right recommendations. Better health.</p>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 20C5.8 16.8 8.6 14.8 12 14.8C15.4 14.8 18.2 16.8 19 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Login to continue to MediGuide</p>

          <form className="auth-form" onSubmit={handleSubmit}>
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
                placeholder="Enter your email"
                aria-label="Email"
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
                placeholder="Enter your password"
                aria-label="Password"
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

            <button className="primary-btn" type="submit" disabled={loading}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 20C5.8 16.8 8.6 14.8 12 14.8C15.4 14.8 18.2 16.8 19 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>{loading ? 'Logging in…' : 'Login'}</span>
            </button>
            {error && <div className="auth-error">{error}</div>}
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <button className="secondary-btn" type="button" onClick={onRegisterClick}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M12 9V15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Register</span>
          </button>

          <button className="tertiary-btn" type="button" onClick={onAdminLoginClick}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 4L16 6V11C16 14.3 14.2 17.2 12 18.5C9.8 17.2 8 14.3 8 11V6L12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.8 12.4L11 13.6L14.4 10.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 14L11.5 16.5L15 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Admin Login</span>
          </button>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
