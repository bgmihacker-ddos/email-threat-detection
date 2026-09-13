import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeEmail, getAnalysisStatus, getGmailInboxStatus, listGmailMessages, scanGmailMessage, type GmailMessage } from '../services/analysisApi';
import { BASE_URL } from '../services/api';
import {
  FileUp, X, MailSearch, FileText, ShieldCheck, ArrowRight,
  AlertTriangle, CheckCircle2, Clock3, Cpu, Globe, Binary, Layers, Radar, Zap, Inbox, RefreshCw, ScanSearch
} from 'lucide-react';

const SCAN_STAGES = [
  'MIME Parser & Token Dissector',
  'Cryptographic Re-Verification (SPF/DKIM/DMARC)',
  'Global Hop GeoTracing & TOR Exit Node Check',
  'Threat Fusion & Multi-Model Scoring',
  'Blockchain Ledger Anchoring',
];

type InputMode = 'file' | 'mime' | 'triage';
type DemoScenario = { name: string; icon: string; description: string; content: string };

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    name: 'Indian Bank KYC Phish',
    icon: '🇮🇳',
    description: 'SBI / HDFC lookalike domain',
    content: `From: "SBI KYC Desk" <support@sbi-co-in-update.net>\nTo: customer@example.com\nSubject: Action Required: Update PAN and Aadhaar KYC\nDate: Tue, 13 Sep 2026 09:15:00 +0000\nReceived: from kyc-gateway.sbi-co-in-update.net (185.220.101.5) by mx.example.com\nAuthentication-Results: mx.example.com; spf=fail; dkim=fail; dmarc=fail\nContent-Type: text/plain; charset="UTF-8"\n\nYour PAN and Aadhaar KYC will be suspended today. Confirm your details at https://sbi-kyc-verify.net/update within 24 hours.`,
  },
  {
    name: 'CEO Urgent Wire Transfer (BEC)',
    icon: '💼',
    description: 'Payroll fraud without links',
    content: `From: "Chief Executive Officer" <ceo@enterprise-corp.co>\nTo: payroll@example.com\nSubject: Urgent Confidential Payroll Transfer\nDate: Tue, 13 Sep 2026 10:20:00 +0000\nReceived: from mail.enterprise-corp.co (203.0.113.44) by mx.example.com\nAuthentication-Results: mx.example.com; spf=softfail; dkim=none; dmarc=none\nContent-Type: text/plain; charset="UTF-8"\n\nI am in a confidential meeting. Process the attached payroll wire of $48,500 immediately and do not call me to confirm.`,
  },
  {
    name: 'Invoice with Macro Attachment',
    icon: '📎',
    description: 'Weaponized invoice intake',
    content: `From: "Accounts Payable" <billing@vendor-invoice-mail.com>\nTo: finance@example.com\nSubject: Invoice 88421 - Payment Required\nDate: Tue, 13 Sep 2026 11:05:00 +0000\nReceived: from invoice-host.vendor-invoice-mail.com (198.51.100.77) by mx.example.com\nMIME-Version: 1.0\nContent-Type: multipart/mixed; boundary="invoice-boundary"\n\n--invoice-boundary\nContent-Type: text/plain\n\nPlease review the attached invoice and enable content to view the protected document.\n--invoice-boundary\nContent-Type: application/vnd.ms-excel; name="Invoice_88421.xlsm"\nContent-Disposition: attachment; filename="Invoice_88421.xlsm"\n\nVBA macro-enabled invoice attachment.\n--invoice-boundary--`,
  },
  {
    name: 'Clean Internal IT Memo',
    icon: '🟢',
    description: 'Legitimate SPF / DKIM mail',
    content: `From: "Internal IT" <it@example.com>\nTo: all-staff@example.com\nSubject: Scheduled VPN Maintenance\nDate: Tue, 13 Sep 2026 12:00:00 +0000\nReceived: from mail.example.com (10.0.0.12) by mx.example.com\nAuthentication-Results: mx.example.com; spf=pass; dkim=pass; dmarc=pass\nContent-Type: text/plain; charset="UTF-8"\n\nThe corporate VPN will undergo scheduled maintenance from 22:00 to 23:00 UTC tonight. No action is required.`,
  },
];

