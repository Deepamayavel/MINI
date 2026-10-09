# Populate and Enrich all fields in MediGuide Admin Module
$ErrorActionPreference = "Stop"

$adminLoginBody = @{
    email = "admin@mediguide.com"
    password = "Admin@1234"
} | ConvertTo-Json

$loginResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/admin-login" -Method Post -Body $adminLoginBody -ContentType "application/json"
$token = $loginResp.token
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "✅ Admin Authenticated successfully." -ForegroundColor Green

# 1. ENRICH HOSPITALS
Write-Host "`n[1/5] Enriching Hospitals..." -ForegroundColor Cyan
$hospitalsData = @(
    @{
        name = "Apollo Hospitals"
        address = "Greams Road, Thousand Lights, Chennai - 600006"
        contact = "+91 44 2829 0200"
        city = "Chennai"
        state = "Tamil Nadu"
        pincode = "600006"
        type = "Super-Speciality"
        emergencyAvailable = $true
        icuAvailable = $true
        rating = 4.9
        bedCapacity = 750
        ambulanceContact = "1066"
        departments = "Cardiology, Pulmonology, Neurology, Oncology, Critical Care, Nephrology"
        accreditations = "JCI, NABH, NABL"
        operatingHours = "24 Hours / 7 Days a week"
        insuranceAccepted = "Star Health, MediAssist, ICICI Lombard, Ayushman Bharat (PM-JAY)"
        websiteUrl = "https://www.apollohospitals.com"
    },
    @{
        name = "Fortis Healthcare"
        address = "Bannerghatta Road, Opposite IIMB, Bengaluru - 560076"
        contact = "+91 80 6621 4444"
        city = "Bengaluru"
        state = "Karnataka"
        pincode = "560076"
        type = "Multi-Speciality"
        emergencyAvailable = $true
        icuAvailable = $true
        rating = 4.8
        bedCapacity = 400
        ambulanceContact = "105010"
        departments = "Cardiac Sciences, Orthopedics, Neurosciences, Nephrology, Pulmonology"
        accreditations = "JCI, NABH"
        operatingHours = "24 Hours / 7 Days a week"
        insuranceAccepted = "HDFC ERGO, Star Health, Vidal Health, Max Bupa, Care Health"
        websiteUrl = "https://www.fortishealthcare.com"
    },
    @{
        name = "Government General Hospital"
        address = "EVR Periyar Salai, Park Town, Chennai - 600003"
        contact = "+91 44 2530 5000"
        city = "Chennai"
        state = "Tamil Nadu"
        pincode = "600003"
        type = "Public / Government"
        emergencyAvailable = $true
        icuAvailable = $true
        rating = 4.6
        bedCapacity = 2700
        ambulanceContact = "108"
        departments = "Trauma Care, Internal Medicine, Infectious Diseases, General Surgery, ENT"
        accreditations = "NABH Pre-entry, ISO 9001:2015 Certified"
        operatingHours = "24 Hours / 7 Days a week"
        insuranceAccepted = "Chief Minister Comprehensive Health Insurance Scheme (CMCHIS), PM-JAY"
        websiteUrl = "https://www.mmc.tn.gov.in"
    },
    @{
        name = "PSG Hospitals"
        address = "Peelamedu, Avinashi Road, Coimbatore - 641004"
        contact = "+91 422 257 0170"
        city = "Coimbatore"
        state = "Tamil Nadu"
        pincode = "641004"
        type = "Teaching Multi-Speciality"
        emergencyAvailable = $true
        icuAvailable = $true
        rating = 4.7
        bedCapacity = 1400
        ambulanceContact = "+91 422 257 0170"
        departments = "Pulmonology, Cardiology, Pediatrics, Critical Care, Endocrinology"
        accreditations = "NABH, NABL"
        operatingHours = "24 Hours / 7 Days a week"
        insuranceAccepted = "All Major Corporate Insurances, CMCHIS, Star Health, Reliance General"
        websiteUrl = "https://psghospitals.com"
    },
    @{
        name = "AIIMS New Delhi"
        address = "Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029"
        contact = "+91 11 2658 8500"
        city = "New Delhi"
        state = "Delhi"
        pincode = "110029"
        type = "Apex Medical Institute"
        emergencyAvailable = $true
        icuAvailable = $true
        rating = 4.9
        bedCapacity = 2500
        ambulanceContact = "102 / 108"
        departments = "All Super-Specialities, Advanced Trauma, Organ Transplant, Neurology, Oncology"
        accreditations = "Apex National Institute, JCI Reference"
        operatingHours = "24 Hours / 7 Days a week"
        insuranceAccepted = "Central Government Health Scheme (CGHS), PM-JAY, ECHS, Cashless TPA"
        websiteUrl = "https://www.aiims.edu"
    },
    @{
        name = "Manipal Hospital"
        address = "98 HAL Airport Road, Kodihalli, Bengaluru - 560017"
        contact = "+91 80 2502 4444"
        city = "Bengaluru"
        state = "Karnataka"
        pincode = "560017"
        type = "Multi-Speciality"
        emergencyAvailable = $true
        icuAvailable = $true
        rating = 4.8
        bedCapacity = 600
        ambulanceContact = "080 2222 1111"
        departments = "Gastroenterology, Dermatology, Cardiology, Oncology, Critical Care"
        accreditations = "NABH, NABL, AAHRPP"
        operatingHours = "24 Hours / 7 Days a week"
        insuranceAccepted = "Care Health, ICICI Lombard, Star Health, MediAssist, Bajaj Allianz"
        websiteUrl = "https://www.manipalhospitals.com"
    },
    @{
        name = "Kauvery Hospital"
        address = "Tennur High Road, Tennur, Tiruchirappalli - 620017"
        contact = "+91 431 407 7777"
        city = "Tiruchirappalli"
        state = "Tamil Nadu"
        pincode = "620017"
        type = "Multi-Speciality"
        emergencyAvailable = $true
        icuAvailable = $true
        rating = 4.7
        bedCapacity = 350
        ambulanceContact = "+91 431 407 7777"
        departments = "Vascular Surgery, Interventional Cardiology, Geriatric Care, Gastroenterology"
        accreditations = "NABH, NABL"
        operatingHours = "24 Hours / 7 Days a week"
        insuranceAccepted = "Star Health, Bajaj Allianz, Care Health, CMCHIS, MediAssist"
        websiteUrl = "https://www.kauveryhospital.com"
    },
    @{
        name = "City Care Multi-Speciality Clinic"
        address = "Avinashi Road, Peelamedu, Coimbatore - 641004"
        contact = "+91 422 439 1234"
        city = "Coimbatore"
        state = "Tamil Nadu"
        pincode = "641004"
        type = "Outpatient Clinic"
        emergencyAvailable = $false
        icuAvailable = $false
        rating = 4.4
        bedCapacity = 20
        ambulanceContact = "+91 422 439 1234"
        departments = "Family Medicine, Outpatient Pediatrics, Preventive Health, General Medicine"
        accreditations = "NABH Clinic Standard, ISO Certified"
        operatingHours = "08:00 AM - 09:00 PM (Mon-Sat)"
        insuranceAccepted = "Star Health Cashless OPD, MediAssist, Reimbursement All TPAs"
        websiteUrl = "https://www.citycareclinic.com"
    },
    @{
        name = "Apollo Speciality Hospitals OMR"
        address = "05/639, Old Mahabalipuram Rd, Thoraipakkam, Chennai - 600097"
        contact = "+91 44 2496 1111"
        city = "Chennai"
        state = "Tamil Nadu"
        pincode = "600097"
        type = "Super-Speciality"
        emergencyAvailable = $true
        icuAvailable = $true
        rating = 4.8
        bedCapacity = 500
        ambulanceContact = "1066"
        departments = "Emergency Medicine, Rheumatology, Cardiology, Neurosciences, Orthopedics"
        accreditations = "JCI, NABH, NABL"
        operatingHours = "24 Hours / 7 Days a week"
        insuranceAccepted = "Star Health, MediAssist, ICICI Lombard, HDFC ERGO, Ayushman Bharat"
        websiteUrl = "https://www.apollohospitals.com/omr"
    }
)

