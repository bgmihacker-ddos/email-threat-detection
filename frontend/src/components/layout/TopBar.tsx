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
      case 'Indicator': return <Activity className="text-amber-400" size={14} />;
      case 'EmailScan': return <Mail className="text-cyan-400" size={14} />;
      case 'Report': return <FileText className="text-emerald-400" size={14} />;
      case 'User': return <User className="text-violet-400" size={14} />;
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

  const formatResultType = (type: string) => {
    const typeMap: Record<string, string> = {
      Threat: 'THREAT',
      Indicator: 'IOC',
      EmailScan: 'SCAN',
      Report: 'REPORT',
      User: 'USER',
      IntelProvider: 'TI',
      SystemService: 'SYS',
      AuditLog: 'AUDIT'
    };
    return typeMap[type] || type;
  };

  return (
    <header className="relative z-20 flex h-[4.5rem] items-center justify-between border-b border-[#1b3037] bg-[#0c171c]/80 px-4 backdrop-blur-xl md:px-7">
      {/* Breadcrumb / Page Title */}
      <div className="flex items-center gap-3 text-xs">
        <span className="hidden items-center gap-1.5 text-[#8aa49d] sm:flex">
          <Shield size={13} className="text-[#58d6c0]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">SOC / LOCAL NODE</span>
        </span>
        <span className="text-[#3b5e60]"><ArrowRight size={12} /></span>
        <h2 className="hidden text-sm font-medium tracking-wide text-[#d6e1de] md:block">
          Security operations
        </h2>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Global Search */}
        <div className="relative hidden lg:block" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-600" size={14} />
            <input
              type="text"
              placeholder="Search: threats, IOCs, scans, reports, domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length > 2 && setShowResults(true)}
              className="w-96 rounded-md border border-[#29454b] bg-[#101f24] py-2 pl-10 pr-8 text-xs text-[#d6e1de] transition-all placeholder:text-[#718581] focus:border-[#58d6c0] focus:outline-none focus:ring-1 focus:ring-[#58d6c0]/20"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute left-0 top-full z-50 mt-2 max-h-[60vh] w-[400px] overflow-y-auto rounded-lg border border-[#29454b] bg-[#101b21] shadow-2xl">
              <div className="border-b border-[#1b3037] bg-[#0c171c] p-3">
                <p className="text-xs text-gray-400 font-bold uppercase">
                  {searching ? 'Searching threat intelligence...' : `${searchResults.length} results found`}
                </p>
              </div>

              {searching ? (
                <div className="p-4 text-center text-gray-400 text-xs animate-pulse">
                  Querying index...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-gray-600 text-xs">
                  <Search size={24} className="mx-auto mb-2 text-gray-700" />
                  No matches found for "{searchQuery}"
                  <p className="mt-2 text-[10px] text-gray-700">Try searching for: threat ID, domain, IP, or hash</p>
                </div>
              ) : (
                <div className="divide-y divide-[#1b3037]">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full p-3 text-left hover:bg-[#1b2b31] transition-colors flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-white truncate">{result.title}</span>
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded ${
                            result.type === 'Threat' ? 'bg-red-950/40 text-red-400 border border-red-800/40' :
                            result.type === 'Indicator' ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40' :
                            result.type === 'EmailScan' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/40' :
                            'bg-[#1b3037] text-gray-300'
                          }`}>
                            {formatResultType(result.type)}
                          </span>
                          <span className="text-[9px] text-cyan-400 font-mono ml-auto">
                            {result.relevance}% match
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{result.description}</p>
                      </div>
                      <ExternalLink size={12} className="text-gray-600 flex-shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="flex items-center gap-3">
          {/* Live feed indicator */}
          <div className="hidden items-center gap-2 rounded-md border border-[#31514e] bg-[#142b2d] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300 md:flex">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Investigation Services Online
          </div>

          {/* Notification bell */}
          <button className="relative flex h-9 w-9 items-center justify-center rounded-md border border-[#29454b] text-[#8aa49d] transition-colors hover:border-[#58d6c0] hover:text-[#d6e1de]">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-2.5 border-l border-[#1b3037] pl-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#3b5e60] bg-[#183235] text-xs font-bold text-[#8ce2d0]">
                {user?.name?.charAt(0) || '?'}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-semibold text-gray-200">{user?.name || 'Analyst'}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-cyan-500">
                  {user?.role === 'admin' ? 'Administrator' : 'Security Analyst'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function ArrowRight({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>;
}
