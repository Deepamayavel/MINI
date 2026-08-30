package com.mediguide.config;

import com.mediguide.model.*;
import com.mediguide.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final SpecialistRepository specialistRepository;
    private final DiagnosticTestRepository diagnosticTestRepository;
    private final DiseaseRepository diseaseRepository;
    private final SymptomRepository symptomRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminSeeder(
            UserRepository userRepository,
            HospitalRepository hospitalRepository,
            SpecialistRepository specialistRepository,
            DiagnosticTestRepository diagnosticTestRepository,
            DiseaseRepository diseaseRepository,
            SymptomRepository symptomRepository
    ) {
        this.userRepository = userRepository;
        this.hospitalRepository = hospitalRepository;
        this.specialistRepository = specialistRepository;
        this.diagnosticTestRepository = diagnosticTestRepository;
        this.diseaseRepository = diseaseRepository;
        this.symptomRepository = symptomRepository;
    }

    @Override
    public void run(String... args) {
        try {
            seedAdminUser();
            seedHospitals();
            seedSpecialists();
            seedDiagnosticTests();
            seedDiseases();
            seedSymptoms();
        } catch (Exception e) {
            System.err.println("⚠️ AdminSeeder skipped: " + e.getMessage());
        }
    }

    private void seedAdminUser() {
        String adminEmail = "admin@mediguide.com";
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .name("Admin")
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode("Admin@1234"))
                    .role(Role.ADMIN)
                    .createdAt(Instant.now())
                    .build();
            userRepository.save(admin);
            System.out.println("✅ Admin account created: " + adminEmail);
        }
    }

    private void seedHospitals() {
        if (hospitalRepository.count() == 0) {
            List<Hospital> hospitals = List.of(
                    Hospital.builder().name("Apollo Hospitals").address("Greams Road, Chennai / Coimbatore").contact("+91 44 2829 0200").build(),
                    Hospital.builder().name("Fortis Healthcare").address("Bannerghatta Road, Bengaluru").contact("+91 80 6621 4444").build(),
                    Hospital.builder().name("Government General Hospital").address("Park Town, Chennai").contact("+91 44 2530 5000").build(),
                    Hospital.builder().name("PSG Hospitals").address("Peelamedu, Coimbatore - 641004").contact("+91 422 257 0170").build(),
                    Hospital.builder().name("AIIMS New Delhi").address("Ansari Nagar, New Delhi").contact("+91 11 2658 8500").build(),
                    Hospital.builder().name("Manipal Hospital").address("HAL Airport Road, Bengaluru").contact("+91 80 2502 4444").build(),
                    Hospital.builder().name("Kauvery Hospital").address("Tennur, Tiruchirappalli / Chennai").contact("+91 431 407 7777").build(),
                    Hospital.builder().name("City Care Multi-Speciality Clinic").address("Avinashi Road, Coimbatore").contact("+91 422 439 1234").build()
            );
            hospitalRepository.saveAll(hospitals);
            System.out.println("✅ Seeded " + hospitals.size() + " accredited hospitals into MongoDB Atlas.");
        }
    }

    private void seedSpecialists() {
        if (specialistRepository.count() == 0) {
            List<Specialist> specialists = List.of(
                    Specialist.builder().name("Dr. S. K. Sharma").specialty("General Physician").build(),
                    Specialist.builder().name("Dr. Anita Raman").specialty("Pulmonologist").build(),
                    Specialist.builder().name("Dr. V. Rajesh").specialty("Cardiologist").build(),
                    Specialist.builder().name("Dr. Meera Nambiar").specialty("Dermatologist").build(),
                    Specialist.builder().name("Dr. K. Narayanan").specialty("Neurologist").build(),
                    Specialist.builder().name("Dr. Priya Sundaram").specialty("Endocrinologist").build(),
                    Specialist.builder().name("Dr. Arun Kumar").specialty("Gastroenterologist").build(),
                    Specialist.builder().name("Dr. T. Venkatesh").specialty("ENT Specialist").build()
            );
            specialistRepository.saveAll(specialists);
            System.out.println("✅ Seeded " + specialists.size() + " medical specialists into MongoDB Atlas.");
        }
    }

    private void seedDiagnosticTests() {
        if (diagnosticTestRepository.count() == 0) {
            List<DiagnosticTest> tests = List.of(
                    DiagnosticTest.builder().name("Complete Blood Count (CBC)").description("Evaluates overall health and detects infection/anemia").build(),
                    DiagnosticTest.builder().name("NS1 Antigen & Dengue IgM/IgG").description("Early detection of Dengue virus antigen").build(),
                    DiagnosticTest.builder().name("Varicella PCR Test").description("Identifies Varicella Zoster virus in Chickenpox").build(),
                    DiagnosticTest.builder().name("Chest X-Ray / CT Thorax").description("Radiological imaging for pulmonary consolidation and lung infections").build(),
                    DiagnosticTest.builder().name("HbA1c Glycated Hemoglobin").description("3-month average plasma glucose concentration").build(),
                    DiagnosticTest.builder().name("Widal Test & Typhoid Culture").description("Diagnostic serological test for Salmonella enterica").build(),
                    DiagnosticTest.builder().name("Malaria Antigen Blood Smear").description("Microscopic examination for Plasmodium parasites").build(),
                    DiagnosticTest.builder().name("ECG & 2D Echocardiogram").description("Cardiac electrical activity and structural assessment").build()
            );
            diagnosticTestRepository.saveAll(tests);
            System.out.println("✅ Seeded " + tests.size() + " diagnostic tests into MongoDB Atlas.");
        }
    }

    private void seedDiseases() {
        if (diseaseRepository.count() == 0) {
            List<Disease> diseases = List.of(
                    Disease.builder().name("Dengue Fever").description("Mosquito-borne viral infection causing high fever and thrombocytopenia").severityScore(0.85).build(),
                    Disease.builder().name("Common Cold").description("Viral infectious disease of the upper respiratory tract").severityScore(0.25).build(),
                    Disease.builder().name("Pneumonia").description("Inflammatory condition of the lung primarily affecting alveoli").severityScore(0.80).build(),
                    Disease.builder().name("Chickenpox").description("Highly contagious viral infection causing an itchy blister-like rash").severityScore(0.55).build(),
                    Disease.builder().name("Malaria").description("Mosquito-borne infectious disease caused by parasitic protozoans").severityScore(0.75).build(),
                    Disease.builder().name("Typhoid").description("Bacterial infection caused by Salmonella typhi").severityScore(0.70).build(),
                    Disease.builder().name("Diabetes").description("Metabolic disease characterized by elevated blood glucose levels").severityScore(0.65).build(),
                    Disease.builder().name("Bronchial Asthma").description("Chronic condition causing airway inflammation and bronchospasm").severityScore(0.70).build()
            );
            diseaseRepository.saveAll(diseases);
            System.out.println("✅ Seeded " + diseases.size() + " diseases into MongoDB Atlas.");
        }
    }

    private void seedSymptoms() {
        if (symptomRepository.count() == 0) {
            List<Symptom> symptoms = List.of(
                    Symptom.builder().name("High Fever").description("Body temperature significantly above normal (38°C / 100.4°F)").build(),
                    Symptom.builder().name("Headache").description("Pain in any region of the head").build(),
                    Symptom.builder().name("Chills & Shivering").description("Feeling cold despite ambient warmth").build(),
                    Symptom.builder().name("Persistent Cough").description("Dry or productive coughing").build(),
                    Symptom.builder().name("Joint & Muscle Pain").description("Arthralgia or myalgia across limbs").build(),
                    Symptom.builder().name("Breathlessness").description("Difficulty breathing or short of breath").build(),
                    Symptom.builder().name("Skin Rash").description("Erythematous or macular skin eruption").build(),
                    Symptom.builder().name("Fatigue & Weakness").description("Overwhelming physical exhaustion").build()
            );
            symptomRepository.saveAll(symptoms);
            System.out.println("✅ Seeded " + symptoms.size() + " symptoms into MongoDB Atlas.");
        }
    }
}
