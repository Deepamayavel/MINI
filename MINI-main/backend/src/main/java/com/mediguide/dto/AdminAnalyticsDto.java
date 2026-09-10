package com.mediguide.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class AdminAnalyticsDto {
    private long totalUsers;
    private long totalQueries;
    private long totalRecommendations;
    private List<DiseaseCount> mostCommonPredictedDiseases;
    private Map<String, Long> queriesPerDay;
    private long activeUsersToday;

    @Data
    @AllArgsConstructor
    public static class DiseaseCount {
        private String disease;
        private long count;
    }
}
