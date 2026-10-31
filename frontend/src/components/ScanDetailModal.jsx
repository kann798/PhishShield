import React from 'react';
import { X, Download, Trash2, Calendar, Hash, Shield, CheckCircle } from 'lucide-react';
import RiskBadge from './RiskBadge';
import IndicatorCard from './IndicatorCard';
import MLTelemetryCard from './MLTelemetryCard';
import AnalysisResultView from './AnalysisResultView';
import { api } from '../services/api';
import { generateScanPdf } from '../utils/pdfGenerator';
import { exportScanAsJson, exportScanAsCsv } from '../utils/exportUtils';

export default function ScanDetailModal({ scan, onClose, onDelete }) {
  if (!scan) return null;

  const isUrl = scan.scan_type === 'url';
  const details = scan.details || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-[#404E3B]/20 rounded-2xl shadow-xl flex flex-col overflow-hidden text-[#2C3527] transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#404E3B]/15 flex items-center justify-between bg-[#EEF3EC]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#7B9669]/20 border border-[#7B9669]/40 rounded-xl text-[#404E3B] shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#404E3B] font-sans">
                  {isUrl ? 'URL Threat Analysis Telemetry' : 'Email Security Inspection Telemetry'}
                </h3>
                <span className="text-xs font-mono font-bold text-[#7B9669]">#{scan.id}</span>
                {scan.is_sample && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#7B9669]/15 border border-[#7B9669]/30 text-[#404E3B] font-bold">
                    Synthetic Sample
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6C8480] flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {scan.created_at}
                </span>
                <span className="flex items-center gap-1 font-mono font-semibold">
                  <Hash className="w-3.5 h-3.5" />
                  TYPE: {scan.scan_type.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#6C8480] hover:text-[#404E3B] hover:bg-[#BAC8B1]/30 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isUrl ? (
            <AnalysisResultView type="url" result={scan} />
          ) : (
            <>
          {/* Target Identifier & Summary */}
          <div className="bg-[#F4F7F4] rounded-xl p-4 shadow-sm border border-[#404E3B]/10">
            <span className="text-[11px] font-mono uppercase text-[#6C8480] font-bold block mb-1">
              Analyzed Target:
            </span>
            <div className="font-mono text-sm text-[#404E3B] break-all select-all bg-white p-3 rounded-lg border border-[#404E3B]/15 shadow-sm font-semibold">
              {scan.target_identifier}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#404E3B]/10">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-[#6C8480]">Threat Level:</span>
                <RiskBadge classification={scan.classification} size="md" />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-[#6C8480]">Calculated Risk Score:</span>
                <span className="font-mono font-black text-lg text-[#404E3B]">
                  {scan.risk_score} <span className="text-xs text-[#6C8480] font-normal">/ 100</span>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-[#6C8480]">Indicators Triggered:</span>
                <span className="font-mono font-bold text-[#404E3B]">
                  {scan.indicator_count || scan.indicators?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Machine Learning Model Telemetry */}
          {(details?.ml_analysis || scan.ml_analysis) && (
            <MLTelemetryCard mlAnalysis={details?.ml_analysis || scan.ml_analysis} />
          )}

          {/* Technical Anatomy / Details */}
          {isUrl && details && (
            <div className="bg-[#F4F7F4] rounded-xl p-4 shadow-sm border border-[#404E3B]/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#404E3B] mb-3 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B9669]" />
                URL Technical Anatomy
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-[#404E3B]/10 shadow-xs">
                  <span className="text-[#6C8480] block text-[11px] uppercase font-mono font-semibold">Protocol / Scheme</span>
                  <span className="font-mono text-[#7B9669] font-bold">{details.scheme || 'N/A'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-[#404E3B]/10 shadow-xs">
                  <span className="text-[#6C8480] block text-[11px] uppercase font-mono font-semibold">Hostname</span>
                  <span className="font-mono text-[#2C3527] truncate block font-medium">{details.hostname || 'N/A'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-[#404E3B]/10 shadow-xs">
                  <span className="text-[#6C8480] block text-[11px] uppercase font-mono font-semibold">Is Raw IP Host?</span>
                  <span className={`font-mono font-bold ${details.is_ip ? 'text-rose-600' : 'text-[#7B9669]'}`}>
                    {details.is_ip ? `Yes (${details.ip_version || 'IPv4'})` : 'No (FQDN)'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-[#404E3B]/10 shadow-xs">
                  <span className="text-[#6C8480] block text-[11px] uppercase font-mono font-semibold">Registered Root</span>
                  <span className="font-mono text-[#2C3527] truncate block font-medium">{details.main_domain || 'N/A'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-[#404E3B]/10 shadow-xs">
                  <span className="text-[#6C8480] block text-[11px] uppercase font-mono font-semibold">Port</span>
                  <span className="font-mono text-[#2C3527] font-medium">{details.port || '80/443'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-[#404E3B]/10 shadow-xs">
                  <span className="text-[#6C8480] block text-[11px] uppercase font-mono font-semibold">Path</span>
                  <span className="font-mono text-[#2C3527] truncate block font-medium">{details.path || '/'}</span>
                </div>
              </div>
            </div>
          )}

          {!isUrl && details && (
            <div className="bg-[#F4F7F4] rounded-xl p-4 shadow-sm border border-[#404E3B]/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#404E3B] mb-3 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B9669]" />
                Email Header Metadata & Triggers
              </h4>
              <div className="space-y-2 text-xs">
                {details.sender_summary?.from && (
                  <div className="bg-white p-2.5 rounded-lg border border-[#404E3B]/10 flex justify-between shadow-xs">
                    <span className="text-[#6C8480] font-medium">From Header:</span>
                    <span className="font-mono text-[#404E3B] font-semibold">{details.sender_summary.from}</span>
                  </div>
                )}
                {details.sender_summary?.reply_to && (
                  <div className="bg-white p-2.5 rounded-lg border border-[#404E3B]/10 flex justify-between shadow-xs">
                    <span className="text-[#6C8480] font-medium">Reply-To Header:</span>
                    <span className="font-mono text-amber-700 font-semibold">{details.sender_summary.reply_to}</span>
                  </div>
                )}
                {details.social_engineering_triggers?.length > 0 && (
                  <div className="bg-white p-2.5 rounded-lg border border-[#404E3B]/10 shadow-xs">
                    <span className="text-[#6C8480] block mb-1.5 font-medium">Detected Social Engineering Triggers:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {details.social_engineering_triggers.map((trig, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 font-mono text-[11px] font-bold">
                          {trig}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Triggered Indicators */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#404E3B] mb-3 font-mono flex items-center justify-between">
              <span>Triggered Security Indicators ({scan.indicators?.length || 0})</span>
            </h4>
            {scan.indicators && scan.indicators.length > 0 ? (
              <div className="space-y-3">
                {scan.indicators.map((ind, idx) => (
                  <IndicatorCard key={idx} indicator={ind} />
                ))}
              </div>
            ) : (
              <div className="bg-[#EEF3EC] rounded-xl p-5 text-center shadow-sm border border-[#404E3B]/15">
                <CheckCircle className="w-8 h-8 text-[#7B9669] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#404E3B]">No Malicious Indicators Detected</p>
                <p className="text-xs text-[#6C8480] mt-1">
                  The analyzed target did not trigger any known threat patterns or suspicious heuristics.
                </p>
              </div>
            )}
          </div>

          {/* Actionable Recommendations */}
          {scan.recommendations && scan.recommendations.length > 0 && (
            <div className="bg-[#F4F7F4] rounded-xl p-4 shadow-sm border border-[#404E3B]/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#404E3B] mb-3 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B9669]" />
                Security Recommendations & Mitigations
              </h4>
              <div className="space-y-2">
                {scan.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white border border-[#404E3B]/10 flex items-start gap-3 shadow-xs"
                  >
                    <div className="p-1.5 rounded-lg bg-[#7B9669]/15 text-[#404E3B] border border-[#7B9669]/30 mt-0.5 shrink-0">
                      <Shield className="w-3.5 h-3.5 text-[#7B9669]" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-[#404E3B]">{rec.action}</h5>
                      <p className="text-xs text-[#6C8480] mt-0.5">{rec.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#404E3B]/15 bg-[#EEF3EC] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => generateScanPdf(scan)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F4F7F4] text-[#404E3B] text-xs font-semibold transition-colors border border-[#404E3B]/15 shadow-sm cursor-pointer"
              title="Download official PDF report"
            >
              <Download className="w-3.5 h-3.5 text-[#7B9669]" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={() => exportScanAsJson(scan)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F4F7F4] text-[#404E3B] text-xs font-semibold transition-colors border border-[#404E3B]/15 shadow-sm cursor-pointer"
              title="Download structured JSON report"
            >
              <Download className="w-3.5 h-3.5 text-[#7B9669]" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() => exportScanAsCsv(scan)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F4F7F4] text-[#404E3B] text-xs font-semibold transition-colors border border-[#404E3B]/15 shadow-sm cursor-pointer"
              title="Download structured CSV report"
            >
              <Download className="w-3.5 h-3.5 text-[#7B9669]" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={() => onDelete(scan.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#7B9669] hover:bg-[#688258] text-white text-xs font-bold font-mono transition-all shadow-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
