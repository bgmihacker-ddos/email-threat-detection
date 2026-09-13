# Graph Report - email-threat-detection  (2026-09-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1572 nodes · 3738 edges · 124 communities (74 shown, 8 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 328 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `55b22dbb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_threat_intelligence.py
- test_header_forensics.py
- EmailParser
- _execute_analysis_pipeline
- routes/analysis.py
- test_phase_coverage.py
- App.tsx
- AttachmentAnalyzer
- User
- EvidenceCorrelator
- analysisApi.ts
- index.ts
- StageTimer
- GeoEnricher
- threatApi.ts
- routes/auth.py
- test_real_world_validation.py
- SenderIntelligenceAnalyzer
- models/user.py
- Session
- google_auth.py
- test_auth.py
- reproduce_pipeline.py
- MLClassifier
- AnalysisResult
- compilerOptions
- train.py
- test_rbac_hardening.py
- test_ml_classifier.py
- package.json
- Dashboard.tsx
- AnalysisResult.tsx
- WHOISIntelligenceService
- main.py
- IOCExtractor
- hash_password
- lucide-react
- devDependencies
- UserLayout.tsx
- Indicators.tsx
- CaseTimelineBuilder
- evaluate_classifier
- config.py
- ThreatFoxService
- ContentAnalyzer
- AuthContext.tsx
- admin.py
- URLhausService
- generate_blocklist
- import_public_email_corpus.py
- dashboard.py
- EvidenceGraphBuilder
- dependencies
- Upgrade schema - empty as tables already exist.
- Any
- URLIntelligence
- ThreatIndicator
- analysis_worker.py
- DomainIntelligence
- threats.py
- dispatch_analysis_alert
- _HTMLDeceptionParser
- export_stix_bundle
- is_ssrf_safe_ip
- models/analysis.py
- import_spamassassin.py
- services
- services/email.py
- analyze_email
- test_google_auth.py
- eslint.config.js
- d15b09c60f7d_merge_auth_migration_heads.py
- scripts
- predictor.py
- abuseipdb.py
- WHOISIntelligenceService
- trained_model_path
- dashboard.ts
- vite-env.d.ts
- vite.config.ts
- analysis.ts
- frontend/vercel.json

## God Nodes (most connected - your core abstractions)
1. `User` - 54 edges
2. `_execute_analysis_pipeline()` - 49 edges
3. `AnalysisResult` - 48 edges
4. `EmailParser` - 47 edges
5. `run_stage_by_stage()` - 42 edges
6. `_run_pipeline()` - 38 edges
7. `run_diagnostics()` - 37 edges
8. `test_file()` - 37 edges
9. `react` - 30 edges
10. `HeaderForensicsAnalyzer` - 29 edges

## Surprising Connections (you probably didn't know these)
- `update_role_to_admin()` --uses--> `User`  [INFERRED]
  update_admin_role.py → backend/app/models/user.py
- `predict_text()` --uses--> `MLClassifier`  [INFERRED]
  ml/inference/predictor.py → backend/app/detection/ml_classifier.py
- `main()` --uses--> `ThreatFoxService`  [INFERRED]
  test_t.py → backend/app/integrations/threatfox.py
- `main()` --uses--> `URLhausService`  [INFERRED]
  test_t.py → backend/app/integrations/urlhaus.py
- `test_database_dependency_works()` --uses--> `User`  [INFERRED]
  backend/tests/test_auth.py → backend/app/models/user.py

## Import Cycles
- None detected.

## Communities (124 total, 8 thin omitted)

### Community 0 - "test_threat_intelligence.py"
Cohesion: 0.06
Nodes (63): _abuse_result(), AbuseIPDBProvider, AlienVaultOTXProvider, CertificateTransparencyProvider, CIRCLHashlookupProvider, _configured(), _get_object(), GoogleSafeBrowsingProvider (+55 more)

### Community 1 - "test_header_forensics.py"
Cohesion: 0.06
Nodes (60): _as_list(), _classify_ip(), _domain_relationship(), _extract_auth_domains(), _finding(), HeaderForensicsAnalyzer, _normalized_domain(), _parse_timestamp() (+52 more)

### Community 2 - "EmailParser"
Cohesion: 0.07
Nodes (46): _dedup_urls(), EmailParser, _extract_hrefs(), _extract_urls_from_text(), _HrefExtractor, _normalize_url(), _parse_address(), _parse_address_list() (+38 more)

