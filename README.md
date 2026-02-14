# PBJ — Positive Behavior through JSON

**An AI-powered behavior tracking system that transforms unstructured teacher notes into structured, actionable data—built to close the equity gap for students who need the most support.**

![Status](https://img.shields.io/badge/status-active%20development-brightgreen)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20Express%20%7C%20MongoDB%20%7C%20OpenAI-blue)

---

## The Problem

Students with IEPs, 504 plans, and behavior intervention needs often fall through the cracks—not because teachers don't care, but because **the data required to validate interventions is scattered across low-resolution GPAs and unsearchable Google Docs.**

Teachers have the expertise to help. What they lack is the *bandwidth* to record the granular, consistent behavioral data needed to prove whether an intervention is actually working.

**The result?** Students with the highest needs get support based on gut feelings instead of evidence. Interventions continue (or get abandoned) without data to back the decision.

---

## The Solution

PBJ uses **LLM-driven tool calling** to convert unstructured, natural-language teacher notes into **schema-validated behavioral records** aligned with PBIS and MTSS frameworks.

```
Teacher types:  "Marcus was really struggling to stay focused during group work today. 
                 Had to redirect him 3x. Ended up moving him to work independently 
                 which helped. Following up with his case manager."

PBJ creates:    ┌─────────────────────────────────────────────────────┐
                │ Student: Marcus                                     │
                │ Category: off-task                                  │
                │ Severity: moderate                                  │
                │ Intervention: recommended (Tier 2)                  │
                │ Needs Follow-up: ✓                                  │
                │ Tags: [focus, redirection, seating, case-manager]   │
                └─────────────────────────────────────────────────────┘
```

**The core design decision:** Meet teachers where they are. By accepting raw, informal observations and handling data structuring automatically, the technical barrier to high-quality data collection is virtually zero.

---

## Key Features

### 🎯 Natural Language → Structured Data
- Paste or type notes in plain English
- GPT-4o with function calling extracts structured behavior records
- Zod schema validation ensures data consistency
- Supports multiple students mentioned in a single note

### 🔒 Privacy-First Architecture (FERPA Compliant)
- **Student names never reach OpenAI.** A Python microservice powered by [Microsoft Presidio](https://github.com/microsoft/presidio) detects and redacts PII *before* LLM processing
- Names are replaced with aliases (PERSON_1, PERSON_2) and restored after parsing
- Original notes stored locally for audit trail

### 📊 Behavior Record Schema
Records capture the full context teachers need for data-driven intervention:

| Field | Description |
|-------|-------------|
| `behavior.category` | PBIS-aligned categories (off-task, disruption, prosocial, etc.) |
| `behavior.severity` | low / moderate / high |
| `behavior.is_positive` | Track positive behaviors, not just problems |
| `behavior.needs_followup` | Flag for intervention planning |
| `intervention.tier` | MTSS tier alignment (universal, Tier 1/2/3) |
| `context` | Class, activity, location, grouping |

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (teacher vs. admin)
- Users can only view/edit their own records

### 📋 Roster Management
- CSV upload for class rosters (optimized for Skyward exports)
- Student-record association for longitudinal tracking

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, React Router, Vite |
| **Backend** | Express.js (Node.js) |
| **Database** | MongoDB with Mongoose ODM |
| **AI/LLM** | OpenAI GPT-4o with function calling |
| **Validation** | Zod (runtime schema validation) |
| **PII Redaction** | Python FastAPI microservice with Microsoft Presidio NER |
| **Auth** | JWT + bcrypt |

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Client  │────▶│  Express API    │────▶│    MongoDB      │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
           ┌─────────────────┐       ┌─────────────────┐
           │ Presidio (NER)  │       │   OpenAI API    │
           │ PII Redaction   │──────▶│  Structured     │
           │ Python/FastAPI  │       │  Extraction     │
           └─────────────────┘       └─────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pbj.git
cd pbj

# Install Node dependencies
npm install
cd client/pbj && npm install && cd ../..

# Set up Python redaction service
cd server/services/redaction
python3 -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cd ../../..

# Configure environment
cp .env.example .env
# Add your OPENAI_API_KEY and MONGODB_URI to .env
```

### Running the Application

```bash
# Run all services concurrently (recommended)
npm run dev:all

# Or run individually:
npm run dev:server    # Express API on :3000
npm run dev:client    # React app on :5173
npm run dev:redaction # Presidio service on :8000
```

---

## Roadmap

### Current (MVP)
- [x] Natural language note parsing with GPT-4o
- [x] PII redaction before LLM processing
- [x] User authentication and authorization
- [x] Paginated record viewing with filters
- [x] CSV roster upload

### In Progress
- [ ] **Human-in-the-loop editing** — Review and edit AI-parsed records before saving
- [ ] **Student-note matching** — Fuzzy match parsed names to roster for accurate linking

### Planned
- [ ] **Analytics dashboard** — Behavior trends over time, category breakdowns, intervention tracking
- [ ] **Intervention to-do list** — Actionable follow-up queue based on `needs_followup` flags
- [ ] **Bulk note upload** — Process multiple notes from a document or spreadsheet
- [ ] **Data export** — Generate reports for IEP meetings, admin reviews

### Future Vision
- [ ] **School-wide deployment** — Multi-teacher views, admin dashboards, cross-class insights
- [ ] **SIS integrations** — Direct connection to Skyward, PowerSchool, Clever, ClassLink
- [ ] **RAG-powered framework alignment** — Retrieval-augmented generation using official MTSS/PBIS handbooks to ground categorization and intervention recommendations in district-approved frameworks
- [ ] **MCP for parent communication** — Model Context Protocol integration to draft behavior update emails, with teacher review before sending
- [ ] **ML-powered insights** — Pattern detection, early warning systems, intervention recommendations (requires sufficient data scale)

---

## Why This Matters

> *"For educational technology to be inclusive, it must meet users in their most constrained moments—ensuring that the students with the highest needs get the most accurate, data-backed support."*

Teachers already know their students. They see the patterns. They write notes. What they don't have time to do is manually structure that knowledge into searchable, analyzable data.

PBJ exists to **capture expertise that would otherwise be lost** and transform it into evidence that can drive real intervention decisions.

---

## About the Developer

I'm a high school teacher building tools to solve problems I see in my own classroom every day. This project combines my teaching experience with my growing software engineering skills to address a gap that commercially available tools haven't filled.

**Contact:** linkedin.com/in/asimons92

---

## License

MIT License — see [LICENSE](LICENSE) for details.

