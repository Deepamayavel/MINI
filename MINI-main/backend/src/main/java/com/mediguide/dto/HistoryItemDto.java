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
public class HistoryItemDto {
    private String id;
    private String rawText;
    private List<String> extractedSymptoms;
    private String predictedDisease;
    private List<TopPredictionDto> topPredictions;
    private Instant timestamp;
}

