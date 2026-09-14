# Graph Report - email-threat-detection  (2026-09-13)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1880 nodes · 4289 edges · 152 communities (88 shown, 19 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 383 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `626422e5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_header_forensics.py
- EmailParser
- routes/analysis.py
- time_stages.py
- useAuth
- AnalysisResult.tsx
- apiFetch
- User
- test_phase_coverage.py
- App.tsx
- GeoEnricher
- threatApi.ts
- inbox.py
- test_threat_intelligence.py
- threat_intelligence.py
- AttachmentAnalyzer
- EvidenceCorrelator
- AnalysisResult
- simulate.py
- index.ts
- models/analysis.py
- log_action
- test_real_world_validation.py
- routes/auth.py
- test_rbac_hardening.py
- react
- StageTimer
- test_auth.py
- ThreatIntelProvider
- MLClassifier
- SenderIntelligenceAnalyzer
- compilerOptions
- train.py
- dashboard.py
- test_ml_classifier.py
- PhishTankProvider
- reproduce_pipeline.py
- IOCExtractor
- frontend/package.json
- cases.py
- Dashboard.tsx
- AuthenticationAnalyzer
- test_phase2.py
- ThreatFoxService
- config.py
- devDependencies
- google_auth.py
- dispatch_analysis_alert
- session.py
- CaseTimelineBuilder
- Indicators.tsx
- evaluate_classifier
- ContentAnalyzer
- DNSIntelligenceService
- generate_blocklist
- dependencies
- import_public_email_corpus.py
- BertEmailClassifier
- EvidenceGraphBuilder
- URLIntelligence
- WHOISIntelligenceService
- Upgrade schema - empty as tables already exist.
- AbuseIPDBProvider
- main.py
- ThreatIndicator
- threats.py
- correlate_campaigns
- _HTMLDeceptionParser
- export_stix_bundle
- conftest.py
- is_ssrf_safe_ip
- india_threat_intel.py
- test_timeout_whois_is_cached_as_timeout_state
- import_spamassassin.py
- services
- services/email.py
- analyze_email
- test_api.py
- indicators.py
- test_google_auth.py
- eslint.config.js
- train_bert.py
- d15b09c60f7d_merge_auth_migration_heads.py
- pivot_ioc
- .enrich_all
- scripts
- predictor.py
- abuseipdb.py
- WHOISIntelligenceService
- package.json
- trained_model_path
- dashboard.ts
- vite-env.d.ts
- vite.config.ts
- analysis.ts
- frontend/vercel.json
- AnalysisResult
- Exception
- delete
- AsyncClient
- fixture
- BackgroundTasks
- BaseModel
- get
- post
- Response
- Session

## God Nodes (most connected - your core abstractions)
1. `AnalysisResult` - 65 edges
2. `EmailParser` - 45 edges
3. `User` - 44 edges
4. `_execute_analysis_pipeline()` - 44 edges
5. `run_stage_by_stage()` - 42 edges
6. `react` - 40 edges
7. `_run_pipeline()` - 38 edges
8. `apiFetch()` - 38 edges
9. `run_diagnostics()` - 37 edges
10. `test_file()` - 37 edges

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

## Communities (152 total, 19 thin omitted)

### Community 0 - "test_header_forensics.py"
Cohesion: 0.06
Nodes (60): _as_list(), _classify_ip(), _domain_relationship(), _extract_auth_domains(), _finding(), HeaderForensicsAnalyzer, _normalized_domain(), _parse_timestamp() (+52 more)

### Community 1 - "EmailParser"
Cohesion: 0.07
Nodes (46): _dedup_urls(), EmailParser, _extract_hrefs(), _extract_urls_from_text(), _HrefExtractor, _normalize_url(), _parse_address(), _parse_address_list() (+38 more)

### Community 2 - "routes/analysis.py"
Cohesion: 0.08
Nodes (53): _analysis_summary(), AnalysisCancelled, _as_utc(), _build_evidence_bundle(), cancel_analysis(), _completed_result(), export_analysis_blocklist(), export_analysis_bundle() (+45 more)

### Community 3 - "time_stages.py"
Cohesion: 0.10
Nodes (37): _execute_analysis_pipeline(), init_db(), get_ml_classifier(), Production ML inference for parsed emails. Inference is deliberately optional:…, Return the process-local classifier instance; never trains on request., Any, RuleEngine, EmailAnalysisSchema (+29 more)

