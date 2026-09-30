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
                    Hospital.builder().name("Apollo Hospitals").address("Greams Road, Chennai").contact("+91 44 2829 0200").city("Chennai").type("Super-Speciality").emergencyAvailable(true).build(),
                    Hospital.builder().name("Fortis Healthcare").address("Bannerghatta Road, Bengaluru").contact("+91 80 6621 4444").city("Bengaluru").type("Multi-Speciality").emergencyAvailable(true).build(),
                    Hospital.builder().name("Government General Hospital").address("Park Town, Chennai").contact("+91 44 2530 5000").city("Chennai").type("Public / Government").emergencyAvailable(true).build(),
                    Hospital.builder().name("PSG Hospitals").address("Peelamedu, Coimbatore - 641004").contact("+91 422 257 0170").city("Coimbatore").type("Teaching Multi-Speciality").emergencyAvailable(true).build(),
                    Hospital.builder().name("AIIMS New Delhi").address("Ansari Nagar, New Delhi").contact("+91 11 2658 8500").city("New Delhi").type("Apex Medical Institute").emergencyAvailable(true).build(),
                    Hospital.builder().name("Manipal Hospital").address("HAL Airport Road, Bengaluru").contact("+91 80 2502 4444").city("Bengaluru").type("Multi-Speciality").emergencyAvailable(true).build(),
                    Hospital.builder().name("Kauvery Hospital").address("Tennur, Tiruchirappalli").contact("+91 431 407 7777").city("Tiruchirappalli").type("Multi-Speciality").emergencyAvailable(true).build(),
                    Hospital.builder().name("City Care Multi-Speciality Clinic").address("Avinashi Road, Coimbatore").contact("+91 422 439 1234").city("Coimbatore").type("Outpatient Clinic").emergencyAvailable(false).build()
            );
            hospitalRepository.saveAll(hospitals);
            System.out.println("✅ Seeded " + hospitals.size() + " accredited hospitals into MongoDB Atlas.");
        }
    }

    private void seedSpecialists() {
        if (specialistRepository.count() == 0) {
            List<Specialist> specialists = List.of(
                    Specialist.builder().name("Dr. S. K. Sharma").specialty("General Physician").hospitalName("Apollo Hospitals").experience("15 Years").contact("+91 98401 23456").consultationFee("₹600").build(),
                    Specialist.builder().name("Dr. Anita Raman").specialty("Pulmonologist").hospitalName("Fortis Healthcare").experience("12 Years").contact("+91 98402 34567").consultationFee("₹800").build(),
                    Specialist.builder().name("Dr. V. Rajesh").specialty("Cardiologist").hospitalName("Apollo Hospitals").experience("18 Years").contact("+91 98403 45678").consultationFee("₹1,000").build(),
                    Specialist.builder().name("Dr. Meera Nambiar").specialty("Dermatologist").hospitalName("Manipal Hospital").experience("10 Years").contact("+91 98404 56789").consultationFee("₹700").build(),
                    Specialist.builder().name("Dr. K. Narayanan").specialty("Neurologist").hospitalName("AIIMS New Delhi").experience("20 Years").contact("+91 98405 67890").consultationFee("₹1,200").build(),
                    Specialist.builder().name("Dr. Priya Sundaram").specialty("Endocrinologist").hospitalName("PSG Hospitals").experience("11 Years").contact("+91 98406 78901").consultationFee("₹750").build(),
                    Specialist.builder().name("Dr. Arun Kumar").specialty("Gastroenterologist").hospitalName("Kauvery Hospital").experience("14 Years").contact("+91 98407 89012").consultationFee("₹850").build(),
                    Specialist.builder().name("Dr. T. Venkatesh").specialty("ENT Specialist").hospitalName("Government General Hospital").experience("16 Years").contact("+91 98408 90123").consultationFee("₹500").build()
            );
            specialistRepository.saveAll(specialists);
            System.out.println("✅ Seeded " + specialists.size() + " medical specialists into MongoDB Atlas.");
        }
    }

    private void seedDiagnosticTests() {
        if (diagnosticTestRepository.count() == 0) {
            List<DiagnosticTest> tests = List.of(
                    DiagnosticTest.builder().name("Complete Blood Count (CBC)").description("Evaluates overall health and detects infection/anemia").category("Hematology").turnaroundTime("2-4 hours").approxCost(350.0).build(),
                    DiagnosticTest.builder().name("NS1 Antigen & Dengue IgM/IgG").description("Early detection of Dengue virus antigen").category("Serology").turnaroundTime("1-2 hours").approxCost(850.0).build(),
                    DiagnosticTest.builder().name("Varicella PCR Test").description("Identifies Varicella Zoster virus in Chickenpox").category("Molecular Diagnostics").turnaroundTime("24 hours").approxCost(1800.0).build(),
                    DiagnosticTest.builder().name("Chest X-Ray / CT Thorax").description("Radiological imaging for pulmonary consolidation and lung infections").category("Radiology").turnaroundTime("30 mins").approxCost(600.0).build(),
                    DiagnosticTest.builder().name("HbA1c Glycated Hemoglobin").description("3-month average plasma glucose concentration").category("Biochemistry").turnaroundTime("3 hours").approxCost(450.0).build(),
                    DiagnosticTest.builder().name("Widal Test & Typhoid Culture").description("Diagnostic serological test for Salmonella enterica").category("Microbiology").turnaroundTime("24-48 hours").approxCost(400.0).build(),
                    DiagnosticTest.builder().name("Malaria Antigen Blood Smear").description("Microscopic examination for Plasmodium parasites").category("Parasitology").turnaroundTime("1 hour").approxCost(300.0).build(),
                    DiagnosticTest.builder().name("ECG & 2D Echocardiogram").description("Cardiac electrical activity and structural assessment").category("Cardiology").turnaroundTime("45 mins").approxCost(1200.0).build()
            );
            diagnosticTestRepository.saveAll(tests);
            System.out.println("✅ Seeded " + tests.size() + " diagnostic tests into MongoDB Atlas.");
        }
    }

    private void seedDiseases() {
        if (diseaseRepository.count() == 0) {
            List<Disease> diseases = List.of(
                    Disease.builder().name("Dengue Fever").description("Mosquito-borne viral infection causing high fever and thrombocytopenia").severityScore(0.85).category("Infectious / Viral").commonSymptoms("High Fever, Severe Headache, Joint Pain, Rash").recommendedSpecialist("General Physician / Infectious Specialist").precautions("Hydrate with fluids, monitor platelets, avoid aspirin").build(),
                    Disease.builder().name("Common Cold").description("Viral infectious disease of the upper respiratory tract").severityScore(0.25).category("Respiratory").commonSymptoms("Runny Nose, Sneezing, Sore Throat, Cough").recommendedSpecialist("General Physician / ENT").precautions("Rest, stay warm, saline gargles, hydration").build(),
                    Disease.builder().name("Pneumonia").description("Inflammatory condition of the lung primarily affecting alveoli").severityScore(0.80).category("Respiratory").commonSymptoms("Chest Pain, Cough with Phlegm, Breathlessness, Fever").recommendedSpecialist("Pulmonologist").precautions("Take full antibiotic course, rest, avoid smoking").build(),
                    Disease.builder().name("Chickenpox").description("Highly contagious viral infection causing an itchy blister-like rash").severityScore(0.55).category("Dermatological / Viral").commonSymptoms("Itchy Blisters, Fever, Fatigue, Headache").recommendedSpecialist("Dermatologist / General Physician").precautions("Isolate, apply calamine, avoid scratching blisters").build(),
                    Disease.builder().name("Malaria").description("Mosquito-borne infectious disease caused by parasitic protozoans").severityScore(0.75).category("Infectious / Parasitic").commonSymptoms("Fever with Chills, Sweating, Headache, Nausea").recommendedSpecialist("General Physician").precautions("Complete antimalarials, sleep under mosquito net").build(),
                    Disease.builder().name("Typhoid").description("Bacterial infection caused by Salmonella typhi").severityScore(0.70).category("Gastrointestinal / Bacterial").commonSymptoms("Sustained High Fever, Stomach Pain, Weakness, Loss of Appetite").recommendedSpecialist("Gastroenterologist").precautions("Drink boiled water, eat light foods, complete antibiotics").build(),
                    Disease.builder().name("Diabetes").description("Metabolic disease characterized by elevated blood glucose levels").severityScore(0.65).category("Endocrine / Metabolic").commonSymptoms("Frequent Urination, Excessive Thirst, Fatigue, Blurred Vision").recommendedSpecialist("Endocrinologist").precautions("Low sugar diet, regular exercise, blood sugar monitoring").build(),
                    Disease.builder().name("Bronchial Asthma").description("Chronic condition causing airway inflammation and bronchospasm").severityScore(0.70).category("Respiratory / Chronic").commonSymptoms("Wheezing, Breathlessness, Chest Tightness, Night Cough").recommendedSpecialist("Pulmonologist").precautions("Keep rescue inhaler handy, avoid dust/smoke triggers").build()
            );
            diseaseRepository.saveAll(diseases);
            System.out.println("✅ Seeded " + diseases.size() + " diseases into MongoDB Atlas.");
        }
    }

    private void seedSymptoms() {
        if (symptomRepository.count() == 0) {
            List<Symptom> symptoms = List.of(
                    Symptom.builder().name("High Fever").description("Body temperature significantly above normal (38°C / 100.4°F)").category("General / Systemic").severity("Severe").bodyLocation("Whole Body").synonyms("fever, pyrexia, காய்ச்சல், சுரம், बुखार, तेज बुखार, bukhar, జ్వரம்").build(),
                    Symptom.builder().name("Headache").description("Pain or aching sensation in any region of the head").category("Neurological").severity("Moderate").bodyLocation("Head").synonyms("head pain, cephalalgia, migraine, தலைவலி, தலை வலி, सिरदर्द, सिर दर्द, sirdard, తలనొప్పి").build(),
                    Symptom.builder().name("Chills & Shivering").description("Involuntary trembling or sensation of cold despite warm surroundings").category("General / Systemic").severity("Moderate").bodyLocation("Whole Body").synonyms("chills, shivering, rigor, குளிர்காய்ச்சல், கம்பம், कंपकंपी").build(),
                    Symptom.builder().name("Persistent Cough").description("Dry or phlegm-producing coughing continuing for days").category("Respiratory").severity("Moderate").bodyLocation("Throat / Chest").synonyms("cough, hacking, இருமல், வறட்டு இருமல், खांसी, khasi, దగ్గు").build(),
                    Symptom.builder().name("Joint & Muscle Pain").description("Arthralgia or generalized myalgia across limbs and spine").category("Musculoskeletal").severity("Moderate").bodyLocation("Limbs / Joints").synonyms("body ache, myalgia, arthralgia, மூட்டு வலி, உடல் வலி, जोड़ों का दर्द, बदन दर्द, కీళ్ల నొప్పులు").build(),
                    Symptom.builder().name("Breathlessness").description("Difficulty breathing, feeling short of breath or suffocated").category("Respiratory").severity("Severe").bodyLocation("Chest / Lungs").synonyms("shortness of breath, dyspnea, மூச்சு திணறல், மூச்சுத்திணறல், सांस फूलना, सांस लेने में तकलीफ, శ్వాస తీసుకోవడంలో ఇబ్బంది").build(),
                    Symptom.builder().name("Skin Rash").description("Erythematous, itchy or blistering eruptions on cutaneous tissue").category("Dermatological").severity("Mild").bodyLocation("Skin").synonyms("rash, eruption, hives, அரிப்பு, தோல் தடிப்பு, खुजली, दाने, దురద").build(),
                    Symptom.builder().name("Fatigue & Weakness").description("Overwhelming physical exhaustion and lack of energy").category("General / Systemic").severity("Mild").bodyLocation("Whole Body").synonyms("exhaustion, lethargy, asthenia, களைப்பு, சோர்வு, थकान, कमजोरी, అలసట").build(),
                    Symptom.builder().name("Sore Throat").description("Pain, irritation, or scratchiness of the throat that often worsens when swallowing").category("ENT / Respiratory").severity("Mild").bodyLocation("Throat").synonyms("throat pain, pharyngitis, தொண்டை வலி, தொண்டை கரகரப்பு, गले में खराश, गले में दर्द, గొంతు నొప్పి").build(),
                    Symptom.builder().name("Nausea & Vomiting").description("Urge to vomit or involuntary expulsion of stomach contents").category("Gastrointestinal").severity("Moderate").bodyLocation("Abdomen / Stomach").synonyms("emesis, vomiting, throw up, வாந்தி, மயக்கம், उल्टी, जी मिचलाना, వాంతులు, వికారం").build()
            );
            symptomRepository.saveAll(symptoms);
            System.out.println("✅ Seeded " + symptoms.size() + " symptoms into MongoDB Atlas.");
        }
    }
}
