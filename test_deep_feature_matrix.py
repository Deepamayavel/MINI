import sys
import json
import urllib.request
import urllib.error
import time

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

BASE_URL = "http://localhost:8080"
NLP_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:5173"

def req(url, method="GET", headers=None, data=None):
    hdrs = {}
    if headers:
        hdrs.update(headers)
    payload = None
    if data is not None:
        if isinstance(data, (bytes, bytearray)):
            payload = data
        else:
            payload = json.dumps(data).encode("utf-8")
        if "Content-Type" not in hdrs:
            hdrs["Content-Type"] = "application/json"
    
    req_obj = urllib.request.Request(url, data=payload, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req_obj, timeout=12) as resp:
            content = resp.read().decode("utf-8")
            try:
                body = json.loads(content)
            except Exception:
                body = content
            return resp.status, body
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            body = json.loads(content)
        except Exception:
            body = content
        return e.code, body
    except Exception as e:
        return 0, str(e)

print("=" * 80)
print("     MEDIGUIDE AI — DEEP FULL-STACK FEATURE CAPABILITY MATRIX AUDIT     ")
print("=" * 80)

passed_count = 0
total_count = 0

def test_feature(section, feature_name, condition, details=""):
    global passed_count, total_count
    total_count += 1
    status_tag = "[PASS]" if condition else "[FAIL]"
    if condition:
        passed_count += 1
    print(f"{status_tag} [{section}] {feature_name}: {details}")
    return condition

# ── 1. INFRASTRUCTURE & MICROSERVICES ──────────────────────────────────────────
print("\n>>> Section 1: System Infrastructure & Microservice Connectivity")
s, b = req(f"{FRONTEND_URL}")
test_feature("INFRA", "Vite Frontend React App Listening", s == 200 and 'id="root"' in b, f"HTTP {s}")

s, b = req(f"{NLP_URL}/docs")
test_feature("INFRA", "Python FastAPI NLP Engine Listening", s == 200, f"HTTP {s}")

s, b = req(f"{BASE_URL}/api/health")
test_feature("INFRA", "Spring Boot Backend Health Endpoint", s == 200 and b.get("status") == "UP", f"Status: {b.get('status')}")

# ── 2. AI & NLP CLINICAL INTELLIGENCE ──────────────────────────────────────────
print("\n>>> Section 2: AI & NLP Clinical Intelligence Engine")
s, b = req(f"{NLP_URL}/extract-symptoms", method="POST", data={"text": "Patient has severe headache, high fever and stiff neck with nausea"})
syms = b.get("symptoms", []) if isinstance(b, dict) else []
test_feature("NLP", "Multi-Symptom Entity Extraction", s == 200 and len(syms) >= 2, f"Extracted symptoms: {syms}")

s, b = req(f"{NLP_URL}/predict", method="POST", data={"symptoms": ["chest pain", "shortness of breath", "sweating", "arm pain"]})
test_feature("NLP", "Disease Prediction (Heart Attack)", s == 200 and b.get("predictedDisease") == "Heart Attack", f"Predicted: {b.get('predictedDisease')}, Conf: {b.get('confidenceScore')}")

s, b = req(f"{NLP_URL}/predict", method="POST", data={"symptoms": ["burning urination", "frequent urination", "pelvic pain"]})
test_feature("NLP", "Disease Prediction (Urinary Tract Infection)", s == 200 and "Urinary" in str(b.get("predictedDisease")), f"Predicted: {b.get('predictedDisease')}")

# ── 3. PATIENT AUTHENTICATION & ACCESS CONTROL ─────────────────────────────────
print("\n>>> Section 3: Patient Authentication, Security & RBAC")
unique_suffix = int(time.time())
patient_email = f"deep_audit_{unique_suffix}@mediguide.test"
patient_pass = "SecurePass#2026"

# Registration
s, b = req(f"{BASE_URL}/api/auth/register", method="POST", data={"name": "Dr. Sarah Connor", "email": patient_email, "password": patient_pass})
test_feature("AUTH", "Patient Registration", s in (200, 201), f"User: {patient_email}")

# Re-registering duplicate email should fail gracefully
s, b = req(f"{BASE_URL}/api/auth/register", method="POST", data={"name": "Duplicate User", "email": patient_email, "password": patient_pass})
test_feature("AUTH", "Duplicate Email Protection", s in (400, 409), f"Status: {s}")

# Login invalid password should be rejected
s, b = req(f"{BASE_URL}/api/auth/login", method="POST", data={"email": patient_email, "password": "WrongPassword"})
test_feature("AUTH", "Reject Incorrect Password", s in (400, 401), f"Status: {s}")

# Login valid credentials
s, b = req(f"{BASE_URL}/api/auth/login", method="POST", data={"email": patient_email, "password": patient_pass})
patient_token = b.get("token") if isinstance(b, dict) else None
test_feature("AUTH", "Patient Authentication & JWT Issue", s == 200 and patient_token is not None, f"Token length: {len(patient_token) if patient_token else 0}")

