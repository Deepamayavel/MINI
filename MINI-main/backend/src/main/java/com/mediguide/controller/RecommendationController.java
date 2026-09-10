package com.mediguide.controller;

import com.mediguide.dto.RecommendationDto;
import com.mediguide.service.RecommendationService;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/latest")
    public ResponseEntity<RecommendationDto> getLatestRecommendation(Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(recommendationService.getLatestRecommendation(userId));
    }

    @GetMapping
    public ResponseEntity<Page<RecommendationDto>> getRecommendations(
            Authentication authentication,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(recommendationService.getRecommendations(userId, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecommendationDto> getRecommendationById(Authentication authentication, @PathVariable String id) {
        String userId = authentication.getName();
        return ResponseEntity.ok(recommendationService.getRecommendationById(userId, id));
    }
}
