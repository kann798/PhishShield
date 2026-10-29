import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Shield,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { api } from '../services/api';
import { generateScanPdf } from '../utils/pdfGenerator';

export default function Reports() {
  const [scans, setScans] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState('');
  const [currentScan, setCurrentScan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScanOptions();
  }, []);

  const loadScanOptions = async () => {
    try {
      const res = await api.getScans({ limit: 30 });
      if (res.success && res.data.length > 0) {
        setScans(res.data);
        setSelectedScanId(res.data[0].id);
        fetchScanDetail(res.data[0].id);
      }
    } catch {
      setError('Unable to load scan list for report preview.');
    }
  };

  const fetchScanDetail = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getScan(id);
      if (res.success) {
        setCurrentScan(res.data);
      }
    } catch (err) {
      setError(err.message || 'Error loading report details');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedScanId(id);
    fetchScanDetail(id);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 w-full pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#404E3B]/15 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#404E3B] font-heading flex items-center gap-3">
            <div className="p-3 bg-[#7B9669]/20 border border-[#7B9669]/40 rounded-2xl text-[#404E3B] shadow-sm">
              <FileText className="w-5 h-5 text-[#404E3B]" />
            </div>
            <span>EXECUTIVE SECURITY REPORTS</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6C8480] mt-1 font-sans">
            Generate, preview, and download structured PDF, JSON, and CSV security audit documentation
          </p>
        </div>

        {currentScan && (
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => generateScanPdf(currentScan)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#404E3B]/15 hover:bg-[#EEF3EC] text-[#404E3B] text-xs font-mono font-semibold transition-all shadow-sm cursor-pointer"
              title="Download Executive Security Audit Report (PDF)"
            >
              <Download className="w-3.5 h-3.5 text-[#7B9669]" />
              <span>Download PDF</span>
            </button>
            <a
              href={api.getExportUrl(currentScan.id, 'json')}
              download
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#404E3B]/15 hover:bg-[#EEF3EC] text-[#404E3B] text-xs font-mono font-semibold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#7B9669]" />
              <span>Export JSON</span>
            </a>
            <a
              href={api.getExportUrl(currentScan.id, 'csv')}
              download
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#404E3B]/15 hover:bg-[#EEF3EC] text-[#404E3B] text-xs font-mono font-semibold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#7B9669]" />
              <span>Export CSV</span>
            </a>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#404E3B]/15 hover:bg-[#EEF3EC] text-[#404E3B] text-xs font-mono font-semibold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-[#7B9669]" />
              <span>Print Memo</span>
            </button>
          </div>
        )}
      </div>

      {/* Select Scan Dropdown Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3 shadow-sm border border-[#404E3B]/15 relative overflow-hidden">
        <label htmlFor="scan-selector" className="text-xs font-mono text-[#404E3B] font-bold uppercase shrink-0 tracking-wider">
          Select Scan Report:
        </label>
        <select
          id="scan-selector"
          value={selectedScanId}
          onChange={handleSelectChange}
          className="flex-1 w-full rounded-xl bg-[#F4F7F4] border border-[#404E3B]/20 px-3.5 py-2.5 text-xs text-[#2C3527] font-mono focus:outline-none focus:border-[#7B9669]"
        >
          {scans.map((s) => (
            <option key={s.id} value={s.id}>
              #{s.id} — [{s.scan_type.toUpperCase()}] {s.target_identifier} ({s.classification} - {s.risk_score}/100)
            </option>
          ))}
        </select>
        <button
          onClick={() => fetchScanDetail(selectedScanId)}
          className="p-2.5 rounded-xl bg-[#EEF3EC] hover:bg-[#7B9669] hover:text-white text-[#404E3B] transition-colors border border-[#404E3B]/15 shadow-sm"
          title="Reload Report"
          aria-label="Reload Selected Report"
        >
          <RefreshCw className={`w-4 h-4 text-[#7B9669] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-800 font-mono">
          {error}
        </div>
      )}

      {/* Report Preview Document */}
      {currentScan ? (
        <div className="bg-white rounded-2xl border border-[#404E3B]/15 p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
          {/* Memo Header */}
          <div className="border-b border-[#404E3B]/15 pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono uppercase tracking-widest text-[#7B9669] font-bold">
                  PHISHSHIELD SECURITY ADVISORY
                </span>
                {currentScan.is_sample && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7B9669]/15 border border-[#7B9669]/30 text-[#404E3B] font-bold">
                    Synthetic Demonstration Sample
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#404E3B] tracking-tight font-sans">
                Threat Inspection Incident Memo #{currentScan.id}
              </h2>
              <p className="text-xs text-[#6C8480] mt-1 flex items-center gap-4 font-mono font-medium">
                <span>Date: {currentScan.created_at}</span>
                <span>Type: {currentScan.scan_type.toUpperCase()} ANALYSIS</span>
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#EEF3EC] border border-[#404E3B]/15 rounded-2xl p-3.5 shadow-xs">
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-[#6C8480] font-bold block">Threat Score</span>
                <span className="text-2xl font-black font-mono text-[#404E3B]">
                  {currentScan.risk_score}
                  <span className="text-xs text-[#6C8480] font-normal">/100</span>
                </span>
              </div>
              <RiskBadge classification={currentScan.classification} size="md" />
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#404E3B] font-mono">
              1. Executive Assessment Summary
            </h3>
            <div className="p-4 rounded-xl bg-[#F4F7F4] border border-[#404E3B]/10 text-xs text-[#2C3527] leading-relaxed font-mono">
              <div className="mb-2">
                <span className="text-[#6C8480] font-bold">Target Identifier: </span>
                <span className="text-[#404E3B] break-all font-semibold">{currentScan.target_identifier}</span>
              </div>
              <p className="text-[#2C3527]">
                Evaluation determined a <strong>{currentScan.classification.toUpperCase()}</strong> threat classification with {currentScan.indicator_count || currentScan.indicators?.length || 0} triggering heuristic indicators.
              </p>
            </div>
          </div>

          {/* Section 2: Detailed Indicators Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#404E3B] font-mono">
              2. Identified Technical Indicators
            </h3>
            {currentScan.indicators?.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-[#404E3B]/15">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#EEF3EC] text-[#404E3B] uppercase text-[10px] border-b border-[#404E3B]/15 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Indicator</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3">Evidence</th>
                      <th className="py-2.5 px-3">Technical Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#404E3B]/10 bg-white">
                    {currentScan.indicators.map((ind, idx) => (
                      <tr key={idx} className="hover:bg-[#F4F7F4]">
                        <td className="py-2.5 px-3 font-bold text-[#404E3B]">{ind.name}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] uppercase font-bold text-[#7B9669]">{ind.severity}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#2C3527] text-[11px] max-w-xs truncate font-semibold">
                          {ind.evidence || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 text-[#6C8480] text-[11px] max-w-md">
                          {ind.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#EEF3EC] border border-[#404E3B]/15 text-xs text-[#7B9669] flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>No malicious indicators detected. Clean inspection record.</span>
              </div>
            )}
          </div>

          {/* Section 3: Recommendations */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#404E3B] font-mono">
              3. Recommended Mitigation Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentScan.recommendations?.map((rec, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#F4F7F4] border border-[#404E3B]/10 text-xs space-y-1">
                  <h4 className="font-bold text-[#404E3B] font-mono flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#7B9669]" />
                    <span>{rec.action}</span>
                  </h4>
                  <p className="text-[#6C8480] leading-relaxed text-[11px]">{rec.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-xs font-mono text-[#6C8480] rounded-2xl border border-[#404E3B]/15 bg-white shadow-sm">
          No scan selected. Choose a scan from the dropdown above.
        </div>
      )}
    </div>
  );
}
