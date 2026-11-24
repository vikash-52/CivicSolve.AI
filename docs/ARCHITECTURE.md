# CivicSolve AI — Architecture & Technical Specification

## 1. System Overview
CivicSolve AI is a dual-pipeline civic-tech and societal innovation platform built for municipal corporations, citizens, and academic engineering teams.

```
                    ┌────────────────────────┐
                    │  React + Vite Frontend │
                    │ (Tailwind CSS, Leaflet)│
                    └───────────┬────────────┘
                                │ REST JSON / Multipart
                                ▼
                    ┌────────────────────────┐
                    │    FastAPI Backend     │
                    │   (Python 3.10+, JWT)  │
                    └─────┬────────────┬─────┘
                          │            │
            ┌─────────────┴─────┐      └──────────────┐
            ▼                   ▼                     ▼
┌───────────────────────┐ ┌───────────────┐ ┌──────────────────┐
│ Scikit-Learn AI Engine│ │ SQLAlchemy ORM│ │ File Attachment  │
│ - TF-IDF Vectorizer   │ │ (SQLite/Post- │ │ Local Storage    │
│ - Cosine Similarity   │ │  greSQL)      │ │ (/uploads)       │
│ - Priority Matrix     │ └───────────────┘ └──────────────────┘
└───────────────────────┘
```

## 2. Core Workflows
1. **Citizen Grievance Pipeline:**
   - 5-step reporting wizard with live AI category & hazard preview.
   - Unique report ID generation (`CS-2026-XXXX`).
   - Admin verification & routing.
   - Field officer assignment & status update (`REPORTED` → `UNDER_REVIEW` → `VERIFIED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`).
   - Resolution proof attachments and citizen feedback.

2. **University & SIH Innovation Hub:**
   - Autonomous societal challenges track.
   - Student team proposal submissions.
   - Faculty mentor review (`APPROVED`, `REVISION_REQUESTED`).
   - Sprint task boards & milestone trackers.
   - Industry partner pilot trial inquiries.
   - *Strict isolation:* Student proposals never automatically resolve municipal complaints.

3. **Security & Role-Based Access Control (RBAC):**
   - 8 authenticated roles: `CITIZEN`, `AUTHORITY_OFFICER`, `GOVERNMENT_OFFICIAL`, `SYSTEM_ADMIN`, `STUDENT_TEAM`, `FACULTY_MENTOR`, `INDUSTRY_PARTNER`, `UNIVERSITY_TEAM`.
   - Privilege escalation blocked at backend level.
   - Immutable audit logging for administrative transitions.

