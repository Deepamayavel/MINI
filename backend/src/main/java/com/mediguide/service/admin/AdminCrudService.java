package com.mediguide.service.admin;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

public class AdminCrudService<T> extends AbstractAdminCrudService<T> {

    public AdminCrudService(MongoRepository<T, String> repository, Class<T> entityType) {
        super(repository, entityType);
    }

    @Override
    public Page<T> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repository.findAll(pageable);
    }
}
