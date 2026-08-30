from typing import List, Dict
import re
from collections import Counter

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="MediGuide NLP Service")

# ── Symptom-Disease knowledge base ──────────────────────────────────────────
DISEASE_SYMPTOMS: Dict[str, List[str]] = {
    "Common Cold": ["runny nose", "sneezing", "sore throat", "cough", "mild fever", "congestion", "headache", "cold"],
    "Influenza": ["fever", "chills", "muscle aches", "fatigue", "headache", "cough", "sore throat", "body pain", "flu"],
    "COVID-19": ["fever", "cough", "shortness of breath", "loss of taste", "loss of smell", "fatigue", "body pain", "covid"],
    "Pneumonia": ["chest pain", "cough", "fever", "shortness of breath", "difficulty breathing", "chills", "fatigue"],
    "Bronchitis": ["cough", "mucus", "fatigue", "shortness of breath", "chest discomfort", "mild fever", "wheezing"],
    "Asthma": ["wheezing", "shortness of breath", "chest tightness", "cough", "difficulty breathing"],
    "Tuberculosis": ["persistent cough", "blood in cough", "chest pain", "weight loss", "night sweats", "fever", "fatigue"],
    "Dengue Fever": ["high fever", "severe headache", "pain behind eyes", "joint pain", "muscle pain", "rash", "nausea", "dengue"],
    "Malaria": ["fever", "chills", "sweating", "headache", "nausea", "vomiting", "muscle pain", "malaria"],
    "Typhoid": ["sustained fever", "weakness", "stomach pain", "headache", "loss of appetite", "constipation", "rash", "typhoid"],
    "Gastritis": ["stomach pain", "nausea", "vomiting", "bloating", "indigestion", "loss of appetite", "abdominal pain"],
    "Appendicitis": ["severe abdominal pain", "nausea", "vomiting", "fever", "loss of appetite", "abdominal pain"],
    "Irritable Bowel Syndrome": ["abdominal pain", "bloating", "diarrhea", "constipation", "cramping", "gas"],
    "Diabetes": ["frequent urination", "excessive thirst", "fatigue", "blurred vision", "slow healing", "weight loss", "diabetes"],
    "Hypertension": ["headache", "dizziness", "blurred vision", "chest pain", "shortness of breath", "high blood pressure"],
    "Heart Attack": ["chest pain", "shortness of breath", "nausea", "sweating", "arm pain", "jaw pain", "heart attack"],
    "Migraine": ["severe headache", "nausea", "vomiting", "sensitivity to light", "sensitivity to sound", "migraine"],
    "Anemia": ["fatigue", "weakness", "pale skin", "shortness of breath", "dizziness", "cold hands", "anemia"],
    "Urinary Tract Infection": ["burning urination", "frequent urination", "cloudy urine", "pelvic pain", "uti", "urinary"],
    "Kidney Stones": ["severe back pain", "side pain", "painful urination", "blood in urine", "nausea", "vomiting"],
    "Arthritis": ["joint pain", "stiffness", "swelling", "reduced range of motion", "arthritis"],
    "Chickenpox": ["itchy rash", "blisters", "fever", "fatigue", "headache", "chickenpox"],
    "Measles": ["fever", "cough", "runny nose", "red eyes", "rash", "measles"],
    "Jaundice": ["yellow skin", "yellow eyes", "dark urine", "fatigue", "abdominal pain", "jaundice"],
    "Hepatitis": ["fatigue", "nausea", "abdominal pain", "yellow skin", "dark urine", "loss of appetite", "hepatitis"],
    "Allergy": ["sneezing", "runny nose", "itchy eyes", "rash", "hives", "swelling", "allergy"],
    "Food Poisoning": ["nausea", "vomiting", "diarrhea", "stomach cramps", "fever", "food poisoning"],
    "Vertigo": ["dizziness", "spinning sensation", "nausea", "balance problems", "vertigo"],
    "Depression": ["sadness", "fatigue", "loss of interest", "sleep problems", "hopelessness", "depression"],
    "Anxiety": ["worry", "restlessness", "rapid heartbeat", "sweating", "trembling", "anxiety"],
}

