import React, { useState, useEffect } from 'react';
import './HistoryPage.css';
import { getHistory, deleteHistory, getHistoryDetail } from '../src/api.js';

const PAGE_SIZE = 5;

const HistoryPage = ({ userName = '', token, onLogout, onBack }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadHistory = async (p = 0) => {
    setLoading(true);
    setError('');
    try {
      const data = await getHistory(token, p, PAGE_SIZE);
      setHistoryItems(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(p);
    } catch (err) {
      setError(err.message || 'Unable to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    setDetailLoading(true);
    try {
      const data = await getHistoryDetail(token, id);
      setDetail(data);
    } catch (err) {
      setError(err.message || 'Unable to load details');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadHistory(0);
  }, [token]);

  return (
    <div className="history-shell">
      <header className="history-topbar">
        <div className="history-brand-row">
          <button className="history-back" type="button" onClick={onBack} aria-label="Go back">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="history-brand">
            <div className="history-logo" aria-hidden="true">♥</div>
            <div>
              <p className="history-logo-title">MediGuide</p>
            </div>
          </div>
        </div>
        <div className="history-user-row">
          <div className="history-user-pill">Welcome, {userName}</div>
          <button className="history-logout" type="button" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="history-main">
        <section className="history-hero">
          <div className="history-hero-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 6V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 12A8 8 0 1 1 12 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1>Search History</h1>
          <p>View your previously searched symptoms and clinical recommendations</p>
        </section>

        {detail && (
          <div className="history-modal-overlay" onClick={() => setDetail(null)}>
            <div className="history-modal" onClick={(e) => e.stopPropagation()}>
              <div className="history-modal-header">
                <h3>Query Details</h3>
                <button type="button" className="history-modal-close" onClick={() => setDetail(null)} aria-label="Close modal">✕</button>
              </div>
              <div className="history-modal-body">
                <div className="modal-field-block">
                  <p className="history-modal-label">Symptoms Entered</p>
                  <p className="history-modal-value">{detail.rawText}</p>
                </div>

                {detail.extractedSymptoms?.length > 0 && (
                  <div className="modal-field-block">
                    <p className="history-modal-label">Extracted Symptoms</p>
                    <div className="symptom-tag-list">
                      {detail.extractedSymptoms.map((sym, i) => (
                        <span key={i} className="symptom-tag-chip">{sym}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="modal-row-grid">
                  {detail.predictedDisease && (
                    <div className="modal-field-block">
                      <p className="history-modal-label">Predicted Condition</p>
                      <p className="history-modal-value history-modal-disease">🩺 {detail.predictedDisease}</p>
                    </div>
                  )}
                  {detail.confidenceScore != null && (
                    <div className="modal-field-block">
                      <p className="history-modal-label">Confidence</p>
                      <span className="confidence-pill">{Math.round(detail.confidenceScore * 100)}%</span>
                    </div>
                  )}
                </div>

                <div className="modal-field-block">
                  <p className="history-modal-label">Date & Time</p>
                  <p className="history-modal-value">{new Date(detail.timestamp).toLocaleString()}</p>
                </div>

                {detail.recommendation && (
                  <>
                    <div className="modal-field-block">
                      <p className="history-modal-label">Recommended Specialist</p>
                      <p className="history-modal-value">👨‍⚕️ {detail.recommendation.specialist || 'General Physician'}</p>
                    </div>

                    <div className="modal-field-block">
                      <p className="history-modal-label">Recommended Tests</p>
                      <p className="history-modal-value">🧪 {detail.recommendation.diagnosticTests?.join(', ') || 'Clinical Evaluation'}</p>
                    </div>

                    <div className="modal-field-block">
                      <p className="history-modal-label">Precautions & Care</p>
                      <div className="precaution-list">
                        {detail.recommendation.precautions && detail.recommendation.precautions.length > 0 ? (
                          detail.recommendation.precautions.map((p, idx) => (
                            <div key={idx} className="precaution-item">
                              <span className="precaution-bullet">⚠️</span>
                              <span className="precaution-text">{p}</span>
                            </div>
                          ))
                        ) : (
                          <p className="history-modal-value">Stay hydrated and consult a physician.</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <section className="history-card">
          <div className="history-card-header">
            <div>
              <h2>Recent Searches</h2>
            </div>
            <button className="history-clear" type="button" onClick={async () => {
              if (window.confirm('Clear all history items on this page?')) {
                try {
                  await Promise.all(historyItems.map((item) => deleteHistory(token, item.id)));
                  loadHistory(page);
                } catch (err) {
                  setError(err.message || 'Failed to clear history');
                }
              }
            }}>Clear All</button>
          </div>

          {loading && <div className="history-loading">Loading history…</div>}
          {error && <div className="history-error">{error}</div>}
          {!loading && historyItems.length === 0 && (
            <div className="history-empty-state">
              <div className="history-empty-icon" aria-hidden="true">📄</div>
              <div>
                <p>No history found</p>
                <span>Your previous searches will appear here.</span>
              </div>
            </div>
          )}

          <div className="history-list">
            {historyItems.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-item-left">
                  <div className="history-item-icon" aria-hidden="true">🔍</div>
                  <div>
                    <p>{item.rawText}</p>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                    {item.predictedDisease && <span className="history-item-disease"> · {item.predictedDisease}</span>}
                  </div>
                </div>
                <div className="history-item-actions">
                  <button type="button" className="history-view" onClick={() => handleViewDetail(item.id)} disabled={detailLoading}>
                    View
                  </button>
                  <button type="button" className="history-delete" onClick={async () => {
                    try {
                      await deleteHistory(token, item.id);
                      loadHistory(page);
                    } catch (err) {
                      setError(err.message || 'Failed to delete item');
                    }
                  }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="history-pagination">
              <button type="button" className="history-page-btn" disabled={page === 0} onClick={() => loadHistory(page - 1)}>← Prev</button>
              <span>Page {page + 1} of {totalPages}</span>
              <button type="button" className="history-page-btn" disabled={page >= totalPages - 1} onClick={() => loadHistory(page + 1)}>Next →</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HistoryPage;
