package com.mediguide.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClinicalPathwayBundleDto {
    // 1. Disease
    private String diseaseName;
    private String category;
    private Double severityScore;
    private String description;
    private String precautions;

    // 2. Symptoms
    private List<String> symptoms;

    // 3. Specialist
    private String specialistName;
    private String specialty;
    private String experience;
    private String consultationFee;
    private String specialistContact;

    // 4. Diagnostic Test
    private String testName;
    private String testCategory;
    private String turnaroundTime;
    private Double approxCost;
    private String testDescription;

    // 5. Hospital Facility
    private String hospitalName;
    private String hospitalCity;
    private String hospitalState;
    private String hospitalType;
    private Boolean emergencyAvailable;
    private Boolean icuAvailable;
    private String hospitalContact;
    private String hospitalAddress;
    private Double hospitalRating;
    private Integer bedCapacity;
}
