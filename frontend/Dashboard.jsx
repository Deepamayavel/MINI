import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { getHistory, getDashboardSummary } from '../src/api.js';

const HEALTH_TIPS = [
  { icon: '💧', category: 'Hydration', title: 'Optimal Daily Hydration', text: 'Drink at least 8–10 glasses of water daily to maintain cellular hydration, kidney function, and energy levels.' },
  { icon: '🥦', category: 'Nutrition', title: 'Antioxidant-Rich Diet', text: 'Incorporate dark leafy greens, berries, and colorful vegetables into your daily meals to strengthen your immune defenses.' },
  { icon: '🚶', category: 'Cardiovascular', title: 'Daily 30-Minute Brisk Walk', text: 'A daily 30-minute walk lowers systolic blood pressure, improves insulin sensitivity, and enhances cardiovascular longevity.' },
  { icon: '😴', category: 'Restoration', title: 'Quality Sleep Hygiene', text: 'Prioritize 7–9 hours of continuous sleep in a cool, dark room to facilitate tissue repair and neuro-cognitive recovery.' },
  { icon: '🧘', category: 'Mental Health', title: 'Mindfulness & Deep Breathing', text: 'Practice 10 minutes of box breathing or mindful meditation daily to reduce cortisol and chronic systemic inflammation.' },
  { icon: '👁️', category: 'Vision Health', title: 'The 20-20-20 Eye Rule', text: 'Every 20 minutes of screen time, look at an object 20 feet away for 20 seconds to prevent digital eye strain and fatigue.' },
  { icon: '🪑', category: 'Ergonomics', title: 'Ergonomic Spinal Alignment', text: 'Ensure your computer screen is at eye level and stand up every 45 minutes to protect your spine and posture.' },
  { icon: '☀️', category: 'Immunity', title: 'Natural Sunlight & Vitamin D', text: 'Spend 15–20 minutes in morning sunlight to stimulate natural Vitamin D3 synthesis and regulate your circadian rhythm.' },
  { icon: '🥗', category: 'Digestive', title: 'Gut Microbiome Support', text: 'Consume prebiotic fiber and fermented foods like yogurt to support beneficial gut flora and digestive health.' },
  { icon: '🧼', category: 'Prevention', title: 'Proper Hand Hygiene', text: 'Wash hands thoroughly with soap for at least 20 seconds before eating to prevent common viral and bacterial infections.' },
];

const getDailyTipIndex = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  return dayOfYear % HEALTH_TIPS.length;
};

