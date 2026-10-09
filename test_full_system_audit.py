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
    if data is not None and not isinstance(data, (bytes, bytearray)):
        data = json.dumps(data).encode("utf-8")
        hdrs["Content-Type"] = "application/json"
    
    req_obj = urllib.request.Request(url, data=data, headers=hdrs, method=method)
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

print("=" * 70)
print("       MEDIGUIDE AI — COMPREHENSIVE FULL-STACK SYSTEM AUDIT       ")
print("=" * 70)

checks_passed = 0
checks_total = 0

def check(name, condition, details=""):
    global checks_passed, checks_total
    checks_total += 1
    if condition:
        checks_passed += 1
        print(f"  [PASS] {name} {details}")
        return True
    else:
        print(f"  [FAIL] {name} {details}")
        return False

# 1. FRONTEND SERVER
print("\n--- 1. Frontend Server (Vite Port 5173) ---")
s, b = req(FRONTEND_URL)
check("Frontend HTTP 200 OK", s == 200, f"(Status: {s})")
check("Frontend HTML payload contains root", isinstance(b, str) and 'id="root"' in b)

# 2. PYTHON NLP SERVICE
print("\n--- 2. Python NLP Microservice (Port 8000) ---")
s, b = req(f"{NLP_URL}/docs")
check("FastAPI Swagger Docs Reachable", s == 200, f"(Status: {s})")

s, b = req(f"{NLP_URL}/extract-symptoms", method="POST", data={"text": "high fever, severe headache and nausea"})
check("Symptom Extraction Endpoint", s == 200 and "symptoms" in b, f"Extracted: {b.get('symptoms', [])}")

s, b = req(f"{NLP_URL}/predict", method="POST", data={"symptoms": ["high fever", "severe headache", "joint pain"]})
check("Disease Prediction kNN Engine", s == 200 and b.get("predictedDisease") == "Dengue Fever", f"Predicted: {b.get('predictedDisease')}, Conf: {b.get('confidenceScore')}")

# 3. BACKEND SERVICE & HEALTH
print("\n--- 3. Spring Boot Backend (Port 8080) ---")
s, b = req(f"{BASE_URL}/api/health")
check("Backend Health Endpoint", s == 200 and b.get("status") == "UP", f"(Status: {b})")

# 4. PATIENT AUTHENTICATION & SESSION
print("\n--- 4. Patient Registration & Authentication ---")
test_email = f"audit_user_{int(time.time())}@mediguide.com"
test_pass = "TestPassword@123"

s, b = req(f"{BASE_URL}/api/auth/register", method="POST", data={
    "name": "Audit Test Patient",
    "email": test_email,
    "password": test_pass
})
check("New Patient Registration", s in (200, 201), f"(Registered: {test_email})")

s, b = req(f"{BASE_URL}/api/auth/login", method="POST", data={
    "email": test_email,
    "password": test_pass
})
patient_token = b.get("token") if isinstance(b, dict) else None
check("Patient Login & JWT Issue", s == 200 and patient_token is not None, f"(Token length: {len(patient_token) if patient_token else 0})")

auth_header = {"Authorization": f"Bearer {patient_token}"} if patient_token else {}

# 5. PATIENT DASHBOARD INITIAL
print("\n--- 5. Patient Dashboard Initial Metrics ---")
s, b = req(f"{BASE_URL}/api/dashboard/summary", headers=auth_header)
check("Patient Dashboard Summary", s == 200 and "totalSearches" in b, f"Total Searches: {b.get('totalSearches')}")

# 6. SYMPTOM SEARCH - TEXT INPUT
print("\n--- 6. Symptom Analysis (TEXT input) ---")
s, b = req(f"{BASE_URL}/api/search", method="POST", headers=auth_header, data={
    "symptomText": "chest pain, shortness of breath, left arm pain, sweating",
    "inputType": "TEXT"
})
check("Chest Pain Query -> Heart Attack", s == 200 and b.get("predictedDisease") == "Heart Attack", f"Predicted: {b.get('predictedDisease')}, Specialist: {b.get('recommendedSpecialist')}")
check("Recommendations (Tests & Hospitals present)", s == 200 and len(b.get("recommendedTests", [])) > 0 and len(b.get("recommendedHospitals", [])) > 0, f"Tests: {len(b.get('recommendedTests', []))}, Hospitals: {len(b.get('recommendedHospitals', []))}")
check("Top-3 Predictions (k=3) included", s == 200 and len(b.get("topPredictions", [])) >= 3, f"Top Predictions Count: {len(b.get('topPredictions', []))}")

