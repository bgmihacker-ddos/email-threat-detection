# Email Threat Detection & Intelligence Platform

> SIH 2026 — AI-Powered Email Security Analysis

A production-oriented email security platform that analyzes emails to identify phishing, spam, Business Email Compromise (BEC), credential harvesting, malware indicators, sender spoofing, brand impersonation, suspicious URLs, malicious domains, and authentication failures.

## Features

- **Email Parsing** — Extract and structure email components
- **Header Analysis** — Analyze sender metadata and routing
- **SPF/DKIM/DMARC Analysis** — Email authentication verification
- **URL & Domain Analysis** — Detect suspicious links and domains
- **Content Analysis** — NLP-based social engineering detection
- **Rule-Based Detection** — Deterministic security rules
- **Machine Learning** — Explainable TF-IDF/logistic classification trained offline on controlled or public email corpora
- **Threat Intelligence** — External feed integration (VirusTotal, URLhaus, AbuseIPDB)
- **Threat Fusion** — Unified multi-source threat assessment
- **Risk Scoring** — Quantified threat severity
- **Explainable AI** — Human-readable detection rationale
- **IOC Extraction** — Indicators of Compromise identification
- **BEC Detection** — Business Email Compromise analysis
- **Brand Impersonation Detection** — Typosquatting and homoglyph detection
- **Security Dashboard** — Real-time threat analytics and visualization
- **Durable analysis jobs** — Database-backed queued work with cancellation and stale-job recovery
- **Evidence provenance** — Reproducible evidence ledger, raw-message integrity hash, and export masking
- **Indexed campaign correlation** — IOC candidate indexing for URLs, domains, IPs, and attachment hashes

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy |
| Database | PostgreSQL (Supabase) |
| ML | scikit-learn, pandas, numpy, joblib |

## Project Structure

```
email-threat-detection/
├── frontend/          # React + TypeScript UI
├── backend/           # FastAPI application
├── ml/                # Machine learning pipeline
├── samples/           # Test email samples
├── docs/              # Project documentation
├── scripts/           # Development/maintenance scripts
├── .gitignore
├── README.md
└── LICENSE
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 15+

### Setup

Start the backend from `backend/` with `uvicorn app.main:app --reload` and the frontend from `frontend/` with `npm install; npm run dev`. Apply database migrations with `alembic upgrade head` from `backend/`.

#### Supabase database configuration

This project already reads `DATABASE_URL` from the environment and accepts a Supabase PostgreSQL connection string without extra code changes. Set one of the following in your backend environment:

```env
DATABASE_URL=postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres
# or
SUPABASE_DATABASE_URL=postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres
```

If you also want the Supabase client metadata available in the app, add:

```env
SUPABASE_URL=https://<PROJECT_REF>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

The backend will use the Supabase Postgres URL automatically when present. For local development the default remains SQLite unless you override it.

To train the current public-data model:

```powershell
python ml/training/train.py --dataset ml/datasets/real/public_email_threats.jsonl --artifact ml/models/email_threat_tfidf_logreg_public.joblib
```

The engine prefers that public artifact when present and falls back to the controlled artifact. Provider failures remain informational and do not reduce risk.

For production-style operation, run `python -m alembic upgrade head` from `backend/`, run `python -m app.services.analysis_worker --loop` under a process manager, and schedule `python -m app.services.retention` daily. The worker supports bounded retries through `ANALYSIS_MAX_ATTEMPTS` and reclaims stale locks after `ANALYSIS_STALE_MINUTES`.

## Development Phases

1. ✅ **Foundation** — Project structure and configuration
2. 🔲 **Basic Email Pipeline** — Upload, parse, display
3. 🔲 **Security Analysis** — Headers, auth, URLs, content
4. 🔲 **Detection Engine** — Rules, scoring, classification
5. 🔲 **Machine Learning** — Training and inference
6. 🔲 **Threat Intelligence** — External API integrations
7. 🔲 **Advanced Intelligence** — Fusion, BEC, impersonation, XAI
8. 🔄 **Production Operations** — Durable workers, migration rollout, SIH fixture validation, and deployment adapters

## License

MIT License — see [LICENSE](LICENSE) for details.
