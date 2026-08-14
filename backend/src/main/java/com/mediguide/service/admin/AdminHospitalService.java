package com.mediguide.service.admin;

import com.mediguide.model.Hospital;
import com.mediguide.repository.AdminHospitalRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminHospitalService extends AdminCrudService<Hospital> {
    public AdminHospitalService(AdminHospitalRepository repository) {
        super(repository, Hospital.class);
    }
}
