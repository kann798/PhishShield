import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Shield,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Calendar,
  Clock,
  Link as LinkIcon,
  Lock,
  Mail,
  Globe,
  Tag,
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { api } from '../services/api';
import { generateScanPdf } from '../utils/pdfGenerator';
import { exportScanAsJson, exportScanAsCsv } from '../utils/exportUtils';

export default function Reports() {
  const [scans, setScans] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState('');
  const [currentScan, setCurrentScan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScanOptions();

    const handleScanEvent = () => {
      loadScanOptions();
    };

    window.addEventListener('phishshield:new-scan', handleScanEvent);
    return () => {
      window.removeEventListener('phishshield:new-scan', handleScanEvent);
    };
  }, []);

  const loadScanOptions = async () => {
    try {
      const res = await api.getScans({ limit: 30 });
      if (res.success && res.data && res.data.length > 0) {
        setScans(res.data);
        setSelectedScanId(res.data[0].id);
        fetchScanDetail(res.data[0].id);
      } else {
        setScans([]);
        setSelectedScanId('');
        setCurrentScan(null);
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

  // Severity classification helpers for the report document
  const classification = currentScan?.classification || 'Low';
  const score = currentScan?.risk_score ?? 0;
  const isCritical = classification.toLowerCase() === 'critical' || score >= 85;
  const isHigh = classification.toLowerCase() === 'high' || (score >= 65 && score < 85);
  const isCriticalOrHigh = isCritical || isHigh || score >= 65;
  const isMedium = classification.toLowerCase() === 'medium' || (score >= 35 && score < 65);

  return (
    <div className="space-y-6 w-full pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#404E3B]/15 pb-5 no-print print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C2518] dark:text-white font-heading flex items-center gap-3">
            <div className="p-3 bg-[#7B9669]/20 border border-[#7B9669]/40 rounded-2xl text-[#404E3B] dark:text-[#BAC8B1] shadow-sm">
              <FileText className="w-5 h-5 text-[#404E3B] dark:text-[#BAC8B1]" />
            </div>
            <span>EXECUTIVE SECURITY <span className="text-[#7B9669] dark:text-[#9FC48A]">REPORTS</span></span>
          </h1>
          <p className="text-xs sm:text-sm text-[#404E3B]/80 dark:text-[#BAC8B1] mt-1 font-sans font-medium page-subtitle">
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
            <button
              type="button"
              onClick={() => exportScanAsJson(currentScan)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#404E3B]/15 hover:bg-[#EEF3EC] text-[#404E3B] text-xs font-mono font-semibold transition-all shadow-sm cursor-pointer"
              title="Download structured JSON report"
            >
              <Download className="w-3.5 h-3.5 text-[#7B9669]" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() => exportScanAsCsv(currentScan)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#404E3B]/15 hover:bg-[#EEF3EC] text-[#404E3B] text-xs font-mono font-semibold transition-all shadow-sm cursor-pointer"
              title="Download structured CSV report"
            >
              <Download className="w-3.5 h-3.5 text-[#7B9669]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#404E3B]/15 hover:bg-[#EEF3EC] text-[#404E3B] text-xs font-mono font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#7B9669]" />
              <span>Print Memo</span>
            </button>
          </div>
        )}
      </div>

      {/* Select Scan Dropdown Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3 shadow-sm border border-[#404E3B]/15 relative overflow-hidden no-print print:hidden">
        <label htmlFor="scan-selector" className="text-xs font-mono text-[#243D2E] font-bold uppercase shrink-0 tracking-wider flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#7B9669]" />
          <span>Select Scan Report:</span>
        </label>
        <select
          id="scan-selector"
          value={selectedScanId}
          onChange={handleSelectChange}
          className="flex-1 w-full rounded-xl bg-[#F4F7F4] border border-[#404E3B]/20 px-3.5 py-2.5 text-xs text-[#202B21] font-mono focus:outline-none focus:border-[#7B9669] focus:ring-2 focus:ring-[#7B9669]/25 font-semibold"
        >
          {scans.map((s) => (
            <option key={s.id} value={s.id}>
              #{s.id} — [{s.scan_type.toUpperCase()}] {s.target_identifier} ({s.classification} - {s.risk_score}/100)
            </option>
          ))}
        </select>
        <button
          onClick={() => fetchScanDetail(selectedScanId)}
          className="p-2.5 rounded-xl bg-[#EEF3EC] hover:bg-[#7B9669] hover:text-white text-[#404E3B] transition-colors border border-[#404E3B]/15 shadow-sm cursor-pointer"
          title="Reload Report"
          aria-label="Reload Selected Report"
        >
          <RefreshCw className={`w-4 h-4 text-[#7B9669] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-800 font-mono no-print print:hidden">
          {error}
        </div>
      )}

      {/* Report Preview Document */}
      {currentScan ? (
        <div id="incident-memo-report" className="bg-white rounded-2xl border border-[#404E3B]/15 p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden printable-memo-report print:p-0 print:border-none print:shadow-none print:rounded-none">
          {/* Formal Print-Only Executive Header */}
          <div className="hidden print:flex items-center justify-between border-b-2 border-[#1C2518] pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#404E3B] text-white flex items-center justify-center font-bold">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-heading font-black text-xl tracking-tight text-[#1C2518]">
                  PHISH<span className="text-[#53654E]">SHIELD</span>
                </div>
                <div className="text-[10px] font-mono font-bold text-[#52665A] uppercase tracking-wider">
                  Cybersecurity & Threat Defense Platform
                </div>
              </div>
            </div>
            <div className="text-right text-[10px] font-mono text-[#52665A]">
              <div className="font-bold uppercase tracking-wider text-[#1C2518]">Executive Threat Forensics Advisory</div>
              <div className="text-[#B42332] font-bold">CONFIDENTIAL &bull; INCIDENT RECORD</div>
            </div>
          </div>

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
              <h2 className="text-xl sm:text-2xl font-black text-[#1C2518] tracking-tight font-sans">
                Threat Inspection Incident Memo #{currentScan.id}
              </h2>
              <div className="text-xs text-[#6C8480] mt-1.5 flex flex-wrap items-center gap-4 font-mono font-medium">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#7B9669]" />
                  <span>Date: {currentScan.created_at}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  {currentScan.scan_type === 'email' ? (
                    <Mail className="w-3.5 h-3.5 text-[#7B9669]" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-[#7B9669]" />
                  )}
                  <span>Type: {currentScan.scan_type.toUpperCase()} ANALYSIS</span>
                </span>
              </div>
            </div>

            {/* Threat Score Card - Dynamically colored by severity */}
            <div className={`flex items-center gap-3.5 rounded-2xl p-4 shadow-xs border ${
              isCriticalOrHigh
                ? 'bg-[#FEECEC] border-[#F5B7BD]'
                : isMedium
                ? 'bg-[#FFF1DB] border-[#F5D08A]'
                : 'bg-[#E8F6ED] border-[#B7E3C7]'
            }`}>
              <div className="text-right">
                <span className={`text-[10px] font-mono uppercase font-bold block ${
                  isCriticalOrHigh ? 'text-[#B42332]' : isMedium ? 'text-[#B54708]' : 'text-[#16794B]'
                }`}>
                  Threat Score
                </span>
                <span className={`text-2xl font-black font-mono tracking-tight ${
                  isCriticalOrHigh ? 'text-[#D92D20]' : isMedium ? 'text-[#B54708]' : 'text-[#16794B]'
                }`}>
                  {currentScan.risk_score}
                  <span className="text-xs font-normal text-[#6C8480]">/100</span>
                </span>
              </div>
              <RiskBadge classification={currentScan.classification} size="md" />
            </div>
          </div>

          {/* Section 1: Executive Assessment Summary */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#243D2E] dark:text-[#E6ECE1] font-mono flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#7B9669]/20 text-[#243D2E] flex items-center justify-center text-[10px] font-mono font-bold">1</span>
              <span>EXECUTIVE ASSESSMENT SUMMARY</span>
            </h3>
            <div className={`p-4 sm:p-5 rounded-xl border text-xs leading-relaxed font-mono flex items-start gap-3.5 shadow-2xs ${
              isCriticalOrHigh
                ? 'bg-[#FEECEC] border-[#F5B7BD]'
                : isMedium
                ? 'bg-[#FFF1DB] border-[#F5D08A]'
                : 'bg-[#E8F6ED] border-[#B7E3C7]'
            }`}>
              <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 shadow-2xs ${
                isCriticalOrHigh
                  ? 'bg-white text-[#D92D20] border-[#F5B7BD]'
                  : isMedium
                  ? 'bg-white text-[#B54708] border-[#F5D08A]'
                  : 'bg-white text-[#16794B] border-[#B7E3C7]'
              }`}>
                {isCriticalOrHigh ? (
                  <AlertTriangle className="w-4.5 h-4.5" />
                ) : isMedium ? (
                  <AlertCircle className="w-4.5 h-4.5" />
                ) : (
                  <CheckCircle className="w-4.5 h-4.5" />
                )}
              </div>
              <div className="space-y-1.5 flex-1">
                <div>
                  <span className="text-[#202B21] font-bold">Target Identifier: </span>
                  <span className={`font-bold break-all ${
                    isCriticalOrHigh ? 'text-[#D92D20]' : isMedium ? 'text-[#B54708]' : 'text-[#16794B]'
                  }`}>
                    {currentScan.target_identifier}
                  </span>
                </div>
                <p className="text-[#52665A] font-sans text-xs">
                  Evaluation determined a{' '}
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase border ${
                    isCriticalOrHigh
                      ? 'bg-[#FDEBEC] text-[#B42332] border-[#F5B7BD]'
                      : isMedium
                      ? 'bg-[#FFF1DB] text-[#B54708] border-[#F5D08A]'
                      : 'bg-[#E8F6ED] text-[#16794B] border-[#B7E3C7]'
                  }`}>
                    {currentScan.classification}
                  </span>{' '}
                  threat classification with{' '}
                  <strong className={isCriticalOrHigh ? 'text-[#D92D20]' : isMedium ? 'text-[#B54708]' : 'text-[#16794B]'}>
                    {currentScan.indicator_count || currentScan.indicators?.length || 0} triggering heuristic indicators
                  </strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Detailed Indicators Table */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#243D2E] dark:text-[#E6ECE1] font-mono flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#7B9669]/20 text-[#243D2E] flex items-center justify-center text-[10px] font-mono font-bold">2</span>
              <span>IDENTIFIED TECHNICAL INDICATORS</span>
            </h3>
            {currentScan.indicators?.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-[#BAC8B1]/40 shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#BAC8B1]/30 text-[#243D2E] uppercase text-[10px] border-b border-[#BAC8B1] font-mono font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Indicator</th>
                      <th className="py-3 px-4 text-center">Severity</th>
                      <th className="py-3 px-4">Evidence</th>
                      <th className="py-3 px-4">Technical Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D7E0D5] bg-white font-sans">
                    {currentScan.indicators.map((ind, idx) => {
                      const sev = (ind.severity || 'low').toLowerCase();

                      let sevBadge = 'bg-[#E8F6ED] text-[#16794B] border-[#B7E3C7] font-semibold';
                      let sevIconBg = 'bg-[#E8F6ED] text-[#16794B] border-[#B7E3C7]';
                      let sevDot = 'bg-[#16794B]';
                      if (sev === 'critical') {
                        sevBadge = 'bg-[#FEECEC] text-[#D92D20] border-[#F5B7BD] font-bold';
                        sevIconBg = 'bg-[#FEECEC] text-[#D92D20] border-[#F5B7BD]';
                        sevDot = 'bg-[#D92D20]';
                      } else if (sev === 'high') {
                        sevBadge = 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] font-bold';
                        sevIconBg = 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
                        sevDot = 'bg-[#DC2626]';
                      } else if (sev === 'medium') {
                        sevBadge = 'bg-[#FFF1DB] text-[#B54708] border-[#F5D08A] font-bold';
                        sevIconBg = 'bg-[#FFF1DB] text-[#B54708] border-[#F5D08A]';
                        sevDot = 'bg-[#B54708]';
                      } else if (sev === 'low') {
                        sevBadge = 'bg-[#EAF4FC] text-[#1D6FA5] border-[#B8DDF5] font-semibold';
                        sevIconBg = 'bg-[#EAF4FC] text-[#1D6FA5] border-[#B8DDF5]';
                        sevDot = 'bg-[#1D6FA5]';
                      }

                      return (
                        <tr key={idx} className="hover:bg-[#F4F7F4] transition-colors">
                          <td className="py-3 px-4 font-bold text-[#202B21]">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 shadow-2xs ${sevIconBg}`}>
                                <ShieldAlert className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-sans font-bold text-xs">{ind.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase border ${sevBadge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sevDot}`}></span>
                              <span>{ind.severity || 'Low'}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs font-mono max-w-xs">
                            {ind.evidence ? (
                              <span className="inline-block px-2.5 py-1 rounded-md bg-[#FFF1DB] border border-[#F5D08A] text-[#B54708] font-mono font-bold text-[11px] truncate max-w-full shadow-2xs">
                                {ind.evidence}
                              </span>
                            ) : (
                              <span className="text-[#6C8480] text-[11px]">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-[#52665A] font-sans text-xs max-w-md leading-relaxed">
                            {ind.description}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#E8F6ED] border border-[#B7E3C7] text-xs text-[#16794B] flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>No malicious indicators detected. Clean inspection record.</span>
              </div>
            )}
          </div>

          {/* Section 3: Recommendations with 4 distinct colored cards */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#243D2E] dark:text-[#E6ECE1] font-mono flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#7B9669]/20 text-[#243D2E] flex items-center justify-center text-[10px] font-mono font-bold">3</span>
              <span>RECOMMENDED MITIGATION ACTIONS</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentScan.recommendations?.map((rec, idx) => {
                // Card Color Variations: Card 0 = Red, Card 1 = Amber, Card 2 = Blue, Card 3 = Green
                const colorSchemes = [
                  {
                    cardBg: 'bg-[#FEECEC] border-[#F5B7BD]',
                    iconBg: 'bg-white border-[#F5B7BD] text-[#D92D20]',
                    titleColor: 'text-[#B42332]',
                    icon: <ShieldAlert className="w-4 h-4" />,
                  },
                  {
                    cardBg: 'bg-[#FFF1DB] border-[#F5D08A]',
                    iconBg: 'bg-white border-[#F5D08A] text-[#B54708]',
                    titleColor: 'text-[#B54708]',
                    icon: <LinkIcon className="w-4 h-4" />,
                  },
                  {
                    cardBg: 'bg-[#EAF4FC] border-[#B8DDF5]',
                    iconBg: 'bg-white border-[#B8DDF5] text-[#1D6FA5]',
                    titleColor: 'text-[#1D6FA5]',
                    icon: <Globe className="w-4 h-4" />,
                  },
                  {
                    cardBg: 'bg-[#E8F6ED] border-[#B7E3C7]',
                    iconBg: 'bg-white border-[#B7E3C7] text-[#16794B]',
                    titleColor: 'text-[#16794B]',
                    icon: <CheckCircle className="w-4 h-4" />,
                  },
                ];

                const scheme = colorSchemes[idx % colorSchemes.length];

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${scheme.cardBg} flex items-start gap-3.5 shadow-2xs transition-all`}
                  >
                    <div className={`p-2 rounded-xl border ${scheme.iconBg} shrink-0 mt-0.5 shadow-2xs`}>
                      {scheme.icon}
                    </div>
                    <div className="space-y-1">
                      <h4 className={`font-bold font-sans text-xs tracking-wide ${scheme.titleColor}`}>
                        {rec.action}
                      </h4>
                      <p className="text-[#52665A] leading-relaxed text-[11px] font-sans">
                        {rec.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formal Print-Only Executive Footer */}
          <div className="hidden print:flex items-center justify-between border-t border-[#404E3B]/30 pt-4 mt-8 text-[9px] font-mono text-[#52665A]">
            <div>
              <span className="font-semibold text-[#1C2518]">PhishShield Automated Forensics Engine</span>
              <span> &bull; Zero-SSRF Offline Analysis &bull; Confidential Incident Memorandum</span>
            </div>
            <div className="text-right">
              <span>Report #{currentScan.id} &bull; Generated: {currentScan.created_at || new Date().toLocaleString()}</span>
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