### Community 3 - "_execute_analysis_pipeline"
Cohesion: 0.11
Nodes (36): _execute_analysis_pipeline(), get_ml_classifier(), Return the process-local classifier instance; never trains on request., Any, Aggregate evidence via EvidenceCorrelator for consistent scoring., RiskEngine, Any, RuleEngine (+28 more)

### Community 4 - "routes/analysis.py"
Cohesion: 0.08
Nodes (27): AnalysisCancelled, _background_analysis_task(), _persist_indicators(), Exception, _raise_if_cancelled(), Email analysis, persisted-analysis exploration, and forensic exports., Write normalized IOC candidates for indexed campaign lookups., Raised internally when an analysis is cancelled by an operator. (+19 more)

### Community 5 - "test_phase_coverage.py"
Cohesion: 0.11
Nodes (21): MLClassifier, Phase 6I: Machine Learning Classifier Service. This module remains for…, Backward-compatible alias. Notes: - Signature keeps an optional ``model_path``…, ML Package for email classification., AuthenticationAnalyzer, _get_org_domain(), Any, Phase 6C: Authentication Analysis Engine. (+13 more)

### Community 6 - "App.tsx"
Cohesion: 0.14
Nodes (20): App(), ProtectedRoute(), RoleBasedSettings(), AdminLayout(), AdminSidebar(), useAuth(), Toast, ToastContext (+12 more)

### Community 7 - "AttachmentAnalyzer"
Cohesion: 0.10
Nodes (21): AttachmentAnalyzer, Any, Phase 6G & Phase 9: Safe Attachment Static & Forensic Analysis. Inspects…, Analyze a list of email attachments statically and safely., Perform static token inspection on PDF byte streams., Inspect OOXML (docx, xlsx, pptx, etc.) packages statically via zipfile., Inspect archive safely bounded for decompression bombs and dangerous payloads., OCRIntelligenceService (+13 more)

### Community 8 - "User"
Cohesion: 0.11
Nodes (23): get_current_user(), Session, require_admin(), require_analyst(), require_role(), require_user(), decode_access_token(), _jwt_secret() (+15 more)

### Community 9 - "EvidenceCorrelator"
Cohesion: 0.20
Nodes (18): CorrelationResult, EvidenceCorrelator, EvidenceRecord, Any, Phase 2: Evidence Correlation Module. Normalizes forensic findings from…, Normalized unit of evidence consumed by the risk scorer., Canonical normalization and correlation layer for forensic findings., test_evidence_correlation.py — Tests for Evidence Correlation & Normalization… (+10 more)

### Community 10 - "analysisApi.ts"
Cohesion: 0.15
Nodes (23): SeverityBadge(), SeverityBadgeProps, safeDate(), Scans(), tone(), AnalyzeEmail(), SCAN_STAGES, EmailHistory() (+15 more)

### Community 11 - "index.ts"
Cohesion: 0.15
Nodes (24): SystemHealth(), ThreatIntelligence(), Users(), activateUser(), authHeaders(), deactivateUser(), getAdminUsers(), getSystemHealth() (+16 more)

### Community 12 - "StageTimer"
Cohesion: 0.10
Nodes (18): _enrich_domain_record(), _lookup_dns(), _lookup_whois(), Run DNS + WHOIS enrichment for one domain in parallel while capturing truthful…, Any, Execute a DNS query safely with timeouts using threading., Provides async DNS enrichment for a domain (A, MX, NS, TXT)., Any (+10 more)

### Community 13 - "GeoEnricher"
Cohesion: 0.15
Nodes (21): _enrich_ip(), get_live_threats(), _enrich_worker(), get, GeoEnricher, Any, AsyncClient, Resolve a public IP to a PTR name without blocking the event loop. (+13 more)

### Community 14 - "threatApi.ts"
Cohesion: 0.13
Nodes (20): ThreatMap(), ThreatMapProps, formatDate(), LiveThreat(), formatDate(), Threats(), getIndicators(), getLiveThreats() (+12 more)

### Community 15 - "routes/auth.py"
Cohesion: 0.16
Nodes (19): login_user(), get, post, Session, User, read_current_user(), register_user(), resend_verification() (+11 more)

