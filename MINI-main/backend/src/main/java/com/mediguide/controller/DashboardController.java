package com.mediguide.controller;

import com.mediguide.dto.DashboardSummaryDto;
import com.mediguide.model.Query;
import com.mediguide.repository.QueryRepository;
import com.mediguide.repository.RecommendationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final QueryRepository queryRepository;
    private final RecommendationRepository recommendationRepository;

    public DashboardController(QueryRepository queryRepository, RecommendationRepository recommendationRepository) {
        this.queryRepository = queryRepository;
        this.recommendationRepository = recommendationRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary(Authentication authentication) {
        String userId = authentication.getName();

        long totalSearches = queryRepository.countByUserId(userId);
        long totalRecommendations = recommendationRepository.countByUserId(userId);

        String lastSearchDate = queryRepository
                .findFirstByUserIdOrderByTimestampDesc(userId)
                .map(Query::getTimestamp)
                .map(t -> t.toString())
                .orElse(null);

        return ResponseEntity.ok(new DashboardSummaryDto(totalSearches, totalRecommendations, lastSearchDate));
    }
}
