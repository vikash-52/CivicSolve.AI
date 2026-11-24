# CivicSolve AI — REST API Endpoints Specification

Interactive Swagger UI documentation is accessible at `http://127.0.0.1:8000/docs`.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a citizen account.
- `POST /api/auth/login` — Sign in and obtain JWT bearer token.
- `GET /api/auth/me` — Retrieve current authenticated user profile.
- `POST /api/auth/demo-login?role={ROLE}` — Instant 1-click evaluator login into pre-seeded verified role accounts.

### Civic Problems (`/api/problems`)
- `GET /api/problems` — Filterable public and personal issues feed.
- `POST /api/problems` — Submit a grievance (auto-assigns `CS-2026-XXXX`, runs AI priority & duplicate checks).
- `GET /api/problems/{id}` — Full problem details with status timeline, attachments, and AI triage breakdown.
- `POST /api/problems/{id}/upload` — Upload evidence images (PNG, JPG, WEBP).
- `POST /api/problems/{id}/vote` — Upvote / support an issue (prevents duplicate votes).
- `DELETE /api/problems/{id}/vote` — Withdraw support vote.
- `POST /api/problems/{id}/save` — Bookmark issue to personal saved list.
- `POST /api/problems/{id}/comments` — Post comment on an issue.
- `POST /api/problems/{id}/feedback` — Citizen rates resolution quality (1 to 5 stars) and submits feedback.
- `GET /api/problems/{id}/duplicates` — Retrieve potential duplicate candidates identified by TF-IDF similarity.

### AI Engine (`/api/ai`)
- `POST /api/ai/analyze-preview` — Real-time NLP category suggestion, 0-100 priority score calculation, and duplicate check.

### Administration (`/api/admin`)
- `GET /api/admin/stats` — High-level counts for pending, verified, unassigned, and rejected complaints.
- `GET /api/admin/pending-verification` — Grievances awaiting administrative triage.
- `POST /api/admin/problems/{id}/verify` — Verify or reject with reason and adjust priority/category.
- `POST /api/admin/problems/{id}/assign` — Assign department and field officer.
- `GET /api/admin/users` — List platform users.
- `POST /api/admin/users/{id}/role` — Update user's permitted role.
- `GET /api/admin/audit-logs` — Audit trail of administrative transitions.

### Authority Officer (`/api/authority`)
- `GET /api/authority/assignments` — Cases assigned to officer.
- `POST /api/authority/problems/{id}/status` — Transition status (`IN_PROGRESS`, `RESOLVED`), record notes, and attach resolution proof.

### Government Command Center (`/api/government`)
- `GET /api/government/analytics` — City-wide resolution rate, department workload, and priority distributions.
- `GET /api/government/map` — Geo-tagged coordinates for interactive Leaflet map.

### Solution Hub & Innovation (`/api/solutions`)
- `GET /api/solutions/challenges` — Approved societal innovation challenges.
- `POST /api/solutions/proposals` — Student team submits proposal.
- `GET /api/solutions/proposals/{id}` — Proposal details with sprint tasks and milestones.
- `POST /api/solutions/proposals/{id}/review` — Faculty mentor review (`APPROVED`, `REVISION_REQUESTED`).
- `POST /api/solutions/proposals/{id}/tasks` — Add sprint task.
- `PATCH /api/solutions/tasks/{task_id}/status` — Update task status (`TODO`, `IN_PROGRESS`, `DONE`).
- `POST /api/solutions/proposals/{id}/milestones` — Add project milestone.
- `PATCH /api/solutions/milestones/{milestone_id}/toggle` — Toggle milestone completion.
- `POST /api/solutions/proposals/{id}/interest` — Industry partner expresses interest in pilot trial or mentorship.

