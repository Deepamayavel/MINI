import React, { useState, useEffect } from 'react';
import './RecommendationPage.css';
import { getLatestRecommendation, getRecommendations, getRecommendationById } from '../src/api.js';
import {
  SUPPORTED_LANGUAGES,
  detectInputLanguage,
  translateMedicalTerm,
  translateTriageLabel,
  getUILabels,
} from '../src/medicalTranslations.js';

const PAGE_SIZE = 6;

const RecommendationPage = ({ userName = '', token, onLogout, onBack }) => {
  const [latest, setLatest] = useState(null);
  const [previous, setPrevious] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [selectedCandIdx, setSelectedCandIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Language state: 'auto' or specific language code (e.g., 'ta', 'hi')
  const [langMode, setLangMode] = useState(() => {
    try {
      return localStorage.getItem('mediguide_user_lang') || 'auto';
    } catch {
      return 'auto';
    }
  });
  const [showInEnglish, setShowInEnglish] = useState(false);

  const getResolvedLang = (rec) => {
    if (langMode !== 'auto') return langMode;
    if (rec?.rawText) {
      const det = detectInputLanguage(rec.rawText, 'en-IN');
      if (det && !det.startsWith('en')) return det;
    }
    try {
      const saved = localStorage.getItem('mediguide_user_lang');
      if (saved && saved !== 'auto' && !saved.startsWith('en')) return saved;
    } catch {
      // ignore
    }
    return 'en-IN';
  };

  const loadPrevious = async (p = 0) => {
    try {
      const data = await getRecommendations(token, p, PAGE_SIZE);
      setPrevious(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(p);
    } catch (err) {
      setError(err.message || 'Unable to load recommendations');
    }
  };

  const loadRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const latestData = await getLatestRecommendation(token);
      setLatest(latestData);
    } catch {
      // no latest yet
    }
    await loadPrevious(0);
    setLoading(false);
  };

  useEffect(() => {
    if (token) loadRecommendations();
  }, [token]);

  const handleViewDetails = async (id) => {
    try {
      const recommendation = await getRecommendationById(token, id);
      setSelectedRecommendation(recommendation);
      setSelectedCandIdx(0);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Unable to load details');
    }
  };

  const getTriageClass = (disease = '') => {
    const text = disease.toLowerCase();
    if (text.includes('urgent') || text.includes('severe') || text.includes('emergency') || text.includes('stroke') || text.includes('heart') || text.includes('pneumonia') || text.includes('dengue')) {
      return { badge: 'triage-urgent', label: '🔴 Urgent Care Recommended' };
    }
    if (text.includes('bronchitis') || text.includes('migraine') || text.includes('infection') || text.includes('typhoid') || text.includes('jaundice')) {
      return { badge: 'triage-moderate', label: '🟡 Moderate Medical Attention' };
    }
    return { badge: 'triage-mild', label: '🟢 Routine / Primary Care' };
  };

  // Derive active candidate for detailed view
  const detailCands = selectedRecommendation?.topPredictions && selectedRecommendation.topPredictions.length > 0
    ? selectedRecommendation.topPredictions
    : selectedRecommendation ? [{
        disease: selectedRecommendation.predictedDisease,
        confidenceScore: 0.9,
        rank: 1,
        recommendedSpecialist: selectedRecommendation.specialist,
        recommendedTests: selectedRecommendation.diagnosticTests,
        recommendedHospitals: selectedRecommendation.hospitals,
        precautions: selectedRecommendation.precautions
      }] : [];

  const activeDetailCand = detailCands[selectedCandIdx] || detailCands[0] || (selectedRecommendation ? {
    disease: selectedRecommendation.predictedDisease,
    confidenceScore: 0.9,
    rank: 1,
    recommendedSpecialist: selectedRecommendation.specialist,
    recommendedTests: selectedRecommendation.diagnosticTests,
    recommendedHospitals: selectedRecommendation.hospitals,
    precautions: selectedRecommendation.precautions
  } : null);

  return (
    <div className="recommendation-shell">
      {/* ── Top Navigation Bar ───────────────────────────────────────────── */}
      <header className="recommendation-header">
        <div className="recommendation-brand-wrap">
          <button className="recommendation-back-btn" type="button" onClick={onBack} aria-label="Go back to dashboard">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Dashboard</span>
          </button>
          <div className="recommendation-brand-badge">
            <div className="recommendation-brand-icon" aria-hidden="true">📌</div>
            <span className="recommendation-brand-name">Clinical Recommendations</span>
          </div>
        </div>

        <div className="recommendation-top-actions">
          {/* Language Selector Dropdown */}
          <div className="rec-lang-pill">
            <span className="lang-icon" aria-hidden="true">🌐</span>
            <label htmlFor="rec-lang-select" className="rec-lang-label">Language:</label>
            <select
              id="rec-lang-select"
              className="rec-lang-select"
              value={langMode}
              onChange={(e) => {
                const val = e.target.value;
                setLangMode(val);
                setShowInEnglish(false);
                try {
                  localStorage.setItem('mediguide_user_lang', val);
                } catch {
                  // ignore
                }
              }}
            >
              <option value="auto">✨ User Input Language (Auto)</option>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.native} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Toggle: User Language vs English */}
          <button
            type="button"
            className={`rec-toggle-eng-btn ${showInEnglish ? 'rec-toggle-eng-btn--active' : ''}`}
            onClick={() => setShowInEnglish(!showInEnglish)}
            title="Toggle between User Input Language and English"
          >
            {showInEnglish ? '🌐 View in User Language' : '🔄 Show in English'}
          </button>

          <div className="recommendation-user-pill">
            <span>👤</span>
            <span>{userName}</span>
          </div>
          <button className="recommendation-btn-logout" type="button" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="recommendation-main">
        {/* Hero Title */}
        <section className="recommendation-hero-card">
          <div className="hero-pill-tag">
            <span>🧬</span> Apache Jena Knowledge Graph + Top-3 (k=3) Clinical Pathways
          </div>
          <h1>Clinical Care Recommendations</h1>
          <p>Verified medical specialists, diagnostic tests, healthcare facilities, and preventive guidelines based on your Top-3 symptom diagnoses.</p>
        </section>

        {error && <div className="recommendation-error-box">{error}</div>}
        {loading && <div className="recommendation-loading-box">🔄 Loading clinical pathways…</div>}

        {/* ── Latest Recommendation Hero Card ────────────────────────────── */}
        {latest && !selectedRecommendation && (() => {
          const latestLang = getResolvedLang(latest);
          const isLatestNonEng = latestLang && !latestLang.startsWith('en');
          const latestLangObj = SUPPORTED_LANGUAGES.find(l => l.code === latestLang || latestLang.startsWith(l.code)) || { native: 'User Language', name: 'User Language' };
          const localizedLatestDisease = (!showInEnglish && isLatestNonEng)
            ? translateMedicalTerm(latest.predictedDisease, latestLang)
            : latest.predictedDisease;
          const rawSpecialist = latest.specialist || 'General Physician';
          const localizedLatestSpecialist = (!showInEnglish && isLatestNonEng)
            ? translateMedicalTerm(rawSpecialist, latestLang)
            : rawSpecialist;
          const triageInfo = getTriageClass(latest.predictedDisease);
          const localizedTriageLabel = (!showInEnglish && isLatestNonEng)
            ? translateTriageLabel(triageInfo.label, latestLang)
            : triageInfo.label;
          const uiLatest = getUILabels(latestLang);

          return (
            <section className="latest-recommendation-card">
              <div className="latest-card-top">
                <div className="latest-card-tag">
                  <span className="sparkle-dot"></span>
                  <span>LATEST AI ASSESSMENT (k=3)</span>
                </div>
                {isLatestNonEng && (
                  <div className="latest-card-lang-indicator">
                    <span>{!showInEnglish ? `🌐 ${latestLangObj.native}` : '🇬🇧 English'}</span>
                  </div>
                )}
                <span className="latest-card-date">{new Date(latest.createdAt).toLocaleString()}</span>
              </div>

              <div className="latest-card-body">
                <div className="latest-condition-info">
                  <span className={`triage-badge ${triageInfo.badge}`}>
                    {localizedTriageLabel}
                  </span>
                  <h2>
                    {localizedLatestDisease}
                    {!showInEnglish && isLatestNonEng && localizedLatestDisease !== latest.predictedDisease && (
                      <span className="rec-disease-eng-badge">{latest.predictedDisease}</span>
                    )}
                  </h2>
                  <p className="latest-specialist-text">
                    <strong>{(!showInEnglish && isLatestNonEng && uiLatest?.specialistHeading) || 'Primary Specialist'}:</strong>{' '}
                    {localizedLatestSpecialist}
                    {!showInEnglish && isLatestNonEng && localizedLatestSpecialist !== rawSpecialist && (
                      <span className="rec-sub-eng"> ({rawSpecialist})</span>
                    )}
                  </p>

                  {latest.topPredictions && latest.topPredictions.length > 1 && (
                    <div className="latest-diff-chips-row">
                      <span className="latest-diff-label">
                        {(!showInEnglish && isLatestNonEng && uiLatest?.differentialHeader) || 'Top 3 Candidates:'}
                      </span>
                      {latest.topPredictions.map((cand, idx) => {
                        const locCand = (!showInEnglish && isLatestNonEng)
                          ? translateMedicalTerm(cand.disease, latestLang)
                          : cand.disease;
                        return (
                          <span key={idx} className="latest-diff-chip">
                            #{cand.rank || (idx + 1)} {locCand} ({Math.round((cand.confidenceScore || 0) * 100)}%)
                            {!showInEnglish && isLatestNonEng && locCand !== cand.disease && (
                              <span className="latest-diff-eng"> ({cand.disease})</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  className="latest-view-details-btn"
                  type="button"
                  onClick={() => handleViewDetails(latest.id)}
                >
                  <span>Explore Top-3 Care Plan</span>
                  <span className="arrow">→</span>
                </button>
              </div>
            </section>
          );
        })()}

        {/* ── Detailed Clinical Recommendation View ──────────────────────── */}
        {selectedRecommendation && activeDetailCand && (() => {
          const detailLang = getResolvedLang(selectedRecommendation);
          const isDetailNonEng = detailLang && !detailLang.startsWith('en');
          const detailLangObj = SUPPORTED_LANGUAGES.find(l => l.code === detailLang || detailLang.startsWith(l.code)) || { native: 'User Language', name: 'User Language' };
          const uiDetail = getUILabels(detailLang);

          const localizedDetailDisease = (!showInEnglish && isDetailNonEng)
            ? translateMedicalTerm(activeDetailCand.disease, detailLang)
            : activeDetailCand.disease;

          const rawSpecialist = activeDetailCand.recommendedSpecialist || selectedRecommendation.specialist || 'General Practitioner';
          const localizedSpecialist = (!showInEnglish && isDetailNonEng)
            ? translateMedicalTerm(rawSpecialist, detailLang)
            : rawSpecialist;

          return (
            <section className="detail-recommendation-section">
              {isDetailNonEng && (
                <div className="rec-detail-lang-banner">
                  <span className="rec-detail-lang-text">
                    🌐 <strong>{detailLangObj.native} ({detailLangObj.name})</strong> —{' '}
                    {showInEnglish
                      ? 'Viewing clinical pathway in English'
                      : `Displaying clinical care recommendations in ${detailLangObj.native}`}
                  </span>
                  <button
                    type="button"
                    className="rec-lang-toggle-btn"
                    onClick={() => setShowInEnglish(!showInEnglish)}
                  >
                    {showInEnglish
                      ? `🌐 View in ${detailLangObj.native}`
                      : '🔄 Show in English'}
                  </button>
                </div>
              )}

              <div className="detail-header-card">
                <div>
                  <span className="detail-tag">DETAILED CLINICAL CARE PATHWAY · TOP 3 CANDIDATE EVALUATION</span>
                  <h2>
                    {localizedDetailDisease}
                    {!showInEnglish && isDetailNonEng && localizedDetailDisease !== activeDetailCand.disease && (
                      <span className="rec-disease-eng-badge">{activeDetailCand.disease}</span>
                    )}
                  </h2>
                  <p className="detail-date">Analyzed on {new Date(selectedRecommendation.createdAt).toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  className="detail-close-btn"
                  onClick={() => setSelectedRecommendation(null)}
                >
                  ✕ Close Details
                </button>
              </div>

              {/* Candidate Selector Tabs if Top Predictions Exist */}
              {detailCands.length > 1 && (
                <div className="rec-cand-tabs-bar">
                  {detailCands.map((cand, idx) => {
                    const isSel = selectedCandIdx === idx;
                    const rankMedals = ['🥇', '🥈', '🥉'];
                    const locCand = (!showInEnglish && isDetailNonEng)
                      ? translateMedicalTerm(cand.disease, detailLang)
                      : cand.disease;
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`rec-cand-tab-btn ${isSel ? 'rec-cand-tab-btn--active' : ''}`}
                        onClick={() => setSelectedCandIdx(idx)}
                      >
                        <span>{rankMedals[idx] || `#${idx + 1}`} Rank {idx + 1}: <strong>{locCand}</strong></span>
                        {!showInEnglish && isDetailNonEng && locCand !== cand.disease && (
                          <span className="rec-tab-eng-sub">({cand.disease})</span>
                        )}
                        <span className="rec-cand-tab-score">{Math.round((cand.confidenceScore || 0) * 100)}%</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2x2 Clinical Cards Grid */}
              <div className="clinical-details-grid">
                {/* Card 1: Specialist */}
                <div className="clinical-card clinical-card--specialist">
                  <div className="card-header">
                    <span className="card-icon">👨‍⚕️</span>
                    <h3>{(!showInEnglish && isDetailNonEng && uiDetail?.specialistHeading) || 'Recommended Specialist'}</h3>
                  </div>
                  <div className="card-body">
                    <div className="specialist-badge">
                      <strong>{localizedSpecialist}</strong>
                      {!showInEnglish && isDetailNonEng && localizedSpecialist !== rawSpecialist && (
                        <span className="rec-sub-eng">({rawSpecialist})</span>
                      )}
                      <span>Primary Medical Consultant</span>
                    </div>
                    <p className="card-note">Schedule a consultation for formal diagnostic validation and clinical prescription.</p>
                  </div>
                </div>

                {/* Card 2: Diagnostic Tests */}
                <div className="clinical-card clinical-card--tests">
                  <div className="card-header">
                    <span className="card-icon">🧪</span>
                    <h3>{(!showInEnglish && isDetailNonEng && uiDetail?.diagnosticTests) || 'Diagnostic Lab Tests'}</h3>
                  </div>
                  <div className="card-body">
                    <div className="tests-chips-list">
                      {((activeDetailCand.recommendedTests && activeDetailCand.recommendedTests.length > 0)
                        ? activeDetailCand.recommendedTests
                        : selectedRecommendation.diagnosticTests
                      )?.map((t, idx) => {
                        const locTest = (!showInEnglish && isDetailNonEng) ? translateMedicalTerm(t, detailLang) : t;
                        return (
                          <span key={idx} className="test-chip">
                            🔬 {locTest}
                            {!showInEnglish && isDetailNonEng && locTest !== t && (
                              <span className="test-chip-eng"> ({t})</span>
                            )}
                          </span>
                        );
                      }) || (
                        <span className="test-chip">
                          🔬 {(!showInEnglish && isDetailNonEng) ? translateMedicalTerm('CBC (Complete Blood Count)', detailLang) : 'Routine Blood Panel / CBC'}
                        </span>
                      )}
                    </div>
                    <p className="card-note">Standard diagnostic procedures recommended to confirm underlying clinical indicators.</p>
                  </div>
                </div>

                {/* Card 3: Nearby Hospitals */}
                <div className="clinical-card clinical-card--hospitals">
                  <div className="card-header">
                    <span className="card-icon">🏥</span>
                    <h3>{(!showInEnglish && isDetailNonEng && uiDetail?.facilitiesHeading) || 'Nearby Facilities & Hospitals'}</h3>
                  </div>
                  <div className="card-body">
                    <div className="hospitals-chips-list">
                      {((activeDetailCand.recommendedHospitals && activeDetailCand.recommendedHospitals.length > 0)
                        ? activeDetailCand.recommendedHospitals
                        : selectedRecommendation.hospitals
                      )?.map((h, idx) => (
                        <a
                          key={idx}
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h + ' near me')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hospital-chip hospital-chip--link"
                          title="Click to view live directions on Google Maps"
                        >
                          📍 {h} <span className="chip-arrow">↗</span>
                        </a>
                      )) || (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Hospitals near me')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hospital-chip hospital-chip--link"
                        >
                          📍 Primary Health Centre / City Hospital <span className="chip-arrow">↗</span>
                        </a>
                      )}
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((activeDetailCand.recommendedSpecialist || selectedRecommendation.specialist || 'Hospital') + ' near me')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rec-maps-locate-btn"
                    >
                      🗺️ Find {activeDetailCand.recommendedSpecialist || selectedRecommendation.specialist || 'Hospitals'} Near Me on Google Maps →
                    </a>
                  </div>
                </div>

                {/* Card 4: Precautions & Self-Care */}
                <div className="clinical-card clinical-card--precautions">
                  <div className="card-header">
                    <span className="card-icon">🛡️</span>
                    <h3>{(!showInEnglish && isDetailNonEng && uiDetail?.precautions) || 'Precautions & Care Guidelines'}</h3>
                  </div>
                  <div className="card-body">
                    <div className="precautions-checklist">
                      {((activeDetailCand.precautions && activeDetailCand.precautions.length > 0)
                        ? activeDetailCand.precautions
                        : selectedRecommendation.precautions
                      )?.map((p, idx) => {
                        const locPrecaution = (!showInEnglish && isDetailNonEng) ? translateMedicalTerm(p, detailLang) : p;
                        return (
                          <div key={idx} className="precaution-item">
                            <span className="check-icon">✓</span>
                            <span>{locPrecaution}</span>
                          </div>
                        );
                      }) || (
                        <div className="precaution-item">
                          <span className="check-icon">✓</span>
                          <span>
                            {(!showInEnglish && isDetailNonEng)
                              ? translateMedicalTerm('Stay hydrated and monitor your temperature.', detailLang)
                              : 'Ensure proper hydration and adequate bed rest.'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ── Previous Recommendations History List ───────────────────────── */}
        <section className="previous-recommendations-section">
          <div className="section-title-row">
            <div>
              <h2>Past Recommendations Timeline</h2>
              <p>Review previous diagnostic assessments and specialist advice</p>
            </div>
          </div>

          <div className="previous-recommendations-list">
            {previous.length === 0 && !loading && (
              <div className="previous-empty-box">
                <span className="empty-icon">📌</span>
                <p>No previous clinical recommendations found in your record.</p>
              </div>
            )}

            {previous.map((item) => {
              const itemLang = getResolvedLang(item);
              const isItemNonEng = itemLang && !itemLang.startsWith('en');
              const localizedPrevDisease = (!showInEnglish && isItemNonEng)
                ? translateMedicalTerm(item.predictedDisease, itemLang)
                : item.predictedDisease;
              const triageInfo = getTriageClass(item.predictedDisease);
              const localizedTriage = (!showInEnglish && isItemNonEng)
                ? translateTriageLabel(triageInfo.label, itemLang)
                : triageInfo.label;

              return (
                <div key={item.id} className="previous-card-item">
                  <div className="previous-card-left">
                    <span className="previous-icon-badge">🩺</span>
                    <div>
                      <div className="previous-condition-row">
                        <h4>{localizedPrevDisease}</h4>
                        {!showInEnglish && isItemNonEng && localizedPrevDisease !== item.predictedDisease && (
                          <span className="rec-item-eng-sub">({item.predictedDisease})</span>
                        )}
                        <span className={`triage-badge-sm ${triageInfo.badge}`}>
                          {localizedTriage.split(' ')[0]}
                        </span>
                      </div>
                      <span className="previous-date-label">{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="previous-view-btn"
                    onClick={() => handleViewDetails(item.id)}
                  >
                    <span>View Details</span>
                    <span className="arrow">→</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="recommendations-pagination">
              <button
                type="button"
                className="page-btn"
                disabled={page <= 0}
                onClick={() => loadPrevious(page - 1)}
              >
                ← Previous
              </button>
              <span className="page-indicator">Page {page + 1} of {totalPages}</span>
              <button
                type="button"
                className="page-btn"
                disabled={page >= totalPages - 1}
                onClick={() => loadPrevious(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default RecommendationPage;
