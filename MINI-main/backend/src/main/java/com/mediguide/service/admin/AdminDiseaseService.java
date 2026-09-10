package com.mediguide.service.admin;

import com.mediguide.model.Disease;
import com.mediguide.repository.AdminDiseaseRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminDiseaseService extends AdminCrudService<Disease> {
    public AdminDiseaseService(AdminDiseaseRepository repository) {
        super(repository, Disease.class);
    }
}