### Community 4 - "useAuth"
Cohesion: 0.07
Nodes (27): ProtectedRoute(), RoleBasedSettings(), COLOR_MAP, DataStream, Particle, SecurityEnvironmentBackground, SecurityEnvironmentBackgroundProps, SecurityProfile (+19 more)

### Community 5 - "AnalysisResult.tsx"
Cohesion: 0.06
Nodes (29): Edge, EvidenceGraph(), EvidenceGraphProps, Node, ALL_TACTICS, MitreHeatmap(), MitreHeatmapProps, MitreTechnique (+21 more)

### Community 6 - "apiFetch"
Cohesion: 0.10
Nodes (36): MetricCard(), MetricCardProps, TacticalAlertBanner(), AnalyzeEmail(), DEMO_SCENARIOS, DemoScenario, InputMode, SCAN_STAGES (+28 more)

### Community 7 - "User"
Cohesion: 0.09
Nodes (29): get_current_user(), Session, require_admin(), require_analyst(), require_role(), require_user(), decode_access_token(), hash_password() (+21 more)

### Community 8 - "test_phase_coverage.py"
Cohesion: 0.08
Nodes (29): Any, Phase 6J/Phase 2: Hybrid Risk Scoring & Threat Fusion Engine. Deduplicated,…, Aggregate evidence via EvidenceCorrelator for consistent scoring., RiskEngine, MLClassifier, Phase 6I: Machine Learning Classifier Service. This module remains for…, Backward-compatible alias. Notes: - Signature keeps an optional ``model_path``…, ML Package for email classification. (+21 more)

### Community 9 - "App.tsx"
Cohesion: 0.09
Nodes (19): App(), AdminLayout(), AdminSidebar(), AuditLogs(), Case, CaseDetail(), Case, Cases() (+11 more)

### Community 10 - "GeoEnricher"
Cohesion: 0.12
Nodes (25): _enrich_ip(), get_live_threats(), _enrich_worker(), get, GeoEnricher, Any, AsyncClient, IP Geolocation Enrichment Service. Enriches public/routable IP addresses with… (+17 more)

### Community 11 - "threatApi.ts"
Cohesion: 0.12
Nodes (24): SeverityBadge(), SeverityBadgeProps, ThreatMap(), ThreatMapProps, formatDate(), LiveThreat(), ThreatDetail(), formatDate() (+16 more)

### Community 12 - "inbox.py"
Cohesion: 0.13
Nodes (30): _background_analysis_task(), _get_access_token(), _gmail_message(), _gmail_message_ids(), gmail_messages(), _gmail_raw_messages(), gmail_status(), gmail_sync() (+22 more)

### Community 13 - "test_threat_intelligence.py"
Cohesion: 0.16
Nodes (32): URLhaus URL lookup using the abuse.ch Auth-Key header., VirusTotal v3 object lookup; this never submits or uploads an indicator., URLhausProvider, VirusTotalProvider, asyncio, Unit tests for external threat intelligence providers with mocked responses., test_abuseipdb_mocked_request_and_response(), test_abuseipdb_no_key() (+24 more)

### Community 14 - "threat_intelligence.py"
Cohesion: 0.27
Nodes (15): AsyncClient, _abuse_result(), _configured(), _get_object(), _http_status(), _int(), _normalize_indicator(), Response (+7 more)

### Community 15 - "AttachmentAnalyzer"
Cohesion: 0.10
Nodes (21): AttachmentAnalyzer, Any, Phase 6G & Phase 9: Safe Attachment Static & Forensic Analysis. Inspects…, Analyze a list of email attachments statically and safely., Perform static token inspection on PDF byte streams., Inspect OOXML (docx, xlsx, pptx, etc.) packages statically via zipfile., Inspect archive safely bounded for decompression bombs and dangerous payloads., OCRIntelligenceService (+13 more)

### Community 16 - "EvidenceCorrelator"
Cohesion: 0.19
Nodes (19): CorrelationResult, EvidenceCorrelator, EvidenceRecord, Any, Phase 2: Evidence Correlation Module. Normalizes forensic findings from…, Normalized unit of evidence consumed by the risk scorer., Canonical normalization and correlation layer for forensic findings., test_evidence_correlation.py — Tests for Evidence Correlation & Normalization… (+11 more)

