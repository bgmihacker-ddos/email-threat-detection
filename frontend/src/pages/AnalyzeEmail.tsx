import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeEmail, getAnalysisStatus } from '../services/analysisApi';
import {
  FileUp, X, MailSearch, FileText, ShieldCheck, ArrowRight,
  AlertTriangle, CheckCircle2, Clock3, Cpu, Globe, Binary, Layers
} from 'lucide-react';

const SCAN_STAGES = [
  'Parse message structure',
  'Inspect content and attachments',
  'Resolve domains and infrastructure',
  'Correlate threat intelligence',
  'Synthesize evidence and verdict',
];

export default function AnalyzeEmail() {
  const [emailContent, setEmailContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stageText, setStageText] = useState('Reading RFC 5322 MIME stream & headers...');
  const [progressPct, setProgressPct] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAnalyzing || !startedAt) return;
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)), 250);
    return () => window.clearInterval(timer);
  }, [isAnalyzing, startedAt]);

  const acceptFile = (selectedFile?: File) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.eml')) {
      setError('Invalid format: Only RFC 822/5322 .eml message files are supported.');
      setFile(null);
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => acceptFile(event.target.files?.[0]);
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    acceptFile(event.dataTransfer.files?.[0]);
  };

  const handleAnalyze = async () => {
    if (!emailContent.trim() && !file) {
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
      const initResult = await analyzeEmail(emailContent, file || undefined);
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
            <h2 className="mt-1 text-base font-semibold text-gray-100">Paste Raw MIME / Header Text</h2>
            <p className="mt-0.5 text-xs text-gray-400 font-mono">
              Alternative ingestion path for clipboard transfers or raw terminal logs.
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
            if (error) setError(null);
          }}
        />
      </section>

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

          <div className="w-full bg-[#081216] h-2 rounded-full overflow-hidden border border-[#1b3037]">
            <div
              className="bg-gradient-to-r from-cyan-500 to-violet-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
            />
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
              const threshold = [5, 15, 35, 60, 80][index] ?? 80;
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
