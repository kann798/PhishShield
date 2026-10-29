import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, AlertTriangle, Info, Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';

export default function IndicatorCard({ indicator }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  if (!indicator) return null;

  const severity = (indicator.severity || 'low').toLowerCase();

  const severityConfig = {
    info: {
      card: 'border-[#404E3B]/15 bg-white',
      badge: 'bg-[#7B9669]/15 text-[#404E3B] border-[#7B9669]/30',
      icon: Info,
      iconColor: 'text-[#404E3B]',
      iconBg: 'bg-[#7B9669]/15 border-[#7B9669]/30',
    },
    low: {
      card: 'border-[#7B9669]/30 bg-white',
      badge: 'bg-[#7B9669]/15 text-[#404E3B] border-[#7B9669]/30',
      icon: Info,
      iconColor: 'text-[#7B9669]',
      iconBg: 'bg-[#7B9669]/15 border-[#7B9669]/30',
    },
    medium: {
      card: 'border-amber-300 bg-white',
      badge: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-700',
      iconBg: 'bg-amber-50 border-amber-300',
    },
    high: {
      card: 'border-orange-300 bg-white',
      badge: 'bg-orange-50 text-orange-800 border-orange-300',
      icon: AlertCircle,
      iconColor: 'text-orange-700',
      iconBg: 'bg-orange-50 border-orange-300',
    },
    critical: {
      card: 'border-rose-300 bg-[#FFF5F5]',
      badge: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
      icon: ShieldAlert,
      iconColor: 'text-rose-700',
      iconBg: 'bg-rose-100 border-rose-300',
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
          <div className={`p-2.5 rounded-[12px] border shrink-0 ${current.iconBg} ${current.iconColor} shadow-xs`}>
            <Icon className="w-5 h-5 stroke-[1.8]" />
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
