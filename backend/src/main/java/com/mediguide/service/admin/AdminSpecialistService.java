package com.mediguide.service.admin;

import com.mediguide.model.Specialist;
import com.mediguide.repository.AdminSpecialistRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminSpecialistService extends AdminCrudService<Specialist> {
    public AdminSpecialistService(AdminSpecialistRepository repository) {
        super(repository, Specialist.class);
    }
}
