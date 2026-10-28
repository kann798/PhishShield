import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ classification = 'Low', size = 'md' }) {
  const norm = (classification || 'Low').toLowerCase();

  const configs = {
    low: {
      style: 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      dot: 'bg-emerald-400 shadow-[0_0_10px_#10B981]',
      icon: ShieldCheck,
      label: 'Low Risk',
    },
    medium: {
      style: 'bg-amber-500/15 border-amber-400/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      dot: 'bg-amber-400 shadow-[0_0_10px_#F59E0B]',
      icon: AlertTriangle,
      label: 'Medium Risk',
    },
    high: {
      style: 'bg-orange-500/15 border-orange-400/50 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.25)]',
      dot: 'bg-orange-400 shadow-[0_0_10px_#F97316]',
      icon: AlertCircle,
      label: 'High Risk',
    },
    critical: {
      style: 'bg-rose-500/20 border-rose-400/60 text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.35)]',
      dot: 'bg-rose-500 shadow-[0_0_12px_#EF4444] animate-pulse',
      icon: ShieldAlert,
      label: 'Critical Risk',
    },
  };

  const current = configs[norm] || configs.low;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5 font-mono font-bold',
    md: 'text-xs px-3 py-1 gap-1.5 font-mono font-bold',
    lg: 'text-sm px-4 py-1.5 gap-2 font-mono font-bold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm backdrop-blur-sm ${current.style} ${sizeClasses[size] || sizeClasses.md} transition-all duration-150`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${current.dot}`}></span>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{current.label}</span>
    </span>
  );
}
