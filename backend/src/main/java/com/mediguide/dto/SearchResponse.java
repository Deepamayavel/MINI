package com.mediguide.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class SearchResponse {
    private String predictedDisease;
    private Double confidenceScore;
    private String recommendedSpecialist;
    private List<String> recommendedTests;
    private List<String> recommendedHospitals;
    private List<String> precautions;
}