const DashboardPage = ({ userName = 'User', userEmail, token, onLogout, onSearchClick, onVoiceSearchClick, onHistoryClick, onRecommendationsClick, onProfileClick }) => {
  const [recentSearches, setRecentSearches] = useState([]);
  const [summary, setSummary] = useState({ totalSearches: 0, totalRecommendations: 0, lastSearchDate: null });
  const [tipIndex, setTipIndex] = useState(getDailyTipIndex);
  const [isBmiOpen, setIsBmiOpen] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiResult, setBmiResult] = useState(null);

  const displayEmail = userEmail || (userName.includes('@') ? userName : `${userName.toLowerCase().replace(/\s+/g, '')}@gmail.com`);

  const calculateBmi = (event) => {
    if (event) event.preventDefault();
    const heightInMetres = Number(height) / 100;
    const weightInKg = Number(weight);

    if (!heightInMetres || !weightInKg || heightInMetres <= 0 || weightInKg <= 0) return;

    const bmi = weightInKg / (heightInMetres * heightInMetres);
    let category = 'Healthy weight';
    let badgeClass = 'bmi-cat--normal';

    if (bmi < 18.5) {
      category = 'Underweight';
      badgeClass = 'bmi-cat--under';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      badgeClass = 'bmi-cat--over';
    } else if (bmi >= 30) {
      category = 'Obesity (Consult a Doctor)';
      badgeClass = 'bmi-cat--obese';
    }

    setBmiResult({ value: bmi.toFixed(1), category, badgeClass });
  };

  useEffect(() => {
    if (!token) return;
    getHistory(token, 0, 4)
      .then((data) => setRecentSearches(data.content || []))
      .catch(() => {});
    getDashboardSummary(token)
      .then((data) => setSummary(data))
      .catch(() => {});
  }, [token]);

  return (
    <div className="dashboard-shell">
      {/* ── Left Sticky Sidebar ─────────────────────────────────────────── */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand-card">
          <div className="sidebar-brand-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <path d="M32 10C24.268 10 18 16.268 18 24V28.5C18 33.747 22.253 38 27.5 38H36.5C41.747 38 46 33.747 46 28.5V24C46 16.268 39.732 10 32 10Z" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M32 19V45" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M18 31H46" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="sidebar-brand-title">MediGuide</p>
            <span className="sidebar-brand-tag">Patient Portal</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          <button className="sidebar-nav-btn sidebar-nav-btn--active" type="button">
            <span className="sidebar-nav-icon">🏠</span>
            <span>Dashboard</span>
          </button>
          <button className="sidebar-nav-btn" type="button" onClick={onSearchClick}>
            <span className="sidebar-nav-icon">🔍</span>
            <span>Symptom Search</span>
          </button>
          <button className="sidebar-nav-btn" type="button" onClick={onRecommendationsClick}>
            <span className="sidebar-nav-icon">📌</span>
            <span>Recommendations</span>
          </button>
          <button className="sidebar-nav-btn" type="button" onClick={onHistoryClick}>
            <span className="sidebar-nav-icon">🕘</span>
            <span>Search History</span>
          </button>
          <button className="sidebar-nav-btn" type="button" onClick={onProfileClick}>
            <span className="sidebar-nav-icon">👤</span>
            <span>My Profile</span>
          </button>
        </nav>

        <button className="sidebar-logout-btn" type="button" onClick={onLogout}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Sign Out</span>
        </button>
      </aside>

      {/* ── Main Dashboard Content ──────────────────────────────────────── */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <div>
            <div className="dashboard-header-badge">
              <span className="live-sparkle">✨</span> AI Healthcare Assistant Online
            </div>
            <h1>Welcome back, {userName} 👋</h1>
            <p className="dashboard-header-sub">Track your symptoms, explore AI recommendations, and monitor wellness.</p>
          </div>

          <div className="dashboard-header-right">
            <div className="user-profile-badge">
              <div className="user-profile-avatar">
                {userName ? userName.slice(0, 1).toUpperCase() : 'U'}
              </div>
              <div className="user-profile-info">
                <p className="user-profile-name">{userName}</p>
                <span className="user-profile-email">{displayEmail}</span>
              </div>
            </div>
            <button className="header-logout-pill" type="button" onClick={onLogout} title="Sign Out">
              Logout
            </button>
          </div>
        </header>

        {/* Summary Stats Row */}
        <section className="summary-stats-grid">
          <div className="stat-card stat-card--searches">
            <div className="stat-icon-wrapper">🔍</div>
            <div className="stat-body">
              <span className="stat-label">TOTAL SEARCHES</span>
              <h2 className="stat-value">{summary.totalSearches}</h2>
              <span className="stat-meta">Recorded queries</span>
            </div>
          </div>

          <div className="stat-card stat-card--recommendations">
            <div className="stat-icon-wrapper">🩺</div>
            <div className="stat-body">
              <span className="stat-label">RECOMMENDATIONS</span>
              <h2 className="stat-value">{summary.totalRecommendations}</h2>
              <span className="stat-meta">Clinical care pathways</span>
            </div>
          </div>

          <div className="stat-card stat-card--activity">
            <div className="stat-icon-wrapper">🕒</div>
            <div className="stat-body">
              <span className="stat-label">LAST CHECKUP</span>
              <h2 className="stat-value-date">
                {summary.lastSearchDate ? new Date(summary.lastSearchDate).toLocaleDateString() : 'No searches yet'}
              </h2>
              <span className="stat-meta">Recent activity log</span>
            </div>
          </div>
        </section>

        {/* Primary Quick Actions Grid */}
        <section className="quick-actions-section">
          <div className="section-title-wrap">
            <h2>Quick Health Actions</h2>
            <p>Select a tool to begin symptom analysis, view recommendations, or calculate BMI</p>
          </div>

          <div className="quick-cards-grid">
            <article className="action-card action-card--search" onClick={onSearchClick}>
              <div className="action-card-header">
                <div className="action-icon-circle">🔍</div>
                <span className="action-tag">Voice & Text</span>
              </div>
              <h3>AI Symptom Search</h3>
              <p>Speak naturally in 9 native languages or type symptoms to receive AI diagnostic predictions.</p>
              <button type="button" className="action-link-btn">
                <span>Start Symptom Search</span>
                <span className="arrow">→</span>
              </button>
            </article>

            <article className="action-card action-card--recommendations" onClick={onRecommendationsClick}>
              <div className="action-card-header">
                <div className="action-icon-circle action-icon-circle--rec">🩺</div>
                <span className="action-tag action-tag--rec">Clinical Care</span>
              </div>
              <h3>Clinical Pathways</h3>
              <p>Explore recommended medical specialists, diagnostic tests, hospitals, and precautions.</p>
              <button type="button" className="action-link-btn">
                <span>View Care Advice</span>
                <span className="arrow">→</span>
              </button>
            </article>

            <article className="action-card action-card--vitals" onClick={() => setIsBmiOpen(true)}>
              <div className="action-card-header">
                <div className="action-icon-circle action-icon-circle--vitals">⚖️</div>
                <span className="action-tag action-tag--vitals">Health Metric</span>
              </div>
              <h3>BMI & Vitals Tracker</h3>
              <p>Calculate your Body Mass Index score and determine healthy weight categories in seconds.</p>
              <button type="button" className="action-link-btn">
                <span>Open Calculator</span>
                <span className="arrow">→</span>
              </button>
            </article>

            <article className="action-card action-card--history" onClick={onHistoryClick}>
              <div className="action-card-header">
                <div className="action-icon-circle action-icon-circle--history">🕘</div>
                <span className="action-tag action-tag--history">Timeline</span>
              </div>
              <h3>Search History</h3>
              <p>Review previously analyzed symptoms, confidence ratings, and recorded dates.</p>
              <button type="button" className="action-link-btn">
                <span>View Past History</span>
                <span className="arrow">→</span>
              </button>
            </article>
          </div>
        </section>

        {/* Two-Column Grid: Recent Searches + Health Tip of the Day */}
        <section className="dashboard-split-grid">
          {/* Recent Searches */}
          <div className="dashboard-panel recent-searches-panel">
            <div className="panel-header">
              <div className="panel-header-left">
                <span className="panel-icon">📋</span>
                <div>
                  <h3>Recent Searches</h3>
                  <span className="panel-sub">Your latest symptom assessments</span>
                </div>
              </div>
              <button type="button" className="panel-link-btn" onClick={onHistoryClick}>
                View All →
              </button>
            </div>

            <div className="recent-searches-list">
              {recentSearches.length === 0 ? (
                <div className="empty-recent-box">
                  <span className="empty-icon">🔍</span>
                  <p>No recent symptom searches recorded.</p>
                  <button type="button" className="empty-action-btn" onClick={onSearchClick}>
                    Analyze your first symptom →
                  </button>
                </div>
              ) : (
                recentSearches.map((item) => (
                  <div key={item.id} className="recent-search-row" onClick={onHistoryClick}>
                    <div className="recent-row-left">
                      <span className="recent-bullet-icon">🩺</span>
                      <div>
                        <p className="recent-query-text">"{item.rawText}"</p>
                        <span className="recent-date-text">{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    {item.predictedDisease && (
                      <span className="recent-condition-tag">
                        {item.predictedDisease}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily Health Tip Panel */}
          <div className="dashboard-panel daily-tip-panel">
            <div className="panel-header">
              <div className="panel-header-left">
                <span className="panel-icon">💡</span>
                <div className="tip-title-group">
                  <div className="tip-heading-row">
                    <h3>Health Insight of the Day</h3>
                    <span className="tip-counter-badge">Tip {tipIndex + 1} of {HEALTH_TIPS.length}</span>
                  </div>
                  <span className="panel-sub">Automatically refreshed daily · Preventive wellness</span>
                </div>
              </div>
            </div>

            <div className="tip-content-box">
              <div className="tip-top-meta">
                <span className="tip-category-pill">{HEALTH_TIPS[tipIndex].category}</span>
                <span className="tip-icon-large">{HEALTH_TIPS[tipIndex].icon}</span>
              </div>
              <h4 className="tip-headline">{HEALTH_TIPS[tipIndex].title}</h4>
              <p className="tip-body">{HEALTH_TIPS[tipIndex].text}</p>
            </div>

            <div className="tip-carousel-controls">
              <div className="tip-dots-row">
                {HEALTH_TIPS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`tip-dot-pill ${i === tipIndex ? 'tip-dot-pill--active' : ''}`}
                    onClick={() => setTipIndex(i)}
                    aria-label={`Select tip ${i + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                className="tip-next-btn"
                onClick={() => setTipIndex((tipIndex + 1) % HEALTH_TIPS.length)}
              >
                Next Tip →
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── BMI Calculator Modal ────────────────────────────────────────── */}
      {isBmiOpen && (
        <div className="bmi-modal-overlay" role="presentation" onMouseDown={() => setIsBmiOpen(false)}>
          <section className="bmi-modal-card" role="dialog" aria-modal="true" aria-labelledby="bmi-modal-title" onMouseDown={(e) => e.stopPropagation()}>
            <div className="bmi-modal-header">
              <div className="bmi-modal-header-left">
                <span className="bmi-icon">⚖️</span>
                <div>
                  <span className="bmi-sub-tag">HEALTH UTILITY</span>
                  <h2 id="bmi-modal-title">Body Mass Index (BMI) Calculator</h2>
                </div>
              </div>
              <button type="button" className="bmi-modal-close" onClick={() => setIsBmiOpen(false)} aria-label="Close BMI calculator">
                ✕
              </button>
            </div>

            <p className="bmi-modal-desc">
              Enter your height and weight to determine your Body Mass Index (BMI) and health category.
            </p>

            <form className="bmi-form" onSubmit={calculateBmi}>
              <div className="bmi-inputs-row">
                <label className="bmi-field">
                  <span>Height (in cm)</span>
                  <input
                    type="number"
                    min="50"
                    max="250"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 172"
                    required
                  />
                </label>

                <label className="bmi-field">
                  <span>Weight (in kg)</span>
                  <input
                    type="number"
                    min="20"
                    max="300"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 68"
                    required
                  />
                </label>
              </div>

              <button type="submit" className="bmi-calc-btn">
                ⚡ Calculate BMI Score
              </button>
            </form>

            {bmiResult && (
              <div className="bmi-result-card" aria-live="polite">
                <span className="bmi-result-label">YOUR CALCULATED BMI</span>
                <div className="bmi-score-number">{bmiResult.value}</div>
                <div className={`bmi-category-badge ${bmiResult.badgeClass}`}>
                  {bmiResult.category}
                </div>
              </div>
            )}

            <p className="bmi-disclaimer-text">
              *BMI is a general screening indicator and does not account for muscle mass or bone density. Speak to a doctor for personalized dietary advice.
            </p>
          </section>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
