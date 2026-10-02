import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './AdminManagementPage.css';
import {
  createAdminResource,
  deleteAdminResource,
  listAdminResources,
  updateAdminResource,
} from '../src/api.js';

const RESOURCE_CONFIG = {
  symptoms: {
    id: 'symptoms',
    icon: '📋',
    title: 'Symptom Management',
    subtitle: 'Manage clinical symptom entities, severity weights, anatomical locations, and multilingual synonyms (Tamil, Hindi, Telugu, English).',
    endpoint: 'symptoms',
    singular: 'Symptom',
    listFields: [
      { key: 'name', label: 'Symptom Name', primary: true, sortable: true },
      { key: 'category', label: 'Category', type: 'category', sortable: true },
      { key: 'severity', label: 'Severity', type: 'severity', sortable: true },
      { key: 'bodyLocation', label: 'Body Location', sortable: true },
      { key: 'synonyms', label: 'Multilingual Synonyms / Aliases', type: 'synonyms' },
      { key: 'description', label: 'Clinical Description', truncate: true },
    ],
    formFields: [
      { name: 'name', label: 'Symptom Name', type: 'text', required: true, placeholder: 'e.g. High Fever, Headache, Joint Pain' },
      {
        name: 'category',
        label: 'Clinical Category',
        type: 'select',
        required: true,
        options: [
          'General / Systemic',
          'Respiratory',
          'Neurological',
          'Cardiovascular',
          'Gastrointestinal',
          'Musculoskeletal',
          'Dermatological',
          'ENT / Sensory',
          'Urological',
          'Other'
        ],
      },
      {
        name: 'severity',
        label: 'Clinical Severity',
        type: 'select',
        required: true,
        options: ['Mild', 'Moderate', 'Severe'],
      },
      {
        name: 'bodyLocation',
        label: 'Body Location / Organ',
        type: 'text',
        placeholder: 'e.g. Whole Body, Chest / Lungs, Head, Throat',
        suggestions: ['Whole Body', 'Head', 'Throat', 'Chest / Lungs', 'Abdomen', 'Limbs / Joints', 'Skin']
      },
      {
        name: 'synonyms',
        label: 'Multilingual Synonyms & Spoken Aliases (Comma-separated)',
        type: 'textarea',
        rows: 2,
        placeholder: 'e.g. fever, pyrexia, காய்ச்சல், சுரம், बुखार, bukhar, జ్వరం',
        hint: 'Support Tamil, Hindi, Telugu, and English aliases used in speech and text queries.'
      },
      {
        name: 'description',
        label: 'Clinical Description & Guidance',
        type: 'textarea',
        rows: 3,
        placeholder: 'Detailed medical presentation, progression, or diagnostic importance...'
      },
    ],
    empty: () => ({
      name: '',
      category: 'General / Systemic',
      severity: 'Moderate',
      bodyLocation: '',
      synonyms: '',
      description: '',
    }),
    presets: [
      { name: 'High Fever', category: 'General / Systemic', severity: 'Severe', bodyLocation: 'Whole Body', synonyms: 'fever, pyrexia, காய்ச்சல், சுரம், बुखार, तेज बुखार, bukhar, జ్వరం', description: 'Body temperature significantly above normal (38°C / 100.4°F).' },
      { name: 'Headache', category: 'Neurological', severity: 'Moderate', bodyLocation: 'Head', synonyms: 'head pain, cephalalgia, migraine, தலைவலி, தலை வலி, सिरदर्द, सिर दर्द, sirdard, తలనొప్పి', description: 'Pain or aching sensation in any region of the head or cranial area.' },
      { name: 'Chills & Shivering', category: 'General / Systemic', severity: 'Moderate', bodyLocation: 'Whole Body', synonyms: 'chills, shivering, rigor, குளிர்காய்ச்சல், கம்பம், कंपकंपी', description: 'Involuntary trembling or sensation of cold despite ambient warmth.' },
      { name: 'Persistent Cough', category: 'Respiratory', severity: 'Moderate', bodyLocation: 'Throat / Chest', synonyms: 'cough, hacking, phlegm cough, இருமல், வறட்டு இருமல், खांसी, khasi, దగ్గు', description: 'Dry or productive coughing continuing for multiple days.' },
      { name: 'Joint & Muscle Pain', category: 'Musculoskeletal', severity: 'Moderate', bodyLocation: 'Limbs / Joints', synonyms: 'body ache, myalgia, arthralgia, மூட்டு வலி, உடல் வலி, जोड़ों का दर्द, बदन दर्द, కీళ్ల నొప్పులు', description: 'Arthralgia or generalized myalgia across limbs, joints, or spine.' },
      { name: 'Breathlessness', category: 'Respiratory', severity: 'Severe', bodyLocation: 'Chest / Lungs', synonyms: 'shortness of breath, dyspnea, மூச்சு திணறல், மூச்சுத்திணறல், सांस फूलना, सांस लेने में तकलीफ, శ్వాస తీసుకోవడంలో ఇబ్బంది', description: 'Difficulty breathing or feeling short of breath, needing immediate evaluation.' },
      { name: 'Skin Rash', category: 'Dermatological', severity: 'Mild', bodyLocation: 'Skin', synonyms: 'rash, eruption, hives, அரிப்பு, தோல் தடிப்பு, खुजली, दाने, దురద', description: 'Erythematous, itchy, or blistering eruptions on cutaneous tissue.' },
      { name: 'Fatigue & Weakness', category: 'General / Systemic', severity: 'Mild', bodyLocation: 'Whole Body', synonyms: 'exhaustion, lethargy, asthenia, களைப்பு, சோர்வு, थकान, कमजोरी, అలసట', description: 'Overwhelming physical exhaustion and debilitating lack of energy.' },
      { name: 'Sore Throat', category: 'ENT / Sensory', severity: 'Mild', bodyLocation: 'Throat', synonyms: 'throat pain, pharyngitis, தொண்டை வலி, தொண்டை கரகரப்பு, गले में खराश, गले में दर्द, గొంతు నొప్పి', description: 'Pain, irritation, or scratchiness of the throat worsening with swallowing.' },
      { name: 'Nausea & Vomiting', category: 'Gastrointestinal', severity: 'Moderate', bodyLocation: 'Abdomen / Stomach', synonyms: 'emesis, vomiting, throw up, வாந்தி, மயக்கம், उल्टी, जी मिचलाना, వాంతులు, వికారం', description: 'Urge to vomit or involuntary expulsion of gastric contents.' },
    ],
  },
  diseases: {
    id: 'diseases',
    icon: '🦠',
    title: 'Disease Management',
    subtitle: 'Manage diseases, ontology knowledge graphs, diagnostic criteria, and severity scores.',
    endpoint: 'diseases',
    singular: 'Disease',
    listFields: [
      { key: 'name', label: 'Disease Name', primary: true, sortable: true },
      { key: 'category', label: 'Category', type: 'category', sortable: true },
      { key: 'severityScore', label: 'Severity Index', type: 'score', sortable: true },
      { key: 'recommendedSpecialist', label: 'Specialist', sortable: true },
      { key: 'commonSymptoms', label: 'Key Symptoms' },
      { key: 'description', label: 'Description', truncate: true },
    ],
    formFields: [
      { name: 'name', label: 'Disease Name', type: 'text', required: true, placeholder: 'e.g. Dengue Fever, Pneumonia' },
      {
        name: 'category',
        label: 'Clinical Category',
        type: 'select',
        required: true,
        options: [
          'Infectious / Viral',
          'Infectious / Parasitic',
          'Respiratory',
          'Cardiovascular',
          'Metabolic / Endocrine',
          'Gastrointestinal / Bacterial',
          'Neurological',
          'Dermatological / Viral',
          'Other'
        ],
      },
      {
        name: 'severityScore',
        label: 'Severity Score (0.00 to 1.00)',
        type: 'number',
        step: '0.01',
        min: '0',
        max: '1',
        required: true,
        placeholder: 'e.g. 0.85',
        scorePresets: [
          { label: 'Mild (0.25)', value: 0.25 },
          { label: 'Moderate (0.50)', value: 0.50 },
          { label: 'High (0.75)', value: 0.75 },
          { label: 'Critical (0.90)', value: 0.90 },
        ]
      },
      { name: 'recommendedSpecialist', label: 'Recommended Medical Specialist', type: 'text', placeholder: 'e.g. Pulmonologist, Cardiologist', linkedList: 'specialists' },
      { name: 'commonSymptoms', label: 'Associated Symptoms (Comma-separated)', type: 'textarea', rows: 2, placeholder: 'e.g. High Fever, Headache, Joint Pain, Rash' },
      { name: 'precautions', label: 'Clinical Precautions & Care Advice', type: 'textarea', rows: 2, placeholder: 'e.g. Hydrate with fluids, monitor platelets, avoid aspirin' },
      { name: 'description', label: 'Pathological Overview & Clinical Profile', type: 'textarea', rows: 3, placeholder: 'Detailed description of disease etiology and characteristics' },
    ],
    empty: () => ({
      name: '',
      category: 'Infectious / Viral',
      severityScore: 0.5,
      recommendedSpecialist: '',
      commonSymptoms: '',
      precautions: '',
      description: '',
    }),
    presets: [
      { name: 'Dengue Fever', category: 'Infectious / Viral', severityScore: 0.85, commonSymptoms: 'High Fever, Severe Headache, Joint Pain, Rash', recommendedSpecialist: 'General Physician / Infectious Specialist', precautions: 'Hydrate with fluids, monitor platelets, avoid aspirin', description: 'Mosquito-borne viral infection causing acute high fever and thrombocytopenia.' },
      { name: 'Common Cold', category: 'Respiratory', severityScore: 0.25, commonSymptoms: 'Runny Nose, Sneezing, Sore Throat, Cough', recommendedSpecialist: 'General Physician / ENT', precautions: 'Rest, stay warm, saline gargles, hydration', description: 'Viral infectious disease of the upper respiratory tract.' },
      { name: 'Pneumonia', category: 'Respiratory', severityScore: 0.80, commonSymptoms: 'Chest Pain, Cough with Phlegm, Breathlessness, Fever', recommendedSpecialist: 'Pulmonologist', precautions: 'Take full antibiotic course, rest, avoid smoking', description: 'Inflammatory condition of the lung primarily affecting alveoli.' },
      { name: 'Chickenpox', category: 'Dermatological / Viral', severityScore: 0.55, commonSymptoms: 'Itchy Blisters, Fever, Fatigue, Headache', recommendedSpecialist: 'Dermatologist / General Physician', precautions: 'Isolate, apply calamine, avoid scratching blisters', description: 'Highly contagious viral infection causing an itchy blister-like rash.' },
      { name: 'Malaria', category: 'Infectious / Parasitic', severityScore: 0.75, commonSymptoms: 'Fever with Chills, Sweating, Headache, Nausea', recommendedSpecialist: 'General Physician', precautions: 'Complete antimalarials, sleep under mosquito net', description: 'Mosquito-borne infectious disease caused by parasitic protozoans.' },
      { name: 'Typhoid', category: 'Gastrointestinal / Bacterial', severityScore: 0.70, commonSymptoms: 'Sustained High Fever, Stomach Pain, Weakness, Loss of Appetite', recommendedSpecialist: 'Gastroenterologist', precautions: 'Drink boiled water, eat light foods, complete antibiotics', description: 'Bacterial infection caused by Salmonella typhi.' },
      { name: 'Diabetes', category: 'Metabolic / Endocrine', severityScore: 0.65, commonSymptoms: 'Frequent Urination, Excessive Thirst, Fatigue, Blurred Vision', recommendedSpecialist: 'Endocrinologist', precautions: 'Low sugar diet, regular exercise, blood sugar monitoring', description: 'Metabolic disease characterized by elevated blood glucose levels.' },
      { name: 'Bronchial Asthma', category: 'Respiratory', severityScore: 0.70, commonSymptoms: 'Wheezing, Breathlessness, Chest Tightness, Night Cough', recommendedSpecialist: 'Pulmonologist', precautions: 'Keep rescue inhaler handy, avoid dust/smoke triggers', description: 'Chronic condition causing airway inflammation and bronchospasm.' },
    ],
  },
  specialists: {
    id: 'specialists',
    icon: '👨‍⚕️',
    title: 'Specialist Management',
    subtitle: 'Manage doctor profiles, clinical specialties, hospital affiliations, and contact information.',
    endpoint: 'specialists',
    singular: 'Specialist',
    listFields: [
      { key: 'name', label: 'Doctor / Specialist Name', primary: true, sortable: true },
      { key: 'specialty', label: 'Specialty', type: 'category', sortable: true },
      { key: 'hospitalName', label: 'Hospital Affiliation', sortable: true },
      { key: 'experience', label: 'Experience', sortable: true },
      { key: 'consultationFee', label: 'Consultation Fee', sortable: true },
      { key: 'contact', label: 'Contact Helpline' },
    ],
    formFields: [
      { name: 'name', label: 'Practitioner Name', type: 'text', required: true, placeholder: 'e.g. Dr. Anita Raman' },
      {
        name: 'specialty',
        label: 'Clinical Specialty',
        type: 'select',
        required: true,
        options: [
          'General Physician',
          'Pulmonologist',
          'Cardiologist',
          'Dermatologist',
          'Neurologist',
          'Endocrinologist',
          'Gastroenterologist',
          'ENT Specialist',
          'Orthopedic Surgeon',
          'Infectious Disease Specialist',
          'Psychiatrist',
          'Urologist'
        ],
      },
      { name: 'hospitalName', label: 'Hospital or Clinic Name', type: 'text', placeholder: 'e.g. Apollo Hospitals, Fortis Healthcare', linkedList: 'hospitals' },
      { name: 'experience', label: 'Years of Experience', type: 'text', placeholder: 'e.g. 15 Years' },
      { name: 'consultationFee', label: 'Standard Consultation Fee', type: 'text', placeholder: 'e.g. ₹600 or $50' },
      { name: 'contact', label: 'Direct Phone / Extension', type: 'text', placeholder: 'e.g. +91 98401 23456' },
    ],
    empty: () => ({
      name: '',
      specialty: 'General Physician',
      hospitalName: '',
      experience: '',
      consultationFee: '',
      contact: '',
    }),
    presets: [
      { name: 'Dr. S. K. Sharma', specialty: 'General Physician', hospitalName: 'Apollo Hospitals', experience: '15 Years', consultationFee: '₹600', contact: '+91 98401 23456' },
      { name: 'Dr. Anita Raman', specialty: 'Pulmonologist', hospitalName: 'Fortis Healthcare', experience: '12 Years', consultationFee: '₹800', contact: '+91 98402 34567' },
      { name: 'Dr. V. Rajesh', specialty: 'Cardiologist', hospitalName: 'Apollo Hospitals', experience: '18 Years', consultationFee: '₹1,000', contact: '+91 98403 45678' },
      { name: 'Dr. Meera Nambiar', specialty: 'Dermatologist', hospitalName: 'Manipal Hospital', experience: '10 Years', consultationFee: '₹700', contact: '+91 98404 56789' },
      { name: 'Dr. K. Narayanan', specialty: 'Neurologist', hospitalName: 'AIIMS New Delhi', experience: '20 Years', consultationFee: '₹1,200', contact: '+91 98405 67890' },
      { name: 'Dr. Priya Sundaram', specialty: 'Endocrinologist', hospitalName: 'PSG Hospitals', experience: '11 Years', consultationFee: '₹750', contact: '+91 98406 78901' },
      { name: 'Dr. Arun Kumar', specialty: 'Gastroenterologist', hospitalName: 'Kauvery Hospital', experience: '14 Years', consultationFee: '₹850', contact: '+91 98407 89012' },
      { name: 'Dr. T. Venkatesh', specialty: 'ENT Specialist', hospitalName: 'Government General Hospital', experience: '16 Years', consultationFee: '₹500', contact: '+91 98408 90123' },
    ],
  },
  tests: {
    id: 'tests',
    icon: '⚗️',
    title: 'Diagnostic Test Management',
    subtitle: 'Configure diagnostic procedures, laboratory tests, turnaround times, and pricing.',
    endpoint: 'tests',
    singular: 'Diagnostic Test',
    listFields: [
      { key: 'name', label: 'Test Name', primary: true, sortable: true },
      { key: 'category', label: 'Category', type: 'category', sortable: true },
      { key: 'turnaroundTime', label: 'Turnaround Time', sortable: true },
      { key: 'approxCost', label: 'Approx Cost (₹)', type: 'currency', sortable: true },
      { key: 'description', label: 'Diagnostic Purpose', truncate: true },
    ],
    formFields: [
      { name: 'name', label: 'Diagnostic Test Name', type: 'text', required: true, placeholder: 'e.g. Complete Blood Count (CBC)' },
      {
        name: 'category',
        label: 'Laboratory / Diagnostic Department',
        type: 'select',
        required: true,
        options: [
          'Hematology',
          'Serology',
          'Biochemistry',
          'Radiology / Imaging',
          'Microbiology',
          'Cardiology',
          'Molecular Diagnostics',
          'Parasitology',
          'Other'
        ],
      },
      { name: 'turnaroundTime', label: 'Report Turnaround Time', type: 'text', placeholder: 'e.g. 2-4 hours, 24 hours' },
      { name: 'approxCost', label: 'Approximate Cost (₹)', type: 'number', step: '1', min: '0', placeholder: 'e.g. 350' },
      { name: 'description', label: 'Test Indications & Clinical Value', type: 'textarea', rows: 3, placeholder: 'Clinical indications and abnormalities detected by this test...' },
    ],
    empty: () => ({
      name: '',
      category: 'Hematology',
      turnaroundTime: '',
      approxCost: '',
      description: '',
    }),
    presets: [
      { name: 'Complete Blood Count (CBC)', category: 'Hematology', turnaroundTime: '2-4 hours', approxCost: 350, description: 'Evaluates overall health and detects infection, anemia, and platelet disorders.' },
      { name: 'NS1 Antigen & Dengue IgM/IgG', category: 'Serology', turnaroundTime: '1-2 hours', approxCost: 850, description: 'Early detection of Dengue virus antigen and acute response antibodies.' },
      { name: 'Varicella PCR Test', category: 'Molecular Diagnostics', turnaroundTime: '24 hours', approxCost: 1800, description: 'Identifies Varicella Zoster virus in suspected Chickenpox cases.' },
      { name: 'Chest X-Ray / CT Thorax', category: 'Radiology / Imaging', turnaroundTime: '30 mins', approxCost: 600, description: 'Radiological imaging for pulmonary consolidation and lung infections.' },
      { name: 'HbA1c Glycated Hemoglobin', category: 'Biochemistry', turnaroundTime: '3 hours', approxCost: 450, description: 'Measures 3-month average plasma glucose concentration.' },
      { name: 'Widal Test & Typhoid Culture', category: 'Microbiology', turnaroundTime: '24-48 hours', approxCost: 400, description: 'Diagnostic serological test for Salmonella enterica antibodies.' },
      { name: 'Malaria Antigen Blood Smear', category: 'Parasitology', turnaroundTime: '1 hour', approxCost: 300, description: 'Microscopic and rapid antigen examination for Plasmodium parasites.' },
      { name: 'ECG & 2D Echocardiogram', category: 'Cardiology', turnaroundTime: '45 mins', approxCost: 1200, description: 'Cardiac electrical rhythm and structural heart assessment.' },
    ],
  },
  hospitals: {
    id: 'hospitals',
    icon: '🏥',
    title: 'Hospital Management',
    subtitle: 'Manage accredited hospitals, medical centers, emergency capabilities, and contact details.',
    endpoint: 'hospitals',
    singular: 'Hospital',
    listFields: [
      { key: 'name', label: 'Hospital Name', primary: true, sortable: true },
      { key: 'city', label: 'City', sortable: true },
      { key: 'type', label: 'Facility Type', type: 'category', sortable: true },
      { key: 'emergencyAvailable', label: '24/7 Emergency', type: 'boolean', sortable: true },
      { key: 'contact', label: 'Emergency Contact' },
      { key: 'address', label: 'Full Address', truncate: true },
    ],
    formFields: [
      { name: 'name', label: 'Hospital / Facility Name', type: 'text', required: true, placeholder: 'e.g. Apollo Hospitals' },
      { name: 'city', label: 'City / Metro Area', type: 'text', required: true, placeholder: 'e.g. Chennai, Bengaluru, Coimbatore' },
      {
        name: 'type',
        label: 'Facility Type',
        type: 'select',
        required: true,
        options: [
          'Super-Speciality',
          'Multi-Speciality',
          'Public / Government',
          'Teaching Multi-Speciality',
          'Apex Medical Institute',
          'Outpatient Clinic'
        ],
      },
      {
        name: 'emergencyAvailable',
        label: '24/7 Emergency & Trauma Center',
        type: 'select',
        required: true,
        options: ['Yes', 'No'],
      },
      { name: 'contact', label: 'Helpline / Emergency Telephone', type: 'text', required: true, placeholder: 'e.g. +91 44 2829 0200' },
      { name: 'address', label: 'Full Street Address', type: 'textarea', rows: 2, required: true, placeholder: 'e.g. Greams Road, Thousand Lights, Chennai - 600006' },
    ],
    empty: () => ({
      name: '',
      city: '',
      type: 'Multi-Speciality',
      emergencyAvailable: 'Yes',
      contact: '',
      address: '',
    }),
    presets: [
      { name: 'Apollo Hospitals', city: 'Chennai', type: 'Super-Speciality', emergencyAvailable: true, contact: '+91 44 2829 0200', address: 'Greams Road, Thousand Lights, Chennai - 600006' },
      { name: 'Fortis Healthcare', city: 'Bengaluru', type: 'Multi-Speciality', emergencyAvailable: true, contact: '+91 80 6621 4444', address: 'Bannerghatta Road, Opposite IIMB, Bengaluru - 560076' },
      { name: 'Government General Hospital', city: 'Chennai', type: 'Public / Government', emergencyAvailable: true, contact: '+91 44 2530 5000', address: 'EVR Periyar Salai, Park Town, Chennai - 600003' },
      { name: 'PSG Hospitals', city: 'Coimbatore', type: 'Teaching Multi-Speciality', emergencyAvailable: true, contact: '+91 422 257 0170', address: 'Peelamedu, Avinashi Road, Coimbatore - 641004' },
      { name: 'AIIMS New Delhi', city: 'New Delhi', type: 'Apex Medical Institute', emergencyAvailable: true, contact: '+91 11 2658 8500', address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029' },
      { name: 'Manipal Hospital', city: 'Bengaluru', type: 'Multi-Speciality', emergencyAvailable: true, contact: '+91 80 2502 4444', address: '98 HAL Airport Road, Kodihalli, Bengaluru - 560017' },
      { name: 'Kauvery Hospital', city: 'Tiruchirappalli', type: 'Multi-Speciality', emergencyAvailable: true, contact: '+91 431 407 7777', address: 'Tennur High Road, Tennur, Tiruchirappalli - 620017' },
      { name: 'City Care Multi-Speciality Clinic', city: 'Coimbatore', type: 'Outpatient Clinic', emergencyAvailable: false, contact: '+91 422 439 1234', address: 'Avinashi Road, Peelamedu, Coimbatore - 641004' },
    ],
  },
  users: {
    id: 'users',
    icon: '👥',
    title: 'User Management',
    subtitle: 'Manage authorized users, system roles, patient accounts, and access permissions.',
    endpoint: 'users',
    singular: 'User Account',
    listFields: [
      { key: 'name', label: 'User Name', primary: true, sortable: true },
      { key: 'email', label: 'Email Address', sortable: true },
      { key: 'role', label: 'Role', type: 'role', sortable: true },
      { key: 'queryCount', label: 'Submitted Queries', sortable: true },
    ],
    formFields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Dr. Ramesh Kumar, Deepa' },
      { name: 'email', label: 'Email Address', type: 'text', required: true, placeholder: 'e.g. user@mediguide.com' },
      {
        name: 'role',
        label: 'System Access Role',
        type: 'select',
        required: true,
        options: ['USER', 'ADMIN'],
      },
      { name: 'password', label: 'Account Password (Set or Reset)', type: 'password', placeholder: 'Default: User@1234' },
    ],
    empty: () => ({
      name: '',
      email: '',
      role: 'USER',
      password: '',
    }),
    presets: [
      { name: 'Dr. Ramesh Kumar', email: 'ramesh.kumar@mediguide.com', role: 'ADMIN', password: 'Admin@1234' },
      { name: 'Nurse Priya V', email: 'priya.nurse@mediguide.com', role: 'USER', password: 'User@1234' },
      { name: 'Patient Demo User', email: 'patient.demo@gmail.com', role: 'USER', password: 'User@1234' },
    ],
  },
};