export default function AnalyzeEmail() {
  const [emailContent, setEmailContent] = useState('');
  const [filePreview, setFilePreview] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('file');
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stageText, setStageText] = useState('Reading RFC 5322 MIME stream & headers...');
  const [progressPct, setProgressPct] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailMessages, setGmailMessages] = useState<GmailMessage[]>([]);
  const [isLoadingGmail, setIsLoadingGmail] = useState(false);
  const [scanningGmailId, setScanningGmailId] = useState<string | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadGmailMessages = async () => {
    setIsLoadingGmail(true);
    setError(null);
    try {
      const status = await getGmailInboxStatus();
      const canReadGmail = status.connected && status.gmail_readonly;
      setGmailConnected(canReadGmail);
      if (canReadGmail) {
        const result = await listGmailMessages();
        setGmailMessages(result.messages);
      } else {
        setGmailMessages([]);
      }
    } catch (reason: any) {
      setError(reason?.message || 'Could not load Gmail messages.');
    } finally {
      setIsLoadingGmail(false);
    }
  };

  useEffect(() => {
    void loadGmailMessages();
  }, []);

  useEffect(() => {
    if (!isAnalyzing || !startedAt) return;
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)), 250);
    return () => window.clearInterval(timer);
  }, [isAnalyzing, startedAt]);

  useEffect(() => {
    if (!file) {
      setFilePreview('');
      return;
    }
    file.text().then(setFilePreview).catch(() => setFilePreview(''));
  }, [file]);

  const acceptFile = (selectedFile?: File) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.eml')) {
      setError('Invalid format: Only RFC 822/5322 .eml message files are supported.');
      setFile(null);
      return;
    }
    setError(null);
    setActiveScenario(null);
    setFile(selectedFile);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => acceptFile(event.target.files?.[0]);
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    acceptFile(event.dataTransfer.files?.[0]);
  };

  const startAnalysis = async (content: string, selectedFile?: File) => {
    if (!content.trim() && !selectedFile) {
      setError('Please provide email source via file upload (.eml) or paste raw MIME contents.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setStageText('Queued for forensic ingestion');
    setProgressPct(5);
    setStartedAt(Date.now());
    setElapsedSeconds(0);

    try {
      const initResult = await analyzeEmail(content, selectedFile);
      const { analysis_id } = initResult;

      const pollStatus = async () => {
        try {
          const statusResult = await getAnalysisStatus(analysis_id);

          setStageText(statusResult.stage || 'Processing...');
          setProgressPct(statusResult.progress_pct || 0);

          if (statusResult.status === 'completed') {
            navigate(`/analysis/${analysis_id}`);
          } else if (statusResult.status === 'failed') {
            setError(statusResult.error || 'Forensic analysis failed.');
            setIsAnalyzing(false);
            setStartedAt(null);
          } else {
            setTimeout(pollStatus, 500);
          }
        } catch (err: any) {
          setError(err?.message || 'Error fetching analysis status.');
          setIsAnalyzing(false);
          setStartedAt(null);
        }
      };

      setTimeout(pollStatus, 500);
    } catch (err: any) {
      setError(err?.message || 'Forensic analysis failed to start. Verify MIME validity and network connection.');
      setIsAnalyzing(false);
      setStartedAt(null);
    }
  };

  const handleAnalyze = () => startAnalysis(emailContent, file || undefined);

  const handleGmailScan = async (message: GmailMessage) => {
    setScanningGmailId(message.id);
    setError(null);
    setIsAnalyzing(true);
    setStageText('Queued from Gmail inbox');
    setProgressPct(5);
    setStartedAt(Date.now());
    setElapsedSeconds(0);
    try {
      const result = await scanGmailMessage(message.id);
      const pollStatus = async () => {
        try {
          const status = await getAnalysisStatus(result.analysis_id);
          setStageText(status.stage || 'Processing Gmail message...');
          setProgressPct(status.progress_pct || 0);
          if (status.status === 'completed') {
            navigate(`/analysis/${result.analysis_id}`);
            return;
          }
          if (status.status === 'failed') {
            throw new Error(status.error || 'Gmail message analysis failed.');
          }
          window.setTimeout(() => void pollStatus(), 700);
        } catch (reason: any) {
          setError(reason?.message || 'Gmail message analysis failed.');
          setIsAnalyzing(false);
          setStartedAt(null);
        }
      };
      window.setTimeout(() => void pollStatus(), 500);
    } catch (reason: any) {
      setError(reason?.message || 'Could not queue the Gmail message for analysis.');
      setIsAnalyzing(false);
      setStartedAt(null);
    } finally {
      setScanningGmailId(null);
    }
  };

  const connectGoogle = () => {
    window.location.assign(`${BASE_URL}/api/auth/google/login`);
  };

  const loadScenario = (scenario: DemoScenario) => {
    setInputMode('mime');
    setActiveScenario(scenario.name);
    setFile(null);
    setEmailContent(scenario.content);
    setError(null);
    void startAnalysis(scenario.content);
  };

  const previewText = filePreview || emailContent;
  const previewSubject = previewText.match(/^Subject:\s*(.+)$/im)?.[1]?.trim() || 'Subject not detected';
  const previewSender = previewText.match(/^From:\s*(.+)$/im)?.[1]?.trim() || 'Sender not detected';
  const previewHops = (previewText.match(/^Received:/gim) || []).length;
  const previewSize = file ? file.size : new Blob([previewText]).size;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <header className="relative overflow-hidden rounded-xl border border-[#29454b] bg-[#101b21]/80 p-6 shadow-[0_20px_60px_rgba(2,12,15,0.22)]">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#58d6c0] shadow-[0_0_10px_rgba(88,214,192,0.8)] animate-pulse" />
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#58d6c0]">INGESTION PIPELINE · FORENSIC INTAKE</p>
        </div>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white">Email Investigation Lab</h1>
        <p className="mt-1 max-w-3xl text-xs text-gray-400 font-mono">
          Submit suspicious messages for deterministic header forensics, authentication verification, macro inspection, and entity relationship graphing.
        </p>
      </header>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#1b3037] bg-[#101b21]/90 p-2 font-mono text-[10px] uppercase tracking-wider">
          {([
            ['file', 'File Upload (.eml)'],
            ['mime', 'Direct MIME Paste'],
            ['triage', 'Quick URL / Header Triage'],
          ] as [InputMode, string][]).map(([mode, label]) => (
            <button key={mode} type="button" onClick={() => setInputMode(mode)} className={`rounded px-3 py-2 transition ${inputMode === mode ? 'bg-cyan-400 text-[#071114]' : 'text-gray-500 hover:bg-[#183235] hover:text-cyan-200'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-amber-300">
          <Zap size={13} /> Demo attack scenarios · one click to load and scan
        </div>
      </section>

      <section className="rounded-xl border border-[#29454b] bg-[#101b21]/90 p-5 shadow-[0_18px_45px_rgba(2,12,15,0.2)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded border border-[#3b5e60] bg-[#142b2d] p-2.5 text-[#58d6c0]"><Inbox size={19} /></div>
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#58d6c0]">GMAIL INBOX · READ ONLY</p>
              <h2 className="mt-1 text-base font-semibold text-gray-100">Choose an email to scan</h2>
              <p className="mt-1 text-xs text-gray-400">Select one message and send its original MIME source to the forensic pipeline.</p>
            </div>
          </div>
          {gmailConnected ? <button type="button" onClick={() => void loadGmailMessages()} disabled={isLoadingGmail} className="inline-flex items-center justify-center gap-2 rounded border border-[#3b5e60] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[#8ce2d0] hover:bg-[#183235] disabled:opacity-50">
            <RefreshCw size={13} className={isLoadingGmail ? 'animate-spin' : ''} /> Refresh inbox
          </button> : <button type="button" onClick={connectGoogle} className="inline-flex items-center justify-center gap-2 rounded bg-[#58d6c0] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#09201e] hover:bg-[#82e5d2]">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#4285f4]">G</span> Connect Google &amp; Gmail
          </button>}
        </div>
        {!gmailConnected && !isLoadingGmail && <p className="mt-4 rounded border border-amber-700/40 bg-amber-950/20 p-3 text-xs font-mono text-amber-200">Connect Google with Gmail read access to choose a message from your inbox.</p>}
        {gmailConnected && !isLoadingGmail && gmailMessages.length === 0 && <p className="mt-4 rounded border border-[#29454b] bg-[#081216] p-3 text-xs font-mono text-gray-500">No messages are available in the Gmail inbox.</p>}
        {gmailMessages.length > 0 && <div className="mt-4 space-y-2">
          {gmailMessages.map((message) => <div key={message.id} className="flex flex-col gap-3 rounded border border-[#29454b] bg-[#081216] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-gray-100">{message.subject}</p>
              <p className="mt-1 truncate font-mono text-[10px] text-[#8ce2d0]">{message.sender}</p>
              <p className="mt-1 truncate text-[11px] text-gray-500">{message.snippet || 'No preview available.'}</p>
            </div>
            <button type="button" onClick={() => void handleGmailScan(message)} disabled={scanningGmailId !== null || isAnalyzing} className="inline-flex shrink-0 items-center justify-center gap-2 rounded bg-[#58d6c0] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#09201e] hover:bg-[#82e5d2] disabled:cursor-wait disabled:opacity-50">
              <ScanSearch size={13} /> {scanningGmailId === message.id ? 'Queueing...' : 'Scan email'}
            </button>
          </div>)}
        </div>}
      </section>

      {/* Primary Intake Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Upload Box */}
        <section className="lg:col-span-3 rounded-xl border border-[#1b3037] bg-[#101b21]/90 p-6 shadow-[0_18px_45px_rgba(2,12,15,0.2)] flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-3">
              <div className="rounded border border-cyan-500/30 bg-cyan-950/40 p-2.5 text-cyan-400">
                <FileUp size={20} />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30">
                  RECOMMENDED INTAKE
                </span>
                <h2 className="mt-1 text-base font-semibold text-gray-100">Upload RFC 5322 EML File</h2>
                <p className="mt-0.5 text-xs text-gray-400 font-mono">
                  Preserves raw Received headers, boundary delimiters, and binary attachment payloads.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {DEMO_SCENARIOS.map((scenario) => (
                <button key={scenario.name} type="button" onClick={() => loadScenario(scenario)} disabled={isAnalyzing} className={`group rounded border px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${activeScenario === scenario.name ? 'border-cyan-400/70 bg-cyan-950/30' : 'border-[#29454b] bg-[#081216] hover:border-cyan-500/50'}`}>
                  <span className="flex items-center gap-2 text-xs font-semibold text-gray-200"><span>{scenario.icon}</span>{scenario.name}</span>
                  <span className="mt-1 block text-[10px] font-mono text-gray-500 group-hover:text-cyan-200">{scenario.description}</span>
                </button>
              ))}
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#29454b] bg-[#081216] p-6 text-center transition-all hover:border-cyan-500/60 hover:bg-cyan-950/10"
            >
              {file ? (
                <div className="flex max-w-full items-center gap-3 rounded-lg border border-cyan-500/40 bg-[#16242a] px-5 py-3.5 shadow-md">
                  <FileText size={22} className="shrink-0 text-cyan-400" />
                  <div className="min-w-0 text-left font-mono">
                    <p className="truncate text-xs font-bold text-gray-100">{file.name}</p>
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB • EML Archive Loaded
                    </p>
                  </div>
                  <button
                    aria-label="Remove uploaded email"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="ml-3 rounded p-1 text-gray-500 hover:bg-red-950/60 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="rounded-full bg-[#101b21] p-3 border border-[#1b3037] text-gray-500 mb-2">
                    <FileUp size={26} className="text-cyan-400" />
                  </div>
                  <p className="text-xs font-semibold uppercase font-mono tracking-wider text-gray-200">
                    Drop .eml file here to inspect
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500 font-mono">
                    or click to select from local forensic storage
                  </p>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".eml"
                className="hidden"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#1b3037]/60 text-[11px] font-mono text-gray-500">
            <span>Supported: RFC 822, RFC 2822, RFC 5322</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Browse Files...
            </button>
          </div>
        </section>

        {/* Forensic Capabilities Checklist */}
        <aside className="lg:col-span-2 rounded-xl border border-[#1b3037] bg-[#101b21]/90 p-6 shadow-[0_18px_45px_rgba(2,12,15,0.2)] flex flex-col justify-between">
          <div>
            <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-gray-500">ENGINE CAPABILITIES</p>
            <h3 className="mt-1 text-sm font-semibold text-gray-200">Automated Pipeline Coverage</h3>

            <div className="mt-4 space-y-3.5 font-mono text-xs">
              <div className="flex gap-3">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                <div>
                  <p className="font-semibold text-gray-200">Cryptographic Auth Verification</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Evaluates SPF records, DKIM public key signatures, DMARC policies, and ARC seals.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Layers size={16} className="mt-0.5 shrink-0 text-cyan-400" />
                <div>
                  <p className="font-semibold text-gray-200">Mail Flow Chronology</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Traces every MTA hop, calculating propagation delay and detecting IP divergence.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Binary size={16} className="mt-0.5 shrink-0 text-violet-400" />
                <div>
                  <p className="font-semibold text-gray-200">Deep Attachment Forensics</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Inspects magic bytes, detects VBA macros/OLE streams, and computes SHA-256 hashes.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Globe size={16} className="mt-0.5 shrink-0 text-amber-400" />
                <div>
                  <p className="font-semibold text-gray-200">Threat Intelligence & MITRE ATT&CK</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Maps indicators to T1566 phishing techniques, extracting structured STIX 2.1 entities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded border border-[#1b3037] bg-[#081216] p-3 text-[10px] font-mono text-gray-500 leading-relaxed">
            Data Safety: Local processing mode. No unencrypted content is shared with external parties.
          </div>
        </aside>
      </div>

      {/* Raw MIME Paste Option */}
      <section className="rounded-xl border border-[#1b3037] bg-[#101b21]/90 p-6 shadow-[0_18px_45px_rgba(2,12,15,0.2)]">
        <div className="flex items-start gap-3">
          <div className="rounded border border-violet-500/30 bg-violet-950/40 p-2.5 text-violet-300">
            <MailSearch size={20} />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-800/30">
              DIRECT INPUT
            </span>
            <h2 className="mt-1 text-base font-semibold text-gray-100">{inputMode === 'triage' ? 'Quick URL / Header Triage' : 'Paste Raw MIME / Header Text'}</h2>
            <p className="mt-0.5 text-xs text-gray-400 font-mono">
              {inputMode === 'triage' ? 'Paste a suspicious URL or compact header block for immediate routing and IOC preview.' : 'Alternative ingestion path for clipboard transfers or raw terminal logs.'}
            </p>
          </div>
        </div>

        <textarea
          className="mt-4 h-56 w-full resize-y rounded-lg border border-[#29454b] bg-[#081216] p-4 font-mono text-xs leading-relaxed text-gray-300 outline-none transition-all placeholder:text-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
          placeholder={`Delivered-To: victim@enterprise.corp
Received: from mail.attacker.net (mail.attacker.net [198.51.100.24])
    by mx.google.com with ESMTPS id ...
Authentication-Results: mx.google.com;
    spf=fail (google.com: domain does not designate 198.51.100.24)
From: "Security Alert" <security@update-service.com>
To: victim@enterprise.corp
Subject: Urgent: Verify Account Access Immediately
Date: Tue, 08 Sep 2026 10:00:00 +0000
Content-Type: text/html; charset="UTF-8"

Please verify your credentials at http://suspicious-login-portal.com/login`}
          value={emailContent}
          onChange={(e) => {
            setEmailContent(e.target.value);
            setActiveScenario(null);
            if (error) setError(null);
          }}
        />
      </section>

      {previewText.trim() && !isAnalyzing && (
        <section className="rounded-lg border border-cyan-500/30 bg-[#0b1b20] p-4 font-mono shadow-[0_0_30px_rgba(34,211,238,0.08)]">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-cyan-300"><Radar size={14} className="animate-pulse" /> Client-side pre-flight summary</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <PreflightItem label="Sender" value={previewSender} />
            <PreflightItem label="Subject" value={previewSubject} />
            <PreflightItem label="Payload" value={`${previewSize.toLocaleString()} bytes`} />
            <PreflightItem label="Hop estimate" value={`${previewHops} Received headers`} />
          </div>
        </section>
      )}

      {/* Active Pipeline Progress Display */}
      {isAnalyzing && (
        <div className="rounded-lg border border-cyan-500/40 bg-cyan-950/20 p-5 shadow-lg space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-cyan-300 font-bold">
              <Cpu size={15} className="animate-spin text-cyan-400" />
              LIVE SCAN FEED
            </span>
            <span className="text-gray-400 text-[11px]">
              {Math.min(100, Math.max(0, progressPct))}% COMPLETE
            </span>
          </div>

          <div className="relative h-24 overflow-hidden rounded border border-cyan-500/20 bg-[#061014]">
            <div className="absolute inset-y-0 left-0 w-1/2 animate-[scan_2.4s_linear_infinite] border-r border-cyan-300/70 bg-gradient-to-r from-transparent via-cyan-400/10 to-cyan-300/20" />
            <div className="absolute inset-0 flex items-center justify-center"><div className="h-14 w-14 rounded-full border border-cyan-400/40 shadow-[0_0_24px_rgba(34,211,238,0.25)]"><div className="ml-7 h-7 origin-bottom border-l border-cyan-300/80 rotate-45" /></div></div>
            <div className="absolute bottom-2 left-3 right-3 h-1 overflow-hidden rounded bg-[#183235]"><div className="h-full bg-cyan-300 transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }} /></div>
          </div>

          <p className="border-l-2 border-cyan-500/60 pl-3 text-xs leading-6 text-cyan-200" aria-live="polite">
            {stageText}
          </p>

          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500">
            <Clock3 size={13} className="text-cyan-400" />
            <span>Elapsed {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:{String(elapsedSeconds % 60).padStart(2, '0')}</span>
            <span className="text-gray-700">·</span>
            <span>Evidence collection active</span>
          </div>

          <div className="grid gap-2 border-t border-cyan-500/20 pt-3 sm:grid-cols-5">
            {SCAN_STAGES.map((stage, index) => {
              const threshold = [5, 20, 40, 65, 85][index] ?? 85;
              const complete = progressPct > threshold || (index === 0 && progressPct >= threshold);
              const active = !complete && progressPct >= threshold - 10;
              return <div key={stage} className={`flex items-center gap-2 text-[10px] leading-4 ${complete ? 'text-emerald-300' : active ? 'text-cyan-200' : 'text-gray-600'}`}><span className="shrink-0">{complete ? <CheckCircle2 size={13} /> : <span className={`block h-2 w-2 rounded-full ${active ? 'animate-pulse bg-cyan-400' : 'bg-gray-700'}`} />}</span><span>{stage}</span></div>;
            })}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div role="alert" className="flex items-center gap-2.5 rounded-lg border border-red-800/60 bg-red-950/30 p-4 text-xs font-mono text-red-200 shadow-md">
          <AlertTriangle size={17} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col gap-3 border-t border-[#1b3037] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500 font-mono">
          {file
            ? `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
            : emailContent.trim()
            ? `MIME stream loaded (${emailContent.length} bytes)`
            : 'Select an .eml file or paste email content above to begin.'}
        </p>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="btn-primary min-w-56 py-3 shadow-lg shadow-cyan-950/40 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
        >
          {isAnalyzing ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <span>PROCESSING...</span>
            </>
          ) : (
            <>
              <span>EXECUTE FORENSIC ANALYSIS</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function PreflightItem({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 border-l border-cyan-500/30 pl-3"><p className="text-[9px] uppercase tracking-widest text-gray-500">{label}</p><p className="mt-1 truncate text-xs text-gray-200" title={value}>{value}</p></div>;
}