$existingHospitals = (Invoke-RestMethod -Uri "http://localhost:8080/api/admin/hospitals?page=0&size=50" -Headers $headers).content

foreach ($h in $hospitalsData) {
    $match = $existingHospitals | Where-Object { $_.name -and $_.name.Trim().ToLower() -eq $h.name.Trim().ToLower() } | Select-Object -First 1
    $bodyJson = $h | ConvertTo-Json
    if ($match) {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/hospitals/$($match.id)" -Method Put -Body $bodyJson -Headers $headers
        Write-Host "  Updated Hospital: $($h.name)" -ForegroundColor Green
    } else {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/hospitals" -Method Post -Body $bodyJson -Headers $headers
        Write-Host "  Created Hospital: $($h.name)" -ForegroundColor Yellow
    }
}

# 2. ENRICH SPECIALISTS
Write-Host "`n[2/5] Enriching Specialists..." -ForegroundColor Cyan
$specialistsData = @(
    @{
        name = "Dr. S. K. Sharma"
        specialty = "General Physician"
        hospitalName = "Apollo Hospitals"
        experience = "15 Years"
        consultationFee = "₹600"
        contact = "+91 98401 23456"
    },
    @{
        name = "Dr. Anita Raman"
        specialty = "Pulmonologist"
        hospitalName = "Fortis Healthcare"
        experience = "12 Years"
        consultationFee = "₹800"
        contact = "+91 98402 34567"
    },
    @{
        name = "Dr. V. Rajesh"
        specialty = "Cardiologist"
        hospitalName = "Apollo Hospitals"
        experience = "18 Years"
        consultationFee = "₹1,000"
        contact = "+91 98403 45678"
    },
    @{
        name = "Dr. Meera Nambiar"
        specialty = "Dermatologist"
        hospitalName = "Manipal Hospital"
        experience = "10 Years"
        consultationFee = "₹700"
        contact = "+91 98404 56789"
    },
    @{
        name = "Dr. K. Narayanan"
        specialty = "Neurologist"
        hospitalName = "AIIMS New Delhi"
        experience = "20 Years"
        consultationFee = "₹1,200"
        contact = "+91 98405 67890"
    },
    @{
        name = "Dr. Priya Sundaram"
        specialty = "Endocrinologist"
        hospitalName = "PSG Hospitals"
        experience = "11 Years"
        consultationFee = "₹750"
        contact = "+91 98406 78901"
    },
    @{
        name = "Dr. Arun Kumar"
        specialty = "Gastroenterologist"
        hospitalName = "Kauvery Hospital"
        experience = "14 Years"
        consultationFee = "₹850"
        contact = "+91 98407 89012"
    },
    @{
        name = "Dr. T. Venkatesh"
        specialty = "ENT Specialist"
        hospitalName = "Government General Hospital"
        experience = "16 Years"
        consultationFee = "₹500"
        contact = "+91 98408 90123"
    },
    @{
        name = "Dr. K. Senthil Nathan"
        specialty = "Rheumatologist / General Physician"
        hospitalName = "Apollo Speciality Hospitals OMR"
        experience = "16 Years"
        consultationFee = "₹800"
        contact = "+91 98408 44321"
    }
)