### Community 17 - "AnalysisResult"
Cohesion: 0.16
Nodes (26): AnalysisResult, AnalysisJob, Base, _as_utc(), _claim_job(), get_worker_health_snapshot(), main(), datetime (+18 more)

### Community 18 - "simulate.py"
Cohesion: 0.10
Nodes (25): get_certin_report(), BaseModel, get, post, Session, Run synthetic attack payload through the full analysis pipeline., Export one-click CERT-In compliant incident report., simulate_attack() (+17 more)

### Community 19 - "index.ts"
Cohesion: 0.14
Nodes (23): SystemHealth(), ThreatIntelligence(), Users(), activateUser(), authHeaders(), deactivateUser(), getAdminUsers(), getSystemHealth() (+15 more)

### Community 20 - "models/analysis.py"
Cohesion: 0.14
Nodes (17): analyze_batch(), batch_status(), _expand_upload(), get, post, Session, UploadFile, Batch email ingestion and queued analysis orchestration. (+9 more)

### Community 21 - "log_action"
Cohesion: 0.14
Nodes (22): activate_user(), deactivate_user(), delete_user(), get_user(), get_users(), BaseModel, delete, get (+14 more)

### Community 22 - "test_real_world_validation.py"
Cohesion: 0.10
Nodes (25): Phase 6K: Threat Reasoning Engine. Produces traceable, deterministic, SOC-grade…, Any, Real-world detection validation harness. Executes forensic detection validation…, Verify that a legitimate internal email with valid SPF/DKIM passes as benign., Verify that a legitimate billing email with a clean PDF attachment is benign., Verify detection of credential harvesting attack with urgency keywords and auth…, Verify detection of BEC / CEO wire transfer fraud., Verify detection of sender spoofing with hard SPF fail. (+17 more)

### Community 23 - "routes/auth.py"
Cohesion: 0.16
Nodes (19): login_user(), get, post, Session, User, read_current_user(), register_user(), resend_verification() (+11 more)

### Community 24 - "test_rbac_hardening.py"
Cohesion: 0.19
Nodes (20): AuditLog, Base, _auth(), _make_user(), test_admin_can_access_admin(), test_admin_list_no_password_hash(), test_can_delete_admin_when_two_exist(), test_can_demote_admin_when_two_exist() (+12 more)

### Community 25 - "react"
Cohesion: 0.12
Nodes (16): HeaderVisualizerProps, Hop, PanelProps, Toast, ToastContext, ToastContextType, ToastProvider(), ToastType (+8 more)

### Community 26 - "StageTimer"
Cohesion: 0.13
Nodes (17): _enrich_domain_record(), _lookup_whois(), Run DNS + WHOIS enrichment for one domain in parallel while capturing truthful…, Any, Reusable, analysis-scoped timing records for forensic pipeline stages., Yield a timer and finalize it as completed or failed on exit., Return a compact summary with slowest stage, total duration, provider success,…, Measure one pipeline stage without hiding stage failures. (+9 more)

### Community 27 - "test_auth.py"
Cohesion: 0.19
Nodes (22): create_access_token(), auth_header(), create_user(), login_user(), register_user(), test_admin_can_access_admin(), test_analyst_can_access_analyst(), test_correct_login_works() (+14 more)

### Community 28 - "ThreatIntelProvider"
Cohesion: 0.11
Nodes (13): AlienVaultOTXProvider, CertificateTransparencyProvider, CIRCLHashlookupProvider, GoogleSafeBrowsingProvider, HaveIBeenPwnedProvider, Google Safe Browsing v4 URL match lookup., AlienVault OTX pulse lookup for URL, domain, IP, and file hash context., Keyless registration and network allocation lookup via RDAP. (+5 more)

### Community 29 - "MLClassifier"
Cohesion: 0.12
Nodes (17): MLClassifier, Any, Load and run a pre-trained TF-IDF/logistic-regression artifact., Backward-compatible text prediction without inferred structure., Predict from parser output while retaining structural message signals., _unavailable(), 6. Test missing artifact path fails cleanly., 7. Test prediction output schema matches specification. (+9 more)

