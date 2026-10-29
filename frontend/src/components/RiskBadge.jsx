import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ classification = 'Low', size = 'md' }) {
  const norm = (classification || 'Low').toLowerCase();

  const configs = {
    low: {
      style: 'bg-[#7B9669]/15 border-[#7B9669]/40 text-[#404E3B]',
      dot: 'bg-[#7B9669]',
      icon: ShieldCheck,
      label: 'Low Risk',
    },
    medium: {
      style: 'bg-amber-50 border-amber-300 text-amber-800',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'Medium Risk',
    },
    high: {
      style: 'bg-orange-50 border-orange-300 text-orange-800',
      dot: 'bg-orange-500',
      icon: AlertCircle,
      label: 'High Risk',
    },
    critical: {
      style: 'bg-rose-50 border-rose-300 text-rose-800',
      dot: 'bg-rose-600',
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
