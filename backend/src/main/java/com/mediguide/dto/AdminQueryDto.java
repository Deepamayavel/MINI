package com.mediguide.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
public class AdminQueryDto {
    private String id;
    private String userId;
    private String rawText;
    private List<String> extractedSymptoms;
    private String predictedDisease;
    private Double confidenceScore;
    private Instant timestamp;
}