patient_headers = {"Authorization": f"Bearer {patient_token}"} if patient_token else {}

# RBAC: Patient should NOT have access to Admin routes
s, b = req(f"{BASE_URL}/api/admin/analytics", headers=patient_headers)
test_feature("AUTH", "RBAC: Patient Denied Admin Access", s in (401, 403), f"Status: {s}")

# ── 4. CLINICAL SEARCH & DECISION SUPPORT ──────────────────────────────────────
print("\n>>> Section 4: Clinical Symptom Search & Decision Support")
s, b = req(f"{BASE_URL}/api/search", method="POST", headers=patient_headers, data={
    "symptomText": "I have severe joint pain, high fever, and rashes behind eyes",
    "inputType": "TEXT"
})
test_feature("SEARCH", "Text Clinical Search -> Dengue Fever", s == 200 and b.get("predictedDisease") == "Dengue Fever", f"Predicted: {b.get('predictedDisease')}")
test_feature("SEARCH", "Specialist Doctor Recommendation", s == 200 and b.get("recommendedSpecialist") is not None, f"Specialist: {b.get('recommendedSpecialist')}")
test_feature("SEARCH", "Diagnostic Tests Recommendations", s == 200 and len(b.get("recommendedTests", [])) > 0, f"Tests Count: {len(b.get('recommendedTests', []))}")
test_feature("SEARCH", "Hospital Facility Recommendations", s == 200 and len(b.get("recommendedHospitals", [])) > 0, f"Hospitals Count: {len(b.get('recommendedHospitals', []))}")
test_feature("SEARCH", "Top-3 Differential Predictions Matrix", s == 200 and len(b.get("topPredictions", [])) >= 3, f"Top Predictions: {[p.get('disease') for p in b.get('topPredictions', [])]}")

# Multilingual Tamil Voice Search
s, b = req(f"{BASE_URL}/api/search", method="POST", headers=patient_headers, data={
    "symptomText": "எனக்கு கடுமையான நெஞ்சு வலி மற்றும் மூச்சுத் திணறல் உள்ளது",
    "inputType": "VOICE"
})
test_feature("SEARCH", "Multilingual Tamil Voice Search -> Heart Attack", s == 200 and b.get("predictedDisease") == "Heart Attack", f"Predicted: {b.get('predictedDisease')}, Conf: {b.get('confidenceScore')}")

# Guest Search (No Auth)
s, b = req(f"{BASE_URL}/api/search", method="POST", data={
    "symptomText": "runny nose, sneezing, mild fever",
    "inputType": "TEXT"
})
test_feature("SEARCH", "Guest Anonymous Search Access", s == 200 and b.get("predictedDisease") == "Common Cold", f"Guest Predicted: {b.get('predictedDisease')}")

# ── 5. PATIENT DASHBOARD, HISTORY & RECOMMENDATIONS ─────────────────────────────
print("\n>>> Section 5: Patient Dashboard, History & Recommendations Store")
s, b = req(f"{BASE_URL}/api/dashboard/summary", headers=patient_headers)
test_feature("PATIENT", "Patient Dashboard Telemetry", s == 200 and b.get("totalSearches") >= 2, f"Total Searches: {b.get('totalSearches')}")

s, b = req(f"{BASE_URL}/api/history?page=0&size=10", headers=patient_headers)
history_records = b.get("content", []) if isinstance(b, dict) else []
test_feature("PATIENT", "Patient Search History Pagination", s == 200 and len(history_records) >= 2, f"History Items: {len(history_records)}")

query_id = history_records[0].get("id") if len(history_records) > 0 else None
if query_id:
    s, b_detail = req(f"{BASE_URL}/api/history/{query_id}", headers=patient_headers)
    test_feature("PATIENT", "Query Detail Inspection by ID", s == 200 and b_detail.get("id") == query_id, f"Query ID: {query_id}")

s, b = req(f"{BASE_URL}/api/recommendations/latest", headers=patient_headers)
test_feature("PATIENT", "Latest Clinical Recommendation Retrieval", s == 200 and b.get("predictedDisease") is not None, f"Latest Disease: {b.get('predictedDisease')}")

s, b = req(f"{BASE_URL}/api/recommendations?page=0&size=10", headers=patient_headers)
rec_records = b.get("content", []) if isinstance(b, dict) else []
test_feature("PATIENT", "Recommendations Catalog Pagination", s == 200 and len(rec_records) >= 2, f"Rec Items: {len(rec_records)}")

# ── 6. ADMIN OPERATIONS & CLINICAL PATHWAY BUNDLES ─────────────────────────────
print("\n>>> Section 6: Admin Operations, Clinical Pathway Bundles & Auditing")
s, b = req(f"{BASE_URL}/api/auth/admin-login", method="POST", data={"email": "admin@mediguide.com", "password": "Admin@1234"})
admin_token = b.get("token") if isinstance(b, dict) else None
test_feature("ADMIN", "Admin Secure Login & Token Issue", s == 200 and admin_token is not None, f"Admin: {b.get('name')}")

