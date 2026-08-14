import React, { useState } from 'react';
import './HomePage.css';

const HomePage = ({ onSearch, onLogin, onRegister }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const sanitized = query.trim();

    if (sanitized && onSearch) {
      onSearch(sanitized);
    }
  };

  return (
    <div className="homepage-shell">
      <div className="background-blobs" aria-hidden="true">
        <div className="blob blob-top" />
        <div className="blob blob-bottom" />
      </div>
      <div className="background-grid" aria-hidden="true" />

      <main className="homepage">
        <nav className="topbar">
          <div className="brand">
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
            <span className="brand-wordmark">
              <span className="brand-medi">Medi</span>
              <span className="brand-guide">Guide</span>
            </span>
          </div>

          <div className="topbar-actions">
            <button className="nav-pill nav-pill--ghost" type="button" onClick={onLogin}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 20C5.8 16.8 8.6 14.8 12 14.8C15.4 14.8 18.2 16.8 19 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>Login</span>
            </button>
            <button className="nav-pill nav-pill--ghost" type="button" onClick={onRegister}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5V19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M5 12H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M8 8.5C8 7.11929 9.11929 6 10.5 6H13.5C14.8807 6 16 7.11929 16 8.5V9.5C16 10.8807 14.8807 12 13.5 12H10.5C9.11929 12 8 10.8807 8 9.5V8.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>Register</span>
            </button>
          </div>
        </nav>

        <section className="hero">
          <div className="hero-icon" aria-hidden="true">
            <svg viewBox="0 0 96 96" fill="none">
              <path d="M48 15C37.5 15 30 22.3 30 33V37.5C30 43.6 34.4 48 40.5 48H55.5C61.6 48 66 43.6 66 37.5V33C66 22.3 58.5 15 48 15Z" stroke="currentColor" strokeWidth="2.6" />
              <path d="M48 24V72" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M30 48H66" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="hero-title">
            <span className="hero-title-medi">Medi</span>
            <span className="hero-title-guide">Guide</span>
          </h1>

          <div className="pulse-line" aria-hidden="true">
            <svg viewBox="0 0 180 24" fill="none">
              <path d="M4 12C18 4 26 4 38 12C50 20 58 20 72 12C86 4 94 4 108 12C122 20 130 20 144 12C156 4 164 4 176 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>

          <p className="hero-subtitle hero-subtitle-main">AI-Powered Healthcare Guidance</p>
          <p className="hero-subtitle hero-subtitle-secondary">Smart symptoms analysis. Right recommendations. Better health.</p>

          <form className="search-bar" onSubmit={handleSubmit}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="5.4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M15 15L19 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Describe your symptoms..."
              aria-label="Describe your symptoms"
            />
            <button className="search-submit" type="submit" aria-label="Search symptoms">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>

          <div className="search-hint">
            <svg className="hint-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 4L13.9 8.1L18 10L13.9 11.9L12 16L10.1 11.9L6 10L10.1 8.1L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span>Example: Fever, cough, headache...</span>
          </div>
        </section>

        <div className="bottom-row" aria-hidden="true">
          <div className="decor decor-clipboard">
            <svg viewBox="0 0 84 84" fill="none">
              <rect x="22" y="16" width="40" height="52" rx="10" stroke="currentColor" strokeWidth="2.4" />
              <path d="M34 24H50" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M34 34H46" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M34 44H42" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M56 28L64 20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M64 20L66 22" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>

          <div className="decor decor-badge">
            <svg viewBox="0 0 72 72" fill="none">
              <path d="M36 8L50 14V31C50 43 44 54 36 60C28 54 22 43 22 31V14L36 8Z" stroke="currentColor" strokeWidth="2.4" />
              <path d="M29 35L34 40L43 31" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="decor decor-stethoscope">
            <svg viewBox="0 0 96 96" fill="none">
              <path d="M36 38V31C36 24.9 40.9 20 47 20C53.1 20 58 24.9 58 31V38" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M58 35C58 29.5 62.5 25 68 25C73.5 25 78 29.5 78 35V39" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M35 40C35 48.8 27.8 56 19 56C10.2 56 3 48.8 3 40" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M35 40C35 31.2 42.2 24 51 24H57" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M58 44H76" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M70 38L76 44L70 50" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