# Multilingual translation dictionary to map native spoken keywords to standardized symptoms
MULTILINGUAL_SYMPTOM_MAP = {
    # ── Tamil (தமிழ்) ────────────────────────────────────────────────────────
    "காய்ச்சல்": "fever",
    "சுரம்": "fever",
    "தலைவலி": "headache",
    "தலை வலி": "headache",
    "இருமல்": "cough",
    "சளி": "cold",
    "தொண்டை வலி": "sore throat",
    "நெஞ்சு வலி": "chest pain",
    "மூச்சு திணறல்": "shortness of breath",
    "மூச்சுத்திணறல்": "shortness of breath",
    "வாந்தி": "vomiting",
    "மயக்கம்": "dizziness",
    "தலைச்சுற்றல்": "dizziness",
    "வயிற்று வலி": "stomach pain",
    "வயிற்றுப்போக்கு": "diarrhea",
    "களைப்பு": "fatigue",
    "சோர்வு": "fatigue",
    "மூட்டு வலி": "joint pain",
    "உடல் வலி": "body pain",
    "அரிப்பு": "itchy rash",
    "சர்க்கரை": "diabetes",
    "நெஞ்சு இறுக்கம்": "chest tightness",

    # ── Hindi (हिन्दी) ────────────────────────────────────────────────────────
    "बुखार": "fever",
    "तेज बुखार": "high fever",
    "सिरदर्द": "headache",
    "सिर दर्द": "headache",
    "खांसी": "cough",
    "जुकाम": "cold",
    "गले में खराश": "sore throat",
    "गले में दर्द": "sore throat",
    "सीने में दर्द": "chest pain",
    "छाती में दर्द": "chest pain",
    "सांस लेने में तकलीफ": "shortness of breath",
    "सांस फूलना": "shortness of breath",
    "उल्टी": "vomiting",
    "जी मिचलाना": "nausea",
    "चक्कर": "dizziness",
    "पेट दर्द": "stomach pain",
    "पेट में दर्द": "stomach pain",
    "दस्त": "diarrhea",
    "थकान": "fatigue",
    "कमजोरी": "weakness",
    "जोड़ों का दर्द": "joint pain",
    "बदन दर्द": "body pain",
    "शरीर में दर्द": "body pain",
    "खुजली": "itchy rash",
    "दाने": "rash",
    "मधुमेह": "diabetes",
    "bukhar": "fever",
    "sirdard": "headache",
    "sar dard": "headache",
    "khasi": "cough",
    "ulti": "vomiting",
    "chakkar": "dizziness",
    "pet dard": "stomach pain",
    "badan dard": "body pain",

    # ── Telugu (తెలుగు) ─────────────────────────────────────────────────────
    "జ్వరం": "fever",
    "తలనొప్పి": "headache",
    "దగ్గు": "cough",
    "జలుబు": "cold",
    "గొంతు నొప్పి": "sore throat",
    "ఛాతీ నొప్పి": "chest pain",
    "శ్వాస తీసుకోవడంలో ఇబ్బంది": "shortness of breath",
    "వాంతులు": "vomiting",
    "వికారం": "nausea",
    "తలతిరగడం": "dizziness",
    "కడుపు నొప్పి": "stomach pain",
    "విరేచనాలు": "diarrhea",
    "అలసట": "fatigue",
    "కీళ్ల నొప్పులు": "joint pain",
    "ఒళ్లు నొప్పులు": "body pain",
    "దురద": "itchy rash",
    "చక్కెర వ్యాధి": "diabetes",

    # ── Spanish (Español) ───────────────────────────────────────────────────
    "fiebre": "fever",
    "fiebre alta": "high fever",
    "dolor de cabeza": "headache",
    "tos": "cough",
    "resfriado": "cold",
    "dolor de garganta": "sore throat",
    "dolor en el pecho": "chest pain",
    "dolor de pecho": "chest pain",
    "dificultad para respirar": "shortness of breath",
    "falta de aire": "shortness of breath",
    "vomitos": "vomiting",
    "vómitos": "vomiting",
    "nauseas": "nausea",
    "náuseas": "nausea",
    "mareos": "dizziness",
    "mareo": "dizziness",
    "dolor de estomago": "stomach pain",
    "dolor de estómago": "stomach pain",
    "dolor abdominal": "abdominal pain",
    "diarrea": "diarrhea",
    "fatiga": "fatigue",
    "cansancio": "fatigue",
    "dolor en las articulaciones": "joint pain",
    "dolor muscular": "muscle pain",
    "dolor de cuerpo": "body pain",
    "erupcion": "rash",
    "erupción": "rash",
    "picazon": "itchy rash",
    "picazón": "itchy rash",
    "diabetes": "diabetes",
}

