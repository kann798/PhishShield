import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  RefreshCw,
  Globe,
  Mail,
  ChevronLeft,
  ChevronRight,
  Shield,
  Eye,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import AnalysisResultView from '../components/AnalysisResultView';
import AlertBanner from '../components/AlertBanner';
import { api, getLocalUserScans } from '../services/api';

export default function ScanHistory({ onSelectScan }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'url' | 'email'
  const [selectedRisk, setSelectedRisk] = useState('all'); // 'all' | 'safe' | 'suspicious' | 'phishing'
  const [actionMessage, setActionMessage] = useState(null);
  const [viewingScan, setViewingScan] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchScans = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch both URL and Email scans from backend or local storage
      const res = await api.getScans({
        type: selectedType !== 'all' ? selectedType : undefined,
        risk: selectedRisk !== 'all' ? selectedRisk : undefined,
        search: search.trim() || undefined,
        limit: 100,
      });

      let list = [];
      if (res && res.success && Array.isArray(res.data)) {
        list = res.data;
      } else {
        list = getLocalUserScans();
      }

      // Filter by target type (URL vs Email)
      if (selectedType !== 'all') {
        list = list.filter(s => s.scan_type === selectedType);
      }

      // Filter by search query across URL, Email subject, sender, and target identifier
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(s =>
          (s.target_identifier || '').toLowerCase().includes(q) ||
          (s.input_url || '').toLowerCase().includes(q) ||
          (s.headers?.Subject || '').toLowerCase().includes(q) ||
          (s.headers?.From || '').toLowerCase().includes(q) ||
          (s.sender_summary?.from || '').toLowerCase().includes(q) ||
          (s.sender_summary?.subject || '').toLowerCase().includes(q)
        );
      }

      // Filter by classification / risk level
      if (selectedRisk !== 'all') {
        const r = selectedRisk.toLowerCase();
        list = list.filter(s => {
          const cls = (s.classification || '').toLowerCase();
          const lvl = (s.risk_level || '').toLowerCase();
          if (r === 'safe') return cls.includes('safe') || cls === 'low' || lvl === 'low';
          if (r === 'suspicious') return cls.includes('suspicious') || lvl === 'medium' || lvl === 'high';
          if (r === 'phishing') return cls.includes('phishing') || lvl === 'critical';
          return cls === r || lvl === r;
        });
      }

      setScans(list);
    } catch (err) {
      setError(err.message || 'Unable to retrieve scan logs');
      let local = getLocalUserScans();
      if (selectedType !== 'all') {
        local = local.filter(s => s.scan_type === selectedType);
      }
      setScans(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();

    const handleScanEvent = () => {
      fetchScans();
    };

    window.addEventListener('phishshield:new-scan', handleScanEvent);
    return () => {
      window.removeEventListener('phishshield:new-scan', handleScanEvent);
    };
  }, [selectedType, selectedRisk]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchScans();
  };

  const handleViewResults = (scan) => {
    setViewingScan(scan);
  };

  // If user clicked "View Results", display the complete original analysis
  if (viewingScan) {
    const isEmailScan = viewingScan.scan_type === 'email';
    return (
      <div className="w-full pb-8 space-y-4 animate-fadeIn">
        <button
          onClick={() => setViewingScan(null)}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#6C8480] hover:text-[#16794B] transition-colors mb-2 cursor-pointer group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Scan History</span>
        </button>
        <AnalysisResultView
          type={isEmailScan ? 'email' : 'url'}
          result={viewingScan}
          onBack={() => setViewingScan(null)}
        />
      </div>
    );
  }

  // Pagination calculations
  const totalResults = scans.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / itemsPerPage));
  const paginatedScans = scans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderClassificationBadge = (cls, score) => {
    const c = (cls || '').toLowerCase();
    const s = Math.round(score || 0);
    if (c === 'critical' || c.includes('phishing') || s >= 76) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#DC2626] text-white">
          Phishing
        </span>
      );
    }
    if (c === 'high' || c.includes('suspicious') || s >= 51) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#EF4444] text-white">
          Suspicious
        </span>
      );
    }
    if (c === 'medium' || s >= 26) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#F59E0B] text-white">
          Suspicious
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#16794B] text-white">
        Likely Safe
      </span>
    );
  };

  const renderRiskLevelBadge = (lvl, score) => {
    let level = lvl;
    if (!level) {
      if (score >= 76) level = 'Critical';
      else if (score >= 51) level = 'High';
      else if (score >= 26) level = 'Medium';
      else level = 'Low';
    }
    const l = level.toLowerCase();
    if (l === 'critical') {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
          Critical
        </span>
      );
    }
    if (l === 'high') {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
          High
        </span>
      );
    }
    if (l === 'medium') {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
          Medium
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
        Low
      </span>
    );
  };

  return (
    <div className="space-y-5 w-full pb-8 font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#404E3B]/15 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1C2518] dark:text-white font-heading">
            Scan History
          </h1>
          <p className="text-xs sm:text-sm text-[#6C8480] mt-0.5 font-sans">
            View and manage all your URL and Email analysis scans.
          </p>
        </div>

        {/* Search Bar & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-[#6C8480] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search URLs, Emails..."
              className="w-full rounded-xl bg-white dark:bg-[#1E271D] border border-[#404E3B]/20 pl-9 pr-3 py-2 text-xs text-[#2C3527] dark:text-[#E6ECE1] font-mono placeholder:text-[#6C8480] focus:outline-none focus:border-[#16794B] shadow-2xs"
            />
          </form>

          {/* Type Filter */}
          <div className="w-full sm:w-32">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl bg-white dark:bg-[#1E271D] border border-[#404E3B]/20 px-3 py-2 text-xs text-[#2C3527] dark:text-[#E6ECE1] font-mono font-semibold focus:outline-none focus:border-[#16794B] shadow-2xs"
            >
              <option value="all">All Targets</option>
              <option value="url">URLs Only</option>
              <option value="email">Emails Only</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="w-full sm:w-32">
            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl bg-white dark:bg-[#1E271D] border border-[#404E3B]/20 px-3 py-2 text-xs text-[#2C3527] dark:text-[#E6ECE1] font-mono font-semibold focus:outline-none focus:border-[#16794B] shadow-2xs"
            >
              <option value="all">All Results</option>
              <option value="safe">Safe Only</option>
              <option value="suspicious">Suspicious</option>
              <option value="phishing">Phishing</option>
            </select>
          </div>
        </div>
      </div>

      {actionMessage && (
        <AlertBanner
          type="success"
          message={actionMessage}
          onDismiss={() => setActionMessage(null)}
        />
      )}

      {error && (
        <AlertBanner
          type="danger"
          title="Error Loading Scans"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Main Table Card */}
      <div className="rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-[#6C8480]">
            <RefreshCw className="w-6 h-6 text-[#16794B] animate-spin mx-auto mb-2" />
            <span>Loading historical telemetry records...</span>
          </div>
        ) : paginatedScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#EEF3EC] dark:bg-[#283526] text-[#404E3B] dark:text-[#E6ECE1] font-mono uppercase text-[11px] font-bold border-b border-[#404E3B]/15">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3 w-20 text-center font-bold">Type</th>
                  <th className="py-3 px-3 w-28 font-bold">Scan ID</th>
                  <th className="py-3 px-3.5 w-36">Date &amp; Time</th>
                  <th className="py-3 px-3.5">Analyzed Target</th>
                  <th className="py-3 px-3 w-28 text-center">Classification</th>
                  <th className="py-3 px-3 w-24 text-center">Risk Level</th>
                  <th className="py-3 px-3 w-20 text-center">Risk Score</th>
                  <th className="py-3 px-4 w-28 text-center font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#404E3B]/10">
                {paginatedScans.map((scan, index) => {
                  const displayIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  const score = Math.round(scan.risk_score || 0);
                  const isEmailScan = scan.scan_type === 'email';
                  const targetDisplay = isEmailScan
                    ? (scan.target_identifier || scan.headers?.Subject || scan.sender_summary?.from || 'Email Content')
                    : (scan.target_identifier || scan.input_url || 'Unknown URL');

                  return (
                    <tr key={scan.id || index} className="hover:bg-[#F4F7F4]/60 dark:hover:bg-[#283526]/50 transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-[#6C8480] text-xs font-semibold">
                        {displayIndex}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isEmailScan ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                            <Mail className="w-3 h-3 text-[#B45309]" />
                            <span>EMAIL</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                            <Globe className="w-3 h-3 text-[#0284C7]" />
                            <span>URL</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-xs font-semibold text-[#2C3527] dark:text-[#E6ECE1]">
                        #{scan.id}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-xs text-[#52665A] dark:text-gray-300 whitespace-nowrap">
                        {scan.created_at}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-xs text-[#2C3527] dark:text-[#E6ECE1] max-w-xs sm:max-w-md truncate" title={targetDisplay}>
                        {targetDisplay}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {renderClassificationBadge(scan.classification, scan.risk_score)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {renderRiskLevelBadge(scan.risk_level, score)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-xs text-[#2C3527] dark:text-[#E6ECE1]">
                        {score}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleViewResults(scan)}
                          className="text-[#0284C7] hover:text-[#0369A1] font-mono text-xs font-bold hover:underline transition-colors cursor-pointer"
                        >
                          View Results
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs font-mono text-[#6C8480] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#16794B] mx-auto" />
            <p className="font-bold text-[#404E3B] dark:text-[#E6ECE1]">No scan history records found</p>
            <p className="text-[#6C8480] max-w-sm mx-auto">
              Scan a URL or Email to see its analysis record appear here.
            </p>
          </div>
        )}

        {/* Pagination and Status Footer */}
        <div className="p-3.5 bg-[#F9FAF9] dark:bg-[#202B20] border-t border-[#404E3B]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#6C8480]">
          <div>
            Showing {totalResults === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalResults)} of {totalResults} results
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1 rounded-lg border border-[#404E3B]/20 bg-white dark:bg-[#1E271D] disabled:opacity-40 cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 py-0.5 rounded-md bg-[#16794B] text-white font-bold">
                {currentPage}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1 rounded-lg border border-[#404E3B]/20 bg-white dark:bg-[#1E271D] disabled:opacity-40 cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-[11px] text-[#6C8480]">10 / page</span>
          </div>
        </div>
      </div>
    </div>
  );
}
