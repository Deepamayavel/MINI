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
    """Extract symptom keywords from free text using tokenization + stopword removal."""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    tokens = text.split()
    filtered = [t for t in tokens if t not in STOPWORDS and len(t) > 2]

    # Also try to match multi-word symptom phrases
    matched = []
    for disease_symptoms in DISEASE_SYMPTOMS.values():
        for phrase in disease_symptoms:
            if phrase in text:
                matched.append(phrase)

    # Add individual meaningful tokens
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
