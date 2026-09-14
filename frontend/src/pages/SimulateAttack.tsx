import React, { useState } from "react";
import { Play, ShieldAlert, RefreshCw } from "lucide-react";
import { apiFetch } from "../services/api";

export const SimulateAttack: React.FC = () => {
  const [scenario, setScenario] = useState("phishing");
  const [senderName, setSenderName] = useState("Microsoft Security");
  const [senderEmail, setSenderEmail] = useState("security@m1crosoft-alert.com");
  const [subject, setSubject] = useState("Urgent: Verify Your Account");
  const [bodyText, setBodyText] = useState("Please click the link to verify your account credentials immediately.");
  const [spfPass, setSpfPass] = useState(false);
  const [dkimPass, setDkimPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await apiFetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          sender_name: senderName,
          sender_email: senderEmail,
          subject,
          body_text: bodyText,
          spf_pass: spfPass,
          dkim_pass: dkimPass,
        }),
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (key: string) => {
    setScenario(key);
    if (key === "phishing") {
      setSubject("Security Alert: Unusual Sign-in Activity");
      setSenderName("Microsoft Security");
      setSenderEmail("security@m1crosoft-alert.com");
      setBodyText("We detected unusual sign-in activity. Verify here: http://evil.com/login");
    } else if (key === "bec") {
      setSubject("Urgent Wire Transfer Required");
      setSenderName("CEO Office");
      setSenderEmail("ceo@company-internal.com");
      setBodyText("Process wire transfer of $45,000 immediately. Keep confidential.");
    } else if (key === "india_kyc") {
      setSubject("KYC Update Mandatory – Account Will Be Suspended");
      setSenderName("SBI Yono Support");
      setSenderEmail("support@sbi-yono-update.in");
      setBodyText("Dear Customer, Your KYC is pending. Update Aadhaar details within 24 hours.");
    } else if (key === "quishing") {
      setSubject("Scan to Confirm Your Delivery");
      setSenderName("Courier Delivery Desk");
      setSenderEmail("delivery@parcel-confirm.example");
      setBodyText("Your parcel is waiting. Scan the QR code in the attached notice to confirm delivery and avoid a return fee.");
    } else if (key === "benign") {
      setSubject("Your monthly account statement is ready");
      setSenderName("Example Bank Statements");
      setSenderEmail("statements@example-bank.test");
      setBodyText("Your monthly statement is ready in online banking. You can sign in through the usual bookmarked website.");
      setSpfPass(true);
      setDkimPass(true);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center bg-[#0c171c] border border-[#1b3037] p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-[#8ce2d0]">Red Team Attack Simulation Engine</h1>
          <p className="text-sm text-slate-400 mt-1">Craft synthetic threat payloads and test the detection pipeline in real-time.</p>
        </div>
        <div className="flex gap-2">
          {["phishing", "bec", "india_kyc", "quishing", "benign"].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => loadPreset(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${scenario === k ? 'bg-[#58d6c0] text-[#080d10]' : 'bg-[#183235] text-[#8ce2d0] hover:bg-[#1b3037]'}`}
            >
              {k.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSimulate} className="bg-[#0c171c] border border-[#1b3037] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#8ce2d0] uppercase tracking-wider mb-2">Payload Parameters</h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Sender Name</label>
            <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="w-full bg-[#080d10] border border-[#1b3037] rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-[#58d6c0] outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Sender Email</label>
            <input type="text" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} className="w-full bg-[#080d10] border border-[#1b3037] rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-[#58d6c0] outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-[#080d10] border border-[#1b3037] rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-[#58d6c0] outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Body Text</label>
            <textarea rows={4} value={bodyText} onChange={(e) => setBodyText(e.target.value)} className="w-full bg-[#080d10] border border-[#1b3037] rounded-lg p-3 text-sm text-slate-200 focus:border-[#58d6c0] outline-none" />
          </div>

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input type="checkbox" checked={spfPass} onChange={(e) => setSpfPass(e.target.checked)} className="rounded bg-[#080d10] border-[#1b3037] text-[#58d6c0]" /> SPF Pass
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input type="checkbox" checked={dkimPass} onChange={(e) => setDkimPass(e.target.checked)} className="rounded bg-[#080d10] border-[#1b3037] text-[#58d6c0]" /> DKIM Pass
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-[#58d6c0] hover:bg-[#4bc2af] text-[#080d10] font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Attack Simulation
          </button>
        </form>

        <div className="bg-[#0c171c] border border-[#1b3037] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#8ce2d0] uppercase tracking-wider mb-4">Simulation Results & Verdict</h3>
            {!result ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-[#1b3037] rounded-xl">
                <ShieldAlert className="w-8 h-8 mb-2 opacity-40 text-[#58d6c0]" />
                <p className="text-sm">Configure parameters and run simulation to view analysis output.</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center p-3 bg-[#080d10] border border-[#1b3037] rounded-xl">
                  <div>
                    <span className="text-xs text-slate-400">Verdict</span>
                    <h4 className="text-lg font-bold uppercase text-[#58d6c0]">{result.analysis?.verdict || "Unknown"}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Risk Score</span>
                    <h4 className="text-lg font-bold text-amber-400">{result.analysis?.risk_score || 0}/100</h4>
                  </div>
                </div>

                <div className="bg-[#080d10] border border-[#1b3037] rounded-xl p-3 space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Summary</span>
                  <p className="text-xs text-slate-200">{result.analysis?.summary || "No summary provided."}</p>
                </div>

                <div className="bg-[#080d10] border border-[#1b3037] rounded-xl p-3 space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Findings Triggered ({result.analysis?.findings?.length || 0})</span>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {(result.analysis?.findings || []).map((f: any, i: number) => (
                      <div key={i} className="text-xs p-2 bg-[#183235] rounded border border-[#58d6c0]/20 flex justify-between">
                        <span>{f.title}</span>
                        <span className="text-[#58d6c0] uppercase">{f.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500 pt-4 border-t border-[#1b3037] text-center">
            Simulated payloads execute in isolation against the real pipeline.
          </div>
        </div>
      </div>
    </div>
  );
};
