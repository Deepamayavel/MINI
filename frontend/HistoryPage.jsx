import React, { useState, useEffect } from 'react';
import './HistoryPage.css';
import { getHistory, deleteHistory, getHistoryDetail } from '../src/api.js';
import {
  detectInputLanguage,
  translateMedicalTerm,
  translateTriageLabel,
  getUILabels,
  SUPPORTED_LANGUAGES,
} from '../src/medicalTranslations.js';

const PAGE_SIZE = 5;

const HistoryPage = ({ userName = '', token, onLogout, onBack }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [langMode, setLangMode] = useState(() => {
    try {
      return localStorage.getItem('mediguide_user_lang') || 'auto';
    } catch {
      return 'auto';
    }
  });
  const [showInEnglish, setShowInEnglish] = useState(false);

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

  const [modalCandIdx, setModalCandIdx] = useState(0);

  const handleViewDetail = async (id) => {
    setDetailLoading(true);
    try {
      const data = await getHistoryDetail(token, id);
      setDetail(data);
      setModalCandIdx(0);
    } catch (err) {
      setError(err.message || 'Unable to load details');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadHistory(0);
  }, [token]);

  const modalTopCands = detail?.topPredictions && detail.topPredictions.length > 0
    ? detail.topPredictions
    : detail?.recommendation?.topPredictions && detail.recommendation.topPredictions.length > 0
    ? detail.recommendation.topPredictions
    : detail ? [{
        disease: detail.predictedDisease,
        confidenceScore: detail.confidenceScore || 0.9,
        rank: 1,
        recommendedSpecialist: detail.recommendation?.specialist,
        recommendedTests: detail.recommendation?.diagnosticTests,
        recommendedHospitals: detail.recommendation?.hospitals,
        precautions: detail.recommendation?.precautions
      }] : [];

  const activeModalCand = modalTopCands[modalCandIdx] || modalTopCands[0] || (detail ? {
    disease: detail.predictedDisease,
    confidenceScore: detail.confidenceScore || 0.9,
    rank: 1,
    recommendedSpecialist: detail.recommendation?.specialist,
    recommendedTests: detail.recommendation?.diagnosticTests,
    recommendedHospitals: detail.recommendation?.hospitals,
    precautions: detail.recommendation?.precautions
  } : null);

  const getResolvedLang = (rawText = '') => {
    if (langMode !== 'auto') return langMode;
    const detected = detectInputLanguage(rawText, 'en-IN');
    if (detected && !detected.startsWith('en')) return detected;
    try {
      const saved = localStorage.getItem('mediguide_user_lang');
      if (saved && saved !== 'auto' && !saved.startsWith('en')) return saved;
    } catch {
      // ignore
    }
    return detected || 'en-IN';
  };

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
          <div className="history-lang-pill">
            <span className="lang-icon" aria-hidden="true">🌐</span>
            <label htmlFor="history-lang-select" className="history-lang-label">Language:</label>
            <select
              id="history-lang-select"
              className="history-lang-select"
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

          <button
            type="button"
            className={`history-toggle-eng-btn ${showInEnglish ? 'history-toggle-eng-btn--active' : ''}`}
            onClick={() => setShowInEnglish(!showInEnglish)}
            title="Toggle between User Input Language and English"
          >
            {showInEnglish ? '🌐 View in User Language' : '🔄 Show in English'}
          </button>

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
          <h1>Search & Diagnosis History</h1>
          <p>View your previously searched symptoms, Top-3 ($k=3$) differential diagnoses, and clinical recommendations in your input language.</p>
        </section>

        {detail && activeModalCand && (() => {
          const modalLang = getResolvedLang(detail.rawText);
          const isModalNonEng = modalLang && !modalLang.startsWith('en');
          const targetModalLang = showInEnglish ? 'en-IN' : modalLang;
          const uiModal = getUILabels(targetModalLang);

          const localizedModalDisease = (!showInEnglish && isModalNonEng)
            ? translateMedicalTerm(activeModalCand.disease, modalLang)
            : activeModalCand.disease;

          const localizedModalSpecialist = (!showInEnglish && isModalNonEng)
            ? translateMedicalTerm(activeModalCand.recommendedSpecialist || detail.recommendation?.specialist, modalLang)
            : (activeModalCand.recommendedSpecialist || detail.recommendation?.specialist || 'General Physician');

          const modalLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === modalLang) || SUPPORTED_LANGUAGES[0];

          return (
            <div className="history-modal-overlay" onClick={() => setDetail(null)}>
              <div className="history-modal" onClick={(e) => e.stopPropagation()}>
                <div className="history-modal-header">
                  <div>
                    <h3>{uiModal?.activeClinicalAssessment || 'Query Assessment Details'}</h3>
                    <span className="history-modal-subtag">
                      {uiModal?.knnClassification || 'k=3 Clinical Differential Diagnosis'}
                    </span>
                  </div>
                  <button type="button" className="history-modal-close" onClick={() => setDetail(null)} aria-label="Close modal">✕</button>
                </div>

                <div className="history-modal-body">
                  {/* Modal Language Notice & Toggle */}
                  {isModalNonEng && (
                    <div className="history-modal-lang-banner">
                      <div className="modal-lang-info">
                        <span>🌐</span>
                        <span>
                          {showInEnglish
                            ? 'Viewing assessment in standard English terminology.'
                            : `Results presented in User Input Language: ${modalLangObj.native} (${modalLangObj.name})`}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="modal-lang-toggle-btn"
                        onClick={() => setShowInEnglish(!showInEnglish)}
                      >
                        {showInEnglish
                          ? `🌐 View in ${modalLangObj.native}`
                          : '🔄 Show in English'}
                      </button>
                    </div>
                  )}

                  <div className="modal-field-block">
                    <p className="history-modal-label">Symptoms Entered</p>
                    <p className="history-modal-value">{detail.rawText}</p>
                  </div>

                  {detail.extractedSymptoms?.length > 0 && (
                    <div className="modal-field-block">
                      <p className="history-modal-label">Extracted Symptom Vectors</p>
                      <div className="symptom-tag-list">
                        {detail.extractedSymptoms.map((sym, i) => (
                          <span key={i} className="symptom-tag-chip">{sym}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top 3 Differential Candidates Selector in Modal */}
                  {modalTopCands.length > 1 && (
                    <div className="modal-field-block">
                      <p className="history-modal-label">
                        {uiModal?.differentialHeader || 'Top 3 Differential Conditions (k=3):'}
                      </p>
                      <div className="modal-cand-chips-grid">
                        {modalTopCands.map((cand, idx) => {
                          const isSel = modalCandIdx === idx;
                          const rankMedals = ['🥇', '🥈', '🥉'];
                          const matchPct = Math.round((cand.confidenceScore || 0) * 100);
                          const localizedCand = (!showInEnglish && isModalNonEng)
                            ? translateMedicalTerm(cand.disease, modalLang)
                            : cand.disease;
                          return (
                            <button
                              key={idx}
                              type="button"
                              className={`modal-cand-chip ${isSel ? 'modal-cand-chip--active' : ''}`}
                              onClick={() => setModalCandIdx(idx)}
                            >
                              <span className="modal-cand-rank">
                                {rankMedals[idx] || `#${idx + 1}`} Rank {idx + 1}
                              </span>
                              <strong>{localizedCand}</strong>
                              {!showInEnglish && isModalNonEng && localizedCand !== cand.disease && (
                                <span className="modal-cand-eng-sub">({cand.disease})</span>
                              )}
                              <span className="modal-cand-score">{matchPct}% match</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="modal-row-grid">
                    <div className="modal-field-block">
                      <p className="history-modal-label">
                        {uiModal?.colCondition || 'Focused Condition'} (Rank #{activeModalCand.rank || (modalCandIdx + 1)})
                      </p>
                      <p className="history-modal-value history-modal-disease">
                        🩺 {localizedModalDisease}
                        {!showInEnglish && isModalNonEng && localizedModalDisease !== activeModalCand.disease && (
                          <span className="modal-disease-eng-badge">({activeModalCand.disease})</span>
                        )}
                      </p>
                    </div>
                    {activeModalCand.confidenceScore != null && (
                      <div className="modal-field-block">
                        <p className="history-modal-label">{uiModal?.confidence || 'Confidence'}</p>
                        <span className="confidence-pill">{Math.round(activeModalCand.confidenceScore * 100)}%</span>
                      </div>
                    )}
                  </div>

                  <div className="modal-field-block">
                    <p className="history-modal-label">Date & Time</p>
                    <p className="history-modal-value">{new Date(detail.timestamp).toLocaleString()}</p>
                  </div>

                  {/* Active Candidate Guidance */}
                  <div className="modal-field-block">
                    <p className="history-modal-label">{uiModal?.recommendedSpecialist || 'Recommended Specialist'}</p>
                    <p className="history-modal-value">
                      👨‍⚕️ {localizedModalSpecialist}
                      {!showInEnglish && isModalNonEng && localizedModalSpecialist !== (activeModalCand.recommendedSpecialist || detail.recommendation?.specialist) && (
                        <span className="modal-disease-eng-badge">
                          ({activeModalCand.recommendedSpecialist || detail.recommendation?.specialist || 'General Physician'})
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="modal-field-block">
                    <p className="history-modal-label">{uiModal?.diagnosticTests || 'Recommended Diagnostic Lab Tests'}</p>
                    <p className="history-modal-value">
                      🧪 {((activeModalCand.recommendedTests && activeModalCand.recommendedTests.length > 0)
                        ? activeModalCand.recommendedTests
                        : detail.recommendation?.diagnosticTests || ['Clinical Evaluation']
                      ).map(t => (!showInEnglish && isModalNonEng) ? translateMedicalTerm(t, modalLang) : t).join(', ')}
                    </p>
                  </div>

                  <div className="modal-field-block">
                    <p className="history-modal-label">{uiModal?.precautions || 'Precautions & Self-Care'}</p>
                    <div className="precaution-list">
                      {((activeModalCand.precautions && activeModalCand.precautions.length > 0)
                        ? activeModalCand.precautions
                        : detail.recommendation?.precautions
                      )?.map((p, idx) => (
                        <div key={idx} className="precaution-item">
                          <span className="precaution-bullet">✓</span>
                          <span className="precaution-text">
                            {(!showInEnglish && isModalNonEng) ? translateMedicalTerm(p, modalLang) : p}
                          </span>
                        </div>
                      )) || (
                        <p className="history-modal-value">
                          {(!showInEnglish && isModalNonEng)
                            ? translateMedicalTerm('Stay hydrated and monitor your temperature.', modalLang)
                            : 'Stay hydrated and consult a physician.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        <section className="history-card">
          <div className="history-card-header">
            <div>
              <h2>Recent Search History</h2>
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
            {historyItems.map((item) => {
              const itemLang = getResolvedLang(item.rawText);
              const isItemNonEng = itemLang && !itemLang.startsWith('en');
              const localizedItemDisease = (!showInEnglish && isItemNonEng)
                ? translateMedicalTerm(item.predictedDisease, itemLang)
                : item.predictedDisease;

              return (
                <div key={item.id} className="history-item">
                  <div className="history-item-left">
                    <div className="history-item-icon" aria-hidden="true">🔍</div>
                    <div>
                      <p>{item.rawText}</p>
                      <div className="history-item-meta-row">
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                        {item.topPredictions && item.topPredictions.length > 0 ? (
                          <div className="history-item-cand-chips">
                            {item.topPredictions.map((c, i) => {
                              const localizedCandDisease = (!showInEnglish && isItemNonEng)
                                ? translateMedicalTerm(c.disease, itemLang)
                                : c.disease;
                              return (
                                <span key={i} className="history-cand-mini-chip" title={c.disease}>
                                  #{c.rank || (i + 1)} {localizedCandDisease}
                                  {!showInEnglish && isItemNonEng && localizedCandDisease !== c.disease && (
                                    <span className="history-cand-eng-ref"> ({c.disease})</span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        ) : item.predictedDisease ? (
                          <span className="history-item-disease">
                            {' · 🩺 '}{localizedItemDisease}
                            {!showInEnglish && isItemNonEng && localizedItemDisease !== item.predictedDisease && (
                              <span className="history-cand-eng-ref"> ({item.predictedDisease})</span>
                            )}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="history-item-actions">
                    <button type="button" className="history-view" onClick={() => handleViewDetail(item.id)} disabled={detailLoading}>
                      View Top 3
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
              );
            })}
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
