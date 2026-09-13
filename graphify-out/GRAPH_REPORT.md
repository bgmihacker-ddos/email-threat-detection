# Graph Report - email-threat-detection  (2026-09-13)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1637 nodes · 3796 edges · 136 communities (82 shown, 11 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 315 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b4a1c52f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_rbac_hardening.py
- test_header_forensics.py
- EmailParser
- reproduce_pipeline.py
- App.tsx
- hash_password
- GeoEnricher
- EvidenceCorrelator
- AttachmentAnalyzer
- test_phase_coverage.py
- test_threat_intelligence.py
- analysisApi.ts
- index.ts
- threatApi.ts
- session.py
- MLClassifier
- AnalysisResult.tsx
- test_real_world_validation.py
- StageTimer
- routes/auth.py
- test_auth.py
- _result
- SenderIntelligenceAnalyzer
- compilerOptions
- train.py
- TorExitNodeChecker
- ThreatIntelProvider
- google_auth.py
- test_ml_classifier.py
- IOCExtractor
- Dashboard.tsx
- routes/analysis.py
- package.json
- User
- _completed_result
- AuthenticationAnalyzer
- WHOISIntelligenceService
- lucide-react
- _execute_analysis_pipeline
- ThreatFoxService
- URLhausService
- devDependencies
- UserLayout.tsx
- Indicators.tsx
- config.py
- CaseTimelineBuilder
- evaluate_classifier
- main.py
- ContentAnalyzer
- AuthContext.tsx
- generate_blocklist
- run_http_endpoint_test
- import_public_email_corpus.py
- EvidenceGraphBuilder
- URLIntelligence
- dependencies
- Upgrade schema - empty as tables already exist.
- DNSIntelligenceService
- test_google_link_unlink.py
- ThreatIndicator
- test_phase2.py
- threats.py
- MLClassifier
- dispatch_analysis_alert
- _HTMLDeceptionParser
- generate_forensic_pdf
- export_stix_bundle
- threat_intelligence.py
- is_ssrf_safe_ip
- AbuseIPDBProvider
- services
- services/email.py
- indicators.py
- test_google_auth.py
- eslint.config.js
- d15b09c60f7d_merge_auth_migration_heads.py
- .correlate_analysis
- .map_evidence
- .enrich_all
- scripts
- predictor.py
- trained_model_path
- dashboard.ts
- vite-env.d.ts
- vite.config.ts
- analysis.ts
- frontend/vercel.json
- datetime
- Exception
- get
- post
- Session
- BaseModel

## God Nodes (most connected - your core abstractions)
1. `User` - 54 edges
2. `EmailParser` - 45 edges
3. `run_stage_by_stage()` - 42 edges
4. `_execute_analysis_pipeline()` - 39 edges
5. `_run_pipeline()` - 38 edges
6. `run_diagnostics()` - 37 edges
7. `test_file()` - 37 edges
8. `react` - 31 edges
9. `analyze()` - 29 edges
10. `AnalysisResult` - 28 edges

## Surprising Connections (you probably didn't know these)
- `update_role_to_admin()` --uses--> `User`  [INFERRED]
  update_admin_role.py → backend/app/models/user.py
- `predict_text()` --uses--> `MLClassifier`  [INFERRED]
  ml/inference/predictor.py → backend/app/detection/ml_classifier.py
- `create_admin()` --uses--> `User`  [INFERRED]
  create_admin.py → backend/app/models/user.py
- `main()` --uses--> `ThreatFoxService`  [INFERRED]
  test_t.py → backend/app/integrations/threatfox.py
- `require_user()` --uses--> `User`  [INFERRED]
  backend/app/api/dependencies.py → backend/app/models/user.py

## Import Cycles
- None detected.

## Communities (136 total, 11 thin omitted)

### Community 0 - "test_rbac_hardening.py"
Cohesion: 0.06
Nodes (59): _as_utc(), get_dashboard_summary(), Any, datetime, get, Session, Persisted analysis aggregations for the SOC dashboard. This route only…, Normalize SQLite's naive timestamps and aware database timestamps. (+51 more)

### Community 1 - "test_header_forensics.py"
Cohesion: 0.06
Nodes (60): _as_list(), _classify_ip(), _domain_relationship(), _extract_auth_domains(), _finding(), HeaderForensicsAnalyzer, _normalized_domain(), _parse_timestamp() (+52 more)

