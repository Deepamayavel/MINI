package com.mediguide.repository;

import com.mediguide.model.Recommendation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecommendationRepository extends MongoRepository<Recommendation, String> {
    Optional<Recommendation> findFirstByUserIdOrderByCreatedAtDesc(String userId);
    Page<Recommendation> findAllByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    Optional<Recommendation> findByIdAndUserId(String id, String userId);
    Optional<Recommendation> findByQueryId(String queryId);
    void deleteByQueryId(String queryId);
    long countByUserId(String userId);
}
