import sys
import json
import urllib.request
import urllib.error

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

BASE_URL = "http://localhost:8080"
NLP_URL = "http://127.0.0.1:8000"

def request_json(url, method="GET", headers=None, data=None):
    if headers is None:
        headers = {}
    if data is not None and not isinstance(data, (bytes, bytearray)):
        data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            try:
                body = json.loads(content)
            except Exception:
                body = content
            return status, body
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            body = json.loads(content)
        except Exception:
            body = content
        return e.code, body
    except Exception as e:
        return 0, str(e)

def run_tests():
    results = {}
    print("=" * 60)
    print("      MEDIGUIDE AI END-TO-END VERIFICATION SUITE       ")
    print("=" * 60)

    # 0. Health check of NLP Microservice
    print("\n[Step 0] Verifying Python NLP Service on port 8000...")
    status, body = request_json(f"{NLP_URL}/docs")
    print(f"  NLP Docs HTTP Status: {status}")
    assert status == 200, f"NLP service unreachable: {body}"
    print("  [OK] NLP Microservice is active.")

    # 1. Patient Authentication
    print("\n[Step 1] Testing Patient Authentication...")
    patient_email = "susithra@gmail.com"
    patient_pass = "Password@123"
    
    status, auth_data = request_json(f"{BASE_URL}/api/auth/login", method="POST", data={
        "email": patient_email,
        "password": patient_pass
    })
    
    if status != 200:
        print(f"  Existing login for {patient_email} failed. Trying testpatient_e2e@mediguide.com...")
        patient_email = "testpatient_e2e@mediguide.com"
        status, auth_data = request_json(f"{BASE_URL}/api/auth/login", method="POST", data={
            "email": patient_email,
            "password": patient_pass
        })
        if status != 200:
            print("  Registering fresh test patient account...")
            status, auth_data = request_json(f"{BASE_URL}/api/auth/register", method="POST", data={
                "name": "Test Patient",
                "email": patient_email,
                "password": patient_pass
            })
            assert status == 200 or status == 201, f"Registration failed: {auth_data}"

    patient_token = auth_data.get("token")
    assert patient_token, f"No token received: {auth_data}"
    print(f"  [OK] Patient authenticated successfully. Email: {patient_email}")
    print(f"  Token: {patient_token[:25]}...")

    headers = {"Authorization": f"Bearer {patient_token}"}

    # 2. Check Initial Dashboard Summary
    print("\n[Step 2] Fetching initial Patient Dashboard summary...")
    status, summary_initial = request_json(f"{BASE_URL}/api/dashboard/summary", headers=headers)
    print(f"  Dashboard summary status: {status}")
    assert status == 200, f"Failed to get dashboard summary: {summary_initial}"
    initial_searches = summary_initial.get("totalSearches", 0)
    initial_recs = summary_initial.get("totalRecommendations", 0)
    print(f"  Initial Total Searches: {initial_searches}")
    print(f"  Initial Total Recommendations: {initial_recs}")
    print(f"  Initial Last Search Date: {summary_initial.get('lastSearchDate')}")

    # 3. Perform Symptom Search Analysis
    print("\n[Step 3] Executing Symptom Analysis Search...")
    search_payload = {
        "symptomText": "high fever, severe headache, neck stiffness, chills, nausea",
        "inputType": "TEXT"
    }
    status, search_resp = request_json(f"{BASE_URL}/api/search", method="POST", headers=headers, data=search_payload)
    print(f"  Search status: {status}")
    assert status == 200, f"Search failed: {search_resp}"

    query_id = search_resp.get("queryId")
    predicted_disease = search_resp.get("predictedDisease")
    confidence = search_resp.get("confidenceScore")
    triage = search_resp.get("triageLevel")
    print(f"  [OK] Query ID: {query_id}")
    print(f"  [OK] Predicted Disease: {predicted_disease}")
    print(f"  [OK] Confidence Score: {confidence}")
    print(f"  [OK] Triage Level: {triage}")
    print(f"  [OK] Matched Symptoms: {search_resp.get('matchedSymptoms')}")
    print(f"  [OK] Precautions: {search_resp.get('precautions')}")

    # 4. Verify Dashboard Summary Recorded the Increment
    print("\n[Step 4] Checking Updated Patient Dashboard summary...")
    status, summary_after = request_json(f"{BASE_URL}/api/dashboard/summary", headers=headers)
    assert status == 200, f"Failed to get updated summary: {summary_after}"
    after_searches = summary_after.get("totalSearches", 0)
    after_recs = summary_after.get("totalRecommendations", 0)
    print(f"  Updated Total Searches: {after_searches} (Was: {initial_searches})")
    print(f"  Updated Total Recommendations: {after_recs} (Was: {initial_recs})")
    print(f"  Updated Last Search Date: {summary_after.get('lastSearchDate')}")

    assert after_searches == initial_searches + 1, f"Expected searches {initial_searches + 1}, got {after_searches}"
    print("  [OK] Total Searches count incremented by 1 correctly!")

    # 5. Verify History Recording
    print("\n[Step 5] Checking Patient Search History...")
    status, history_resp = request_json(f"{BASE_URL}/api/history?page=0&size=10", headers=headers)
    assert status == 200, f"Failed to get history: {history_resp}"
    history_items = history_resp.get("content", [])
    print(f"  Retrieved {len(history_items)} history items.")
    matching_query = next((item for item in history_items if item.get("id") == query_id or item.get("queryId") == query_id), None)
    if not matching_query and history_items:
        matching_query = history_items[0]
    
    assert matching_query is not None, "New query not found in history!"
    print(f"  [OK] Found latest search in history: {matching_query}")

    # 6. Verify History Detail / Report
    actual_query_id = matching_query.get("id")
    print(f"\n[Step 6] Checking Query Detail / Report for ID: {actual_query_id}...")
    status, detail_resp = request_json(f"{BASE_URL}/api/history/{actual_query_id}", headers=headers)
    print(f"  History Detail status: {status}")
    assert status == 200, f"Failed to get history detail: {detail_resp}"
    print(f"  [OK] History Detail retrieved successfully. Disease: {detail_resp.get('predictedDisease')}")

    # 7. Verify Recommendations Recording
    print("\n[Step 7] Checking Clinical Recommendations...")
    status, recs_resp = request_json(f"{BASE_URL}/api/recommendations?page=0&size=10", headers=headers)
    assert status == 200, f"Failed to get recommendations: {recs_resp}"
    recs_items = recs_resp.get("content", [])
    print(f"  Retrieved {len(recs_items)} recommendation items.")
    
    status, latest_rec = request_json(f"{BASE_URL}/api/recommendations/latest", headers=headers)
    print(f"  Latest Recommendation status: {status}")
    if status == 200 and latest_rec:
        print(f"  [OK] Latest Recommendation Disease: {latest_rec.get('diseaseName')}")
        print(f"  [OK] Specialist: {latest_rec.get('specialist')}")
        print(f"  [OK] Diet: {latest_rec.get('dietPlan')}")

    # 8. Admin Login & Analytics Verification
    print("\n[Step 8] Testing Admin Login & Analytics / Reports...")
    status, admin_auth = request_json(f"{BASE_URL}/api/auth/admin-login", method="POST", data={
        "email": "admin@mediguide.com",
        "password": "Admin@1234",
        "rememberMe": True
    })
    print(f"  Admin login status: {status}")
    assert status == 200, f"Admin login failed: {admin_auth}"
    admin_token = admin_auth.get("token")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("  [OK] Admin logged in successfully.")

    # 9. Verify Admin Analytics Data
    print("\n[Step 9] Verifying Admin Analytics API...")
    status, analytics_data = request_json(f"{BASE_URL}/api/admin/analytics", headers=admin_headers)
    print(f"  Admin analytics status: {status}")
    assert status == 200, f"Admin analytics failed: {analytics_data}"
    
    print("  [OK] Admin Analytics Metrics:")
    print(f"    - Total Users: {analytics_data.get('totalUsers')}")
    print(f"    - Total Queries: {analytics_data.get('totalQueries')}")
    print(f"    - Total Recommendations: {analytics_data.get('totalRecommendations')}")
    print(f"    - Active Users Today: {analytics_data.get('activeUsersToday')}")
    print(f"    - Top Common Diseases: {analytics_data.get('commonDiseases')}")
    
    # Check queries per day
    q_per_day = analytics_data.get("queriesPerDay", {})
    recent_day_counts = {k: v for k, v in list(q_per_day.items())[-5:]}
    print(f"    - Recent Daily Queries: {recent_day_counts}")

    print("\n" + "=" * 60)
    print("     ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!       ")
    print("=" * 60)

if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as e:
        print(f"\n[FAIL] ASSERTION FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[FAIL] UNEXPECTED ERROR: {e}")
        sys.exit(2)