### Community 2 - "EmailParser"
Cohesion: 0.06
Nodes (52): _dedup_urls(), EmailParser, _extract_hrefs(), _extract_urls_from_text(), _HrefExtractor, _normalize_url(), _parse_address(), _parse_address_list() (+44 more)

### Community 3 - "reproduce_pipeline.py"
Cohesion: 0.10
Nodes (36): get_ml_classifier(), Return the process-local classifier instance; never trains on request., Any, RuleEngine, AttackChainReconstruction, Any, Phase 6L: Attack Chain Reconstruction Engine. Reconstructs evidence-bounded…, Reconstruct observable threat execution stages with clear evidence attribution. (+28 more)

### Community 4 - "App.tsx"
Cohesion: 0.14
Nodes (20): App(), ProtectedRoute(), RoleBasedSettings(), AdminLayout(), AdminSidebar(), useAuth(), Toast, ToastContext (+12 more)

### Community 5 - "hash_password"
Cohesion: 0.11
Nodes (21): get_current_user(), Session, forgot_password(), post, Session, reset_password(), decode_access_token(), hash_password() (+13 more)

### Community 6 - "GeoEnricher"
Cohesion: 0.13
Nodes (23): _enrich_ip(), GeoEnricher, Any, AsyncClient, IP Geolocation Enrichment Service. Enriches public/routable IP addresses with…, Resolve a public IP to a PTR name without blocking the event loop., Extract valid public IP from raw indicator string (e.g. ip:port, URL, or pure…, Return True if the string is a valid public, routable IP address. (+15 more)

### Community 7 - "EvidenceCorrelator"
Cohesion: 0.19
Nodes (19): CorrelationResult, EvidenceCorrelator, EvidenceRecord, Any, Phase 2: Evidence Correlation Module. Normalizes forensic findings from…, Normalized unit of evidence consumed by the risk scorer., Canonical normalization and correlation layer for forensic findings., test_evidence_correlation.py — Tests for Evidence Correlation & Normalization… (+11 more)

### Community 8 - "AttachmentAnalyzer"
Cohesion: 0.10
Nodes (21): AttachmentAnalyzer, Any, Phase 6G & Phase 9: Safe Attachment Static & Forensic Analysis. Inspects…, Analyze a list of email attachments statically and safely., Perform static token inspection on PDF byte streams., Inspect OOXML (docx, xlsx, pptx, etc.) packages statically via zipfile., Inspect archive safely bounded for decompression bombs and dangerous payloads., OCRIntelligenceService (+13 more)

### Community 9 - "test_phase_coverage.py"
Cohesion: 0.12
Nodes (22): Any, Phase 6J/Phase 2: Hybrid Risk Scoring & Threat Fusion Engine. Deduplicated,…, Aggregate evidence via EvidenceCorrelator for consistent scoring., RiskEngine, DomainIntelligence, _get_org_domain(), Any, Phase 6E: Domain Intelligence — lexical and offline domain analysis. (+14 more)

### Community 10 - "test_threat_intelligence.py"
Cohesion: 0.15
Nodes (28): URLhaus URL lookup using the abuse.ch Auth-Key header., VirusTotal v3 object lookup; this never submits or uploads an indicator., URLhausProvider, VirusTotalProvider, asyncio, Unit tests for external threat intelligence providers with mocked responses., test_abuseipdb_mocked_request_and_response(), test_abuseipdb_no_key() (+20 more)

### Community 11 - "analysisApi.ts"
Cohesion: 0.15
Nodes (23): SeverityBadge(), SeverityBadgeProps, safeDate(), Scans(), tone(), AnalyzeEmail(), SCAN_STAGES, EmailHistory() (+15 more)

### Community 12 - "index.ts"
Cohesion: 0.15
Nodes (24): SystemHealth(), ThreatIntelligence(), Users(), activateUser(), authHeaders(), deactivateUser(), getAdminUsers(), getSystemHealth() (+16 more)

### Community 13 - "threatApi.ts"
Cohesion: 0.13
Nodes (20): ThreatMap(), ThreatMapProps, formatDate(), LiveThreat(), formatDate(), Threats(), getIndicators(), getLiveThreats() (+12 more)

### Community 14 - "session.py"
Cohesion: 0.12
Nodes (16): require_admin(), require_analyst(), require_role(), require_user(), _create_engine(), _normalize_database_url(), get_db(), Session (+8 more)

### Community 15 - "MLClassifier"
Cohesion: 0.10
Nodes (21): MLClassifier, Any, Load and run a pre-trained TF-IDF/logistic-regression artifact., Backward-compatible text prediction without inferred structure., Predict from parser output while retaining structural message signals., _unavailable(), 5. Test corrupted artifact fails closed without raising exceptions., 7. Test prediction output schema matches specification. (+13 more)

### Community 16 - "AnalysisResult.tsx"
Cohesion: 0.11
Nodes (15): escapeHtml(), RelayHop, RelayPathMap(), AnalysisResult(), authTone(), displayVerdict(), extractedIocs(), firstRecipient() (+7 more)

### Community 17 - "test_real_world_validation.py"
Cohesion: 0.11
Nodes (24): Any, Real-world detection validation harness. Executes forensic detection validation…, Verify that a legitimate internal email with valid SPF/DKIM passes as benign., Verify that a legitimate billing email with a clean PDF attachment is benign., Verify detection of credential harvesting attack with urgency keywords and auth…, Verify detection of BEC / CEO wire transfer fraud., Verify detection of sender spoofing with hard SPF fail., Verify detection of dangerous double extension / executable attachment. (+16 more)

### Community 18 - "StageTimer"
Cohesion: 0.13
Nodes (17): _enrich_domain_record(), _lookup_whois(), Run DNS + WHOIS enrichment for one domain in parallel while capturing truthful…, Any, Reusable, analysis-scoped timing records for forensic pipeline stages., Yield a timer and finalize it as completed or failed on exit., Return a compact summary with slowest stage, total duration, provider success,…, Measure one pipeline stage without hiding stage failures. (+9 more)

### Community 19 - "routes/auth.py"
Cohesion: 0.16
Nodes (18): login_user(), get, post, Session, User, read_current_user(), register_user(), resend_verification() (+10 more)

### Community 20 - "test_auth.py"
Cohesion: 0.19
Nodes (22): create_access_token(), auth_header(), create_user(), login_user(), register_user(), test_admin_can_access_admin(), test_analyst_can_access_analyst(), test_correct_login_works() (+14 more)

### Community 21 - "_result"
Cohesion: 0.32
Nodes (7): _configured(), _normalize_indicator(), AsyncClient, Trip circuit breaker for providers on unauthorized or persistent errors., _result(), skipped_result(), ProviderResult

### Community 22 - "SenderIntelligenceAnalyzer"
Cohesion: 0.15
Nodes (15): _domain_matches_pattern(), _normalize_domain(), Any, Extract domain from address structure., Extract domain from list of addresses., Analyze relationships between sender identity fields., Analyze display name for spoofing indicators., Recognize legitimate ESP infrastructure. (+7 more)

### Community 23 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, allowSyntheticDefaultImports, baseUrl, esModuleInterop, isolatedModules, jsx, lib (+14 more)

### Community 24 - "train.py"
Cohesion: 0.16
Nodes (21): run_detailed(), get_mat(), run_experiments(), get_mat(), Any, Normalize a controlled JSONL record to the inference feature contract., record_to_features(), test_resolve_repo_path_returns_absolute_path_for_missing_repo_relative_file() (+13 more)

### Community 25 - "TorExitNodeChecker"
Cohesion: 0.14
Nodes (12): Any, Free Shodan InternetDB lookup without requiring an API key., ShodanInternetDBService, Any, Check if an IP is listed in common DNS-based blocklists., SpamhausDNSBLService, Check whether the IP belongs to a known TOR exit node., TorExitNodeChecker (+4 more)

### Community 26 - "ThreatIntelProvider"
Cohesion: 0.12
Nodes (13): AlienVaultOTXProvider, CertificateTransparencyProvider, CIRCLHashlookupProvider, GoogleSafeBrowsingProvider, ThreatFox IOC lookup using the abuse.ch Auth-Key header., Google Safe Browsing v4 URL match lookup., AlienVault OTX pulse lookup for URL, domain, IP, and file hash context., Keyless registration and network allocation lookup via RDAP. (+5 more)

### Community 27 - "google_auth.py"
Cohesion: 0.16
Nodes (18): google_callback(), google_exchange(), google_link_callback(), google_link_initiation(), google_login(), google_unlink(), delete, get (+10 more)

### Community 28 - "test_ml_classifier.py"
Cohesion: 0.14
Nodes (18): Production ML inference for parsed emails. Inference is deliberately optional:…, _as_text(), email_to_features(), _get_html_text_ratio(), Any, Shared, non-circular feature preparation for the email ML classifier. The…, Convert parsed email fields into deterministic model input. ``email`` may be a…, Build compatible input for legacy ``predict(text)`` callers. (+10 more)

### Community 29 - "IOCExtractor"
Cohesion: 0.22
Nodes (9): IOCExtractor, _add(), Any, Phase 6D: IOC Extraction Service. Extracts Indicators of Compromise from parsed…, Extract and deduplicate IOCs from all email components., _validate_ip(), test_ioc_extractor_comprehensive(), test_6d_authentication_field_labels_are_not_domains() (+1 more)

### Community 30 - "Dashboard.tsx"
Cohesion: 0.15
Nodes (15): MetricCard(), MetricCardProps, AdminOverview(), Dashboard(), EMPTY_SUMMARY, formatDate(), tooltipStyle, DashboardSummary (+7 more)

### Community 31 - "routes/analysis.py"
Cohesion: 0.16
Nodes (18): _analysis_summary(), _as_utc(), get_analysis(), list_analyses(), _persist_indicators(), Any, Email analysis, persisted-analysis exploration, and forensic exports., Render a printable, escaped forensic report with no client-side script. (+10 more)

### Community 32 - "package.json"
Cohesion: 0.10
Nodes (19): name, private, type, version, autoprefixer, clsx, d3-geo, eslint (+11 more)

### Community 33 - "User"
Cohesion: 0.22
Nodes (17): activate_user(), deactivate_user(), delete_user(), get_user(), get_users(), BaseModel, delete, get (+9 more)

### Community 34 - "_completed_result"
Cohesion: 0.16
Nodes (19): _completed_result(), export_analysis_blocklist(), export_analysis_html(), export_analysis_json(), export_analysis_pdf(), export_analysis_queries(), export_analysis_stix(), get_related_investigations() (+11 more)

### Community 35 - "AuthenticationAnalyzer"
Cohesion: 0.23
Nodes (9): AuthenticationAnalyzer, _get_org_domain(), Any, Phase 6C: Authentication Analysis Engine., Extract organizational domain (last two labels) safely., Normalize authentication evidence, calculate SPF/DKIM alignment, and produce an…, test_authentication_analyzer_basic(), test_6c_auth_analysis_comprehensive() (+1 more)

### Community 36 - "WHOISIntelligenceService"
Cohesion: 0.17
Nodes (9): Any, Offline-friendly / Cached WHOIS enrichment via whoisxmlapi or similar provider., Clear cached records and provider health state for tests or revalidation., Fetch WHOIS data with one cold-start provider health probe., Perform one WHOIS request after cache and health checks., WHOISIntelligenceService, asyncio, test_timeout_whois_is_cached_as_timeout_state() (+1 more)

### Community 37 - "lucide-react"
Cohesion: 0.16
Nodes (8): PanelProps, Sidebar(), TopBar(), AuditLogs(), authHeaders(), globalSearch(), SearchResult, lucide-react

### Community 38 - "_execute_analysis_pipeline"
Cohesion: 0.21
Nodes (16): AnalysisResult, AnalysisCancelled, analyze_email(), _background_analysis_task(), cancel_analysis(), _execute_analysis_pipeline(), get_analysis_status(), _indexed_campaign_candidates() (+8 more)

### Community 39 - "ThreatFoxService"
Cohesion: 0.18
Nodes (7): ThreatFoxService, _indicator(), Offline regression tests for the authenticated live threat feed., test_live_threats_enriches_public_ips(), test_live_threats_route_keeps_non_geolocated_events(), test_threatfox_live_adapter_normalizes_current_fields(), test_urlhaus_live_adapter_uses_get_and_handles_null_tags()

### Community 40 - "URLhausService"
Cohesion: 0.21
Nodes (7): get_live_threats(), _enrich_worker(), get, URLhausService, ProviderResponse, main(), TypedDict

### Community 41 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+9 more)

### Community 42 - "UserLayout.tsx"
Cohesion: 0.14
Nodes (9): COLOR_MAP, DataStream, Particle, SecurityEnvironmentBackground, SecurityEnvironmentBackgroundProps, SecurityProfile, ThreatLevel, UserLayout() (+1 more)

### Community 43 - "Indicators.tsx"
Cohesion: 0.18
Nodes (12): formatTimestamp(), IndicatorRow(), Indicators(), normalizeIocType(), normalizeSeverity(), ProviderStatus, WorkbenchIndicator, searchPersistedIocs() (+4 more)

### Community 44 - "config.py"
Cohesion: 0.14
Nodes (4): Settings, AbuseIPDBService, WHOIS intelligence lookup service., WHOISIntelligenceService

### Community 45 - "CaseTimelineBuilder"
Cohesion: 0.18
Nodes (9): CaseTimelineBuilder, Any, datetime, Builds a chronological timeline from email analysis data., Add inferred timing gap events where significant., Calculate total timeline span in seconds., Generate timeline summary statistics., Add an event to the timeline. (+1 more)

### Community 46 - "evaluate_classifier"
Cohesion: 0.17
Nodes (9): Detailed evaluation script for candidates., evaluate_classifier(), Any, Evaluation helpers for the controlled email ML corpus., Return deterministic, JSON-serializable held-out classification metrics., Model experiments script comparing classifiers on the controlled dataset., Training-side feature helpers shared conceptually with backend inference., StubClassifier (+1 more)

### Community 47 - "main.py"
Cohesion: 0.16
Nodes (11): health_check(), get, Session, worker_health(), init_db(), on_startup(), fixture, patch (+3 more)

### Community 48 - "ContentAnalyzer"
Cohesion: 0.24
Nodes (11): ContentAnalyzer, Any, Phase 6H & Phase 8: Safe Content, NLP, and HTML Forensics Analysis. Inspects…, Perform lexical, psychological, and safe structural HTML analysis., test_content_analyzer(), Test linguistic correlation., Test safe extraction of deceptive href vs visible text., test_bec_pattern() (+3 more)

### Community 49 - "AuthContext.tsx"
Cohesion: 0.21
Nodes (10): AuthContext, AuthContextType, AuthProvider(), BASE_URL, configuredBaseUrl, AuthApi, LoginResponse, AuthState (+2 more)

### Community 50 - "generate_blocklist"
Cohesion: 0.22
Nodes (10): generate_blocklist(), generate_queries(), Any, Phase 19: SOAR / Response Artifacts Service. Generates actionable defense…, Convenience function for blocklist generation., Convenience function for SIEM queries., Generates SOAR and SIEM artifacts from forensic analysis results., Generate CSV string containing all actionable threat indicators. (+2 more)

### Community 51 - "run_http_endpoint_test"
Cohesion: 0.18
Nodes (10): find_eml_files(), main(), Any, Exception, Path, Test the full /api/analyze endpoint with TestClient sending file and…, Locate all .eml fixtures in backend repository (excluding worktrees)., run_http_endpoint_test() (+2 more)

### Community 52 - "import_public_email_corpus.py"
Cohesion: 0.31
Nodes (11): _body_parts(), build_dataset(), load_enron(), append_message(), load_spamassassin(), main(), _normalize_record(), Any (+3 more)

### Community 53 - "EvidenceGraphBuilder"
Cohesion: 0.24
Nodes (7): EvidenceGraphBuilder, Any, Builds an evidence relationship graph from analysis results., Generate graph summary statistics., Add a node to the graph, return its ID., Add an edge (relationship) between two nodes., Build evidence graph from analysis results.

### Community 54 - "URLIntelligence"
Cohesion: 0.27
Nodes (8): _get_org_domain(), Any, Phase 6E: URL Intelligence — offline URL analysis and enrichment., Extract registrable domain (best effort)., Analyze a single URL for suspicious characteristics deterministically., URLIntelligence, test_url_intelligence(), test_6e_url_intelligence()

### Community 55 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, clsx, d3-geo, lucide-react, maplibre-gl, react, react-dom, react-router-dom (+4 more)

### Community 56 - "Upgrade schema - empty as tables already exist."
Cohesion: 0.18
Nodes (6): downgrade(), Downgrade schema - empty as tables exist., upgrade(), Upgrade schema - empty as tables already exist., upgrade(), upgrade()

### Community 57 - "DNSIntelligenceService"
Cohesion: 0.25
Nodes (7): _lookup_dns(), DNSIntelligenceService, Any, Provides synchronous fallback for DNS enrichment., Execute a DNS query safely with timeouts., Execute a DNS query safely with timeouts using threading., Provides async DNS enrichment for a domain (A, MX, NS, TXT).

### Community 58 - "test_google_link_unlink.py"
Cohesion: 0.29
Nodes (9): AuthAccount, Base, auth_header(), fixture, patch, test_client(), test_google_link_success(), test_google_unlink_lockout() (+1 more)

### Community 59 - "ThreatIndicator"
Cohesion: 0.44
Nodes (6): Any, ThreatFusionService, BaseModel, ThreatIndicator, test_fusion_empty(), test_fusion_high_severity()

### Community 60 - "test_phase2.py"
Cohesion: 0.40
Nodes (8): Any, Optional independent SPF and DKIM verification., _unavailable(), verify_dkim(), verify_spf(), asyncio, test_build_relay_path_preserves_hop_order_and_geo(), test_live_auth_verification_reports_unavailable_without_optional_dependencies()

### Community 61 - "threats.py"
Cohesion: 0.31
Nodes (8): get_threat_by_id(), get_threat_intelligence_providers(), get_threats(), _probe_provider(), get, Session, Return live health probes for the providers used by the analysis engine., Fetch a single threat by its ID from external feeds or local DB.

### Community 62 - "MLClassifier"
Cohesion: 0.25
Nodes (6): MLClassifier, Phase 6I: Machine Learning Classifier Service. This module remains for…, Backward-compatible alias. Notes: - Signature keeps an optional ``model_path``…, ML Package for email classification., test_ml_classifier_unavailable(), test_6i_ml_classifier_fallback()

### Community 63 - "dispatch_analysis_alert"
Cohesion: 0.33
Nodes (7): dispatch_analysis_alert(), Any, Bounded, privacy-aware alert delivery for high-risk analyses., Send a sanitized alert webhook when configured; never include raw email., asyncio, test_alert_dispatcher_does_not_send_benign_or_raw_email(), test_alert_dispatcher_sends_sanitized_high_risk_payload()

### Community 64 - "_HTMLDeceptionParser"
Cohesion: 0.28
Nodes (3): _HTMLDeceptionParser, HTMLParser, Safely extracts potentially deceptive HTML; it never executes content.

### Community 65 - "generate_forensic_pdf"
Cohesion: 0.33
Nodes (7): generate_forensic_pdf(), _lines(), _pdf_escape(), Any, Dependency-light PDF forensic report generation., Create a valid, portable PDF without requiring a native PDF runtime., test_generate_forensic_pdf_returns_pdf_bytes()

### Community 66 - "export_stix_bundle"
Cohesion: 0.28
Nodes (7): export_stix_bundle(), Any, Phase 16: STIX 2.1 Exporter Service. Generates a valid STIX 2.1 bundle…, Exports an analysis record as a STIX 2.1 bundle., Generate STIX 2.1 JSON bundle from analysis result., Convenience function for STIX export., Stix21Exporter

### Community 67 - "threat_intelligence.py"
Cohesion: 0.50
Nodes (8): _abuse_result(), _get_object(), _http_status(), _int(), Credential-gated threat-intelligence lookups with normalized results., _threatfox_result(), _urlhaus_result(), Response

### Community 68 - "is_ssrf_safe_ip"
Cohesion: 0.29
Nodes (7): is_ssrf_safe_ip(), SSRF Protection and Private IP Guard. Prevents Server-Side Request Forgery by…, Validate whether an IP address is safe for outbound queries. Rejects: -…, Check if a URL destination is safe from SSRF., validate_outbound_url_ssrf(), IPv4Address, IPv6Address

### Community 69 - "AbuseIPDBProvider"
Cohesion: 0.25
Nodes (7): AbuseIPDBProvider, AbuseIPDB v2 IP reputation lookup., asyncio, test_6f_abuseipdb_mocked(), test_6f_threatfox_mocked(), test_6f_urlhaus_mocked(), test_6f_virustotal_mocked()

### Community 70 - "services"
Cohesion: 0.25
Nodes (7): root, framework, root, rewrites, services, backend, frontend

### Community 71 - "services/email.py"
Cohesion: 0.48
Nodes (4): ABC, EmailProvider, get_email_provider(), NullEmailProvider

### Community 73 - "indicators.py"
Cohesion: 0.47
Nodes (4): get_indicators(), get, Session, main()

### Community 74 - "test_google_auth.py"
Cohesion: 0.40
Nodes (5): fixture, patch, test_client(), test_google_callback_new_user(), test_google_login_initiation()

### Community 75 - "eslint.config.js"
Cohesion: 0.33
Nodes (5): @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, typescript-eslint

### Community 76 - "d15b09c60f7d_merge_auth_migration_heads.py"
Cohesion: 0.40
Nodes (4): downgrade(), Merge independent authentication schema branches., Restore the two independent migration heads., upgrade()

### Community 77 - ".correlate_analysis"
Cohesion: 0.40
Nodes (4): CampaignCorrelator, Any, Correlates analyses into campaigns based on shared indicators., Find related historical investigations based on indicator overlap.

### Community 78 - ".map_evidence"
Cohesion: 0.40
Nodes (4): MitreMapper, Any, Maps forensic evidence to MITRE ATT&CK techniques., Map analysis result to MITRE ATT&CK techniques.

### Community 79 - ".enrich_all"
Cohesion: 0.50
Nodes (3): Any, Prioritize high-value external lookups without changing local extraction., test_ioc_priority_prefers_infrastructure_and_threat_artifacts()

### Community 80 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 81 - "predictor.py"
Cohesion: 0.50
Nodes (4): main(), predict_text(), Lightweight CLI / demo helper for offline inference using the trained artifact., Predict category for arbitrary raw text using the default model.

### Community 88 - "trained_model_path"
Cohesion: 0.67
Nodes (3): fixture, Generate a clean model artifact in a temporary location for deterministic…, trained_model_path()

## Knowledge Gaps
- **122 isolated node(s):** `AnalysisStatus`, `AuditLogRecord`, `AuthState`, `EmailScanRecord`, `IOCType` (+117 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 576 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_execute_analysis_pipeline()` connect `_execute_analysis_pipeline` to `test_rbac_hardening.py`, `test_header_forensics.py`, `EmailParser`, `reproduce_pipeline.py`, `AuthenticationAnalyzer`, `GeoEnricher`, `AttachmentAnalyzer`, `test_phase_coverage.py`, `ContentAnalyzer`, `StageTimer`, `IOCExtractor`, `SenderIntelligenceAnalyzer`, `URLIntelligence`, `test_phase2.py`, `dispatch_analysis_alert`, `routes/analysis.py`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `ThreatIntelligenceService` connect `reproduce_pipeline.py` to `threat_intelligence.py`, `_execute_analysis_pipeline`, `test_phase_coverage.py`, `test_threat_intelligence.py`, `.enrich_all`, `test_real_world_validation.py`, `_result`, `ThreatIntelProvider`, `threats.py`, `routes/analysis.py`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `HeaderForensicsAnalyzer` connect `test_header_forensics.py` to `test_phase_coverage.py`, `reproduce_pipeline.py`, `test_real_world_validation.py`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Are the 34 inferred relationships involving `User` (e.g. with `get_current_user()` and `require_admin()`) actually correct?**
  _`User` has 34 INFERRED edges - model-reasoned connections that need verification._
- **Are the 29 inferred relationships involving `EmailParser` (e.g. with `run_stage_by_stage()` and `test_extract_urls_deduplication()`) actually correct?**
  _`EmailParser` has 29 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `run_stage_by_stage()` (e.g. with `RiskEngine` and `RuleEngine`) actually correct?**
  _`run_stage_by_stage()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `_execute_analysis_pipeline()` (e.g. with `get_ml_classifier()` and `dispatch_analysis_alert()`) actually correct?**
  _`_execute_analysis_pipeline()` has 8 INFERRED edges - model-reasoned connections that need verification._