### Community 30 - "SenderIntelligenceAnalyzer"
Cohesion: 0.15
Nodes (15): _domain_matches_pattern(), _normalize_domain(), Any, Extract domain from address structure., Extract domain from list of addresses., Analyze relationships between sender identity fields., Analyze display name for spoofing indicators., Recognize legitimate ESP infrastructure. (+7 more)

### Community 31 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, allowSyntheticDefaultImports, baseUrl, esModuleInterop, isolatedModules, jsx, lib (+14 more)

### Community 32 - "train.py"
Cohesion: 0.16
Nodes (21): run_detailed(), get_mat(), run_experiments(), get_mat(), Any, Normalize a controlled JSONL record to the inference feature contract., record_to_features(), test_resolve_repo_path_returns_absolute_path_for_missing_repo_relative_file() (+13 more)

### Community 33 - "dashboard.py"
Cohesion: 0.15
Nodes (17): _as_utc(), get_dashboard_summary(), get_dashboard_trends(), Any, datetime, get, Session, Persisted analysis aggregations for the SOC dashboard. This route only… (+9 more)

### Community 34 - "test_ml_classifier.py"
Cohesion: 0.13
Nodes (19): _as_text(), email_to_features(), _get_html_text_ratio(), Any, Shared, non-circular feature preparation for the email ML classifier. The…, Convert parsed email fields into deterministic model input. ``email`` may be a…, Build compatible input for legacy ``predict(text)`` callers., text_to_features() (+11 more)

### Community 35 - "PhishTankProvider"
Cohesion: 0.14
Nodes (11): Any, Free Shodan InternetDB lookup without requiring an API key., ShodanInternetDBService, Any, Check if an IP is listed in common DNS-based blocklists., SpamhausDNSBLService, Check whether the IP belongs to a known TOR exit node., TorExitNodeChecker (+3 more)

### Community 36 - "reproduce_pipeline.py"
Cohesion: 0.12
Nodes (14): email_parser.py — Phase 6A: RFC/MIME forensic email parser. Extracts a…, Phase 10: Sender Identity Intelligence Service. Analyzes sender identity…, WHOIS intelligence lookup service., find_eml_files(), main(), Any, Exception, Path (+6 more)

### Community 37 - "IOCExtractor"
Cohesion: 0.22
Nodes (9): IOCExtractor, _add(), Any, Phase 6D: IOC Extraction Service. Extracts Indicators of Compromise from parsed…, Extract and deduplicate IOCs from all email components., _validate_ip(), test_ioc_extractor_comprehensive(), test_6d_authentication_field_labels_are_not_domains() (+1 more)

### Community 38 - "frontend/package.json"
Cohesion: 0.10
Nodes (20): name, private, type, version, autoprefixer, clsx, d3-geo, eslint (+12 more)

### Community 39 - "cases.py"
Cohesion: 0.25
Nodes (18): add_note(), CaseCreate, CaseNote, CaseUpdate, create_case(), get_case(), link_analysis(), LinkAnalysis (+10 more)

### Community 40 - "Dashboard.tsx"
Cohesion: 0.16
Nodes (15): useWebSocketAlerts(), AdminOverview(), Dashboard(), EMPTY_SUMMARY, formatDate(), tooltipStyle, DashboardSummary, DashboardTrends (+7 more)

### Community 41 - "AuthenticationAnalyzer"
Cohesion: 0.23
Nodes (9): AuthenticationAnalyzer, _get_org_domain(), Any, Phase 6C: Authentication Analysis Engine., Extract organizational domain (last two labels) safely., Normalize authentication evidence, calculate SPF/DKIM alignment, and produce an…, test_authentication_analyzer_basic(), test_6c_auth_analysis_comprehensive() (+1 more)

### Community 42 - "test_phase2.py"
Cohesion: 0.19
Nodes (15): Any, Optional independent SPF and DKIM verification., _unavailable(), verify_dkim(), verify_spf(), generate_forensic_pdf(), _lines(), _pdf_escape() (+7 more)

### Community 43 - "ThreatFoxService"
Cohesion: 0.18
Nodes (7): ThreatFoxService, _indicator(), Offline regression tests for the authenticated live threat feed., test_live_threats_enriches_public_ips(), test_live_threats_route_keeps_non_geolocated_events(), test_threatfox_live_adapter_normalizes_current_fields(), test_urlhaus_live_adapter_uses_get_and_handles_null_tags()

