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
import { exportScanAsJson } from '../utils/exportUtils';
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

  const handleDeleteSingle = async (scanId) => {
    if (!window.confirm(`Are you sure you want to delete scan record #${scanId}?`)) {
      return;
    }

    try {
      const res = await api.deleteScan(scanId);
      setActionMessage(res?.message || `Scan record #${scanId} deleted.`);
      setScans(prev => prev.filter(s => s.id !== scanId && s.id !== Number(scanId)));
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
      setActionMessage(res?.message || 'Scan history cleared.');
      setScans([]);
      fetchScans();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setError(`Failed to clear history: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 w-full pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#404E3B]/15 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C2518] dark:text-white font-heading flex items-center gap-3">
            <div className="p-3 bg-[#7B9669]/20 border border-[#7B9669]/40 rounded-2xl text-[#404E3B] dark:text-[#BAC8B1] shadow-sm">
              <History className="w-5 h-5 text-[#404E3B] dark:text-[#BAC8B1]" />
            </div>
            <span>SECURITY AUDIT &amp; <span className="text-[#7B9669] dark:text-[#9FC48A]">SCAN HISTORY</span></span>
          </h1>
          <p className="text-xs sm:text-sm text-[#404E3B]/80 dark:text-[#BAC8B1] mt-1 font-sans font-medium page-subtitle">
            Persisted SQLite logs, threat level classifications, and downloadable forensic telemetry reports
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchScans}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-[#404E3B]/15 hover:bg-[#EEF3EC] text-[#404E3B] transition-all shadow-sm disabled:opacity-50"
            title="Refresh Scan History"
            aria-label="Refresh Scan History"
          >
            <RefreshCw className={`w-4 h-4 text-[#7B9669] ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleClearAll}
            disabled={loading || scans.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-mono font-bold border border-rose-200 transition-all shadow-sm disabled:opacity-50"
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
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#404E3B]/15 relative overflow-hidden">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#404E3B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search targets, URLs, subjects, or indicators..."
              className="w-full rounded-xl bg-[#F4F7F4] border border-[#404E3B]/20 pl-10 pr-4 py-2.5 text-xs text-[#2C3527] font-mono placeholder:text-[#2D3D28] placeholder:not-italic dark:placeholder:text-[#2D3D28] focus:outline-none focus:border-[#7B9669] focus:ring-2 focus:ring-[#7B9669]/25 transition-all"
            />
          </div>

          {/* Filter by Type */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-xl bg-[#F4F7F4] border border-[#404E3B]/20 px-3 py-2.5 text-xs text-[#111827] dark:text-[#111827] font-mono font-semibold focus:outline-none focus:border-[#7B9669]"
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
              className="w-full rounded-xl bg-[#F4F7F4] border border-[#404E3B]/20 px-3 py-2.5 text-xs text-[#111827] dark:text-[#111827] font-mono font-semibold focus:outline-none focus:border-[#7B9669]"
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
      <div className="rounded-2xl border border-[#404E3B]/15 bg-white overflow-hidden shadow-sm relative">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-[#6C8480]">
            <RefreshCw className="w-6 h-6 text-[#7B9669] animate-spin mx-auto mb-2" />
            <span>Fetching historical telemetry records...</span>
          </div>
        ) : scans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#EEF3EC] text-[#404E3B] uppercase text-xs border-b border-[#404E3B]/15 font-bold tracking-wider">
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
              <tbody className="divide-y divide-[#404E3B]/10">
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-[#F4F7F4] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#7B9669]">#{scan.id}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF3EC] border border-[#404E3B]/15 text-xs text-[#404E3B] font-bold">
                        {scan.scan_type === 'url' ? (
                          <Globe className="w-3.5 h-3.5 text-[#7B9669]" />
                        ) : (
                          <Mail className="w-3.5 h-3.5 text-[#6C8480]" />
                        )}
                        <span>{scan.scan_type.toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#2C3527] font-medium max-w-sm">
                      <div className="truncate font-mono text-xs" title={scan.target_identifier}>
                        {scan.target_identifier}
                      </div>
                      {scan.is_sample && (
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-[#7B9669]/15 border border-[#7B9669]/30 text-[#404E3B] mt-1 inline-block font-bold">
                          Sample Demonstration Record
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge classification={scan.classification} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-[#404E3B] text-sm">{scan.risk_score}</span>
                      <span className="text-xs text-[#6C8480]">/100</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#6C8480] text-xs whitespace-nowrap">
                      {scan.created_at}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectScan(scan.id)}
                          className="p-1.5 rounded-lg bg-[#EEF3EC] hover:bg-[#7B9669] hover:text-white text-[#404E3B] transition-colors border border-[#404E3B]/15 shadow-sm"
                          title="Inspect Details"
                          aria-label={`Inspect Details for Scan #${scan.id}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => exportScanAsJson(scan)}
                          className="p-1.5 rounded-lg bg-[#EEF3EC] hover:bg-[#7B9669] hover:text-white text-[#404E3B] transition-colors border border-[#404E3B]/15 shadow-sm cursor-pointer"
                          title="Download JSON Report"
                          aria-label={`Download JSON for Scan #${scan.id}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(scan.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors border border-rose-200 shadow-sm"
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
          <div className="p-12 text-center text-xs font-mono text-[#6C8480] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#7B9669] mx-auto" />
            <p className="font-bold text-[#404E3B]">No matching scan history records found</p>
            <p className="text-[#6C8480] max-w-sm mx-auto">
              Try adjusting your search criteria or run a new scan from the URL or Email Analyzer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
