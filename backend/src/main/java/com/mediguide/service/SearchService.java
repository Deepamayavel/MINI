package com.mediguide.service;

import com.mediguide.dto.SearchRequest;
import com.mediguide.dto.SearchResponse;
import com.mediguide.exception.ServiceUnavailableException;
import com.mediguide.model.Query;
import com.mediguide.model.Recommendation;
import com.mediguide.repository.QueryRepository;
import com.mediguide.repository.RecommendationRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class SearchService {

    private final NlpClientService nlpClientService;
    private final PredictionClientService predictionClientService;
    private final OntologyService ontologyService;
    private final QueryRepository queryRepository;
    private final RecommendationRepository recommendationRepository;

    public SearchService(NlpClientService nlpClientService,
                         PredictionClientService predictionClientService,
                         OntologyService ontologyService,
                         QueryRepository queryRepository,
                         RecommendationRepository recommendationRepository) {
        this.nlpClientService = nlpClientService;
        this.predictionClientService = predictionClientService;
        this.ontologyService = ontologyService;
        this.queryRepository = queryRepository;
        this.recommendationRepository = recommendationRepository;
    }

    public SearchResponse search(String userId, SearchRequest request) {
        List<String> extractedSymptoms = nlpClientService.extractSymptoms(request.getSymptomText());
        if (extractedSymptoms.isEmpty()) {
            throw new ServiceUnavailableException("Unable to extract symptoms from the provided text.");
        }

        Map<String, Object> prediction = predictionClientService.predictDisease(extractedSymptoms);
        String predictedDisease = (String) prediction.getOrDefault("predictedDisease", "Unknown");
        Double confidenceScore = ((Number) prediction.getOrDefault("confidenceScore", 0)).doubleValue();

        OntologyService.OntologyResult ontologyResult = ontologyService.fetchRecommendations(predictedDisease);

        SearchResponse response = new SearchResponse(
                predictedDisease,
                confidenceScore,
                ontologyResult.getSpecialists().stream().findFirst().orElse("General Physician"),
                ontologyResult.getTests(),
                ontologyResult.getHospitals(),
                ontologyResult.getPrecautions()
        );

        Query query = Query.builder()
                .userId(userId)
                .rawText(request.getSymptomText())
                .extractedSymptoms(extractedSymptoms)
                .predictedDisease(predictedDisease)
                .confidenceScore(confidenceScore)
                .timestamp(Instant.now())
                .build();

        Query savedQuery = queryRepository.save(query);

        Recommendation recommendation = Recommendation.builder()
                .userId(userId)
                .queryId(savedQuery.getId())
                .predictedDisease(predictedDisease)
                .specialist(response.getRecommendedSpecialist())
                .diagnosticTests(response.getRecommendedTests())
                .hospitals(response.getRecommendedHospitals())
                .precautions(response.getPrecautions())
                .createdAt(Instant.now())
                .build();

        recommendationRepository.save(recommendation);
        return response;
    }
}
