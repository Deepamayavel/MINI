package com.mediguide.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecommendationDto {
    private String id;
    private String queryId;
    private String rawText;
    private String predictedDisease;
    private String specialist;
    private List<String> diagnosticTests;
    private List<String> hospitals;
    private List<String> precautions;
    private List<TopPredictionDto> topPredictions;
    private Instant createdAt;
}

