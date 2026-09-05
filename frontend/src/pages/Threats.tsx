import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getThreats } from '../services/threatApi';
import { Threat } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { Search, Filter, ShieldAlert } from 'lucide-react';

export default function Threats() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [filteredThreats, setFilteredThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    getThreats().then((data) => {
      setThreats(data);
      setFilteredThreats(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = threats;

    if (searchTerm) {
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSeverity !== 'ALL') {
      result = result.filter((t) => t.severity === selectedSeverity);
    }

    if (selectedType !== 'ALL') {
      result = result.filter((t) => t.type === selectedType);
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter((t) => t.status === selectedStatus);
    }

    setFilteredThreats(result);
  }, [searchTerm, selectedSeverity, selectedType, selectedStatus, threats]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="text-cyan-400" />
            Threat Intelligence Database
          </h1>
          <p className="text-xs text-gray-400">Active and archived high-fidelity threat telemetry</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#080D14] p-4 rounded border border-[#151D28] flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search by Threat ID, Target, Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#05080D] border border-[#151D28] pl-9 pr-4 py-2 text-xs text-white rounded focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <Filter size={14} className="text-gray-500" />

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="Credential Theft">Credential Theft</option>
            <option value="Phishing">Phishing</option>
            <option value="BEC">BEC</option>
            <option value="Malware">Malware</option>
            <option value="Suspicious">Suspicious</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Quarantined">Quarantined</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Threats Table */}
      <div className="bg-[#080D14] rounded border border-[#151D28] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 font-mono text-xs animate-pulse">
            LOADING THREAT INTELLIGENCE...
          </div>
        ) : filteredThreats.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs">
            NO THREAT DATA MATCHES THE GIVEN FILTER
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B111A] text-gray-400 border-b border-[#151D28]">
                <tr>
                  <th className="p-3 font-semibold">THREAT ID</th>
                  <th className="p-3 font-semibold">TYPE</th>
                  <th className="p-3 font-semibold">SEVERITY</th>
                  <th className="p-3 font-semibold">CONFIDENCE</th>
                  <th className="p-3 font-semibold">TARGET</th>
                  <th className="p-3 font-semibold">LOCATION</th>
                  <th className="p-3 font-semibold">LAST SEEN</th>
                  <th className="p-3 font-semibold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151D28]">
                {filteredThreats.map((threat) => (
                  <tr
                    key={threat.id}
                    onClick={() => navigate(`/threats/${threat.id}`)}
                    className="hover:bg-[#0E1520] cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono text-cyan-400 font-bold">{threat.id}</td>
                    <td className="p-3 text-gray-200">{threat.type}</td>
                    <td className="p-3">
                      <SeverityBadge severity={threat.severity} />
                    </td>
                    <td className="p-3 font-mono text-gray-300">{threat.confidence}%</td>
                    <td className="p-3 text-gray-300 font-mono truncate max-w-[180px]">{threat.target}</td>
                    <td className="p-3 text-gray-400">{threat.location}</td>
                    <td className="p-3 text-gray-400 font-mono">{new Date(threat.lastSeen).toLocaleTimeString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#151D28] text-gray-300">
                        {threat.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
