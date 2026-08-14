package com.mediguide.service;

import com.mediguide.dto.HistoryDetailDto;
import com.mediguide.dto.HistoryItemDto;
import com.mediguide.dto.RecommendationDto;
import com.mediguide.exception.ForbiddenException;
import com.mediguide.exception.ResourceNotFoundException;
import com.mediguide.model.Query;
import com.mediguide.repository.QueryRepository;
import com.mediguide.repository.RecommendationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HistoryService {

    private final QueryRepository queryRepository;
    private final RecommendationRepository recommendationRepository;

    public HistoryService(QueryRepository queryRepository, RecommendationRepository recommendationRepository) {
        this.queryRepository = queryRepository;
        this.recommendationRepository = recommendationRepository;
    }

    public Page<HistoryItemDto> getHistory(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return queryRepository.findAllByUserIdOrderByTimestampDesc(userId, pageable)
                .map(this::toHistoryItemDto);
    }

    public HistoryDetailDto getHistoryDetail(String userId, String queryId) {
        Query query = queryRepository.findById(queryId)
                .orElseThrow(() -> new ResourceNotFoundException("Query not found"));

        if (!query.getUserId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }

        RecommendationDto recommendation = recommendationRepository.findByQueryId(queryId)
                .map(this::toRecommendationDto)
                .orElse(null);

        return new HistoryDetailDto(
                query.getId(),
                query.getRawText(),
                query.getExtractedSymptoms(),
                query.getPredictedDisease(),
                query.getConfidenceScore(),
                query.getTimestamp(),
                recommendation
        );
    }

    public void deleteHistory(String userId, String queryId) {
        Query query = queryRepository.findById(queryId)
                .orElseThrow(() -> new ResourceNotFoundException("Query not found"));

        if (!query.getUserId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }

        queryRepository.delete(query);
    }

    private HistoryItemDto toHistoryItemDto(Query query) {
        return new HistoryItemDto(
                query.getId(),
                query.getRawText(),
                query.getExtractedSymptoms(),
                query.getPredictedDisease(),
                query.getTimestamp()
        );
    }

    private RecommendationDto toRecommendationDto(com.mediguide.model.Recommendation recommendation) {
        return new RecommendationDto(
                recommendation.getId(),
                recommendation.getQueryId(),
                recommendation.getPredictedDisease(),
                recommendation.getSpecialist(),
                recommendation.getDiagnosticTests(),
                recommendation.getHospitals(),
                recommendation.getPrecautions(),
                recommendation.getCreatedAt()
        );
    }
}