# Flatten all known symptom keywords for matching
ALL_SYMPTOM_WORDS = set()
for symptoms in DISEASE_SYMPTOMS.values():
    for s in symptoms:
        for word in s.split():
            ALL_SYMPTOM_WORDS.add(word.lower())

STOPWORDS = {
    "i", "have", "am", "is", "are", "was", "been", "be", "the", "a", "an",
    "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "my",
    "me", "we", "you", "he", "she", "it", "they", "this", "that", "these",
    "those", "do", "does", "did", "will", "would", "could", "should", "may",
    "might", "can", "not", "no", "very", "so", "also", "just", "some",
    "feeling", "feel", "felt", "since", "days", "day", "week", "weeks",
    "experiencing", "experience", "having", "had", "get", "got", "getting",
    # Hindi stopwords
    "मुझे", "है", "और", "में", "हो", "रहा", "रही", "से", "का", "की", "के",
    # Tamil stopwords
    "எனக்கு", "மற்றும்", "உள்ளது", "இருக்கிறது", "ஒரு", "ஆக",
    # Telugu stopwords
    "నాకు", "మరియు", "ఉంది", "గా",
    # Spanish stopwords
    "tengo", "el", "la", "los", "las", "un", "una", "y", "o", "en", "de", "con", "por", "desde",
}


class ExtractRequest(BaseModel):
    text: str


class ExtractResponse(BaseModel):
    symptoms: List[str]


class PredictRequest(BaseModel):
    symptoms: List[str]


class PredictResponse(BaseModel):
    predictedDisease: str
    confidenceScore: float


def extract_symptom_phrases(text: str) -> List[str]:
    """Extract and normalize symptom keywords from free text across multiple languages."""
    lower_text = text.lower()

    matched = []

    # 1. Check Multilingual mappings (Tamil, Hindi, Telugu, Spanish, Hinglish)
    for foreign_phrase, eng_sym in MULTILINGUAL_SYMPTOM_MAP.items():
        if foreign_phrase.lower() in lower_text:
            matched.append(eng_sym)

    # 2. Check English multi-word phrases
    for disease_symptoms in DISEASE_SYMPTOMS.values():
        for phrase in disease_symptoms:
            if phrase in lower_text:
                matched.append(phrase)

    # 3. Tokenize & check individual English keywords
    cleaned_text = re.sub(r"[^\w\s]", " ", lower_text)
    tokens = cleaned_text.split()
    filtered = [t for t in tokens if t not in STOPWORDS and len(t) > 2]

    for token in filtered:
        if token in ALL_SYMPTOM_WORDS:
            matched.append(token)

    # Deduplicate preserving order
    seen = set()
    result = []
    for item in matched:
        if item not in seen:
            seen.add(item)
            result.append(item)

    return result if result else filtered[:10]


def predict_disease_knn(symptoms: List[str]) -> tuple:
    """Cosine-similarity based disease prediction against symptom vectors."""
    symptom_set = set(s.lower() for s in symptoms)

    # Expand symptom set with individual words from multi-word symptoms
    expanded = set()
    for s in symptom_set:
        expanded.update(s.split())
    symptom_set = symptom_set | expanded

    scores = {}
    for disease, disease_symptoms in DISEASE_SYMPTOMS.items():
        disease_words = set()
        for ds in disease_symptoms:
            disease_words.add(ds)
            disease_words.update(ds.split())

        intersection = len(symptom_set & disease_words)
        union = len(symptom_set | disease_words)
        scores[disease] = intersection / union if union > 0 else 0.0

    if not scores or max(scores.values()) == 0:
        return "General Illness", 0.40

    best_disease = max(scores, key=scores.get)
    confidence = min(scores[best_disease] * 2.5, 0.99)  # scale up for readability
    return best_disease, round(confidence, 2)


@app.post("/extract-symptoms", response_model=ExtractResponse)
def extract_symptoms(request: ExtractRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    symptoms = extract_symptom_phrases(text)
    return ExtractResponse(symptoms=symptoms)


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    if not request.symptoms:
        raise HTTPException(status_code=400, detail="Symptoms are required")
    disease, confidence = predict_disease_knn(request.symptoms)
    return PredictResponse(predictedDisease=disease, confidenceScore=confidence)
