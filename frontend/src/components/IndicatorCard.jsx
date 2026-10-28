import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, AlertTriangle, Info, Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';

export default function IndicatorCard({ indicator }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  if (!indicator) return null;

  const severity = (indicator.severity || 'low').toLowerCase();

  const severityConfig = {
    info: {
      card: 'border-slate-200 dark:border-white/10 bg-white dark:bg-[rgba(10,24,52,0.65)]',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: Info,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
    },
    low: {
      card: 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-[rgba(10,24,52,0.65)]',
      badge: 'bg-emerald-500/15 text-[#10B981] border-emerald-500/30',
      icon: Info,
      iconColor: 'text-[#10B981]',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
    },
    medium: {
      card: 'border-amber-300 dark:border-amber-500/30 bg-amber-50/40 dark:bg-[rgba(10,24,52,0.65)]',
      badge: 'bg-amber-500/15 text-[#F59E0B] border-amber-500/30',
      icon: AlertTriangle,
      iconColor: 'text-[#F59E0B]',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
    },
    high: {
      card: 'border-orange-300 dark:border-orange-500/35 bg-orange-50/40 dark:bg-[rgba(10,24,52,0.65)]',
      badge: 'bg-orange-500/15 text-[#F97316] border-orange-500/35',
      icon: AlertCircle,
      iconColor: 'text-[#F97316]',
      iconBg: 'bg-orange-500/15 border-orange-500/35',
    },
    critical: {
      card: 'border-rose-400 dark:border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/25 shadow-glow-crimson',
      badge: 'bg-rose-500/20 text-[#EF4444] border-rose-500/40 font-bold',
      icon: ShieldAlert,
      iconColor: 'text-[#EF4444]',
      iconBg: 'bg-rose-500/20 border-rose-500/40',
    },
  };

  const current = severityConfig[severity] || severityConfig.low;
  const Icon = current.icon;

  const handleCopyEvidence = () => {
    if (indicator.evidence) {
      navigator.clipboard.writeText(indicator.evidence);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`liquid-glass-card rounded-2xl border backdrop-blur-[24px] p-4 sm:p-5 transition-all duration-200 shadow-[0_8px_32px_rgba(2,6,23,0.4)] relative overflow-hidden ${current.card}`}
    >
      {/* Specular Highlight Line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg border shrink-0 ${current.iconBg} ${current.iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide font-sans">
                {indicator.name || 'Security Finding'}
              </h4>
              <span
                className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${current.badge}`}
              >
                {severity}
              </span>
              {indicator.weight ? (
                <span className="text-[11px] text-slate-500 dark:text-emerald-400/80 font-mono font-semibold">
                  Risk Weight: +{indicator.weight}
                </span>
              ) : null}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {indicator.description}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded transition-colors"
          title={expanded ? 'Collapse Details' : 'Expand Details'}
          aria-label={expanded ? 'Collapse Finding Details' : 'Expand Finding Details'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && indicator.evidence && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
              <span>Telemetry / Detected Evidence:</span>
            </span>
            <button
              onClick={handleCopyEvidence}
              className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#10B981]" />
                  <span className="text-[#10B981]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-slate-100 dark:bg-[#080C14] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-xs font-mono text-emerald-800 dark:text-emerald-300 overflow-x-auto whitespace-pre-wrap break-all shadow-inner">
            {indicator.evidence}
          </pre>
        </div>
      )}
    </div>
  );
}
