import React, { useState } from 'react';
import './HomePage.css';
import heroDoctorImg from '../src/hero_doctor.jpg';
import { SUPPORTED_LANGUAGES } from '../src/medicalTranslations.js';

const HomePage = ({ onSearch, onVoiceSearch, onLogin, onRegister, currentLanguage = 'en-IN', onLanguageChange }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const sanitized = query.trim();
    if (sanitized && onSearch) {
      onSearch(sanitized);
    }
  };

  const handleQuickPrompt = (phrase) => {
    setQuery(phrase);
    if (onSearch) {
      onSearch(phrase);
    }
  };

  return (
    <div className="home-shell">
      {/* Background glowing gradients */}
      <div className="home-ambient-glow home-ambient-glow-1" aria-hidden="true" />
      <div className="home-ambient-glow home-ambient-glow-2" aria-hidden="true" />

      {/* ── Top Navigation Bar ───────────────────────────────────────────── */}
      <header className="home-navbar">
        <div className="home-brand">
          <div className="home-brand-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              {/* Medical Shield Outline */}
              <path
                d="M16 3L6 7.5V14.5C6 21.2 10.3 27.4 16 29C21.7 27.4 26 21.2 26 14.5V7.5L16 3Z"
                fill="url(#brandGrad)"
                stroke="#10b981"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              {/* Medical Cross + ECG Heartbeat line in crisp white */}
              <path
                d="M16 9V21M10 15H22"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 16.5H12.5L14.5 12.5L17.5 19.5L19.5 15H23"
                stroke="#ecfdf5"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="brandGrad" x1="6" y1="3" x2="26" y2="29" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#059669" />
                  <stop offset="1" stopColor="#0d9488" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="home-brand-wordmark">
            <span className="brand-text-medi">Medi</span>
            <span className="brand-text-guide">Guide</span>
            <span className="brand-badge-ai">AI</span>
          </div>
        </div>

        <nav className="home-nav-links">
          <a href="#features" className="home-nav-link">Features</a>
          <a href="#how-it-works" className="home-nav-link">How It Works</a>
          <a href="#specialties" className="home-nav-link">Specialties</a>
        </nav>

        <div className="home-nav-actions">
          <div className="home-language-selector-wrapper" title="Choose Language">
            <span className="lang-globe-icon" aria-hidden="true">🌐</span>
            <select
              className="home-language-dropdown"
              value={currentLanguage}
              onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
              aria-label="Display Language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.native} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          <button className="home-btn-ghost" type="button" onClick={onLogin}>
            Sign In
          </button>
          <button className="home-btn-primary" type="button" onClick={onRegister}>
            <span>Get Started</span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      <main className="home-main">
        {/* ── Hero Section ──────────────────────────────────────────────── */}
        <section className="home-hero-section">
          {/* Left Hero Column */}
          <div className="home-hero-content">
            <div className="home-pill-badge">
              <span className="pill-dot"></span>
              <span>AI Clinical Decision Support · 9+ Native Languages</span>
            </div>

            <h1 className="home-hero-title">
              Smart Symptom Analysis. <br />
              <span className="hero-title-gradient">Accurate Medical Guidance.</span>
            </h1>

            <p className="home-hero-description">
              Describe your symptoms naturally by <strong>voice or text</strong> in English, Tamil, Hindi, Telugu, or Spanish. MediGuide leverages biomedical NLP & clinical ontology to predict conditions, suggest lab tests, and recommend specialists.
            </p>

            {/* Interactive Symptom Search & Voice Bar */}
            <form className="home-search-box" onSubmit={handleSubmit}>
              <div className="home-search-input-wrapper">
                <svg className="home-search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe how you feel (e.g. high fever, severe headache, dry cough)..."
                  aria-label="Enter your symptoms"
                />
              </div>

              <div className="home-search-actions">
                <button
                  type="button"
                  className="home-voice-btn"
                  onClick={onVoiceSearch}
                  title="Speak symptoms in Tamil, Hindi, Telugu, Spanish, or English"
                >
                  <span className="voice-mic-icon">🎙️</span>
                  <span>Voice Search</span>
                </button>

                <button type="submit" className="home-analyze-btn">
                  <span>Analyze</span>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Multilingual Quick Prompts */}
            <div className="home-quick-prompts">
              <span className="quick-prompts-label">Try speaking or tapping:</span>
              <div className="quick-prompts-chips">
                <button type="button" className="prompt-chip" onClick={() => handleQuickPrompt('High fever, severe headache, and joint pain')}>
                  🗣️ Fever & Headache
                </button>
                <button type="button" className="prompt-chip" onClick={() => handleQuickPrompt('Persistent dry cough and sore throat')}>
                  🗣️ Cough & Sore Throat
                </button>
                <button type="button" className="prompt-chip prompt-chip--tamil" onClick={() => handleQuickPrompt('எனக்கு கடுமையான காய்ச்சல் மற்றும் தலைவலி உள்ளது')}>
                  🇮🇳 காய்ச்சல் (Tamil)
                </button>
                <button type="button" className="prompt-chip prompt-chip--hindi" onClick={() => handleQuickPrompt('मुझे तेज बुखार और सिरदर्द है')}>
                  🇮🇳 बुखार और सिरदर्द (Hindi)
                </button>
              </div>
            </div>

            {/* Trust Metrics Bar */}
            <div className="home-trust-row">
              <div className="trust-item">
                <span className="trust-icon">🩺</span>
                <div>
                  <strong>30+ Conditions</strong>
                  <p>Ontology Modeled</p>
                </div>
              </div>
              <div className="trust-divider" />
              <div className="trust-item">
                <span className="trust-icon">🌐</span>
                <div>
                  <strong>9 Languages</strong>
                  <p>Real-Time Speech</p>
                </div>
              </div>
              <div className="trust-divider" />
              <div className="trust-item">
                <span className="trust-icon">⚡</span>
                <div>
                  <strong>&lt; 150ms</strong>
                  <p>Instant Inference</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Column - Image & Floating Cards */}
          <div className="home-hero-visual">
            <div className="hero-image-card">
              <img src={heroDoctorImg} alt="Doctor utilizing MediGuide AI Telemetry" className="hero-doctor-image" />
              <div className="hero-image-overlay" />

              {/* Floating Glassmorphism Badges */}
              <div className="floating-badge floating-badge-top-left">
                <span className="floating-badge-icon">🧠</span>
                <div>
                  <p className="floating-badge-title">spaCy & Jena Graph</p>
                  <span className="floating-badge-sub">Semantic Normalization</span>
                </div>
              </div>

              <div className="floating-badge floating-badge-top-right">
                <span className="floating-badge-icon">🔬</span>
                <div>
                  <p className="floating-badge-title">Diagnostic Lab Tests</p>
                  <span className="floating-badge-sub">PCR, CBC & Imaging</span>
                </div>
              </div>

              <div className="floating-badge floating-badge-bottom">
                <div className="badge-live-pulse">
                  <span className="live-dot"></span>
                  <strong>Live Multi-Language Speech Engine</strong>
                </div>
                <div className="badge-lang-flags">
                  <span>🇮🇳 Tamil</span>
                  <span>🇮🇳 Hindi</span>
                  <span>🇮🇳 Telugu</span>
                  <span>🇪🇸 Spanish</span>
                  <span>🇺🇸 English</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works Section ──────────────────────────────────────── */}
        <section id="how-it-works" className="home-section">
          <div className="section-header">
            <span className="section-eyebrow">CLINICAL WORKFLOW</span>
            <h2>How MediGuide AI Works</h2>
            <p>From spoken symptoms to structured diagnostic recommendations in 3 simple steps.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number-badge">01</div>
              <div className="step-icon">🎙️</div>
              <h3>Describe Your Symptoms</h3>
              <p>Speak in your native language (Tamil, Hindi, Telugu, Spanish, English) or type your symptoms freely.</p>
            </div>

            <div className="step-card">
              <div className="step-number-badge">02</div>
              <div className="step-icon">🧠</div>
              <h3>AI Semantic Vector Reasoning</h3>
              <p>Biomedical NLP maps colloquial terms to canonical clinical concepts, predicting conditions via cosine similarity.</p>
            </div>

            <div className="step-card">
              <div className="step-number-badge">03</div>
              <div className="step-icon">🩺</div>
              <h3>Get Clinical Care Guidance</h3>
              <p>Receive recommended medical specialists, diagnostic laboratory tests, hospital locations, and self-care precautions.</p>
            </div>
          </div>
        </section>

        {/* ── Key Features Grid ─────────────────────────────────────────── */}
        <section id="features" className="home-section">
          <div className="section-header">
            <span className="section-eyebrow">ADVANCED CAPABILITIES</span>
            <h2>Complete Healthcare Intelligence</h2>
            <p>Engineered for clinical precision, multilingual accessibility, and patient safety.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon feature-icon--voice">🌐</div>
              <h3>Multi-Language Speech Recognition</h3>
              <p>Native Web Speech API integration with real-time audio level monitoring for 9 global and regional Indian languages.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon--ontology">🧬</div>
              <h3>Apache Jena Medical Ontology</h3>
              <p>Structured RDF knowledge graphs link conditions to verified specialists, diagnostic procedures, and precautions.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon--triage">🚨</div>
              <h3>Instant Triage Classification</h3>
              <p>Automatically flags mild, moderate, and high-urgency conditions to help users prioritize professional doctor visits.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon--security">🔒</div>
              <h3>Secure Cloud Persistence</h3>
              <p>Enterprise JWT authentication with MongoDB Atlas storage keeps search histories and user profiles encrypted.</p>
            </div>
          </div>
        </section>

        {/* ── Medical Specialties Section ───────────────────────────────── */}
        <section id="specialties" className="home-section">
          <div className="section-header">
            <span className="section-eyebrow">CLINICAL COVERAGE</span>
            <h2>Specialties & Medical Domains</h2>
            <p>Comprehensive knowledge mapping across primary and specialized medical departments.</p>
          </div>

          <div className="specialties-grid">
            <div className="specialty-pill">
              <span className="specialty-icon">🩺</span>
              <div>
                <strong>General Medicine</strong>
                <p>Fevers, infections, viral flu, fatigue</p>
              </div>
            </div>
            <div className="specialty-pill">
              <span className="specialty-icon">🫀</span>
              <div>
                <strong>Cardiology</strong>
                <p>Chest discomfort, hypertension, palpitations</p>
              </div>
            </div>
            <div className="specialty-pill">
              <span className="specialty-icon">🫁</span>
              <div>
                <strong>Pulmonology</strong>
                <p>Asthma, chronic bronchitis, pneumonia</p>
              </div>
            </div>
            <div className="specialty-pill">
              <span className="specialty-icon">🧠</span>
              <div>
                <strong>Neurology</strong>
                <p>Migraines, vertigo, nerve disorders</p>
              </div>
            </div>
            <div className="specialty-pill">
              <span className="specialty-icon">🧪</span>
              <div>
                <strong>Endocrinology</strong>
                <p>Diabetes, thyroid, metabolic health</p>
              </div>
            </div>
            <div className="specialty-pill">
              <span className="specialty-icon">🩹</span>
              <div>
                <strong>Dermatology</strong>
                <p>Rashes, allergies, skin lesions</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Call to Action Banner ─────────────────────────────────────── */}
        <section className="home-cta-section">
          <div className="cta-content">
            <h2>Take Control of Your Health Today</h2>
            <p>Join thousands of users utilizing AI-guided symptom analysis and verified medical recommendations.</p>
            <div className="cta-actions">
              <button className="cta-primary-btn" type="button" onClick={onRegister}>
                Create Free Account →
              </button>
              <button className="cta-secondary-btn" type="button" onClick={onVoiceSearch}>
                🎙️ Try Voice Search Now
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="home-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="home-brand-wordmark">
              <span className="brand-text-medi">Medi</span>
              <span className="brand-text-guide">Guide</span>
            </div>
            <p>Clinical Decision Support & Multilingual Healthcare Navigation Platform.</p>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#specialties">Specialties</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 MediGuide AI. All rights reserved. Designed for healthcare decision support.</p>
          <p className="footer-disclaimer">
            <strong>Medical Disclaimer:</strong> MediGuide is an AI-powered triage and educational decision support system. It does not replace professional medical advice, clinical diagnosis, or treatment.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
