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

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rawTopList = (List<Map<String, Object>>) prediction.get("topPredictions");
        java.util.List<com.mediguide.dto.TopPredictionDto> topPredictions = new java.util.ArrayList<>();

        if (rawTopList != null && !rawTopList.isEmpty()) {
            for (Map<String, Object> item : rawTopList) {
                String dis = (String) item.get("disease");
                Double conf = ((Number) item.getOrDefault("confidenceScore", 0.0)).doubleValue();
                Integer rank = ((Number) item.getOrDefault("rank", 1)).intValue();

                OntologyService.OntologyResult disOntology = ontologyService.fetchRecommendations(dis);
                topPredictions.add(com.mediguide.dto.TopPredictionDto.builder()
                        .disease(dis)
                        .confidenceScore(conf)
                        .rank(rank)
                        .recommendedSpecialist(disOntology.getSpecialists().stream().findFirst().orElse("General Physician"))
                        .recommendedTests(disOntology.getTests())
                        .recommendedHospitals(disOntology.getHospitals())
                        .precautions(disOntology.getPrecautions())
                        .build());
            }
        }

        OntologyService.OntologyResult ontologyResult = ontologyService.fetchRecommendations(predictedDisease);

        SearchResponse response = SearchResponse.builder()
                .predictedDisease(predictedDisease)
                .confidenceScore(confidenceScore)
                .recommendedSpecialist(ontologyResult.getSpecialists().stream().findFirst().orElse("General Physician"))
                .recommendedTests(ontologyResult.getTests())
                .recommendedHospitals(ontologyResult.getHospitals())
                .precautions(ontologyResult.getPrecautions())
                .topPredictions(topPredictions)
                .build();

        Query query = Query.builder()
                .userId(userId)
                .rawText(request.getSymptomText())
                .extractedSymptoms(extractedSymptoms)
                .predictedDisease(predictedDisease)
                .confidenceScore(confidenceScore)
                .topPredictions(topPredictions)
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
                .topPredictions(topPredictions)
                .createdAt(Instant.now())
                .build();

        recommendationRepository.save(recommendation);
        return response;
    }
}
