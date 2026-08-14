package com.mediguide.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardSummaryDto {
    private long totalSearches;
    private long totalRecommendations;
    private String lastSearchDate;
}
