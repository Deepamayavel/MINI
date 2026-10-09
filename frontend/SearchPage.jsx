import React, { useState, useEffect, useRef } from 'react';
import './SearchPage.css';
import { search } from '../src/api.js';
import docIllustration from '../src/doc.png';
import SearchMetricsSection from './SearchMetricsSection.jsx';
import {
  detectInputLanguage,
  translateMedicalTerm,
  translateTriageLabel,
  getUILabels,
  translateDynamicAsync,
  LANG_SHORT_CODES,
} from '../src/medicalTranslations.js';

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
  'fr-FR': [
    "J'ai une forte fièvre, des maux de tête et d'intenses douleurs musculaires",
    "Toux sèche persistante, mal de gorge et légère fièvre",
    "Douleurs abdominales aiguës, nausées et vomissements répétés",
    "Douleur thoracique serrée, essoufflement et étourdissements",
  ],
  'de-DE': [
    'Ich habe hohes Fieber, starke Kopfschmerzen und Gliederschmerzen',
    'Anhaltender trockener Husten, Halsschmerzen und leichtes Fieber',
    'Starke Bauchschmerzen, Übelkeit und Erbrechen',
    'Brustschmerzen, Atemnot und Schwindelgefühl',
  ],
  'ar-SA': [
    'عندي حمى شديدة وصداع حاد وألم في كامل الجسم',
    'سعال جاف مستمر والتهاب في الحلق وحمى خفيفة',
    'ألم شديد في البطن وغثيان وقيء مستمر',
    'ألم وضيق في الصدر وضيق في التنفس ودوار',
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

const SearchPage = ({
  userName = '',
  token,
  onLogout,
  onBack,
  onLogin,
  onRegister,
  startVoice = false,
  initialQuery = '',
  currentLanguage = 'en-IN',
  onLanguageChange
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedLang, setSelectedLang] = useState(currentLanguage || 'en-IN');
  const [activeInputLang, setActiveInputLang] = useState(currentLanguage || 'en-IN');
  const [showInOriginalEnglish, setShowInOriginalEnglish] = useState(false);
  const [listening, setListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceUsed, setVoiceUsed] = useState(startVoice);
  const [result, setResult] = useState(null);
  const [selectedPredictionIdx, setSelectedPredictionIdx] = useState(0);
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
    if (initialQuery && initialQuery.trim()) {
      executeSearch(initialQuery.trim());
    }
  }, []);

  useEffect(() => {
    if (currentLanguage && currentLanguage !== selectedLang) {
      setSelectedLang(currentLanguage);
      selectedLangRef.current = currentLanguage;
      setActiveInputLang(currentLanguage);
    }
  }, [currentLanguage]);

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

    // Auto-detect input language from script or active language selector
    const detected = detectInputLanguage(trimmed, selectedLangRef.current || selectedLang);
    setActiveInputLang(detected);
    setShowInOriginalEnglish(false);
    try {
      localStorage.setItem('mediguide_user_lang', detected);
      localStorage.setItem('mediguide_latest_lang', detected);
      localStorage.setItem('mediguide_latest_query_text', trimmed);
    } catch {
      // ignore
    }
    if (onLanguageChange) {
      onLanguageChange(detected);
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
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
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
    setActiveInputLang(newLang);
    setShowInOriginalEnglish(false);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
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
    setSelectedPredictionIdx(0);
    setError('');
    setVoiceStatusMessage('');
    setVoiceUsed(false);
    setShowInOriginalEnglish(false);
    stopListening();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  const samplePhrases = MULTILINGUAL_SAMPLE_PHRASES[selectedLang] || MULTILINGUAL_SAMPLE_PHRASES['en-IN'];
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  const isInputNonEnglish = activeInputLang && !activeInputLang.startsWith('en');
  const targetLang = showInOriginalEnglish ? 'en-IN' : activeInputLang;
  const uiLabels = getUILabels(targetLang);

  const getLocalizedDisease = (disease) => {
    if (!disease) return '';
    if (showInOriginalEnglish || !isInputNonEnglish) return disease;
    return translateMedicalTerm(disease, activeInputLang);
  };

  const getLocalizedSpecialist = (specialist) => {
    if (!specialist) return 'General Physician';
    if (showInOriginalEnglish || !isInputNonEnglish) return specialist;
    return translateMedicalTerm(specialist, activeInputLang);
  };

  const getLocalizedTest = (test) => {
    if (!test) return '';
    if (showInOriginalEnglish || !isInputNonEnglish) return test;
    return translateMedicalTerm(test, activeInputLang);
  };

  const getLocalizedPrecaution = (prec) => {
    if (!prec) return '';
    if (showInOriginalEnglish || !isInputNonEnglish) return prec;
    return translateMedicalTerm(prec, activeInputLang);
  };

  const getLocalizedTriage = (disease, confidence) => {
    const baseTriage = getTriageSeverity(disease, confidence);
    if (showInOriginalEnglish || !isInputNonEnglish) {
      return baseTriage;
    }
    const translatedLabel = translateTriageLabel(baseTriage.label, activeInputLang);
    return {
      ...baseTriage,
      label: translatedLabel
    };
  };

  const topPredictionsList = result?.topPredictions && result.topPredictions.length > 0
    ? result.topPredictions
    : result ? [{
        disease: result.predictedDisease,
        confidenceScore: result.confidenceScore,
        rank: 1,
        recommendedSpecialist: result.recommendedSpecialist,
        recommendedTests: result.recommendedTests,
        recommendedHospitals: result.recommendedHospitals,
        precautions: result.precautions
      }] : [];

  const activeCandidate = topPredictionsList[selectedPredictionIdx] || topPredictionsList[0] || (result ? {
    disease: result.predictedDisease,
    confidenceScore: result.confidenceScore,
    rank: 1,
    recommendedSpecialist: result.recommendedSpecialist,
    recommendedTests: result.recommendedTests,
    recommendedHospitals: result.recommendedHospitals,
    precautions: result.precautions
  } : null);

  const activeTriage = activeCandidate ? getLocalizedTriage(activeCandidate.disease || activeCandidate.predictedDisease, activeCandidate.confidenceScore) : null;

  const handleSpeakReport = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis (voice audio playback) is not supported in this browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    if (!activeCandidate) return;

    const diseaseName = getLocalizedDisease(activeCandidate.disease);
    const specialistName = getLocalizedSpecialist(activeCandidate.recommendedSpecialist || result?.recommendedSpecialist);
    const tests = (activeCandidate.recommendedTests && activeCandidate.recommendedTests.length > 0
      ? activeCandidate.recommendedTests
      : result?.recommendedTests || []
    ).map(getLocalizedTest).slice(0, 3).join(', ');
    const precs = (activeCandidate.precautions && activeCandidate.precautions.length > 0
      ? activeCandidate.precautions
      : result?.precautions || []
    ).map(getLocalizedPrecaution).slice(0, 3).join('. ');

    const speechText = `Assessment: ${diseaseName}. Match strength: ${Math.round((activeCandidate.confidenceScore || 0) * 100)} percent. Recommended specialist: ${specialistName}. Diagnostic tests: ${tests || 'Clinical consultation'}. Key precautions: ${precs}.`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = activeInputLang || selectedLang || 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

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

          {token ? (
            <div className="user-row">
              <div className="user-pill">
                <span className="user-avatar-badge">{userName ? userName.slice(0, 1).toUpperCase() : 'U'}</span>
                <span>{userName}</span>
              </div>
              <button className="logout-btn" type="button" onClick={onLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="guest-nav-actions">
              <button className="guest-btn-signin" type="button" onClick={onLogin}>
                Sign In
              </button>
              <button className="guest-btn-register" type="button" onClick={onRegister}>
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="search-content">
        <section className="search-intro">
          <div className="search-badge-pill">
            <span className="badge-sparkle">✨</span> AI-Powered Clinical Intelligence (k=3 kNN)
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
              <div className="card-lang-indicator" title={`Active language: ${currentLangObj.name} (Change in top navbar)`}>
                <span className="card-lang-dot"></span>
                <span className="card-lang-text">🌐 {currentLangObj.flag} {currentLangObj.native}</span>
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
                      <span className="spinner-dot"></span> Analyzing Symptoms (k=3)…
                    </span>
                  ) : (
                    '⚡ Analyze Symptoms (Top 3 kNN)'
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
            <p>Analyzing clinical vectors and calculating Top-3 (k=3) kNN candidate diagnoses…</p>
          </div>
        )}

        {error && <div className="search-error">⚠️ {error}</div>}

        {result && activeCandidate && (
          <section className="clinical-report-card">
            {/* ── Input Language Result Banner ────────────────────────────── */}
            {isInputNonEnglish && (
              <div className="output-language-banner">
                <div className="output-language-info">
                  <span className="output-lang-icon">🌐</span>
                  <div>
                    <strong>
                      {showInOriginalEnglish
                        ? 'Clinical Results shown in: English (US/Global)'
                        : (uiLabels?.outputInLangNotice || `Results translated to input language: ${currentLangObj.native} (${currentLangObj.name})`)}
                    </strong>
                    <p className="output-lang-desc">
                      {showInOriginalEnglish
                        ? 'Viewing standard clinical English terminology.'
                        : 'All diagnosed conditions, specialists, lab tests, and precautions are presented in your input language.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="output-lang-toggle-btn"
                  onClick={() => setShowInOriginalEnglish(!showInOriginalEnglish)}
                  title="Toggle language presentation"
                >
                  {showInOriginalEnglish
                    ? `🔄 ${uiLabels?.toggleToInputLang || `View in ${currentLangObj.native}`}`
                    : `🔄 ${uiLabels?.toggleToEnglish || 'Show in English'}`}
                </button>
              </div>
            )}

            {/* ── Top 3 (k=3) Differential Diagnosis Selector ─────────────── */}
            <div className="knn-section-header">
              <div className="knn-header-left">
                <span className="knn-pill-badge">{uiLabels?.knnClassification || '🧬 k=3 kNN CLASSIFICATION'}</span>
                <h3 className="knn-section-title">{uiLabels?.differentialHeader || 'Top 3 Clinical Differential Diagnoses'}</h3>
                <p className="knn-section-subtitle">
                  {uiLabels?.differentialSub || 'Sorted by similarity vector match. Select any candidate to explore its specific care pathway.'}
                </p>
              </div>
              <div className="knn-status-pill">
                <span>🎯 {topPredictionsList.length} {uiLabels?.candidatesEvaluated || 'Candidates Evaluated'}</span>
              </div>
            </div>

            <div className="knn-candidates-grid">
              {topPredictionsList.map((cand, idx) => {
                const candTriage = getLocalizedTriage(cand.disease, cand.confidenceScore);
                const isSelected = selectedPredictionIdx === idx;
                const matchPct = Math.round((cand.confidenceScore || 0) * 100);
                const rankMedals = ['🥇', '🥈', '🥉'];
                const rankLabels = uiLabels
                  ? [uiLabels.primaryMatch, uiLabels.diff2, uiLabels.diff3]
                  : ['Primary Match', 'Differential #2', 'Differential #3'];

                const localizedDisease = getLocalizedDisease(cand.disease);
                const showEnglishTag = isInputNonEnglish && !showInOriginalEnglish && localizedDisease !== cand.disease;

                return (
                  <button
                    key={idx}
                    type="button"
                    className={`knn-candidate-card ${isSelected ? 'knn-candidate-card--active' : ''}`}
                    onClick={() => setSelectedPredictionIdx(idx)}
                  >
                    <div className="knn-card-top-row">
                      <span className={`knn-rank-badge knn-rank-badge--${idx + 1}`}>
                        {rankMedals[idx] || `#${idx + 1}`} {uiLabels?.colRank || 'Rank'} {idx + 1}
                      </span>
                      <span className="knn-rank-sublabel">{rankLabels[idx] || `Candidate ${idx + 1}`}</span>
                    </div>

                    <h4 className="knn-disease-name">{localizedDisease}</h4>
                    {showEnglishTag && (
                      <span className="knn-english-badge">({cand.disease})</span>
                    )}

                    <div className="knn-score-row">
                      <span className="knn-score-label">{uiLabels?.confidence || 'Confidence:'}</span>
                      <strong className="knn-score-val">{matchPct}%</strong>
                    </div>

                    <div className="knn-meter-bar-track">
                      <div
                        className={`knn-meter-bar-fill knn-meter-bar-fill--${idx + 1}`}
                        style={{ width: `${Math.max(8, matchPct)}%` }}
                      ></div>
                    </div>

                    <div className="knn-card-footer">
                      <span className={`triage-badge-sm ${candTriage.badgeClass}`}>
                        {candTriage.icon} {candTriage.level.toUpperCase()}
                      </span>
                      <span className="knn-select-cta">
                        {isSelected ? (uiLabels?.activeView || '● Active View') : (uiLabels?.inspectDetails || 'Inspect Details →')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── Active Candidate Report Hero ────────────────────────────── */}
            <div className="report-hero">
              <div className="report-hero-left">
                <div className="condition-icon-badge">🩺</div>
                <div>
                  <div className="report-tag-row">
                    <span className="report-sublabel">
                      {uiLabels?.activeClinicalAssessment || 'ACTIVE CLINICAL ASSESSMENT'} · {uiLabels?.colRank || 'RANK'} #{activeCandidate.rank || (selectedPredictionIdx + 1)}
                    </span>
                    {activeTriage && (
                      <span className={`triage-badge ${activeTriage.badgeClass}`}>
                        {activeTriage.icon} {activeTriage.label}
                      </span>
                    )}
                  </div>
                  <h2 className="predicted-disease-title">
                    {getLocalizedDisease(activeCandidate.disease)}
                  </h2>
                  {isInputNonEnglish && !showInOriginalEnglish && (
                    <div className="disease-english-ref-tag">
                      <span className="ref-label">{uiLabels?.englishMedicalTerm || 'English Clinical Term:'}</span>
                      <strong className="ref-val">{activeCandidate.disease}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="report-hero-right">
                <button
                  type="button"
                  className={`voice-listen-diagnosis-btn ${speaking ? 'voice-listen-diagnosis-btn--active' : ''}`}
                  onClick={handleSpeakReport}
                  title={speaking ? 'Stop speaking diagnosis' : 'Listen to diagnosis read aloud'}
                  aria-label={speaking ? 'Stop Voice' : 'Listen via Voice'}
                >
                  <span className="voice-listen-icon">{speaking ? '⏹️' : '🔊'}</span>
                  <span>{speaking ? 'Stop Voice' : 'Listen via Voice'}</span>
                </button>
                <div className="confidence-metric-card">
                  <span className="confidence-metric-label">{uiLabels?.matchStrength || 'MATCH STRENGTH'}</span>
                  <div className="confidence-metric-value">
                    <span>{Math.round((activeCandidate.confidenceScore || 0) * 100)}%</span>
                  </div>
                  <span className="confidence-metric-sub">
                    {uiLabels?.rankOf3 || 'Rank #'} {activeCandidate.rank || (selectedPredictionIdx + 1)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── 4 Segmented Clinical Cards ──────────────────────────────── */}
            <div className="clinical-grid">
              {/* Specialist Card */}
              <div className="clinical-card clinical-card--specialist">
                <div className="clinical-card-header">
                  <span className="clinical-icon">👨‍⚕️</span>
                  <div>
                    <h4>{uiLabels?.recommendedSpecialist || 'Recommended Specialist'}</h4>
                    <span className="clinical-card-sub">{uiLabels?.specialistSub || 'Medical Practitioner'}</span>
                  </div>
                </div>
                <div className="clinical-card-body">
                  <div className="specialist-highlight">
                    {getLocalizedSpecialist(activeCandidate.recommendedSpecialist || result.recommendedSpecialist)}
                  </div>
                  {isInputNonEnglish && !showInOriginalEnglish && (
                    <div className="specialist-english-sub">
                      ({activeCandidate.recommendedSpecialist || result.recommendedSpecialist || 'General Physician'})
                    </div>
                  )}
                  <p className="card-guidance-text">
                    {uiLabels?.specialistGuidance || 'Consult for clinical evaluation and prescription treatment.'}
                  </p>
                </div>
              </div>

              {/* Tests Card */}
              <div className="clinical-card clinical-card--tests">
                <div className="clinical-card-header">
                  <span className="clinical-icon">🧪</span>
                  <div>
                    <h4>{uiLabels?.diagnosticTests || 'Diagnostic Tests'}</h4>
                    <span className="clinical-card-sub">{uiLabels?.testsSub || 'Recommended Labs'}</span>
                  </div>
                </div>
                <div className="clinical-card-body">
                  <div className="clinical-pill-list">
                    {(activeCandidate.recommendedTests && activeCandidate.recommendedTests.length > 0) ? (
                      activeCandidate.recommendedTests.map((t, idx) => (
                        <span key={idx} className="clinical-pill clinical-pill--test">
                          🔬 {getLocalizedTest(t)}
                        </span>
                      ))
                    ) : (result.recommendedTests && result.recommendedTests.length > 0) ? (
                      result.recommendedTests.map((t, idx) => (
                        <span key={idx} className="clinical-pill clinical-pill--test">
                          🔬 {getLocalizedTest(t)}
                        </span>
                      ))
                    ) : (
                      <p className="card-guidance-text">
                        {uiLabels ? translateMedicalTerm('Clinical evaluation by physician', activeInputLang) : 'Clinical evaluation by physician'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Hospitals Card */}
              <div className="clinical-card clinical-card--hospitals">
                <div className="clinical-card-header">
                  <span className="clinical-icon">🏥</span>
                  <div>
                    <h4>{uiLabels?.nearbyHospitals || 'Nearby Hospitals & Clinics'}</h4>
                    <span className="clinical-card-sub">{uiLabels?.hospitalsSub || 'GPS-Aware Navigation'}</span>
                  </div>
                </div>
                <div className="clinical-card-body">
                  <div className="clinical-pill-list">
                    {((activeCandidate.recommendedHospitals && activeCandidate.recommendedHospitals.length > 0)
                      ? activeCandidate.recommendedHospitals
                      : result.recommendedHospitals
                    )?.map((h, idx) => (
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
                    )) || (
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
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((activeCandidate.recommendedSpecialist || result.recommendedSpecialist || 'Hospital') + ' near me')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="maps-locate-btn"
                  >
                    🗺️ {uiLabels?.findNearMe || `Find ${activeCandidate.recommendedSpecialist || result.recommendedSpecialist || 'Hospitals'} Near Me on Google Maps →`}
                  </a>
                </div>
              </div>

              {/* Precautions Card */}
              <div className="clinical-card clinical-card--precautions">
                <div className="clinical-card-header">
                  <span className="clinical-icon">🛡️</span>
                  <div>
                    <h4>{uiLabels?.precautions || 'Precautions & Care Guidelines'}</h4>
                    <span className="clinical-card-sub">{uiLabels?.precautionsSub || 'Self-Care & Safety'}</span>
                  </div>
                </div>
                <div className="clinical-card-body">
                  <div className="precaution-checklist">
                    {((activeCandidate.precautions && activeCandidate.precautions.length > 0)
                      ? activeCandidate.precautions
                      : result.precautions
                    )?.map((p, idx) => (
                      <div key={idx} className="precaution-check-item">
                        <span className="check-icon">✓</span>
                        <span>{getLocalizedPrecaution(p)}</span>
                      </div>
                    )) || (
                      <p className="card-guidance-text">
                        {uiLabels ? translateMedicalTerm('Stay hydrated and monitor your temperature.', activeInputLang) : 'Stay hydrated and monitor your temperature.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── AI Model Evaluation & Performance Metrics Section ────────── */}
            <SearchMetricsSection
              activeCandidate={activeCandidate}
              topPredictions={topPredictionsList}
              currentLanguage={targetLang}
              onSelectCandidate={(idx) => setSelectedPredictionIdx(idx)}
              selectedPredictionIdx={selectedPredictionIdx}
            />

            {/* ── Top-3 Differential Comparison Matrix ────────────────────── */}
            {topPredictionsList.length > 1 && (
              <div className="knn-matrix-container">
                <div className="knn-matrix-header">
                  <h4>{uiLabels?.comparisonMatrix || '📊 Differential Diagnosis Comparison Matrix (k=3)'}</h4>
                  <span className="knn-matrix-note">
                    {uiLabels?.matrixSub || 'Comparative breakdown of all 3 candidate conditions'}
                  </span>
                </div>
                <div className="knn-matrix-table-wrap">
                  <table className="knn-matrix-table">
                    <thead>
                      <tr>
                        <th>{uiLabels?.colRank || 'Rank'}</th>
                        <th>{uiLabels?.colCondition || 'Condition'}</th>
                        <th>{uiLabels?.colMatch || 'Match %'}</th>
                        <th>{uiLabels?.colTriage || 'Triage Urgency'}</th>
                        <th>{uiLabels?.colSpecialist || 'Primary Specialist'}</th>
                        <th>{uiLabels?.colTests || 'Key Lab Tests'}</th>
                        <th>{uiLabels?.colAction || 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPredictionsList.map((item, idx) => {
                        const itmTriage = getLocalizedTriage(item.disease, item.confidenceScore);
                        const isCurr = selectedPredictionIdx === idx;
                        const matchPct = Math.round((item.confidenceScore || 0) * 100);
                        const localizedItemDisease = getLocalizedDisease(item.disease);

                        return (
                          <tr key={idx} className={isCurr ? 'knn-row--active' : ''}>
                            <td>
                              <span className={`knn-matrix-rank-pill knn-matrix-rank-pill--${idx + 1}`}>
                                #{item.rank || (idx + 1)}
                              </span>
                            </td>
                            <td>
                              <strong>{localizedItemDisease}</strong>
                              {isInputNonEnglish && !showInOriginalEnglish && localizedItemDisease !== item.disease && (
                                <div className="matrix-sub-english">({item.disease})</div>
                              )}
                            </td>
                            <td>
                              <div className="knn-matrix-score-cell">
                                <span>{matchPct}%</span>
                                <div className="knn-mini-bar-track">
                                  <div
                                    className="knn-mini-bar-fill"
                                    style={{ width: `${Math.max(10, matchPct)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`triage-badge-sm ${itmTriage.badgeClass}`}>
                                {itmTriage.icon} {itmTriage.label.split(' ')[0]}
                              </span>
                            </td>
                            <td>{getLocalizedSpecialist(item.recommendedSpecialist)}</td>
                            <td>
                              <span className="knn-matrix-tests">
                                {item.recommendedTests && item.recommendedTests.length > 0
                                  ? item.recommendedTests.slice(0, 2).map(t => getLocalizedTest(t)).join(', ')
                                  : 'Routine Evaluation'}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className={`knn-matrix-action-btn ${isCurr ? 'knn-matrix-action-btn--active' : ''}`}
                                onClick={() => setSelectedPredictionIdx(idx)}
                              >
                                {isCurr ? (uiLabels?.viewing || '✓ Viewing') : (uiLabels?.viewPlan || 'View Plan')}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Guest Personal Health Record Prompt ─────────────────────── */}
            {!token && (
              <div className="guest-save-banner">
                <div className="guest-save-content">
                  <span className="guest-save-icon" aria-hidden="true">📋</span>
                  <div>
                    <h4 className="guest-save-title">Save this diagnosis to your Personal Health Record</h4>
                    <p className="guest-save-desc">
                      Create a free account or sign in to save this differential diagnosis, track symptom recurrence over time, and access accredited hospital directions anytime.
                    </p>
                  </div>
                </div>
                <div className="guest-save-actions">
                  <button type="button" className="btn-banner-login" onClick={onLogin}>
                    Sign In
                  </button>
                  <button type="button" className="btn-banner-register" onClick={onRegister}>
                    Create Free Account →
                  </button>
                </div>
              </div>
            )}

            {/* Medical Disclaimer Footer */}
            <div className="report-disclaimer-card">
              <span className="disclaimer-icon">⚠️</span>
              <p>
                <strong>Important Notice:</strong> {uiLabels?.disclaimer || 'This assessment evaluates the Top-3 candidate conditions (k=3) using AI cosine similarity and Jena ontology clinical reasoning for decision support and triage. It is not a definitive medical diagnosis. Please consult a registered medical doctor.'}
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default SearchPage;

