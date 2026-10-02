package com.mediguide.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SearchResponse {
    private String predictedDisease;
    private Double confidenceScore;
    private String recommendedSpecialist;
    private List<String> recommendedTests;
    private List<String> recommendedHospitals;
    private List<String> precautions;
    private List<TopPredictionDto> topPredictions;
    private java.util.Map<String, Object> metrics;
}

