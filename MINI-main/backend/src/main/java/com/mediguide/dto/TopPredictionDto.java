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
public class TopPredictionDto {
    private String disease;
    private Double confidenceScore;
    private Integer rank;
    private String recommendedSpecialist;
    private List<String> recommendedTests;
    private List<String> recommendedHospitals;
    private List<String> precautions;
    private java.util.Map<String, Object> metrics;
}
