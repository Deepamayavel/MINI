package com.mediguide.model;

import com.mediguide.dto.TopPredictionDto;
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
@Document(collection = "recommendations")
public class Recommendation {
    @Id
    private String id;
    private String userId;
    private String queryId;
    private String predictedDisease;
    private String specialist;
    private List<String> diagnosticTests;
    private List<String> hospitals;
    private List<String> precautions;
    private List<TopPredictionDto> topPredictions;
    private Instant createdAt;
}

