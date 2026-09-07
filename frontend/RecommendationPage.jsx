import React, { useState, useEffect } from 'react';
import './RecommendationPage.css';
import { getLatestRecommendation, getRecommendations, getRecommendationById } from '../src/api.js';

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
        {latest && !selectedRecommendation && (
          <section className="latest-recommendation-card">
            <div className="latest-card-top">
              <div className="latest-card-tag">
                <span className="sparkle-dot"></span>
                <span>LATEST AI ASSESSMENT (k=3)</span>
              </div>
              <span className="latest-card-date">{new Date(latest.createdAt).toLocaleString()}</span>
            </div>

            <div className="latest-card-body">
              <div className="latest-condition-info">
                <span className={`triage-badge ${getTriageClass(latest.predictedDisease).badge}`}>
                  {getTriageClass(latest.predictedDisease).label}
                </span>
                <h2>{latest.predictedDisease}</h2>
                <p className="latest-specialist-text">
                  <strong>Primary Specialist:</strong> {latest.specialist || 'General Physician'}
                </p>

                {latest.topPredictions && latest.topPredictions.length > 1 && (
                  <div className="latest-diff-chips-row">
                    <span className="latest-diff-label">Top 3 Candidates:</span>
                    {latest.topPredictions.map((cand, idx) => (
                      <span key={idx} className="latest-diff-chip">
                        #{cand.rank || (idx + 1)} {cand.disease} ({Math.round((cand.confidenceScore || 0) * 100)}%)
                      </span>
                    ))}
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
        )}

        {/* ── Detailed Clinical Recommendation View ──────────────────────── */}
        {selectedRecommendation && activeDetailCand && (
          <section className="detail-recommendation-section">
            <div className="detail-header-card">
              <div>
                <span className="detail-tag">DETAILED CLINICAL CARE PATHWAY · TOP 3 CANDIDATE EVALUATION</span>
                <h2>{activeDetailCand.disease}</h2>
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
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`rec-cand-tab-btn ${isSel ? 'rec-cand-tab-btn--active' : ''}`}
                      onClick={() => setSelectedCandIdx(idx)}
                    >
                      <span>{rankMedals[idx] || `#${idx + 1}`} Rank {idx + 1}: <strong>{cand.disease}</strong></span>
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
                  <h3>Recommended Specialist</h3>
                </div>
                <div className="card-body">
                  <div className="specialist-badge">
                    <strong>{activeDetailCand.recommendedSpecialist || selectedRecommendation.specialist || 'General Practitioner'}</strong>
                    <span>Primary Medical Consultant</span>
                  </div>
                  <p className="card-note">Schedule a consultation for formal diagnostic validation and clinical prescription.</p>
                </div>
              </div>

              {/* Card 2: Diagnostic Tests */}
              <div className="clinical-card clinical-card--tests">
                <div className="card-header">
                  <span className="card-icon">🧪</span>
                  <h3>Diagnostic Lab Tests</h3>
                </div>
                <div className="card-body">
                  <div className="tests-chips-list">
                    {((activeDetailCand.recommendedTests && activeDetailCand.recommendedTests.length > 0)
                      ? activeDetailCand.recommendedTests
                      : selectedRecommendation.diagnosticTests
                    )?.map((t, idx) => (
                      <span key={idx} className="test-chip">
                        🔬 {t}
                      </span>
                    )) || (
                      <span className="test-chip">🔬 Routine Blood Panel / CBC</span>
                    )}
                  </div>
                  <p className="card-note">Standard diagnostic procedures recommended to confirm underlying clinical indicators.</p>
                </div>
              </div>

              {/* Card 3: Nearby Hospitals */}
              <div className="clinical-card clinical-card--hospitals">
                <div className="card-header">
                  <span className="card-icon">🏥</span>
                  <h3>Nearby Facilities & Hospitals</h3>
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
                  <h3>Precautions & Care Guidelines</h3>
                </div>
                <div className="card-body">
                  <div className="precautions-checklist">
                    {((activeDetailCand.precautions && activeDetailCand.precautions.length > 0)
                      ? activeDetailCand.precautions
                      : selectedRecommendation.precautions
                    )?.map((p, idx) => (
                      <div key={idx} className="precaution-item">
                        <span className="check-icon">✓</span>
                        <span>{p}</span>
                      </div>
                    )) || (
                      <div className="precaution-item">
                        <span className="check-icon">✓</span>
                        <span>Ensure proper hydration and adequate bed rest.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

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

            {previous.map((item) => (
              <div key={item.id} className="previous-card-item">
                <div className="previous-card-left">
                  <span className="previous-icon-badge">🩺</span>
                  <div>
                    <div className="previous-condition-row">
                      <h4>{item.predictedDisease}</h4>
                      <span className={`triage-badge-sm ${getTriageClass(item.predictedDisease).badge}`}>
                        {getTriageClass(item.predictedDisease).label.split(' ')[0]}
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
            ))}
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
