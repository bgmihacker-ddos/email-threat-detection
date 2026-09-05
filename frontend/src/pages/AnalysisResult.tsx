import { useParams } from 'react-router-dom';

export default function AnalysisResult() {
  const { id } = useParams();

  return (
    <div className="p-6 space-y-6 text-white">
        <h1 className="text-xl font-bold uppercase">THREAT ANALYSIS: {id}</h1>

        {/* Header */}
        <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
                <div className="text-4xl font-bold text-red-500">94 / 100</div>
                <p className="text-red-500 font-bold uppercase text-xs">CRITICAL</p>
                <p className="text-sm mt-1">Credential Phishing</p>
                <p className="text-[10px] text-gray-400">Confidence: 97%</p>
            </div>
            {/* Other KPI cards */}
            <AnalysisCard title="SPF" value="FAIL" />
            <AnalysisCard title="DKIM" value="FAIL" />
            <AnalysisCard title="DMARC" value="FAIL" />
        </div>

        {/* Content sections would follow here: Threat Reasoning, IoC, Components, etc. */}
        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
            <h2 className="text-sm font-bold uppercase mb-4">THREAT REASONING</h2>
            <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
                <li>Sender resembles trusted organization</li>
                <li>Reply-To mismatch</li>
                <li>DMARC failure</li>
            </ul>
        </div>
    </div>
  );
}

function AnalysisCard({ title, value }: { title: string, value: string }) {
    return (
        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
            <p className="text-gray-500 text-xs font-bold uppercase">{title}</p>
            <p className="text-xl font-bold text-white mt-1">{value}</p>
        </div>
    );
}
