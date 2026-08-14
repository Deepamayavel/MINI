package com.mediguide.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NlpClientService {

    private static final Logger log = LoggerFactory.getLogger(NlpClientService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final String nlpUrl = "http://localhost:5000/extract-symptoms";

    private static final Set<String> STOPWORDS = Set.of(
            "i", "have", "am", "is", "are", "was", "been", "be", "the", "a", "an",
            "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "my",
            "me", "we", "you", "he", "she", "it", "they", "this", "that", "these",
            "those", "do", "does", "did", "will", "would", "could", "should", "may",
            "might", "can", "not", "no", "very", "so", "also", "just", "some",
            "feeling", "feel", "felt", "since", "days", "day", "week", "weeks",
            "experiencing", "experience", "having", "had", "get", "got", "getting",
            "from", "by", "about", "like", "into", "through"
    );

    public List<String> extractSymptoms(String rawText) {
        // Try Python microservice first
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, String> payload = Collections.singletonMap("text", rawText);
            Map response = restTemplate.postForObject(nlpUrl,
                    new HttpEntity<>(payload, headers), Map.class);
            if (response != null && response.containsKey("symptoms")) {
                List<String> symptoms = (List<String>) response.get("symptoms");
                if (symptoms != null && !symptoms.isEmpty()) {
                    return symptoms;
                }
            }
        } catch (RestClientException ex) {
            log.warn("Python NLP service unavailable, using built-in extraction: {}", ex.getMessage());
        }

        // Built-in Java fallback: tokenize + stopword removal
        return Arrays.stream(rawText.toLowerCase()
                        .replaceAll("[^a-z\\s]", " ")
                        .split("\\s+"))
                .filter(token -> token.length() > 2 && !STOPWORDS.contains(token))
                .distinct()
                .collect(Collectors.toList());
    }
}
