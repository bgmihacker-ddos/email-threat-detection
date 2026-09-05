import { useState, useEffect, useRef } from 'react';
import { Bell, User, Search, X, ExternalLink, Shield, FileText, Mail, Activity, Wifi, Server, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { globalSearch, SearchResult } from '../../services/searchApi';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        setSearching(true);
        globalSearch(searchQuery).then(results => {
          setSearchResults(results);
          setSearching(false);
          setShowResults(true);
        });
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'Threat': return <Shield className="text-red-400" size={14} />;
      case 'Indicator': return <Activity className="text-yellow-400" size={14} />;
      case 'EmailScan': return <Mail className="text-cyan-400" size={14} />;
      case 'Report': return <FileText className="text-green-400" size={14} />;
      case 'User': return <User className="text-purple-400" size={14} />;
      case 'IntelProvider': return <Wifi className="text-blue-400" size={14} />;
      case 'SystemService': return <Server className="text-orange-400" size={14} />;
      case 'AuditLog': return <Eye className="text-gray-400" size={14} />;
      default: return <Search className="text-gray-400" size={14} />;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setSearchQuery('');

    switch (result.type) {
      case 'Threat':
        navigate(`/threats/${result.id}`);
        addToast(`Navigated to threat: ${result.data.type}`, 'info');
        break;
      case 'Indicator':
        addToast(`Opening IOC: ${result.data.ioc}`, 'info');
        break;
      case 'EmailScan':
        navigate(`/analysis/${result.id}`);
        addToast(`Opening email scan: ${result.data.subject}`, 'info');
        break;
      case 'Report':
        addToast(`Opening report: ${result.data.title}`, 'info');
        break;
      case 'User':
        addToast(`Viewing user: ${result.data.name}`, 'info');
        break;
      default:
        addToast(`Viewing ${result.type.toLowerCase()}`, 'info');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <header className="h-14 bg-[#080D14] border-b border-[#151D28] flex items-center justify-between px-6">
      <h2 className="text-sm font-bold text-white tracking-widest uppercase">Dashboard</h2>

      <div className="flex items-center gap-6">
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-600" size={14} />
            <input
              type="text"
              placeholder="Global search: threats, users, scans, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length > 2 && setShowResults(true)}
              className="bg-[#05080D] border border-[#151D28] text-gray-300 text-xs py-1.5 pl-10 pr-8 rounded w-80 focus:outline-none focus:border-cyan-800"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-2 text-gray-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 mt-1 w-96 bg-[#080D14] border border-[#151D28] rounded shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-[#151D28]">
                <p className="text-xs text-gray-400 font-bold uppercase">
                  {searching ? 'Searching...' : `Results (${searchResults.length})`}
                </p>
              </div>

              {searching ? (
                <div className="p-4 text-center text-gray-400 text-xs animate-pulse">
                  Searching across all data...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-xs">
                  No matches found for "{searchQuery}"
                </div>
              ) : (
                <div className="divide-y divide-[#151D28]">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full p-3 text-left hover:bg-[#0E1520] transition-colors flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-white truncate">{result.title}</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#151D28] text-gray-300 rounded">
                            {result.type}
                          </span>
                          <span className="text-[9px] text-cyan-400 font-bold ml-auto">
                            {result.relevance}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{result.description}</p>
                      </div>
                      <ExternalLink size={12} className="text-gray-500 flex-shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] bg-[#0E1520] border border-[#151D28] px-3 py-1 rounded">
            <span className="text-gray-500 font-bold">THREAT ENGINE:</span>
            <span className="text-cyan-400 uppercase">DEMO</span>
        </div>
        <button className="text-gray-400 hover:text-cyan-400 transition-colors">
          <Bell size={16} />
        </button>
        <div className="flex items-center gap-2 text-gray-400">
          <User size={16} />
          <div className="text-xs">
            <p className="text-white font-bold">{user?.name || 'Guest'}</p>
            <p className="text-[9px] uppercase tracking-widest text-cyan-500">{user?.role === 'admin' ? 'ADMINISTRATOR' : 'USER'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