### Community 16 - "test_real_world_validation.py"
Cohesion: 0.08
Nodes (22): Phase 6J/Phase 2: Hybrid Risk Scoring & Threat Fusion Engine. Deduplicated,…, Real-world detection validation harness. Executes forensic detection validation…, Verify that a legitimate internal email with valid SPF/DKIM passes as benign., Verify that a legitimate billing email with a clean PDF attachment is benign., Verify detection of credential harvesting attack with urgency keywords and auth…, Verify detection of BEC / CEO wire transfer fraud., Verify detection of sender spoofing with hard SPF fail., Verify detection of dangerous double extension / executable attachment. (+14 more)

### Community 17 - "SenderIntelligenceAnalyzer"
Cohesion: 0.14
Nodes (16): _domain_matches_pattern(), _normalize_domain(), Any, Phase 10: Sender Identity Intelligence Service. Analyzes sender identity…, Extract domain from address structure., Extract domain from list of addresses., Analyze relationships between sender identity fields., Analyze display name for spoofing indicators. (+8 more)

### Community 18 - "models/user.py"
Cohesion: 0.15
Nodes (13): AuditLog, Base, AuthAccount, Base, EmailVerificationToken, Base, auth_header(), fixture (+5 more)

### Community 19 - "Session"
Cohesion: 0.15
Nodes (24): cancel_analysis(), _completed_result(), export_analysis_blocklist(), export_analysis_html(), export_analysis_json(), export_analysis_queries(), export_analysis_stix(), get_analysis() (+16 more)

### Community 20 - "google_auth.py"
Cohesion: 0.14
Nodes (21): google_callback(), google_exchange(), google_link_callback(), google_link_initiation(), google_login(), google_unlink(), delete, get (+13 more)

### Community 21 - "test_auth.py"
Cohesion: 0.19
Nodes (22): create_access_token(), auth_header(), create_user(), login_user(), register_user(), test_admin_can_access_admin(), test_analyst_can_access_analyst(), test_correct_login_works() (+14 more)

### Community 22 - "reproduce_pipeline.py"
Cohesion: 0.11
Nodes (18): map_mitre_techniques(), MitreMapper, Any, Phase 15: MITRE ATT&CK Mapping Service. Maps observed forensic evidence to…, Convenience function for MITRE mapping., Maps forensic evidence to MITRE ATT&CK techniques., Map analysis result to MITRE ATT&CK techniques., find_eml_files() (+10 more)

### Community 23 - "MLClassifier"
Cohesion: 0.12
Nodes (17): MLClassifier, Any, Load and run a pre-trained TF-IDF/logistic-regression artifact., Backward-compatible text prediction without inferred structure., Predict from parser output while retaining structural message signals., _unavailable(), 6. Test missing artifact path fails cleanly., 7. Test prediction output schema matches specification. (+9 more)

### Community 24 - "AnalysisResult"
Cohesion: 0.21
Nodes (19): AnalysisResult, AnalysisIndicator, AnalysisJob, Base, Base, _claim_job(), Accept only safe lifecycle transitions for persisted analysis records., _update_job_status() (+11 more)

### Community 25 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, allowSyntheticDefaultImports, baseUrl, esModuleInterop, isolatedModules, jsx, lib (+14 more)

### Community 26 - "train.py"
Cohesion: 0.16
Nodes (21): run_detailed(), get_mat(), run_experiments(), get_mat(), Any, Normalize a controlled JSONL record to the inference feature contract., record_to_features(), test_resolve_repo_path_returns_absolute_path_for_missing_repo_relative_file() (+13 more)

### Community 27 - "test_rbac_hardening.py"
Cohesion: 0.22
Nodes (18): _auth(), _make_user(), test_admin_can_access_admin(), test_admin_list_no_password_hash(), test_can_delete_admin_when_two_exist(), test_can_demote_admin_when_two_exist(), test_cannot_deactivate_last_admin(), test_cannot_delete_last_admin() (+10 more)

### Community 28 - "test_ml_classifier.py"
Cohesion: 0.13
Nodes (19): _as_text(), email_to_features(), _get_html_text_ratio(), Any, Shared, non-circular feature preparation for the email ML classifier. The…, Convert parsed email fields into deterministic model input. ``email`` may be a…, Build compatible input for legacy ``predict(text)`` callers., text_to_features() (+11 more)

### Community 29 - "package.json"
Cohesion: 0.10
Nodes (20): name, private, type, version, autoprefixer, clsx, d3-geo, eslint (+12 more)

### Community 30 - "Dashboard.tsx"
Cohesion: 0.15
Nodes (15): MetricCard(), MetricCardProps, AdminOverview(), Dashboard(), EMPTY_SUMMARY, formatDate(), tooltipStyle, DashboardSummary (+7 more)