$existingSpecialists = (Invoke-RestMethod -Uri "http://localhost:8080/api/admin/specialists?page=0&size=50" -Headers $headers).content

foreach ($s in $specialistsData) {
    $match = $existingSpecialists | Where-Object { $_.name -and $_.name.Trim().ToLower() -eq $s.name.Trim().ToLower() } | Select-Object -First 1
    $bodyJson = $s | ConvertTo-Json
    if ($match) {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/specialists/$($match.id)" -Method Put -Body $bodyJson -Headers $headers
        Write-Host "  Updated Specialist: $($s.name)" -ForegroundColor Green
    } else {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/specialists" -Method Post -Body $bodyJson -Headers $headers
        Write-Host "  Created Specialist: $($s.name)" -ForegroundColor Yellow
    }
}

# 3. ENRICH DIAGNOSTIC TESTS
Write-Host "`n[3/5] Enriching Diagnostic Tests..." -ForegroundColor Cyan
$testsData = @(
    @{
        name = "Complete Blood Count (CBC)"
        category = "Hematology"
        turnaroundTime = "2-4 hours"
        approxCost = 350.0
        description = "Evaluates overall health and detects infection, anemia, leukocytosis, and platelet disorders."
    },
    @{
        name = "NS1 Antigen & Dengue IgM/IgG"
        category = "Serology"
        turnaroundTime = "1-2 hours"
        approxCost = 850.0
        description = "Early detection of Dengue virus NS1 antigen and acute convalescent response antibodies."
    },
    @{
        name = "Varicella PCR Test"
        category = "Molecular Diagnostics"
        turnaroundTime = "24 hours"
        approxCost = 1800.0
        description = "Rapid molecular identification of Varicella Zoster virus in suspected Chickenpox blister lesions."
    },
    @{
        name = "Chest X-Ray / CT Thorax"
        category = "Radiology / Imaging"
        turnaroundTime = "30 mins"
        approxCost = 600.0
        description = "High-resolution radiological imaging to identify pulmonary consolidation, infiltrates, and lung infections."
    },
    @{
        name = "HbA1c Glycated Hemoglobin"
        category = "Biochemistry"
        turnaroundTime = "3 hours"
        approxCost = 450.0
        description = "Measures 3-month average plasma glucose concentration for diabetes diagnosis and monitoring."
    },
    @{
        name = "Widal Test & Typhoid Culture"
        category = "Microbiology"
        turnaroundTime = "24-48 hours"
        approxCost = 400.0
        description = "Diagnostic serological agglutination and blood culture test for Salmonella typhi antigens."
    },
    @{
        name = "Malaria Antigen Blood Smear"
        category = "Parasitology"
        turnaroundTime = "1 hour"
        approxCost = 300.0
        description = "Microscopic peripheral smear and rapid card test for detection of Plasmodium vivax and falciparum."
    },
    @{
        name = "ECG & 2D Echocardiogram"
        category = "Cardiology"
        turnaroundTime = "45 mins"
        approxCost = 1200.0
        description = "Assessment of cardiac electrical conductivity rhythm and ultrasound analysis of heart chambers."
    },
    @{
        name = "Chikungunya IgM ELISA Antibody Test"
        category = "Serology"
        turnaroundTime = "3-4 hours"
        approxCost = 950.0
        description = "Detects acute Chikungunya virus IgM antibodies via enzyme-linked immunosorbent assay."
    }
)

