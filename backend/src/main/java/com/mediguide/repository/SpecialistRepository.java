package com.mediguide.repository;

import com.mediguide.model.Specialist;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpecialistRepository extends MongoRepository<Specialist, String> {
}
