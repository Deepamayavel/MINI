package com.mediguide.service.admin;

import com.mediguide.model.DiagnosticTest;
import com.mediguide.repository.AdminTestRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminTestService extends AdminCrudService<DiagnosticTest> {
    public AdminTestService(AdminTestRepository repository) {
        super(repository, DiagnosticTest.class);
    }
}
