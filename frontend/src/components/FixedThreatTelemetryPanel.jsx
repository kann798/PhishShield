import React, { useState } from 'react';
import {
  Activity,
  Radio,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Zap,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';

/**
 * FixedThreatTelemetryPanel
 * A fixed-position telemetry panel that stays anchored on the right side of the screen
 * while the dashboard content scrolls. Displays payloads audited, threats detected,
 * detection latency, taxonomy matrix, and live intercept vector telemetry.
 */
export default function FixedThreatTelemetryPanel({
  collapsed = false,
  onToggleCollapse = () => {},
}) {
  return (
    <>
      {/* 1. COLLAPSED DOCK TAB (Shown when panel is minimized) */}
      {collapsed && (
        <button
          onClick={onToggleCollapse}
          className="fixed right-0 bottom-4 sm:bottom-6 z-40 flex items-center gap-2.5 px-3.5 py-2.5 bg-[#404E3B] hover:bg-[#344030] backdrop-blur-2xl border-l-2 border-y border-[#7B9669]/60 rounded-l-2xl shadow-xl text-xs font-mono text-white transition-all duration-300 group hover:translate-x-[-2px] select-none"
          title="Expand Global Threat Telemetry Panel"
          aria-label="Expand Telemetry Panel"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7B9669] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#86EFAC]"></span>
          </span>
          <span className="font-bold text-white tracking-wider hidden sm:inline">TELEMETRY:</span>
          <span className="text-rose-300 font-bold">298 ALERTS</span>
          <span className="text-[#BAC8B1]">•</span>
          <span className="text-[#86EFAC] font-bold">50ms</span>
          <div className="p-1 rounded-md bg-white/10 group-hover:bg-[#7B9669]/30 text-white transition-colors ml-1">
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </div>
        </button>
      )}

      {/* 2. EXPANDED FIXED TELEMETRY PANEL */}
      {!collapsed && (
        <aside
          aria-label="Global Threat Telemetry Panel"
          className="fixed right-3 sm:right-4 bottom-3 sm:bottom-4 z-40 w-[290px] sm:w-[310px] max-h-[calc(100vh-6rem)] flex flex-col gap-3 p-3.5 sm:p-4 rounded-2xl border border-[#BAC8B1]/25 bg-[#303B2C] backdrop-blur-2xl shadow-2xl text-[#E6E6E6] select-none transition-all duration-300 overflow-y-auto no-scrollbar pointer-events-auto"
        >
          {/* Top Specular Edge Line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#7B9669]/50 to-transparent pointer-events-none" />

          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#BAC8B1]/15">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#7B9669] text-white shadow-xs">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white flex items-center gap-1.5">
                  <span>THREAT TELEMETRY</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#86EFAC] animate-ping"></span>
                </h3>
                <span className="text-[10px] text-[#BAC8B1] font-mono block">Real-time Global Sensor Feed</span>
              </div>
            </div>

            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-[#BAC8B1] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Minimize Telemetry Panel"
              aria-label="Minimize Telemetry Panel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* METRIC 1: PAYLOADS AUDITED */}
          <div className="p-3 rounded-xl border border-[#BAC8B1]/20 bg-[#404E3B] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#BAC8B1] text-[11px] font-mono font-bold tracking-wider uppercase mb-1.5">
              <span>PAYLOADS AUDITED</span>
              <span className="text-[10px] text-[#86EFAC] flex items-center gap-1 font-mono font-bold bg-[#7B9669]/30 px-1.5 py-0.5 rounded border border-[#7B9669]/50">
                <Activity className="w-3 h-3 animate-pulse" /> LIVE
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight">300K</span>
                <span className="ml-2 text-[10px] font-mono font-bold text-amber-300">78% Risk</span>
              </div>
              <div className="text-right">
                <span className="text-base font-mono font-bold text-[#86EFAC]">14.5K</span>
                <span className="text-[10px] text-[#BAC8B1] font-mono font-medium block">+12% vs avg</span>
              </div>
            </div>
          </div>

          {/* METRIC 2: THREATS DETECTED */}
          <div className="p-3 rounded-xl border border-rose-500/40 bg-[#4A2828] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-200 text-[11px] font-mono font-bold tracking-wider uppercase mb-1.5">
              <span>THREATS DETECTED</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/30 text-rose-200 border border-rose-500/40">
                ALERT
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-mono font-black text-rose-300 tracking-tight">
                298
              </span>
              {/* Sparkline Visual */}
              <div className="w-24 h-7 flex items-end gap-1">
                {[40, 25, 60, 45, 80, 55, 90, 70, 85, 100].map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-rose-900 to-rose-400 rounded-t-sm"
                    style={{ height: `${val}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* METRIC 3: LATENCY */}
          <div className="p-3 rounded-xl border border-[#BAC8B1]/20 bg-[#404E3B] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#BAC8B1] text-[11px] font-mono font-bold tracking-wider uppercase mb-1.5">
              <span>LATENCY</span>
              <span className="text-[10px] text-[#86EFAC] font-mono font-bold bg-[#7B9669]/30 px-1.5 py-0.5 rounded border border-[#7B9669]/50">
                12ms P99
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight">
                  50ms
                </span>
                <span className="text-[10px] text-[#BAC8B1] font-mono ml-1.5 font-medium">Avg RTT</span>
              </div>
              {/* Sparkline Visual */}
              <div className="w-24 h-7 flex items-end gap-1">
                {[30, 45, 35, 60, 40, 50, 45, 35, 40, 30].map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-[#263123] to-[#7B9669] rounded-t-sm"
                    style={{ height: `${val}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* TELEMETRY MATRIX (Taxonomy Breakdown) */}
          <div className="p-3 rounded-xl border border-[#BAC8B1]/20 bg-[#404E3B] shadow-sm text-xs font-mono">
            <span className="text-[10px] uppercase font-bold text-[#BAC8B1] block mb-2 border-b border-white/10 pb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 text-[#BAC8B1]" />
                <span>Telemetry Taxonomy</span>
              </span>
              <Radio className="w-3 h-3 text-[#86EFAC] animate-pulse" />
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-[#BAC8B1]">Phishing Origin:</span>
                <span className="text-rose-300 font-bold">176 / hr</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#BAC8B1]">Malware Delivery:</span>
                <span className="text-amber-300 font-bold">41.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#BAC8B1]">Social Eng. Ratio:</span>
                <span className="text-[#86EFAC] font-bold">33.3%</span>
              </div>
            </div>
          </div>

          {/* LIVE THREAT STREAM TICKER */}
          <div className="p-2.5 rounded-xl border border-[#7B9669]/40 bg-[#283225] shadow-sm text-[11px] font-mono flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-[#86EFAC] animate-ping shrink-0"></span>
              <span className="text-[#BAC8B1] shrink-0">Intercept:</span>
              <span className="text-white font-bold truncate">Honeypot [FRA-04]</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#7B9669]/30 text-[#86EFAC] text-[9.5px] font-bold shrink-0 border border-[#7B9669]/50">
              ROUTED
            </span>
          </div>
        </aside>
      )}
    </>
  );
}
