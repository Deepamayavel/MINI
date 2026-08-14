package com.mediguide.service;

import com.mediguide.repository.AdminHospitalRepository;
import com.mediguide.repository.AdminSpecialistRepository;
import com.mediguide.repository.AdminTestRepository;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OntologyService {

    private static final Logger log = LoggerFactory.getLogger(OntologyService.class);

    @Value("${jena.endpoint}")
    private String sparqlEndpoint;

    private final AdminSpecialistRepository specialistRepository;
    private final AdminHospitalRepository hospitalRepository;
    private final AdminTestRepository testRepository;

    public OntologyService(AdminSpecialistRepository specialistRepository,
                           AdminHospitalRepository hospitalRepository,
                           AdminTestRepository testRepository) {
        this.specialistRepository = specialistRepository;
        this.hospitalRepository = hospitalRepository;
        this.testRepository = testRepository;
    }

    // Built-in disease knowledge base: specialists, tests, hospitals, precautions
    private static final Map<String, String[][]> DISEASE_DATA = new HashMap<>();

    static {
        DISEASE_DATA.put("Diabetes", new String[][]{
            {"Endocrinologist", "General Physician"},
            {"Fasting Blood Sugar", "HbA1c Test", "Urine Glucose Test"},
            {"Apollo Hospitals", "Fortis Healthcare", "AIIMS"},
            {"Monitor blood sugar regularly", "Follow a low-sugar diet", "Exercise daily", "Take prescribed insulin or medication"}
        });
        DISEASE_DATA.put("Hypertension", new String[][]{
            {"Cardiologist", "General Physician"},
            {"Blood Pressure Monitoring", "ECG", "Kidney Function Test"},
            {"Apollo Hospitals", "Fortis Healthcare", "Manipal Hospitals"},
            {"Reduce salt intake", "Exercise regularly", "Avoid stress", "Take prescribed medications"}
        });
        DISEASE_DATA.put("Heart Attack", new String[][]{
            {"Cardiologist", "Cardiac Surgeon"},
            {"ECG", "Troponin Test", "Echocardiogram", "Angiography"},
            {"Apollo Hospitals", "Fortis Heart Institute", "AIIMS Cardiology"},
            {"Call emergency services immediately", "Chew aspirin if not allergic", "Rest and avoid exertion", "Follow up with cardiologist"}
        });
        DISEASE_DATA.put("Common Cold", new String[][]{
            {"General Physician", "ENT Specialist"},
            {"Nasal Swab Test", "CBC"},
            {"Apollo Clinics", "Fortis Clinics", "Local Government Hospital"},
            {"Rest and stay hydrated", "Use saline nasal drops", "Avoid cold exposure", "Take OTC cold medication"}
        });
        DISEASE_DATA.put("Influenza", new String[][]{
            {"General Physician", "Pulmonologist"},
            {"Rapid Influenza Test", "CBC", "Chest X-Ray"},
            {"Apollo Hospitals", "Fortis Healthcare", "AIIMS"},
            {"Rest and stay hydrated", "Take antiviral medication", "Avoid contact with others", "Get annual flu vaccine"}
        });
        DISEASE_DATA.put("COVID-19", new String[][]{
            {"Pulmonologist", "General Physician", "Infectious Disease Specialist"},
            {"RT-PCR Test", "Rapid Antigen Test", "CT Scan Chest", "Oxygen Saturation"},
            {"Apollo COVID Center", "Fortis Healthcare", "AIIMS"},
            {"Isolate immediately", "Monitor oxygen levels", "Stay hydrated", "Seek emergency care if breathing worsens"}
        });
        DISEASE_DATA.put("Pneumonia", new String[][]{
            {"Pulmonologist", "General Physician"},
            {"Chest X-Ray", "CBC", "Sputum Culture", "Blood Culture"},
            {"Apollo Hospitals", "Fortis Healthcare", "AIIMS"},
            {"Complete the full antibiotic course", "Rest and stay hydrated", "Use a humidifier", "Avoid smoking"}
        });
        DISEASE_DATA.put("Tuberculosis", new String[][]{
            {"Pulmonologist", "Infectious Disease Specialist"},
            {"Sputum AFB Test", "Chest X-Ray", "Mantoux Test", "GeneXpert Test"},
            {"Government TB Hospital", "AIIMS", "Apollo Hospitals"},
            {"Complete full 6-month treatment", "Wear a mask", "Ensure good ventilation", "Avoid close contact"}
        });
        DISEASE_DATA.put("Dengue Fever", new String[][]{
            {"General Physician", "Infectious Disease Specialist"},
            {"NS1 Antigen Test", "Dengue IgM/IgG", "CBC", "Platelet Count"},
            {"Apollo Hospitals", "Fortis Healthcare", "Government General Hospital"},
            {"Stay hydrated with fluids", "Monitor platelet count", "Avoid aspirin", "Use mosquito repellent"}
        });
        DISEASE_DATA.put("Malaria", new String[][]{
            {"General Physician", "Infectious Disease Specialist"},
            {"Malaria Rapid Test", "Blood Smear Test", "CBC"},
            {"Government General Hospital", "Apollo Hospitals", "Fortis Healthcare"},
            {"Take full course of antimalarials", "Use mosquito nets", "Stay hydrated", "Avoid mosquito bites"}
        });
        DISEASE_DATA.put("Typhoid", new String[][]{
            {"General Physician", "Gastroenterologist"},
            {"Widal Test", "Blood Culture", "CBC", "Typhidot Test"},
            {"Apollo Hospitals", "Fortis Healthcare", "Government General Hospital"},
            {"Complete antibiotic course", "Drink boiled water only", "Eat light easily digestible food", "Maintain hygiene"}
        });
        DISEASE_DATA.put("Gastritis", new String[][]{
            {"Gastroenterologist", "General Physician"},
            {"Endoscopy", "H. Pylori Test", "CBC", "Stool Test"},
            {"Apollo Hospitals", "Fortis Healthcare", "Manipal Hospitals"},
            {"Avoid spicy and acidic foods", "Take antacids as prescribed", "Eat small frequent meals", "Avoid alcohol and smoking"}
        });
        DISEASE_DATA.put("Appendicitis", new String[][]{
            {"General Surgeon", "Gastroenterologist"},
            {"Ultrasound Abdomen", "CT Scan Abdomen", "CBC", "CRP Test"},
            {"Apollo Hospitals", "Fortis Healthcare", "AIIMS"},
            {"Seek immediate medical attention", "Do not eat or drink before surgery", "Follow post-surgery care", "Rest adequately"}
        });
        DISEASE_DATA.put("Migraine", new String[][]{
            {"Neurologist", "General Physician"},
            {"MRI Brain", "CT Scan Brain", "EEG"},
            {"Apollo Hospitals", "Fortis Neurology", "NIMHANS"},
            {"Rest in a dark quiet room", "Take prescribed migraine medication", "Avoid triggers like bright light", "Stay hydrated"}
        });
        DISEASE_DATA.put("Anemia", new String[][]{
            {"Hematologist", "General Physician"},
            {"CBC", "Serum Iron Test", "Ferritin Test", "Vitamin B12 Test"},
            {"Apollo Hospitals", "Fortis Healthcare", "AIIMS"},
            {"Eat iron-rich foods", "Take iron supplements as prescribed", "Avoid tea/coffee with meals", "Get regular blood tests"}
        });
        DISEASE_DATA.put("Urinary Tract Infection", new String[][]{
            {"Urologist", "General Physician"},
            {"Urine Culture", "Urine Routine Test", "CBC"},
            {"Apollo Hospitals", "Fortis Healthcare", "Manipal Hospitals"},
            {"Drink plenty of water", "Complete antibiotic course", "Maintain hygiene", "Avoid holding urine"}
        });
        DISEASE_DATA.put("Kidney Stones", new String[][]{
            {"Urologist", "Nephrologist"},
            {"Ultrasound Kidney", "CT KUB", "Urine Routine Test", "Serum Creatinine"},
            {"Apollo Hospitals", "Fortis Urology", "AIIMS"},
            {"Drink 2-3 liters of water daily", "Avoid high-oxalate foods", "Take prescribed medication", "Follow up with urologist"}
        });
        DISEASE_DATA.put("Arthritis", new String[][]{
            {"Rheumatologist", "Orthopedic Surgeon"},
            {"RA Factor Test", "Anti-CCP Test", "X-Ray Joints", "ESR Test"},
            {"Apollo Hospitals", "Fortis Orthopedics", "Manipal Hospitals"},
            {"Do low-impact exercises", "Apply hot/cold packs", "Take anti-inflammatory medication", "Maintain healthy weight"}
        });
        DISEASE_DATA.put("Jaundice", new String[][]{
            {"Gastroenterologist", "Hepatologist"},
            {"Liver Function Test", "Bilirubin Test", "Hepatitis Panel", "Ultrasound Abdomen"},
            {"Apollo Hospitals", "Fortis Liver Institute", "AIIMS"},
            {"Rest and avoid alcohol", "Eat light easily digestible food", "Stay hydrated", "Avoid fatty foods"}
        });
        DISEASE_DATA.put("Hepatitis", new String[][]{
            {"Hepatologist", "Gastroenterologist"},
            {"Hepatitis B Surface Antigen", "Hepatitis C Antibody", "Liver Function Test", "Ultrasound Liver"},
            {"Apollo Hospitals", "Fortis Liver Institute", "AIIMS"},
            {"Avoid alcohol completely", "Get vaccinated for Hepatitis A and B", "Take antiviral medication", "Follow up regularly"}
        });
        DISEASE_DATA.put("Allergy", new String[][]{
            {"Allergist", "Immunologist", "ENT Specialist"},
            {"Skin Prick Test", "IgE Blood Test", "CBC with Eosinophils"},
            {"Apollo Hospitals", "Fortis Healthcare", "Manipal Hospitals"},
            {"Identify and avoid allergens", "Take antihistamines as prescribed", "Carry an epinephrine auto-injector", "Consult allergist for immunotherapy"}
        });
        DISEASE_DATA.put("Food Poisoning", new String[][]{
            {"General Physician", "Gastroenterologist"},
            {"Stool Culture", "CBC", "Electrolyte Panel"},
            {"Apollo Clinics", "Fortis Healthcare", "Government General Hospital"},
            {"Stay hydrated with ORS", "Avoid solid food initially", "Seek care if symptoms persist over 2 days", "Maintain food hygiene"}
        });
        DISEASE_DATA.put("Vertigo", new String[][]{
            {"Neurologist", "ENT Specialist"},
            {"MRI Brain", "Audiometry", "ENG Test"},
            {"Apollo Hospitals", "Fortis Neurology", "NIMHANS"},
            {"Avoid sudden head movements", "Do Epley maneuver exercises", "Take prescribed vestibular medication", "Avoid driving during episodes"}
        });
        DISEASE_DATA.put("Asthma", new String[][]{
            {"Pulmonologist", "Allergist"},
            {"Spirometry", "Peak Flow Test", "Chest X-Ray", "Allergy Test"},
            {"Apollo Hospitals", "Fortis Pulmonology", "AIIMS"},
            {"Always carry your inhaler", "Avoid triggers like dust and smoke", "Take controller medication daily", "Monitor peak flow regularly"}
        });
        DISEASE_DATA.put("Bronchitis", new String[][]{
            {"Pulmonologist", "General Physician"},
            {"Chest X-Ray", "Sputum Test", "Spirometry", "CBC"},
            {"Apollo Hospitals", "Fortis Healthcare", "Manipal Hospitals"},
            {"Rest and stay hydrated", "Use a humidifier", "Avoid smoking", "Take prescribed bronchodilators"}
        });
        DISEASE_DATA.put("Chickenpox", new String[][]{
            {"General Physician", "Dermatologist"},
            {"Clinical Diagnosis", "Varicella PCR Test", "CBC"},
            {"Apollo Clinics", "Fortis Healthcare", "Government General Hospital"},
            {"Avoid scratching blisters", "Apply calamine lotion", "Stay isolated to prevent spread", "Take antiviral medication if prescribed"}
        });
        DISEASE_DATA.put("Measles", new String[][]{
            {"General Physician", "Infectious Disease Specialist"},
            {"Measles IgM Antibody Test", "CBC", "Clinical Diagnosis"},
            {"Government General Hospital", "Apollo Hospitals", "Fortis Healthcare"},
            {"Stay isolated", "Rest and stay hydrated", "Take vitamin A supplements", "Get vaccinated (MMR)"}
        });
        DISEASE_DATA.put("Irritable Bowel Syndrome", new String[][]{
            {"Gastroenterologist", "General Physician"},
            {"Colonoscopy", "Stool Test", "CBC", "Food Intolerance Test"},
            {"Apollo Hospitals", "Fortis Healthcare", "Manipal Hospitals"},
            {"Avoid trigger foods", "Eat high-fiber diet", "Manage stress", "Take prescribed medication"}
        });
        DISEASE_DATA.put("Depression", new String[][]{
            {"Psychiatrist", "Psychologist"},
            {"PHQ-9 Assessment", "Thyroid Function Test", "CBC"},
            {"NIMHANS", "Apollo Mental Health", "Fortis Mental Health"},
            {"Seek professional counseling", "Take prescribed antidepressants", "Exercise regularly", "Maintain social connections"}
        });
        DISEASE_DATA.put("Anxiety", new String[][]{
            {"Psychiatrist", "Psychologist"},
            {"GAD-7 Assessment", "Thyroid Function Test", "CBC"},
            {"NIMHANS", "Apollo Mental Health", "Fortis Mental Health"},
            {"Practice deep breathing exercises", "Seek therapy or counseling", "Avoid caffeine and alcohol", "Take prescribed medication"}
        });
    }

    public OntologyResult fetchRecommendations(String diseaseName) {
        // Try Jena SPARQL first
        try {
            return fetchFromJena(diseaseName);
        } catch (Exception ex) {
            log.warn("Jena SPARQL unavailable, falling back to built-in dataset: {}", ex.getMessage());
        }

        // Try built-in dataset
        if (DISEASE_DATA.containsKey(diseaseName)) {
            return fetchFromDataset(diseaseName);
        }

        // Final fallback: MongoDB
        return fetchFromMongoDB();
    }

    private OntologyResult fetchFromDataset(String diseaseName) {
        String[][] data = DISEASE_DATA.get(diseaseName);
        return new OntologyResult(
            Arrays.asList(data[0]),
            Arrays.asList(data[1]),
            Arrays.asList(data[2]),
            Arrays.asList(data[3])
        );
    }

    private OntologyResult fetchFromJena(String diseaseName) {
        String query = String.format("""
                PREFIX md: <http://example.org/mediguide#>
                SELECT ?specialist ?test ?hospital ?precaution
                WHERE {
                    ?disease md:name "%s" ;
                             md:recommendedSpecialist ?specialist ;
                             md:recommendedTest ?test ;
                             md:recommendedHospital ?hospital ;
                             md:precaution ?precaution .
                }
                """, diseaseName);

        List<String> specialists = new ArrayList<>();
        List<String> tests = new ArrayList<>();
        List<String> hospitals = new ArrayList<>();
        List<String> precautions = new ArrayList<>();

        try (QueryExecution qexec = QueryExecutionFactory.sparqlService(sparqlEndpoint, QueryFactory.create(query))) {
            ResultSet results = qexec.execSelect();
            while (results.hasNext()) {
                QuerySolution solution = results.next();
                specialists.add(solution.getLiteral("specialist").getString());
                tests.add(solution.getLiteral("test").getString());
                hospitals.add(solution.getLiteral("hospital").getString());
                precautions.add(solution.getLiteral("precaution").getString());
            }
        }

        return new OntologyResult(specialists, tests, hospitals, precautions);
    }

    private OntologyResult fetchFromMongoDB() {
        List<String> specialists = specialistRepository.findAll().stream()
                .map(s -> s.getName() + " (" + s.getSpecialty() + ")")
                .limit(3)
                .collect(Collectors.toList());

        List<String> hospitals = hospitalRepository.findAll().stream()
                .map(h -> h.getName())
                .limit(3)
                .collect(Collectors.toList());

        List<String> tests = testRepository.findAll().stream()
                .map(t -> t.getName())
                .limit(3)
                .collect(Collectors.toList());

        List<String> precautions = List.of(
                "Consult a doctor for accurate diagnosis",
                "Take prescribed medications regularly",
                "Stay hydrated and get adequate rest",
                "Monitor symptoms and seek emergency care if they worsen"
        );

        return new OntologyResult(specialists, tests, hospitals, precautions);
    }

    public static class OntologyResult {
        private final List<String> specialists;
        private final List<String> tests;
        private final List<String> hospitals;
        private final List<String> precautions;

        public OntologyResult(List<String> specialists, List<String> tests,
                              List<String> hospitals, List<String> precautions) {
            this.specialists = specialists;
            this.tests = tests;
            this.hospitals = hospitals;
            this.precautions = precautions;
        }

        public List<String> getSpecialists() { return specialists; }
        public List<String> getTests() { return tests; }
        public List<String> getHospitals() { return hospitals; }
        public List<String> getPrecautions() { return precautions; }
    }
}
