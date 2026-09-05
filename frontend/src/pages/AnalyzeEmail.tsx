import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeEmail } from '../services/analysisApi';

const ANALYSIS_STAGES = [
  'PARSING EMAIL',
  'ANALYZING HEADERS',
  'CHECKING AUTHENTICATION',
  'EXTRACTING URLS',
  'ANALYZING DOMAIN',
  'ANALYZING CONTENT',
  'CALCULATING THREAT SCORE'
];

export default function AnalyzeEmail() {
  const [emailContent, setEmailContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!emailContent) return;
    setIsAnalyzing(true);

    for (const stage of ANALYSIS_STAGES) {
      setCurrentStage(stage);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const analysisId = await analyzeEmail(emailContent);
    navigate(`/analysis/${analysisId}`);
  };

  const loadDemoEmail = () => {
    setEmailContent("From: security-alert@micros0ft-demo.com\nSubject: Urgent Account Verification Required\nBody: Your account requires immediate verification...");
  }

  if (isAnalyzing) {
      return (
          <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-white">
              <div className="text-cyan-400 font-bold mb-4 animate-pulse">ANALYZING...</div>
              <div className="text-lg font-mono">{currentStage}</div>
          </div>
      )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-white uppercase tracking-wider">ANALYZE EMAIL</h1>
      <div className="bg-[#080D14] p-6 border border-[#151D28] rounded space-y-4">
          <div className="border border-dashed border-[#151D28] p-10 text-center text-gray-500 rounded">
            DROP .EML FILE HERE OR BROWSE
          </div>
          <button onClick={loadDemoEmail} className="text-cyan-400 text-xs">LOAD DEMO PHISHING EMAIL</button>
          <textarea
            className="w-full h-40 bg-[#0B111A] border border-[#151D28] p-4 text-gray-300 text-sm rounded"
            placeholder="Paste raw email content here..."
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
          />
          <div className="flex gap-4">
            <button onClick={handleAnalyze} className="bg-cyan-600 text-white px-6 py-2 rounded font-bold text-xs uppercase">Analyze Email</button>
            <button className="bg-[#0B111A] text-gray-300 px-6 py-2 rounded font-bold text-xs uppercase" onClick={()=>setEmailContent('')}>Clear</button>
          </div>
      </div>
    </div>
  );
}