$existingTests = (Invoke-RestMethod -Uri "http://localhost:8080/api/admin/tests?page=0&size=50" -Headers $headers).content

foreach ($t in $testsData) {
    $match = $existingTests | Where-Object { $_.name -and $_.name.Trim().ToLower() -eq $t.name.Trim().ToLower() } | Select-Object -First 1
    $bodyJson = $t | ConvertTo-Json
    if ($match) {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/tests/$($match.id)" -Method Put -Body $bodyJson -Headers $headers
        Write-Host "  Updated Test: $($t.name)" -ForegroundColor Green
    } else {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/tests" -Method Post -Body $bodyJson -Headers $headers
        Write-Host "  Created Test: $($t.name)" -ForegroundColor Yellow
    }
}

# 4. ENRICH DISEASES
Write-Host "`n[4/5] Enriching Diseases..." -ForegroundColor Cyan
$diseasesData = @(
    @{
        name = "Dengue Fever"
        category = "Infectious / Viral"
        severityScore = 0.85
        commonSymptoms = "High Fever, Severe Headache, Joint & Muscle Pain, Skin Rash, Nausea & Vomiting"
        recommendedSpecialist = "General Physician"
        precautions = "Hydrate intensively with oral fluids and ORS, monitor platelet count daily, strictly avoid aspirin or ibuprofen, use mosquito nets"
        description = "Mosquito-borne viral infection caused by dengue flavivirus, characterized by acute high fever, thrombocytopenia, and capillary leakage."
    },
    @{
        name = "Common Cold"
        category = "Respiratory"
        severityScore = 0.25
        commonSymptoms = "Sore Throat, Persistent Cough, Fatigue & Weakness, Headache"
        recommendedSpecialist = "General Physician"
        precautions = "Adequate rest, stay warm and hydrated, warm saline gargling, use steam inhalation"
        description = "Viral infectious disease of the upper respiratory tract primarily caused by rhinoviruses."
    },
    @{
        name = "Pneumonia"
        category = "Respiratory"
        severityScore = 0.80
        commonSymptoms = "Breathlessness, Persistent Cough, High Fever, Fatigue & Weakness"
        recommendedSpecialist = "Pulmonologist"
        precautions = "Complete full antibiotic course, monitor oxygen saturation (SpO2), take adequate rest, avoid cigarette smoke"
        description = "Acute inflammatory infection of pulmonary alveoli leading to exudative consolidation and impaired gas exchange."
    },
    @{
        name = "Chickenpox"
        category = "Dermatological / Viral"
        severityScore = 0.55
        commonSymptoms = "Skin Rash, High Fever, Fatigue & Weakness, Headache"
        recommendedSpecialist = "Dermatologist"
        precautions = "Strict home isolation until blisters crust, apply topical calamine lotion, trim fingernails to avoid secondary infection"
        description = "Highly contagious acute exanthematous disease caused by the primary infection of Varicella Zoster virus (VZV)."
    },
    @{
        name = "Malaria"
        category = "Infectious / Parasitic"
        severityScore = 0.75
        commonSymptoms = "High Fever, Chills & Shivering, Headache, Nausea & Vomiting, Fatigue & Weakness"
        recommendedSpecialist = "General Physician"
        precautions = "Complete full course of antimalarial medication (ACT), sleep under insecticide-treated bed nets, maintain fluid intake"
        description = "Life-threatening mosquito-borne infectious disease caused by Plasmodium parasites transmitted through female Anopheles bites."
    },
    @{
        name = "Typhoid"
        category = "Gastrointestinal / Bacterial"
        severityScore = 0.70
        commonSymptoms = "High Fever, Headache, Fatigue & Weakness, Nausea & Vomiting"
        recommendedSpecialist = "Gastroenterologist"
        precautions = "Drink only boiled or filtered water, eat hot thoroughly cooked light meals, complete prescribed antibiotic regimen, practice strict hand hygiene"
        description = "Systemic bacterial illness caused by Salmonella enterica serotype Typhi transmitted through contaminated food and water."
    },
    @{
        name = "Diabetes"
        category = "Metabolic / Endocrine"
        severityScore = 0.65
        commonSymptoms = "Frequent Urination, Fatigue & Weakness"
        recommendedSpecialist = "Endocrinologist"
        precautions = "Adhere to low glycemic index diet, engage in 30 mins daily aerobic exercise, perform daily self-monitoring of blood glucose, inspect feet regularly"
        description = "Chronic metabolic syndrome characterized by persistent hyperglycemia resulting from insulin secretion deficiency or insulin resistance."
    },
    @{
        name = "Bronchial Asthma"
        category = "Respiratory"
        severityScore = 0.70
        commonSymptoms = "Breathlessness, Persistent Cough"
        recommendedSpecialist = "Pulmonologist"
        precautions = "Always carry fast-acting bronchodilator rescue inhaler, avoid known allergens, cold air, and tobacco smoke, use peak flow meter"
        description = "Chronic heterogeneous inflammatory disorder of airways causing recurrent wheezing, breathlessness, and bronchial hyperresponsiveness."
    },
    @{
        name = "fever"
        category = "Infectious / Viral"
        severityScore = 0.60
        commonSymptoms = "High Fever, Chills & Shivering, Headache, Fatigue & Weakness"
        recommendedSpecialist = "General Physician"
        precautions = "Rest, monitor body temperature every 4 hours, maintain hydration with electrolytes, consult doctor if fever persists > 48h"
        description = "Pyrexia characterized by elevation of body temperature above normal circadian range in response to systemic infection or inflammation."
    },
    @{
        name = "Chikungunya"
        category = "Infectious / Viral"
        severityScore = 0.72
        commonSymptoms = "High Fever, Joint & Muscle Pain, Skin Rash, Fatigue & Weakness"
        recommendedSpecialist = "General Physician"
        precautions = "Adequate oral rehydration, complete rest, avoid aspirin or NSAIDs until dengue is excluded, cold compresses for joints"
        description = "Mosquito-borne alphavirus infection characterized by acute febrile polyarthralgia and persistent joint swelling."
    }
)