### Community 31 - "AnalysisResult.tsx"
Cohesion: 0.14
Nodes (11): AnalysisResult(), authTone(), displayVerdict(), extractedIocs(), firstRecipient(), formatDate(), RecordValue, slug() (+3 more)

### Community 32 - "WHOISIntelligenceService"
Cohesion: 0.17
Nodes (9): Any, Offline-friendly / Cached WHOIS enrichment via whoisxmlapi or similar provider., Clear cached records and provider health state for tests or revalidation., Fetch WHOIS data with one cold-start provider health probe., Perform one WHOIS request after cache and health checks., WHOISIntelligenceService, asyncio, test_timeout_whois_is_cached_as_timeout_state() (+1 more)

### Community 33 - "main.py"
Cohesion: 0.15
Nodes (13): health_check(), get, Session, worker_health(), _create_engine(), _normalize_database_url(), init_db(), get_db() (+5 more)

### Community 34 - "IOCExtractor"
Cohesion: 0.25
Nodes (8): IOCExtractor, _add(), Any, Extract and deduplicate IOCs from all email components., _validate_ip(), test_ioc_extractor_comprehensive(), test_6d_authentication_field_labels_are_not_domains(), test_6d_ioc_extractor()

### Community 35 - "hash_password"
Cohesion: 0.20
Nodes (11): forgot_password(), post, Session, reset_password(), hash_password(), PasswordResetToken, Base, PasswordResetRequest (+3 more)

### Community 36 - "lucide-react"
Cohesion: 0.16
Nodes (8): PanelProps, Sidebar(), TopBar(), AuditLogs(), authHeaders(), globalSearch(), SearchResult, lucide-react

### Community 37 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+9 more)

### Community 38 - "UserLayout.tsx"
Cohesion: 0.14
Nodes (9): COLOR_MAP, DataStream, Particle, SecurityEnvironmentBackground, SecurityEnvironmentBackgroundProps, SecurityProfile, ThreatLevel, UserLayout() (+1 more)

### Community 39 - "Indicators.tsx"
Cohesion: 0.18
Nodes (12): formatTimestamp(), IndicatorRow(), Indicators(), normalizeIocType(), normalizeSeverity(), ProviderStatus, WorkbenchIndicator, searchPersistedIocs() (+4 more)

### Community 40 - "CaseTimelineBuilder"
Cohesion: 0.18
Nodes (9): CaseTimelineBuilder, Any, datetime, Builds a chronological timeline from email analysis data., Add inferred timing gap events where significant., Calculate total timeline span in seconds., Generate timeline summary statistics., Add an event to the timeline. (+1 more)

### Community 41 - "evaluate_classifier"
Cohesion: 0.17
Nodes (9): Detailed evaluation script for candidates., evaluate_classifier(), Any, Evaluation helpers for the controlled email ML corpus., Return deterministic, JSON-serializable held-out classification metrics., Model experiments script comparing classifiers on the controlled dataset., Training-side feature helpers shared conceptually with backend inference., StubClassifier (+1 more)

### Community 42 - "config.py"
Cohesion: 0.22
Nodes (5): Settings, ProviderResponse, IP Geolocation Enrichment Service. Enriches public/routable IP addresses with…, main(), TypedDict

### Community 43 - "ThreatFoxService"
Cohesion: 0.24
Nodes (6): ThreatFoxService, _indicator(), Offline regression tests for the authenticated live threat feed., test_live_threats_enriches_public_ips(), test_live_threats_route_keeps_non_geolocated_events(), test_threatfox_live_adapter_normalizes_current_fields()

### Community 44 - "ContentAnalyzer"
Cohesion: 0.24
Nodes (11): ContentAnalyzer, Any, Phase 6H & Phase 8: Safe Content, NLP, and HTML Forensics Analysis. Inspects…, Perform lexical, psychological, and safe structural HTML analysis., test_content_analyzer(), Test linguistic correlation., Test safe extraction of deceptive href vs visible text., test_bec_pattern() (+3 more)

### Community 45 - "AuthContext.tsx"
Cohesion: 0.21
Nodes (10): AuthContext, AuthContextType, AuthProvider(), BASE_URL, configuredBaseUrl, AuthApi, LoginResponse, AuthState (+2 more)

### Community 46 - "admin.py"
Cohesion: 0.27
Nodes (12): activate_user(), deactivate_user(), delete_user(), get_user(), get_users(), BaseModel, delete, get (+4 more)

