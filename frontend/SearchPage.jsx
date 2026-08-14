import React, { useState, useEffect, useRef } from 'react';
import './SearchPage.css';
import { search } from '../src/api.js';
import docIllustration from '../src/doc.png';

const SearchPage = ({ userName = '', token, onLogout, onBack, startVoice = false, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    if (startVoice) {
      setListening(true);
      recognition.start();
    }
  }, []);

  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    setListening(true);
    recognition.start();
  };

  const stopListening = () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.stop();
    }
    setListening(false);
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError('Please enter your symptoms before analyzing.');
      return;
    }

    if (!token) {
      setError('You must be logged in to run search.');
      return;
    }

    setLoading(true);
    try {
      const response = await search(token, trimmedQuery, startVoice ? 'VOICE' : 'TEXT');
      setResult(response);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResult(null);
    setError('');
  };

  const examples = ['Fever', 'Headache', 'Cough', 'Chest Pain', 'Diabetes', 'Vomiting'];

  return (
    <div className="search-shell">
      <header className="search-header">
        <div className="logo-row">
          <button className="back-button" type="button" onClick={onBack} aria-label="Go back">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="logo-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <path d="M32 10C24.268 10 18 16.268 18 24V28.5C18 33.747 22.253 38 27.5 38H36.5C41.747 38 46 33.747 46 28.5V24C46 16.268 39.732 10 32 10Z" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M32 19V45" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M18 31H46" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="logo-title">MediGuide</p>
          </div>
        </div>

        <div className="user-row">
          <div className="user-pill">
            <span>Welcome, {userName}</span>
          </div>
          <button className="logout-btn" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="search-content">
        <section className="search-intro">
          <div className="search-intro-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1>Search Your Symptoms</h1>
          <p>Describe your symptoms in your own words and get AI-powered health insights.</p>
        </section>

        <section className="search-panel">
          <div className="search-card">
            <form className="symptom-form" onSubmit={handleAnalyze}>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Example: I have fever, headache, sore throat and body pain..."
                aria-label="Describe your symptoms"
                maxLength={500}
              />
              <div className="search-footer">
                <button
                  type="button"
                  className={`voice-input ${listening ? 'voice-input--listening' : ''}`}
                  onClick={listening ? stopListening : startListening}
                >
                  <span className="voice-icon" aria-hidden="true">🎤</span>
                  <span className="voice-text">
                    <span className="voice-text-main">{listening ? 'Listening…' : 'Voice Input'}</span>
                    <span className="voice-text-sub">Tap to speak your symptoms</span>
                  </span>
                </button>
                <span className="char-count">{query.length} / 500</span>
              </div>
              <div className="action-buttons">
                <button className="primary-action" type="submit">
                  Analyze Symptoms
                </button>
                <button className="secondary-action" type="button" onClick={handleClear}>
                  Clear
                </button>
              </div>
            </form>

            <div className="examples-row">
              <p>Or try an example</p>
              <div className="example-chips">
                {examples.map((item) => (
                  <button key={item} type="button" className="example-chip" onClick={() => setQuery(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="illustration-panel" aria-hidden="true">
            <div className="illustration-card">
              <img className="illustration-image" src={docIllustration} alt="" />
            </div>
          </aside>
        </section>
        {loading && <div className="search-loading">Analyzing your symptoms…</div>}
        {error && <div className="search-error">{error}</div>}
        {result && (
          <section className="search-result-card">
            <div className="result-header">
              <div className="result-header-left">
                <div className="result-condition-icon">🩺</div>
                <div>
                  <p className="result-label">Predicted Condition</p>
                  <h2>{result.predictedDisease}</h2>
                </div>
              </div>
              <div className="result-confidence">
                <p className="result-label">Confidence</p>
                <span className="confidence-badge">{Math.round((result.confidenceScore || 0) * 100)}%</span>
              </div>
            </div>
            <div className="result-grid">
              <div className="result-item">
                <p className="result-item-label">👨‍⚕️ Recommended Specialist</p>
                <p className="result-item-value">{result.recommendedSpecialist || 'N/A'}</p>
              </div>
              <div className="result-item">
                <p className="result-item-label">🧪 Recommended Tests</p>
                <p className="result-item-value">{result.recommendedTests?.join(', ') || 'N/A'}</p>
              </div>
              <div className="result-item">
                <p className="result-item-label">🏥 Recommended Hospitals</p>
                <p className="result-item-value">{result.recommendedHospitals?.join(', ') || 'N/A'}</p>
              </div>
              <div className="result-item">
                <p className="result-item-label">⚠️ Precautions</p>
                <p className="result-item-value">{result.precautions?.join(', ') || 'N/A'}</p>
              </div>
            </div>
            <p className="result-disclaimer">This is an AI-generated suggestion. Please consult a doctor for an accurate diagnosis.</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