### Community 44 - "config.py"
Cohesion: 0.21
Nodes (5): Settings, URLhausService, ProviderResponse, main(), TypedDict

### Community 45 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+9 more)

### Community 46 - "google_auth.py"
Cohesion: 0.23
Nodes (14): google_callback(), google_exchange(), google_link_callback(), google_link_initiation(), google_login(), google_unlink(), get, post (+6 more)

### Community 47 - "dispatch_analysis_alert"
Cohesion: 0.17
Nodes (9): AlertConnectionManager, WebSocket, dispatch_analysis_alert(), Any, Bounded, privacy-aware alert delivery for high-risk analyses., Send a sanitized alert webhook when configured; never include raw email., asyncio, test_alert_dispatcher_does_not_send_benign_or_raw_email() (+1 more)

### Community 48 - "session.py"
Cohesion: 0.18
Nodes (10): health_check(), get, Session, worker_health(), _create_engine(), _normalize_database_url(), get_db(), Session (+2 more)

### Community 49 - "CaseTimelineBuilder"
Cohesion: 0.18
Nodes (9): CaseTimelineBuilder, Any, datetime, Builds a chronological timeline from email analysis data., Add inferred timing gap events where significant., Calculate total timeline span in seconds., Generate timeline summary statistics., Add an event to the timeline. (+1 more)

### Community 50 - "Indicators.tsx"
Cohesion: 0.19
Nodes (11): formatTimestamp(), IndicatorRow(), Indicators(), normalizeIocType(), normalizeSeverity(), ProviderStatus, WorkbenchIndicator, ThreatIndicator (+3 more)

### Community 51 - "evaluate_classifier"
Cohesion: 0.17
Nodes (9): Detailed evaluation script for candidates., evaluate_classifier(), Any, Evaluation helpers for the controlled email ML corpus., Return deterministic, JSON-serializable held-out classification metrics., Model experiments script comparing classifiers on the controlled dataset., Training-side feature helpers shared conceptually with backend inference., StubClassifier (+1 more)

### Community 52 - "ContentAnalyzer"
Cohesion: 0.24
Nodes (11): ContentAnalyzer, Any, Phase 6H & Phase 8: Safe Content, NLP, and HTML Forensics Analysis. Inspects…, Perform lexical, psychological, and safe structural HTML analysis., test_content_analyzer(), Test linguistic correlation., Test safe extraction of deceptive href vs visible text., test_bec_pattern() (+3 more)

### Community 53 - "DNSIntelligenceService"
Cohesion: 0.21
Nodes (8): _lookup_dns(), DNSIntelligenceService, Any, Phase 12: DNS Intelligence Service (Safe/Bounded)., Provides synchronous fallback for DNS enrichment., Execute a DNS query safely with timeouts., Execute a DNS query safely with timeouts using threading., Provides async DNS enrichment for a domain (A, MX, NS, TXT).

### Community 54 - "generate_blocklist"
Cohesion: 0.22
Nodes (10): generate_blocklist(), generate_queries(), Any, Phase 19: SOAR / Response Artifacts Service. Generates actionable defense…, Convenience function for blocklist generation., Convenience function for SIEM queries., Generates SOAR and SIEM artifacts from forensic analysis results., Generate CSV string containing all actionable threat indicators. (+2 more)

### Community 55 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, clsx, d3-geo, lucide-react, maplibre-gl, react, react-dom, react-router-dom (+5 more)

### Community 56 - "import_public_email_corpus.py"
Cohesion: 0.31
Nodes (11): _body_parts(), build_dataset(), load_enron(), append_message(), load_spamassassin(), main(), _normalize_record(), Any (+3 more)

### Community 57 - "BertEmailClassifier"
Cohesion: 0.27
Nodes (7): BertEmailClassifier, get_bert_classifier(), Any, Optional DistilBERT inference wrapper for email threat classification. The…, Load a DistilBERT model from the repository when dependencies are present., _unavailable(), Path

### Community 58 - "EvidenceGraphBuilder"
Cohesion: 0.24
Nodes (7): EvidenceGraphBuilder, Any, Builds an evidence relationship graph from analysis results., Generate graph summary statistics., Add a node to the graph, return its ID., Add an edge (relationship) between two nodes., Build evidence graph from analysis results.

