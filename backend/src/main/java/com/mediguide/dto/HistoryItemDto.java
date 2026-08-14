package com.mediguide.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
public class HistoryItemDto {
    private String id;
    private String rawText;
    private List<String> extractedSymptoms;
    private String predictedDisease;
    private Instant timestamp;
}
