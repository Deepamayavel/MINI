package com.mediguide.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "queries")
public class Query {
    @Id
    private String id;
    private String userId;
    private String rawText;
    private List<String> extractedSymptoms;
    private String predictedDisease;
    private Double confidenceScore;
    private Instant timestamp;
}