### Community 59 - "URLIntelligence"
Cohesion: 0.27
Nodes (8): _get_org_domain(), Any, Phase 6E: URL Intelligence — offline URL analysis and enrichment., Extract registrable domain (best effort)., Analyze a single URL for suspicious characteristics deterministically., URLIntelligence, test_url_intelligence(), test_6e_url_intelligence()

### Community 60 - "WHOISIntelligenceService"
Cohesion: 0.32
Nodes (6): Any, Offline-friendly / Cached WHOIS enrichment via whoisxmlapi or similar provider., Clear cached records and provider health state for tests or revalidation., Fetch WHOIS data with one cold-start provider health probe., Perform one WHOIS request after cache and health checks., WHOISIntelligenceService

### Community 61 - "Upgrade schema - empty as tables already exist."
Cohesion: 0.18
Nodes (6): downgrade(), Downgrade schema - empty as tables exist., upgrade(), Upgrade schema - empty as tables already exist., upgrade(), upgrade()

### Community 62 - "AbuseIPDBProvider"
Cohesion: 0.18
Nodes (9): AbuseIPDBProvider, ThreatFox IOC lookup using the abuse.ch Auth-Key header., AbuseIPDB v2 IP reputation lookup., ThreatFoxProvider, asyncio, test_6f_abuseipdb_mocked(), test_6f_threatfox_mocked(), test_6f_urlhaus_mocked() (+1 more)

### Community 63 - "main.py"
Cohesion: 0.20
Nodes (8): list_audit_logs(), get, Session, List system and security audit logs., on_startup(), websocket, websocket_alerts(), on_event

### Community 64 - "ThreatIndicator"
Cohesion: 0.44
Nodes (6): Any, ThreatFusionService, BaseModel, ThreatIndicator, test_fusion_empty(), test_fusion_high_severity()

### Community 65 - "threats.py"
Cohesion: 0.31
Nodes (8): get_threat_by_id(), get_threat_intelligence_providers(), get_threats(), _probe_provider(), get, Session, Return live health probes for the providers used by the analysis engine., Fetch a single threat by its ID from external feeds or local DB.

### Community 66 - "correlate_campaigns"
Cohesion: 0.28
Nodes (7): CampaignCorrelator, correlate_campaigns(), Any, Phase 13: Campaign Correlation Service. Detects related analyses based on…, Convenience function for campaign correlation., Correlates analyses into campaigns based on shared indicators., Find related historical investigations based on indicator overlap.

### Community 67 - "_HTMLDeceptionParser"
Cohesion: 0.28
Nodes (3): _HTMLDeceptionParser, HTMLParser, Safely extracts potentially deceptive HTML; it never executes content.

### Community 68 - "export_stix_bundle"
Cohesion: 0.28
Nodes (7): export_stix_bundle(), Any, Phase 16: STIX 2.1 Exporter Service. Generates a valid STIX 2.1 bundle…, Exports an analysis record as a STIX 2.1 bundle., Generate STIX 2.1 JSON bundle from analysis result., Convenience function for STIX export., Stix21Exporter

### Community 69 - "conftest.py"
Cohesion: 0.31
Nodes (7): admin_only(), analyst_only(), db_session(), get, User, reset_database(), fixture

### Community 70 - "is_ssrf_safe_ip"
Cohesion: 0.29
Nodes (7): is_ssrf_safe_ip(), SSRF Protection and Private IP Guard. Prevents Server-Side Request Forgery by…, Validate whether an IP address is safe for outbound queries. Rejects: -…, Check if a URL destination is safe from SSRF., validate_outbound_url_ssrf(), IPv4Address, IPv6Address

### Community 71 - "india_threat_intel.py"
Cohesion: 0.29
Nodes (5): _check_ist_anomaly(), IndiaThreatIntel, Any, India-specific threat intelligence: brand impersonation, UPI/KYC scams, IST…, Returns True if date header exists but offset is NOT +0530.

### Community 72 - "test_timeout_whois_is_cached_as_timeout_state"
Cohesion: 0.29
Nodes (3): asyncio, test_timeout_whois_is_cached_as_timeout_state(), test_unauthorized_whois_is_cached_as_provider_state()

### Community 73 - "import_spamassassin.py"
Cohesion: 0.46
Nodes (7): _body_parts(), import_corpus(), main(), Any, Path, Import the public SpamAssassin corpus into the local training contract. Usage…, _record()