# 7. SYMPTOM SEARCH - VOICE INPUT
print("\n--- 7. Symptom Analysis (VOICE input - Multilingual) ---")
s, b = req(f"{BASE_URL}/api/search", method="POST", headers=auth_header, data={
    "symptomText": "wheezing, shortness of breath, chest tightness, coughing",
    "inputType": "VOICE"
})
check("Voice Search -> Asthma", s == 200 and b.get("predictedDisease") == "Asthma", f"Predicted: {b.get('predictedDisease')}, Conf: {b.get('confidenceScore')}")

s, b = req(f"{BASE_URL}/api/search", method="POST", headers=auth_header, data={
    "symptomText": "எனக்கு கடுமையான காய்ச்சல் மற்றும் தலைவலி உள்ளது",
    "inputType": "VOICE"
})
check("Tamil Voice Search -> Dengue Fever", s == 200 and b.get("predictedDisease") == "Dengue Fever", f"Predicted: {b.get('predictedDisease')}, Conf: {b.get('confidenceScore')}")

# 8. SEARCH HISTORY & RECS
print("\n--- 8. Patient History & Recommendations Store ---")
s, b = req(f"{BASE_URL}/api/history?page=0&size=10", headers=auth_header)
history_items = b.get("content", []) if isinstance(b, dict) else (b if isinstance(b, list) else [])
check("Fetch Patient Query History", s == 200 and len(history_items) >= 3, f"Saved Query History Items: {len(history_items)}")

history_id = history_items[0].get("id") if len(history_items) > 0 else None
if history_id:
    s, b_detail = req(f"{BASE_URL}/api/history/{history_id}", headers=auth_header)
    check("Fetch Query Detail by ID", s == 200 and b_detail.get("id") == history_id, f"Query ID: {history_id}, Disease: {b_detail.get('predictedDisease')}")

s, b = req(f"{BASE_URL}/api/recommendations?page=0&size=10", headers=auth_header)
rec_items = b.get("content", []) if isinstance(b, dict) else (b if isinstance(b, list) else [])
check("Fetch Recommendations History", s == 200 and len(rec_items) >= 3, f"Recommendation Records: {len(rec_items)}")

# 9. ADMIN LOGIN & ADMIN MODULES
print("\n--- 9. Admin Operations & Analytics ---")
s, b = req(f"{BASE_URL}/api/auth/admin-login", method="POST", data={
    "email": "admin@mediguide.com",
    "password": "Admin@1234"
})
admin_token = b.get("token") if isinstance(b, dict) else None
admin_role = b.get("role") if isinstance(b, dict) else None
check("Admin Authentication", s == 200 and admin_token is not None and "ADMIN" in str(admin_role), f"Admin Name: {b.get('name')}, Role: {admin_role}")

admin_header = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}

s, b = req(f"{BASE_URL}/api/admin/analytics", headers=admin_header)
check("Admin Analytics & KPI Metrics", s == 200 and "totalUsers" in b and "totalQueries" in b, f"Users: {b.get('totalUsers')}, Total Queries: {b.get('totalQueries')}")

s, b = req(f"{BASE_URL}/api/admin/diseases", headers=admin_header)
disease_items = b.get("content", []) if isinstance(b, dict) else (b if isinstance(b, list) else [])
check("Admin Disease Catalog Listing", s == 200 and len(disease_items) > 0, f"Diseases in Catalog: {len(disease_items)} (Total: {b.get('totalElements', len(disease_items))})")

s, b = req(f"{BASE_URL}/api/admin/hospitals", headers=admin_header)
hospital_items = b.get("content", []) if isinstance(b, dict) else (b if isinstance(b, list) else [])
check("Admin Hospital Directory", s == 200 and len(hospital_items) > 0, f"Hospitals Registered: {len(hospital_items)} (Total: {b.get('totalElements', len(hospital_items))})")

s, b = req(f"{BASE_URL}/api/admin/specialists", headers=admin_header)
specialist_items = b.get("content", []) if isinstance(b, dict) else (b if isinstance(b, list) else [])
check("Admin Specialists / Doctors Directory", s == 200 and len(specialist_items) > 0, f"Specialists Registered: {len(specialist_items)} (Total: {b.get('totalElements', len(specialist_items))})")

s, b = req(f"{BASE_URL}/api/admin/queries", headers=admin_header)
audit_items = b.get("content", []) if isinstance(b, dict) else (b if isinstance(b, list) else [])
check("Admin User Queries Audit Log", s == 200 and len(audit_items) > 0, f"Audited Queries in System: {b.get('totalElements', len(audit_items))}")

print("\n" + "=" * 70)
print(f"AUDIT SUMMARY: {checks_passed}/{checks_total} CHECKS PASSED ({round(checks_passed/checks_total*100, 1)}%)")
print("=" * 70)

if checks_passed == checks_total:
    sys.exit(0)
else:
    sys.exit(1)
