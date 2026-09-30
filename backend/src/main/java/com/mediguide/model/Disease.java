package com.mediguide.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "diseases")
public class Disease {
    @Id
    private String id;
    private String name;
    private String description;
    private Double severityScore;
    private String category;
    private String commonSymptoms;
    private String recommendedSpecialist;
    private String precautions;
}
