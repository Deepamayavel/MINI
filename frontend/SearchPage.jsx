import React, { useState, useEffect, useRef } from 'react';
import './SearchPage.css';
import { search } from '../src/api.js';
import docIllustration from '../src/doc.png';

const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', name: 'English (India)', native: 'English', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'en-US', name: 'English (US)', native: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar-SA', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
];

const MULTILINGUAL_SAMPLE_PHRASES = {
  'en-IN': [
    'I have high fever, headache and severe body pain',
    'Persistent dry cough, sore throat and mild fever',
    'Severe abdominal stomach pain, nausea and vomiting',
    'Chest pain, shortness of breath and dizziness',
  ],
  'ta-IN': [
    'எனக்கு கடுமையான காய்ச்சல் மற்றும் தலைவலி உள்ளது',
    'தொடர் இருமல், சளி மற்றும் தொண்டை வலி',
    'வயிற்று வலி, வாந்தி மற்றும் மயக்கம்',
    'நெஞ்சு வலி மற்றும் மூச்சுத்திணறல்',
  ],
  'hi-IN': [
    'मुझे तेज बुखार, सिरदर्द और बदन दर्द है',
    'खांसी, जुकाम और गले में खराश है',
    'पेट में तेज दर्द, उल्टी और चक्कर आ रहे हैं',
    'सीने में दर्द और सांस लेने में तकलीफ हो रही है',
  ],
  'te-IN': [
    'నాకు తీవ్రమైన జ్వరం మరియు తలనొప్పి ఉంది',
    'దగ్గు, జలుబు మరియు గొంతు నొప్పి',
    'కడుపు నొప్పి, వాంతులు మరియు తలతిరగడం',
    'ఛాతీ నొప్పి మరియు శ్వాస తీసుకోవడంలో ఇబ్బంది',
  ],
  'es-ES': [
    'Tengo fiebre alta, dolor de cabeza y dolor de cuerpo',
    'Tos seca persistente, dolor de garganta y resfriado',
    'Dolor de estómago fuerte, náuseas y vómitos',
    'Dolor en el pecho y dificultad para respirar',
  ],
  'en-US': [
    'I have high fever, headache and severe body pain',
    'Persistent dry cough, sore throat and mild fever',
    'Severe abdominal stomach pain, nausea and vomiting',
    'Chest pain, shortness of breath and dizziness',
  ],
};

const getTriageSeverity = (diseaseName = '', confidence = 0.5) => {
  const highRisk = ['Heart Attack', 'Pneumonia', 'Appendicitis', 'Tuberculosis', 'Dengue Fever'];
  const moderate = ['Typhoid', 'Malaria', 'Gastritis', 'Urinary Tract Infection', 'Kidney Stones', 'Hypertension', 'Diabetes', 'Migraine', 'Asthma', 'Chickenpox', 'Jaundice', 'Hepatitis'];

  if (highRisk.some((d) => d.toLowerCase() === diseaseName.toLowerCase())) {
    return { level: 'urgent', label: 'Urgent Care Recommended', badgeClass: 'triage-badge--urgent', icon: '🚨' };
  }
  if (moderate.some((d) => d.toLowerCase() === diseaseName.toLowerCase())) {
    return { level: 'moderate', label: 'Doctor Consultation in 24-48h', badgeClass: 'triage-badge--moderate', icon: '⚠️' };
  }
  return { level: 'mild', label: 'Mild / Home Care Guidance', badgeClass: 'triage-badge--mild', icon: '🟢' };
};

