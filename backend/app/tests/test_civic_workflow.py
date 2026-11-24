import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_login_all_roles():
    roles = [
        "CITIZEN", "AUTHORITY_OFFICER", "GOVERNMENT_OFFICIAL",
        "SYSTEM_ADMIN", "UNIVERSITY_TEAM", "FACULTY_MENTOR",
        "STUDENT_TEAM", "INDUSTRY_PARTNER"
    ]
    for r in roles:
        res = client.post(f"/api/auth/demo-login?role={r}")
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["user"]["role"] == r

def test_citizen_registration_and_rbac_protection():
    # Citizen registration
    email = "testcitizen2026@civicsolve.demo"
    res = client.post("/api/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Test Citizen User",
        "role": "SYSTEM_ADMIN" # Attempt privilege escalation
    })
    assert res.status_code == 200
    data = res.json()
    # CRITICAL SECURITY RULE: Privilege escalation attempt was neutralized to CITIZEN
    assert data["user"]["role"] == "CITIZEN"

    # Duplicate registration fails
    dup_res = client.post("/api/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Test Citizen User",
        "role": "CITIZEN"
    })
    assert dup_res.status_code == 400

def test_end_to_end_civic_problem_workflow():
    # 1. Login as citizen
    cit_res = client.post("/api/auth/demo-login?role=CITIZEN")
    assert cit_res.status_code == 200
    citizen_token = cit_res.json()["access_token"]
    cit_headers = {"Authorization": f"Bearer {citizen_token}"}

    # 2. Citizen creates a pothole problem report
    new_prob = {
        "title": "Severe road depression and open manhole hazard",
        "description": "A very deep road depression with an open manhole cover right next to bus stop. Two-wheelers are swerving and could cause a fatal accident.",
        "category": "Roads & Potholes",
        "urgency_level": "Critical",
        "safety_hazard": True,
        "address": "Opposite Civil Hospital Gate 2",
        "locality": "Civil Lines",
        "city": "Bengaluru",
        "latitude": 12.9800,
        "longitude": 77.6000
    }
    prob_res = client.post("/api/problems", json=new_prob, headers=cit_headers)
    assert prob_res.status_code == 201
    prob_data = prob_res.json()
    prob_id = prob_data["id"]
    assert prob_data["report_id"].startswith("CS-2026-")
    assert prob_data["status"] == "REPORTED"
    assert prob_data["priority"] in ["HIGH", "CRITICAL"]
    assert prob_data["priority_score"] >= 70.0
    assert prob_data["ai_analysis"] is not None
    assert "Open manhole" in prob_data["ai_analysis"]["risk_factors"] or "hazard" in prob_data["ai_analysis"]["risk_factors"].lower()

    # 3. Citizen upvotes the problem
    vote_res = client.post(f"/api/problems/{prob_id}/vote", headers=cit_headers)
    assert vote_res.status_code == 200
    # Duplicate vote is prevented
    dup_vote = client.post(f"/api/problems/{prob_id}/vote", headers=cit_headers)
    assert dup_vote.status_code == 400

    # 4. Citizen adds a comment
    comment_res = client.post(
        f"/api/problems/{prob_id}/comments",
        json={"content": "Please prioritize this, multiple senior citizens use this walkway daily."},
        headers=cit_headers
    )
    assert comment_res.status_code == 200

    # 5. Admin logs in and verifies the problem
    admin_res = client.post("/api/auth/demo-login?role=SYSTEM_ADMIN")
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    verify_res = client.post(
        f"/api/admin/problems/{prob_id}/verify",
        json={
            "is_verified": True,
            "adjusted_category": "Roads & Potholes"
        },
        headers=admin_headers
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "VERIFIED"

    # 6. Admin assigns problem to DPW department and officer
    depts = client.get("/api/departments").json()
    dpw_dept = next(d for d in depts if "Road" in d["name"])
    officers = client.get(f"/api/departments/{dpw_dept['id']}/officers").json()
    target_officer = officers[0]

    assign_res = client.post(
        f"/api/admin/problems/{prob_id}/assign",
        json={
            "department_id": dpw_dept["id"],
            "officer_id": target_officer["id"],
            "notes": "Emergency road patching crew assigned. Work within 24h."
        },
        headers=admin_headers
    )
    assert assign_res.status_code == 200
    assert assign_res.json()["status"] == "ASSIGNED"

    # 7. Officer logs in and transitions status: ASSIGNED -> IN_PROGRESS -> RESOLVED
    off_res = client.post("/api/auth/demo-login?role=AUTHORITY_OFFICER")
    off_token = off_res.json()["access_token"]
    off_headers = {"Authorization": f"Bearer {off_token}"}

    # Start work
    in_prog_res = client.post(
        f"/api/authority/problems/{prob_id}/status",
        json={
            "new_status": "IN_PROGRESS",
            "notes": "Field inspection team on site. Barricades placed and asphalt leveling begun."
        },
        headers=off_headers
    )
    assert in_prog_res.status_code == 200
    assert in_prog_res.json()["status"] == "IN_PROGRESS"

    # Mark resolved
    resolved_res = client.post(
        f"/api/authority/problems/{prob_id}/status",
        json={
            "new_status": "RESOLVED",
            "notes": "Manhole cover replaced with heavy-duty cast iron frame and road surface leveled.",
            "resolution_evidence_url": "https://civicsolve.demo/evidence/resolution-patch-01.jpg"
        },
        headers=off_headers
    )
    assert resolved_res.status_code == 200
    assert resolved_res.json()["status"] == "RESOLVED"

    # 8. Citizen checks updated problem and submits feedback
    prob_detail = client.get(f"/api/problems/{prob_id}", headers=cit_headers).json()
    assert prob_detail["status"] == "RESOLVED"
    assert len(prob_detail["timeline"]) >= 3

    fb_res = client.post(
        f"/api/problems/{prob_id}/feedback",
        json={
            "rating": 5,
            "satisfaction_level": "Extremely Satisfied",
            "comments": "Resolved very swiftly! Thank you to the DPW team."
        },
        headers=cit_headers
    )
    assert fb_res.status_code == 200

def test_innovation_hub_workflow():
    # 1. Student logs in
    student_res = client.post("/api/auth/demo-login?role=STUDENT_TEAM")
    student_token = student_res.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 2. Browse challenges
    challenges = client.get("/api/solutions/challenges").json()
    assert len(challenges) > 0
    target_challenge = challenges[0]

    # 3. Submit proposal
    prop_res = client.post(
        "/api/solutions/proposals",
        json={
            "challenge_id": target_challenge["id"],
            "team_name": "Team AquaSense",
            "university_name": "Indian Institute of Science",
            "title": "Acoustic Hydrophone Array for Micro-Leak Triangulation",
            "approach": "Deploying piezoelectric acoustic sensors with edge wavelet analysis to detect sub-surface pressurized water leaks.",
            "tech_stack": "Python, PyTorch, C++, STM32, LoRaWAN",
            "expected_impact": "Conserves an estimated 250,000 liters of treated water daily.",
            "timeline_weeks": 10,
            "prototype_url": "https://github.com/aquasense/leak-detection"
        },
        headers=student_headers
    )
    assert prop_res.status_code == 200
    prop_data = prop_res.json()
    prop_id = prop_data["id"]

    # 4. Faculty reviews proposal
    faculty_res = client.post("/api/auth/demo-login?role=FACULTY_MENTOR")
    faculty_token = faculty_res.json()["access_token"]
    faculty_headers = {"Authorization": f"Bearer {faculty_token}"}

    review_res = client.post(
        f"/api/solutions/proposals/{prop_id}/review",
        json={
            "status": "APPROVED",
            "feedback": "Methodology is sound and experimentally validated. Approved for Phase 1 prototype testing."
        },
        headers=faculty_headers
    )
    assert review_res.status_code == 200
    assert review_res.json()["status"] == "APPROVED"

    # 5. Student adds tasks and milestones
    task_res = client.post(
        f"/api/solutions/proposals/{prop_id}/tasks",
        json={
            "title": "Acoustic transducer lab bench calibration",
            "description": "Calibrate frequency response across 10Hz-20kHz band.",
            "due_date": "Week 2"
        },
        headers=student_headers
    )
    assert task_res.status_code == 200
    task_id = task_res.json()["id"]

    # Update task status
    update_task = client.patch(
        f"/api/solutions/tasks/{task_id}/status?new_status=DONE",
        headers=student_headers
    )
    assert update_task.status_code == 200
    assert update_task.json()["status"] == "DONE"

    # 6. Industry partner expresses interest
    partner_res = client.post("/api/auth/demo-login?role=INDUSTRY_PARTNER")
    partner_token = partner_res.json()["access_token"]
    partner_headers = {"Authorization": f"Bearer {partner_token}"}

    interest_res = client.post(
        f"/api/solutions/proposals/{prop_id}/interest",
        json={
            "company_name": "Smart Water Systems Ltd.",
            "interest_type": "PILOT",
            "proposal_notes": "We are ready to provide pipe test-rig access and pilot sensors in industrial park."
        },
        headers=partner_headers
    )
    assert interest_res.status_code == 200
    assert interest_res.json()["status"] == "PENDING"

def test_government_analytics():
    res = client.get("/api/government/analytics")
    assert res.status_code == 200
    data = res.json()
    assert "metrics" in data
    assert "total_reports" in data["metrics"]
    assert data["metrics"]["total_reports"] >= 6
    assert "priority_distribution" in data
    assert "department_workload" in data

    map_res = client.get("/api/government/map")
    assert map_res.status_code == 200
    map_points = map_res.json()
    assert len(map_points) >= 6
    assert "latitude" in map_points[0]
    assert "longitude" in map_points[0]

