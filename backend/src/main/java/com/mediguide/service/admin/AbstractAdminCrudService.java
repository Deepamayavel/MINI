package com.mediguide.service.admin;

import com.mediguide.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.lang.reflect.Field;

public abstract class AbstractAdminCrudService<T> {

    protected final MongoRepository<T, String> repository;
    private final Class<T> entityType;

    protected AbstractAdminCrudService(MongoRepository<T, String> repository, Class<T> entityType) {
        this.repository = repository;
        this.entityType = entityType;
    }

    public Page<T> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repository.findAll(pageable);
    }

    public T findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(entityType.getSimpleName() + " not found"));
    }

    public T create(T entity) {
        return repository.save(entity);
    }

    public T update(String id, T entity) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(entityType.getSimpleName() + " not found");
        }
        setId(entity, id);
        return repository.save(entity);
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(entityType.getSimpleName() + " not found");
        }
        repository.deleteById(id);
    }

    private void setId(T entity, String id) {
        try {
            Field idField = entityType.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(entity, id);
        } catch (ReflectiveOperationException ex) {
            throw new IllegalStateException("Unable to set id on entity", ex);
        }
    }
}
