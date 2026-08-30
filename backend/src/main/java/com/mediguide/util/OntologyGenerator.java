package com.mediguide.util;

import org.apache.jena.ontology.DatatypeProperty;
import org.apache.jena.ontology.Individual;
import org.apache.jena.ontology.ObjectProperty;
import org.apache.jena.ontology.OntClass;
import org.apache.jena.ontology.OntModel;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.vocabulary.RDFS;
import org.apache.jena.vocabulary.XSD;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class OntologyGenerator {

    public static final String NS = "http://example.org/mediguide#";

    public static final Map<String, String[][]> DISEASE_DATA = new HashMap<>();

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

    private static String toLocalName(String type, String value) {
        String clean = value.replaceAll("[^a-zA-Z0-9_]", "_").replaceAll("_+", "_");
        if (clean.startsWith("_")) clean = clean.substring(1);
        if (clean.endsWith("_")) clean = clean.substring(0, clean.length() - 1);
        return type + "_" + clean;
    }

    public static OntModel generateOntology() {
        OntModel model = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        model.setNsPrefix("md", NS);
        model.setNsPrefix("rdfs", RDFS.getURI());
        model.setNsPrefix("xsd", XSD.getURI());

        // 1. OWL Classes
        OntClass diseaseClass = model.createClass(NS + "Disease");
        diseaseClass.addLabel("Disease", "en");
        diseaseClass.addComment("Represents a medical condition or disease", "en");

        OntClass specialistClass = model.createClass(NS + "Specialist");
        specialistClass.addLabel("Specialist", "en");
        specialistClass.addComment("Represents a medical specialist or doctor", "en");

        OntClass testClass = model.createClass(NS + "DiagnosticTest");
        testClass.addLabel("Diagnostic Test", "en");
        testClass.addComment("Represents a clinical or diagnostic laboratory test", "en");

        OntClass hospitalClass = model.createClass(NS + "Hospital");
        hospitalClass.addLabel("Hospital", "en");
        hospitalClass.addComment("Represents a healthcare facility or hospital", "en");

        OntClass precautionClass = model.createClass(NS + "Precaution");
        precautionClass.addLabel("Precaution", "en");
        precautionClass.addComment("Represents preventive measures and care instructions", "en");

        // 2. Object Properties
        ObjectProperty treatedBy = model.createObjectProperty(NS + "treatedBy");
        treatedBy.addDomain(diseaseClass);
        treatedBy.addRange(specialistClass);
        treatedBy.addLabel("treated by", "en");
        treatedBy.addComment("Links a disease to a medical specialist", "en");

        ObjectProperty requiresTest = model.createObjectProperty(NS + "requiresTest");
        requiresTest.addDomain(diseaseClass);
        requiresTest.addRange(testClass);
        requiresTest.addLabel("requires test", "en");
        requiresTest.addComment("Links a disease to recommended diagnostic tests", "en");

        ObjectProperty availableAt = model.createObjectProperty(NS + "availableAt");
        availableAt.addDomain(diseaseClass);
        availableAt.addRange(hospitalClass);
        availableAt.addLabel("available at", "en");
        availableAt.addComment("Links a disease to hospitals offering treatment", "en");

        ObjectProperty hasPrecaution = model.createObjectProperty(NS + "hasPrecaution");
        hasPrecaution.addDomain(diseaseClass);
        hasPrecaution.addRange(precautionClass);
        hasPrecaution.addLabel("has precaution", "en");
        hasPrecaution.addComment("Links a disease to recommended precautions", "en");

        // 3. Datatype Properties (for direct name matching)
        DatatypeProperty nameProp = model.createDatatypeProperty(NS + "name");
        nameProp.addDomain(diseaseClass);
        nameProp.addRange(XSD.xstring);

        DatatypeProperty valueProp = model.createDatatypeProperty(NS + "value");
        valueProp.addRange(XSD.xstring);

        // Cache for individuals to avoid duplicates
        Map<String, Individual> specialistMap = new HashMap<>();
        Map<String, Individual> testMap = new HashMap<>();
        Map<String, Individual> hospitalMap = new HashMap<>();
        Map<String, Individual> precautionMap = new HashMap<>();

        // 4. Create Individuals and Link Relations
        for (Map.Entry<String, String[][]> entry : DISEASE_DATA.entrySet()) {
            String diseaseName = entry.getKey();
            String[][] data = entry.getValue();

            String diseaseUri = NS + toLocalName("Disease", diseaseName);
            Individual diseaseInd = model.createIndividual(diseaseUri, diseaseClass);
            diseaseInd.addLabel(diseaseName, "en");
            diseaseInd.addProperty(nameProp, diseaseName);

            // Specialists (treatedBy)
            for (String spec : data[0]) {
                Individual specInd = specialistMap.computeIfAbsent(spec, s -> {
                    Individual ind = model.createIndividual(NS + toLocalName("Specialist", s), specialistClass);
                    ind.addLabel(s, "en");
                    ind.addProperty(valueProp, s);
                    return ind;
                });
                diseaseInd.addProperty(treatedBy, specInd);
            }

            // Diagnostic Tests (requiresTest)
            for (String test : data[1]) {
                Individual testInd = testMap.computeIfAbsent(test, t -> {
                    Individual ind = model.createIndividual(NS + toLocalName("Test", t), testClass);
                    ind.addLabel(t, "en");
                    ind.addProperty(valueProp, t);
                    return ind;
                });
                diseaseInd.addProperty(requiresTest, testInd);
            }

            // Hospitals (availableAt)
            for (String hosp : data[2]) {
                Individual hospInd = hospitalMap.computeIfAbsent(hosp, h -> {
                    Individual ind = model.createIndividual(NS + toLocalName("Hospital", h), hospitalClass);
                    ind.addLabel(h, "en");
                    ind.addProperty(valueProp, h);
                    return ind;
                });
                diseaseInd.addProperty(availableAt, hospInd);
            }

            // Precautions (hasPrecaution)
            for (String prec : data[3]) {
                Individual precInd = precautionMap.computeIfAbsent(prec, p -> {
                    Individual ind = model.createIndividual(NS + toLocalName("Precaution", p), precautionClass);
                    ind.addLabel(p, "en");
                    ind.addProperty(valueProp, p);
                    return ind;
                });
                diseaseInd.addProperty(hasPrecaution, precInd);
            }
        }

        return model;
    }

    public static void main(String[] args) {
        try {
            System.out.println("Starting OWL Ontology Generation with Apache Jena OntModel API...");
            OntModel model = generateOntology();

            File rootFile = new File("mediguide_ontology.owl");
            File backendFile = new File("src/main/resources/mediguide_ontology.owl");
            File workspaceRootFile = new File("../mediguide_ontology.owl");

            try (OutputStream out = new FileOutputStream(rootFile)) {
                model.write(out, "RDF/XML-ABBREV");
            }
            System.out.println("Generated: " + rootFile.getAbsolutePath());

            if (backendFile.getParentFile() != null && backendFile.getParentFile().exists()) {
                try (OutputStream out = new FileOutputStream(backendFile)) {
                    model.write(out, "RDF/XML-ABBREV");
                }
                System.out.println("Generated: " + backendFile.getAbsolutePath());
            }

            if (workspaceRootFile.getParentFile() != null && workspaceRootFile.getParentFile().exists()) {
                try (OutputStream out = new FileOutputStream(workspaceRootFile)) {
                    model.write(out, "RDF/XML-ABBREV");
                }
                System.out.println("Generated: " + workspaceRootFile.getAbsolutePath());
            }

            System.out.println("OWL Ontology generated successfully with " +
                    DISEASE_DATA.size() + " diseases, classes, properties, and linked individuals.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
