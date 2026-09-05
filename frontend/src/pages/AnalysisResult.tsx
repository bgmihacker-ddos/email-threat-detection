import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAnalysisById } from '../services/analysisApi';

export default function AnalysisResult() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
        getAnalysisById(id)
            .then(data => {
                setAnalysis(data);
                setLoading(false);
            })
            .catch(_err => {
                setError('Failed to load analysis');
                setLoading(false);
            });
    }
  }, [id]);

  if (loading) return <div className="p-6 text-white">Loading analysis...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
        <h1 className="text-xl font-bold uppercase border-b border-[#151D28] pb-4">THREAT ANALYSIS: {analysis.analysis_id}</h1>

        {/* Header */}
        <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
                <div className="text-4xl font-bold">{analysis.risk_score} <span className="text-sm font-normal text-gray-500">/ 100</span></div>
                <p className={`${analysis.severity === 'high' ? 'text-red-500' : 'text-yellow-500'} font-bold uppercase text-xs mt-2`}>{analysis.verdict}</p>
                <p className="text-[10px] text-gray-400 mt-2">Confidence: {analysis.confidence}%</p>
            </div>
            {/* Header Authentication cards */}
            <AnalysisCard title="SPF" value={analysis.authentication.spf || 'N/A'} />
            <AnalysisCard title="DKIM" value={analysis.authentication.dkim || 'N/A'} />
            <AnalysisCard title="DMARC" value={analysis.authentication.dmarc || 'N/A'} />
        </div>

        {/* Threat Reasoning */}
        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
            <h2 className="text-sm font-bold uppercase mb-4 text-cyan-500">THREAT REASONING</h2>
            <ul className="list-disc pl-5 text-sm text-gray-400 space-y-2">
                {analysis.threat_reasoning.map((reason: string, index: number) => <li key={index}>{reason}</li>)}
            </ul>
        </div>

        {/* Forensic Detailed view structure (simplified for brevity, should be expanded for full implementation) */}
        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
            <h2 className="text-sm font-bold uppercase mb-4 text-cyan-500">FORENSIC FINDINGS</h2>
            <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(analysis.forensic_findings, null, 2)}</pre>
        </div>
    </div>
  );
}

function AnalysisCard({ title, value }: { title: string, value: string }) {
    return (
        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
            <p className="text-gray-500 text-xs font-bold uppercase">{title}</p>
            <p className={`text-xl font-bold mt-1 ${value === 'PASS' ? 'text-green-500' : 'text-red-500'}`}>{value}</p>
        </div>
    );
}
