import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  Trash2,
  Download,
  Eye,
  RefreshCw,
  Globe,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import AlertBanner from '../components/AlertBanner';
import { api } from '../services/api';

export default function ScanHistory({ onSelectScan }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [actionMessage, setActionMessage] = useState(null);

  const fetchScans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getScans({
        type: selectedType,
        risk: selectedRisk,
        search: search,
      });
      if (res.success) {
        setScans(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve scan logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [selectedType, selectedRisk]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchScans();
  };

  const handleDeleteSingle = async (scanId) => {
    if (!window.confirm(`Are you sure you want to delete scan record #${scanId}?`)) {
      return;
    }

    try {
      await api.deleteScan(scanId);
      setActionMessage(`Scan record #${scanId} deleted.`);
      fetchScans();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setError(`Failed to delete record: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('CAUTION: This will delete ALL scan history from the database. Are you sure?')) {
      return;
    }

    try {
      const res = await api.clearAllScans();
      setActionMessage(res.message || 'Scan history cleared.');
      fetchScans();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setError(`Failed to clear history: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 w-full pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading flex items-center gap-3">
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/35 rounded-2xl text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <History className="w-5 h-5 text-[#10B981]" />
            </div>
            <span>SECURITY AUDIT & SCAN HISTORY</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Persisted SQLite logs, threat level classifications, and downloadable forensic telemetry reports
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchScans}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[rgba(8,20,40,0.55)] backdrop-blur-md border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white transition-all shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] disabled:opacity-50"
            title="Refresh Scan History"
            aria-label="Refresh Scan History"
          >
            <RefreshCw className={`w-4 h-4 text-[#10B981] ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleClearAll}
            disabled={loading || scans.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-mono font-bold border border-rose-500/35 transition-all shadow-[0_0_12px_rgba(239,68,68,0.2)] disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <AlertBanner
          type="success"
          message={actionMessage}
          onDismiss={() => setActionMessage(null)}
        />
      )}

      {/* Filter and Search Bar Card */}
      <div className="liquid-glass-card rounded-2xl p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.35)] border border-white/10 relative overflow-hidden">
        {/* Specular Top Line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search targets, URLs, subjects, or indicators..."
              className="w-full rounded-xl bg-[rgba(6,16,36,0.75)] border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/25 transition-all shadow-inner"
            />
          </div>

          {/* Filter by Type */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-xl bg-[rgba(6,16,36,0.75)] border border-white/10 px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-[#10B981]"
            >
              <option value="all">All Targets (URLs & Emails)</option>
              <option value="url">URLs Only</option>
              <option value="email">Emails Only</option>
            </select>
          </div>

          {/* Filter by Risk Level */}
          <div className="sm:col-span-3">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full rounded-xl bg-[rgba(6,16,36,0.75)] border border-white/10 px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-[#10B981]"
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical Risk</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </form>
      </div>

      {/* Error Notice */}
      {error && (
        <AlertBanner
          type="danger"
          title="Error Loading Scans"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Scan History Table / List */}
      <div className="liquid-glass-card rounded-2xl border border-white/10 bg-[rgba(10,24,52,0.65)] backdrop-blur-[28px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.5)] relative">
        {/* Specular Top Line */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400">
            <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
            <span>Fetching historical telemetry records...</span>
          </div>
        ) : scans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[rgba(8,20,40,0.85)] text-slate-300 uppercase text-xs border-b border-white/10 font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Analyzed Target</th>
                  <th className="py-3.5 px-4">Threat Level</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#10B981]">#{scan.id}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(6,16,36,0.7)] border border-white/10 text-xs text-slate-200 font-bold">
                        {scan.scan_type === 'url' ? (
                          <Globe className="w-3.5 h-3.5 text-[#10B981]" />
                        ) : (
                          <Mail className="w-3.5 h-3.5 text-sky-400" />
                        )}
                        <span>{scan.scan_type.toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-medium max-w-sm">
                      <div className="truncate font-mono text-xs" title={scan.target_identifier}>
                        {scan.target_identifier}
                      </div>
                      {scan.is_sample && (
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[#10B981] mt-1 inline-block font-bold">
                          Sample Demonstration Record
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge classification={scan.classification} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-white text-sm">{scan.risk_score}</span>
                      <span className="text-xs text-slate-400">/100</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-xs whitespace-nowrap">
                      {scan.created_at}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectScan(scan.id)}
                          className="p-1.5 rounded-lg bg-[rgba(6,16,36,0.7)] hover:bg-emerald-500/20 text-[#10B981] transition-colors border border-white/10 shadow-sm"
                          title="Inspect Details"
                          aria-label={`Inspect Details for Scan #${scan.id}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={api.getExportUrl(scan.id, 'json')}
                          download
                          className="p-1.5 rounded-lg bg-[rgba(6,16,36,0.7)] hover:bg-emerald-500/20 text-slate-300 hover:text-[#10B981] transition-colors border border-white/10 shadow-sm"
                          title="Download JSON Report"
                          aria-label={`Download JSON for Scan #${scan.id}`}
                        >
                          <Download className="w-3.5 h-3.5 text-[#10B981]" />
                        </a>
                        <button
                          onClick={() => handleDeleteSingle(scan.id)}
                          className="p-1.5 rounded-lg bg-[rgba(6,16,36,0.7)] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors border border-white/10 shadow-sm"
                          title="Delete Record"
                          aria-label={`Delete Scan #${scan.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs font-mono text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
            <p className="font-bold text-white">No matching scan history records found</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria or run a new scan from the URL or Email Analyzer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
