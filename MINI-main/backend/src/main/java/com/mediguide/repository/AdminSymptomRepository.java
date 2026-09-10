package com.mediguide.repository;

import com.mediguide.model.Symptom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminSymptomRepository extends MongoRepository<Symptom, String> {
}