### Community 74 - "services"
Cohesion: 0.25
Nodes (7): root, framework, root, rewrites, services, backend, frontend

### Community 75 - "services/email.py"
Cohesion: 0.48
Nodes (4): ABC, EmailProvider, get_email_provider(), NullEmailProvider

### Community 76 - "analyze_email"
Cohesion: 0.33
Nodes (6): analyze_email(), BackgroundTasks, post, UploadFile, main(), UploadFile

### Community 78 - "indicators.py"
Cohesion: 0.47
Nodes (4): get_indicators(), get, Session, main()

### Community 79 - "test_google_auth.py"
Cohesion: 0.40
Nodes (5): fixture, patch, test_client(), test_google_callback_new_user(), test_google_login_initiation()

### Community 80 - "eslint.config.js"
Cohesion: 0.33
Nodes (5): @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, typescript-eslint

### Community 81 - "train_bert.py"
Cohesion: 0.40
Nodes (4): _iter_rows(), main(), Any, Fine-tune a lightweight DistilBERT classifier for phishing email detection.…

### Community 82 - "d15b09c60f7d_merge_auth_migration_heads.py"
Cohesion: 0.40
Nodes (4): downgrade(), Merge independent authentication schema branches., Restore the two independent migration heads., upgrade()

### Community 83 - "pivot_ioc"
Cohesion: 0.40
Nodes (4): pivot_ioc(), get, Session, Global search across all analyses to pivot on an IOC and find related threat…

### Community 84 - ".enrich_all"
Cohesion: 0.50
Nodes (3): Any, Prioritize high-value external lookups without changing local extraction., test_ioc_priority_prefers_infrastructure_and_threat_artifacts()

### Community 85 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 86 - "predictor.py"
Cohesion: 0.50
Nodes (4): main(), predict_text(), Lightweight CLI / demo helper for offline inference using the trained artifact., Predict category for arbitrary raw text using the default model.

### Community 89 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, @supabase/supabase-js, @supabase/supabase-js

### Community 99 - "trained_model_path"
Cohesion: 0.67
Nodes (3): fixture, Generate a clean model artifact in a temporary location for deterministic…, trained_model_path()

## Knowledge Gaps
- **144 isolated node(s):** `DashboardMetrics`, `SecurityLog`, `ImportMeta`, `ImportMetaEnv`, `EmailAnalysis` (+139 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 665 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AnalysisResult` connect `AnalysisResult` to `dashboard.py`, `routes/analysis.py`, `time_stages.py`, `threats.py`, `reproduce_pipeline.py`, `cases.py`, `inbox.py`, `test_api.py`, `indicators.py`, `simulate.py`, `pivot_ioc`, `models/analysis.py`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `_execute_analysis_pipeline()` connect `time_stages.py` to `test_header_forensics.py`, `EmailParser`, `routes/analysis.py`, `test_phase_coverage.py`, `GeoEnricher`, `inbox.py`, `AttachmentAnalyzer`, `AnalysisResult`, `simulate.py`, `StageTimer`, `SenderIntelligenceAnalyzer`, `IOCExtractor`, `AuthenticationAnalyzer`, `test_phase2.py`, `dispatch_analysis_alert`, `ContentAnalyzer`, `BertEmailClassifier`, `URLIntelligence`, `correlate_campaigns`, `india_threat_intel.py`, `analyze_email`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `EmailParser` connect `EmailParser` to `test_header_forensics.py`, `test_ml_classifier.py`, `time_stages.py`, `reproduce_pipeline.py`, `test_phase_coverage.py`, `test_real_world_validation.py`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 33 inferred relationships involving `AnalysisResult` (e.g. with `_analysis_summary()` and `cancel_analysis()`) actually correct?**
  _`AnalysisResult` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Are the 29 inferred relationships involving `EmailParser` (e.g. with `run_stage_by_stage()` and `test_extract_urls_deduplication()`) actually correct?**
  _`EmailParser` has 29 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `User` (e.g. with `get_current_user()` and `require_admin()`) actually correct?**
  _`User` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 10 inferred relationships involving `_execute_analysis_pipeline()` (e.g. with `get_ml_classifier()` and `correlate_campaigns()`) actually correct?**
  _`_execute_analysis_pipeline()` has 10 INFERRED edges - model-reasoned connections that need verification._