import React, { useState, useEffect } from 'react';
import './RecommendationPage.css';
import { getLatestRecommendation, getRecommendations, getRecommendationById } from '../src/api.js';

const PAGE_SIZE = 5;

const RecommendationPage = ({ userName = '', token, onLogout, onBack }) => {
  const [latest, setLatest] = useState(null);
  const [previous, setPrevious] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
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
    } catch (err) {
      setError(err.message || 'Unable to load details');
    }
  };

  return (
    <div className="recommendation-shell">
      <header className="recommendation-topbar">
        <div className="recommendation-left-row">
          <button className="recommendation-back" type="button" onClick={onBack} aria-label="Go back">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="recommendation-brand-row">
            <div className="recommendation-logo" aria-hidden="true">📌</div>
            <div>
              <p className="recommendation-brand-title">MediGuide</p>
            </div>
          </div>
        </div>

        <div className="recommendation-actions">
          <div className="recommendation-user-pill">Welcome, {userName}</div>
          <button className="recommendation-logout" type="button" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="recommendation-main">
        <section className="recommendation-hero">
          <div className="recommendation-hero-icon" aria-hidden="true">📋</div>
          <h1>Recommendations</h1>
          <p>AI-powered suggestions based on your symptoms</p>
        </section>

        {error && <div className="recommendation-error">{error}</div>}
        {loading && <div className="recommendation-loading">Loading recommendations…</div>}

        {latest && (
          <section className="recommendation-card latest-card">
            <div className="latest-header">
              <span className="latest-badge">Latest Recommendation</span>
              <span className="latest-timestamp">{new Date(latest.createdAt).toLocaleString()}</span>
            </div>
            <div className="latest-row">
              <div className="latest-content">
                <div className="latest-icon" aria-hidden="true">🩺</div>
                <div className="latest-body">
                  <p className="latest-label">Possible Condition</p>
                  <h2>{latest.predictedDisease}</h2>
                  <p>Specialist: {latest.specialist || 'N/A'}</p>
                </div>
              </div>
              <button className="latest-action" type="button" onClick={() => handleViewDetails(latest.id)}>
                View Details →
              </button>
            </div>
          </section>
        )}

        {selectedRecommendation && (
          <section className="recommendation-card detail-card">
            <div className="detail-header">
              <h3>Recommendation Details</h3>
              <button type="button" onClick={() => setSelectedRecommendation(null)}>Close</button>
            </div>
            <p><strong>Condition:</strong> {selectedRecommendation.predictedDisease}</p>
            <p><strong>Specialist:</strong> {selectedRecommendation.specialist || 'N/A'}</p>
            <p><strong>Tests:</strong> {selectedRecommendation.diagnosticTests?.join(', ') || 'N/A'}</p>
            <p><strong>Hospitals:</strong> {selectedRecommendation.hospitals?.join(', ') || 'N/A'}</p>
            <p><strong>Precautions:</strong> {selectedRecommendation.precautions?.join(', ') || 'N/A'}</p>
          </section>
        )}

        <section className="recommendation-card previous-card">
          <div className="previous-header">
            <h3>Previous Recommendations</h3>
          </div>
          <div className="previous-list">
            {previous.length === 0 && !loading && (
              <div className="recommendation-empty">No previous recommendations found.</div>
            )}
            {previous.map((item) => (
              <div key={item.id} className="previous-item">
                <div className="previous-icon" aria-hidden="true">✔️</div>
                <div className="previous-text">
                  <p>{item.predictedDisease}</p>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <button type="button" className="previous-action" onClick={() => handleViewDetails(item.id)}>
                  View
                </button>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="recommendation-pagination">
              <button type="button" className="rec-page-btn" disabled={page === 0} onClick={() => loadPrevious(page - 1)}>← Prev</button>
              <span>Page {page + 1} of {totalPages}</span>
              <button type="button" className="rec-page-btn" disabled={page >= totalPages - 1} onClick={() => loadPrevious(page + 1)}>Next →</button>
            </div>
          )}
        </section>

        <section className="recommendation-note">
          <p>Recommendations are generated using AI and are not a substitute for professional medical advice.</p>
          <a href="#" onClick={(e) => e.preventDefault()}>Consult a doctor for accurate diagnosis.</a>
        </section>
      </main>
    </div>
  );
};

export default RecommendationPage;