const SearchPage = ({ userName = '', token, onLogout, onBack, startVoice = false, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [listening, setListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceUsed, setVoiceUsed] = useState(startVoice);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voiceStatusMessage, setVoiceStatusMessage] = useState('');
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const micStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const queryRef = useRef(query);
  const selectedLangRef = useRef(selectedLang);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    selectedLangRef.current = selectedLang;
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLang;
    }
  }, [selectedLang]);

  // Audio level monitoring via Web Audio API
  const startMicLevelMonitor = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round(avg * 1.6)));
        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('Microphone stream access error:', err);
    }
  };

  const stopMicLevelMonitor = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const executeSearch = async (textToSearch) => {
    const trimmed = (textToSearch || queryRef.current || query || '').trim();
    if (!trimmed) {
      setError('Please speak or enter your symptoms before analyzing.');
      return;
    }
    if (!token) {
      setError('You must be logged in to run search.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const response = await search(token, trimmed, voiceUsed ? 'VOICE' : 'TEXT');
      setResult(response);
      setVoiceStatusMessage('');
    } catch (err) {
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLangRef.current || 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError('');
      const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLangRef.current) || SUPPORTED_LANGUAGES[0];
      setVoiceStatusMessage(`🎙️ Listening in ${currentLangObj.flag} ${currentLangObj.name}... Speak now.`);
    };

    recognition.onresult = (event) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript + ' ';
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }

      const spoken = (finalStr + interimStr).trim();
      if (spoken) {
        setQuery(spoken);
        queryRef.current = spoken;
        setLiveTranscript(spoken);
        setVoiceUsed(true);
        setVoiceStatusMessage(`Heard: "${spoken}"`);
      }
    };

    recognition.onend = () => {
      // recognition ended
    };

    recognition.onerror = (event) => {
      console.warn('SpeechRecognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone permission blocked! Please allow microphone access in your browser address bar.');
        setListening(false);
        stopMicLevelMonitor();
      } else if (event.error === 'no-speech') {
        setVoiceStatusMessage('No speech detected yet. Speak closer to your microphone or click a sample phrase below.');
      } else if (event.error === 'network') {
        setVoiceStatusMessage('Speech recognition network timeout. You can select a sample phrase below or type symptoms.');
      }
    };

    return recognition;
  };

  useEffect(() => {
    const rec = createRecognition();
    recognitionRef.current = rec;

    if (startVoice) {
      startListening();
    }

    return () => {
      stopListening();
    };
  }, []);

  const startListening = (langCode) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please open in Google Chrome or Microsoft Edge.');
      return;
    }

    stopListening();

    const targetLang = langCode || selectedLangRef.current || 'en-IN';
    const rec = createRecognition();
    if (rec) {
      rec.lang = targetLang;
      recognitionRef.current = rec;
    }

    setError('');
    setListening(true);
    setVoiceUsed(true);
    const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) || SUPPORTED_LANGUAGES[0];
    setVoiceStatusMessage(`🎙️ Listening in ${currentLangObj.flag} ${currentLangObj.name}... Speak now.`);

    startMicLevelMonitor();

    if (rec) {
      try {
        rec.start();
      } catch (err) {
        console.warn('Recognition start exception:', err);
      }
    }
  };

  const stopListening = () => {
    setListening(false);
    stopMicLevelMonitor();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLang(newLang);
    selectedLangRef.current = newLang;
    if (listening) {
      startListening(newLang);
    }
  };

  const handleDoneSpeakingAndAnalyze = () => {
    stopListening();
    const current = (queryRef.current || query || '').trim();
    if (current) {
      executeSearch(current);
    } else {
      setError('No speech was captured yet. Please speak your symptoms or tap one of the suggested voice phrases below.');
    }
  };

  const handleApplyVoicePhrase = (phrase) => {
    setQuery(phrase);
    queryRef.current = phrase;
    setLiveTranscript(phrase);
    setVoiceUsed(true);
    setVoiceStatusMessage(`Selected: "${phrase}"`);
    stopListening();
    executeSearch(phrase);
  };

  const handleAnalyze = async (event) => {
    if (event) event.preventDefault();
    stopListening();
    executeSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    queryRef.current = '';
    setLiveTranscript('');
    setResult(null);
    setError('');
    setVoiceStatusMessage('');
    setVoiceUsed(false);
    stopListening();
  };

  const samplePhrases = MULTILINGUAL_SAMPLE_PHRASES[selectedLang] || MULTILINGUAL_SAMPLE_PHRASES['en-IN'];
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];
  const triage = result ? getTriageSeverity(result.predictedDisease, result.confidenceScore) : null;

  return (
    <div className="search-shell">
      <header className="search-header">
        <div className="logo-row">
          <button className="back-button" type="button" onClick={onBack} aria-label="Go back">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
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

        <div className="header-controls-row">
          <div className="language-selector-pill">
            <span className="lang-icon" aria-hidden="true">🌐</span>
            <label htmlFor="header-lang-select" className="lang-label">Language:</label>
            <select
              id="header-lang-select"
              className="lang-select"
              value={selectedLang}
              onChange={handleLanguageChange}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.native}
                </option>
              ))}
            </select>
          </div>

          <div className="user-row">
            <div className="user-pill">
              <span className="user-avatar-badge">{userName ? userName.slice(0, 1).toUpperCase() : 'U'}</span>
              <span>{userName}</span>
            </div>
            <button className="logout-btn" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="search-content">
        <section className="search-intro">
          <div className="search-badge-pill">
            <span className="badge-sparkle">✨</span> AI-Powered Clinical Intelligence
          </div>
          <h1>Search Your Symptoms</h1>
          <p>Describe what you are experiencing in <strong>{currentLangObj.name}</strong> or any language by voice or text.</p>
        </section>

        {/* Live Voice Assistant Banner */}
        {listening && (
          <section className="live-voice-banner" aria-live="polite">
            <div className="live-voice-header">
              <div className="live-voice-pulse">
                <span className="pulse-ring"></span>
                <span className="pulse-ring-outer"></span>
                <span className="pulse-dot">🎙️</span>
              </div>
              <div className="live-voice-info">
                <div className="voice-status-row">
                  <h3>Voice Search is Active</h3>
                  <div className="banner-lang-tag">
                    {currentLangObj.flag} {currentLangObj.native}
                  </div>
                  <div className="mic-meter" title={`Mic input level: ${audioLevel}%`}>
                    <span className="mic-meter-bar" style={{ height: `${Math.max(15, audioLevel)}%` }}></span>
                    <span className="mic-meter-bar" style={{ height: `${Math.max(25, audioLevel * 1.2)}%` }}></span>
                    <span className="mic-meter-bar" style={{ height: `${Math.max(10, audioLevel * 0.8)}%` }}></span>
                    <span className="mic-meter-label">{audioLevel > 10 ? 'Speaking detected 🟢' : 'Listening...'}</span>
                  </div>
                </div>
                <p className="voice-status-text">{voiceStatusMessage}</p>
                {liveTranscript && (
                  <div className="live-transcript-box">
                    <span className="live-transcript-tag">Live Speech ({currentLangObj.native}):</span> "{liveTranscript}"
                  </div>
                )}
              </div>
            </div>
            <div className="live-voice-actions">
              <button
                type="button"
                className="voice-analyze-btn"
                onClick={handleDoneSpeakingAndAnalyze}
              >
                ✅ Done Speaking — Analyze Now →
              </button>
              <button type="button" className="voice-cancel-btn" onClick={stopListening}>
                Stop Listening
              </button>
            </div>
          </section>
        )}

        {/* Quick Voice Suggestions Box in Selected Language */}
        {listening && (
          <section className="quick-voice-prompts">
            <p>💡 Speak in <strong>{currentLangObj.name}</strong> or tap a sample prompt to test immediately:</p>
            <div className="voice-prompt-chips">
              {samplePhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="voice-prompt-chip"
                  onClick={() => handleApplyVoicePhrase(phrase)}
                >
                  🗣️ "{phrase}"
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="search-panel">
          <div className="search-card">
            <div className="search-card-topbar">
              <span className="search-card-label">🩺 Describe Symptoms</span>
              <div className="card-lang-selector">
                <span className="card-lang-label">🌐 Input Language:</span>
                <select
                  className="card-lang-dropdown"
                  value={selectedLang}
                  onChange={handleLanguageChange}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.native} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <form className="symptom-form" onSubmit={handleAnalyze}>
              <textarea
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  queryRef.current = e.target.value;
                }}
                placeholder={
                  selectedLang === 'ta-IN'
                    ? 'உதாரணம்: எனக்கு கடுமையான காய்ச்சல், தலைவலி மற்றும் உடல் வலி உள்ளது...'
                    : selectedLang === 'hi-IN'
                    ? 'उदाहरण: मुझे तेज बुखार, सिरदर्द और बदन दर्द है...'
                    : selectedLang === 'te-IN'
                    ? 'ఉదాహరణ: నాకు తీవ్రమైన జ్వరం మరియు తలనొప్పి ఉంది...'
                    : selectedLang === 'es-ES'
                    ? 'Ejemplo: Tengo fiebre alta, dolor de cabeza y tos...'
                    : 'Example: I have fever, headache, sore throat and body pain...'
                }
                aria-label="Describe your symptoms"
                maxLength={500}
              />
              <div className="search-footer">
                <button
                  type="button"
                  className={`voice-input ${listening ? 'voice-input--listening' : ''}`}
                  onClick={listening ? stopListening : () => startListening()}
                  title={`Speak in ${currentLangObj.name}`}
                >
                  <span className="voice-icon" aria-hidden="true">
                    {listening ? '🔴' : '🎤'}
                  </span>
                  <span className="voice-text">
                    <span className="voice-text-main">
                      {listening ? 'Listening... (Tap to stop)' : `Voice Input (${currentLangObj.native})`}
                    </span>
                    <span className="voice-text-sub">
                      {listening ? 'Tap when finished speaking' : `Tap to speak in ${currentLangObj.name}`}
                    </span>
                  </span>
                </button>
                <span className="char-count">{query.length} / 500</span>
              </div>
              <div className="action-buttons">
                <button className="primary-action" type="submit" disabled={loading}>
                  {loading ? (
                    <span className="btn-loading-content">
                      <span className="spinner-dot"></span> Analyzing Symptoms…
                    </span>
                  ) : (
                    '⚡ Analyze Symptoms'
                  )}
                </button>
                <button className="secondary-action" type="button" onClick={handleClear}>
                  Clear
                </button>
              </div>
            </form>

            <div className="examples-row">
              <p>Quick symptoms ({currentLangObj.name}):</p>
              <div className="example-chips">
                {(selectedLang === 'ta-IN'
                  ? ['காய்ச்சல்', 'தலைவலி', 'இருமல்', 'நெஞ்சு வலி', 'வாந்தி', 'சர்க்கரை']
                  : selectedLang === 'hi-IN'
                  ? ['बुखार', 'सिरदर्द', 'खांसी', 'सीने में दर्द', 'उल्टी', 'मधुमेह']
                  : selectedLang === 'te-IN'
                  ? ['జ్వరం', 'తలనొప్పి', 'దగ్గు', 'ఛాతీ నొప్పి', 'వాంతులు', 'చక్కెర వ్యాధి']
                  : selectedLang === 'es-ES'
                  ? ['Fiebre', 'Dolor de cabeza', 'Tos', 'Dolor en el pecho', 'Vómitos', 'Diabetes']
                  : ['Fever', 'Headache', 'Cough', 'Chest Pain', 'Diabetes', 'Vomiting']
                ).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="example-chip"
                    onClick={() => {
                      setQuery(item);
                      queryRef.current = item;
                      setVoiceUsed(false);
                    }}
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="illustration-panel" aria-hidden="true">
            <div className="illustration-card">
              <img className="illustration-image" src={docIllustration} alt="Doctor Illustration" />
            </div>
          </aside>
        </section>

        {loading && (
          <div className="search-loading">
            <div className="pulse-loader">
              <span></span><span></span><span></span>
            </div>
            <p>Analyzing clinical vectors and fetching Jena ontology recommendations…</p>
          </div>
        )}

        {error && <div className="search-error">⚠️ {error}</div>}

        {result && (
          <section className="clinical-report-card">
            {/* Report Header Hero */}
            <div className="report-hero">
              <div className="report-hero-left">
                <div className="condition-icon-badge">🩺</div>
                <div>
                  <div className="report-tag-row">
                    <span className="report-sublabel">CLINICAL PREDICTION</span>
                    {triage && (
                      <span className={`triage-badge ${triage.badgeClass}`}>
                        {triage.icon} {triage.label}
                      </span>
                    )}
                  </div>
                  <h2 className="predicted-disease-title">{result.predictedDisease}</h2>
                </div>
              </div>

              <div className="report-hero-right">
                <div className="confidence-metric-card">
                  <span className="confidence-metric-label">MATCH STRENGTH</span>
                  <div className="confidence-metric-value">
                    <span>{Math.round((result.confidenceScore || 0) * 100)}%</span>
                  </div>
                  <span className="confidence-metric-sub">Cosine similarity</span>
                </div>
              </div>
            </div>

            {/* 4 Segmented Clinical Cards */}
            <div className="clinical-grid">
              {/* Specialist Card */}
              <div className="clinical-card clinical-card--specialist">
                <div className="clinical-card-header">
                  <span className="clinical-icon">👨‍⚕️</span>
                  <div>
                    <h4>Recommended Specialist</h4>
                    <span className="clinical-card-sub">Medical Practitioner</span>
                  </div>
                </div>
                <div className="clinical-card-body">
                  <div className="specialist-highlight">
                    {result.recommendedSpecialist || 'General Physician'}
                  </div>
                  <p className="card-guidance-text">Consult for clinical evaluation and prescription treatment.</p>
                </div>
              </div>

              {/* Tests Card */}
              <div className="clinical-card clinical-card--tests">
                <div className="clinical-card-header">
                  <span className="clinical-icon">🧪</span>
                  <div>
                    <h4>Diagnostic Tests</h4>
                    <span className="clinical-card-sub">Recommended Labs</span>
                  </div>
                </div>
                <div className="clinical-card-body">
                  <div className="clinical-pill-list">
                    {result.recommendedTests && result.recommendedTests.length > 0 ? (
                      result.recommendedTests.map((t, idx) => (
                        <span key={idx} className="clinical-pill clinical-pill--test">
                          🔬 {t}
                        </span>
                      ))
                    ) : (
                      <p className="card-guidance-text">Clinical evaluation by physician</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Hospitals Card */}
              <div className="clinical-card clinical-card--hospitals">
                <div className="clinical-card-header">
                  <span className="clinical-icon">🏥</span>
                  <div>
                    <h4>Nearby Hospitals & Clinics</h4>
                    <span className="clinical-card-sub">GPS-Aware Navigation</span>
                  </div>
                </div>
                <div className="clinical-card-body">
                  <div className="clinical-pill-list">
                    {result.recommendedHospitals && result.recommendedHospitals.length > 0 ? (
                      result.recommendedHospitals.map((h, idx) => (
                        <a
                          key={idx}
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h + ' near me')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="clinical-pill clinical-pill--hospital"
                          title="Click to view live directions on Google Maps"
                        >
                          📍 {h} <span className="pill-link-icon">↗</span>
                        </a>
                      ))
                    ) : (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Hospitals near me')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="clinical-pill clinical-pill--hospital"
                      >
                        📍 Hospitals Near Me <span className="pill-link-icon">↗</span>
                      </a>
                    )}
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((result.recommendedSpecialist || 'Hospital') + ' near me')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="maps-locate-btn"
                  >
                    🗺️ Find {result.recommendedSpecialist || 'Hospitals'} Near Me on Google Maps →
                  </a>
                </div>
              </div>

              {/* Precautions Card */}
              <div className="clinical-card clinical-card--precautions">
                <div className="clinical-card-header">
                  <span className="clinical-icon">🛡️</span>
                  <div>
                    <h4>Precautions & Care Guidelines</h4>
                    <span className="clinical-card-sub">Self-Care & Safety</span>
                  </div>
                </div>
                <div className="clinical-card-body">
                  <div className="precaution-checklist">
                    {result.precautions && result.precautions.length > 0 ? (
                      result.precautions.map((p, idx) => (
                        <div key={idx} className="precaution-check-item">
                          <span className="check-icon">✓</span>
                          <span>{p}</span>
                        </div>
                      ))
                    ) : (
                      <p className="card-guidance-text">Stay hydrated and monitor your temperature.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Disclaimer Footer */}
            <div className="report-disclaimer-card">
              <span className="disclaimer-icon">⚠️</span>
              <p>
                <strong>Important Notice:</strong> This assessment is generated using AI knowledge reasoning and is intended for clinical decision support and triage. It is not a definitive diagnosis. Please consult a registered medical doctor.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
