package com.mediguide.service.admin;

import com.mediguide.model.Symptom;
import com.mediguide.repository.AdminSymptomRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminSymptomService extends AdminCrudService<Symptom> {
    public AdminSymptomService(AdminSymptomRepository repository) {
        super(repository, Symptom.class);
    }
}
