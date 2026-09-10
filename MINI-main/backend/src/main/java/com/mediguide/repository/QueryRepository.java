package com.mediguide.repository;

import com.mediguide.model.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QueryRepository extends MongoRepository<Query, String> {
    Page<Query> findAllByUserIdOrderByTimestampDesc(String userId, Pageable pageable);
    long countByUserId(String userId);
    Optional<Query> findFirstByUserIdOrderByTimestampDesc(String userId);
}
