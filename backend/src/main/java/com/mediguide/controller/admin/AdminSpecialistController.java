package com.mediguide.controller.admin;

import com.mediguide.model.Specialist;
import com.mediguide.service.admin.AdminSpecialistService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/admin/specialists")
public class AdminSpecialistController {

    private final AdminSpecialistService service;

    public AdminSpecialistController(AdminSpecialistService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Page<Specialist>> list(@RequestParam(defaultValue = "0") @Min(0) int page,
                                                 @RequestParam(defaultValue = "10") @Min(1) int size) {
        return ResponseEntity.ok(service.findAll(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Specialist> get(@PathVariable String id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<Specialist> create(@Valid @RequestBody Specialist specialist) {
        return ResponseEntity.ok(service.create(specialist));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Specialist> update(@PathVariable String id, @Valid @RequestBody Specialist specialist) {
        return ResponseEntity.ok(service.update(id, specialist));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