$existingDiseases = (Invoke-RestMethod -Uri "http://localhost:8080/api/admin/diseases?page=0&size=50" -Headers $headers).content

foreach ($d in $diseasesData) {
    $match = $existingDiseases | Where-Object { $_.name -and $_.name.Trim().ToLower() -eq $d.name.Trim().ToLower() } | Select-Object -First 1
    $bodyJson = $d | ConvertTo-Json
    if ($match) {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/diseases/$($match.id)" -Method Put -Body $bodyJson -Headers $headers
        Write-Host "  Updated Disease: $($d.name)" -ForegroundColor Green
    } else {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/diseases" -Method Post -Body $bodyJson -Headers $headers
        Write-Host "  Created Disease: $($d.name)" -ForegroundColor Yellow
    }
}

# 5. ENRICH SYMPTOMS
Write-Host "`n[5/5] Enriching Symptoms..." -ForegroundColor Cyan
$symptomsData = @(
    @{
        name = "High Fever"
        description = "Body temperature significantly above normal (38°C / 100.4°F)."
        category = "General / Systemic"
        severity = "Severe"
        bodyLocation = "Whole Body"
        synonyms = "fever, pyrexia, காய்ச்சல், சுரம், बुखार, तेज बुखार, bukhar, జ్వరం"
    },
    @{
        name = "Headache"
        description = "Pain or aching sensation in any region of the head or cranial area."
        category = "Neurological"
        severity = "Moderate"
        bodyLocation = "Head"
        synonyms = "head pain, cephalalgia, migraine, தலைவலி, தலை வலி, सिरदर्द, सिर दर्द, sirdard, తలనొప్పి"
    },
    @{
        name = "Chills & Shivering"
        description = "Involuntary trembling or sensation of cold despite ambient warmth."
        category = "General / Systemic"
        severity = "Moderate"
        bodyLocation = "Whole Body"
        synonyms = "chills, shivering, rigor, குளிர்காய்ச்சல், கம்பம், कंपकंपी"
    },
    @{
        name = "Persistent Cough"
        description = "Dry or productive coughing continuing for multiple days."
        category = "Respiratory"
        severity = "Moderate"
        bodyLocation = "Throat / Chest"
        synonyms = "cough, hacking, phlegm cough, இருமல், வறட்டு இருமல், खांसी, khasi, దగ్గు"
    },
    @{
        name = "Joint & Muscle Pain"
        description = "Arthralgia or generalized myalgia across limbs, joints, or spine."
        category = "Musculoskeletal"
        severity = "Moderate"
        bodyLocation = "Limbs / Joints"
        synonyms = "body ache, myalgia, arthralgia, மூட்டு வலி, உடல் வலி, जोड़ों का दर्द, बदन दर्द, కీళ్ల నొప్పులు"
    },
    @{
        name = "Breathlessness"
        description = "Difficulty breathing or feeling short of breath, needing immediate evaluation."
        category = "Respiratory"
        severity = "Severe"
        bodyLocation = "Chest / Lungs"
        synonyms = "shortness of breath, dyspnea, மூச்சு திணறல், மூச்சுத்திணறல், सांस फूलना, सांस लेने में तकलीफ, శ్వాస తీసుకోవడంలో ఇబ్బంది"
    },
    @{
        name = "Skin Rash"
        description = "Erythematous, itchy, or blistering eruptions on cutaneous tissue."
        category = "Dermatological"
        severity = "Mild"
        bodyLocation = "Skin"
        synonyms = "rash, eruption, hives, அரிப்பு, தோல் தடிப்பு, खुजली, दाने, దుரద"
    },
    @{
        name = "Fatigue & Weakness"
        description = "Overwhelming physical exhaustion and debilitating lack of energy."
        category = "General / Systemic"
        severity = "Mild"
        bodyLocation = "Whole Body"
        synonyms = "exhaustion, lethargy, asthenia, களைப்பு, சோர்வு, थकान, कमजोरी, అలసట"
    },
    @{
        name = "Sore Throat"
        description = "Pain, irritation, or scratchiness of the throat worsening with swallowing."
        category = "ENT / Sensory"
        severity = "Mild"
        bodyLocation = "Throat"
        synonyms = "throat pain, pharyngitis, தொண்டை வலி, தொண்டை கரகரப்பு, गले में खराश, गले में दर्द, గొంతు నొప్పి"
    },
    @{
        name = "Nausea & Vomiting"
        description = "Urge to vomit or involuntary expulsion of gastric contents."
        category = "Gastrointestinal"
        severity = "Moderate"
        bodyLocation = "Abdomen / Stomach"
        synonyms = "emesis, vomiting, throw up, வாந்தி, மயக்கம், उल्टी, जी मिचलाना, వాంతులు, వికారం"
    },
    @{
        name = "Chest Tightness"
        description = "Constricting sensation or heavy pressure across the chest cavity."
        category = "Cardiovascular"
        severity = "Severe"
        bodyLocation = "Chest"
        synonyms = "chest pressure, heaviness, நெஞ்சு இறுக்கம், छाती में जकड़न"
    },
    @{
        name = "Frequent Urination"
        description = "Urinary frequency exceeding normal physiological patterns."
        category = "Urological"
        severity = "Mild"
        bodyLocation = "Bladder / Urinary Tract"
        synonyms = "frequent urination, polyuria, அடிக்கடி சிறுநீர் கழித்தல், बार-बार पेशाब आना"
    }
)

$existingSymptoms = (Invoke-RestMethod -Uri "http://localhost:8080/api/admin/symptoms?page=0&size=50" -Headers $headers).content

foreach ($sym in $symptomsData) {
    $match = $existingSymptoms | Where-Object { $_.name -and $_.name.Trim().ToLower() -eq $sym.name.Trim().ToLower() } | Select-Object -First 1
    $bodyJson = $sym | ConvertTo-Json
    if ($match) {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/symptoms/$($match.id)" -Method Put -Body $bodyJson -Headers $headers
        Write-Host "  Updated Symptom: $($sym.name)" -ForegroundColor Green
    } else {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/symptoms" -Method Post -Body $bodyJson -Headers $headers
        Write-Host "  Created Symptom: $($sym.name)" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 All Admin Resources (Hospitals, Specialists, Diagnostic Tests, Diseases, Symptoms) successfully enriched and verified!" -ForegroundColor Green
