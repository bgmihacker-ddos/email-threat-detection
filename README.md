# Email Threat Detection & Intelligence Platform

> SIH 2026 — AI-Powered Email Security Analysis

A production-oriented email security platform that analyzes emails to identify phishing, spam, Business Email Compromise (BEC), credential harvesting, malware indicators, sender spoofing, brand impersonation, suspicious URLs, malicious domains, and authentication failures.

## Features (Planned)

- **Email Parsing** — Extract and structure email components
- **Header Analysis** — Analyze sender metadata and routing
- **SPF/DKIM/DMARC Analysis** — Email authentication verification
- **URL & Domain Analysis** — Detect suspicious links and domains
- **Content Analysis** — NLP-based social engineering detection
- **Rule-Based Detection** — Deterministic security rules
- **Machine Learning** — ML-powered threat classification
- **Threat Intelligence** — External feed integration (VirusTotal, URLhaus, AbuseIPDB)
- **Threat Fusion** — Unified multi-source threat assessment
- **Risk Scoring** — Quantified threat severity
- **Explainable AI** — Human-readable detection rationale
- **IOC Extraction** — Indicators of Compromise identification
- **BEC Detection** — Business Email Compromise analysis
- **Brand Impersonation Detection** — Typosquatting and homoglyph detection
- **Security Dashboard** — Real-time threat analytics and visualization

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

Instructions will be added as the project develops.

## Development Phases

1. ✅ **Foundation** — Project structure and configuration
2. 🔲 **Basic Email Pipeline** — Upload, parse, display
3. 🔲 **Security Analysis** — Headers, auth, URLs, content
4. 🔲 **Detection Engine** — Rules, scoring, classification
5. 🔲 **Machine Learning** — Training and inference
6. 🔲 **Threat Intelligence** — External API integrations
7. 🔲 **Advanced Intelligence** — Fusion, BEC, impersonation, XAI
8. 🔲 **Production Polish** — Dashboard, deployment, documentation

## License

MIT License — see [LICENSE](LICENSE) for details.
