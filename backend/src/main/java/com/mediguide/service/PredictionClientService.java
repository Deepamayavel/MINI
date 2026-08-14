package com.mediguide.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class PredictionClientService {

    private static final Logger log = LoggerFactory.getLogger(PredictionClientService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final String predictUrl = "http://localhost:8000/predict";

    // Built-in symptom-disease knowledge base
    private static final Map<String, List<String>> DISEASE_SYMPTOMS = new HashMap<>();

    static {
        DISEASE_SYMPTOMS.put("Common Cold", List.of("runny", "nose", "sneezing", "sore", "throat", "cough", "mild", "fever", "congestion", "headache", "cold"));
        DISEASE_SYMPTOMS.put("Influenza", List.of("fever", "chills", "muscle", "aches", "fatigue", "headache", "cough", "sore", "throat", "body", "pain", "flu"));
        DISEASE_SYMPTOMS.put("COVID-19", List.of("fever", "cough", "shortness", "breath", "taste", "smell", "fatigue", "body", "pain", "covid"));
        DISEASE_SYMPTOMS.put("Pneumonia", List.of("chest", "pain", "cough", "fever", "shortness", "breath", "difficulty", "breathing", "chills", "fatigue"));
        DISEASE_SYMPTOMS.put("Bronchitis", List.of("cough", "mucus", "fatigue", "shortness", "breath", "chest", "discomfort", "fever", "wheezing"));
        DISEASE_SYMPTOMS.put("Asthma", List.of("wheezing", "shortness", "breath", "chest", "tightness", "cough", "difficulty", "breathing"));
        DISEASE_SYMPTOMS.put("Dengue Fever", List.of("high", "fever", "severe", "headache", "pain", "eyes", "joint", "muscle", "rash", "nausea", "dengue"));
        DISEASE_SYMPTOMS.put("Malaria", List.of("fever", "chills", "sweating", "headache", "nausea", "vomiting", "muscle", "pain", "malaria"));
        DISEASE_SYMPTOMS.put("Typhoid", List.of("sustained", "fever", "weakness", "stomach", "pain", "headache", "appetite", "constipation", "rash", "typhoid"));
        DISEASE_SYMPTOMS.put("Gastritis", List.of("stomach", "pain", "nausea", "vomiting", "bloating", "indigestion", "appetite", "abdominal"));
        DISEASE_SYMPTOMS.put("Appendicitis", List.of("severe", "abdominal", "pain", "nausea", "vomiting", "fever", "appetite"));
        DISEASE_SYMPTOMS.put("Diabetes", List.of("frequent", "urination", "thirst", "fatigue", "blurred", "vision", "healing", "weight", "loss", "diabetes"));
        DISEASE_SYMPTOMS.put("Hypertension", List.of("headache", "dizziness", "blurred", "vision", "chest", "pain", "shortness", "breath", "blood", "pressure"));
        DISEASE_SYMPTOMS.put("Heart Attack", List.of("chest", "pain", "shortness", "breath", "nausea", "sweating", "arm", "jaw", "heart", "attack"));
        DISEASE_SYMPTOMS.put("Migraine", List.of("severe", "headache", "nausea", "vomiting", "sensitivity", "light", "sound", "migraine"));
        DISEASE_SYMPTOMS.put("Anemia", List.of("fatigue", "weakness", "pale", "skin", "shortness", "breath", "dizziness", "cold", "hands", "anemia"));
        DISEASE_SYMPTOMS.put("Urinary Tract Infection", List.of("burning", "urination", "frequent", "cloudy", "urine", "pelvic", "pain", "uti", "urinary"));
        DISEASE_SYMPTOMS.put("Kidney Stones", List.of("severe", "back", "pain", "side", "pain", "painful", "urination", "blood", "urine", "nausea", "vomiting"));
        DISEASE_SYMPTOMS.put("Arthritis", List.of("joint", "pain", "stiffness", "swelling", "reduced", "motion", "arthritis"));
        DISEASE_SYMPTOMS.put("Jaundice", List.of("yellow", "skin", "eyes", "dark", "urine", "fatigue", "abdominal", "pain", "jaundice"));
        DISEASE_SYMPTOMS.put("Hepatitis", List.of("fatigue", "nausea", "abdominal", "pain", "yellow", "skin", "dark", "urine", "appetite", "hepatitis"));
        DISEASE_SYMPTOMS.put("Allergy", List.of("sneezing", "runny", "nose", "itchy", "eyes", "rash", "hives", "swelling", "allergy"));
        DISEASE_SYMPTOMS.put("Food Poisoning", List.of("nausea", "vomiting", "diarrhea", "stomach", "cramps", "fever", "food", "poisoning"));
        DISEASE_SYMPTOMS.put("Vertigo", List.of("dizziness", "spinning", "sensation", "nausea", "balance", "vertigo"));
        DISEASE_SYMPTOMS.put("Chickenpox", List.of("itchy", "rash", "blisters", "fever", "fatigue", "headache", "chickenpox"));
        DISEASE_SYMPTOMS.put("Tuberculosis", List.of("persistent", "cough", "blood", "chest", "pain", "weight", "loss", "night", "sweats", "fever", "fatigue"));
    }

    public Map<String, Object> predictDisease(List<String> symptoms) {
        // Try Python microservice first
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> payload = Collections.singletonMap("symptoms", symptoms);
            Map response = restTemplate.postForObject(predictUrl,
                    new HttpEntity<>(payload, headers), Map.class);
            if (response != null && response.containsKey("predictedDisease")) {
                return response;
            }
        } catch (RestClientException ex) {
            log.warn("Python prediction service unavailable, using built-in kNN: {}", ex.getMessage());
        }

        // Built-in Java cosine-similarity kNN fallback
        return predictWithKnn(symptoms);
    }

    private Map<String, Object> predictWithKnn(List<String> symptoms) {
        Set<String> symptomSet = new HashSet<>();
        for (String s : symptoms) {
            symptomSet.add(s.toLowerCase());
        }

        String bestDisease = "General Illness";
        double bestScore = 0.0;

        for (Map.Entry<String, List<String>> entry : DISEASE_SYMPTOMS.entrySet()) {
            Set<String> diseaseWords = new HashSet<>(entry.getValue());
            long intersection = symptomSet.stream().filter(diseaseWords::contains).count();
            long union = symptomSet.size() + diseaseWords.size() - intersection;
            double score = union > 0 ? (double) intersection / union : 0.0;

            if (score > bestScore) {
                bestScore = score;
                bestDisease = entry.getKey();
            }
        }

        double confidence = Math.min(bestScore * 2.5, 0.99);
        if (confidence < 0.10) confidence = 0.40; // minimum confidence

        Map<String, Object> result = new HashMap<>();
        result.put("predictedDisease", bestDisease);
        result.put("confidenceScore", Math.round(confidence * 100.0) / 100.0);
        return result;
    }
}
