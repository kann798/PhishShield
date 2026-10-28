import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function AlertBanner({ type = 'info', title, message, onDismiss, action }) {
  const configs = {
    info: {
      card: 'bg-cyan-500/10 border-cyan-400/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-xl',
      icon: Info,
      iconColor: 'text-cyan-300',
    },
    success: {
      card: 'bg-emerald-500/10 border-emerald-400/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-xl',
      icon: CheckCircle2,
      iconColor: 'text-emerald-300',
    },
    warning: {
      card: 'bg-amber-500/10 border-amber-400/40 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-xl',
      icon: AlertTriangle,
      iconColor: 'text-amber-300',
    },
    danger: {
      card: 'bg-rose-500/15 border-rose-400/50 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.3)] backdrop-blur-xl',
      icon: AlertCircle,
      iconColor: 'text-rose-300',
    },
  };

  const current = configs[type] || configs.info;
  const Icon = current.icon;

  return (
    <div
      className={`rounded-xl border p-4 flex items-start justify-between gap-3 ${current.card} shadow-sm transition-colors duration-150`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
        <div>
          {title && <h5 className="text-sm font-bold mb-1">{title}</h5>}
          <p className="text-xs leading-relaxed opacity-95">{message}</p>
          {action && <div className="mt-2.5">{action}</div>}
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 p-1 rounded transition-colors"
          title="Dismiss notification"
          aria-label="Dismiss Alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