### Community 47 - "URLhausService"
Cohesion: 0.22
Nodes (6): get_indicators(), get, Session, URLhausService, test_urlhaus_live_adapter_uses_get_and_handles_null_tags(), main()

### Community 48 - "generate_blocklist"
Cohesion: 0.22
Nodes (10): generate_blocklist(), generate_queries(), Any, Phase 19: SOAR / Response Artifacts Service. Generates actionable defense…, Convenience function for blocklist generation., Convenience function for SIEM queries., Generates SOAR and SIEM artifacts from forensic analysis results., Generate CSV string containing all actionable threat indicators. (+2 more)

### Community 49 - "import_public_email_corpus.py"
Cohesion: 0.31
Nodes (11): _body_parts(), build_dataset(), load_enron(), append_message(), load_spamassassin(), main(), _normalize_record(), Any (+3 more)

### Community 50 - "dashboard.py"
Cohesion: 0.23
Nodes (11): _as_utc(), get_dashboard_summary(), Any, datetime, get, Session, Persisted analysis aggregations for the SOC dashboard. This route only…, Normalize SQLite's naive timestamps and aware database timestamps. (+3 more)

### Community 51 - "EvidenceGraphBuilder"
Cohesion: 0.24
Nodes (7): EvidenceGraphBuilder, Any, Builds an evidence relationship graph from analysis results., Generate graph summary statistics., Add a node to the graph, return its ID., Add an edge (relationship) between two nodes., Build evidence graph from analysis results.

### Community 52 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, clsx, d3-geo, lucide-react, maplibre-gl, react, react-dom, react-router-dom (+4 more)

### Community 53 - "Upgrade schema - empty as tables already exist."
Cohesion: 0.18
Nodes (6): downgrade(), Downgrade schema - empty as tables exist., upgrade(), Upgrade schema - empty as tables already exist., upgrade(), upgrade()

### Community 54 - "Any"
Cohesion: 0.24
Nodes (11): _analysis_summary(), _as_utc(), _indexed_campaign_candidates(), Any, datetime, Render a printable, escaped forensic report with no client-side script., Search IOCs observed in persisted local analyses without external lookups., Create a list-safe summary without exposing raw message content. (+3 more)

### Community 55 - "URLIntelligence"
Cohesion: 0.27
Nodes (8): _get_org_domain(), Any, Phase 6E: URL Intelligence — offline URL analysis and enrichment., Extract registrable domain (best effort)., Analyze a single URL for suspicious characteristics deterministically., URLIntelligence, test_url_intelligence(), test_6e_url_intelligence()

### Community 56 - "ThreatIndicator"
Cohesion: 0.44
Nodes (6): Any, ThreatFusionService, BaseModel, ThreatIndicator, test_fusion_empty(), test_fusion_high_severity()

### Community 57 - "analysis_worker.py"
Cohesion: 0.31
Nodes (9): _as_utc(), get_worker_health_snapshot(), main(), datetime, Session, Database-backed analysis worker entry point. Run one bounded pass with ``python…, Return a compact worker health snapshot with queue, worker, and stale-job…, run_loop() (+1 more)

### Community 58 - "DomainIntelligence"
Cohesion: 0.29
Nodes (8): DomainIntelligence, _get_org_domain(), Any, Phase 6E: Domain Intelligence — lexical and offline domain analysis., Analyze a domain name lexically and query optional DNS records safely., _shannon_entropy(), test_domain_intelligence(), test_6e_domain_intelligence_offline()

### Community 59 - "threats.py"
Cohesion: 0.31
Nodes (8): get_threat_by_id(), get_threat_intelligence_providers(), get_threats(), _probe_provider(), get, Session, Return live health probes for the providers used by the analysis engine., Fetch a single threat by its ID from external feeds or local DB.

### Community 60 - "dispatch_analysis_alert"
Cohesion: 0.33
Nodes (7): dispatch_analysis_alert(), Any, Bounded, privacy-aware alert delivery for high-risk analyses., Send a sanitized alert webhook when configured; never include raw email., asyncio, test_alert_dispatcher_does_not_send_benign_or_raw_email(), test_alert_dispatcher_sends_sanitized_high_risk_payload()

### Community 61 - "_HTMLDeceptionParser"
Cohesion: 0.28
Nodes (3): _HTMLDeceptionParser, HTMLParser, Safely extracts potentially deceptive HTML; it never executes content.

