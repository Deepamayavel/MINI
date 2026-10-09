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
            System.err.println("⚠️ AdminSeeder warning: " + e.getMessage());
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
        List<Hospital> defaultHospitals = List.of(
                Hospital.builder()
                        .name("Apollo Hospitals")
                        .address("Greams Road, Thousand Lights, Chennai - 600006")
                        .contact("+91 44 2829 0200")
                        .city("Chennai")
                        .state("Tamil Nadu")
                        .pincode("600006")
                        .type("Super-Speciality")
                        .emergencyAvailable(true)
                        .icuAvailable(true)
                        .rating(4.9)
                        .bedCapacity(750)
                        .ambulanceContact("1066")
                        .departments("Cardiology, Pulmonology, Neurology, Oncology, Critical Care, Nephrology")
                        .accreditations("JCI, NABH, NABL")
                        .operatingHours("24 Hours / 7 Days a week")
                        .insuranceAccepted("Star Health, MediAssist, ICICI Lombard, Ayushman Bharat (PM-JAY)")
                        .websiteUrl("https://www.apollohospitals.com")
                        .build(),
                Hospital.builder()
                        .name("Fortis Healthcare")
                        .address("Bannerghatta Road, Opposite IIMB, Bengaluru - 560076")
                        .contact("+91 80 6621 4444")
                        .city("Bengaluru")
                        .state("Karnataka")
                        .pincode("560076")
                        .type("Multi-Speciality")
                        .emergencyAvailable(true)
                        .icuAvailable(true)
                        .rating(4.8)
                        .bedCapacity(400)
                        .ambulanceContact("105010")
                        .departments("Cardiac Sciences, Orthopedics, Neurosciences, Nephrology, Pulmonology")
                        .accreditations("JCI, NABH")
                        .operatingHours("24 Hours / 7 Days a week")
                        .insuranceAccepted("HDFC ERGO, Star Health, Vidal Health, Max Bupa, Care Health")
                        .websiteUrl("https://www.fortishealthcare.com")
                        .build(),
                Hospital.builder()
                        .name("Government General Hospital")
                        .address("EVR Periyar Salai, Park Town, Chennai - 600003")
                        .contact("+91 44 2530 5000")
                        .city("Chennai")
                        .state("Tamil Nadu")
                        .pincode("600003")
                        .type("Public / Government")
                        .emergencyAvailable(true)
                        .icuAvailable(true)
                        .rating(4.6)
                        .bedCapacity(2700)
                        .ambulanceContact("108")
                        .departments("Trauma Care, Internal Medicine, Infectious Diseases, General Surgery, ENT")
                        .accreditations("NABH Pre-entry, ISO 9001:2015 Certified")
                        .operatingHours("24 Hours / 7 Days a week")
                        .insuranceAccepted("Chief Minister Comprehensive Health Insurance Scheme (CMCHIS), PM-JAY")
                        .websiteUrl("https://www.mmc.tn.gov.in")
                        .build(),
                Hospital.builder()
                        .name("PSG Hospitals")
                        .address("Peelamedu, Avinashi Road, Coimbatore - 641004")
                        .contact("+91 422 257 0170")
                        .city("Coimbatore")
                        .state("Tamil Nadu")
                        .pincode("641004")
                        .type("Teaching Multi-Speciality")
                        .emergencyAvailable(true)
                        .icuAvailable(true)
                        .rating(4.7)
                        .bedCapacity(1400)
                        .ambulanceContact("+91 422 257 0170")
                        .departments("Pulmonology, Cardiology, Pediatrics, Critical Care, Endocrinology")
                        .accreditations("NABH, NABL")
                        .operatingHours("24 Hours / 7 Days a week")
                        .insuranceAccepted("All Major Corporate Insurances, CMCHIS, Star Health, Reliance General")
                        .websiteUrl("https://psghospitals.com")
                        .build(),
                Hospital.builder()
                        .name("AIIMS New Delhi")
                        .address("Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029")
                        .contact("+91 11 2658 8500")
                        .city("New Delhi")
                        .state("Delhi")
                        .pincode("110029")
                        .type("Apex Medical Institute")
                        .emergencyAvailable(true)
                        .icuAvailable(true)
                        .rating(4.9)
                        .bedCapacity(2500)
                        .ambulanceContact("102 / 108")
                        .departments("All Super-Specialities, Advanced Trauma, Organ Transplant, Neurology, Oncology")
                        .accreditations("Apex National Institute, JCI Reference")
                        .operatingHours("24 Hours / 7 Days a week")
                        .insuranceAccepted("Central Government Health Scheme (CGHS), PM-JAY, ECHS, Cashless TPA")
                        .websiteUrl("https://www.aiims.edu")
                        .build(),
                Hospital.builder()
                        .name("Manipal Hospital")
                        .address("98 HAL Airport Road, Kodihalli, Bengaluru - 560017")
                        .contact("+91 80 2502 4444")
                        .city("Bengaluru")
                        .state("Karnataka")
                        .pincode("560017")
                        .type("Multi-Speciality")
                        .emergencyAvailable(true)
                        .icuAvailable(true)
                        .rating(4.8)
                        .bedCapacity(600)
                        .ambulanceContact("080 2222 1111")
                        .departments("Gastroenterology, Dermatology, Cardiology, Oncology, Critical Care")
                        .accreditations("NABH, NABL, AAHRPP")
                        .operatingHours("24 Hours / 7 Days a week")
                        .insuranceAccepted("Care Health, ICICI Lombard, Star Health, MediAssist, Bajaj Allianz")
                        .websiteUrl("https://www.manipalhospitals.com")
                        .build(),
                Hospital.builder()
                        .name("Kauvery Hospital")
                        .address("Tennur High Road, Tennur, Tiruchirappalli - 620017")
                        .contact("+91 431 407 7777")
                        .city("Tiruchirappalli")
                        .state("Tamil Nadu")
                        .pincode("620017")
                        .type("Multi-Speciality")
                        .emergencyAvailable(true)
                        .icuAvailable(true)
                        .rating(4.7)
                        .bedCapacity(350)
                        .ambulanceContact("+91 431 407 7777")
                        .departments("Vascular Surgery, Interventional Cardiology, Geriatric Care, Gastroenterology")
                        .accreditations("NABH, NABL")
                        .operatingHours("24 Hours / 7 Days a week")
                        .insuranceAccepted("Star Health, Bajaj Allianz, Care Health, CMCHIS, MediAssist")
                        .websiteUrl("https://www.kauveryhospital.com")
                        .build(),
                Hospital.builder()
                        .name("City Care Multi-Speciality Clinic")
                        .address("Avinashi Road, Peelamedu, Coimbatore - 641004")
                        .contact("+91 422 439 1234")
                        .city("Coimbatore")
                        .state("Tamil Nadu")
                        .pincode("641004")
                        .type("Outpatient Clinic")
                        .emergencyAvailable(false)
                        .icuAvailable(false)
                        .rating(4.4)
                        .bedCapacity(20)
                        .ambulanceContact("+91 422 439 1234")
                        .departments("Family Medicine, Outpatient Pediatrics, Preventive Health, General Medicine")
                        .accreditations("NABH Clinic Standard, ISO Certified")
                        .operatingHours("08:00 AM - 09:00 PM (Mon-Sat)")
                        .insuranceAccepted("Star Health Cashless OPD, MediAssist, Reimbursement All TPAs")
                        .websiteUrl("https://www.citycareclinic.com")
                        .build(),
                Hospital.builder()
                        .name("Apollo Speciality Hospitals OMR")
                        .address("05/639, Old Mahabalipuram Rd, Thoraipakkam, Chennai - 600097")
                        .contact("+91 44 2496 1111")
                        .city("Chennai")
                        .state("Tamil Nadu")
                        .pincode("600097")
                        .type("Super-Speciality")
                        .emergencyAvailable(true)
                        .icuAvailable(true)
                        .rating(4.8)
                        .bedCapacity(500)
                        .ambulanceContact("1066")
                        .departments("Emergency Medicine, Rheumatology, Cardiology, Neurosciences, Orthopedics")
                        .accreditations("JCI, NABH, NABL")
                        .operatingHours("24 Hours / 7 Days a week")
                        .insuranceAccepted("Star Health, MediAssist, ICICI Lombard, HDFC ERGO, Ayushman Bharat")
                        .websiteUrl("https://www.apollohospitals.com/omr")
                        .build()
        );

        for (Hospital def : defaultHospitals) {
            Hospital existing = hospitalRepository.findAll().stream()
                    .filter(h -> h.getName() != null && h.getName().equalsIgnoreCase(def.getName()))
                    .findFirst().orElse(null);
            if (existing != null) {
                existing.setAddress(def.getAddress());
                existing.setContact(def.getContact());
                existing.setCity(def.getCity());
                existing.setState(def.getState());
                existing.setPincode(def.getPincode());
                existing.setType(def.getType());
                existing.setEmergencyAvailable(def.getEmergencyAvailable());
                existing.setIcuAvailable(def.getIcuAvailable());
                existing.setRating(def.getRating());
                existing.setBedCapacity(def.getBedCapacity());
                existing.setAmbulanceContact(def.getAmbulanceContact());
                existing.setDepartments(def.getDepartments());
                existing.setAccreditations(def.getAccreditations());
                existing.setOperatingHours(def.getOperatingHours());
                existing.setInsuranceAccepted(def.getInsuranceAccepted());
                existing.setWebsiteUrl(def.getWebsiteUrl());
                hospitalRepository.save(existing);
            } else {
                hospitalRepository.save(def);
            }
        }
        System.out.println("✅ All hospitals synchronized and enriched with complete fields in MongoDB Atlas.");
    }

    private void seedSpecialists() {
        List<Specialist> defaultSpecialists = List.of(
                Specialist.builder().name("Dr. S. K. Sharma").specialty("General Physician").hospitalName("Apollo Hospitals").experience("15 Years").contact("+91 98401 23456").consultationFee("₹600").build(),
                Specialist.builder().name("Dr. Anita Raman").specialty("Pulmonologist").hospitalName("Fortis Healthcare").experience("12 Years").contact("+91 98402 34567").consultationFee("₹800").build(),
                Specialist.builder().name("Dr. V. Rajesh").specialty("Cardiologist").hospitalName("Apollo Hospitals").experience("18 Years").contact("+91 98403 45678").consultationFee("₹1,000").build(),
                Specialist.builder().name("Dr. Meera Nambiar").specialty("Dermatologist").hospitalName("Manipal Hospital").experience("10 Years").contact("+91 98404 56789").consultationFee("₹700").build(),
                Specialist.builder().name("Dr. K. Narayanan").specialty("Neurologist").hospitalName("AIIMS New Delhi").experience("20 Years").contact("+91 98405 67890").consultationFee("₹1,200").build(),
                Specialist.builder().name("Dr. Priya Sundaram").specialty("Endocrinologist").hospitalName("PSG Hospitals").experience("11 Years").contact("+91 98406 78901").consultationFee("₹750").build(),
                Specialist.builder().name("Dr. Arun Kumar").specialty("Gastroenterologist").hospitalName("Kauvery Hospital").experience("14 Years").contact("+91 98407 89012").consultationFee("₹850").build(),
                Specialist.builder().name("Dr. T. Venkatesh").specialty("ENT Specialist").hospitalName("Government General Hospital").experience("16 Years").contact("+91 98408 90123").consultationFee("₹500").build()
        );

        for (Specialist def : defaultSpecialists) {
            Specialist existing = specialistRepository.findAll().stream()
                    .filter(s -> s.getName() != null && s.getName().equalsIgnoreCase(def.getName()))
                    .findFirst().orElse(null);
            if (existing != null) {
                existing.setSpecialty(def.getSpecialty());
                existing.setHospitalName(def.getHospitalName());
                existing.setExperience(def.getExperience());
                existing.setContact(def.getContact());
                existing.setConsultationFee(def.getConsultationFee());
                specialistRepository.save(existing);
            } else {
                specialistRepository.save(def);
            }
        }
        System.out.println("✅ All specialists synchronized and enriched with complete fields in MongoDB Atlas.");
    }

    private void seedDiagnosticTests() {
        List<DiagnosticTest> defaultTests = List.of(
                DiagnosticTest.builder().name("Complete Blood Count (CBC)").description("Evaluates overall health and detects infection, anemia, and platelet disorders.").category("Hematology").turnaroundTime("2-4 hours").approxCost(350.0).build(),
                DiagnosticTest.builder().name("NS1 Antigen & Dengue IgM/IgG").description("Early detection of Dengue virus antigen and acute response antibodies.").category("Serology").turnaroundTime("1-2 hours").approxCost(850.0).build(),
                DiagnosticTest.builder().name("Varicella PCR Test").description("Identifies Varicella Zoster virus in suspected Chickenpox cases.").category("Molecular Diagnostics").turnaroundTime("24 hours").approxCost(1800.0).build(),
                DiagnosticTest.builder().name("Chest X-Ray / CT Thorax").description("Radiological imaging for pulmonary consolidation and lung infections.").category("Radiology / Imaging").turnaroundTime("30 mins").approxCost(600.0).build(),
                DiagnosticTest.builder().name("HbA1c Glycated Hemoglobin").description("Measures 3-month average plasma glucose concentration.").category("Biochemistry").turnaroundTime("3 hours").approxCost(450.0).build(),
                DiagnosticTest.builder().name("Widal Test & Typhoid Culture").description("Diagnostic serological test for Salmonella enterica antibodies.").category("Microbiology").turnaroundTime("24-48 hours").approxCost(400.0).build(),
                DiagnosticTest.builder().name("Malaria Antigen Blood Smear").description("Microscopic and rapid antigen examination for Plasmodium parasites.").category("Parasitology").turnaroundTime("1 hour").approxCost(300.0).build(),
                DiagnosticTest.builder().name("ECG & 2D Echocardiogram").description("Cardiac electrical rhythm and structural heart assessment.").category("Cardiology").turnaroundTime("45 mins").approxCost(1200.0).build()
        );

        for (DiagnosticTest def : defaultTests) {
            DiagnosticTest existing = diagnosticTestRepository.findAll().stream()
                    .filter(t -> t.getName() != null && t.getName().equalsIgnoreCase(def.getName()))
                    .findFirst().orElse(null);
            if (existing != null) {
                existing.setDescription(def.getDescription());
                existing.setCategory(def.getCategory());
                existing.setTurnaroundTime(def.getTurnaroundTime());
                existing.setApproxCost(def.getApproxCost());
                diagnosticTestRepository.save(existing);
            } else {
                diagnosticTestRepository.save(def);
            }
        }
        System.out.println("✅ All diagnostic tests synchronized and enriched with complete fields in MongoDB Atlas.");
    }

    private void seedDiseases() {
        List<Disease> defaultDiseases = List.of(
                Disease.builder().name("Dengue Fever").description("Mosquito-borne viral infection causing acute high fever and thrombocytopenia.").severityScore(0.85).category("Infectious / Viral").commonSymptoms("High Fever, Severe Headache, Joint Pain, Skin Rash").recommendedSpecialist("General Physician / Infectious Specialist").precautions("Hydrate with fluids, monitor platelet count daily, avoid aspirin or ibuprofen").build(),
                Disease.builder().name("Common Cold").description("Viral infectious disease of the upper respiratory tract.").severityScore(0.25).category("Respiratory").commonSymptoms("Runny Nose, Sneezing, Sore Throat, Persistent Cough").recommendedSpecialist("General Physician / ENT").precautions("Rest, stay warm, saline gargles, warm fluids and hydration").build(),
                Disease.builder().name("Pneumonia").description("Inflammatory condition of the lung primarily affecting microscopic alveoli.").severityScore(0.80).category("Respiratory").commonSymptoms("Chest Pain, Persistent Cough, Breathlessness, High Fever").recommendedSpecialist("Pulmonologist").precautions("Take full antibiotic course, rest, monitor oxygen saturation, avoid smoking").build(),
                Disease.builder().name("Chickenpox").description("Highly contagious viral infection causing an itchy blister-like rash.").severityScore(0.55).category("Dermatological / Viral").commonSymptoms("Skin Rash, Blisters, High Fever, Fatigue & Weakness").recommendedSpecialist("Dermatologist / General Physician").precautions("Isolate at home, apply calamine lotion, avoid scratching blisters").build(),
                Disease.builder().name("Malaria").description("Mosquito-borne infectious disease caused by parasitic protozoans.").severityScore(0.75).category("Infectious / Parasitic").commonSymptoms("High Fever, Chills & Shivering, Headache, Nausea & Vomiting").recommendedSpecialist("General Physician").precautions("Complete full antimalarial course, sleep under mosquito net, stay hydrated").build(),
                Disease.builder().name("Typhoid").description("Bacterial infection caused by Salmonella typhi bacteria.").severityScore(0.70).category("Gastrointestinal / Bacterial").commonSymptoms("High Fever, Stomach Pain, Fatigue & Weakness, Headache").recommendedSpecialist("Gastroenterologist").precautions("Drink boiled water only, eat light nutritious food, complete full antibiotic course").build(),
                Disease.builder().name("Diabetes").description("Metabolic disease characterized by elevated blood glucose levels.").severityScore(0.65).category("Metabolic / Endocrine").commonSymptoms("Frequent Urination, Excessive Thirst, Fatigue & Weakness, Blurred Vision").recommendedSpecialist("Endocrinologist").precautions("Follow low-sugar diet, exercise daily, monitor blood glucose regularly").build(),
                Disease.builder().name("Bronchial Asthma").description("Chronic condition causing airway inflammation and bronchospasm.").severityScore(0.70).category("Respiratory / Chronic").commonSymptoms("Breathlessness, Wheezing, Chest Tightness, Persistent Cough").recommendedSpecialist("Pulmonologist").precautions("Keep rescue inhaler accessible, avoid dust/smoke triggers, use controller medications").build()
        );

        for (Disease def : defaultDiseases) {
            Disease existing = diseaseRepository.findAll().stream()
                    .filter(d -> d.getName() != null && d.getName().equalsIgnoreCase(def.getName()))
                    .findFirst().orElse(null);
            if (existing != null) {
                existing.setDescription(def.getDescription());
                existing.setSeverityScore(def.getSeverityScore());
                existing.setCategory(def.getCategory());
                existing.setCommonSymptoms(def.getCommonSymptoms());
                existing.setRecommendedSpecialist(def.getRecommendedSpecialist());
                existing.setPrecautions(def.getPrecautions());
                diseaseRepository.save(existing);
            } else {
                diseaseRepository.save(def);
            }
        }
        System.out.println("✅ All diseases synchronized and enriched with complete fields in MongoDB Atlas.");
    }

    private void seedSymptoms() {
        List<Symptom> defaultSymptoms = List.of(
                Symptom.builder().name("High Fever").description("Body temperature significantly above normal (38°C / 100.4°F).").category("General / Systemic").severity("Severe").bodyLocation("Whole Body").synonyms("fever, pyrexia, காய்ச்சல், சுரம், बुखार, तेज बुखार, bukhar, జ్వరం").build(),
                Symptom.builder().name("Headache").description("Pain or aching sensation in any region of the head or cranial area.").category("Neurological").severity("Moderate").bodyLocation("Head").synonyms("head pain, cephalalgia, migraine, தலைவலி, தலை வலி, सिरदर्द, सिर दर्द, sirdard, తలనొప్పి").build(),
                Symptom.builder().name("Chills & Shivering").description("Involuntary trembling or sensation of cold despite ambient warmth.").category("General / Systemic").severity("Moderate").bodyLocation("Whole Body").synonyms("chills, shivering, rigor, குளிர்காய்ச்சல், கம்பம், कंपकंपी").build(),
                Symptom.builder().name("Persistent Cough").description("Dry or productive coughing continuing for multiple days.").category("Respiratory").severity("Moderate").bodyLocation("Throat / Chest").synonyms("cough, hacking, phlegm cough, இருமல், வறட்டு இருமல், खांसी, khasi, దగ్గు").build(),
                Symptom.builder().name("Joint & Muscle Pain").description("Arthralgia or generalized myalgia across limbs, joints, or spine.").category("Musculoskeletal").severity("Moderate").bodyLocation("Limbs / Joints").synonyms("body ache, myalgia, arthralgia, மூட்டு வலி, உடல் வலி, जोड़ों का दर्द, बदन दर्द, కీళ్ల నొప్పులు").build(),
                Symptom.builder().name("Breathlessness").description("Difficulty breathing or feeling short of breath, needing immediate evaluation.").category("Respiratory").severity("Severe").bodyLocation("Chest / Lungs").synonyms("shortness of breath, dyspnea, மூச்சு திணறல், மூச்சுத்திணறல், सांस फूलना, सांस लेने में तकलीफ, శ్వాస తీసుకోవడంలో ఇబ్బంది").build(),
                Symptom.builder().name("Skin Rash").description("Erythematous, itchy, or blistering eruptions on cutaneous tissue.").category("Dermatological").severity("Mild").bodyLocation("Skin").synonyms("rash, eruption, hives, அரிப்பு, தோல் தடிப்பு, खुजली, दाने, దురద").build(),
                Symptom.builder().name("Fatigue & Weakness").description("Overwhelming physical exhaustion and debilitating lack of energy.").category("General / Systemic").severity("Mild").bodyLocation("Whole Body").synonyms("exhaustion, lethargy, asthenia, களைப்பு, சோர்வு, थकान, कमजोरी, అలసట").build(),
                Symptom.builder().name("Sore Throat").description("Pain, irritation, or scratchiness of the throat worsening with swallowing.").category("ENT / Respiratory").severity("Mild").bodyLocation("Throat").synonyms("throat pain, pharyngitis, தொண்டை வலி, தொண்டை கரகரப்பு, गले में खराश, गले में दर्द, గొంతు నొప్పి").build(),
                Symptom.builder().name("Nausea & Vomiting").description("Urge to vomit or involuntary expulsion of gastric contents.").category("Gastrointestinal").severity("Moderate").bodyLocation("Abdomen / Stomach").synonyms("emesis, vomiting, throw up, வாந்தி, மயக்கம், उल्टी, जी मिचलाना, వాంతులు, వికారం").build(),
                Symptom.builder().name("Chest Tightness").description("Constricting sensation or heavy pressure across the chest cavity.").category("Cardiovascular").severity("Severe").bodyLocation("Chest").synonyms("chest pressure, heaviness, நெஞ்சு இறுக்கம், छाती में जकड़न").build(),
                Symptom.builder().name("Frequent Urination").description("Urinary frequency exceeding normal physiological patterns.").category("Urological").severity("Mild").bodyLocation("Bladder / Urinary Tract").synonyms("frequent urination, polyuria, அடிக்கடி சிறுநீர் கழித்தல், बार-बार पेशाब आना").build()
        );

        for (Symptom def : defaultSymptoms) {
            Symptom existing = symptomRepository.findAll().stream()
                    .filter(s -> s.getName() != null && s.getName().equalsIgnoreCase(def.getName()))
                    .findFirst().orElse(null);
            if (existing != null) {
                existing.setDescription(def.getDescription());
                existing.setCategory(def.getCategory());
                existing.setSeverity(def.getSeverity());
                existing.setBodyLocation(def.getBodyLocation());
                existing.setSynonyms(def.getSynonyms());
                symptomRepository.save(existing);
            } else {
                symptomRepository.save(def);
            }
        }
        System.out.println("✅ All symptoms synchronized and enriched with complete fields in MongoDB Atlas.");
    }
}
