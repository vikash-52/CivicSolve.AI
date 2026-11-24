import os
import sys
from datetime import datetime, timedelta

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal, Base, engine
from app.models.entities import (
    User, UserRole, Department, Problem, ProblemStatus, ProblemPriority,
    StatusTimeline, AIAnalysisRecord, DuplicateCandidate, SupportVote,
    Comment, Notification, Challenge, SolutionProposal, ProjectTask,
    ProjectMilestone, IndustryInterest, CitizenFeedback
)
from app.core.security import get_password_hash

def seed():
    print("[*] Rebuilding database schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("[*] Seeding verified municipal departments...")
    departments = [
        Department(
            name="Department of Public Works & Roads (DPW)",
            code="DPW-ROAD",
            contact_email="roads@civicsolve.demo",
            jurisdiction="All Zones",
            categories="Roads & Potholes,Public Transport"
        ),
        Department(
            name="Municipal Water Supply & Sewerage Board (MWSSB)",
            code="MWSSB-WATER",
            contact_email="water@civicsolve.demo",
            jurisdiction="Central & South Zones",
            categories="Water & Drainage"
        ),
        Department(
            name="Solid Waste Management Authority (SWMA)",
            code="SWMA-CLEAN",
            contact_email="clean@civicsolve.demo",
            jurisdiction="Metro Urban Area",
            categories="Waste Management,Environment"
        ),
        Department(
            name="Electricity Supply & Streetlight Division",
            code="ELEC-LIGHT",
            contact_email="power@civicsolve.demo",
            jurisdiction="Metropolitan Grid",
            categories="Electricity & Streetlights"
        ),
        Department(
            name="Civil Safety & Disaster Response Cell",
            code="SAFETY-RESP",
            contact_email="safety@civicsolve.demo",
            jurisdiction="Metro City Headquarters",
            categories="Public Safety,Emergency"
        )
    ]
    for d in departments:
        db.add(d)
    db.commit()

    print("[*] Seeding verified role accounts...")
    default_pwd_hash = get_password_hash("Password123!")

    users = [
        User(
            email="citizen@civicsolve.demo",
            hashed_password=default_pwd_hash,
            full_name="Rajesh Sharma",
            role=UserRole.CITIZEN,
            phone="+91 98765 43210",
            organization="Resident Welfare Association, Ward 14",
            jurisdiction="South District, Ward 14"
        ),
        User(
            email="officer@civicsolve.demo",
            hashed_password=default_pwd_hash,
            full_name="Inspector S. K. Nair",
            role=UserRole.AUTHORITY_OFFICER,
            phone="+91 94455 66778",
            organization="Municipal Corporation - Ward 14 Field Division",
            jurisdiction="South District, Ward 14"
        ),
        User(
            email="official@civicsolve.demo",
            hashed_password=default_pwd_hash,
            full_name="Dr. Meenakshi Sundaram, IAS",
            role=UserRole.GOVERNMENT_OFFICIAL,
            phone="+91 98111 22334",
            organization="Department of Municipal Administration & Urban Development",
            jurisdiction="State Capital Region"
        ),
        User(
            email="admin@civicsolve.demo",
            hashed_password=default_pwd_hash,
            full_name="Vikramaditya Rao",
            role=UserRole.SYSTEM_ADMIN,
            phone="+91 99000 11223",
            organization="CivicSolve Platform Administration",
            jurisdiction="System Wide"
        ),
        User(
            email="university@civicsolve.demo",
            hashed_password=default_pwd_hash,
            full_name="National Institute of Technology Innovation Cell",
            role=UserRole.UNIVERSITY_TEAM,
            phone="+91 80234 56789",
            organization="Centre for Societal Technology, NIT",
            jurisdiction="Academic Sector"
        ),
        User(
            email="faculty@civicsolve.demo",
            hashed_password=default_pwd_hash,
            full_name="Prof. Ananya Banerjee",
            role=UserRole.FACULTY_MENTOR,
            phone="+91 98450 12345",
            organization="Department of Computer Science & Urban Engineering",
            jurisdiction="University Innovation Council"
        ),
        User(
            email="student@civicsolve.demo",
            hashed_password=default_pwd_hash,
            full_name="Team SmartRoads (Lead: Rohan Gupta)",
            role=UserRole.STUDENT_TEAM,
            phone="+91 97123 45678",
            organization="B.Tech Computer Science Final Year Team",
            jurisdiction="NIT Campus"
        ),
        User(
            email="partner@civicsolve.demo",
            hashed_password=default_pwd_hash,
            full_name="UrbanInfra Innovations Pvt. Ltd.",
            role=UserRole.INDUSTRY_PARTNER,
            phone="+91 91234 56780",
            organization="UrbanInfra Ventures Group",
            jurisdiction="Private Industrial Corridor"
        )
    ]
    for u in users:
        db.add(u)
    db.commit()

    citizen = db.query(User).filter(User.email == "citizen@civicsolve.demo").first()
    officer = db.query(User).filter(User.email == "officer@civicsolve.demo").first()
    dpw = db.query(Department).filter(Department.code == "DPW-ROAD").first()
    mwssb = db.query(Department).filter(Department.code == "MWSSB-WATER").first()
    swma = db.query(Department).filter(Department.code == "SWMA-CLEAN").first()
    elec = db.query(Department).filter(Department.code == "ELEC-LIGHT").first()

    print("[*] Seeding realistic civic problem reports (with Demo Data badge)...")
    problems_data = [
        {
            "report_id": "CS-2026-0001",
            "title": "Severe Pothole Cluster on MG Road Junction",
            "description": "Deep multi-layer pothole cluster spanning 3 meters causing major traffic bottlenecks and two-wheeler skid hazards near Metro Pillar 142.",
            "category": "Roads & Potholes",
            "status": ProblemStatus.IN_PROGRESS,
            "priority": ProblemPriority.CRITICAL,
            "priority_score": 88.5,
            "priority_explanation": "AI Priority Score: 88.5/100. Key factors: Two-wheeler skid danger (+20); Deep pothole trigger (+20); High traffic density intersection (+15); Citizen High urgency.",
            "safety_hazard": True,
            "urgency_level": "Critical",
            "address": "Opposite Metro Pillar 142, MG Road Junction",
            "locality": "Indiranagar",
            "landmark": "Near Central Bank ATM",
            "city": "Bengaluru",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "assigned_dept": dpw,
            "assigned_off": officer,
            "notes": "Contractor dispatched with cold-mix asphalt patch team. Expected road leveling completion by tomorrow 5 PM."
        },
        {
            "report_id": "CS-2026-0002",
            "title": "Major Drinking Water Pipeline Burst in Ward 5",
            "description": "Clean potable drinking water line has ruptured beneath pavement. Gallons of clean water gushing onto the road causing localized flooding and water pressure loss in 40+ houses.",
            "category": "Water & Drainage",
            "status": ProblemStatus.ASSIGNED,
            "priority": ProblemPriority.CRITICAL,
            "priority_score": 85.0,
            "priority_explanation": "AI Priority Score: 85.0/100. Key factors: Pipe burst trigger (+25); Major potable water wastage (+20); Residential supply cutoff impact.",
            "safety_hazard": False,
            "urgency_level": "Critical",
            "address": "4th Cross, 2nd Main, Ward 5",
            "locality": "Malleshwaram",
            "landmark": "Behind Government Primary School",
            "city": "Bengaluru",
            "latitude": 13.0031,
            "longitude": 77.5643,
            "assigned_dept": mwssb,
            "assigned_off": officer,
            "notes": "Emergency isolation valve closed. Excavation scheduled for morning pipe replacement."
        },
        {
            "report_id": "CS-2026-0003",
            "title": "Heavy Garbage Accumulation & Illegal Dumping",
            "description": "Overflowing waste bins and illegal mixed garbage dumped along roadside for over 5 days. Foul odor spreading and stray animals scattering litter.",
            "category": "Waste Management",
            "status": ProblemStatus.VERIFIED,
            "priority": ProblemPriority.HIGH,
            "priority_score": 68.0,
            "priority_explanation": "AI Priority Score: 68.0/100. Key factors: Prolonged waste accumulation (+15); Public health risk (+20); Stray animal disturbance.",
            "safety_hazard": False,
            "urgency_level": "High",
            "address": "Corner of 100ft Road and 12th Main",
            "locality": "Koramangala",
            "landmark": "Adjacent to Community Park Gate",
            "city": "Bengaluru",
            "latitude": 12.9352,
            "longitude": 77.6245,
            "assigned_dept": swma,
            "assigned_off": None,
            "notes": "Verified by admin. Queued for compaction truck route re-allocation."
        },
        {
            "report_id": "CS-2026-0004",
            "title": "Non-Functional Streetlights on Dark Pedestrian Lane",
            "description": "Entire series of 6 LED streetlights completely unlit for 1 week. Area is in total darkness posing safety hazard for late-evening pedestrians and women commuters.",
            "category": "Electricity & Streetlights",
            "status": ProblemStatus.REPORTED,
            "priority": ProblemPriority.HIGH,
            "priority_score": 64.0,
            "priority_explanation": "AI Priority Score: 64.0/100. Key factors: Public safety in darkness (+20); Multiple lights offline (+15); Pedestrian safety risk.",
            "safety_hazard": True,
            "urgency_level": "High",
            "address": "Lakeview Pedestrian Walkway, 8th Block",
            "locality": "Jayanagar",
            "landmark": "Near Madhavan Park",
            "city": "Bengaluru",
            "latitude": 12.9250,
            "longitude": 77.5838,
            "assigned_dept": elec,
            "assigned_off": None,
            "notes": "Awaiting initial administrative review."
        },
        {
            "report_id": "CS-2026-0005",
            "title": "Blocked Stormwater Drainage Causing Monsoonal Inundation",
            "description": "Culvert blocked with construction silt and plastic bottles. Water stagnant for 3 days leading to mosquito breeding and foul odor.",
            "category": "Water & Drainage",
            "status": ProblemStatus.RESOLVED,
            "priority": ProblemPriority.MEDIUM,
            "priority_score": 55.0,
            "priority_explanation": "AI Priority Score: 55.0/100. Key factors: Stagnant water & mosquito breeding risk (+20); Drain siltation (+15).",
            "safety_hazard": False,
            "urgency_level": "Medium",
            "address": "Drainage Channel No. 8, BTM 2nd Stage",
            "locality": "BTM Layout",
            "landmark": "Near Udupi Garden Signal",
            "city": "Bengaluru",
            "latitude": 12.9166,
            "longitude": 77.6101,
            "assigned_dept": mwssb,
            "assigned_off": officer,
            "notes": "Desilting excavator crew cleared 2.5 tons of plastic and mud. Water flow fully restored and disinfected."
        },
        {
            "report_id": "CS-2026-0006",
            "title": "Public Park Playground Equipment Broken & Hazardous",
            "description": "Children's swing set chain snapped with sharp rusted metal edges exposed. Slide ladder footing has come loose from concrete base.",
            "category": "Other Civic Issues",
            "status": ProblemStatus.VERIFIED,
            "priority": ProblemPriority.MEDIUM,
            "priority_score": 52.0,
            "priority_explanation": "AI Priority Score: 52.0/100. Key factors: Child safety hazard (+20); Rusted metal exposure (+10).",
            "safety_hazard": True,
            "urgency_level": "Medium",
            "address": "Shanti Children's Park, Sector 4",
            "locality": "HSR Layout",
            "landmark": "Opposite Sector 4 Post Office",
            "city": "Bengaluru",
            "latitude": 12.9116,
            "longitude": 77.6389,
            "assigned_dept": dpw,
            "assigned_off": None,
            "notes": "Verified. Forwarded to Parks & Horticulture wing for equipment repair."
        }
    ]

    for p_data in problems_data:
        prob = Problem(
            report_id=p_data["report_id"],
            title=p_data["title"],
            description=p_data["description"],
            category=p_data["category"],
            status=p_data["status"],
            priority=p_data["priority"],
            priority_score=p_data["priority_score"],
            priority_explanation=p_data["priority_explanation"],
            safety_hazard=p_data["safety_hazard"],
            urgency_level=p_data["urgency_level"],
            address=p_data["address"],
            locality=p_data["locality"],
            landmark=p_data["landmark"],
            city=p_data["city"],
            latitude=p_data["latitude"],
            longitude=p_data["longitude"],
            citizen_id=citizen.id,
            assigned_department_id=p_data["assigned_dept"].id if p_data["assigned_dept"] else None,
            assigned_officer_id=p_data["assigned_off"].id if p_data["assigned_off"] else None,
            resolution_notes=p_data["notes"],
            resolved_at=datetime.utcnow() if p_data["status"] == ProblemStatus.RESOLVED else None,
            is_demo=True,
            demo_label="Demo Data",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(prob)
        db.commit()
        db.refresh(prob)

        # Timeline
        t = StatusTimeline(
            problem_id=prob.id,
            previous_status=None,
            new_status=prob.status.value,
            changed_by_name="System Seed",
            changed_by_role="System Initialization",
            notes=p_data["notes"]
        )
        db.add(t)

        # AI Analysis
        ai = AIAnalysisRecord(
            problem_id=prob.id,
            suggested_category=prob.category,
            confidence_score=0.92,
            calculated_priority_score=prob.priority_score,
            suggested_priority=prob.priority.value,
            risk_factors=prob.priority_explanation,
            recommended_department=p_data["assigned_dept"].name if p_data["assigned_dept"] else "General Municipal Redressal",
            duplicate_candidates_count=0
        )
        db.add(ai)

        # Sample vote and comment
        vote = SupportVote(problem_id=prob.id, user_id=citizen.id)
        db.add(vote)
        comment = Comment(
            problem_id=prob.id,
            user_id=citizen.id,
            content="I witness this issue every morning during commute. Urgent municipal intervention requested."
        )
        db.add(comment)

        # If resolved, add sample citizen feedback
        if prob.status == ProblemStatus.RESOLVED:
            fb = CitizenFeedback(
                problem_id=prob.id,
                citizen_id=citizen.id,
                rating=5,
                satisfaction_level="Highly Satisfied",
                comments="Quick action by the desilting team. The drain is flowing smoothly now without any water stagnation."
            )
            db.add(fb)

    db.commit()

    print("[*] Seeding Innovation Hub Challenges and Student Team Proposals...")
    challenge1 = Challenge(
        code="CH-2026-01",
        title="AI-Powered Acoustic & Vision Leak Detection for Municipal Water Pipelines",
        problem_statement="Over 35% of municipal treated water is lost through underground non-revenue pipeline leakages before reaching residential taps. Develop a low-cost, non-invasive IoT acoustic sensor network or computer vision pipeline to localize hidden subterranean leakages within a 2-meter accuracy.",
        category="Water & Drainage",
        location="Metropolitan Municipal Water Distribution Network",
        desired_outcomes="Real-time acoustic telemetry, mobile GIS dashboard with sub-meter leak localization, and early pipe rupture warning model.",
        required_skills="Embedded C/Python, FFT Signal Processing, PyTorch, LoRaWAN / 4G Telemetry, GIS Mapping",
        status="ACTIVE",
        is_demo=True
    )
    challenge2 = Challenge(
        code="CH-2026-02",
        title="Edge-AI Smartphone Pothole Profiling & Road Roughness Indexing (IRI)",
        problem_statement="Manual visual survey of municipal road surfaces is slow and subjective. Develop an on-device Edge AI mobile solution utilizing smartphone accelerometer and monocular camera to calculate International Roughness Index (IRI) and detect pothole volumetric depths during normal vehicular transit.",
        category="Roads & Potholes",
        location="Metro Arterial & Ring Roads",
        desired_outcomes="Automated road health map heatmaps, priority re-paving scoring, and instant road maintenance work order generation.",
        required_skills="TensorFlow Lite / ONNX, Flutter/React Native, Sensor Fusion (Kalman Filter), Geospatial Data Pipelines",
        status="ACTIVE",
        is_demo=True
    )
    db.add(challenge1)
    db.add(challenge2)
    db.commit()
    db.refresh(challenge1)
    db.refresh(challenge2)

    student_user = db.query(User).filter(User.email == "student@civicsolve.demo").first()
    faculty_user = db.query(User).filter(User.email == "faculty@civicsolve.demo").first()
    partner_user = db.query(User).filter(User.email == "partner@civicsolve.demo").first()

    proposal1 = SolutionProposal(
        challenge_id=challenge2.id,
        team_name="Team SmartRoads",
        university_name="National Institute of Technology",
        lead_user_id=student_user.id,
        title="RoadScan AI: Edge-Vision & IMU Fusion for Automated Road Roughness Indexing",
        approach="Our system combines smartphone dual-frequency GNSS, 3-axis accelerometer sensor fusion with an on-device lightweight YOLOv8-nano model running at 30 FPS. As municipal sanitation trucks or patrol vehicles travel regular routes, the app continuously generates high-density pavement quality metrics without needing specialized inspection vehicles.",
        tech_stack="PyTorch, ONNX Runtime, React Native, FastAPI, PostgreSQL / PostGIS, Leaflet",
        expected_impact="Reduces road survey cost by 90% and accelerates hazardous pothole repair dispatch time from 14 days down to 48 hours.",
        timeline_weeks=12,
        prototype_url="https://github.com/civicsolve-demo/smartroads-edge-ai",
        status="APPROVED",
        faculty_reviewer_id=faculty_user.id,
        faculty_feedback="Excellent sensor fusion methodology. Ensure accelerometer calibration against varying car suspension stiffness is accounted for in the field trials.",
        is_demo=True
    )
    db.add(proposal1)
    db.commit()
    db.refresh(proposal1)

    # Add sample tasks & milestones
    tasks = [
        ProjectTask(proposal_id=proposal1.id, title="YOLOv8-nano pothole dataset training (5,000 Indian road frames)", status="COMPLETED", due_date="Week 3"),
        ProjectTask(proposal_id=proposal1.id, title="Kalman Filter sensor fusion for vehicle vibration isolation", status="IN_PROGRESS", due_date="Week 6"),
        ProjectTask(proposal_id=proposal1.id, title="Municipal ward dashboard integration with Leaflet road heatmaps", status="TODO", due_date="Week 9")
    ]
    for t in tasks:
        db.add(t)

    milestones = [
        ProjectMilestone(proposal_id=proposal1.id, title="Phase 1: Baseline Model Accuracy > 88% mAP", target_date="Month 1", is_completed=True),
        ProjectMilestone(proposal_id=proposal1.id, title="Phase 2: 50km Live Field Trial on City Bus Routes", target_date="Month 2", is_completed=False),
        ProjectMilestone(proposal_id=proposal1.id, title="Phase 3: Automated Municipal Work Order Integration", target_date="Month 3", is_completed=False)
    ]
    for m in milestones:
        db.add(m)

    # Industry interest
    ind_int = IndustryInterest(
        proposal_id=proposal1.id,
        partner_user_id=partner_user.id,
        company_name="UrbanInfra Innovations Pvt. Ltd.",
        interest_type="PILOT",
        proposal_notes="UrbanInfra is eager to sponsor a 20-vehicle pilot trial with our municipal fleet in South Zone and provide cloud computing credits.",
        status="ACCEPTED"
    )
    db.add(ind_int)
    db.commit()

    print("[+] Database seeding completed successfully with 8 verified role accounts, 6 realistic civic reports, and SIH Innovation Hub proposals!")

if __name__ == "__main__":
    seed()