### Community 62 - "export_stix_bundle"
Cohesion: 0.28
Nodes (7): export_stix_bundle(), Any, Phase 16: STIX 2.1 Exporter Service. Generates a valid STIX 2.1 bundle…, Exports an analysis record as a STIX 2.1 bundle., Generate STIX 2.1 JSON bundle from analysis result., Convenience function for STIX export., Stix21Exporter

### Community 63 - "is_ssrf_safe_ip"
Cohesion: 0.29
Nodes (7): is_ssrf_safe_ip(), SSRF Protection and Private IP Guard. Prevents Server-Side Request Forgery by…, Validate whether an IP address is safe for outbound queries. Rejects: -…, Check if a URL destination is safe from SSRF., validate_outbound_url_ssrf(), IPv4Address, IPv6Address

### Community 65 - "import_spamassassin.py"
Cohesion: 0.46
Nodes (7): _body_parts(), import_corpus(), main(), Any, Path, Import the public SpamAssassin corpus into the local training contract. Usage…, _record()

### Community 66 - "services"
Cohesion: 0.25
Nodes (7): root, framework, root, rewrites, services, backend, frontend

### Community 67 - "services/email.py"
Cohesion: 0.48
Nodes (4): ABC, EmailProvider, get_email_provider(), NullEmailProvider

### Community 68 - "analyze_email"
Cohesion: 0.47
Nodes (5): analyze_email(), post, main(), BackgroundTasks, UploadFile

### Community 69 - "test_google_auth.py"
Cohesion: 0.40
Nodes (5): fixture, patch, test_client(), test_google_callback_new_user(), test_google_login_initiation()

### Community 70 - "eslint.config.js"
Cohesion: 0.33
Nodes (5): @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, typescript-eslint

### Community 71 - "d15b09c60f7d_merge_auth_migration_heads.py"
Cohesion: 0.40
Nodes (4): downgrade(), Merge independent authentication schema branches., Restore the two independent migration heads., upgrade()

### Community 72 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 73 - "predictor.py"
Cohesion: 0.50
Nodes (4): main(), predict_text(), Lightweight CLI / demo helper for offline inference using the trained artifact., Predict category for arbitrary raw text using the default model.

### Community 82 - "trained_model_path"
Cohesion: 0.67
Nodes (3): fixture, Generate a clean model artifact in a temporary location for deterministic…, trained_model_path()

## Knowledge Gaps
- **121 isolated node(s):** `AnalysisStatus`, `AuditLogRecord`, `AuthState`, `EmailScanRecord`, `IOCType` (+116 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 556 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AnalysisResult` connect `AnalysisResult` to `models/analysis.py`, `_execute_analysis_pipeline`, `routes/analysis.py`, `URLhausService`, `models/user.py`, `Session`, `dashboard.py`, `Any`, `reproduce_pipeline.py`, `analysis_worker.py`, `threats.py`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `EmailParser` connect `EmailParser` to `test_header_forensics.py`, `_execute_analysis_pipeline`, `routes/analysis.py`, `test_phase_coverage.py`, `test_real_world_validation.py`, `reproduce_pipeline.py`, `test_ml_classifier.py`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `_execute_analysis_pipeline()` connect `_execute_analysis_pipeline` to `test_header_forensics.py`, `EmailParser`, `routes/analysis.py`, `test_phase_coverage.py`, `AttachmentAnalyzer`, `StageTimer`, `GeoEnricher`, `SenderIntelligenceAnalyzer`, `Session`, `reproduce_pipeline.py`, `AnalysisResult`, `IOCExtractor`, `ContentAnalyzer`, `Any`, `URLIntelligence`, `analysis_worker.py`, `DomainIntelligence`, `dispatch_analysis_alert`, `analyze_email`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 34 inferred relationships involving `User` (e.g. with `get_current_user()` and `require_admin()`) actually correct?**
  _`User` has 34 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `_execute_analysis_pipeline()` (e.g. with `RiskEngine` and `RuleEngine`) actually correct?**
  _`_execute_analysis_pipeline()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 22 inferred relationships involving `AnalysisResult` (e.g. with `_analysis_summary()` and `cancel_analysis()`) actually correct?**
  _`AnalysisResult` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 30 inferred relationships involving `EmailParser` (e.g. with `_execute_analysis_pipeline()` and `run_stage_by_stage()`) actually correct?**
  _`EmailParser` has 30 INFERRED edges - model-reasoned connections that need verification._