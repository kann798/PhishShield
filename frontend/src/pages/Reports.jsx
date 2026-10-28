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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans flex items-center gap-3">
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <span>EXECUTIVE SECURITY REPORTS</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate, preview, and download structured PDF, JSON, and CSV security audit documentation
          </p>
        </div>

        {currentScan && (
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => generateScanPdf(currentScan)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[rgba(10,24,52,0.65)] backdrop-blur-md border border-white/15 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 text-xs font-mono font-semibold transition-all shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] cursor-pointer"
              title="Download Executive Security Audit Report (PDF)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download PDF</span>
            </button>
            <a
              href={api.getExportUrl(currentScan.id, 'json')}
              download
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[rgba(10,24,52,0.65)] backdrop-blur-md border border-white/15 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 text-xs font-mono font-semibold transition-all shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export JSON</span>
            </a>
            <a
              href={api.getExportUrl(currentScan.id, 'csv')}
              download
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[rgba(10,24,52,0.65)] backdrop-blur-md border border-white/15 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 text-xs font-mono font-semibold transition-all shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </a>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[rgba(10,24,52,0.65)] backdrop-blur-md border border-white/15 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 text-xs font-mono font-semibold transition-all shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print Memo</span>
            </button>
          </div>
        )}
      </div>

      {/* Select Scan Dropdown Bar */}
      <div className="liquid-glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3 shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
        {/* Specular Top Line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />

        <label htmlFor="scan-selector" className="text-xs font-mono text-slate-300 font-bold uppercase shrink-0 tracking-wider">
          Select Scan Report:
        </label>
        <select
          id="scan-selector"
          value={selectedScanId}
          onChange={handleSelectChange}
          className="flex-1 w-full rounded-xl bg-[rgba(6,16,36,0.75)] border border-white/15 px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
        >
          {scans.map((s) => (
            <option key={s.id} value={s.id}>
              #{s.id} — [{s.scan_type.toUpperCase()}] {s.target_identifier} ({s.classification} - {s.risk_score}/100)
            </option>
          ))}
        </select>
        <button
          onClick={() => fetchScanDetail(selectedScanId)}
          className="p-2.5 rounded-xl bg-[rgba(6,16,36,0.75)] hover:bg-emerald-500/20 text-emerald-400 transition-colors border border-white/10 shadow-sm"
          title="Reload Report"
          aria-label="Reload Selected Report"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs text-rose-200 font-mono">
          {error}
        </div>
      )}

      {/* Report Preview Document */}
      {currentScan ? (
        <div className="liquid-glass-card rounded-2xl border border-white/10 bg-[rgba(10,24,52,0.65)] backdrop-blur-[28px] p-6 sm:p-8 space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {/* Specular Top Line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          {/* Memo Header */}
          <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  PHISHSHIELD SECURITY ADVISORY
                </span>
                {currentScan.is_sample && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                    Synthetic Demonstration Sample
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
                Threat Inspection Incident Memo #{currentScan.id}
              </h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-4 font-mono font-medium">
                <span>Date: {currentScan.created_at}</span>
                <span>Type: {currentScan.scan_type.toUpperCase()} ANALYSIS</span>
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[rgba(6,16,36,0.7)] border border-white/10 rounded-2xl p-3.5 shadow-inner">
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Threat Score</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {currentScan.risk_score}
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </span>
              </div>
              <RiskBadge classification={currentScan.classification} size="md" />
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              1. Executive Assessment Summary
            </h3>
            <div className="p-4 rounded-xl bg-[rgba(6,16,36,0.7)] border border-white/10 text-xs text-slate-200 leading-relaxed font-mono shadow-inner">
              <div className="mb-2">
                <span className="text-slate-400 font-bold">Target Identifier: </span>
                <span className="text-emerald-300 break-all font-semibold">{currentScan.target_identifier}</span>
              </div>
              <p className="text-slate-300">
                Evaluation determined a <strong>{currentScan.classification.toUpperCase()}</strong> threat classification with {currentScan.indicator_count || currentScan.indicators?.length || 0} triggering heuristic indicators.
              </p>
            </div>
          </div>

          {/* Section 2: Detailed Indicators Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              2. Identified Technical Indicators
            </h3>
            {currentScan.indicators?.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-white/10 shadow-inner">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[rgba(10,24,52,0.85)] text-slate-300 uppercase text-[10px] border-b border-white/10 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Indicator</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3">Evidence</th>
                      <th className="py-2.5 px-3">Technical Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[rgba(6,16,36,0.65)]">
                    {currentScan.indicators.map((ind, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.04]">
                        <td className="py-2.5 px-3 font-bold text-white">{ind.name}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] uppercase font-bold text-emerald-400">{ind.severity}</span>
                        </td>
                        <td className="py-2.5 px-3 text-emerald-300 text-[11px] max-w-xs truncate font-semibold">
                          {ind.evidence || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 text-[11px] max-w-md">
                          {ind.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[rgba(6,16,36,0.7)] border border-white/10 text-xs text-emerald-400 flex items-center gap-2 shadow-inner">
                <CheckCircle className="w-4 h-4" />
                <span>No malicious indicators detected. Clean inspection record.</span>
              </div>
            )}
          </div>

          {/* Section 3: Recommendations */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              3. Recommended Mitigation Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentScan.recommendations?.map((rec, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[rgba(6,16,36,0.7)] border border-white/10 text-xs space-y-1 shadow-inner">
                  <h4 className="font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{rec.action}</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{rec.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="liquid-glass-card p-12 text-center text-xs font-mono text-slate-400 rounded-2xl border border-white/10 bg-[rgba(10,24,52,0.65)] shadow-[0_8px_32px_rgba(2,6,23,0.5)]">
          No scan selected. Choose a scan from the dropdown above.
        </div>
      )}
    </div>
  );
}
