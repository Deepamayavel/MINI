package com.mediguide.repository;

import com.mediguide.model.Disease;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminDiseaseRepository extends MongoRepository<Disease, String> {
}
