import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { getHistory, getDashboardSummary } from '../src/api.js';

const HEALTH_TIPS = [
  { icon: '💧', title: 'Stay Hydrated', text: 'Drink at least 8 glasses of water daily to keep your body healthy and active.' },
  { icon: '🥦', title: 'Eat More Greens', text: 'Include leafy vegetables in every meal for essential vitamins and minerals.' },
  { icon: '🚶', title: 'Walk Daily', text: 'A 30-minute walk each day reduces the risk of heart disease and improves mood.' },
  { icon: '😴', title: 'Sleep Well', text: 'Aim for 7–9 hours of quality sleep each night to support immune function.' },
  { icon: '🧘', title: 'Manage Stress', text: 'Practice deep breathing or meditation for 10 minutes daily to reduce stress.' },
];

const DashboardPage = ({ userName, token, onLogout, onSearchClick, onVoiceSearchClick, onHistoryClick, onRecommendationsClick, onProfileClick }) => {
  const [recentSearches, setRecentSearches] = useState([]);
  const [summary, setSummary] = useState({ totalSearches: 0, totalRecommendations: 0, lastSearchDate: null });
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * HEALTH_TIPS.length));
  const [isBmiOpen, setIsBmiOpen] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiResult, setBmiResult] = useState(null);

  const calculateBmi = (event) => {
    event.preventDefault();
    const heightInMetres = Number(height) / 100;
    const weightInKg = Number(weight);

    if (!heightInMetres || !weightInKg || heightInMetres <= 0 || weightInKg <= 0) return;

    const bmi = weightInKg / (heightInMetres * heightInMetres);
    const category = bmi < 18.5 ? 'Underweight'
      : bmi < 25 ? 'Healthy weight'
        : bmi < 30 ? 'Overweight'
          : 'Obesity';
    setBmiResult({ value: bmi.toFixed(1), category });
  };

  useEffect(() => {
    if (!token) return;
    getHistory(token, 0, 3)
      .then((data) => setRecentSearches(data.content || []))
      .catch(() => {});
    getDashboardSummary(token)
      .then((data) => setSummary(data))
      .catch(() => {});
  }, [token]);

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <path d="M32 10C24.268 10 18 16.268 18 24V28.5C18 33.747 22.253 38 27.5 38H36.5C41.747 38 46 33.747 46 28.5V24C46 16.268 39.732 10 32 10Z" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M32 18V46" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M18 32H46" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="brand-name">MediGuide</p>
            <p className="brand-tagline">AI healthcare assistant</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item nav-item--active" type="button">
            <span className="nav-icon">🏠</span>
            Dashboard
          </button>
          <button className="nav-item" type="button" onClick={onSearchClick}>
            <span className="nav-icon">🔍</span>
            Search Symptoms
          </button>
          <button className="nav-item" type="button" onClick={onVoiceSearchClick}>
            <span className="nav-icon">🎙️</span>
            Voice Search
          </button>
          <button className="nav-item" type="button" onClick={onHistoryClick}>
            <span className="nav-icon">🕘</span>
            Search History
          </button>
          <button className="nav-item" type="button" onClick={onRecommendationsClick}>
            <span className="nav-icon">📌</span>
            Recommendations
          </button>
          <button className="nav-item" type="button" onClick={onProfileClick}>
            <span className="nav-icon">👤</span>
            Profile
          </button>
          <button className="nav-item nav-item--logout" type="button" onClick={onLogout}>
            <span className="nav-icon">🔓</span>
            Logout
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-card">
            <div className="sidebar-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 8.5C5 6.57 6.57 5 8.5 5H15.5C17.43 5 19 6.57 19 8.5V16.5C19 18.43 17.43 20 15.5 20H8.5C6.57 20 5 18.43 5 16.5V8.5Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8.5 10.5C9.4 9.4 10.6 8.8 12 8.8C13.4 8.8 14.6 9.4 15.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M12 9.2V12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="sidebar-card-title">BMI Calculator</p>
              <p className="sidebar-card-text">Calculate your BMI and understand your weight category.</p>
            </div>
            {token && <button type="button" className="sidebar-card-button" onClick={() => setIsBmiOpen(true)}>Calculate BMI →</button>}
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-pretitle">Welcome back, <span>{userName}</span>! 👋</p>
            <h1>How can we help you today?</h1>
          </div>
          <div className="dashboard-header-actions">
            <button type="button" className="notification-button" aria-label="Notifications">
              🔔
            </button>
            <div className="profile-chip">
              <span>{userName ? userName.slice(0, 2).toUpperCase() : 'U'}</span>
              <div>
                <p>{userName}</p>
                <p>User</p>
              </div>
            </div>
          </div>
        </header>

        <section className="summary-stats">
          <div className="stat-card">
            <span className="stat-icon">🔍</span>
            <div>
              <p className="stat-value">{summary.totalSearches}</p>
              <p className="stat-label">Total Searches</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📋</span>
            <div>
              <p className="stat-value">{summary.totalRecommendations}</p>
              <p className="stat-label">Recommendations</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🕐</span>
            <div>
              <p className="stat-value">{summary.lastSearchDate ? new Date(summary.lastSearchDate).toLocaleDateString() : '—'}</p>
              <p className="stat-label">Last Search</p>
            </div>
          </div>
        </section>

        <section className="quick-actions">
          <article className="quick-card quick-card--green">
            <div className="quick-card-icon">🔍</div>
            <h2>Search Symptoms</h2>
            <p>Describe your symptoms in natural language</p>
            <button type="button" onClick={onSearchClick}>Start Search →</button>
          </article>
          <article className="quick-card quick-card--blue">
            <div className="quick-card-icon">🎙️</div>
            <h2>Voice Search</h2>
            <p>Speak your symptoms and get suggestions</p>
            <button type="button" onClick={onVoiceSearchClick}>Start Voice Search →</button>
          </article>
          <article className="quick-card quick-card--purple">
            <div className="quick-card-icon">🕘</div>
            <h2>Search History</h2>
            <p>View your previous searches</p>
            <button type="button" onClick={onHistoryClick}>View History →</button>
          </article>
          <article className="quick-card quick-card--orange">
            <div className="quick-card-icon">📋</div>
            <h2>Recommendations</h2>
            <p>Check your previous recommendations</p>
            <button type="button" onClick={onRecommendationsClick}>View Recommendations →</button>
          </article>
        </section>

        <section className="dashboard-grid">
          <div className="recent-card">
            <div className="section-title-row">
              <h3>Recent Searches</h3>
              <button type="button" onClick={onHistoryClick}>View All</button>
            </div>
            <div className="recent-list">
              {recentSearches.length === 0 && (
                <p style={{ color: '#888', fontSize: '0.9rem' }}>No recent searches yet.</p>
              )}
              {recentSearches.map((item) => (
                <div key={item.id} className="recent-item">
                  <div className="recent-meta">
                    <div className="recent-tag">🔍</div>
                    <div>
                      <p>{item.rawText}</p>
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-header">
              <div>
                <p className="tip-pretitle">Health Tip of the Day</p>
                <h3>{HEALTH_TIPS[tipIndex].title}</h3>
              </div>
              <div className="tip-icon">{HEALTH_TIPS[tipIndex].icon}</div>
            </div>
            <p>{HEALTH_TIPS[tipIndex].text}</p>
            <div className="tip-dots">
              {HEALTH_TIPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`tip-dot${i === tipIndex ? ' tip-dot--active' : ''}`}
                  onClick={() => setTipIndex(i)}
                  aria-label={`Tip ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-footer-card">
          <div>
            <p className="footer-title">MediGuide is here for you!</p>
            <p className="footer-copy">Get AI-powered healthcare guidance tailored to your symptoms.</p>
          </div>
          <button type="button" onClick={onSearchClick}>Start New Search →</button>
        </section>
      </main>

      {isBmiOpen && token && (
        <div className="bmi-modal-overlay" role="presentation" onMouseDown={() => setIsBmiOpen(false)}>
          <section className="bmi-modal" role="dialog" aria-modal="true" aria-labelledby="bmi-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="bmi-modal-header">
              <div>
                <p className="bmi-modal-pretitle">Health utility</p>
                <h2 id="bmi-modal-title">BMI Calculator</h2>
              </div>
              <button type="button" className="bmi-modal-close" onClick={() => setIsBmiOpen(false)} aria-label="Close BMI calculator">×</button>
            </div>
            <p className="bmi-modal-copy">Enter your height and weight to calculate your body mass index.</p>
            <form className="bmi-form" onSubmit={calculateBmi}>
              <label>
                <span>Height (cm)</span>
                <input type="number" min="1" step="0.1" value={height} onChange={(event) => setHeight(event.target.value)} placeholder="e.g. 170" required />
              </label>
              <label>
                <span>Weight (kg)</span>
                <input type="number" min="1" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="e.g. 65" required />
              </label>
              <button type="submit">Calculate BMI</button>
            </form>
            {bmiResult && (
              <div className="bmi-result" aria-live="polite">
                <span>Your BMI</span>
                <strong>{bmiResult.value}</strong>
                <p>{bmiResult.category}</p>
              </div>
            )}
            <p className="bmi-disclaimer">BMI is a screening measure and not a medical diagnosis. For personal health advice, speak with a qualified healthcare professional.</p>
          </section>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