admin_headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}

s, b = req(f"{BASE_URL}/api/admin/analytics", headers=admin_headers)
test_feature("ADMIN", "Admin Platform Analytics & KPIs", s == 200 and "totalUsers" in b, f"Users: {b.get('totalUsers')}, Queries: {b.get('totalQueries')}")

s, b = req(f"{BASE_URL}/api/admin/users?page=0&size=10", headers=admin_headers)
users_list = b.get("content", []) if isinstance(b, dict) else []
test_feature("ADMIN", "Admin User Management Directory", s == 200 and len(users_list) > 0, f"Registered Users: {b.get('totalElements', len(users_list))}")

s, b = req(f"{BASE_URL}/api/admin/diseases?page=0&size=10", headers=admin_headers)
diseases_list = b.get("content", []) if isinstance(b, dict) else []
test_feature("ADMIN", "Admin Disease Knowledge Base", s == 200 and len(diseases_list) > 0, f"Diseases Count: {b.get('totalElements', len(diseases_list))}")

s, b = req(f"{BASE_URL}/api/admin/specialists?page=0&size=10", headers=admin_headers)
specialists_list = b.get("content", []) if isinstance(b, dict) else []
test_feature("ADMIN", "Admin Specialist Doctors Directory", s == 200 and len(specialists_list) > 0, f"Specialists Count: {b.get('totalElements', len(specialists_list))}")

s, b = req(f"{BASE_URL}/api/admin/hospitals?page=0&size=10", headers=admin_headers)
hospitals_list = b.get("content", []) if isinstance(b, dict) else []
test_feature("ADMIN", "Admin Hospital Facilities Directory", s == 200 and len(hospitals_list) > 0, f"Hospitals Count: {b.get('totalElements', len(hospitals_list))}")

s, b = req(f"{BASE_URL}/api/admin/tests?page=0&size=10", headers=admin_headers)
tests_list = b.get("content", []) if isinstance(b, dict) else []
test_feature("ADMIN", "Admin Diagnostic Tests Catalog", s == 200 and len(tests_list) > 0, f"Diagnostic Tests Count: {b.get('totalElements', len(tests_list))}")

s, b = req(f"{BASE_URL}/api/admin/symptoms?page=0&size=10", headers=admin_headers)
symptoms_list = b.get("content", []) if isinstance(b, dict) else []
test_feature("ADMIN", "Admin Medical Symptoms Registry", s == 200 and len(symptoms_list) > 0, f"Symptoms Count: {b.get('totalElements', len(symptoms_list))}")

s, b = req(f"{BASE_URL}/api/admin/queries?page=0&size=10", headers=admin_headers)
audit_queries = b.get("content", []) if isinstance(b, dict) else []
test_feature("ADMIN", "Admin User Queries Real-Time Audit Log", s == 200 and len(audit_queries) > 0, f"Audit Log Entries: {b.get('totalElements', len(audit_queries))}")

# Clinical Pathway Bundle Creation
bundle_payload = {
    "diseaseName": f"Viral Bronchitis Variant {unique_suffix % 1000}",
    "category": "Respiratory Medicine",
    "severityScore": 3.8,
    "description": "Acute inflammation of the bronchial tubes with cough and wheezing",
    "precautions": "Hydration, steam inhalation, rest, avoidance of smoke",
    "symptoms": ["wheezing", "cough", "chest congestion", "mild fever"],
    "specialistName": f"Dr. Rajesh Kumar {unique_suffix % 1000}",
    "specialty": "Pulmonology",
    "experience": "14+ Years",
    "consultationFee": "₹750",
    "specialistContact": "+91 94441 23456",
    "testName": f"Pulmonary Function Test {unique_suffix % 1000}",
    "testCategory": "Respiratory Diagnostics",
    "approxCost": 1200.0,
    "hospitalName": "Apollo Specialty Hospitals",
    "hospitalCity": "Chennai",
    "hospitalState": "Tamil Nadu",
    "emergencyAvailable": True
}
s, b = req(f"{BASE_URL}/api/admin/bundle", method="POST", headers=admin_headers, data=bundle_payload)
test_feature("ADMIN", "Clinical Pathway Bundle Atomic Creation", s == 200 and "successfully" in str(b.get("message", "")).lower(), f"Message: {b.get('message')}")

# ── 7. LOGOUT & TOKEN INVALIDATION ─────────────────────────────────────────────
print("\n>>> Section 7: Session Lifecycle & Token Revocation")
s, b = req(f"{BASE_URL}/api/auth/logout", method="POST", headers=patient_headers)
test_feature("AUTH", "Patient Logout & Token Blacklist", s == 200, f"Status: {s}, Message: {b.get('message') if isinstance(b, dict) else b}")

print("\n" + "=" * 80)
print(f"FEATURE AUDIT RESULT: {passed_count}/{total_count} CHECKS PASSED ({round(passed_count/total_count * 100, 1)}%)")
print("=" * 80)

if passed_count == total_count:
    sys.exit(0)
else:
    sys.exit(1)
