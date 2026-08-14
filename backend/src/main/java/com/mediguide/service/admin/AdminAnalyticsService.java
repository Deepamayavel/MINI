package com.mediguide.service.admin;

import com.mediguide.dto.AdminAnalyticsDto;
import com.mediguide.model.Query;
import com.mediguide.model.Recommendation;
import com.mediguide.model.User;
import com.mediguide.repository.AdminQueryRepository;
import com.mediguide.repository.AdminUserRepository;
import com.mediguide.repository.RecommendationRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.MatchOperation;
import org.springframework.data.mongodb.core.aggregation.SortOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminAnalyticsService {

    private final MongoTemplate mongoTemplate;
    private final AdminUserRepository userRepository;
    private final AdminQueryRepository queryRepository;
    private final RecommendationRepository recommendationRepository;

    public AdminAnalyticsService(MongoTemplate mongoTemplate,
                                 AdminUserRepository userRepository,
                                 AdminQueryRepository queryRepository,
                                 RecommendationRepository recommendationRepository) {
        this.mongoTemplate = mongoTemplate;
        this.userRepository = userRepository;
        this.queryRepository = queryRepository;
        this.recommendationRepository = recommendationRepository;
    }

    public AdminAnalyticsDto getAnalytics() {
        long totalUsers = userRepository.count();
        long totalQueries = queryRepository.count();
        long totalRecommendations = recommendationRepository.count();

        List<AdminAnalyticsDto.DiseaseCount> commonDiseases = mongoTemplate.aggregate(
                Aggregation.newAggregation(
                        Aggregation.group("predictedDisease").count().as("count"),
                        Aggregation.sort(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "count")),
                        Aggregation.limit(5)
                ), Query.class, DiseaseCountResult.class
        ).getMappedResults().stream()
                .map(result -> new AdminAnalyticsDto.DiseaseCount(result.getId(), result.getCount()))
                .collect(Collectors.toList());

        Map<String, Long> queriesPerDay = getQueriesPerDay(30);
        long activeUsersToday = mongoTemplate.count(
                org.springframework.data.mongodb.core.query.Query.query(
                        Criteria.where("lastLogin").gte(Instant.now().atZone(ZoneOffset.UTC).toLocalDate().atStartOfDay().toInstant(ZoneOffset.UTC))
                ), User.class
        );

        return new AdminAnalyticsDto(totalUsers, totalQueries, totalRecommendations, commonDiseases, queriesPerDay, activeUsersToday);
    }

    private Map<String, Long> getQueriesPerDay(int days) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Instant start = today.minusDays(days - 1).atStartOfDay().toInstant(ZoneOffset.UTC);

        MatchOperation match = Aggregation.match(Criteria.where("timestamp").gte(start));
        Aggregation aggregation = Aggregation.newAggregation(
                match,
                Aggregation.project().andExpression("{$dateToString: { format: '%Y-%m-%d', date: '$timestamp' }}").as("day"),
                Aggregation.group("day").count().as("count"),
                Aggregation.sort(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "_id"))
        );

        List<QueryPerDayResult> results = mongoTemplate.aggregate(aggregation, Query.class, QueryPerDayResult.class).getMappedResults();
        LinkedHashMap<String, Long> map = new LinkedHashMap<>();

        for (int i = 0; i < days; i++) {
            String date = today.minusDays(days - 1 - i).format(DateTimeFormatter.ISO_LOCAL_DATE);
            map.put(date, 0L);
        }
        for (QueryPerDayResult result : results) {
            map.put(result.getId(), result.getCount());
        }
        return map;
    }

    private static class DiseaseCountResult {
        private String id;
        private long count;

        public String getId() {
            return id;
        }

        public long getCount() {
            return count;
        }
    }

    private static class QueryPerDayResult {
        private String id;
        private long count;

        public String getId() {
            return id;
        }

        public long getCount() {
            return count;
        }
    }
}
