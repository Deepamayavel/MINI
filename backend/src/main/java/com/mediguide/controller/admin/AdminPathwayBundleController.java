package com.mediguide.controller.admin;

import com.mediguide.dto.ClinicalPathwayBundleDto;
import com.mediguide.service.admin.AdminPathwayBundleService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Validated
@RestController
@RequestMapping("/api/admin/bundle")
public class AdminPathwayBundleController {

    private final AdminPathwayBundleService bundleService;

    public AdminPathwayBundleController(AdminPathwayBundleService bundleService) {
        this.bundleService = bundleService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBundle(@RequestBody ClinicalPathwayBundleDto bundle) {
        return ResponseEntity.ok(bundleService.createPathwayBundle(bundle));
    }
}
