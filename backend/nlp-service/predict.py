"""Flask disease-symptom demo service using spaCy and kNN cosine similarity.

This is decision support for demonstration only; it is not a medical diagnosis.
"""

from collections import defaultdict
from functools import lru_cache
from pathlib import Path
import re

import numpy as np
import pandas as pd
import spacy
from flask import Flask, jsonify, request
from sklearn.metrics.pairwise import cosine_similarity


ROOT = Path(__file__).parent
DATASET_PATH = ROOT / "disease_symptoms.csv"

# Common user wording mapped to dataset wording after spaCy lemmatization.
ALIASES = {
    "dizzy": "dizziness",
    "throw up": "vomiting",
    "throwing up": "vomiting",
    "stomach ache": "stomach pain",
}


def normalize_phrase(phrase: str, nlp) -> str:
    doc = nlp(phrase.replace("_", " ").lower())
    return " ".join(token.lemma_.lower() for token in doc if token.is_alpha and not token.is_stop)


@lru_cache(maxsize=1)
def load_model_data():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

    nlp = spacy.load("en_core_web_sm", disable=["ner", "parser"])
    frame = pd.read_csv(DATASET_PATH)
    if not {"Disease", "Symptoms"}.issubset(frame.columns):
        raise ValueError("disease_symptoms.csv must have Disease and Symptoms columns")

    row_symptoms = []
    vocabulary = set()
    for text in frame["Symptoms"].fillna(""):
        symptoms = {
            normalize_phrase(item, nlp)
            for item in str(text).split(",")
            if normalize_phrase(item, nlp)
        }
        row_symptoms.append(symptoms)
        vocabulary.update(symptoms)

    features = sorted(vocabulary)
    index = {feature: position for position, feature in enumerate(features)}
    matrix = np.zeros((len(frame), len(features)), dtype=np.float32)
    for row_index, symptoms in enumerate(row_symptoms):
        for symptom in symptoms:
            matrix[row_index, index[symptom]] = 1.0

    return nlp, frame, features, index, matrix


def extract_symptoms(text: str) -> list[str]:
    """Extract known symptom phrases using spaCy tokenization and lemmatization."""
    nlp, _, features, _, _ = load_model_data()
    normalized_text = normalize_phrase(text, nlp)
    normalized_text = ALIASES.get(normalized_text, normalized_text)
    tokens = normalized_text.split()
    max_length = max((len(feature.split()) for feature in features), default=1)
    matches = set()

    for length in range(1, min(max_length, len(tokens)) + 1):
        for start in range(len(tokens) - length + 1):
            phrase = " ".join(tokens[start:start + length])
            phrase = ALIASES.get(phrase, phrase)
            if phrase in features:
                matches.add(phrase)
    return sorted(matches)


def to_vector(symptoms: list[str]) -> np.ndarray:
    """Convert extracted symptom phrases to a binary feature vector."""
    _, _, features, index, _ = load_model_data()
    vector = np.zeros((1, len(features)), dtype=np.float32)
    for symptom in symptoms:
        if symptom in index:
            vector[0, index[symptom]] = 1.0
    return vector


def predict_disease(text: str, k: int = 3) -> dict:
    """Rank dataset rows by cosine similarity and majority-vote the top k diseases."""
    if not text or not text.strip():
        raise ValueError("text is required")

    nlp, frame, _, _, matrix = load_model_data()
    symptoms = extract_symptoms(text)
    vector = to_vector(symptoms)
    if not symptoms or not vector.any():
        return {"predictedDisease": "Insufficient information", "confidence": 0.0, "extractedSymptoms": symptoms}

    scores = cosine_similarity(vector, matrix)[0]
    top_indices = np.argsort(scores)[::-1][:max(1, min(k, len(scores)))]
    votes = defaultdict(lambda: {"count": 0, "similarity": 0.0})
    for row_index in top_indices:
        disease = str(frame.iloc[row_index]["Disease"])
        votes[disease]["count"] += 1
        votes[disease]["similarity"] += float(scores[row_index])

    disease, vote = max(votes.items(), key=lambda item: (item[1]["count"], item[1]["similarity"], item[0]))
    confidence = round(vote["similarity"] / vote["count"], 4)
    return {
        "predictedDisease": disease,
        "confidence": confidence,
        "extractedSymptoms": symptoms,
    }


app = Flask(__name__)


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    try:
        result = predict_disease(payload.get("text", ""), int(payload.get("k", 3)))
    except (TypeError, ValueError) as error:
        return jsonify({"error": str(error)}), 400
    return jsonify(result)


@app.get("/health")
def health():
    _, frame, features, _, _ = load_model_data()
    return jsonify({"status": "UP", "diseases": int(frame["Disease"].nunique()), "features": len(features)})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=False)