const AdminManagementPage = ({ token, resource: initialResource = 'symptoms', onBack, onLogout }) => {
  const [resource, setResource] = useState(initialResource);
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Sorting & Pagination States
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Cross-reference data for suggestions
  const [specialistNames, setSpecialistNames] = useState([]);
  const [hospitalNames, setHospitalNames] = useState([]);

  const config = RESOURCE_CONFIG[resource] || RESOURCE_CONFIG.symptoms;

  const showToast = (message) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast('');
    }, 4000);
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        setShowPresetModal(false);
        setViewItem(null);
        setDeleteConfirmItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update resource from props if changed
  useEffect(() => {
    if (initialResource && RESOURCE_CONFIG[initialResource]) {
      setResource(initialResource);
    }
  }, [initialResource]);

  // Load items for active resource
  const loadItems = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const data = await listAdminResources(token, config.endpoint, 0, 100);
      const list = data?.content || (Array.isArray(data) ? data : []);
      setItems(list);
      setCounts((prev) => ({ ...prev, [resource]: list.length }));
    } catch (err) {
      setError(err.message || 'Unable to load records');
    } finally {
      setLoading(false);
    }
  }, [token, config.endpoint, resource]);

  // Pre-load all tab counts and cross-reference suggestions on mount
  useEffect(() => {
    if (!token) return;
    Object.keys(RESOURCE_CONFIG).forEach(async (resKey) => {
      try {
        const ep = RESOURCE_CONFIG[resKey].endpoint;
        const res = await listAdminResources(token, ep, 0, 100);
        const list = res?.content || (Array.isArray(res) ? res : []);
        setCounts((prev) => ({ ...prev, [resKey]: list.length }));

        if (resKey === 'specialists') {
          setSpecialistNames(list.map((s) => s.name || s.specialty).filter(Boolean));
        }
        if (resKey === 'hospitals') {
          setHospitalNames(list.map((h) => h.name).filter(Boolean));
        }
      } catch {
        // silent fallback
      }
    });
  }, [token]);

  // Reset local state when resource changes
  useEffect(() => {
    setError('');
    setSearchQuery('');
    setCategoryFilter('ALL');
    setSeverityFilter('ALL');
    setEditItem(null);
    setViewItem(null);
    setDeleteConfirmItem(null);
    setShowModal(false);
    setShowPresetModal(false);
    setFormData(config.empty());
    setFormErrors({});
    setCurrentPage(1);
    loadItems();
  }, [resource, loadItems, config]);

  // Extract distinct categories
  const availableCategories = useMemo(() => {
    const set = new Set();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).sort();
  }, [items]);

  // Client-side filtering & sorting
  const filteredAndSortedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (severityFilter !== 'ALL' && item.severity !== severityFilter) return false;
      if (!q) return true;

      return Object.values(item).some((val) => {
        if (typeof val === 'string') return val.toLowerCase().includes(q);
        if (typeof val === 'number') return val.toString().includes(q);
        return false;
      });
    });

    return filtered.sort((a, b) => {
      let valA = a[sortField] ?? '';
      let valB = b[sortField] ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [items, searchQuery, categoryFilter, severityFilter, sortField, sortAsc]);

  // Paginated slice
  const paginatedItems = useMemo(() => {
    if (pageSize === 'ALL') return filteredAndSortedItems;
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedItems.slice(start, start + pageSize);
  }, [filteredAndSortedItems, currentPage, pageSize]);

  const totalPages = pageSize === 'ALL' ? 1 : Math.ceil(filteredAndSortedItems.length / pageSize) || 1;

  const handleSort = (fieldKey) => {
    if (sortField === fieldKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(fieldKey);
      setSortAsc(true);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const openCreateModal = () => {
    setEditItem(null);
    setFormData(config.empty());
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    const formVals = { ...item };
    if (resource === 'hospitals' && typeof item.emergencyAvailable === 'boolean') {
      formVals.emergencyAvailable = item.emergencyAvailable ? 'Yes' : 'No';
    }
    setFormData(formVals);
    setFormErrors({});
    setShowModal(true);
  };

  const handleQuickFill = (preset) => {
    const vals = { ...preset };
    if (resource === 'hospitals' && typeof preset.emergencyAvailable === 'boolean') {
      vals.emergencyAvailable = preset.emergencyAvailable ? 'Yes' : 'No';
    }
    setFormData(vals);
    setFormErrors({});
    showToast(`Pre-filled form with preset "${preset.name}"!`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Validations
    const errors = {};
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (resource === 'users' && !editItem && (!formData.email || !formData.email.trim())) {
      errors.email = 'Email address is required for user creation';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const payload = { ...formData };

      // Number coercion
      config.formFields.forEach((field) => {
        if (field.type === 'number') {
          payload[field.name] = payload[field.name] === '' || payload[field.name] == null ? null : Number(payload[field.name]);
        }
      });

      // Hospital boolean emergency coercion
      if (resource === 'hospitals') {
        payload.emergencyAvailable = payload.emergencyAvailable === 'Yes' || payload.emergencyAvailable === true;
      }

      // Password mapping for user
      if (resource === 'users' && payload.password) {
        payload.passwordHash = payload.password;
        delete payload.password;
      }

      if (editItem) {
        const id = editItem.id;
        delete payload.id;
        delete payload.createdAt;
        await updateAdminResource(token, config.endpoint, id, payload);
        showToast(`Successfully updated ${config.singular} "${formData.name}"!`);
      } else {
        await createAdminResource(token, config.endpoint, payload);
        showToast(`Successfully created ${config.singular} "${formData.name}"!`);
      }

      await loadItems();
      setShowModal(false);
      setEditItem(null);
      setFormData(config.empty());
    } catch (err) {
      setError(err.message || 'Unable to save record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;

    setLoading(true);
    setError('');

    try {
      await deleteAdminResource(token, config.endpoint, deleteConfirmItem.id);
      showToast(`Deleted ${config.singular} "${deleteConfirmItem.name || 'record'}"`);
      setDeleteConfirmItem(null);
      await loadItems();
    } catch (err) {
      setError(err.message || 'Unable to delete record');
    } finally {
      setLoading(false);
    }
  };

  // Import single preset directly into DB
  const handleImportSinglePreset = async (preset) => {
    setLoading(true);
    try {
      await createAdminResource(token, config.endpoint, preset);
      showToast(`Imported preset "${preset.name}" into ${config.title}!`);
      await loadItems();
    } catch (err) {
      setError(err.message || 'Failed to import preset');
    } finally {
      setLoading(false);
    }
  };

  // Load all presets in batch
  const handleLoadAllPresets = async () => {
    if (!config.presets || config.presets.length === 0) return;
    if (!window.confirm(`Import ${config.presets.length} clinical presets for ${config.title}? Existing records with the same name will be skipped.`)) {
      return;
    }

    setLoading(true);
    setError('');
    let imported = 0;

    try {
      const existingNames = new Set(items.map((i) => (i.name || '').toLowerCase()));
      for (const preset of config.presets) {
        if (!existingNames.has((preset.name || '').toLowerCase())) {
          try {
            await createAdminResource(token, config.endpoint, preset);
            imported++;
          } catch {
            // continue
          }
        }
      }
      showToast(`Successfully imported ${imported} new clinical presets!`);
      await loadItems();
      setShowPresetModal(false);
    } catch (err) {
      setError(err.message || 'Error populating presets');
    } finally {
      setLoading(false);
    }
  };

  // Export Table Data to CSV
  const handleExportCSV = () => {
    if (filteredAndSortedItems.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = config.listFields.map((f) => f.label);
    const keys = config.listFields.map((f) => f.key);

    const rows = filteredAndSortedItems.map((item) =>
      keys.map((k) => {
        let val = item[k];
        if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
        if (val == null) val = '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mediguide_${config.endpoint}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredAndSortedItems.length} records to CSV!`);
  };

  // Export Table Data to JSON
  const handleExportJSON = () => {
    if (filteredAndSortedItems.length === 0) {
      alert('No records available to export.');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredAndSortedItems, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `mediguide_${config.endpoint}_export.json`);
    dlAnchorElem.click();
    showToast(`Exported ${filteredAndSortedItems.length} records to JSON!`);
  };

  // Severity pill color mapping
  const renderSeverityBadge = (val) => {
    if (!val) return <span className="admin-badge admin-badge--neutral">-</span>;
    const str = String(val).toLowerCase();
    if (str.includes('severe') || str === 'high') {
      return <span className="admin-badge admin-badge--danger">🔴 {val}</span>;
    }
    if (str.includes('moderate') || str === 'medium') {
      return <span className="admin-badge admin-badge--warning">🟡 {val}</span>;
    }
    return <span className="admin-badge admin-badge--success">🟢 {val}</span>;
  };

  // Synonyms pill render
  const renderSynonyms = (synonyms) => {
    if (!synonyms) return <span className="admin-muted-text">None</span>;
    const tags = synonyms.split(',').map((s) => s.trim()).filter(Boolean);
    const displayTags = tags.slice(0, 3);
    const remaining = tags.length - 3;
    return (
      <div className="admin-synonyms-wrapper">
        {displayTags.map((tag, idx) => (
          <span key={idx} className="admin-synonym-tag">{tag}</span>
        ))}
        {remaining > 0 && <span className="admin-synonym-more">+{remaining} more</span>}
      </div>
    );
  };

  // Score badge
  const renderScore = (score) => {
    if (score == null) return '-';
    const num = Number(score);
    const pct = Math.round(num * 100);
    const color = pct > 75 ? '#ef4444' : pct > 45 ? '#f59e0b' : '#10b981';
    return (
      <div className="admin-score-chip" style={{ borderColor: color }} title={`Severity index: ${score}`}>
        <span className="admin-score-val" style={{ color }}>{score}</span>
        <div className="admin-score-bar-bg">
          <div className="admin-score-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    );
  };

  return (
    <div className="admin-management-shell">
      {/* Toast Feedback */}
      {successToast && (
        <div className="admin-toast-banner" role="status" aria-live="polite">
          <span className="toast-sparkle">✨</span>
          <p>{successToast}</p>
          <button type="button" onClick={() => setSuccessToast('')} aria-label="Dismiss toast">×</button>
        </div>
      )}

      {/* Main Top Header */}
      <header className="admin-management-header">
        <div className="admin-header-title-box">
          <button type="button" className="admin-back-button" onClick={onBack} title="Return to Administrator Dashboard">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Dashboard</span>
          </button>
          <div className="admin-header-main-titles">
            <span className="admin-header-icon">{config.icon}</span>
            <div>
              <h1>{config.title}</h1>
              <p>{config.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="admin-header-actions">
          {config.presets && config.presets.length > 0 && (
            <button
              type="button"
              className="admin-presets-action-btn"
              onClick={() => setShowPresetModal(true)}
              title="Explore standard clinical presets for quick import"
            >
              <span>✨</span> Clinical Presets
            </button>
          )}

          <button type="button" className="admin-primary-create-btn" onClick={openCreateModal} title={`Add a new ${config.singular}`}>
            <span>+</span> Add {config.singular}
          </button>

          <button type="button" className="admin-logout-button" onClick={onLogout} title="Sign Out of Admin Console">
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs with Live Counts */}
      <section className="admin-management-tabs" aria-label="Entity Navigation Tabs">
        {Object.entries(RESOURCE_CONFIG).map(([key, item]) => {
          const tabCount = counts[key] ?? (key === resource ? items.length : '…');
          return (
            <button
              key={key}
              type="button"
              className={`admin-management-tab ${key === resource ? 'admin-management-tab--active' : ''}`}
              onClick={() => setResource(key)}
            >
              <span className="admin-tab-icon">{item.icon}</span>
              <span className="admin-tab-title">{item.title.replace(' Management', '')}</span>
              <span className={`admin-tab-count-badge ${key === resource ? 'admin-tab-count-badge--active' : ''}`}>
                {tabCount}
              </span>
            </button>
          );
        })}
      </section>

      {/* Summary KPI Strip */}
      <section className="admin-kpi-strip">
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Total Records</p>
          <h3 className="admin-kpi-value">{items.length}</h3>
          <span className="admin-kpi-sub">In database</span>
        </div>
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Filtered Matches</p>
          <h3 className="admin-kpi-value">{filteredAndSortedItems.length}</h3>
          <span className="admin-kpi-sub">{searchQuery ? 'Matching search' : 'All viewable'}</span>
        </div>
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Active Entity</p>
          <h3 className="admin-kpi-value admin-kpi-value--active">{config.singular}</h3>
          <span className="admin-kpi-sub">Endpoint: /api/admin/{config.endpoint}</span>
        </div>
        {availableCategories.length > 0 && (
          <div className="admin-kpi-card">
            <p className="admin-kpi-label">Categories Configured</p>
            <h3 className="admin-kpi-value">{availableCategories.length}</h3>
            <span className="admin-kpi-sub">Clinical groupings</span>
          </div>
        )}
      </section>

      {/* Control Bar: Search & Filters & Export Toolbar */}
      <section className="admin-controls-card">
        <div className="admin-search-wrapper">
          <svg className="admin-search-icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className="admin-search-input"
            placeholder={`Search ${config.title.toLowerCase()} by name, category, symptoms, keywords...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchQuery && (
            <button
              type="button"
              className="admin-clear-search-btn"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="admin-filter-group">
          {availableCategories.length > 0 && (
            <select
              className="admin-filter-select"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by category"
            >
              <option value="ALL">All Categories ({items.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {resource === 'symptoms' && (
            <select
              className="admin-filter-select"
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by severity"
            >
              <option value="ALL">All Severities</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
          )}

          {/* Export Dropdown Group */}
          <div className="admin-export-btn-group">
            <button
              type="button"
              className="admin-utility-btn"
              onClick={handleExportCSV}
              title="Export visible table data as CSV file"
            >
              📥 CSV
            </button>
            <button
              type="button"
              className="admin-utility-btn"
              onClick={handleExportJSON}
              title="Export visible table data as JSON file"
            >
              📥 JSON
            </button>
          </div>

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={loadItems}
            title="Reload records from database"
          >
            ↻ Reload
          </button>
        </div>
      </section>

      {/* Global Error Banner */}
      {error && (
        <div className="admin-error-banner" role="alert">
          <span>⚠️</span>
          <p>{error}</p>
          <button type="button" onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Main Table Content */}
      <main className="admin-table-container">
        {loading && (
          <div className="admin-loading-indicator">
            <div className="admin-spinner" />
            <span>Loading {config.title} from MongoDB Atlas...</span>
          </div>
        )}

        {!loading && filteredAndSortedItems.length === 0 && (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">{config.icon}</div>
            <h3>No {config.title} Found</h3>
            <p>
              {searchQuery || categoryFilter !== 'ALL' || severityFilter !== 'ALL'
                ? 'No records match your active search and filter criteria.'
                : `There are currently no ${config.singular.toLowerCase()} records in the database.`}
            </p>
            <div className="admin-empty-actions">
              {searchQuery || categoryFilter !== 'ALL' || severityFilter !== 'ALL' ? (
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('ALL');
                    setSeverityFilter('ALL');
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </button>
              ) : (
                <>
                  <button type="button" className="admin-primary-create-btn" onClick={openCreateModal}>
                    + Create First {config.singular}
                  </button>
                  {config.presets && config.presets.length > 0 && (
                    <button type="button" className="admin-preset-btn" onClick={handleLoadAllPresets}>
                      ✨ Load Recommended Presets
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {filteredAndSortedItems.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '44px' }}>#</th>
                  {config.listFields.map((field) => (
                    <th
                      key={field.key}
                      onClick={() => field.sortable && handleSort(field.key)}
                      style={{ cursor: field.sortable ? 'pointer' : 'default', userSelect: 'none' }}
                      title={field.sortable ? `Click to sort by ${field.label}` : ''}
                    >
                      <div className="admin-th-content">
                        <span>{field.label}</span>
                        {field.sortable && sortField === field.key && (
                          <span className="admin-sort-caret">{sortAsc ? ' ▲' : ' ▼'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th style={{ textAlign: 'right', minWidth: '170px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item, index) => {
                  const globalIdx = pageSize === 'ALL' ? index + 1 : (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={item.id || index}
                      className="admin-table-row"
                      onDoubleClick={() => setViewItem(item)}
                      title="Double-click to view complete details"
                    >
                      <td className="admin-row-index">{globalIdx}</td>
                      {config.listFields.map((field) => {
                        const val = item[field.key];
                        if (field.primary) {
                          return (
                            <td key={field.key} className="admin-cell-primary">
                              <strong>{val || 'Unnamed'}</strong>
                            </td>
                          );
                        }
                        if (field.type === 'category') {
                          return (
                            <td key={field.key}>
                              {val ? <span className="admin-category-pill">{val}</span> : <span className="admin-muted-text">-</span>}
                            </td>
                          );
                        }
                        if (field.type === 'severity') {
                          return (
                            <td key={field.key}>
                              {renderSeverityBadge(val)}
                            </td>
                          );
                        }
                        if (field.type === 'score') {
                          return (
                            <td key={field.key}>
                              {renderScore(val)}
                            </td>
                          );
                        }
                        if (field.type === 'synonyms') {
                          return (
                            <td key={field.key}>
                              {renderSynonyms(val)}
                            </td>
                          );
                        }
                        if (field.type === 'boolean') {
                          return (
                            <td key={field.key}>
                              {val ? (
                                <span className="admin-badge admin-badge--success">✓ Yes</span>
                              ) : (
                                <span className="admin-badge admin-badge--neutral">No</span>
                              )}
                            </td>
                          );
                        }
                        if (field.type === 'role') {
                          return (
                            <td key={field.key}>
                              <span className={`admin-role-badge admin-role-badge--${String(val).toLowerCase()}`}>
                                {val || 'USER'}
                              </span>
                            </td>
                          );
                        }
                        if (field.type === 'currency') {
                          return (
                            <td key={field.key} className="admin-cost-cell">
                              {val ? `₹${val}` : '-'}
                            </td>
                          );
                        }
                        return (
                          <td key={field.key} className={field.truncate ? 'admin-cell-truncate' : ''} title={typeof val === 'string' ? val : ''}>
                            {val != null && val !== '' ? String(val) : <span className="admin-muted-text">-</span>}
                          </td>
                        );
                      })}
                      <td className="admin-cell-actions">
                        <button
                          type="button"
                          className="admin-action-btn admin-view-btn"
                          onClick={() => setViewItem(item)}
                          title="View Complete Details"
                        >
                          👁️ View
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn admin-edit-btn"
                          onClick={() => openEditModal(item)}
                          title="Edit Record"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn admin-del-btn"
                          onClick={() => setDeleteConfirmItem(item)}
                          title="Delete Record"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination & Status Footer */}
            <div className="admin-table-footer">
              <div className="admin-footer-info">
                <span>
                  Showing{' '}
                  <strong>
                    {pageSize === 'ALL'
                      ? filteredAndSortedItems.length
                      : Math.min((currentPage - 1) * pageSize + 1, filteredAndSortedItems.length)}
                  </strong>{' '}
                  to{' '}
                  <strong>
                    {pageSize === 'ALL'
                      ? filteredAndSortedItems.length
                      : Math.min(currentPage * pageSize, filteredAndSortedItems.length)}
                  </strong>{' '}
                  of <strong>{filteredAndSortedItems.length}</strong> entries
                </span>

                <div className="admin-page-size-selector">
                  <label htmlFor="admin-page-size">Per page:</label>
                  <select
                    id="admin-page-size"
                    value={pageSize}
                    onChange={(e) => {
                      const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                      setPageSize(val);
                      setCurrentPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value="ALL">All</option>
                  </select>
                </div>
              </div>

              {pageSize !== 'ALL' && totalPages > 1 && (
                <div className="admin-pagination-nav">
                  <button
                    type="button"
                    className="admin-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                    // Show first, last, and pages around current
                    if (pg === 1 || pg === totalPages || (pg >= currentPage - 1 && pg <= currentPage + 1)) {
                      return (
                        <button
                          key={pg}
                          type="button"
                          className={`admin-page-btn ${currentPage === pg ? 'admin-page-btn--active' : ''}`}
                          onClick={() => setCurrentPage(pg)}
                        >
                          {pg}
                        </button>
                      );
                    }
                    if (pg === currentPage - 2 || pg === currentPage + 2) {
                      return <span key={pg} className="admin-page-ellipsis">…</span>;
                    }
                    return null;
                  })}

                  <button
                    type="button"
                    className="admin-page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="admin-modal-title-group">
                <span className="admin-modal-icon">{config.icon}</span>
                <div>
                  <h2>{editItem ? `Edit ${config.singular}` : `Create New ${config.singular}`}</h2>
                  <p>{editItem ? `Update ${config.singular} attributes in MongoDB database` : 'Fill in the information below or select a clinical preset to pre-fill'}</p>
                </div>
              </div>
              <button type="button" className="admin-modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            {/* Quick-Fill Presets Dropdown for Create Mode */}
            {!editItem && config.presets && config.presets.length > 0 && (
              <div className="admin-quick-preset-banner">
                <div className="admin-quick-preset-title">
                  <span>⚡</span>
                  <strong>Quick-Fill from Preset:</strong>
                </div>
                <select
                  className="admin-preset-dropdown-picker"
                  onChange={(e) => {
                    const preset = config.presets.find((p) => p.name === e.target.value);
                    if (preset) handleQuickFill(preset);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>-- Select a standard clinical preset --</option>
                  {config.presets.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.category || p.specialty || p.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form className="admin-modal-form" onSubmit={handleSubmit}>
              <div className="admin-modal-fields-grid">
                {config.formFields.map((field) => (
                  <label
                    key={field.name}
                    className={`admin-form-group ${field.type === 'textarea' ? 'admin-form-group--full' : ''}`}
                  >
                    <span className="admin-form-label">
                      {field.label} {field.required && <strong className="admin-req-star">*</strong>}
                    </span>
                    {field.hint && <small className="admin-form-hint">{field.hint}</small>}

                    {/* Quick suggestion tags for bodyLocation */}
                    {field.suggestions && (
                      <div className="admin-field-suggestions">
                        <span className="suggestion-label">Quick select:</span>
                        {field.suggestions.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            className="admin-suggestion-chip"
                            onClick={() => handleInputChange(field.name, sug)}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quick score pills for disease severity */}
                    {field.scorePresets && (
                      <div className="admin-field-suggestions">
                        <span className="suggestion-label">Quick score:</span>
                        {field.scorePresets.map((sp) => (
                          <button
                            key={sp.label}
                            type="button"
                            className="admin-suggestion-chip"
                            onClick={() => handleInputChange(field.name, sp.value)}
                          >
                            {sp.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {field.type === 'select' ? (
                      <select
                        className="admin-form-control"
                        value={formData[field.name] ?? ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                      >
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        className="admin-form-control admin-form-textarea"
                        rows={field.rows || 3}
                        placeholder={field.placeholder || ''}
                        value={formData[field.name] ?? ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                      />
                    ) : (
                      <>
                        <input
                          type={field.type}
                          step={field.step}
                          min={field.min}
                          max={field.max}
                          list={field.linkedList ? `list-${field.name}` : undefined}
                          className={`admin-form-control ${formErrors[field.name] ? 'admin-form-control--error' : ''}`}
                          placeholder={field.placeholder || ''}
                          value={formData[field.name] ?? ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required}
                        />
                        {/* Dynamic datalist for linked resources */}
                        {field.linkedList === 'specialists' && (
                          <datalist id={`list-${field.name}`}>
                            {specialistNames.map((n, i) => (
                              <option key={i} value={n} />
                            ))}
                          </datalist>
                        )}
                        {field.linkedList === 'hospitals' && (
                          <datalist id={`list-${field.name}`}>
                            {hospitalNames.map((n, i) => (
                              <option key={i} value={n} />
                            ))}
                          </datalist>
                        )}
                      </>
                    )}

                    {formErrors[field.name] && (
                      <span className="admin-field-error-msg">{formErrors[field.name]}</span>
                    )}
                  </label>
                ))}
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-primary-create-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editItem ? 'Save Changes' : `Create ${config.singular}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewItem && (
        <div className="admin-modal-overlay" onClick={() => setViewItem(null)}>
          <div className="admin-modal-card admin-modal-card--detail" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="admin-modal-title-group">
                <span className="admin-modal-icon">{config.icon}</span>
                <div>
                  <h2>{viewItem.name || 'Record Details'}</h2>
                  <p>{config.singular} Detailed Clinical Profile</p>
                </div>
              </div>
              <button type="button" className="admin-modal-close-btn" onClick={() => setViewItem(null)}>×</button>
            </div>

            <div className="admin-detail-grid">
              {Object.entries(viewItem)
                .filter(([k]) => k !== 'id' && k !== 'passwordHash')
                .map(([key, val]) => (
                  <div key={key} className="admin-detail-item">
                    <span className="admin-detail-label">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </span>
                    <div className="admin-detail-value">
                      {key === 'severity' ? (
                        renderSeverityBadge(val)
                      ) : key === 'severityScore' ? (
                        renderScore(val)
                      ) : key === 'synonyms' ? (
                        <div className="admin-synonyms-tags-full">
                          {String(val || '').split(',').map((s, i) => (
                            <span key={i} className="admin-synonym-tag">{s.trim()}</span>
                          ))}
                        </div>
                      ) : key === 'emergencyAvailable' ? (
                        val ? <span className="admin-badge admin-badge--success">Yes (24/7 Service Available)</span> : 'No'
                      ) : val ? (
                        String(val)
                      ) : (
                        <span className="admin-muted-text">None</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-action-btn admin-edit-btn"
                onClick={() => {
                  const it = viewItem;
                  setViewItem(null);
                  openEditModal(it);
                }}
              >
                ✏️ Edit This Record
              </button>
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={() => setViewItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRESETS PREVIEW MODAL */}
      {showPresetModal && (
        <div className="admin-modal-overlay" onClick={() => setShowPresetModal(false)}>
          <div className="admin-modal-card admin-modal-card--presets" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="admin-modal-title-group">
                <span className="admin-modal-icon">✨</span>
                <div>
                  <h2>Clinical Presets for {config.title}</h2>
                  <p>Standard curated clinical entities verified by medical ontologies</p>
                </div>
              </div>
              <button type="button" className="admin-modal-close-btn" onClick={() => setShowPresetModal(false)}>×</button>
            </div>

            <div className="admin-presets-list">
              {config.presets.map((preset, idx) => {
                const alreadyExists = items.some((it) => (it.name || '').toLowerCase() === (preset.name || '').toLowerCase());
                return (
                  <div key={idx} className="admin-preset-row">
                    <div className="admin-preset-info">
                      <strong>{preset.name}</strong>
                      <span className="admin-preset-tag">{preset.category || preset.specialty || preset.type}</span>
                      <p className="admin-preset-desc">{preset.description || preset.address || preset.experience || ''}</p>
                    </div>
                    <div className="admin-preset-action">
                      {alreadyExists ? (
                        <span className="admin-badge admin-badge--success">✓ In Database</span>
                      ) : (
                        <button
                          type="button"
                          className="admin-import-chip-btn"
                          onClick={() => handleImportSinglePreset(preset)}
                          disabled={loading}
                        >
                          + Import
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="admin-modal-footer admin-modal-footer--between">
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={() => setShowPresetModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="admin-primary-create-btn"
                onClick={handleLoadAllPresets}
                disabled={loading}
              >
                ✨ Import All Missing Presets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmItem && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirmItem(null)}>
          <div className="admin-modal-card admin-modal-card--danger" onClick={(e) => e.stopPropagation()}>
            <div className="admin-danger-icon-wrapper">🗑️</div>
            <h3>Delete {config.singular}?</h3>
            <p>
              Are you sure you want to permanently delete <strong>"{deleteConfirmItem.name || 'this record'}"</strong>?
              This action cannot be undone and will remove it from the database repository.
            </p>
            <div className="admin-modal-footer admin-modal-footer--center">
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={() => setDeleteConfirmItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-danger-confirm-btn"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Yes, Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagementPage;
