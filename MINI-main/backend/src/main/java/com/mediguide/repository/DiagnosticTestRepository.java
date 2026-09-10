package com.mediguide.repository;

import com.mediguide.model.DiagnosticTest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiagnosticTestRepository extends MongoRepository<DiagnosticTest, String> {
}
