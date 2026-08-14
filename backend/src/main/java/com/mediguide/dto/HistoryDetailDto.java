package com.mediguide.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
public class HistoryDetailDto {
    private String id;
    private String rawText;
    private List<String> extractedSymptoms;
    private String predictedDisease;
    private Double confidenceScore;
    private Instant timestamp;
    private RecommendationDto recommendation;
}
