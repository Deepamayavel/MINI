import React, { useState } from 'react';
import './RegisterPage.css';
import { register } from '../src/api.js';
import doctorIllustration from '../src/login_doctor.jpg';

const RegisterPage = ({ onCreateAccount, onLoginClick }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: 'Weak', level: 1 };
    if (score === 2) return { label: 'Fair', level: 2 };
    if (score === 3) return { label: 'Good', level: 3 };
    return { label: 'Strong', level: 4 };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const auth = await register({ name: fullName, email, password });
      if (onCreateAccount) {
        onCreateAccount(auth);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-shell">
      <div className="register-grid">
        <section className="register-branding">
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

          <div className="register-hero">
            <div className="hero-illustration">
              <img className="register-illustration-photo" src={doctorIllustration} alt="Healthcare Assistance" />
              <div className="register-illustration-badge">
                <span className="badge-pulse" />
                <span>Join MediGuide Health Network</span>
              </div>
            </div>
          </div>

          <div className="register-copy">
            <h1>Create Your Account</h1>
            <p>Join MediGuide and take the first step towards better healthcare.</p>
          </div>
        </section>

        <section className="register-card">
          <div className="auth-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 20C5.8 16.8 8.6 14.8 12 14.8C15.4 14.8 18.2 16.8 19 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          <h2>Create Account</h2>
          <p className="auth-subtitle">Start your MediGuide journey with a secure account</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 20C5.8 16.8 8.6 14.8 12 14.8C15.4 14.8 18.2 16.8 19 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                aria-label="Full name"
              />
            </label>

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
                placeholder="Create a password"
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

            {strength && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className={`strength-bar strength-bar--${strength.level >= n ? strength.label.toLowerCase() : 'empty'}`}
                    />
                  ))}
                </div>
                <span className={`strength-label strength-label--${strength.label.toLowerCase()}`}>{strength.label}</span>
              </div>
            )}

            <label className="field">
              <span className="field-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="10" width="14" height="9" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8 10V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your password"
                aria-label="Confirm password"
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
              <span>{loading ? 'Creating account…' : 'Create Account'}</span>
            </button>
            {error && <div className="auth-error">{error}</div>}
          </form>

          <div className="login-link">
            Already have an account? <button type="button" onClick={onLoginClick}>Login</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RegisterPage;
