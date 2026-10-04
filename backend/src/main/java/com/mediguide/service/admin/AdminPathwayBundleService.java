package com.mediguide.service.admin;

import com.mediguide.dto.ClinicalPathwayBundleDto;
import com.mediguide.model.*;
import com.mediguide.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AdminPathwayBundleService {

    private final DiseaseRepository diseaseRepository;
    private final SymptomRepository symptomRepository;
    private final SpecialistRepository specialistRepository;
    private final DiagnosticTestRepository diagnosticTestRepository;
    private final HospitalRepository hospitalRepository;

    public AdminPathwayBundleService(
            DiseaseRepository diseaseRepository,
            SymptomRepository symptomRepository,
            SpecialistRepository specialistRepository,
            DiagnosticTestRepository diagnosticTestRepository,
            HospitalRepository hospitalRepository
    ) {
        this.diseaseRepository = diseaseRepository;
        this.symptomRepository = symptomRepository;
        this.specialistRepository = specialistRepository;
        this.diagnosticTestRepository = diagnosticTestRepository;
        this.hospitalRepository = hospitalRepository;
    }

    public Map<String, Object> createPathwayBundle(ClinicalPathwayBundleDto bundle) {
        if (bundle.getDiseaseName() == null || bundle.getDiseaseName().trim().isEmpty()) {
            throw new IllegalArgumentException("Disease name is required for clinical pathway creation.");
        }

        String dName = bundle.getDiseaseName().trim();
        Map<String, Object> result = new HashMap<>();

        // 1. Process Specialist
        Specialist specialist = null;
        if (bundle.getSpecialistName() != null && !bundle.getSpecialistName().trim().isEmpty()) {
            String sName = bundle.getSpecialistName().trim();
            specialist = specialistRepository.findAll().stream()
                    .filter(s -> s.getName() != null && s.getName().equalsIgnoreCase(sName))
                    .findFirst()
                    .orElse(null);

            if (specialist == null) {
                specialist = Specialist.builder()
                        .name(sName)
                        .specialty(bundle.getSpecialty() != null && !bundle.getSpecialty().isBlank() ? bundle.getSpecialty() : "General Physician")
                        .experience(bundle.getExperience() != null ? bundle.getExperience() : "10+ Years")
                        .consultationFee(bundle.getConsultationFee() != null ? bundle.getConsultationFee() : "₹600")
                        .contact(bundle.getSpecialistContact() != null ? bundle.getSpecialistContact() : "+91 98401 00000")
                        .hospitalName(bundle.getHospitalName())
                        .build();
                specialist = specialistRepository.save(specialist);
            }
        }

        // 2. Process Diagnostic Test
        DiagnosticTest test = null;
        if (bundle.getTestName() != null && !bundle.getTestName().trim().isEmpty()) {
            String tName = bundle.getTestName().trim();
            test = diagnosticTestRepository.findAll().stream()
                    .filter(t -> t.getName() != null && t.getName().equalsIgnoreCase(tName))
                    .findFirst()
                    .orElse(null);

            if (test == null) {
                test = DiagnosticTest.builder()
                        .name(tName)
                        .category(bundle.getTestCategory() != null && !bundle.getTestCategory().isBlank() ? bundle.getTestCategory() : "Biochemistry")
                        .turnaroundTime(bundle.getTurnaroundTime() != null ? bundle.getTurnaroundTime() : "2-4 hours")
                        .approxCost(bundle.getApproxCost() != null ? bundle.getApproxCost() : 500.0)
                        .description(bundle.getTestDescription() != null ? bundle.getTestDescription() : "Standard diagnostic evaluation protocol.")
                        .build();
                test = diagnosticTestRepository.save(test);
            }
        }

        // 3. Process Hospital
        Hospital hospital = null;
        if (bundle.getHospitalName() != null && !bundle.getHospitalName().trim().isEmpty()) {
            String hName = bundle.getHospitalName().trim();
            hospital = hospitalRepository.findAll().stream()
                    .filter(h -> h.getName() != null && h.getName().equalsIgnoreCase(hName))
                    .findFirst()
                    .orElse(null);

            if (hospital == null) {
                hospital = Hospital.builder()
                        .name(hName)
                        .city(bundle.getHospitalCity() != null ? bundle.getHospitalCity() : "Chennai")
                        .state(bundle.getHospitalState() != null ? bundle.getHospitalState() : "Tamil Nadu")
                        .type(bundle.getHospitalType() != null ? bundle.getHospitalType() : "Multi-Speciality")
                        .emergencyAvailable(bundle.getEmergencyAvailable() != null ? bundle.getEmergencyAvailable() : true)
                        .icuAvailable(bundle.getIcuAvailable() != null ? bundle.getIcuAvailable() : true)
                        .contact(bundle.getHospitalContact() != null ? bundle.getHospitalContact() : "+91 44 2829 0200")
                        .address(bundle.getHospitalAddress() != null ? bundle.getHospitalAddress() : "Main Hospital Boulevard")
                        .rating(bundle.getHospitalRating() != null ? bundle.getHospitalRating() : 4.6)
                        .bedCapacity(bundle.getBedCapacity() != null ? bundle.getBedCapacity() : 350)
                        .build();
                hospital = hospitalRepository.save(hospital);
            }
        }

        // 4. Process Symptoms
        List<String> symptomNames = new ArrayList<>();
        int newSymptomsCount = 0;
        if (bundle.getSymptoms() != null) {
            for (String sym : bundle.getSymptoms()) {
                if (sym == null || sym.trim().isEmpty()) continue;
                String cleanSym = sym.trim();
                symptomNames.add(cleanSym);

                boolean exists = symptomRepository.findAll().stream()
                        .anyMatch(s -> s.getName() != null && s.getName().equalsIgnoreCase(cleanSym));

                if (!exists) {
                    Symptom newSymptom = Symptom.builder()
                            .name(cleanSym)
                            .category(bundle.getCategory() != null ? bundle.getCategory() : "General / Systemic")
                            .severity("Moderate")
                            .bodyLocation("General")
                            .synonyms(cleanSym.toLowerCase())
                            .description("Clinical symptom associated with " + dName)
                            .build();
                    symptomRepository.save(newSymptom);
                    newSymptomsCount++;
                }
            }
        }

        // 5. Create or Update Disease
        Disease disease = diseaseRepository.findAll().stream()
                .filter(d -> d.getName() != null && d.getName().equalsIgnoreCase(dName))
                .findFirst()
                .orElse(null);

        String symptomsString = String.join(", ", symptomNames);
        String specName = specialist != null ? specialist.getName() : bundle.getSpecialistName();

        if (disease == null) {
            disease = Disease.builder()
                    .name(dName)
                    .category(bundle.getCategory() != null ? bundle.getCategory() : "Infectious / Viral")
                    .severityScore(bundle.getSeverityScore() != null ? bundle.getSeverityScore() : 0.65)
                    .commonSymptoms(symptomsString)
                    .recommendedSpecialist(specName)
                    .precautions(bundle.getPrecautions())
                    .description(bundle.getDescription() != null ? bundle.getDescription() : "Clinical entity: " + dName)
                    .build();
        } else {
            disease.setCategory(bundle.getCategory() != null ? bundle.getCategory() : disease.getCategory());
            disease.setSeverityScore(bundle.getSeverityScore() != null ? bundle.getSeverityScore() : disease.getSeverityScore());
            if (!symptomsString.isEmpty()) {
                disease.setCommonSymptoms(symptomsString);
            }
            if (specName != null && !specName.isBlank()) {
                disease.setRecommendedSpecialist(specName);
            }
            if (bundle.getPrecautions() != null && !bundle.getPrecautions().isBlank()) {
                disease.setPrecautions(bundle.getPrecautions());
            }
            if (bundle.getDescription() != null && !bundle.getDescription().isBlank()) {
                disease.setDescription(bundle.getDescription());
            }
        }
        disease = diseaseRepository.save(disease);

        result.put("status", "SUCCESS");
        result.put("message", "Clinical Care Pathway successfully established for " + dName);
        result.put("disease", disease);
        result.put("newSymptomsCount", newSymptomsCount);
        result.put("totalSymptomsLinked", symptomNames.size());
        result.put("specialist", specialist);
        result.put("test", test);
        result.put("hospital", hospital);

        return result;
    }
}
