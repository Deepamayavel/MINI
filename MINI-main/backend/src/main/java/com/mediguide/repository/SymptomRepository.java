package com.mediguide.repository;

import com.mediguide.model.Symptom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SymptomRepository extends MongoRepository<Symptom, String> {
}
