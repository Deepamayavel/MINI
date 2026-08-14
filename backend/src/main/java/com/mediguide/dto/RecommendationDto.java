package com.mediguide.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
public class RecommendationDto {
    private String id;
    private String queryId;
    private String predictedDisease;
    private String specialist;
    private List<String> diagnosticTests;
    private List<String> hospitals;
    private List<String> precautions;
    private Instant createdAt;
}
