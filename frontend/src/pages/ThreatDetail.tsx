import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getThreatById } from '../services/threatApi';
import { Threat } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { useToast } from '../context/ToastContext';
import { Shield, AlertTriangle, ArrowLeft, CheckCircle2, Circle, Clock } from 'lucide-react';

export default function ThreatDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [threat, setThreat] = useState<Threat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getThreatById(id).then((data) => {
        setThreat(data || null);
        setLoading(false);
      });
    }
  }, [id]);

  const handleAction = (actionName: string) => {
    addToast(`${actionName} action executed (DEMO)`, 'success');
  };

  if (loading) {
    return <div className="p-8 text-center text-cyan-400 font-mono text-sm animate-pulse">LOADING THREAT CONSOLE...</div>;
  }

  if (!threat) {
    return (
      <div className="p-8 text-center text-gray-400 space-y-4">
        <p>Threat details not found for ID: {id}</p>
        <button onClick={() => navigate('/threats')} className="text-cyan-400 text-xs underline">
          Back to Threats List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/threats')}
          className="p-1.5 bg-[#080D14] border border-[#151D28] text-gray-400 hover:text-white rounded"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="text-red-500" />
            Threat Details: {threat.id}
          </h1>
          <p className="text-xs text-gray-400">Deep telemetry and campaign investigation</p>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">SEVERITY / RISK</p>
          <div className="mt-2 flex items-center gap-2">
            <SeverityBadge severity={threat.severity} />
            <span className="text-xs text-gray-400">Confidence: {threat.confidence}%</span>
          </div>
        </div>

        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">THREAT TYPE</p>
          <p className="text-base font-bold text-cyan-400 mt-1">{threat.type}</p>
        </div>

        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ORIGIN LOCATION</p>
          <p className="text-base font-bold text-white mt-1">{threat.location}</p>
        </div>

        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">CURRENT STATUS</p>
          <p className="text-base font-bold text-yellow-400 mt-1 uppercase">{threat.status}</p>
        </div>
      </div>

      {/* Description & Target */}
      <div className="bg-[#080D14] p-5 rounded border border-[#151D28] space-y-3">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Threat Summary</h2>
        <p className="text-xs text-gray-300 leading-relaxed">{threat.description}</p>
        <div className="flex gap-6 text-xs text-gray-400 pt-2 border-t border-[#151D28]">
          <div><span className="text-gray-500">Target User:</span> <span className="font-mono text-white">{threat.target}</span></div>
          {threat.sender && <div><span className="text-gray-500">Sender:</span> <span className="font-mono text-red-400">{threat.sender}</span></div>}
        </div>
      </div>

      {/* Attack Stages / Timeline */}
      {threat.attackStages && (
        <div className="bg-[#080D14] p-5 rounded border border-[#151D28] space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Clock size={14} className="text-cyan-400" />
            Attack Chain Execution Pipeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {threat.attackStages.map((stage, idx) => (
              <div
                key={idx}
                className={`p-3 rounded border text-xs flex flex-col justify-between ${
                  stage.status === 'completed'
                    ? 'bg-[#0B151A] border-cyan-800 text-cyan-300'
                    : stage.status === 'active'
                    ? 'bg-[#1A0F0B] border-red-800 text-red-300 animate-pulse'
                    : 'bg-[#05080D] border-[#151D28] text-gray-600'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1 font-bold text-[11px] mb-1">
                    {stage.status === 'completed' ? (
                      <CheckCircle2 size={12} className="text-cyan-400" />
                    ) : stage.status === 'active' ? (
                      <AlertTriangle size={12} className="text-red-400" />
                    ) : (
                      <Circle size={12} />
                    )}
                    {stage.stage}
                  </div>
                  <p className="text-[10px] opacity-80">{stage.description}</p>
                </div>
                <span className="text-[9px] uppercase font-mono mt-2 font-bold tracking-wider">
                  [{stage.status}]
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Associated Indicators & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#080D14] p-5 rounded border border-[#151D28] space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Observed IOCs & Network Indicators</h2>
          {threat.indicators && threat.indicators.length > 0 ? (
            <div className="space-y-2">
              {threat.indicators.map((ioc, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#05080D] p-2.5 rounded border border-[#151D28] text-xs font-mono">
                  <span className="text-cyan-400 truncate mr-2">{ioc}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(ioc);
                      addToast('IOC copied to clipboard', 'info');
                    }}
                    className="text-[10px] bg-[#151D28] hover:bg-cyan-900 px-2 py-1 rounded text-white"
                  >
                    COPY
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No secondary IOCs extracted.</p>
          )}
        </div>

        {/* Remediation & Response */}
        <div className="bg-[#080D14] p-5 rounded border border-[#151D28] space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recommended Actions</h2>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleAction('Quarantine Threat')}
              className="w-full py-2 px-3 bg-red-900/40 border border-red-700 hover:bg-red-900/70 text-red-200 text-xs font-bold rounded"
            >
              Quarantine Email
            </button>
            <button
              onClick={() => handleAction('Block Source Domain')}
              className="w-full py-2 px-3 bg-[#101722] border border-[#151D28] hover:bg-[#152030] text-gray-300 text-xs font-bold rounded"
            >
              Block Domain
            </button>
            <button
              onClick={() => handleAction('Create Security Incident')}
              className="w-full py-2 px-3 bg-cyan-900/40 border border-cyan-700 hover:bg-cyan-900/70 text-cyan-200 text-xs font-bold rounded"
            >
              Escalate to Incident
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
