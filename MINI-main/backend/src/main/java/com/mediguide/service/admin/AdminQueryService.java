package com.mediguide.service.admin;

import com.mediguide.exception.ResourceNotFoundException;
import com.mediguide.model.Query;
import com.mediguide.repository.AdminQueryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class AdminQueryService {

    private final AdminQueryRepository queryRepository;

    public AdminQueryService(AdminQueryRepository queryRepository) {
        this.queryRepository = queryRepository;
    }

    public Page<Query> findAll(int page, int size) {
        return queryRepository.findAll(PageRequest.of(page, size));
    }

    public Query findById(String id) {
        return queryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Query not found"));
    }

    public void delete(String id) {
        if (!queryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Query not found");
        }
        queryRepository.deleteById(id);
    }
}
