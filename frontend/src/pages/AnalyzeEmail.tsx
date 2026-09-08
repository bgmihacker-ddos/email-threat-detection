import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeEmail } from '../services/analysisApi';
import { FileUp, X, MailSearch, FileText, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';

export default function AnalyzeEmail() {
  const [emailContent, setEmailContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (selectedFile?: File) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.eml')) { setError('Only .eml files are supported for file-based investigations.'); setFile(null); return; }
    setError(null); setFile(selectedFile);
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => acceptFile(event.target.files?.[0]);
  const handleDrop = (event: React.DragEvent) => { event.preventDefault(); acceptFile(event.dataTransfer.files?.[0]); };

  const handleAnalyze = async () => {
    if (!emailContent.trim() && !file) { setError('Paste raw email content or upload an .eml file to begin an investigation.'); return; }
    setIsAnalyzing(true); setError(null); setCurrentStage('Preparing forensic analysis');
    try { const result = await analyzeEmail(emailContent, file || undefined); navigate(`/analysis/${result.analysis_id}`); }
    catch { setError('The investigation could not be completed. Verify the email input and try again.'); setIsAnalyzing(false); }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="border-b border-[#151D28] pb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-500">Investigation workspace</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Start email investigation</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Submit a source email for structural, authentication, infrastructure, and threat-intelligence analysis.</p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <section className="lg:col-span-3 rounded border border-[#151D28] bg-[#080D14] p-5">
          <div className="flex items-start gap-3"><div className="rounded border border-cyan-500/20 bg-cyan-950/30 p-2 text-cyan-400"><FileUp size={18} /></div><div><p className="text-[10px] font-bold uppercase tracking-widest text-cyan-500">Source file</p><h2 className="mt-0.5 text-base font-semibold text-gray-200">Upload RFC 5322 email</h2><p className="mt-1 text-xs text-gray-500">Upload the original .eml file to retain headers and MIME structure.</p></div></div>
          <div onDragOver={event => event.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className="mt-5 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-[#263449] bg-[#060A10] p-6 text-center transition-colors hover:border-cyan-500/70 hover:bg-cyan-950/10">
            {file ? <div className="flex max-w-full items-center gap-3 rounded border border-[#263449] bg-[#0B111A] px-4 py-3"><FileText size={18} className="shrink-0 text-cyan-400" /><div className="min-w-0 text-left"><p className="truncate text-sm text-gray-200">{file.name}</p><p className="mt-0.5 font-mono text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB · ready for investigation</p></div><button aria-label="Remove uploaded email" onClick={event => { event.stopPropagation(); setFile(null); }} className="ml-2 rounded p-1 text-gray-500 hover:bg-red-950/40 hover:text-red-400"><X size={15} /></button></div> : <><FileUp size={28} className="text-gray-600" /><p className="mt-3 text-xs font-semibold uppercase tracking-wider text-gray-300">Drop .eml file here</p><p className="mt-1 text-xs text-gray-600">or select a file from your device</p></>}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".eml" className="hidden" />
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="mt-3 rounded border border-[#263449] px-3 py-2 text-xs font-semibold text-gray-300 transition-colors hover:border-cyan-500/60 hover:text-cyan-300">Browse .eml file</button>
        </section>

        <aside className="lg:col-span-2 rounded border border-[#151D28] bg-[#080D14] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-600">Investigation coverage</p>
          <div className="mt-4 space-y-4">{[[ShieldCheck, 'Identity verification', 'SPF, DKIM, DMARC, and ARC evidence'], [MailSearch, 'Mail-flow forensics', 'Header paths, sender infrastructure, and relationships'], [AlertTriangle, 'Threat reasoning', 'Findings, extracted IOCs, and recommended actions']].map(([Icon, title, description]) => { const IconComponent = Icon as typeof ShieldCheck; return <div key={title as string} className="flex gap-3"><IconComponent size={17} className="mt-0.5 shrink-0 text-cyan-500" /><div><p className="text-sm font-medium text-gray-200">{title as string}</p><p className="mt-0.5 text-xs leading-relaxed text-gray-500">{description as string}</p></div></div>; })}</div>
          <div className="mt-6 rounded border border-[#263449] bg-[#060A10] p-3 text-[11px] leading-relaxed text-gray-500">Only submitted content is analyzed. Results are tied to a new investigation record once processing completes.</div>
        </aside>
      </div>

      <section className="rounded border border-[#151D28] bg-[#080D14] p-5">
        <div className="flex items-start gap-3"><div className="rounded border border-violet-500/20 bg-violet-950/20 p-2 text-violet-300"><MailSearch size={18} /></div><div><p className="text-[10px] font-bold uppercase tracking-widest text-violet-300">Raw source</p><h2 className="mt-0.5 text-base font-semibold text-gray-200">Paste complete email content</h2><p className="mt-1 text-xs text-gray-500">Use this option when a source .eml file is unavailable. Include full headers and body whenever possible.</p></div></div>
        <textarea className="mt-5 h-60 w-full resize-y rounded border border-[#263449] bg-[#060A10] p-4 font-mono text-xs leading-relaxed text-gray-300 outline-none transition-colors placeholder:text-gray-700 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/20" placeholder={'Return-Path: <sender@example.com>\nReceived: ...\nFrom: ...\nSubject: ...\n\nPaste complete RFC/MIME source here'} value={emailContent} onChange={event => { setEmailContent(event.target.value); if (error) setError(null); }} />
      </section>

      {error && <div role="alert" className="flex items-center gap-2 rounded border border-red-800/60 bg-red-950/30 px-4 py-3 text-sm text-red-200"><AlertTriangle size={16} className="shrink-0" />{error}</div>}

      <div className="flex flex-col gap-3 border-t border-[#151D28] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-gray-600">{file ? 'File source selected. ' : emailContent.trim() ? 'Raw email source ready. ' : 'Add an email source to enable analysis. '}Analysis may take a moment based on source complexity.</p><button onClick={handleAnalyze} disabled={isAnalyzing} className="inline-flex min-w-56 items-center justify-center gap-2 rounded bg-cyan-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-[#263449] disabled:text-gray-500">{isAnalyzing ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />{currentStage}</> : <>Analyze email <ArrowRight size={15} /></>}</button></div>
    </div>
  );
}
