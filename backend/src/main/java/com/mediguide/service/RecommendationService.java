package com.mediguide.service;

import com.mediguide.dto.RecommendationDto;
import com.mediguide.exception.ForbiddenException;
import com.mediguide.exception.ResourceNotFoundException;
import com.mediguide.model.Query;
import com.mediguide.model.Recommendation;
import com.mediguide.repository.QueryRepository;
import com.mediguide.repository.RecommendationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final QueryRepository queryRepository;

    public RecommendationService(RecommendationRepository recommendationRepository, QueryRepository queryRepository) {
        this.recommendationRepository = recommendationRepository;
        this.queryRepository = queryRepository;
    }

    public RecommendationDto getLatestRecommendation(String userId) {
        Recommendation recommendation = recommendationRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No recommendations found"));
        return toRecommendationDto(recommendation);
    }

    public Page<RecommendationDto> getRecommendations(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return recommendationRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toRecommendationDto);
    }

    public RecommendationDto getRecommendationById(String userId, String id) {
        Recommendation recommendation = recommendationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found"));

        if (!recommendation.getUserId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }

        return toRecommendationDto(recommendation);
    }

    private String resolveRawText(Recommendation recommendation) {
        if (recommendation.getRawText() != null && !recommendation.getRawText().isBlank()) {
            return recommendation.getRawText();
        }
        if (recommendation.getQueryId() != null) {
            return queryRepository.findById(recommendation.getQueryId())
                    .map(Query::getRawText)
                    .orElse(null);
        }
        return null;
    }

    private RecommendationDto toRecommendationDto(Recommendation recommendation) {
        return RecommendationDto.builder()
                .id(recommendation.getId())
                .queryId(recommendation.getQueryId())
                .rawText(resolveRawText(recommendation))
                .predictedDisease(recommendation.getPredictedDisease())
                .specialist(recommendation.getSpecialist())
                .diagnosticTests(recommendation.getDiagnosticTests())
                .hospitals(recommendation.getHospitals())
                .precautions(recommendation.getPrecautions())
                .topPredictions(recommendation.getTopPredictions())
                .createdAt(recommendation.getCreatedAt())
                .build();
    }
}
