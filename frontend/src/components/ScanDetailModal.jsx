import React from 'react';
import { X, Download, Trash2, Calendar, Hash, Shield, CheckCircle } from 'lucide-react';
import RiskBadge from './RiskBadge';
import IndicatorCard from './IndicatorCard';
import MLTelemetryCard from './MLTelemetryCard';
import { api } from '../services/api';
import { generateScanPdf } from '../utils/pdfGenerator';

export default function ScanDetailModal({ scan, onClose, onDelete }) {
  if (!scan) return null;

  const isUrl = scan.scan_type === 'url';
  const details = scan.details || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] liquid-glass-elevated border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-[rgba(10,24,52,0.85)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-sans">
                  {isUrl ? 'URL Threat Analysis Telemetry' : 'Email Security Inspection Telemetry'}
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-400">#{scan.id}</span>
                {scan.is_sample && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                    Synthetic Sample
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-0.5">
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
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Target Identifier & Summary */}
          <div className="liquid-glass-card rounded-xl p-4 shadow-sm border border-slate-200 dark:border-white/10">
            <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold block mb-1">
              Analyzed Target:
            </span>
            <div className="font-mono text-sm text-emerald-300 break-all select-all bg-white dark:bg-[#061024]/80 p-3 rounded-lg border border-slate-200 dark:border-white/10 shadow-inner">
              {scan.target_identifier}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Threat Level:</span>
                <RiskBadge classification={scan.classification} size="md" />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Calculated Risk Score:</span>
                <span className="font-mono font-black text-lg text-slate-900 dark:text-white">
                  {scan.risk_score} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ 100</span>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Indicators Triggered:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
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
            <div className="liquid-glass-card rounded-xl p-4 shadow-sm border border-slate-200 dark:border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                URL Technical Anatomy
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10 shadow-sm">
                  <span className="text-slate-400 block text-[11px] uppercase font-mono font-semibold">Protocol / Scheme</span>
                  <span className="font-mono text-emerald-300 font-bold">{details.scheme || 'N/A'}</span>
                </div>
                <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10 shadow-sm">
                  <span className="text-slate-400 block text-[11px] uppercase font-mono font-semibold">Hostname</span>
                  <span className="font-mono text-slate-200 truncate block font-medium">{details.hostname || 'N/A'}</span>
                </div>
                <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10 shadow-sm">
                  <span className="text-slate-400 block text-[11px] uppercase font-mono font-semibold">Is Raw IP Host?</span>
                  <span className={`font-mono font-bold ${details.is_ip ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {details.is_ip ? `Yes (${details.ip_version || 'IPv4'})` : 'No (FQDN)'}
                  </span>
                </div>
                <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10 shadow-sm">
                  <span className="text-slate-400 block text-[11px] uppercase font-mono font-semibold">Registered Root</span>
                  <span className="font-mono text-slate-200 truncate block font-medium">{details.main_domain || 'N/A'}</span>
                </div>
                <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10 shadow-sm">
                  <span className="text-slate-400 block text-[11px] uppercase font-mono font-semibold">Port</span>
                  <span className="font-mono text-slate-200 font-medium">{details.port || '80/443'}</span>
                </div>
                <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10 shadow-sm">
                  <span className="text-slate-400 block text-[11px] uppercase font-mono font-semibold">Path</span>
                  <span className="font-mono text-slate-200 truncate block font-medium">{details.path || '/'}</span>
                </div>
              </div>
            </div>
          )}

          {!isUrl && details && (
            <div className="liquid-glass-card rounded-xl p-4 shadow-sm border border-slate-200 dark:border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Email Header Metadata & Triggers
              </h4>
              <div className="space-y-2 text-xs">
                {details.sender_summary?.from && (
                  <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10 flex justify-between shadow-sm">
                    <span className="text-slate-400 font-medium">From Header:</span>
                    <span className="font-mono text-emerald-300 font-semibold">{details.sender_summary.from}</span>
                  </div>
                )}
                {details.sender_summary?.reply_to && (
                  <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10 flex justify-between shadow-sm">
                    <span className="text-slate-400 font-medium">Reply-To Header:</span>
                    <span className="font-mono text-amber-400 font-semibold">{details.sender_summary.reply_to}</span>
                  </div>
                )}
                {details.social_engineering_triggers?.length > 0 && (
                  <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10 shadow-sm">
                    <span className="text-slate-400 block mb-1.5 font-medium">Detected Social Engineering Triggers:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {details.social_engineering_triggers.map((trig, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-md bg-rose-950/60 border border-rose-500/50 text-rose-300 font-mono text-[11px] font-bold">
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 font-mono flex items-center justify-between">
              <span>Triggered Security Indicators ({scan.indicators?.length || 0})</span>
            </h4>
            {scan.indicators && scan.indicators.length > 0 ? (
              <div className="space-y-3">
                {scan.indicators.map((ind, idx) => (
                  <IndicatorCard key={idx} indicator={ind} />
                ))}
              </div>
            ) : (
              <div className="liquid-glass-card rounded-xl p-5 text-center shadow-sm border border-slate-200 dark:border-white/10">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">No Malicious Indicators Detected</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  The analyzed target did not trigger any known threat patterns or suspicious heuristics.
                </p>
              </div>
            )}
          </div>

          {/* Actionable Recommendations */}
          {scan.recommendations && scan.recommendations.length > 0 && (
            <div className="liquid-glass-card rounded-xl p-4 shadow-sm border border-slate-200 dark:border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Security Recommendations & Mitigations
              </h4>
              <div className="space-y-2">
                {scan.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#061024]/70 backdrop-blur-md border border-white/10 flex items-start gap-3 shadow-sm"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mt-0.5 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{rec.action}</h5>
                      <p className="text-xs text-slate-300 mt-0.5">{rec.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-[rgba(8,18,40,0.85)] backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => generateScanPdf(scan)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl liquid-glass-card hover:border-emerald-400/40 text-slate-200 hover:text-emerald-300 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              title="Download official PDF report"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download PDF</span>
            </button>
            <a
              href={api.getExportUrl(scan.id, 'json')}
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl liquid-glass-card hover:border-emerald-400/40 text-slate-200 hover:text-emerald-300 text-xs font-semibold transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export JSON</span>
            </a>
            <a
              href={api.getExportUrl(scan.id, 'csv')}
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl liquid-glass-card hover:border-emerald-400/40 text-slate-200 hover:text-emerald-300 text-xs font-semibold transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={() => onDelete(scan.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-500/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
