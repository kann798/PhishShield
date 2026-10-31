import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Globe,
  Mail,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import AnalysisResultView from '../components/AnalysisResultView';
import AlertBanner from '../components/AlertBanner';
import { api, getLocalUserScans } from '../services/api';
import { generateScanPdf } from '../utils/pdfGenerator';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'url' | 'email'
  const [previewScan, setPreviewScan] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('All Time');
  const itemsPerPage = 10;

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getScans({
        type: selectedFilter !== 'all' ? selectedFilter : undefined,
        limit: 100,
      });

      let list = [];
      if (res && res.success && Array.isArray(res.data)) {
        list = res.data;
      } else {
        list = getLocalUserScans();
      }

      if (selectedFilter !== 'all') {
        list = list.filter(s => s.scan_type === selectedFilter);
      }

      setReports(list);
    } catch (err) {
      setError(err.message || 'Unable to load analysis reports');
      let local = getLocalUserScans();
      if (selectedFilter !== 'all') {
        local = local.filter(s => s.scan_type === selectedFilter);
      }
      setReports(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();

    const handleScanEvent = () => {
      loadReports();
    };

    window.addEventListener('phishshield:new-scan', handleScanEvent);
    return () => {
      window.removeEventListener('phishshield:new-scan', handleScanEvent);
    };
  }, [selectedFilter]);

  const handleDownloadPdf = (scan) => {
    try {
      generateScanPdf(scan);
      const targetName = scan.scan_type === 'email'
        ? (scan.target_identifier || 'Email')
        : (scan.target_identifier || scan.input_url || 'URL');
      setActionMessage(`Generated PDF report for ${targetName}`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setError(`Failed to generate PDF: ${err.message}`);
    }
  };

  const handleExportAll = () => {
    if (reports.length === 0) {
      setError('No reports available to export.');
      return;
    }
    // Download PDF for the first report
    generateScanPdf(reports[0]);
    setActionMessage(`Exported PDF analysis report.`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Helper to format Report ID like REP-20261030-001
  const formatReportId = (scan, index) => {
    const rawDate = scan.created_at || '2026-10-30';
    const dateCompact = rawDate.slice(0, 10).replace(/-/g, '');
    const num = String(index + 1).padStart(3, '0');
    return `REP-${dateCompact}-${num}`;
  };

  // If user clicked "View", display the complete 7-section report preview!
  if (previewScan) {
    const isEmailScan = previewScan.scan_type === 'email';
    return (
      <div className="w-full pb-8 space-y-4 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#404E3B]/15 pb-3">
          <button
            onClick={() => setPreviewScan(null)}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#6C8480] hover:text-[#16794B] transition-colors cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Reports &amp; Exports</span>
          </button>

          <button
            onClick={() => handleDownloadPdf(previewScan)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16794B] hover:bg-[#13623D] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Report</span>
          </button>
        </div>

        <AnalysisResultView
          type={isEmailScan ? 'email' : 'url'}
          result={previewScan}
          onBack={() => setPreviewScan(null)}
        />
      </div>
    );
  }

  // Pagination
  const totalResults = reports.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / itemsPerPage));
  const paginatedReports = reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            Reports &amp; Exports
          </h1>
          <p className="text-xs sm:text-sm text-[#6C8480] mt-0.5 font-sans">
            View, download and manage your URL and Email analysis reports.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Select Date Range Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDateRangeOpen(!dateRangeOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#1E271D] border border-[#404E3B]/20 text-xs font-mono font-semibold text-[#2C3527] dark:text-[#E6ECE1] hover:bg-[#F4F7F4] transition-all shadow-2xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#16794B]" />
              <span>{selectedDateRange === 'All Time' ? 'Select Date Range' : selectedDateRange}</span>
            </button>

            {dateRangeOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white dark:bg-[#1E271D] border border-[#404E3B]/20 shadow-lg p-1.5 z-20 text-xs font-mono">
                {['All Time', 'Today', 'Last 7 Days', 'Last 30 Days'].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setSelectedDateRange(range);
                      setDateRangeOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      selectedDateRange === range ? 'bg-[#16794B] text-white font-bold' : 'hover:bg-[#F4F7F4] dark:hover:bg-[#283526] text-[#2C3527] dark:text-gray-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reports Filter Dropdown */}
          <select
            value={selectedFilter}
            onChange={(e) => {
              setSelectedFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl bg-white dark:bg-[#1E271D] border border-[#404E3B]/20 px-3 py-2 text-xs font-mono font-semibold text-[#2C3527] dark:text-[#E6ECE1] shadow-2xs focus:outline-none focus:border-[#16794B]"
          >
            <option value="all">All Reports</option>
            <option value="url">URL Reports</option>
            <option value="email">Email Reports</option>
          </select>

          {/* Export All (PDF) Green Button */}
          <button
            onClick={handleExportAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16794B] hover:bg-[#13623D] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All (PDF)</span>
          </button>
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
          title="Notice"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Main Table Card */}
      <div className="rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-[#6C8480]">
            <RefreshCw className="w-6 h-6 text-[#16794B] animate-spin mx-auto mb-2" />
            <span>Loading analysis reports...</span>
          </div>
        ) : paginatedReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#EEF3EC] dark:bg-[#283526] text-[#404E3B] dark:text-[#E6ECE1] font-mono uppercase text-[11px] font-bold border-b border-[#404E3B]/15">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3 w-20 text-center font-bold">Type</th>
                  <th className="py-3 px-3.5 w-36 font-bold">Report ID</th>
                  <th className="py-3 px-3.5 w-36">Date &amp; Time</th>
                  <th className="py-3 px-3.5">Scanned Target</th>
                  <th className="py-3 px-3 w-28 text-center">Classification</th>
                  <th className="py-3 px-3 w-24 text-center">Risk Level</th>
                  <th className="py-3 px-3 w-20 text-center">Risk Score</th>
                  <th className="py-3 px-3 w-20 text-center">Format</th>
                  <th className="py-3 px-4 w-32 text-center font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#404E3B]/10">
                {paginatedReports.map((scan, index) => {
                  const displayIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  const score = Math.round(scan.risk_score || 0);
                  const isEmailScan = scan.scan_type === 'email';
                  const targetDisplay = isEmailScan
                    ? (scan.target_identifier || scan.headers?.Subject || 'Email Content')
                    : (scan.target_identifier || scan.input_url || 'Unknown URL');
                  const repId = formatReportId(scan, displayIndex - 1);

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
                      <td className="py-3 px-3.5 font-mono text-xs font-bold text-[#2C3527] dark:text-[#E6ECE1] whitespace-nowrap">
                        {repId}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-xs text-[#52665A] dark:text-gray-300 whitespace-nowrap">
                        {scan.created_at}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-xs text-[#2C3527] dark:text-[#E6ECE1] max-w-xs sm:max-w-sm truncate" title={targetDisplay}>
                        {targetDisplay}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {renderClassificationBadge(scan.classification)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {renderRiskLevelBadge(scan.risk_level, score)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-xs text-[#2C3527] dark:text-[#E6ECE1]">
                        {score}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#F4F7F4] dark:bg-[#283526] text-[#404E3B] dark:text-gray-300 border border-[#404E3B]/20">
                          PDF
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold">
                          <button
                            onClick={() => setPreviewScan(scan)}
                            className="text-[#0284C7] hover:text-[#0369A1] hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <span className="text-[#6C8480]">|</span>
                          <button
                            onClick={() => handleDownloadPdf(scan)}
                            className="text-[#0284C7] hover:text-[#0369A1] hover:underline cursor-pointer"
                          >
                            Download
                          </button>
                        </div>
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
            <p className="font-bold text-[#404E3B] dark:text-[#E6ECE1]">No reports available</p>
            <p className="text-[#6C8480] max-w-sm mx-auto">
              Run a scan on any URL or Email to generate downloadable reports.
            </p>
          </div>
        )}

        {/* Pagination */}
        <div className="p-3.5 bg-[#F9FAF9] dark:bg-[#202B20] border-t border-[#404E3B]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#6C8480]">
          <div>
            Showing {totalResults === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalResults)} of {totalResults} reports
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
