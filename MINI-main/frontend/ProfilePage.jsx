import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { getDashboardSummary } from '../src/api.js';

const ProfilePage = ({
  userName = 'User',
  userEmail,
  token,
  onLogout,
  onBack,
  onUpdateUserName,
  onSearchClick,
  onHistoryClick,
  onRecommendationsClick,
}) => {
  const [summary, setSummary] = useState({ totalSearches: 0, totalRecommendations: 0, lastSearchDate: null });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(userName || '');
  const [nameSavedNotice, setNameSavedNotice] = useState(false);

  // Health Profile / BMI state
  const savedVitals = JSON.parse(localStorage.getItem('mediguide_vitals') || 'null');
  const [height, setHeight] = useState(savedVitals?.height || '');
  const [weight, setWeight] = useState(savedVitals?.weight || '');
  const [bloodGroup, setBloodGroup] = useState(savedVitals?.bloodGroup || 'O+');
  const [bmiResult, setBmiResult] = useState(savedVitals?.bmiResult || null);
  const [vitalsSaved, setVitalsSaved] = useState(false);

  const displayEmail = userEmail || (userName.includes('@') ? userName : `${userName.toLowerCase().replace(/\s+/g, '')}@gmail.com`);

  useEffect(() => {
    if (token) {
      getDashboardSummary(token)
        .then((data) => {
          if (data) setSummary(data);
        })
        .catch((err) => console.warn('Could not load summary:', err));
    }
  }, [token]);

  const handleSaveName = (e) => {
    e.preventDefault();
    const trimmed = editName.trim();
    if (trimmed && onUpdateUserName) {
      onUpdateUserName(trimmed);
      setIsEditingName(false);
      setNameSavedNotice(true);
      setTimeout(() => setNameSavedNotice(false), 3000);
    }
  };

  const calculateAndSaveBmi = (e) => {
    e.preventDefault();
    const h = Number(height) / 100;
    const w = Number(weight);
    if (!h || !w || h <= 0 || w <= 0) return;

    const bmi = (w / (h * h)).toFixed(1);
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

    const result = { value: bmi, category, badgeClass };
    setBmiResult(result);

    localStorage.setItem(
      'mediguide_vitals',
      JSON.stringify({ height, weight, bloodGroup, bmiResult: result })
    );

    setVitalsSaved(true);
    setTimeout(() => setVitalsSaved(false), 3000);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="profile-shell">
      {/* ── Top Navigation Bar ───────────────────────────────────────────── */}
      <header className="profile-header">
        <div className="profile-brand-wrap">
          <button className="profile-back-btn" type="button" onClick={onBack} aria-label="Go back to dashboard">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <div className="profile-brand-badge">
            <div className="profile-brand-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none">
                <path d="M32 10C24.268 10 18 16.268 18 24V28.5C18 33.747 22.253 38 27.5 38H36.5C41.747 38 46 33.747 46 28.5V24C46 16.268 39.732 10 32 10Z" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M32 19V45" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M18 31H46" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
              </svg>
            </div>
            <span className="profile-brand-name">MediGuide</span>
          </div>
        </div>

        <div className="profile-top-actions">
          <button className="profile-btn-ghost" type="button" onClick={onBack}>
            🏠 Dashboard
          </button>
          <button className="profile-btn-logout" type="button" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="profile-main">
        {/* ── User Identity Hero Card ─────────────────────────────────────── */}
        <section className="profile-identity-card">
          <div className="profile-identity-left">
            <div className="profile-avatar-circle">
              <span>{getInitials(userName)}</span>
            </div>
            <div className="profile-identity-details">
              <div className="profile-name-row">
                {!isEditingName ? (
                  <>
                    <h2>{userName || 'User'}</h2>
                    <button
                      className="profile-edit-btn"
                      type="button"
                      onClick={() => {
                        setEditName(userName);
                        setIsEditingName(true);
                      }}
                      title="Edit Display Name"
                    >
                      ✏️ Edit Name
                    </button>
                  </>
                ) : (
                  <form className="profile-name-form" onSubmit={handleSaveName}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      required
                    />
                    <button className="profile-save-btn" type="submit">Save</button>
                    <button
                      className="profile-cancel-btn"
                      type="button"
                      onClick={() => setIsEditingName(false)}
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>

              <p className="profile-email-line">{displayEmail}</p>

              <div className="profile-tags-row">
                <span className="profile-pill profile-pill--verified">🛡️ Verified Patient</span>
                <span className="profile-pill profile-pill--role">AI Health Active</span>
              </div>

              {nameSavedNotice && <p className="profile-success-notice">✅ Name updated successfully!</p>}
            </div>
          </div>
        </section>

        {/* ── 2-Column Clinical Grid ───────────────────────────────────────── */}
        <section className="profile-grid">
          {/* Health Activity & Quick Navigation */}
          <div className="profile-panel profile-activity-panel">
            <div className="panel-title-row">
              <span className="panel-icon">📊</span>
              <div>
                <h3>Health Activity & Analytics</h3>
                <span className="panel-sub">Your personal diagnostic metrics</span>
              </div>
            </div>

            <div className="activity-stats-row">
              <div className="activity-stat-box">
                <span className="activity-stat-icon">🔍</span>
                <div>
                  <h4 className="activity-stat-num">{summary.totalSearches || 0}</h4>
                  <p className="activity-stat-lbl">Symptom Searches</p>
                </div>
              </div>

              <div className="activity-stat-box">
                <span className="activity-stat-icon">🩺</span>
                <div>
                  <h4 className="activity-stat-num">{summary.totalRecommendations || 0}</h4>
                  <p className="activity-stat-lbl">Recommendations</p>
                </div>
              </div>
            </div>

            <div className="profile-quick-nav">
              <p className="quick-nav-label">Quick Actions:</p>
              <div className="quick-nav-buttons">
                <button className="profile-nav-action-btn" type="button" onClick={onSearchClick}>
                  <span>🔍 New Symptom Search</span>
                  <span className="arrow">→</span>
                </button>
                <button className="profile-nav-action-btn" type="button" onClick={onHistoryClick}>
                  <span>🕘 Search History</span>
                  <span className="arrow">→</span>
                </button>
                <button className="profile-nav-action-btn" type="button" onClick={onRecommendationsClick}>
                  <span>📌 Clinical Recommendations</span>
                  <span className="arrow">→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Personal Vitals & BMI Calculator */}
          <div className="profile-panel profile-vitals-panel">
            <div className="panel-title-row">
              <span className="panel-icon">🩺</span>
              <div>
                <h3>Personal Health Metrics</h3>
                <span className="panel-sub">Vitals & Body Mass Index (BMI)</span>
              </div>
            </div>

            <form className="profile-vitals-form" onSubmit={calculateAndSaveBmi}>
              <div className="vitals-inputs-row">
                <label className="vitals-field">
                  <span>Height (cm)</span>
                  <input
                    type="number"
                    min="50"
                    max="250"
                    placeholder="e.g. 172"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    required
                  />
                </label>

                <label className="vitals-field">
                  <span>Weight (kg)</span>
                  <input
                    type="number"
                    min="20"
                    max="300"
                    placeholder="e.g. 68"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                  />
                </label>

                <label className="vitals-field">
                  <span>Blood Group</span>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </label>
              </div>

              <button className="profile-save-vitals-btn" type="submit">
                💾 Save & Calculate BMI
              </button>
            </form>

            {bmiResult && (
              <div className="profile-bmi-result-card">
                <div className="profile-bmi-val-wrap">
                  <span className="profile-bmi-val">{bmiResult.value}</span>
                  <span className="profile-bmi-tag">BMI Score</span>
                </div>
                <div className="profile-bmi-info-wrap">
                  <span className={`profile-bmi-badge ${bmiResult.badgeClass || 'bmi-cat--normal'}`}>
                    {bmiResult.category}
                  </span>
                  <p className="profile-bmi-advice">
                    {bmiResult.category === 'Healthy weight'
                      ? 'Optimal BMI: Continue your balanced nutrition and daily physical routine.'
                      : bmiResult.category === 'Underweight'
                      ? 'Underweight: Consider consulting a clinical dietitian to build healthy muscle mass.'
                      : 'Elevated BMI: Regular cardiovascular exercise and reduced refined sugars are recommended.'}
                  </p>
                </div>
              </div>
            )}

            {vitalsSaved && <p className="profile-success-notice">✅ Health vitals saved successfully!</p>}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
