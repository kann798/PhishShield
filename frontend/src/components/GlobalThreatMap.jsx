import React from 'react';
import { Globe, Activity, Radio } from 'lucide-react';
import { REAL_WORLD_MAP_PATH } from './worldMapData';
import ThreatNetworkBackground from './ThreatNetworkBackground';

export default function GlobalThreatMap() {
  // Real-World Geographic Hub Node Coordinates on 1000x500 Equirectangular Grid
  const nodes = [
    { id: 'sf', name: 'San Francisco', x: 160, y: 145, color: '#ff3366', pings: 42, labelOffset: 16 },
    { id: 'nyc', name: 'New York', x: 294, y: 137, color: '#00e5ff', pings: 88, labelOffset: 16 },
    { id: 'sao', name: 'São Paulo', x: 370, y: 315, color: '#00ff88', pings: 19, labelOffset: 16 },
    { id: 'lon', name: 'London', x: 500, y: 107, color: '#00ff88', pings: 125, labelOffset: -12 },
    { id: 'fra', name: 'Frankfurt', x: 524, y: 111, color: '#00e5ff', pings: 96, labelOffset: 16 },
    { id: 'jnb', name: 'Johannesburg', x: 578, y: 323, color: '#ffaa00', pings: 31, labelOffset: 16 },
    { id: 'dxb', name: 'Dubai', x: 654, y: 180, color: '#00e5ff', pings: 54, labelOffset: 16 },
    { id: 'bom', name: 'Mumbai', x: 702, y: 197, color: '#ff3366', pings: 82, labelOffset: 16 },
    { id: 'sin', name: 'Singapore', x: 788, y: 246, color: '#00ff88', pings: 63, labelOffset: 16 },
    { id: 'sha', name: 'Shanghai', x: 837, y: 163, color: '#ff3366', pings: 114, labelOffset: 16 },
    { id: 'tok', name: 'Tokyo', x: 888, y: 151, color: '#00ff88', pings: 67, labelOffset: -12 },
    { id: 'syd', name: 'Sydney', x: 920, y: 344, color: '#00e5ff', pings: 24, labelOffset: 16 },
  ];

  return (
    <div className="space-y-5 w-full">
      {/* 1. Exact Preserved Metrics Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
        {/* Metric 1: PAYLOADS AUDITED */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 bg-[rgba(10,24,52,0.65)] shadow-[0_8px_32px_rgba(2,6,23,0.5)] flex flex-col justify-between h-full min-h-[148px]">
          <div className="flex items-center justify-between text-slate-300 text-xs font-mono font-bold tracking-wider uppercase mb-2 min-h-[28px]">
            <span>PAYLOADS AUDITED</span>
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono font-bold">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> LIVE
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2 mt-auto">
            <div>
              <span className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight">300K</span>
              <span className="ml-2.5 text-xs font-mono font-bold text-amber-400">78% Risk</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-mono font-bold text-[#10B981]">14.5K</span>
              <span className="text-xs text-emerald-400 font-mono font-medium block">+12% vs avg</span>
            </div>
          </div>
        </div>

        {/* Metric 2: THREATS DETECTED */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-rose-500/25 bg-[rgba(24,14,34,0.65)] shadow-[0_8px_32px_rgba(2,6,23,0.5)] flex flex-col justify-between h-full min-h-[148px]">
          <div className="flex items-center justify-between text-slate-300 text-xs font-mono font-bold tracking-wider uppercase mb-2 min-h-[28px]">
            <span>THREATS DETECTED</span>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              ALERT
            </span>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-3xl sm:text-4xl font-mono font-black text-rose-400 tracking-tight drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]">
              298
            </span>
            {/* Sparkline Visual */}
            <div className="w-28 h-8 flex items-end gap-1">
              {[40, 25, 60, 45, 80, 55, 90, 70, 85, 100].map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-rose-900 to-rose-400 rounded-t-sm transition-all duration-300"
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Metric 3: LATENCY */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 bg-[rgba(10,24,52,0.65)] shadow-[0_8px_32px_rgba(2,6,23,0.5)] flex flex-col justify-between h-full min-h-[148px]">
          <div className="flex items-center justify-between text-slate-300 text-xs font-mono font-bold tracking-wider uppercase mb-2 min-h-[28px]">
            <span>LATENCY</span>
            <span className="text-xs text-emerald-400 font-mono font-bold">12ms Global P99</span>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <div>
              <span className="text-3xl sm:text-4xl font-mono font-black text-emerald-400 tracking-tight drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                50ms
              </span>
              <span className="text-xs text-slate-300 font-mono ml-2 font-medium">Avg RTT</span>
            </div>
            {/* Sparkline Visual */}
            <div className="w-28 h-8 flex items-end gap-1">
              {[30, 45, 35, 60, 40, 50, 45, 35, 40, 30].map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-emerald-950 to-emerald-400 rounded-t-sm"
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Global Threat Intelligence Map ("Phishing By The Numbers") */}
      <div className="liquid-glass-card rounded-2xl border border-white/10 bg-[rgba(8,20,44,0.75)] p-5 sm:p-6 relative overflow-hidden shadow-[0_16px_45px_rgba(0,0,0,0.7)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
              <Globe className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-mono tracking-tight flex items-center gap-2">
                <span>Phishing By The Numbers</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  GLOBAL THREAT TELEMETRY
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Simulated real-time attack trajectories, active telemetry vectors, and node routing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#ff3366] shadow-[0_0_8px_#ff3366]"></span> Attack Origin
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]"></span> Monitored Vector
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]"></span> Safe Route
            </span>
          </div>
        </div>

        {/* 3. Multi-Layer Map Container with Background Animated Canvas + Foreground Continents */}
        <div className="relative w-full aspect-[2/1] min-h-[340px] max-h-[560px] bg-[#040c1c] rounded-xl overflow-hidden border border-sky-400/20">
          {/* Deep Ambient Grid */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none z-0"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(56, 189, 248, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.12) 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />

          {/* BACKGROUND LAYER (Directly behind the map outlines): Animated HTML5 Canvas Threat Network Layer */}
          <ThreatNetworkBackground zIndex={2} />

          {/* FOREGROUND LAYER 1: Vector World Map Continent Silhouettes */}
          <svg
            viewBox="0 0 1000 500"
            className="absolute inset-0 w-full h-full select-none pointer-events-none z-[10]"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="worldLandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0a1f3d" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#0c254b" stopOpacity="0.80" />
                <stop offset="100%" stopColor="#081830" stopOpacity="0.90" />
              </linearGradient>
            </defs>

            <g id="real-world-map-layer">
              {/* Subtle Equirectangular Cyber Graticule */}
              <g stroke="rgba(56, 189, 248, 0.08)" strokeWidth="0.75" fill="none">
                <line x1="0" y1="125" x2="1000" y2="125" strokeDasharray="3 6" /> {/* 45° N */}
                <line x1="0" y1="250" x2="1000" y2="250" strokeDasharray="3 6" /> {/* Equator */}
                <line x1="0" y1="375" x2="1000" y2="375" strokeDasharray="3 6" /> {/* 45° S */}
                <line x1="250" y1="0" x2="250" y2="500" strokeDasharray="3 6" /> {/* 90° W */}
                <line x1="500" y1="0" x2="500" y2="500" strokeDasharray="3 6" /> {/* Prime Meridian */}
                <line x1="750" y1="0" x2="750" y2="500" strokeDasharray="3 6" /> {/* 90° E */}
              </g>

              {/* Real World Geographic Continent Outlines & Landmass Fill */}
              <path
                d={REAL_WORLD_MAP_PATH}
                fill="url(#worldLandGradient)"
                stroke="#1e4d8c"
                strokeWidth="1.1"
                strokeLinejoin="round"
                className="filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
              />
            </g>
          </svg>

          {/* FOREGROUND LAYER 2: City Nodes, Badges & Labels */}
          <svg
            viewBox="0 0 1000 500"
            className="absolute inset-0 w-full h-full select-none pointer-events-auto z-[20]"
            preserveAspectRatio="xMidYMid meet"
          >
            <g id="city-nodes-layer">
              {nodes.map((node) => {
                const labelOff = node.labelOffset !== undefined ? node.labelOffset : 15;
                const pingsOff = labelOff > 0 ? labelOff + 10 : labelOff - 8;
                return (
                  <g key={`city-node-${node.id}`} className="cursor-pointer group">
                    {/* Outer Target Ring */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="6"
                      fill="#030c08"
                      stroke={node.color}
                      strokeWidth="2"
                      filter="drop-shadow(0 0 5px rgba(0,242,254,0.6))"
                    />
                    {/* Core Node Dot */}
                    <circle cx={node.x} cy={node.y} r="2.8" fill={node.color} />

                    {/* City Name Label */}
                    <text
                      x={node.x}
                      y={node.y + labelOff}
                      textAnchor="middle"
                      fill="#E2E8F0"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                      className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                    >
                      {node.name}
                    </text>

                    {/* Telemetry Ping Rate */}
                    <text
                      x={node.x}
                      y={node.y + pingsOff}
                      textAnchor="middle"
                      fill={node.color}
                      fontSize="8.5"
                      fontFamily="JetBrains Mono, monospace"
                      opacity="0.85"
                    >
                      {node.pings} msg/s
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Tactical HUD Overlays in Corners */}
          {/* Top-Right: Threat Taxonomy Breakdown */}
          <div className="absolute top-3 right-3 hidden sm:block p-3 rounded-xl bg-[rgba(10,24,52,0.85)] backdrop-blur-xl border border-white/15 text-xs font-mono shadow-lg max-w-[210px] z-[30]">
            <span className="text-[10px] uppercase font-bold text-slate-300 block mb-1.5 border-b border-white/10 pb-1 flex items-center justify-between">
              <span>Telemetry Matrix</span>
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            </span>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Phishing Origin:</span>
                <span className="text-rose-400 font-bold">176 / hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Malware Delivery:</span>
                <span className="text-amber-400 font-bold">41.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Social Eng. Ratio:</span>
                <span className="text-emerald-400 font-bold">33.3%</span>
              </div>
            </div>
          </div>

          {/* Bottom-Left: Live Threat Stream Ticker */}
          <div className="absolute bottom-3 left-3 hidden md:flex items-center gap-2 p-2.5 rounded-xl bg-[rgba(10,24,52,0.85)] backdrop-blur-xl border border-white/15 text-xs font-mono shadow-lg z-[30]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-slate-300">Active Intercept Vector:</span>
            <span className="text-emerald-300 font-bold">SHA-256 Honeypot Sensor [FRA-04]</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              ROUTED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
