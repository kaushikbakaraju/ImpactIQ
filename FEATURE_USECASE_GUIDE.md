# ImpactIQ: Feature Use Case & Architecture Instruction Manual (A to Z Guide)

**Product Name:** ImpactIQ  
**Target Audience:** Engineering Individual Contributors (ICs), Engineering Managers (EMs), Tech Leads, and Directors of Engineering  
**Core Purpose:** Automate engineering progress capture, distill raw activity into business-quantified impact statements, enforce organizational tree privacy via PostgreSQL Row-Level Security (RLS), power automated 1:1 agendas, and generate one-click quarterly promotion Brag Sheets.

---

## Table of Contents
1. [Executive Summary & Personas](#1-executive-summary--personas)
2. [A-to-Z Feature Reference](#2-a-to-z-feature-reference)
   - [Feature A: In-Browser English Voice Update Widget](#feature-a-in-browser-english-voice-update-widget)
   - [Feature B: Mockable Webhook Ingestion Hub (GitHub & Jira)](#feature-b-mockable-webhook-ingestion-hub-github--jira)
   - [Feature C: LLM Transformation Pipeline (Trivia Stripper & XYZ Formatter)](#feature-c-llm-transformation-pipeline-trivia-stripper--xyz-formatter)
   - [Feature D: Employee Private Workspace & Approval Workflow](#feature-d-employee-private-workspace--approval-workflow)
   - [Feature E: Manager Team Overview & Stalled Objectives Detection](#feature-e-manager-team-overview--stalled-objectives-detection)
   - [Feature F: Confidential Manager Coaching Notes](#feature-f-confidential-manager-coaching-notes)
   - [Feature G: Automated 1:1 Copilot Agenda Synthesizer](#feature-g-automated-11-copilot-agenda-synthesizer)
   - [Feature H: PostgreSQL Row-Level Security (RLS) & Hierarchy Enforcement](#feature-h-postgresql-row-level-security-rls--hierarchy-enforcement)
   - [Feature I: One-Click Quarterly "Brag Sheet" Export](#feature-i-one-click-quarterly-brag-sheet-export)
3. [Step-by-Step User Journeys (How to Use)](#3-step-by-step-user-journeys-how-to-use)
   - [User Journey 1: The IC (Alex Rivera) Capturing Wins & Prepping for 1:1](#user-journey-1-the-ic-alex-rivera-capturing-wins--prepping-for-11)
   - [User Journey 2: The EM (Sarah Lin) Managing Direct Reports & Unblocking Roadblocks](#user-journey-2-the-em-sarah-lin-managing-direct-reports--unblocking-roadblocks)
   - [User Journey 3: The Security & Compliance Auditor Testing RLS Isolation](#user-journey-3-the-security--compliance-auditor-testing-rls-isolation)
4. [API & Webhook cURL Reference](#4-api--webhook-curl-reference)
5. [Database Schema & RLS Security Policies](#5-database-schema--rls-security-policies)

---

## 1. Executive Summary & Personas

ImpactIQ eliminates the pain of writing self-reviews and prepping for 1:1s by automating the bridge between technical activity and business outcomes.

### The Persona Matrix & Organizational Tree

```
                     Devina Patel
               (VP / Head of Engineering)
                     /           \
                    /             \
       Sarah Lin (EM)              David Kim (EM)
 (Director, Core Platform)       (EM, Growth & Mobile)
       /      |      \                   /        \
  Alex      Elena    Marcus           Priya      Jordan
 Rivera    Rostova    Chen           Sharma      Taylor
 (Staff)   (Senior)   (IC)           (Lead)      (Mobile)
```

1. **Alex Rivera (IC - Individual Contributor)**:
   - Senior Staff Backend Engineer reporting to Sarah Lin.
   - Goals: Deliver sub-100ms checkout latency, zero-downtime schema migrations, and multi-region DR.
   - Key Need: Capture ad-hoc voice memos and PRs, keep raw notes private until polished, and export a compelling Q3 Brag Sheet for promotion calibration.

2. **Sarah Lin (EM - Engineering Manager)**:
   - Director of Platform Engineering overseeing Alex, Elena, and Marcus.
   - Key Need: Spot stalled objectives before they breach SLAs, keep private coaching notes on career progression, and conduct high-leverage 1:1s with AI-curated agendas.
   - Security Boundary: **CANNOT** view unapproved employee drafts, and **CANNOT** access David Kim’s direct reports (Priya Sharma, Jordan Taylor).

3. **David Kim (EM - Other Team Manager)**:
   - Manages Growth & Mobile. Strictly segregated from Sarah Lin’s team under PostgreSQL Row-Level Security.

---

## 2. A-to-Z Feature Reference

### Feature A: In-Browser English Voice Update Widget
- **What it does:** Allows engineers to record informal voice memos describing recent accomplishments, bug fixes, or architecture shifts.
- **How it works:**
  1. Click **"Voice Update"** in the top bar.
  2. The widget opens an audio capture stream with an animated real-time HTML5 Canvas frequency visualizer and decibel meter.
  3. Real-time in-browser speech recognition transcribes speech on the fly.
  4. Select between transcription engines: **Whisper**, **Deepgram Nova-2**, or **Gemini Audio**.
  5. If without a microphone, click one of the 3 realistic quick presets (*Checkout Latency*, *Memory Leak Fix*, *Migration Safety*).
  6. Click **"Distill to Impact Statement"**: Sends the raw transcript to the LLM pipeline, removes filler conversation, formats it into a Google XYZ statement, and stores it as a **Private Draft** in the Employee's workspace.

### Feature B: Mockable Webhook Ingestion Hub (GitHub & Jira)
- **What it does:** Receives external webhook events from developer tools and ingests them into the impact pipeline.
- **Endpoints:**
  - `POST /api/webhooks/github` (Supports merged PRs, commit pushes, diff stats, author identification).
  - `POST /api/webhooks/jira` (Supports issue resolution, story points, custom field acceptance criteria).
- **Interactive Simulator:**
  - Click **"Simulate Webhook"** in the top bar or visit the **"Webhook Hub"** tab.
  - Choose between GitHub PR #1145, Commit Push log, or Jira PLAT-902/CORE-841.
  - Inspect the JSON payload and click **"Dispatch Mock Webhook"** to trigger live processing.
  - Copy ready-to-run `curl` commands to fire webhooks from your terminal.

### Feature C: LLM Transformation Pipeline (Trivia Stripper & XYZ Formatter)
- **Powered by:** Gemini 3.8 Flash (`POST /api/llm/transform`).
- **Core Transformations:**
  1. **Trivia Elimination:** Strips routine noise (e.g. `fixed typo in readme`, `bumped lodash version`, `rebased branch`, casual chatter).
  2. **Google XYZ Impact Formula:** Rewrites technical changes into: *"Accomplished [X] as measured by [Y] by doing [Z]"*.
  3. **Quantified Metrics Rollup:** Extracts or calculates key metrics (e.g., `-41% p99 latency`, `27,000 RPS sustained`, `$1,850/mo saved`).
  4. **Goal Auto-Linking:** Evaluates user's active quarterly OKRs, matches the achievement to the highest-affinity goal, assigns a match confidence score (e.g., `96% Match`), and provides semantic reasoning.

### Feature D: Employee Private Workspace & Approval Workflow
- **Private Drafts Buffer:** All newly ingested items (voice, git, jira) enter the employee's inbox as `status: 'draft'`.
- **Privacy Guarantee:** Under Row-Level Security policy `manager_direct_approved_records`, unapproved drafts are **strictly invisible** to the Engineering Manager.
- **Approval Workflow:**
  - The employee reviews the AI-generated impact statement.
  - Click **"Edit Statement"** to adjust metrics, title, or linked OKR.
  - Click **"Approve & Share to EM"**: Flips status to `approved`. The item immediately appears on the Manager's dashboard and 1:1 Copilot feed.

### Feature E: Manager Team Overview & Stalled Objectives Detection
- **Direct-Reporting Tree:** Displays only direct reports (Alex, Elena, Marcus).
- **Stalled Objectives Alert Banner:** Automatically flags any quarterly goal that has not had activity or linked achievements for $>7$ days.
  - Displays days inactive (e.g., Marcus Chen's eBPF mesh migration: *29 days inactive*).
  - Provides a one-click **"Add to 1:1"** button to inject the blocked item directly into the upcoming sync agenda.

### Feature F: Confidential Manager Coaching Notes
- **What it does:** Allows the EM to keep private performance calibrations, promotion feedback, and growth notes for each direct report.
- **RLS Policy:** `manager_coaching_notes_private` ensures only the authoring manager can read or write these records. The IC cannot access them under any circumstances.

### Feature G: Automated 1:1 Copilot Agenda Synthesizer
- **What it does:** Runs on an automated bi-weekly cadence or on-demand to construct high-leverage meeting agendas.
- **Agenda Sections:**
  1. **Executive Synthesis:** 2-3 sentence overview of sprint momentum, team velocity, and critical roadblocks.
  2. **Categorized Talking Points:**
     - `celebration`: Wins to acknowledge (e.g. checkout latency drop).
     - `blocker`: Roadblocks requiring manager escalation (e.g. cross-tenant VPC peering).
     - `growth`: Career development & Staff promotion trajectory.
     - `strategy`: Architecture roadmap and OKR pacing.
  3. **Mutual Action Items:** Checklist with explicit ownership (`employee` vs `manager`) and due dates.
  4. **Shared Notes Scratchpad:** Real-time synced notes box for both roles during the call.

### Feature H: PostgreSQL Row-Level Security (RLS) & Hierarchy Enforcement
- **What it does:** Enforces strict multi-tenant and organizational hierarchy isolation directly at the database layer.
- **Interactive Policy Inspector (`RLS Active` button in header):**
  - **Interactive Testbench:** Pick any session user (`auth.uid()`) and any target record owner (`user_id`), choose a table (`achievements`, `goals`, `coaching_notes`), and test queries in real time.
  - **Live Audit Trail:** View every query permission decision (`PERMIT` vs `DENY`), actor IDs, and policy names.
  - **SQL DDL Viewer:** View the exact PostgreSQL policies enforced in production.

### Feature I: One-Click Quarterly "Brag Sheet" Export
- **What it does:** Generates a comprehensive, calibrated promotion & performance review document.
- **Formats Available:**
  1. **Interactive Review:** Grouped by OKRs, rollup metrics, and executive summary.
  2. **Copy Markdown:** One-click copy formatted in clean markdown for Lattice, Workday, Culture Amp, or Google Docs.
  3. **Export JSON:** Calls `GET /api/brag-sheet/:userId` to download a structured data payload.
  4. **Print / PDF:** Specialized print stylesheet for executive printing and PDF saving.

---

## 3. Step-by-Step User Journeys (How to Use)

### User Journey 1: The IC (Alex Rivera) Capturing Wins & Prepping for 1:1
1. **Verify Session:** Notice in the top-right that **Alex Rivera [IC]** is active.
2. **Record a Voice Update:**
   - Click the **"Voice Update"** button in the header.
   - Click the preset **"Checkout Latency"** (or use your microphone).
   - Click **"Distill to Impact Statement"**.
   - Notice a new card appear in your **"Needs Review & Approval"** section.
3. **Review & Approve:**
   - Review the business impact statement: *"Reduced p99 checkout API latency by 41% under 27,000 RPS..."*
   - Click **"Approve & Share to EM"**.
   - The card moves into **"Approved & Shared Achievements"** and is now visible to Sarah Lin.
4. **Generate Your Brag Sheet:**
   - Click **"Brag Sheet"** in the top bar.
   - Review your executive summary, OKR-aligned achievements, and quantified metrics.
   - Click **"Copy Markdown"** to copy it for your performance review.

### User Journey 2: The EM (Sarah Lin) Managing Direct Reports & Unblocking Roadblocks
1. **Switch Persona:** In the top-right user dropdown, click **Sarah Lin [EM]**.
2. **Review Team Health:**
   - Notice the **"Stalled Objectives Alert Banner"** highlighting Marcus Chen (29 days inactive) and Alex Rivera (25 days inactive).
   - Click **"Add to 1:1"** on Alex's stalled DR objective.
3. **Inspect Direct Report:**
   - Click on **Alex Rivera** in the team grid.
   - Notice you can see Alex's **approved** achievements, but his private drafts are completely shielded.
4. **Write Confidential Coaching Notes:**
   - In the right-hand panel, write a note: *"Alex is ready for Staff promotion review. Needs to lead cross-team DR drill with Marcus."*
   - Click **"Save Note"**. This note is strictly private to you.
5. **Run 1:1 Copilot:**
   - Click **"Start 1:1 Copilot"**.
   - Click **"Run 1:1 AI Copilot"** to generate fresh talking points and mutual action items.

### User Journey 3: The Security & Compliance Auditor Testing RLS Isolation
1. Click the **"RLS Active"** badge in the header.
2. In the **Interactive Testbench**:
   - Set Session User to **Sarah Lin [EM]**.
   - Set Target Owner to **Priya Sharma [IC]** (managed by David Kim, another manager).
   - Select Resource **"achievements"** and click **"Execute Query"**.
   - Notice the result: **RLS SECURITY VIOLATION INTERCEPTED (Rows Returned: 0)** because Priya is outside Sarah's direct reporting tree!
3. Switch Session User to **Alex Rivera [IC]**, set Target Owner to **Alex Rivera**, and select **"coaching_notes"**.
   - Click **"Execute Query"**.
   - Notice: **STRICT RLS DENIAL (Rows Returned: 0)** because ICs cannot read their manager's private coaching notes!

---

## 4. API & Webhook cURL Reference

### 1. Ingest GitHub Pull Request
```bash
curl -X POST http://localhost:3000/api/webhooks/github \
  -H "Content-Type: application/json" \
  -H "x-github-event: pull_request" \
  -d '{
    "action": "closed",
    "pull_request": {
      "number": 1145,
      "title": "perf(cache): Add distributed stale-while-revalidate Redis caching for catalog API",
      "merged": true,
      "user": { "login": "alex-rivera-eng" },
      "body": "Tested against 30,000 RPS benchmark. p99 dropped from 150ms to 88ms."
    }
  }'
```

### 2. Ingest Jira Issue Resolution
```bash
curl -X POST http://localhost:3000/api/webhooks/jira \
  -H "Content-Type: application/json" \
  -d '{
    "webhookEvent": "jira:issue_updated",
    "issue": {
      "key": "PLAT-902",
      "fields": {
        "summary": "Zero-Downtime Migration Framework: Lock contention pre-flight checker",
        "description": "Pre-flight daemon aborts deploy if lock acquire duration exceeds 250ms.",
        "status": { "name": "Resolved" }
      }
    }
  }'
```

### 3. Trigger LLM Impact Transformation
```bash
curl -X POST http://localhost:3000/api/llm/transform \
  -H "Content-Type: application/json" \
  -d '{
    "rawInput": "Fixed WebSocket connection pool memory leak in gateway. Memory dropped from 2.4GB to 380MB.",
    "goals": [{"id": "goal_1", "title": "Sub-100ms P99 Latency on High-Throughput APIs"}]
  }'
```

### 4. Fetch Quarterly Brag Sheet
```bash
curl -s http://localhost:3000/api/brag-sheet/user_ic_1?quarter=Q3%202026
```

---

## 5. Database Schema & RLS Security Policies

```sql
-- Core Tables
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(16) NOT NULL CHECK (role IN ('IC', 'EM', 'DIRECTOR')),
  manager_id VARCHAR(64) REFERENCES users(id),
  department VARCHAR(128),
  team VARCHAR(128)
);

CREATE TABLE quarterly_goals (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  quarter VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(64),
  target_metric VARCHAR(128),
  current_metric VARCHAR(128),
  progress_percent INT DEFAULT 0,
  health VARCHAR(32) CHECK (health IN ('on-track', 'needs-attention', 'stalled', 'completed')),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE achievements (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(32) NOT NULL,
  source_reference VARCHAR(128),
  raw_input TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  business_impact_statement TEXT NOT NULL,
  technical_craft_summary TEXT,
  quantified_metrics TEXT[],
  linked_goal_id VARCHAR(64) REFERENCES quarterly_goals(id),
  goal_match_confidence INT,
  goal_match_reasoning TEXT,
  status VARCHAR(16) CHECK (status IN ('draft', 'approved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

CREATE TABLE coaching_notes (
  id VARCHAR(64) PRIMARY KEY,
  manager_id VARCHAR(64) REFERENCES users(id),
  employee_id VARCHAR(64) REFERENCES users(id),
  note TEXT NOT NULL,
  sentiment VARCHAR(32),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_notes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Employees own their achievements (draft + approved)
CREATE POLICY employee_own_achievements ON achievements
  FOR ALL USING (auth.uid() = user_id);

-- Policy 2: Managers view approved achievements of direct reports only
CREATE POLICY manager_direct_approved ON achievements
  FOR SELECT USING (
    status = 'approved' AND
    auth.uid() = (SELECT manager_id FROM users WHERE id = achievements.user_id)
  );

-- Policy 3: Manager coaching notes are strictly confidential
CREATE POLICY manager_coaching_private ON coaching_notes
  FOR ALL USING (auth.uid() = manager_id);
```
